import type { RequestHandler } from 'express';
import type { ApiConfig } from '../../bootstrap/config.js';
import type { Now } from '../clock.js';
import { ApiError } from '../errors/api-error.js';

interface IdentityState {
  windowStartedAtMs: number;
  requests: number;
  concurrent: number;
  lastSeenAtMs: number;
}

export interface StatusAbuseGuard {
  readonly middleware: RequestHandler;
  readonly identityCount: () => number;
}

function socketIdentity(address: string | undefined): string {
  if (!address) return 'unknown';
  return address.startsWith('::ffff:') ? address.slice('::ffff:'.length) : address;
}

export function createStatusAbuseGuard(
  config: ApiConfig['publicStatusLimit'],
  now: Now = Date.now,
): StatusAbuseGuard {
  const identities = new Map<string, IdentityState>();

  const removeOldestIdleIdentity = (): boolean => {
    let oldest: { readonly key: string; readonly seen: number } | undefined;
    for (const [key, state] of identities) {
      if (state.concurrent !== 0) continue;
      if (!oldest || state.lastSeenAtMs < oldest.seen) oldest = { key, seen: state.lastSeenAtMs };
    }
    if (!oldest) return false;
    identities.delete(oldest.key);
    return true;
  };

  const middleware: RequestHandler = (request, response, next): void => {
    const timestamp = now();
    const identity = socketIdentity(request.socket.remoteAddress);
    let state = identities.get(identity);
    if (!state) {
      if (identities.size >= config.maxIdentities && !removeOldestIdleIdentity()) {
        response.setHeader('Retry-After', '1');
        next(new ApiError('RATE_LIMITED'));
        return;
      }
      state = { windowStartedAtMs: timestamp, requests: 0, concurrent: 0, lastSeenAtMs: timestamp };
      identities.set(identity, state);
    }
    if (timestamp - state.windowStartedAtMs >= config.windowMs) {
      state.windowStartedAtMs = timestamp;
      state.requests = 0;
    }
    state.lastSeenAtMs = timestamp;

    if (state.requests >= config.maxRequests) {
      const remainingMs = Math.max(1, config.windowMs - (timestamp - state.windowStartedAtMs));
      response.setHeader('Retry-After', String(Math.ceil(remainingMs / 1_000)));
      next(new ApiError('RATE_LIMITED'));
      return;
    }
    state.requests += 1;
    if (state.concurrent >= config.maxConcurrent) {
      response.setHeader('Retry-After', '1');
      next(new ApiError('RATE_LIMITED'));
      return;
    }

    state.concurrent += 1;
    let released = false;
    const release = (): void => {
      if (released) return;
      released = true;
      const current = identities.get(identity);
      if (current) current.concurrent = Math.max(0, current.concurrent - 1);
    };
    response.once('finish', release);
    response.once('close', release);
    next();
  };

  return Object.freeze({ middleware, identityCount: () => identities.size });
}

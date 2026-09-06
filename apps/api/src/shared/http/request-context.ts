import { randomUUID } from 'node:crypto';
import type { Request, RequestHandler } from 'express';
import type { ErrorCode } from '@aufnehmen/contracts';
import type { Now } from '../clock.js';

export interface RequestContext {
  readonly requestId: string;
  readonly startedAtMs: number;
  readonly abortController: AbortController;
  routePattern: string;
  errorCode?: ErrorCode;
}

export type RequestIdFactory = () => string;

const contexts = new WeakMap<Request, RequestContext>();
const VALID_REQUEST_ID = /^[A-Za-z0-9_-]{1,128}$/u;

export function getRequestContext(request: Request): RequestContext {
  const context = contexts.get(request);
  if (!context) throw new Error('Request context has not been initialized.');
  return context;
}

export function setRoutePattern(request: Request, pattern: string): void {
  getRequestContext(request).routePattern = pattern;
}

export function createRequestContextMiddleware(
  requestIdFactory: RequestIdFactory = randomUUID,
  now: Now = Date.now,
): RequestHandler {
  return (request, response, next): void => {
    const candidate = requestIdFactory();
    const requestId = VALID_REQUEST_ID.test(candidate) ? candidate : randomUUID();
    contexts.set(request, {
      requestId,
      startedAtMs: now(),
      abortController: new AbortController(),
      routePattern: 'unmatched',
    });
    response.setHeader('X-Request-Id', requestId);
    next();
  };
}

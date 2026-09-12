import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { parseApiConfig } from '../../bootstrap/config.js';
import { errorHandler } from './error-handler.js';
import { createRequestContextMiddleware } from './request-context.js';
import { createStatusAbuseGuard } from './status-abuse-guard.js';

function deferred(): { readonly promise: Promise<void>; readonly resolve: () => void } {
  let resolve!: () => void;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe('public status abuse guard', () => {
  it('enforces a per-socket concurrency bound and releases on completion', async () => {
    const base = parseApiConfig({});
    const guard = createStatusAbuseGuard({
      ...base.publicStatusLimit,
      maxRequests: 10,
      maxConcurrent: 1,
    });
    const entered = deferred();
    const release = deferred();
    const app = express();
    app.set('trust proxy', false);
    app.use(createRequestContextMiddleware(() => 'guard_request'));
    app.get('/status', guard.middleware, async (_request, response) => {
      entered.resolve();
      await release.promise;
      response.status(200).json({ ok: true });
    });
    app.use(errorHandler);

    const first = request(app)
      .get('/status')
      .then((response) => response);
    await entered.promise;
    const concurrent = await request(app).get('/status');
    expect(concurrent.status).toBe(429);
    expect(concurrent.headers['retry-after']).toBe('1');

    release.resolve();
    expect((await first).status).toBe(200);
    expect((await request(app).get('/status')).status).toBe(200);
  });

  it('resets the fixed request window using an injected clock', async () => {
    let timestamp = 0;
    const base = parseApiConfig({});
    const guard = createStatusAbuseGuard(
      { ...base.publicStatusLimit, maxRequests: 1 },
      () => timestamp,
    );
    const app = express();
    app.use(createRequestContextMiddleware(() => 'guard_request'));
    app.get('/status', guard.middleware, (_request, response) => response.sendStatus(204));
    app.use(errorHandler);

    expect((await request(app).get('/status')).status).toBe(204);
    expect((await request(app).get('/status')).status).toBe(429);
    timestamp += base.publicStatusLimit.windowMs;
    expect((await request(app).get('/status')).status).toBe(204);
  });
});

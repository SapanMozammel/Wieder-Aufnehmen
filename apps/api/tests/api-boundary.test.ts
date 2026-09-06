import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { availableSystemStatusFixture, degradedSystemStatusFixture } from '@aufnehmen/testing';
import type { ApiConfig } from '../src/bootstrap/config.js';
import { parseApiConfig } from '../src/bootstrap/config.js';
import { createApiApp } from '../src/bootstrap/app.js';
import type {
  ReadinessPort,
  ReadinessSnapshot,
} from '../src/modules/system/application/readiness-port.js';
import type { ApiLogEvent, ApiLogger } from '../src/shared/logging/api-logger.js';

const TEST_MONGODB_URI =
  'mongodb://127.0.0.1:27017/aufnehmen_api_test?replicaSet=rs0&directConnection=true';

function configWith(
  overrides: {
    readonly http?: Partial<ApiConfig['http']>;
    readonly publicStatusLimit?: Partial<ApiConfig['publicStatusLimit']>;
  } = {},
): ApiConfig {
  const base = parseApiConfig({ NODE_ENV: 'test', MONGODB_URI: TEST_MONGODB_URI });
  return {
    ...base,
    http: { ...base.http, ...overrides.http },
    publicStatusLimit: { ...base.publicStatusLimit, ...overrides.publicStatusLimit },
  };
}

function readiness(initial: ReadinessSnapshot['availability']): ReadinessPort & {
  set(value: ReadinessSnapshot['availability']): void;
} {
  let availability = initial;
  return {
    current: () => ({ availability, checkedAtMs: 1 }),
    refresh: async () => ({ availability, checkedAtMs: 1 }),
    set: (value) => {
      availability = value;
    },
  };
}

function memoryLogger(): ApiLogger & { readonly events: ApiLogEvent[] } {
  const events: ApiLogEvent[] = [];
  return { events, emit: (event) => events.push(event) };
}

describe('API boundary', () => {
  it('serves closed liveness without consulting MongoDB and replaces client request IDs', async () => {
    let refreshes = 0;
    const database: ReadinessPort = {
      current: () => ({ availability: 'unavailable', checkedAtMs: undefined }),
      refresh: async () => {
        refreshes += 1;
        return { availability: 'unavailable', checkedAtMs: 1 };
      },
    };
    const app = createApiApp({
      config: configWith(),
      readiness: database,
      logger: memoryLogger(),
      requestIdFactory: () => 'server_generated_id',
    });

    const response = await request(app)
      .get('/health/live')
      .set('X-Request-Id', 'attacker-controlled');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'live' });
    expect(response.headers['x-request-id']).toBe('server_generated_id');
    expect(refreshes).toBe(0);
  });

  it('returns the exact ready and unavailable matrix with correlated safe errors', async () => {
    const database = readiness('available');
    const app = createApiApp({
      config: configWith(),
      readiness: database,
      logger: memoryLogger(),
      requestIdFactory: () => 'request_ready',
    });

    const healthy = await request(app).get('/health/ready');
    expect(healthy.status).toBe(200);
    expect(healthy.body).toEqual({ status: 'ready' });

    database.set('unavailable');
    const unavailable = await request(app).get('/health/ready');
    expect(unavailable.status).toBe(503);
    expect(unavailable.body).toEqual({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'The service is temporarily unavailable.',
        requestId: 'request_ready',
      },
    });
    expect(unavailable.headers['x-request-id']).toBe('request_ready');
  });

  it('maps cached database state to sanitized public available and degraded responses', async () => {
    const timestamp = Date.parse(availableSystemStatusFixture.timestamp);
    const database = readiness('available');
    const app = createApiApp({
      config: configWith(),
      readiness: database,
      logger: memoryLogger(),
      requestIdFactory: () => availableSystemStatusFixture.requestId,
      now: () => timestamp,
    });

    const available = await request(app).get('/v1/system/status');
    expect(available.status).toBe(200);
    expect(available.body).toEqual(availableSystemStatusFixture);

    database.set('unavailable');
    const degraded = await request(app).get('/v1/system/status');
    expect(degraded.status).toBe(200);
    expect(degraded.body).toEqual(degradedSystemStatusFixture);
    expect(JSON.stringify(degraded.body)).not.toMatch(/mongo|host|reason|error/iu);
  });

  it('enforces exact CORS and preflight policy without credentials', async () => {
    const app = createApiApp({
      config: configWith(),
      readiness: readiness('available'),
      logger: memoryLogger(),
      requestIdFactory: () => 'request_cors',
    });

    const allowed = await request(app)
      .get('/v1/system/status')
      .set('Origin', 'http://127.0.0.1:3000');
    expect(allowed.status).toBe(200);
    expect(allowed.headers['access-control-allow-origin']).toBe('http://127.0.0.1:3000');
    expect(allowed.headers['access-control-allow-credentials']).toBeUndefined();
    expect(allowed.headers['access-control-expose-headers']).toBe('X-Request-Id');

    const preflight = await request(app)
      .options('/v1/system/status')
      .set('Origin', 'http://127.0.0.1:3000')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'Content-Type');
    expect(preflight.status).toBe(204);
    expect(preflight.headers['access-control-allow-methods']).toBe('GET, HEAD, OPTIONS');
    expect(preflight.headers['access-control-max-age']).toBe('600');

    const rejected = await request(app)
      .get('/v1/system/status')
      .set('Origin', 'https://attacker.invalid');
    expect(rejected.status).toBe(403);
    expect(rejected.headers['access-control-allow-origin']).toBeUndefined();
    expect(rejected.body.error.code).toBe('FORBIDDEN');
  });

  it('sets explicit security headers, no-store, and removes framework disclosure', async () => {
    const app = createApiApp({
      config: configWith(),
      readiness: readiness('available'),
      logger: memoryLogger(),
    });

    const response = await request(app).get('/health/live');
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['content-security-policy']).toContain("default-src 'none'");
    expect(response.headers['cross-origin-resource-policy']).toBe('same-site');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['strict-transport-security']).toBeUndefined();
  });

  it('maps malformed and oversized JSON to stable validation failures', async () => {
    const app = createApiApp({
      config: configWith(),
      readiness: readiness('available'),
      logger: memoryLogger(),
      requestIdFactory: () => 'request_body',
    });

    const malformed = await request(app)
      .get('/health/live')
      .set('Content-Type', 'application/json')
      .send('{');
    expect(malformed.status).toBe(400);
    expect(malformed.body.error.code).toBe('VALIDATION_FAILED');

    const oversized = await request(app)
      .get('/health/live')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ value: 'x'.repeat(17_000) }));
    expect(oversized.status).toBe(400);
    expect(oversized.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('maps not-found and unknown failures without leaking hostile errors', async () => {
    const app = createApiApp({
      config: configWith(),
      readiness: readiness('available'),
      logger: memoryLogger(),
      requestIdFactory: () => 'request_error',
      getSystemStatus: () => {
        throw new Error('mongodb://user:secret@private-host/internal');
      },
    });

    const missing = await request(app).get('/missing?authorization=secret');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('NOT_FOUND');

    const failed = await request(app).get('/v1/system/status');
    expect(failed.status).toBe(500);
    expect(failed.body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(failed.body)).not.toMatch(/mongodb|secret|private-host/iu);
  });

  it('bounds a hung readiness operation with a 504 response', async () => {
    const database: ReadinessPort = {
      current: () => ({ availability: 'unavailable', checkedAtMs: undefined }),
      refresh: () => new Promise(() => undefined),
    };
    const app = createApiApp({
      config: configWith({ http: { applicationTimeoutMs: 20 } }),
      readiness: database,
      logger: memoryLogger(),
      requestIdFactory: () => 'request_timeout',
    });

    const response = await request(app).get('/health/ready');
    expect(response.status).toBe(504);
    expect(response.body.error).toMatchObject({
      code: 'TIMEOUT',
      requestId: 'request_timeout',
    });
  });

  it('logs one allowlisted completion event with a registered route, never URL or headers', async () => {
    const logger = memoryLogger();
    const app = createApiApp({
      config: configWith(),
      readiness: readiness('available'),
      logger,
      requestIdFactory: () => 'request_log',
      now: () => Date.parse('2026-09-02T12:00:00.000Z'),
    });

    await request(app)
      .get('/v1/system/status?token=never-log-me')
      .set('Authorization', 'Bearer never-log-me')
      .set('Cookie', 'secret=never-log-me');

    expect(logger.events).toHaveLength(1);
    expect(logger.events[0]).toMatchObject({
      name: 'http.request.completed',
      requestId: 'request_log',
      route: '/v1/system/status',
      status: 200,
    });
    expect(JSON.stringify(logger.events)).not.toMatch(/never-log-me|authorization|cookie|token=/iu);
  });

  it('rate-limits by the direct socket even when forwarded identity headers change', async () => {
    const app = createApiApp({
      config: configWith({ publicStatusLimit: { maxRequests: 1 } }),
      readiness: readiness('available'),
      logger: memoryLogger(),
    });

    const first = await request(app)
      .get('/v1/system/status')
      .set('X-Forwarded-For', '198.51.100.1');
    const second = await request(app)
      .get('/v1/system/status')
      .set('X-Forwarded-For', '203.0.113.2');
    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(second.body.error.code).toBe('RATE_LIMITED');
    expect(second.headers['retry-after']).toBe('60');
  });
});

import { describe, expect, it, vi } from 'vitest';
import type { ReadinessSnapshot } from '../modules/system/application/readiness-port.js';
import { SILENT_LOGGER } from '../shared/logging/api-logger.js';
import type { MongoReadinessOwner } from '../shared/mongo/mongo-readiness-owner.js';
import { parseApiConfig, type ApiConfig } from './config.js';
import { createApiApp } from './app.js';
import { createApiHttpServer } from './http-server.js';
import { startApiRuntime } from './runtime.js';

function testConfig(): ApiConfig {
  const base = parseApiConfig({
    NODE_ENV: 'test',
    MONGODB_URI:
      'mongodb://127.0.0.1:27017/aufnehmen_api_test?replicaSet=rs0&directConnection=true',
  });
  return { ...base, http: { ...base.http, port: 0 } };
}

function fakeOwner(events: string[]): MongoReadinessOwner {
  const snapshot: ReadinessSnapshot = { availability: 'available', checkedAtMs: 1 };
  return {
    current: () => snapshot,
    refresh: async () => snapshot,
    start: vi.fn(async () => {
      events.push('mongo.start');
      return snapshot;
    }),
    beginShutdown: vi.fn(() => events.push('mongo.beginShutdown')),
    close: vi.fn(async () => {
      events.push('mongo.close');
    }),
  };
}

describe('API runtime', () => {
  it('constructs the app and server without opening a listener', () => {
    const config = testConfig();
    const owner = fakeOwner([]);
    const app = createApiApp({ config, readiness: owner, logger: SILENT_LOGGER });
    const server = createApiHttpServer(app, config.http);

    expect(server.listening).toBe(false);
    expect(server.headersTimeout).toBe(5_000);
    expect(server.requestTimeout).toBe(10_000);
    expect(server.keepAliveTimeout).toBe(5_000);
    expect(server.maxRequestsPerSocket).toBe(100);
  });

  it('starts Mongo before listening and shuts down idempotently in dependency order', async () => {
    const events: string[] = [];
    const owner = fakeOwner(events);
    const runtime = await startApiRuntime({
      config: testConfig(),
      logger: SILENT_LOGGER,
      readiness: owner,
    });

    expect(runtime.server.listening).toBe(true);
    expect(events).toEqual(['mongo.start']);
    const first = runtime.shutdown('test');
    const second = runtime.shutdown('test-again');
    expect(first).toBe(second);
    await expect(first).resolves.toBe('completed');
    expect(runtime.server.listening).toBe(false);
    expect(events).toEqual(['mongo.start', 'mongo.beginShutdown', 'mongo.close']);
    expect(owner.close).toHaveBeenCalledOnce();
  });

  it('reports a forced outcome when MongoDB cleanup exceeds its shutdown budget', async () => {
    const events: string[] = [];
    const owner = fakeOwner(events);
    owner.close = vi.fn(() => new Promise<void>(() => undefined));
    const base = testConfig();
    const config: ApiConfig = {
      ...base,
      http: { ...base.http, mongoCloseTimeoutMs: 10 },
    };
    const runtime = await startApiRuntime({
      config,
      logger: SILENT_LOGGER,
      readiness: owner,
    });

    await expect(runtime.shutdown('test-timeout')).resolves.toBe('forced');
    expect(runtime.server.listening).toBe(false);
    expect(owner.close).toHaveBeenCalledOnce();
  });
});

import { describe, expect, it, vi } from 'vitest';
import type { ApiLogger } from '../shared/logging/api-logger.js';
import {
  createMongoOperations,
  type ManagedMongoClient,
} from '../shared/mongo/mongo-readiness-owner.js';
import { parseApiConfig, type ApiConfig } from './config.js';
import { shutdownForSignal } from './main.js';
import { startApiRuntime } from './runtime.js';

function deferred(): { readonly promise: Promise<void>; readonly resolve: () => void } {
  let resolve!: () => void;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe('API executable shutdown', () => {
  it('forces process termination after the runtime exhausts its graceful budget', async () => {
    const shutdown = vi.fn(async () => 'forced' as const);
    const logger: ApiLogger = { emit: vi.fn() };
    const forceExit = vi.fn();

    await shutdownForSignal({
      runtime: { shutdown },
      logger,
      signal: 'SIGTERM',
      forceExit,
    });

    expect(shutdown).toHaveBeenCalledWith('SIGTERM');
    expect(forceExit).toHaveBeenCalledOnce();
    expect(forceExit).toHaveBeenCalledWith(1);
    expect(logger.emit).not.toHaveBeenCalled();
  });

  it('allows a clean runtime shutdown to exit naturally', async () => {
    const shutdown = vi.fn(async () => 'completed' as const);
    const forceExit = vi.fn();

    await shutdownForSignal({
      runtime: { shutdown },
      logger: { emit: vi.fn() },
      signal: 'SIGINT',
      forceExit,
    });

    expect(forceExit).not.toHaveBeenCalled();
  });

  it('forces exit by the shutdown budget while late Mongo work remains safely tracked', async () => {
    const pendingConnect = deferred();
    const terminalCloseObserved = deferred();
    let closeNumber = 0;
    const client: ManagedMongoClient = {
      connect: vi.fn(() => pendingConnect.promise),
      ping: vi.fn(async () => undefined),
      close: vi.fn(async () => {
        closeNumber += 1;
        if (closeNumber === 2) terminalCloseObserved.resolve();
      }),
    };
    const base = parseApiConfig({
      NODE_ENV: 'test',
      MONGODB_URI:
        'mongodb://127.0.0.1:27017/aufnehmen_api_test?replicaSet=rs0&directConnection=true',
    });
    const config: ApiConfig = {
      ...base,
      http: { ...base.http, port: 0, mongoCloseTimeoutMs: 25 },
      mongo: { ...base.mongo, readinessTimeoutMs: 25 },
    };
    const runtime = await startApiRuntime({
      config,
      logger: { emit: vi.fn() },
      mongoOperationsFactory: (mongoConfig) => createMongoOperations(mongoConfig, () => client),
    });
    const forceExit = vi.fn();

    await shutdownForSignal({
      runtime,
      logger: { emit: vi.fn() },
      signal: 'SIGTERM',
      forceExit,
    });

    expect(forceExit).toHaveBeenCalledWith(1);
    expect(client.close).toHaveBeenCalledOnce();

    pendingConnect.resolve();
    await terminalCloseObserved.promise;
    expect(client.close).toHaveBeenCalledTimes(2);
  });
});

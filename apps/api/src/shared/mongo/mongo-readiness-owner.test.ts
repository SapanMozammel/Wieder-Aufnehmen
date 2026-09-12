import { describe, expect, it, vi } from 'vitest';
import { parseApiConfig } from '../../bootstrap/config.js';
import { SILENT_LOGGER } from '../logging/api-logger.js';
import {
  createMongoOperations,
  createMongoReadinessOwner,
  type ManagedMongoClient,
  type MongoOperations,
} from './mongo-readiness-owner.js';

const TEST_MONGODB_URI =
  'mongodb://127.0.0.1:27017/aufnehmen_api_test?replicaSet=rs0&directConnection=true';

function mongoConfig() {
  return parseApiConfig({ NODE_ENV: 'test', MONGODB_URI: TEST_MONGODB_URI }).mongo;
}

function withoutRealInterval() {
  const handle = { unref: vi.fn() } as unknown as ReturnType<typeof setInterval>;
  return {
    scheduleInterval: vi.fn(() => handle),
    cancelInterval: vi.fn(),
  };
}

function deferred(): {
  readonly promise: Promise<void>;
  readonly resolve: () => void;
  readonly reject: (error: unknown) => void;
} {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe('Mongo readiness owner', () => {
  it('connects once, caches readiness, and fails stale snapshots closed without public pings', async () => {
    let timestamp = 1_000;
    const operations: MongoOperations = {
      check: vi.fn(async () => undefined),
      close: vi.fn(async () => undefined),
    };
    const intervals = withoutRealInterval();
    const owner = createMongoReadinessOwner({
      config: mongoConfig(),
      logger: SILENT_LOGGER,
      now: () => timestamp,
      operationsFactory: () => operations,
      ...intervals,
    });

    expect((await owner.start()).availability).toBe('available');
    expect(operations.check).toHaveBeenCalledOnce();
    expect(owner.current().availability).toBe('available');
    expect(operations.check).toHaveBeenCalledOnce();

    timestamp += mongoConfig().snapshotMaxAgeMs + 1;
    expect(owner.current().availability).toBe('unavailable');
    expect(operations.check).toHaveBeenCalledOnce();
    await owner.close();
  });

  it('shares one in-flight dependency check across concurrent refreshes', async () => {
    const pendingCheck = deferred();
    let checkNumber = 0;
    const operations: MongoOperations = {
      check: vi.fn(async () => {
        checkNumber += 1;
        if (checkNumber > 1) await pendingCheck.promise;
      }),
      close: async () => undefined,
    };
    const owner = createMongoReadinessOwner({
      config: mongoConfig(),
      logger: SILENT_LOGGER,
      operationsFactory: () => operations,
      ...withoutRealInterval(),
    });
    await owner.start();
    await Promise.resolve();

    const first = owner.refresh();
    const second = owner.refresh();
    expect(first).toBe(second);
    expect(operations.check).toHaveBeenCalledTimes(2);
    pendingCheck.resolve();
    await first;
    await owner.close();
  });

  it('starts degraded after a bounded connection failure and can recover on refresh', async () => {
    let checkNumber = 0;
    const operations: MongoOperations = {
      check: vi.fn(async () => {
        checkNumber += 1;
        if (checkNumber === 1) throw new Error('synthetic connection failure');
      }),
      close: vi.fn(async () => undefined),
    };
    const owner = createMongoReadinessOwner({
      config: mongoConfig(),
      logger: SILENT_LOGGER,
      operationsFactory: () => operations,
      ...withoutRealInterval(),
    });

    expect((await owner.start()).availability).toBe('unavailable');
    expect((await owner.refresh()).availability).toBe('available');
    expect(operations.check).toHaveBeenCalledTimes(2);
    await owner.close();
  });

  it('installs dependency cancellation before the check and aborts it during shutdown', async () => {
    const pendingCheck = deferred();
    let checkSignal: AbortSignal | undefined;
    const operations: MongoOperations = {
      check: vi.fn((signal?: AbortSignal) => {
        checkSignal = signal;
        signal?.addEventListener('abort', () => pendingCheck.reject(signal.reason), {
          once: true,
        });
        return pendingCheck.promise;
      }),
      close: vi.fn(async () => undefined),
    };
    const intervals = withoutRealInterval();
    const owner = createMongoReadinessOwner({
      config: mongoConfig(),
      logger: SILENT_LOGGER,
      operationsFactory: () => operations,
      ...intervals,
    });

    const starting = owner.start();
    await Promise.resolve();
    try {
      expect(checkSignal).toBeInstanceOf(AbortSignal);
      owner.beginShutdown();
      expect((await starting).availability).toBe('unavailable');
      expect(checkSignal?.aborted).toBe(true);
      expect(intervals.scheduleInterval).not.toHaveBeenCalled();
    } finally {
      pendingCheck.resolve();
      owner.beginShutdown();
      await starting;
      await owner.close();
    }
  });

  it('bounds the full refresh even when the dependency check ignores cancellation', async () => {
    vi.useFakeTimers();
    const pendingCheck = deferred();
    const checkReturned = deferred();
    try {
      let checkSignal: AbortSignal | undefined;
      const operations: MongoOperations = {
        check: vi.fn(async (signal: AbortSignal) => {
          checkSignal = signal;
          await pendingCheck.promise;
          checkReturned.resolve();
        }),
        close: vi.fn(async () => undefined),
      };
      const intervals = withoutRealInterval();
      const config = mongoConfig();
      const owner = createMongoReadinessOwner({
        config,
        logger: SILENT_LOGGER,
        operationsFactory: () => operations,
        ...intervals,
      });

      const starting = owner.start();
      let startSettled = false;
      void starting.then(() => {
        startSettled = true;
      });
      await Promise.resolve();
      expect(checkSignal?.aborted).toBe(false);
      await vi.advanceTimersByTimeAsync(config.readinessTimeoutMs - 1);
      expect(startSettled).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      expect((await starting).availability).toBe('unavailable');
      expect(checkSignal?.aborted).toBe(true);
      expect((checkSignal?.reason as Error | undefined)?.name).toBe('ReadinessTimeoutError');

      const firstClose = owner.close();
      const secondClose = owner.close();
      expect(firstClose).toBe(secondClose);
      await firstClose;
      expect(operations.close).toHaveBeenCalledOnce();
      expect(owner.current().availability).toBe('unavailable');
      expect(intervals.cancelInterval).toHaveBeenCalledOnce();

      pendingCheck.resolve();
      await checkReturned.promise;
      await Promise.resolve();
      expect(owner.current().availability).toBe('unavailable');
    } finally {
      pendingCheck.resolve();
      vi.useRealTimers();
    }
  });
});

describe('Mongo operations', () => {
  it('allows only one retiring connection and retries after its terminal close', async () => {
    const pendingConnect = deferred();
    const terminalCloseObserved = deferred();
    let oldCloseNumber = 0;
    const oldClient: ManagedMongoClient = {
      connect: vi.fn(() => pendingConnect.promise),
      ping: vi.fn(async () => undefined),
      close: vi.fn(async () => {
        oldCloseNumber += 1;
        if (oldCloseNumber === 2) terminalCloseObserved.resolve();
      }),
    };
    const replacementClient: ManagedMongoClient = {
      connect: vi.fn(async () => undefined),
      ping: vi.fn(async () => undefined),
      close: vi.fn(async () => undefined),
    };
    const clientFactory = vi
      .fn<() => ManagedMongoClient>()
      .mockReturnValueOnce(oldClient)
      .mockReturnValueOnce(replacementClient);
    const operations = createMongoOperations(mongoConfig(), clientFactory);
    const controller = new AbortController();
    const timeoutError = new Error('synthetic readiness timeout');

    const attempt = operations.check(controller.signal);
    await Promise.resolve();
    expect(oldClient.connect).toHaveBeenCalledOnce();
    expect(oldClient.close).not.toHaveBeenCalled();
    expect(clientFactory).toHaveBeenCalledOnce();

    controller.abort(timeoutError);
    await expect(attempt).rejects.toBe(timeoutError);
    expect(oldClient.close).toHaveBeenCalledOnce();
    expect(clientFactory).toHaveBeenCalledOnce();

    await expect(operations.check(new AbortController().signal)).rejects.toThrow(/still closing/u);
    expect(clientFactory).toHaveBeenCalledOnce();
    expect(replacementClient.connect).not.toHaveBeenCalled();
    expect(replacementClient.ping).not.toHaveBeenCalled();

    pendingConnect.resolve();
    await terminalCloseObserved.promise;
    await new Promise<void>((resolve) => {
      setImmediate(resolve);
    });

    const recoveryController = new AbortController();
    await operations.check(recoveryController.signal);
    expect(clientFactory).toHaveBeenCalledTimes(2);
    expect(replacementClient.connect).toHaveBeenCalledOnce();
    expect(replacementClient.ping).toHaveBeenCalledOnce();

    await operations.close();
    expect(oldClient.close).toHaveBeenCalledTimes(2);
    expect(replacementClient.close).toHaveBeenCalledOnce();
  });

  it('does not make shutdown wait for an abort-ignoring connection', async () => {
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
    const operations = createMongoOperations(mongoConfig(), () => client);
    const controller = new AbortController();
    const timeoutError = new Error('synthetic readiness timeout');

    const attempt = operations.check(controller.signal);
    await Promise.resolve();
    controller.abort(timeoutError);
    await expect(attempt).rejects.toBe(timeoutError);

    const firstClose = operations.close();
    const secondClose = operations.close();
    expect(firstClose).toBe(secondClose);
    let closeSettled = false;
    void firstClose.then(() => {
      closeSettled = true;
    });
    await Promise.resolve();
    expect(closeSettled).toBe(false);
    expect(client.close).toHaveBeenCalledOnce();

    pendingConnect.resolve();
    await terminalCloseObserved.promise;
    await firstClose;
    expect(closeSettled).toBe(true);
    expect(client.close).toHaveBeenCalledTimes(2);
  });

  it('quarantines the complete attempt when an abort-ignoring ping loses the deadline', async () => {
    const pendingPing = deferred();
    const terminalCloseObserved = deferred();
    let closeNumber = 0;
    const client: ManagedMongoClient = {
      connect: vi.fn(async () => undefined),
      ping: vi.fn(() => pendingPing.promise),
      close: vi.fn(async () => {
        closeNumber += 1;
        if (closeNumber === 2) terminalCloseObserved.resolve();
      }),
    };
    const clientFactory = vi.fn(() => client);
    const operations = createMongoOperations(mongoConfig(), clientFactory);
    const controller = new AbortController();
    const timeoutError = new Error('synthetic readiness timeout');

    const attempt = operations.check(controller.signal);
    await Promise.resolve();
    expect(client.connect).toHaveBeenCalledOnce();
    expect(client.ping).toHaveBeenCalledOnce();

    controller.abort(timeoutError);
    await expect(attempt).rejects.toBe(timeoutError);
    expect(client.close).toHaveBeenCalledOnce();
    await expect(operations.check(new AbortController().signal)).rejects.toThrow(/still closing/u);
    expect(clientFactory).toHaveBeenCalledOnce();

    const closing = operations.close();
    let closeSettled = false;
    void closing.then(() => {
      closeSettled = true;
    });
    await Promise.resolve();
    expect(closeSettled).toBe(false);
    pendingPing.resolve();
    await terminalCloseObserved.promise;
    await closing;
    expect(closeSettled).toBe(true);
    expect(client.close).toHaveBeenCalledTimes(2);
  });
});

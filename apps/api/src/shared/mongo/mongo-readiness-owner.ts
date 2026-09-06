import { MongoClient } from 'mongodb';
import type { ApiConfig } from '../../bootstrap/config.js';
import type {
  ReadinessPort,
  ReadinessSnapshot,
} from '../../modules/system/application/readiness-port.js';
import type { Now } from '../clock.js';
import { safeErrorClass } from '../errors/api-error.js';
import type { ApiLogger } from '../logging/api-logger.js';

export interface MongoOperations {
  /** Implementations observe cancellation; the owner also enforces its own deadline. */
  check(signal: AbortSignal): Promise<void>;
  close(): Promise<void>;
}

export type MongoOperationsFactory = (config: ApiConfig['mongo']) => MongoOperations;

export interface ManagedMongoClient {
  connect(): Promise<void>;
  ping(signal: AbortSignal): Promise<void>;
  close(): Promise<void>;
}

export type ManagedMongoClientFactory = () => ManagedMongoClient;
export type ScheduleInterval = (
  callback: () => void,
  intervalMs: number,
) => ReturnType<typeof setInterval>;
export type CancelInterval = (handle: ReturnType<typeof setInterval>) => void;

export interface MongoReadinessOwner extends ReadinessPort {
  start(): Promise<ReadinessSnapshot>;
  beginShutdown(): void;
  close(): Promise<void>;
}

export interface CreateMongoReadinessOwnerOptions {
  readonly config: ApiConfig['mongo'];
  readonly logger: ApiLogger;
  readonly now?: Now;
  readonly operationsFactory?: MongoOperationsFactory;
  readonly scheduleInterval?: ScheduleInterval;
  readonly cancelInterval?: CancelInterval;
}

type OwnerState = 'new' | 'running' | 'draining' | 'closed';

interface MongoAttempt {
  readonly candidate: ManagedMongoClient;
  readonly work: Promise<void>;
  readonly cancel: (reason: Error) => void;
  quarantined: boolean;
}

function operationAbortReason(signal: AbortSignal): Error {
  return signal.reason instanceof Error
    ? signal.reason
    : new Error('MongoDB operation was cancelled.');
}

function createDriverMongoClient(config: ApiConfig['mongo']): ManagedMongoClient {
  const client = new MongoClient(config.uri, {
    connectTimeoutMS: config.connectTimeoutMs,
    serverSelectionTimeoutMS: config.serverSelectionTimeoutMs,
    socketTimeoutMS: config.socketTimeoutMs,
    waitQueueTimeoutMS: config.waitQueueTimeoutMs,
    maxPoolSize: config.maxPoolSize,
    minPoolSize: 0,
    retryReads: true,
  });
  const database = client.db();

  return Object.freeze({
    async connect(): Promise<void> {
      await client.connect();
    },
    async ping(signal: AbortSignal): Promise<void> {
      await database.command({ ping: 1 }, { signal, timeoutMS: config.pingTimeoutMs });
    },
    async close(): Promise<void> {
      await client.close(true);
    },
  });
}

export function createMongoOperations(
  config: ApiConfig['mongo'],
  clientFactory: ManagedMongoClientFactory = () => createDriverMongoClient(config),
): MongoOperations {
  let acceptedClient: ManagedMongoClient | undefined;
  let attempt: MongoAttempt | undefined;
  let retiring: Promise<void> | undefined;
  let closed = false;
  let closePromise: Promise<void> | undefined;
  let cleanupFailed = false;

  const closeClient = (candidate: ManagedMongoClient): Promise<void> => {
    try {
      return candidate.close();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const quarantine = (currentAttempt: MongoAttempt): void => {
    if (currentAttempt.quarantined) return;
    currentAttempt.quarantined = true;
    if (acceptedClient === currentAttempt.candidate) acceptedClient = undefined;

    const immediateClose = closeClient(currentAttempt.candidate);
    const terminalCleanup = (async (): Promise<void> => {
      const outcomes = await Promise.allSettled([currentAttempt.work, immediateClose]);
      if (outcomes[1]?.status === 'rejected') cleanupFailed = true;
      // SRV resolution can finish after a pre-topology close. Close a second time
      // after connect settles so a topology created late cannot remain live.
      try {
        await closeClient(currentAttempt.candidate);
      } catch {
        cleanupFailed = true;
      }
    })();
    const observedCleanup = terminalCleanup.then(
      () => undefined,
      () => {
        cleanupFailed = true;
      },
    );
    retiring = observedCleanup;
    void observedCleanup.then(() => {
      if (retiring === observedCleanup) retiring = undefined;
      if (attempt === currentAttempt) attempt = undefined;
    });
  };

  return {
    async check(signal): Promise<void> {
      if (closed) throw new Error('MongoDB operations are closed.');
      if (signal.aborted) throw operationAbortReason(signal);
      if (cleanupFailed) throw new Error('MongoDB client cleanup failed.');
      if (retiring || attempt) {
        throw new Error('A previous MongoDB readiness attempt is still closing.');
      }

      const candidate = acceptedClient ?? clientFactory();
      let cancelAttempt: ((reason: Error) => void) | undefined;
      const cancelled = new Promise<never>((_resolve, reject) => {
        cancelAttempt = reject;
      });
      const work = (async (): Promise<void> => {
        await candidate.connect();
        if (signal.aborted) throw operationAbortReason(signal);
        await candidate.ping(signal);
        if (signal.aborted) throw operationAbortReason(signal);
      })();
      const currentAttempt: MongoAttempt = {
        candidate,
        work,
        cancel: (reason) => cancelAttempt?.(reason),
        quarantined: false,
      };
      attempt = currentAttempt;
      const handleAbort = (): void => {
        quarantine(currentAttempt);
        currentAttempt.cancel(operationAbortReason(signal));
      };
      signal.addEventListener('abort', handleAbort, { once: true });
      if (signal.aborted) handleAbort();

      try {
        await Promise.race([work, cancelled]);
        if (signal.aborted) throw operationAbortReason(signal);
        if (closed || currentAttempt.quarantined) {
          throw new Error('MongoDB readiness attempt was cancelled.');
        }
        acceptedClient = candidate;
        if (attempt === currentAttempt) attempt = undefined;
      } catch (error) {
        quarantine(currentAttempt);
        throw error;
      } finally {
        signal.removeEventListener('abort', handleAbort);
      }
    },
    close(): Promise<void> {
      if (closePromise) return closePromise;
      closed = true;
      const activeAttempt = attempt;
      if (activeAttempt) {
        quarantine(activeAttempt);
        activeAttempt.cancel(new Error('MongoDB operations are closed.'));
      }
      const accepted = acceptedClient;
      const pendingRetirement = retiring;
      acceptedClient = undefined;
      const pending = (async (): Promise<void> => {
        if (accepted) {
          try {
            await closeClient(accepted);
          } catch {
            throw new Error('MongoDB client cleanup failed.');
          }
        }
        if (pendingRetirement) await pendingRetirement;
        if (cleanupFailed) throw new Error('MongoDB client cleanup failed.');
      })();
      closePromise = pending;
      return pending;
    },
  };
}

const defaultOperationsFactory: MongoOperationsFactory = (config) => createMongoOperations(config);

class ReadinessTimeoutError extends Error {
  public constructor() {
    super('MongoDB readiness check timed out.');
    this.name = 'ReadinessTimeoutError';
  }
}

export function createMongoReadinessOwner(
  options: CreateMongoReadinessOwnerOptions,
): MongoReadinessOwner {
  const now = options.now ?? Date.now;
  const operations = (options.operationsFactory ?? defaultOperationsFactory)(options.config);
  const scheduleInterval = options.scheduleInterval ?? setInterval;
  const cancelInterval = options.cancelInterval ?? clearInterval;
  let ownerState: OwnerState = 'new';
  let snapshot: ReadinessSnapshot = Object.freeze({
    availability: 'unavailable',
    checkedAtMs: undefined,
  });
  let interval: ReturnType<typeof setInterval> | undefined;
  let refreshPromise: Promise<ReadinessSnapshot> | undefined;
  let refreshAbortController: AbortController | undefined;
  let startPromise: Promise<ReadinessSnapshot> | undefined;
  let closePromise: Promise<void> | undefined;

  const publish = (next: ReadinessSnapshot, error?: unknown): ReadinessSnapshot => {
    const changed = next.availability !== snapshot.availability;
    snapshot = Object.freeze(next);
    if (changed) {
      options.logger.emit({
        name: 'mongo.readiness.changed',
        timestamp: new Date(now()).toISOString(),
        severity: next.availability === 'available' ? 'info' : 'warn',
        state: next.availability,
        ...(error === undefined ? {} : { errorClass: safeErrorClass(error) }),
      });
    }
    return snapshot;
  };

  const unavailable = (error?: unknown): ReadinessSnapshot =>
    publish({ availability: 'unavailable', checkedAtMs: now() }, error);

  const current = (): ReadinessSnapshot => {
    if (ownerState !== 'running' || snapshot.checkedAtMs === undefined) {
      return Object.freeze({ availability: 'unavailable', checkedAtMs: snapshot.checkedAtMs });
    }
    if (now() - snapshot.checkedAtMs > options.config.snapshotMaxAgeMs) {
      return Object.freeze({ availability: 'unavailable', checkedAtMs: snapshot.checkedAtMs });
    }
    return snapshot;
  };

  const performRefresh = async (): Promise<ReadinessSnapshot> => {
    if (ownerState !== 'running') return current();
    const controller = new AbortController();
    refreshAbortController = controller;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    let rejectAbort: ((reason: Error) => void) | undefined;
    const aborted = new Promise<never>((_resolve, reject) => {
      rejectAbort = reject;
    });
    const handleAbort = (): void => {
      rejectAbort?.(operationAbortReason(controller.signal));
    };
    controller.signal.addEventListener('abort', handleAbort, { once: true });
    try {
      timeoutHandle = setTimeout(() => {
        controller.abort(new ReadinessTimeoutError());
      }, options.config.readinessTimeoutMs);
      timeoutHandle.unref?.();

      const work = (async (): Promise<void> => {
        await operations.check(controller.signal);
        if (controller.signal.aborted) throw operationAbortReason(controller.signal);
      })();
      await Promise.race([work, aborted]);
      if (controller.signal.aborted) throw operationAbortReason(controller.signal);
      if (ownerState !== 'running') return current();
      return publish({ availability: 'available', checkedAtMs: now() });
    } catch (error) {
      return unavailable(error);
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      controller.signal.removeEventListener('abort', handleAbort);
      if (refreshAbortController === controller) refreshAbortController = undefined;
    }
  };

  const refresh = (): Promise<ReadinessSnapshot> => {
    if (refreshPromise) return refreshPromise;
    const pending = performRefresh();
    refreshPromise = pending;
    void pending.finally(() => {
      if (refreshPromise === pending) refreshPromise = undefined;
    });
    return pending;
  };

  const beginShutdown = (): void => {
    if (ownerState === 'closed' || ownerState === 'draining') return;
    ownerState = 'draining';
    if (interval) {
      cancelInterval(interval);
      interval = undefined;
    }
    refreshAbortController?.abort();
    unavailable();
  };

  const start = (): Promise<ReadinessSnapshot> => {
    if (startPromise) return startPromise;
    if (ownerState !== 'new') return Promise.resolve(current());
    ownerState = 'running';
    const pending = (async (): Promise<ReadinessSnapshot> => {
      try {
        await refresh();
      } catch (error) {
        unavailable(error);
      }
      if (ownerState === 'running') {
        interval = scheduleInterval(() => {
          void refresh();
        }, options.config.refreshIntervalMs);
        interval.unref?.();
      }
      return current();
    })();
    startPromise = pending;
    return pending;
  };

  const close = (): Promise<void> => {
    if (closePromise) return closePromise;
    beginShutdown();
    const pending = (async (): Promise<void> => {
      if (refreshPromise) await refreshPromise;
      await operations.close();
      ownerState = 'closed';
    })();
    closePromise = pending;
    return pending;
  };

  return Object.freeze({ current, refresh, start, beginShutdown, close });
}

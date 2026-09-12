import type { Server } from 'node:http';
import type { Express } from 'express';
import { createApiApp } from './app.js';
import type { ApiConfig } from './config.js';
import { createApiHttpServer } from './http-server.js';
import type { Now } from '../shared/clock.js';
import type { RequestIdFactory } from '../shared/http/request-context.js';
import type { ApiLogger } from '../shared/logging/api-logger.js';
import {
  createMongoReadinessOwner,
  type MongoOperationsFactory,
  type MongoReadinessOwner,
} from '../shared/mongo/mongo-readiness-owner.js';

export interface ApiRuntime {
  readonly app: Express;
  readonly server: Server;
  readonly readiness: MongoReadinessOwner;
  shutdown(reason?: string): Promise<ApiShutdownOutcome>;
}

export type ApiShutdownOutcome = 'completed' | 'forced';

export interface StartApiRuntimeOptions {
  readonly config: ApiConfig;
  readonly logger: ApiLogger;
  readonly now?: Now;
  readonly requestIdFactory?: RequestIdFactory;
  readonly mongoOperationsFactory?: MongoOperationsFactory;
  readonly readiness?: MongoReadinessOwner;
  readonly serverFactory?: typeof createApiHttpServer;
}

function listen(server: Server, port: number, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = (error: Error): void => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = (): void => {
      server.off('error', onError);
      resolve();
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, host);
  });
}

function drainServer(server: Server, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (forced: boolean): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(forced);
    };
    const timer = setTimeout(() => {
      server.closeAllConnections();
      finish(true);
    }, timeoutMs);
    timer.unref?.();
    server.close(() => finish(false));
  });
}

async function closeMongo(owner: MongoReadinessOwner, timeoutMs: number): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<true>((resolve) => {
    timer = setTimeout(() => resolve(true), timeoutMs);
    timer.unref?.();
  });
  const closed = owner.close().then(() => false);
  try {
    return await Promise.race([closed, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function startApiRuntime(options: StartApiRuntimeOptions): Promise<ApiRuntime> {
  const now = options.now ?? Date.now;
  const readiness =
    options.readiness ??
    createMongoReadinessOwner({
      config: options.config.mongo,
      logger: options.logger,
      now,
      operationsFactory: options.mongoOperationsFactory,
    });
  await readiness.start();
  const app = createApiApp({
    config: options.config,
    readiness,
    logger: options.logger,
    now,
    requestIdFactory: options.requestIdFactory,
  });
  const server = (options.serverFactory ?? createApiHttpServer)(app, options.config.http);
  try {
    await listen(server, options.config.http.port, options.config.http.host);
  } catch (error) {
    readiness.beginShutdown();
    await closeMongo(readiness, options.config.http.mongoCloseTimeoutMs).catch(() => undefined);
    throw error;
  }

  options.logger.emit({
    name: 'api.lifecycle',
    timestamp: new Date(now()).toISOString(),
    severity: 'info',
    action: 'started',
  });

  let shutdownPromise: Promise<ApiShutdownOutcome> | undefined;
  const shutdown = (reason = 'requested'): Promise<ApiShutdownOutcome> => {
    if (shutdownPromise) return shutdownPromise;
    shutdownPromise = (async (): Promise<ApiShutdownOutcome> => {
      options.logger.emit({
        name: 'api.lifecycle',
        timestamp: new Date(now()).toISOString(),
        severity: 'info',
        action: 'shutdown_started',
        reason,
      });
      readiness.beginShutdown();
      const forcedHttp = await drainServer(server, options.config.http.drainTimeoutMs);
      const forcedMongo = await closeMongo(readiness, options.config.http.mongoCloseTimeoutMs);
      const forced = forcedHttp || forcedMongo;
      options.logger.emit({
        name: 'api.lifecycle',
        timestamp: new Date(now()).toISOString(),
        severity: forced ? 'warn' : 'info',
        action: forced ? 'shutdown_forced' : 'shutdown_completed',
        reason,
      });
      return forced ? 'forced' : 'completed';
    })();
    return shutdownPromise;
  };

  return Object.freeze({ app, server, readiness, shutdown });
}

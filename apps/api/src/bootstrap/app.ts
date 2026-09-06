import express, { type Express } from 'express';
import type { ApiConfig } from './config.js';
import {
  createGetSystemStatus,
  type GetSystemStatus,
} from '../modules/system/application/get-system-status.js';
import type { ReadinessPort } from '../modules/system/application/readiness-port.js';
import { createSystemRouter } from '../modules/system/http/system-router.js';
import type { Now } from '../shared/clock.js';
import { createCorsMiddleware } from '../shared/http/cors.js';
import { errorHandler, notFoundHandler } from '../shared/http/error-handler.js';
import {
  createRequestContextMiddleware,
  type RequestIdFactory,
} from '../shared/http/request-context.js';
import { createRequestLoggingMiddleware } from '../shared/http/request-logging.js';
import { createRequestTimeoutMiddleware } from '../shared/http/request-timeout.js';
import { createSecurityMiddleware } from '../shared/http/security.js';
import {
  createStatusAbuseGuard,
  type StatusAbuseGuard,
} from '../shared/http/status-abuse-guard.js';
import type { ApiLogger } from '../shared/logging/api-logger.js';

export interface CreateApiAppDependencies {
  readonly config: ApiConfig;
  readonly readiness: ReadinessPort;
  readonly logger: ApiLogger;
  readonly now?: Now;
  readonly requestIdFactory?: RequestIdFactory;
  readonly statusAbuseGuard?: StatusAbuseGuard;
  readonly getSystemStatus?: GetSystemStatus;
}

export function createApiApp(dependencies: CreateApiAppDependencies): Express {
  const app = express();
  const now = dependencies.now ?? Date.now;
  const guard =
    dependencies.statusAbuseGuard ??
    createStatusAbuseGuard(dependencies.config.publicStatusLimit, now);
  const getSystemStatus =
    dependencies.getSystemStatus ?? createGetSystemStatus(dependencies.readiness, now);

  app.disable('x-powered-by');
  app.set('trust proxy', dependencies.config.http.trustProxy);
  app.set('query parser', false);

  app.use(createRequestContextMiddleware(dependencies.requestIdFactory, now));
  app.use(createRequestLoggingMiddleware(dependencies.logger, now));
  for (const middleware of createSecurityMiddleware(dependencies.config.mode)) app.use(middleware);
  app.use(createCorsMiddleware(dependencies.config.cors));
  app.use(createRequestTimeoutMiddleware(dependencies.config.http.applicationTimeoutMs));
  app.use(
    express.json({
      limit: dependencies.config.http.jsonBodyLimitBytes,
      strict: true,
      type: ['application/json', 'application/*+json'],
    }),
  );
  app.use(
    createSystemRouter({
      readiness: dependencies.readiness,
      getSystemStatus,
      publicStatusGuard: guard.middleware,
    }),
  );
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

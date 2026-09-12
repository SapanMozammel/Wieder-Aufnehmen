import {
  LivenessResponseSchema,
  ReadinessResponseSchema,
  technicalHttpOperations,
} from '@aufnehmen/contracts';
import { Router, type RequestHandler } from 'express';
import type { GetSystemStatus } from '../application/get-system-status.js';
import type { ReadinessPort } from '../application/readiness-port.js';
import { ApiError } from '../../../shared/errors/api-error.js';
import { getRequestContext, setRoutePattern } from '../../../shared/http/request-context.js';

export interface SystemRouterDependencies {
  readonly readiness: ReadinessPort;
  readonly getSystemStatus: GetSystemStatus;
  readonly publicStatusGuard: RequestHandler;
}

function identifyRoute(pattern: string): RequestHandler {
  return (request, _response, next): void => {
    setRoutePattern(request, pattern);
    next();
  };
}

export function createSystemRouter(dependencies: SystemRouterDependencies): Router {
  const router = Router();
  const livePath = technicalHttpOperations.liveness.path;
  const readyPath = technicalHttpOperations.readiness.path;
  const statusPath = technicalHttpOperations.systemStatus.path;

  router.get(livePath, identifyRoute(livePath), (_request, response) => {
    response.status(200).json(LivenessResponseSchema.parse({ status: 'live' }));
  });
  router.get(readyPath, identifyRoute(readyPath), async (request, response) => {
    const snapshot = await dependencies.readiness.refresh();
    if (getRequestContext(request).abortController.signal.aborted) return;
    if (snapshot.availability !== 'available') throw new ApiError('SERVICE_UNAVAILABLE');
    response.status(200).json(ReadinessResponseSchema.parse({ status: 'ready' }));
  });
  router.get(
    statusPath,
    identifyRoute(statusPath),
    dependencies.publicStatusGuard,
    (request, response) => {
      const context = getRequestContext(request);
      response.status(200).json(
        dependencies.getSystemStatus({
          requestId: context.requestId,
        }),
      );
    },
  );
  return router;
}

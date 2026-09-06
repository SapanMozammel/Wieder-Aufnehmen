import type { RequestHandler } from 'express';
import type { Now } from '../clock.js';
import type { ApiLogger } from '../logging/api-logger.js';
import { getRequestContext } from './request-context.js';

export function createRequestLoggingMiddleware(
  logger: ApiLogger,
  now: Now = Date.now,
): RequestHandler {
  return (request, response, next): void => {
    const context = getRequestContext(request);
    let logged = false;
    const complete = (outcome: 'completed' | 'aborted'): void => {
      if (logged) return;
      logged = true;
      const status = response.statusCode;
      logger.emit({
        name: 'http.request.completed',
        timestamp: new Date(now()).toISOString(),
        severity:
          status >= 500 ? 'error' : status >= 400 || outcome === 'aborted' ? 'warn' : 'info',
        requestId: context.requestId,
        method: request.method,
        route: context.routePattern,
        status,
        durationMs: Math.max(0, now() - context.startedAtMs),
        outcome,
        ...(context.errorCode ? { errorCode: context.errorCode } : {}),
      });
    };
    response.once('finish', () => complete('completed'));
    response.once('close', () => {
      if (!response.writableFinished) complete('aborted');
    });
    next();
  };
}

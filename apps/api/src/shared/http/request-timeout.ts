import type { RequestHandler } from 'express';
import { ApiError } from '../errors/api-error.js';
import { getRequestContext } from './request-context.js';

export type ScheduleTimeout = (
  callback: () => void,
  delayMs: number,
) => ReturnType<typeof setTimeout>;
export type CancelTimeout = (handle: ReturnType<typeof setTimeout>) => void;

export function createRequestTimeoutMiddleware(
  timeoutMs: number,
  schedule: ScheduleTimeout = setTimeout,
  cancel: CancelTimeout = clearTimeout,
): RequestHandler {
  return (request, response, next): void => {
    const context = getRequestContext(request);
    let settled = false;
    const handle = schedule(() => {
      if (settled) return;
      context.abortController.abort();
      if (response.headersSent || response.writableEnded || response.destroyed) {
        response.destroy();
        return;
      }
      next(new ApiError('TIMEOUT'));
    }, timeoutMs);
    handle.unref?.();

    const finish = (): void => {
      if (settled) return;
      settled = true;
      cancel(handle);
    };
    response.once('finish', finish);
    response.once('close', () => {
      if (!response.writableFinished) context.abortController.abort();
      finish();
    });
    next();
  };
}

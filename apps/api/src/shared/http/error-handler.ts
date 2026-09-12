import type { ErrorRequestHandler, RequestHandler } from 'express';
import {
  ApiError,
  createErrorEnvelope,
  normalizeApiError,
  statusForError,
} from '../errors/api-error.js';
import { getRequestContext } from './request-context.js';

export const notFoundHandler: RequestHandler = (_request, _response, next): void => {
  next(new ApiError('NOT_FOUND'));
};

export const errorHandler: ErrorRequestHandler = (error, request, response, _next): void => {
  if (response.headersSent) {
    response.destroy();
    return;
  }
  const context = getRequestContext(request);
  const normalized = normalizeApiError(error);
  context.errorCode = normalized.code;
  response
    .status(statusForError(normalized.code))
    .json(createErrorEnvelope(normalized, context.requestId));
};

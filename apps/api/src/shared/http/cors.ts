import type { RequestHandler } from 'express';
import type { ApiConfig } from '../../bootstrap/config.js';
import { ApiError } from '../errors/api-error.js';

function requestedHeaders(value: string | undefined): readonly string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((header) => header.trim().toLowerCase())
    .filter(Boolean);
}

export function createCorsMiddleware(config: ApiConfig['cors']): RequestHandler {
  const origins = new Set(config.allowedOrigins);
  const allowedHeaders = new Set(config.allowedHeaders.map((header) => header.toLowerCase()));
  const allowedMethods = new Set<string>(config.allowedMethods);

  return (request, response, next): void => {
    const origin = request.headers.origin;
    if (origin !== undefined) {
      response.vary('Origin');
      if (!origins.has(origin)) {
        next(new ApiError('FORBIDDEN'));
        return;
      }
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
    }

    if (request.method !== 'OPTIONS') {
      next();
      return;
    }

    response.vary('Access-Control-Request-Method');
    response.vary('Access-Control-Request-Headers');

    const requestedMethod = request.headers['access-control-request-method'];
    if (requestedMethod && !allowedMethods.has(requestedMethod)) {
      next(new ApiError('FORBIDDEN'));
      return;
    }
    const rejectedHeader = requestedHeaders(request.headers['access-control-request-headers']).some(
      (header) => !allowedHeaders.has(header),
    );
    if (rejectedHeader) {
      next(new ApiError('FORBIDDEN'));
      return;
    }

    response.setHeader('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
    response.setHeader('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
    response.setHeader('Access-Control-Max-Age', String(config.maxAgeSeconds));
    response.status(204).end();
  };
}

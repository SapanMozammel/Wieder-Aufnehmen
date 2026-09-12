import { createServer, type Server } from 'node:http';
import type { Express } from 'express';
import type { ApiConfig } from './config.js';

export function createApiHttpServer(app: Express, config: ApiConfig['http']): Server {
  const server = createServer(
    {
      headersTimeout: config.headersTimeoutMs,
      requestTimeout: config.requestTimeoutMs,
      keepAliveTimeout: config.keepAliveTimeoutMs,
      maxHeaderSize: config.maxHeaderSizeBytes,
      requireHostHeader: true,
    },
    app,
  );
  server.maxRequestsPerSocket = config.maxRequestsPerSocket;
  return server;
}

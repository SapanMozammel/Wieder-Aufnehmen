import type { RequestHandler } from 'express';
import helmet from 'helmet';
import type { ApiMode } from '../../bootstrap/config.js';

export function createSecurityMiddleware(mode: ApiMode): readonly RequestHandler[] {
  const headers = helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'none'"],
        baseUri: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'none'"],
      },
    },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    originAgentCluster: true,
    referrerPolicy: { policy: 'no-referrer' },
    strictTransportSecurity:
      mode === 'production' ? { maxAge: 31_536_000, includeSubDomains: true } : false,
    xContentTypeOptions: true,
    xDnsPrefetchControl: { allow: false },
    xDownloadOptions: true,
    xFrameOptions: { action: 'deny' },
    xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
    xXssProtection: true,
  });
  const cacheControl: RequestHandler = (_request, response, next): void => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  };
  return Object.freeze([headers, cacheControl]);
}

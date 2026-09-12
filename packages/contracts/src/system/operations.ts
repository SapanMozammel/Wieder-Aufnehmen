import type { ContractSchemaName } from '../registry.js';

export type TechnicalOperationExposure = 'internal' | 'public';

interface TechnicalResponseContract {
  readonly description: string;
  readonly schema: ContractSchemaName;
}

interface TechnicalHttpOperation {
  readonly method: 'get';
  readonly path: `/${string}`;
  readonly operationId: string;
  readonly summary: string;
  readonly exposure: TechnicalOperationExposure;
  readonly responses: Readonly<Record<number, TechnicalResponseContract>>;
}

export const technicalHttpOperations = {
  liveness: {
    method: 'get',
    path: '/health/live',
    operationId: 'getLiveness',
    summary: 'Report process liveness',
    exposure: 'internal',
    responses: {
      200: {
        description: 'The API process is serving requests.',
        schema: 'LivenessResponse',
      },
      500: {
        description: 'The liveness request could not be completed safely.',
        schema: 'ErrorEnvelope',
      },
    },
  },
  readiness: {
    method: 'get',
    path: '/health/ready',
    operationId: 'getReadiness',
    summary: 'Report internal service readiness',
    exposure: 'internal',
    responses: {
      200: {
        description: 'All required dependencies are currently ready.',
        schema: 'ReadinessResponse',
      },
      500: {
        description: 'The readiness request could not be completed safely.',
        schema: 'ErrorEnvelope',
      },
      503: {
        description: 'A required dependency is unavailable or its check timed out.',
        schema: 'ErrorEnvelope',
      },
    },
  },
  systemStatus: {
    method: 'get',
    path: '/v1/system/status',
    operationId: 'getSystemStatus',
    summary: 'Report sanitized public system status',
    exposure: 'public',
    responses: {
      200: {
        description: 'The status was evaluated as available or degraded.',
        schema: 'SystemStatusResponse',
      },
      429: {
        description: 'The process-local request limit was exceeded.',
        schema: 'ErrorEnvelope',
      },
      500: {
        description: 'The status could not be evaluated safely.',
        schema: 'ErrorEnvelope',
      },
      504: {
        description: 'The bounded status evaluation timed out.',
        schema: 'ErrorEnvelope',
      },
    },
  },
} as const satisfies Record<string, TechnicalHttpOperation>;

export type TechnicalHttpOperationName = keyof typeof technicalHttpOperations;

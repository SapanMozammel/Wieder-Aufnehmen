import { ErrorEnvelopeSchema } from './error.js';
import {
  LivenessResponseSchema,
  ReadinessResponseSchema,
  SystemStatusResponseSchema,
} from './system/status.js';

export const contractSchemaRegistry = {
  ErrorEnvelope: ErrorEnvelopeSchema,
  LivenessResponse: LivenessResponseSchema,
  ReadinessResponse: ReadinessResponseSchema,
  SystemStatusResponse: SystemStatusResponseSchema,
} as const;

export type ContractSchemaName = keyof typeof contractSchemaRegistry;

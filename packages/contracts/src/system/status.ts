import { z } from 'zod';
import { ResponseMetadataSchema } from '../response-metadata.js';

export const CONTRACT_VERSION = 'v1' as const;

export const LivenessResponseSchema = z
  .strictObject({
    status: z.literal('live'),
  })
  .describe('Closed process-liveness response with no dependency information.');

export const ReadinessResponseSchema = z
  .strictObject({
    status: z.literal('ready'),
  })
  .describe('Closed readiness response returned only when required dependencies are ready.');

const statusMetadataShape = {
  ...ResponseMetadataSchema.shape,
  contractVersion: z.literal(CONTRACT_VERSION),
};

export const SystemStatusResponseSchema = z
  .discriminatedUnion('state', [
    z.strictObject({
      state: z.literal('available'),
      database: z.literal('available'),
      ...statusMetadataShape,
    }),
    z.strictObject({
      state: z.literal('degraded'),
      database: z.literal('unavailable'),
      ...statusMetadataShape,
    }),
  ])
  .describe('Sanitized public API and database availability status.');

export type LivenessResponse = z.infer<typeof LivenessResponseSchema>;
export type ReadinessResponse = z.infer<typeof ReadinessResponseSchema>;
export type SystemStatusResponse = z.infer<typeof SystemStatusResponseSchema>;

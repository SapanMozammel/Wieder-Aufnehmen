import { z } from 'zod';
import { RequestIdSchema } from './response-metadata.js';

export const ErrorCodeSchema = z.enum([
  'VALIDATION_FAILED',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'SERVICE_UNAVAILABLE',
  'TIMEOUT',
  'INTERNAL_ERROR',
]);

export const ErrorDetailReasonSchema = z.enum([
  'REQUIRED',
  'INVALID_TYPE',
  'INVALID_FORMAT',
  'OUT_OF_RANGE',
  'UNKNOWN_FIELD',
]);

const ErrorDetailPathSegmentSchema = z.union([
  z
    .string()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z][A-Za-z0-9]*$/),
  z.number().int().nonnegative().max(1_000_000),
]);

export const ErrorDetailSchema = z
  .strictObject({
    path: z.array(ErrorDetailPathSegmentSchema).max(16),
    reason: ErrorDetailReasonSchema,
  })
  .describe('Allowlisted validation metadata that never includes a rejected value.');

export const ErrorEnvelopeSchema = z
  .strictObject({
    error: z.strictObject({
      code: ErrorCodeSchema,
      message: z.string().min(1).max(256),
      requestId: RequestIdSchema,
      details: z.array(ErrorDetailSchema).max(16).optional(),
    }),
  })
  .describe('Stable, display-safe JSON error response.');

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type ErrorDetailReason = z.infer<typeof ErrorDetailReasonSchema>;
export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

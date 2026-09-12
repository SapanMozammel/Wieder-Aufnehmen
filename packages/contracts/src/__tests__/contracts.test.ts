import { describe, expect, it } from 'vitest';
import {
  ErrorEnvelopeSchema,
  LivenessResponseSchema,
  ReadinessResponseSchema,
  ResponseMetadataSchema,
  SystemStatusResponseSchema,
  technicalHttpOperations,
} from '../index.js';

const REQUEST_ID = 'request_0000000000000001';
const TIMESTAMP = '2026-09-02T12:00:00.000Z';

describe('technical health contracts', () => {
  it('accepts only the closed liveness and readiness responses', () => {
    expect(LivenessResponseSchema.parse({ status: 'live' })).toEqual({ status: 'live' });
    expect(ReadinessResponseSchema.parse({ status: 'ready' })).toEqual({ status: 'ready' });

    expect(
      LivenessResponseSchema.safeParse({ status: 'live', database: 'available' }).success,
    ).toBe(false);
    expect(ReadinessResponseSchema.safeParse({ status: 'not-ready' }).success).toBe(false);
  });

  it('accepts exactly the available and degraded public status combinations', () => {
    expect(
      SystemStatusResponseSchema.safeParse({
        state: 'available',
        database: 'available',
        contractVersion: 'v1',
        requestId: REQUEST_ID,
        timestamp: TIMESTAMP,
      }).success,
    ).toBe(true);
    expect(
      SystemStatusResponseSchema.safeParse({
        state: 'degraded',
        database: 'unavailable',
        contractVersion: 'v1',
        requestId: REQUEST_ID,
        timestamp: TIMESTAMP,
      }).success,
    ).toBe(true);
  });

  it.each([
    ['available', 'unavailable'],
    ['degraded', 'available'],
  ])('rejects the inconsistent %s/%s public status combination', (state, database) => {
    expect(
      SystemStatusResponseSchema.safeParse({
        state,
        database,
        contractVersion: 'v1',
        requestId: REQUEST_ID,
        timestamp: TIMESTAMP,
      }).success,
    ).toBe(false);
  });

  it('requires bounded request metadata and a UTC timestamp', () => {
    expect(
      ResponseMetadataSchema.safeParse({ requestId: REQUEST_ID, timestamp: TIMESTAMP }).success,
    ).toBe(true);
    expect(
      ResponseMetadataSchema.safeParse({
        requestId: 'request.with.invalid.characters',
        timestamp: TIMESTAMP,
      }).success,
    ).toBe(false);
    expect(
      ResponseMetadataSchema.safeParse({
        requestId: REQUEST_ID,
        timestamp: '2026-09-02T12:00:00+00:00',
      }).success,
    ).toBe(false);
  });
});

describe('error envelope contract', () => {
  it('accepts a bounded safe error and allowlisted validation detail', () => {
    expect(
      ErrorEnvelopeSchema.parse({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'The request could not be accepted.',
          requestId: REQUEST_ID,
          details: [{ path: ['body', 'email'], reason: 'INVALID_FORMAT' }],
        },
      }),
    ).toEqual({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'The request could not be accepted.',
        requestId: REQUEST_ID,
        details: [{ path: ['body', 'email'], reason: 'INVALID_FORMAT' }],
      },
    });
  });

  it('rejects unstable codes, rejected values, and unknown fields', () => {
    expect(
      ErrorEnvelopeSchema.safeParse({
        error: {
          code: 'MONGODB_SELECTION_FAILED',
          message: 'mongodb://user:password@db.internal/aufnehmen',
          requestId: REQUEST_ID,
          cause: 'raw driver error',
        },
      }).success,
    ).toBe(false);
    expect(
      ErrorEnvelopeSchema.safeParse({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'The request could not be accepted.',
          requestId: REQUEST_ID,
          details: [
            {
              path: ['body', 'email'],
              reason: 'INVALID_FORMAT',
              value: 'private@example.com',
            },
          ],
        },
      }).success,
    ).toBe(false);
  });
});

describe('technical HTTP operation registry', () => {
  it('records the exact endpoint exposure and response matrix', () => {
    expect(technicalHttpOperations).toMatchObject({
      liveness: {
        method: 'get',
        path: '/health/live',
        exposure: 'internal',
        responses: { 200: { schema: 'LivenessResponse' }, 500: { schema: 'ErrorEnvelope' } },
      },
      readiness: {
        method: 'get',
        path: '/health/ready',
        exposure: 'internal',
        responses: {
          200: { schema: 'ReadinessResponse' },
          500: { schema: 'ErrorEnvelope' },
          503: { schema: 'ErrorEnvelope' },
        },
      },
      systemStatus: {
        method: 'get',
        path: '/v1/system/status',
        exposure: 'public',
        responses: {
          200: { schema: 'SystemStatusResponse' },
          429: { schema: 'ErrorEnvelope' },
          500: { schema: 'ErrorEnvelope' },
          504: { schema: 'ErrorEnvelope' },
        },
      },
    });
  });
});

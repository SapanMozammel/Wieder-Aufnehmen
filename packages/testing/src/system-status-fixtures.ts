import { ErrorEnvelopeSchema, SystemStatusResponseSchema } from '@aufnehmen/contracts';

const requestId = 'request_0000000000000001';
const timestamp = '2026-09-02T12:00:00.000Z';

export const availableSystemStatusFixture = Object.freeze(
  SystemStatusResponseSchema.parse({
    state: 'available',
    database: 'available',
    contractVersion: 'v1',
    requestId,
    timestamp,
  }),
);

export const degradedSystemStatusFixture = Object.freeze(
  SystemStatusResponseSchema.parse({
    state: 'degraded',
    database: 'unavailable',
    contractVersion: 'v1',
    requestId,
    timestamp,
  }),
);

export const timeoutErrorFixture = Object.freeze(
  ErrorEnvelopeSchema.parse({
    error: {
      code: 'TIMEOUT',
      message: 'The request timed out.',
      requestId,
    },
  }),
);

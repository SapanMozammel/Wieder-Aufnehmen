import { ErrorEnvelopeSchema, SystemStatusResponseSchema } from '@aufnehmen/contracts';
import { describe, expect, it } from 'vitest';
import {
  availableSystemStatusFixture,
  degradedSystemStatusFixture,
  timeoutErrorFixture,
} from '../index.js';

describe('shared system-status fixtures', () => {
  it('keeps both public status branches contract-valid and synthetic', () => {
    expect(SystemStatusResponseSchema.safeParse(availableSystemStatusFixture).success).toBe(true);
    expect(SystemStatusResponseSchema.safeParse(degradedSystemStatusFixture).success).toBe(true);
    expect(availableSystemStatusFixture.state).toBe('available');
    expect(degradedSystemStatusFixture.state).toBe('degraded');
  });

  it('keeps the shared timeout response inside the stable error envelope', () => {
    expect(ErrorEnvelopeSchema.safeParse(timeoutErrorFixture).success).toBe(true);
    expect(timeoutErrorFixture.error.code).toBe('TIMEOUT');
  });
});

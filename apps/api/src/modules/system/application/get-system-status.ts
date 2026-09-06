import {
  CONTRACT_VERSION,
  SystemStatusResponseSchema,
  type SystemStatusResponse,
} from '@aufnehmen/contracts';
import type { Now } from '../../../shared/clock.js';
import type { ReadinessPort } from './readiness-port.js';

export interface GetSystemStatusInput {
  readonly requestId: string;
}

export type GetSystemStatus = (input: GetSystemStatusInput) => SystemStatusResponse;

export function createGetSystemStatus(
  readiness: ReadinessPort,
  now: Now = Date.now,
): GetSystemStatus {
  return ({ requestId }) => {
    const database = readiness.current().availability;
    return SystemStatusResponseSchema.parse({
      state: database === 'available' ? 'available' : 'degraded',
      database,
      contractVersion: CONTRACT_VERSION,
      requestId,
      timestamp: new Date(now()).toISOString(),
    });
  };
}

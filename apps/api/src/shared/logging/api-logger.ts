import type { ErrorCode } from '@aufnehmen/contracts';
import type { ApiMode } from '../../bootstrap/config.js';

type Severity = 'info' | 'warn' | 'error';
type ReadinessState = 'available' | 'unavailable';

export type ApiLogEvent =
  | {
      readonly name: 'http.request.completed';
      readonly timestamp: string;
      readonly severity: Severity;
      readonly requestId: string;
      readonly method: string;
      readonly route: string;
      readonly status: number;
      readonly durationMs: number;
      readonly outcome: 'completed' | 'aborted';
      readonly errorCode?: ErrorCode;
    }
  | {
      readonly name: 'api.lifecycle';
      readonly timestamp: string;
      readonly severity: Severity;
      readonly action:
        | 'started'
        | 'startup_failed'
        | 'shutdown_started'
        | 'shutdown_completed'
        | 'shutdown_forced';
      readonly reason?: string;
      readonly errorClass?: string;
    }
  | {
      readonly name: 'mongo.readiness.changed';
      readonly timestamp: string;
      readonly severity: Severity;
      readonly state: ReadinessState;
      readonly errorClass?: string;
    };

export interface ApiLogger {
  emit(event: ApiLogEvent): void;
}

export type LogWriter = (serializedEvent: string) => void;

const SENSITIVE_VALUE =
  /(?:mongodb(?:\+srv)?:\/\/|authorization|bearer\s|cookie|password|secret|token\s*[=:])/iu;

function safeString(value: string, maxLength = 128): string {
  if (SENSITIVE_VALUE.test(value)) return '[REDACTED]';
  const withoutControls = Array.from(value)
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint > 31 && codePoint !== 127;
    })
    .join('');
  return withoutControls.slice(0, maxLength) || 'unknown';
}

function safeInteger(value: number): number {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function serializeApiLogEvent(
  event: ApiLogEvent,
  mode: ApiMode,
): Readonly<Record<string, string | number>> {
  const base = {
    timestamp: safeString(event.timestamp, 32),
    severity: event.severity,
    service: 'aufnehmen-api',
    environment: mode,
    event: event.name,
  } as const;

  if (event.name === 'http.request.completed') {
    return Object.freeze({
      ...base,
      requestId: safeString(event.requestId),
      method: /^[A-Z]{1,16}$/u.test(event.method) ? event.method : 'OTHER',
      route: safeString(event.route),
      status: safeInteger(event.status),
      durationMs: safeInteger(Math.round(event.durationMs)),
      outcome: event.outcome,
      ...(event.errorCode ? { errorCode: event.errorCode } : {}),
    });
  }
  if (event.name === 'api.lifecycle') {
    return Object.freeze({
      ...base,
      action: event.action,
      ...(event.reason ? { reason: safeString(event.reason) } : {}),
      ...(event.errorClass ? { errorClass: safeString(event.errorClass, 64) } : {}),
    });
  }
  return Object.freeze({
    ...base,
    state: event.state,
    ...(event.errorClass ? { errorClass: safeString(event.errorClass, 64) } : {}),
  });
}

export function createStructuredConsoleLogger(
  mode: ApiMode,
  stdout: LogWriter = console.log,
  stderr: LogWriter = console.error,
): ApiLogger {
  const logger: ApiLogger = {
    emit(event: ApiLogEvent): void {
      try {
        const serialized = JSON.stringify(serializeApiLogEvent(event, mode));
        (event.severity === 'error' ? stderr : stdout)(serialized);
      } catch {
        // Observability transport failure must not change request behavior.
      }
    },
  };
  return Object.freeze(logger);
}

export const SILENT_LOGGER: ApiLogger = Object.freeze({ emit: () => undefined });

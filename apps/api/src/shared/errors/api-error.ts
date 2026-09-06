import { ErrorEnvelopeSchema, type ErrorCode } from '@aufnehmen/contracts';

export interface SafeErrorDetail {
  readonly path: readonly (string | number)[];
  readonly reason:
    'REQUIRED' | 'INVALID_TYPE' | 'INVALID_FORMAT' | 'OUT_OF_RANGE' | 'UNKNOWN_FIELD';
}

const STATUS_BY_CODE: Readonly<Record<ErrorCode, number>> = Object.freeze({
  VALIDATION_FAILED: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  SERVICE_UNAVAILABLE: 503,
  TIMEOUT: 504,
  INTERNAL_ERROR: 500,
});

const MESSAGE_BY_CODE: Readonly<Record<ErrorCode, string>> = Object.freeze({
  VALIDATION_FAILED: 'The request could not be accepted.',
  UNAUTHENTICATED: 'Authentication is required.',
  FORBIDDEN: 'The request is not allowed.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'The request conflicts with the current state.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable.',
  TIMEOUT: 'The request timed out.',
  INTERNAL_ERROR: 'The service could not complete the request.',
});

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly details: readonly SafeErrorDetail[] | undefined;

  public constructor(
    code: ErrorCode,
    options: ErrorOptions & { readonly details?: readonly SafeErrorDetail[] } = {},
  ) {
    super(MESSAGE_BY_CODE[code], options);
    this.name = 'ApiError';
    this.code = code;
    this.details = options.details;
  }
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isRecord(error)) {
    const type = error['type'];
    if (type === 'entity.parse.failed' || type === 'entity.too.large') {
      return new ApiError('VALIDATION_FAILED', { cause: error });
    }
  }
  return new ApiError('INTERNAL_ERROR', { cause: error });
}

export function statusForError(code: ErrorCode): number {
  return STATUS_BY_CODE[code];
}

export function createErrorEnvelope(
  error: ApiError,
  requestId: string,
): ReturnType<typeof ErrorEnvelopeSchema.parse> {
  return ErrorEnvelopeSchema.parse({
    error: {
      code: error.code,
      message: MESSAGE_BY_CODE[error.code],
      requestId,
      ...(error.details && error.details.length > 0 ? { details: error.details } : {}),
    },
  });
}

export function safeErrorClass(error: unknown): string {
  if (error instanceof ApiError) return `ApiError.${error.code}`;
  if (error instanceof Error && /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/u.test(error.name)) {
    return error.name;
  }
  return 'UnknownError';
}

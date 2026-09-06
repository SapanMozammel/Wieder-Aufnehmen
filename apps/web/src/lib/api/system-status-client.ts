import {
  ErrorEnvelopeSchema,
  SystemStatusResponseSchema,
  technicalHttpOperations,
  type ErrorEnvelope,
  type SystemStatusResponse,
} from '@aufnehmen/contracts';

export const DEFAULT_SYSTEM_STATUS_TIMEOUT_MS = 5_000;

export type SystemStatusClientErrorKind =
  'aborted' | 'http' | 'invalid-response' | 'network' | 'timeout';

const SAFE_ERROR_MESSAGES: Record<SystemStatusClientErrorKind, string> = {
  aborted: 'The status check was cancelled.',
  http: 'The status service could not complete the check.',
  'invalid-response': 'The status service returned an unexpected response.',
  network: 'The status service could not be reached.',
  timeout: 'The status check took too long.',
};

export class SystemStatusClientError extends Error {
  override readonly name = 'SystemStatusClientError';

  constructor(
    readonly kind: SystemStatusClientErrorKind,
    readonly status?: number,
    readonly code?: ErrorEnvelope['error']['code'],
    readonly requestId?: string,
  ) {
    super(SAFE_ERROR_MESSAGES[kind]);
  }
}

export interface GetSystemStatusOptions {
  readonly apiBaseUrl: string;
  readonly fetch?: typeof globalThis.fetch;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
}

async function readJson(response: Response, signal: AbortSignal): Promise<unknown> {
  try {
    return await response.json();
  } catch (error: unknown) {
    if (signal.aborted) {
      throw error;
    }
    throw new SystemStatusClientError('invalid-response', response.status);
  }
}

function createStatusUrl(apiBaseUrl: string): URL {
  try {
    return new URL(technicalHttpOperations.systemStatus.path, `${apiBaseUrl}/`);
  } catch {
    // The public configuration parser normally prevents this. Keep the client
    // safe if it is called directly by another in-app consumer.
    throw new SystemStatusClientError('network');
  }
}

/**
 * Fetch the sanitized public system status. This request carries no application state, and all response bodies remain untrusted until a shared runtime
 * contract accepts them.
 */
export async function getSystemStatus({
  apiBaseUrl,
  fetch: fetchImplementation = globalThis.fetch,
  signal,
  timeoutMs = DEFAULT_SYSTEM_STATUS_TIMEOUT_MS,
}: GetSystemStatusOptions): Promise<SystemStatusResponse> {
  const requestController = new AbortController();
  let timedOut = false;

  const abortFromCaller = () => requestController.abort();
  if (signal?.aborted) {
    throw new SystemStatusClientError('aborted');
  }
  signal?.addEventListener('abort', abortFromCaller, { once: true });

  const timeout = setTimeout(() => {
    timedOut = true;
    requestController.abort();
  }, timeoutMs);

  try {
    const response = await fetchImplementation(createStatusUrl(apiBaseUrl), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'omit',
      cache: 'no-store',
      signal: requestController.signal,
    });
    const payload = await readJson(response, requestController.signal);

    if (response.status !== 200) {
      const parsedError = ErrorEnvelopeSchema.safeParse(payload);
      if (response.ok || !parsedError.success) {
        throw new SystemStatusClientError('invalid-response', response.status);
      }
      throw new SystemStatusClientError(
        'http',
        response.status,
        parsedError.data.error.code,
        parsedError.data.error.requestId,
      );
    }

    const parsedStatus = SystemStatusResponseSchema.safeParse(payload);
    if (!parsedStatus.success) {
      throw new SystemStatusClientError('invalid-response', response.status);
    }

    return parsedStatus.data;
  } catch (error: unknown) {
    if (error instanceof SystemStatusClientError) {
      throw error;
    }
    if (timedOut) {
      throw new SystemStatusClientError('timeout');
    }
    if (signal?.aborted) {
      throw new SystemStatusClientError('aborted');
    }
    throw new SystemStatusClientError('network');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

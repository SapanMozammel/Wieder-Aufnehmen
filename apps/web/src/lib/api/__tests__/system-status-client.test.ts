import {
  availableSystemStatusFixture,
  degradedSystemStatusFixture,
  timeoutErrorFixture,
} from '@aufnehmen/testing';
import { describe, expect, it } from 'vitest';
import { getSystemStatus, SystemStatusClientError } from '../system-status-client';

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('system status client', () => {
  it('calls only the public status operation and validates an available response', async () => {
    let requestedUrl: string | undefined;
    let requestedInit: RequestInit | undefined;
    const fetchImplementation: typeof fetch = async (input, init) => {
      requestedUrl = String(input);
      requestedInit = init;
      return jsonResponse(availableSystemStatusFixture);
    };

    await expect(
      getSystemStatus({
        apiBaseUrl: 'http://127.0.0.1:4000',
        fetch: fetchImplementation,
      }),
    ).resolves.toEqual(availableSystemStatusFixture);

    expect(requestedUrl).toBe('http://127.0.0.1:4000/v1/system/status');
    expect(requestedInit?.method).toBe('GET');
    expect(requestedInit?.body).toBeUndefined();
    expect(requestedInit?.headers).toEqual({ Accept: 'application/json' });
    expect(requestedInit?.credentials).toBe('omit');
    expect(requestedInit?.cache).toBe('no-store');
  });

  it('accepts the contract-defined degraded response as successful data', async () => {
    const fetchImplementation: typeof fetch = async () => jsonResponse(degradedSystemStatusFixture);

    await expect(
      getSystemStatus({ apiBaseUrl: 'https://api.example.test', fetch: fetchImplementation }),
    ).resolves.toEqual(degradedSystemStatusFixture);
  });

  it('rejects a successful response that fails the shared runtime contract', async () => {
    const fetchImplementation: typeof fetch = async () =>
      jsonResponse({
        ...availableSystemStatusFixture,
        database: 'mongodb://user:secret@internal.example.test/aufnehmen',
      });

    await expect(
      getSystemStatus({ apiBaseUrl: 'https://api.example.test', fetch: fetchImplementation }),
    ).rejects.toMatchObject({
      kind: 'invalid-response',
      message: 'The status service returned an unexpected response.',
    });
  });

  it('rejects an otherwise valid body returned with an undocumented success status', async () => {
    const fetchImplementation: typeof fetch = async () =>
      jsonResponse(availableSystemStatusFixture, 201);

    await expect(
      getSystemStatus({ apiBaseUrl: 'https://api.example.test', fetch: fetchImplementation }),
    ).rejects.toMatchObject({
      kind: 'invalid-response',
      status: 201,
    });
  });

  it('retains only allowlisted metadata from a validated HTTP error', async () => {
    const fetchImplementation: typeof fetch = async () => jsonResponse(timeoutErrorFixture, 504);

    await expect(
      getSystemStatus({ apiBaseUrl: 'https://api.example.test', fetch: fetchImplementation }),
    ).rejects.toMatchObject({
      kind: 'http',
      status: 504,
      code: 'TIMEOUT',
      requestId: timeoutErrorFixture.error.requestId,
      message: 'The status service could not complete the check.',
    });
  });

  it('does not expose a network exception message', async () => {
    const sensitiveCause = 'mongodb://user:secret@internal.example.test/aufnehmen';
    const fetchImplementation: typeof fetch = async () => {
      throw new Error(sensitiveCause);
    };

    const error = await getSystemStatus({
      apiBaseUrl: 'https://api.example.test',
      fetch: fetchImplementation,
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(SystemStatusClientError);
    expect(error).toMatchObject({
      kind: 'network',
      message: 'The status service could not be reached.',
    });
    expect(String(error)).not.toContain(sensitiveCause);
  });

  it('aborts a status request after the configured timeout', async () => {
    const fetchImplementation: typeof fetch = (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener(
          'abort',
          () => reject(new DOMException('The operation was aborted.', 'AbortError')),
          { once: true },
        );
      });

    await expect(
      getSystemStatus({
        apiBaseUrl: 'https://api.example.test',
        fetch: fetchImplementation,
        timeoutMs: 5,
      }),
    ).rejects.toMatchObject({
      kind: 'timeout',
      message: 'The status check took too long.',
    });
  });

  it('propagates caller cancellation without mistaking it for a timeout', async () => {
    const caller = new AbortController();
    const fetchImplementation: typeof fetch = (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener(
          'abort',
          () => reject(new DOMException('The operation was aborted.', 'AbortError')),
          { once: true },
        );
      });
    const statusRequest = getSystemStatus({
      apiBaseUrl: 'https://api.example.test',
      fetch: fetchImplementation,
      signal: caller.signal,
      timeoutMs: 1_000,
    });

    caller.abort();

    await expect(statusRequest).rejects.toMatchObject({ kind: 'aborted' });
  });
});

import { describe, expect, it, vi } from 'vitest';
import { createStructuredConsoleLogger, serializeApiLogEvent } from './api-logger.js';

describe('structured API logger', () => {
  it('projects a fixed allowlist and redacts a secret-like value before serialization', () => {
    const record = serializeApiLogEvent(
      {
        name: 'http.request.completed',
        timestamp: '2026-09-02T12:00:00.000Z',
        severity: 'info',
        requestId: 'mongodb://user:secret@host/db',
        method: 'GET',
        route: '/health/live',
        status: 200,
        durationMs: 2,
        outcome: 'completed',
        body: 'must be omitted',
        authorization: 'must be omitted',
      } as never,
      'test',
    );

    expect(record.requestId).toBe('[REDACTED]');
    expect(record).not.toHaveProperty('body');
    expect(record).not.toHaveProperty('authorization');
  });

  it('swallows output transport failures', () => {
    const logger = createStructuredConsoleLogger('test', () => {
      throw new Error('sink failed');
    });

    expect(() =>
      logger.emit({
        name: 'api.lifecycle',
        timestamp: '2026-09-02T12:00:00.000Z',
        severity: 'info',
        action: 'started',
      }),
    ).not.toThrow();
  });

  it('routes error events to stderr', () => {
    const stdout = vi.fn();
    const stderr = vi.fn();
    const logger = createStructuredConsoleLogger('test', stdout, stderr);
    logger.emit({
      name: 'api.lifecycle',
      timestamp: '2026-09-02T12:00:00.000Z',
      severity: 'error',
      action: 'startup_failed',
      errorClass: 'SyntheticError',
    });

    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).toHaveBeenCalledOnce();
  });
});

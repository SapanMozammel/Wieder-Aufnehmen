import { describe, expect, it } from 'vitest';
import { createServicePlans } from './run-services.js';

describe('local development configuration', () => {
  it('starts web with an explicit valid API origin without local environment files', () => {
    const plans = createServicePlans('all', {}, {});
    expect(plans[1]?.environment.NEXT_PUBLIC_API_BASE_URL).toBe('http://127.0.0.1:4000');
    expect(plans[0]?.environment.CORS_ALLOWED_ORIGINS).toBe('http://127.0.0.1:3000');
  });
  it('keeps API local credentials out of the web process', () => {
    const plans = createServicePlans(
      'all',
      {},
      { api: { MONGODB_URI: 'mongodb://127.0.0.1:27018' } },
    );
    expect(plans[1]?.environment.MONGODB_URI).toBeUndefined();
  });
  it('lets explicit process settings override local files and derives consistent defaults', () => {
    const plans = createServicePlans(
      'all',
      { PORT: '4100', WEB_PORT: '3100' },
      { api: { PORT: '4200' } },
    );
    expect(plans[1]?.environment.NEXT_PUBLIC_API_BASE_URL).toBe('http://127.0.0.1:4100');
    expect(plans[0]?.environment.CORS_ALLOWED_ORIGINS).toBe('http://127.0.0.1:3100');
  });
  it('rejects local files selecting runtime mode', () => {
    expect(() => createServicePlans('all', {}, { api: { NODE_ENV: 'production' } })).toThrow(
      /NODE_ENV/,
    );
    expect(() => createServicePlans('all', {}, { web: { NODE_ENV: 'test' } })).toThrow(/NODE_ENV/);
  });
  it('honors the documented local WEB_PORT and derives the API allowlist', () => {
    const plans = createServicePlans('all', {}, { web: { WEB_PORT: '3456' } });
    expect(plans[1]?.environment.PORT).toBe('3456');
    expect(plans[0]?.environment.CORS_ALLOWED_ORIGINS).toBe('http://127.0.0.1:3456');
  });
  it('rejects production mode and an IPv6 origin that cannot reach the IPv4 listener', () => {
    expect(() => createServicePlans('all', { NODE_ENV: 'production' }, {})).toThrow(/deployment/);
    expect(() =>
      createServicePlans('all', { NEXT_PUBLIC_API_BASE_URL: 'http://[::1]:4000' }, {}),
    ).toThrow(/127.0.0.1/);
  });
  it('rejects an API bind address that cannot serve the combined IPv4 origin', () => {
    expect(() => createServicePlans('all', { HOST: '::1' }, {})).toThrow(/HOST/);
    expect(createServicePlans('all', { HOST: '0.0.0.0' }, {})[0]?.environment.HOST).toBe('0.0.0.0');
  });
  it('rejects a remote origin even when the API port matches', () => {
    expect(() =>
      createServicePlans('all', { NEXT_PUBLIC_API_BASE_URL: 'http://example.com:4000' }, {}),
    ).toThrow(/loopback/);
  });
  it.each([
    { PORT: '' },
    { PORT: '0' },
    { PORT: '3000' },
    { NEXT_PUBLIC_API_BASE_URL: 'https://example.com/path' },
    { NEXT_PUBLIC_API_BASE_URL: 'http://127.0.0.1:4100' },
  ])('rejects invalid or mismatched combined-stack inputs %j', (environment) => {
    expect(() => createServicePlans('all', environment, {})).toThrow();
  });
});

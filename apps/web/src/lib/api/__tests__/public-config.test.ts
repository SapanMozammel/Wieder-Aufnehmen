import { describe, expect, it } from 'vitest';
import { parsePublicWebConfig } from '../public-config';

describe('public web configuration', () => {
  it('accepts and normalizes a public HTTP API origin', () => {
    const config = parsePublicWebConfig({
      NEXT_PUBLIC_API_BASE_URL: '  https://api.example.test:444/  ',
    });

    expect(config).toEqual({ apiBaseUrl: 'https://api.example.test:444' });
    expect(Object.isFrozen(config)).toBe(true);
  });

  it('requires the API base URL', () => {
    expect(() => parsePublicWebConfig({})).toThrow(
      'Invalid public web configuration: NEXT_PUBLIC_API_BASE_URL is required.',
    );
    expect(() => parsePublicWebConfig({ NEXT_PUBLIC_API_BASE_URL: '   ' })).toThrow(
      'Invalid public web configuration: NEXT_PUBLIC_API_BASE_URL is required.',
    );
  });

  it.each([
    ['a relative value', '/api'],
    ['a non-HTTP protocol', 'file:///tmp/status'],
    ['embedded credentials', 'https://user:password@api.example.test'],
    ['a path', 'https://api.example.test/private'],
    ['a query', 'https://api.example.test?debug=true'],
    ['a fragment', 'https://api.example.test/#debug'],
  ])('rejects %s', (_description, value) => {
    expect(() => parsePublicWebConfig({ NEXT_PUBLIC_API_BASE_URL: value })).toThrow(
      'Invalid public web configuration',
    );
  });

  it('does not echo an invalid configured value', () => {
    const unsafeValue = 'https://user:synthetic-password@api.example.test';

    expect(() => parsePublicWebConfig({ NEXT_PUBLIC_API_BASE_URL: unsafeValue })).toThrow(
      expect.not.objectContaining({ message: expect.stringContaining(unsafeValue) }),
    );
  });
});

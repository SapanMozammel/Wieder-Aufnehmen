export interface PublicWebConfig {
  readonly apiBaseUrl: string;
}

export interface RawPublicWebConfig {
  readonly NEXT_PUBLIC_API_BASE_URL?: string;
}

const CONFIG_ERROR_PREFIX = 'Invalid public web configuration';

function invalidConfig(reason: string): Error {
  return new Error(`${CONFIG_ERROR_PREFIX}: NEXT_PUBLIC_API_BASE_URL ${reason}.`);
}

/**
 * Parse the complete allowlist of values that may enter the browser bundle.
 * API credentials, server configuration, and arbitrary environment objects do
 * not belong at this boundary.
 */
export function parsePublicWebConfig(raw: RawPublicWebConfig): PublicWebConfig {
  const value = raw.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!value) {
    throw invalidConfig('is required');
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw invalidConfig('must be an absolute URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw invalidConfig('must use http or https');
  }

  if (url.username || url.password) {
    throw invalidConfig('must not contain credentials');
  }

  if (url.pathname !== '/' || url.search || url.hash) {
    throw invalidConfig('must be an origin without a path, query, or fragment');
  }

  return Object.freeze({ apiBaseUrl: url.origin });
}

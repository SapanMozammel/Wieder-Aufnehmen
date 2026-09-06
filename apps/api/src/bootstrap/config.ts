export type ApiMode = 'development' | 'test' | 'production';

export interface ApiConfig {
  readonly mode: ApiMode;
  readonly http: {
    readonly host: string;
    readonly port: number;
    readonly trustProxy: false;
    readonly jsonBodyLimitBytes: number;
    readonly applicationTimeoutMs: number;
    readonly headersTimeoutMs: number;
    readonly requestTimeoutMs: number;
    readonly keepAliveTimeoutMs: number;
    readonly maxHeaderSizeBytes: number;
    readonly maxRequestsPerSocket: number;
    readonly drainTimeoutMs: number;
    readonly mongoCloseTimeoutMs: number;
  };
  readonly cors: {
    readonly allowedOrigins: readonly string[];
    readonly allowedMethods: readonly ['GET', 'HEAD', 'OPTIONS'];
    readonly allowedHeaders: readonly ['Content-Type'];
    readonly exposedHeaders: readonly ['X-Request-Id'];
    readonly maxAgeSeconds: number;
  };
  readonly mongo: {
    readonly uri: string;
    readonly connectTimeoutMs: number;
    readonly serverSelectionTimeoutMs: number;
    readonly socketTimeoutMs: number;
    readonly waitQueueTimeoutMs: number;
    readonly pingTimeoutMs: number;
    readonly readinessTimeoutMs: number;
    readonly refreshIntervalMs: number;
    readonly snapshotMaxAgeMs: number;
    readonly maxPoolSize: number;
  };
  readonly publicStatusLimit: {
    readonly windowMs: number;
    readonly maxRequests: number;
    readonly maxConcurrent: number;
    readonly maxIdentities: number;
  };
}

export type RawEnvironment = Readonly<Record<string, string | undefined>>;

export class ConfigurationError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ConfigurationError';
  }
}

const DEVELOPMENT_MONGODB_URI =
  'mongodb://127.0.0.1:27018/aufnehmen_dev?replicaSet=rs0&directConnection=true';
const DEVELOPMENT_ORIGIN = 'http://127.0.0.1:3000';
const PLACEHOLDER = /^(?:change-?me|replace-?me|todo|example|<[^>]+>|your[-_].*)$/iu;
const EMBEDDED_PLACEHOLDER =
  /(?:^|[:/@?&=_-])(?:change-?me|replace-?me|todo|<[^>]+>|your[-_][a-z0-9_-]*)(?:$|[:/@?&=_-])/iu;

function readValue(environment: RawEnvironment, key: string): string | undefined {
  const value = environment[key]?.trim();
  return value ? value : undefined;
}

function parsePort(environment: RawEnvironment, mode: ApiMode): number {
  const raw = readValue(environment, 'PORT');
  if (!raw && mode !== 'production') return 4000;
  if (!raw) throw new ConfigurationError('PORT is required in production.');
  if (!/^\d{1,5}$/u.test(raw)) {
    throw new ConfigurationError('PORT must be an integer from 1 to 65535.');
  }
  const port = Number(raw);
  if (port < 1 || port > 65_535) {
    throw new ConfigurationError('PORT must be an integer from 1 to 65535.');
  }
  return port;
}

function parseHost(environment: RawEnvironment, mode: ApiMode): string {
  const host = readValue(environment, 'HOST');
  if (!host && mode !== 'production') return '127.0.0.1';
  if (!host) throw new ConfigurationError('HOST is required in production.');
  if (host.length > 253 || !/^[a-z0-9.:-]+$/iu.test(host)) {
    throw new ConfigurationError('HOST must be a valid IP address or DNS hostname.');
  }
  return host;
}

function parseOrigin(raw: string, mode: ApiMode): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ConfigurationError('CORS_ALLOWED_ORIGINS contains an invalid origin.');
  }

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.origin === 'null'
  ) {
    throw new ConfigurationError('CORS_ALLOWED_ORIGINS must contain origins only.');
  }
  if (mode === 'production') {
    // URL.hostname retains brackets around IPv6 and normalizes IPv4 spellings.
    const hostname = url.hostname.replace(/^\[|\]$/gu, '').replace(/\.$/u, '');
    const localHost =
      hostname === 'localhost' || /^127\.\d+\.\d+\.\d+$/u.test(hostname) || hostname === '::1';
    if (url.protocol !== 'https:' || localHost) {
      throw new ConfigurationError('CORS_ALLOWED_ORIGINS contains a production-unsafe origin.');
    }
  }
  return url.origin;
}

function parseOrigins(environment: RawEnvironment, mode: ApiMode): readonly string[] {
  const raw = readValue(environment, 'CORS_ALLOWED_ORIGINS');
  if (!raw && mode !== 'production') return Object.freeze([DEVELOPMENT_ORIGIN]);
  if (!raw) throw new ConfigurationError('CORS_ALLOWED_ORIGINS is required in production.');
  if (raw.includes('*')) {
    throw new ConfigurationError('CORS_ALLOWED_ORIGINS cannot contain a wildcard.');
  }

  const values = raw.split(',').map((value) => value.trim());
  if (values.some((value) => !value)) {
    throw new ConfigurationError('CORS_ALLOWED_ORIGINS contains an empty entry.');
  }
  const origins = values.map((value) => parseOrigin(value, mode));
  if (new Set(origins).size !== origins.length) {
    throw new ConfigurationError('CORS_ALLOWED_ORIGINS contains a duplicate origin.');
  }
  return Object.freeze(origins);
}

function parseTrustProxy(environment: RawEnvironment, mode: ApiMode): false {
  const raw = readValue(environment, 'TRUST_PROXY');
  if (!raw && mode !== 'production') return false;
  if (!raw) throw new ConfigurationError('TRUST_PROXY is required in production.');
  if (raw !== 'false') {
    throw new ConfigurationError(
      'TRUST_PROXY must be false until a deployment topology is approved.',
    );
  }
  return false;
}

function databaseName(uri: string): string | undefined {
  const withoutQuery = uri.split('?', 1)[0] ?? '';
  const authorityEnd = withoutQuery?.indexOf('://');
  if (authorityEnd === undefined || authorityEnd < 0) return undefined;
  const slash = withoutQuery.indexOf('/', authorityEnd + 3);
  if (slash < 0) return undefined;
  const name = withoutQuery.slice(slash + 1);
  return name || undefined;
}

function parseMongoUri(environment: RawEnvironment, mode: ApiMode): string {
  const configured = readValue(environment, 'MONGODB_URI');
  const uri = configured ?? (mode === 'development' ? DEVELOPMENT_MONGODB_URI : undefined);
  if (!uri) throw new ConfigurationError('MONGODB_URI is required.');
  if (PLACEHOLDER.test(uri) || EMBEDDED_PLACEHOLDER.test(uri) || /\s/u.test(uri)) {
    throw new ConfigurationError('MONGODB_URI is malformed or contains a placeholder.');
  }
  if (!/^mongodb(?:\+srv)?:\/\//u.test(uri) || !databaseName(uri)) {
    throw new ConfigurationError('MONGODB_URI must be a database-selecting MongoDB URI.');
  }
  if (uri.startsWith('mongodb://') && !/[?&]replicaSet=[^&]+/u.test(uri)) {
    throw new ConfigurationError('MONGODB_URI must identify a replica set.');
  }
  if (mode === 'production') {
    const unsafe =
      /(?:\/\/|,)\s*(?:[^@/,]+@)?(?:localhost|127\.0\.0\.1|\[?::1\]?)(?::|\/|,)/iu.test(uri) ||
      databaseName(uri) === 'aufnehmen_dev' ||
      /[?&]directConnection=true(?:&|$)/iu.test(uri);
    if (unsafe) throw new ConfigurationError('MONGODB_URI contains a production-unsafe setting.');
  }
  return uri;
}

export function parseApiMode(raw: string | undefined): ApiMode {
  const value = raw?.trim() || 'development';
  if (value === 'development' || value === 'test' || value === 'production') return value;
  throw new ConfigurationError('NODE_ENV must be development, test, or production.');
}

export function parseApiConfig(environment: RawEnvironment): ApiConfig {
  const mode = parseApiMode(environment['NODE_ENV']);
  const config: ApiConfig = {
    mode,
    http: Object.freeze({
      host: parseHost(environment, mode),
      port: parsePort(environment, mode),
      trustProxy: parseTrustProxy(environment, mode),
      jsonBodyLimitBytes: 16 * 1024,
      applicationTimeoutMs: 3_000,
      headersTimeoutMs: 5_000,
      requestTimeoutMs: 10_000,
      keepAliveTimeoutMs: 5_000,
      maxHeaderSizeBytes: 16 * 1024,
      maxRequestsPerSocket: 100,
      drainTimeoutMs: 8_000,
      mongoCloseTimeoutMs: 4_000,
    }),
    cors: Object.freeze({
      allowedOrigins: parseOrigins(environment, mode),
      allowedMethods: Object.freeze(['GET', 'HEAD', 'OPTIONS'] as const),
      allowedHeaders: Object.freeze(['Content-Type'] as const),
      exposedHeaders: Object.freeze(['X-Request-Id'] as const),
      maxAgeSeconds: 600,
    }),
    mongo: Object.freeze({
      uri: parseMongoUri(environment, mode),
      connectTimeoutMs: 2_000,
      serverSelectionTimeoutMs: 2_000,
      socketTimeoutMs: 5_000,
      waitQueueTimeoutMs: 1_000,
      pingTimeoutMs: 1_000,
      readinessTimeoutMs: 2_500,
      refreshIntervalMs: 5_000,
      snapshotMaxAgeMs: 10_000,
      maxPoolSize: 10,
    }),
    publicStatusLimit: Object.freeze({
      windowMs: 60_000,
      maxRequests: 60,
      maxConcurrent: 4,
      maxIdentities: 4_096,
    }),
  };
  return Object.freeze(config);
}

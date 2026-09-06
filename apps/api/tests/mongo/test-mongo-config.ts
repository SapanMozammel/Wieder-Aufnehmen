import { isIP } from 'node:net';
import type { RawEnvironment } from '../../src/bootstrap/config.js';
import { ConfigurationError } from '../../src/bootstrap/config.js';

const DEFAULT_TEST_URI = 'mongodb://127.0.0.1:27018/?replicaSet=rs0&directConnection=true';
const DEFAULT_MONGODB_PORT = 27_017;

export interface MongoTestConfig {
  readonly uri: string;
  readonly normalizedSeeds: readonly string[];
  readonly remote: boolean;
}

function normalizeHost(host: string): string {
  const normalized = host.toLowerCase();
  if (normalized === 'localhost') return normalized;
  if (isIP(normalized) !== 0) return normalized;
  if (
    normalized.length > 253 ||
    !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/u.test(normalized) ||
    normalized.includes('..')
  ) {
    throw new ConfigurationError('MONGODB_TEST_URI contains an invalid seed host.');
  }
  return normalized;
}

function normalizeSeed(raw: string, source: 'uri' | 'allowlist'): string {
  const value = raw.trim();
  if (!value || /[/*?\s]/u.test(value)) {
    throw new ConfigurationError(
      source === 'uri'
        ? 'MONGODB_TEST_URI contains an invalid seed.'
        : 'MONGODB_TEST_ALLOWED_HOSTS must contain exact hostname:port entries.',
    );
  }

  let host: string;
  let portSource: string | undefined;
  if (value.startsWith('[')) {
    const closingBracket = value.indexOf(']');
    if (closingBracket < 0) {
      throw new ConfigurationError('MONGODB_TEST_URI contains an invalid IPv6 seed.');
    }
    host = value.slice(1, closingBracket);
    const remainder = value.slice(closingBracket + 1);
    if (remainder && !remainder.startsWith(':')) {
      throw new ConfigurationError('MONGODB_TEST_URI contains an invalid IPv6 seed.');
    }
    portSource = remainder ? remainder.slice(1) : undefined;
  } else {
    const colon = value.lastIndexOf(':');
    if (colon >= 0) {
      if (value.indexOf(':') !== colon) {
        throw new ConfigurationError('MONGODB_TEST_URI IPv6 seeds must use brackets.');
      }
      host = value.slice(0, colon);
      portSource = value.slice(colon + 1);
    } else {
      host = value;
    }
  }

  if (source === 'allowlist' && portSource === undefined) {
    throw new ConfigurationError(
      'MONGODB_TEST_ALLOWED_HOSTS must contain exact hostname:port entries.',
    );
  }

  const normalizedHost = normalizeHost(host);
  const port = portSource === undefined ? DEFAULT_MONGODB_PORT : Number(portSource);
  if (
    (portSource !== undefined && !/^\d{1,5}$/u.test(portSource)) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65_535
  ) {
    throw new ConfigurationError('MONGODB_TEST_URI contains an invalid seed port.');
  }
  return isIP(normalizedHost) === 6 ? `[${normalizedHost}]:${port}` : `${normalizedHost}:${port}`;
}

function isLoopback(normalizedSeed: string): boolean {
  return /^(?:(?:localhost|127\.0\.0\.1):\d+|\[::1\]:\d+)$/u.test(normalizedSeed);
}

function parseUri(uri: string): {
  readonly seeds: readonly string[];
  readonly query: URLSearchParams;
} {
  if (uri.startsWith('mongodb+srv://')) {
    throw new ConfigurationError('MONGODB_TEST_URI does not support mongodb+srv targets.');
  }
  if (!uri.startsWith('mongodb://')) {
    throw new ConfigurationError('MONGODB_TEST_URI must use the mongodb:// scheme.');
  }
  if (/\s/u.test(uri)) throw new ConfigurationError('MONGODB_TEST_URI is malformed.');

  const remainder = uri.slice('mongodb://'.length);
  const slash = remainder.indexOf('/');
  if (slash < 0) {
    throw new ConfigurationError('MONGODB_TEST_URI must include an empty database path.');
  }
  const authority = remainder.slice(0, slash);
  if (!authority || authority.includes('@')) {
    throw new ConfigurationError('MONGODB_TEST_URI cannot contain credentials.');
  }
  const pathAndQuery = remainder.slice(slash + 1);
  const queryIndex = pathAndQuery.indexOf('?');
  const databasePath = queryIndex < 0 ? pathAndQuery : pathAndQuery.slice(0, queryIndex);
  if (databasePath) {
    throw new ConfigurationError('MONGODB_TEST_URI cannot select a database.');
  }
  const querySource = queryIndex < 0 ? '' : pathAndQuery.slice(queryIndex + 1);
  const query = new URLSearchParams(querySource);
  if (!query.get('replicaSet')?.trim()) {
    throw new ConfigurationError('MONGODB_TEST_URI must identify a replica set.');
  }
  const seeds = authority.split(',').map((seed) => normalizeSeed(seed, 'uri'));
  if (new Set(seeds).size !== seeds.length) {
    throw new ConfigurationError('MONGODB_TEST_URI contains a duplicate seed.');
  }
  return { seeds: Object.freeze(seeds), query };
}

function parseAllowedHosts(raw: string | undefined): ReadonlySet<string> {
  if (!raw?.trim()) {
    throw new ConfigurationError(
      'MONGODB_TEST_ALLOWED_HOSTS is required when remote test MongoDB is enabled.',
    );
  }
  const entries = raw.split(',').map((seed) => normalizeSeed(seed, 'allowlist'));
  if (new Set(entries).size !== entries.length) {
    throw new ConfigurationError('MONGODB_TEST_ALLOWED_HOSTS contains a duplicate entry.');
  }
  return new Set(entries);
}

export function parseMongoTestConfig(environment: RawEnvironment): MongoTestConfig {
  const uri = environment['MONGODB_TEST_URI']?.trim() || DEFAULT_TEST_URI;
  const { seeds, query } = parseUri(uri);
  const remote = seeds.some((seed) => !isLoopback(seed));
  if (remote) {
    if (environment['AUFNEHMEN_ALLOW_REMOTE_TEST_MONGODB'] !== 'true') {
      throw new ConfigurationError(
        'Remote MONGODB_TEST_URI requires AUFNEHMEN_ALLOW_REMOTE_TEST_MONGODB=true.',
      );
    }
    const allowed = parseAllowedHosts(environment['MONGODB_TEST_ALLOWED_HOSTS']);
    if (seeds.some((seed) => !allowed.has(seed))) {
      throw new ConfigurationError(
        'Every MONGODB_TEST_URI seed must exactly match MONGODB_TEST_ALLOWED_HOSTS.',
      );
    }
    const encryptionValues = [...query.getAll('tls'), ...query.getAll('ssl')];
    if (encryptionValues.length === 0 || encryptionValues.some((value) => value !== 'true')) {
      throw new ConfigurationError(
        'Remote MONGODB_TEST_URI requires explicit encrypted transport with tls=true.',
      );
    }
  }
  return Object.freeze({ uri, normalizedSeeds: seeds, remote });
}

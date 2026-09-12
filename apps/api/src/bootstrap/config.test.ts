import { readFile } from 'node:fs/promises';
import { describe, expect, it, vi } from 'vitest';
import { ConfigurationError, parseApiConfig } from './config.js';
import { loadApiConfig } from './load-config.js';

const TEST_MONGODB_URI =
  'mongodb://127.0.0.1:27017/aufnehmen_api_test?replicaSet=rs0&directConnection=true';

describe('parseApiConfig', () => {
  it('returns the exact safe development defaults as an immutable object', () => {
    const config = parseApiConfig({});

    expect(config.http).toMatchObject({
      host: '127.0.0.1',
      port: 4000,
      trustProxy: false,
      jsonBodyLimitBytes: 16_384,
      applicationTimeoutMs: 3_000,
      headersTimeoutMs: 5_000,
      requestTimeoutMs: 10_000,
      keepAliveTimeoutMs: 5_000,
      drainTimeoutMs: 8_000,
      mongoCloseTimeoutMs: 4_000,
    });
    expect(config.cors.allowedOrigins).toEqual(['http://127.0.0.1:3000']);
    expect(config.mongo.uri).toContain('/aufnehmen_dev?');
    expect(config.mongo.uri).toContain('127.0.0.1:27018/');
    expect(config.mongo).toMatchObject({
      serverSelectionTimeoutMs: 2_000,
      pingTimeoutMs: 1_000,
      readinessTimeoutMs: 2_500,
    });
    expect(config.mongo.connectTimeoutMs).toBeLessThan(config.mongo.readinessTimeoutMs);
    expect(config.mongo.serverSelectionTimeoutMs).toBeLessThan(config.mongo.readinessTimeoutMs);
    expect(config.mongo.pingTimeoutMs).toBeLessThan(config.mongo.readinessTimeoutMs);
    expect(config.mongo.readinessTimeoutMs).toBeLessThan(config.http.applicationTimeoutMs);
    expect(config.mongo.readinessTimeoutMs).toBeLessThan(config.http.mongoCloseTimeoutMs);
    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.http)).toBe(true);
    expect(Object.isFrozen(config.cors.allowedOrigins)).toBe(true);
  });

  it('accepts an explicit production-safe configuration', () => {
    const config = parseApiConfig({
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: '4000',
      TRUST_PROXY: 'false',
      CORS_ALLOWED_ORIGINS: 'https://app.aufnehmen.example',
      MONGODB_URI: 'mongodb+srv://aufnehmen.invalid/aufnehmen',
    });

    expect(config.mode).toBe('production');
    expect(config.cors.allowedOrigins).toEqual(['https://app.aufnehmen.example']);
  });

  it.each([
    [{ NODE_ENV: 'preview' }, 'NODE_ENV'],
    [{ PORT: '0' }, 'PORT'],
    [{ TRUST_PROXY: 'true' }, 'TRUST_PROXY'],
    [{ CORS_ALLOWED_ORIGINS: '*' }, 'CORS_ALLOWED_ORIGINS'],
    [{ CORS_ALLOWED_ORIGINS: 'http://127.0.0.1:3000/path' }, 'CORS_ALLOWED_ORIGINS'],
    [{ MONGODB_URI: 'mongodb://127.0.0.1:27017/aufnehmen_dev' }, 'MONGODB_URI'],
  ] as const)('rejects invalid input without echoing its value', (environment, key) => {
    expect(() => parseApiConfig(environment)).toThrow(ConfigurationError);
    try {
      parseApiConfig(environment);
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError);
      expect((error as Error).message).toContain(key);
      expect((error as Error).message).not.toContain(Object.values(environment)[0] ?? '');
    }
  });

  it('rejects implicit and local production settings', () => {
    const base = {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: '4000',
      TRUST_PROXY: 'false',
      CORS_ALLOWED_ORIGINS: 'https://app.aufnehmen.example',
      MONGODB_URI: 'mongodb+srv://aufnehmen.invalid/aufnehmen',
    } as const;

    expect(() => parseApiConfig({ ...base, CORS_ALLOWED_ORIGINS: undefined })).toThrow(
      /CORS_ALLOWED_ORIGINS/u,
    );
    expect(() => parseApiConfig({ ...base, MONGODB_URI: TEST_MONGODB_URI })).toThrow(
      /MONGODB_URI/u,
    );
  });

  it.each(['https://[::1]:3000', 'https://localhost.:3000', 'https://127.0.0.2:3000'])(
    'rejects equivalent loopback browser origins in production: %s',
    (origin) => {
      expect(() =>
        parseApiConfig({
          NODE_ENV: 'production',
          HOST: '0.0.0.0',
          PORT: '4000',
          TRUST_PROXY: 'false',
          CORS_ALLOWED_ORIGINS: origin,
          MONGODB_URI: 'mongodb+srv://database.invalid/application',
        }),
      ).toThrow(/production-unsafe origin/u);
    },
  );
});

describe('loadApiConfig', () => {
  it('accepts the committed example unchanged as a development local file', async () => {
    const example = await readFile(new URL('../../.env.example', import.meta.url), 'utf8');
    const config = await loadApiConfig({
      environment: { NODE_ENV: 'development' },
      readTextFile: async () => example,
    });

    expect(config.http.host).toBe('127.0.0.1');
    expect(config.http.port).toBe(4_000);
    expect(config.mongo.uri).toContain('/aufnehmen_dev?');
  });

  it('loads only development .env.local values, lets process values win, and parses once', async () => {
    const readTextFile = vi.fn(async () =>
      [
        'PORT=4100',
        'HOST=127.0.0.1',
        'TRUST_PROXY=false',
        'CORS_ALLOWED_ORIGINS=http://127.0.0.1:3001',
        `MONGODB_URI=${TEST_MONGODB_URI}`,
      ].join('\n'),
    );
    const onParse = vi.fn();

    const config = await loadApiConfig({
      environment: { NODE_ENV: 'development', PORT: '4200' },
      envFilePath: '/synthetic/apps/api/.env.local',
      readTextFile,
      onParse,
    });

    expect(config.http.port).toBe(4200);
    expect(config.cors.allowedOrigins).toEqual(['http://127.0.0.1:3001']);
    expect(readTextFile).toHaveBeenCalledOnce();
    expect(onParse).toHaveBeenCalledOnce();
  });

  it('does not read .env.local in test or production', async () => {
    const readTextFile = vi.fn(async () => 'PORT=9999');
    const testConfig = await loadApiConfig({
      environment: { NODE_ENV: 'test', MONGODB_URI: TEST_MONGODB_URI },
      readTextFile,
    });

    expect(testConfig.http.port).toBe(4000);
    expect(readTextFile).not.toHaveBeenCalled();
  });

  it('does not allow a local file to choose the environment', async () => {
    await expect(
      loadApiConfig({
        environment: { NODE_ENV: 'development' },
        readTextFile: async () => 'NODE_ENV=production',
      }),
    ).rejects.toThrow(/NODE_ENV/u);
  });
});

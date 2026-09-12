import { describe, expect, it } from 'vitest';
import { parseMongoTestConfig } from './test-mongo-config.js';

describe('Mongo integration target configuration', () => {
  it('uses the credential-free loopback default and never falls back to MONGODB_URI', () => {
    const config = parseMongoTestConfig({
      MONGODB_URI: 'mongodb://production.invalid/customer_data?replicaSet=production',
    });

    expect(config.uri).toBe('mongodb://127.0.0.1:27018/?replicaSet=rs0&directConnection=true');
    expect(config.normalizedSeeds).toEqual(['127.0.0.1:27018']);
    expect(config.remote).toBe(false);
  });

  it.each([
    'mongodb+srv://cluster.invalid/?replicaSet=rs0',
    'mongodb://user:secret@127.0.0.1:27017/?replicaSet=rs0',
    'mongodb://127.0.0.1:27017/shared_database?replicaSet=rs0',
    'mongodb://127.0.0.1:27017/',
    'https://127.0.0.1:27017/?replicaSet=rs0',
  ])('rejects an unsafe test URI: %s', (uri) => {
    expect(() => parseMongoTestConfig({ MONGODB_TEST_URI: uri })).toThrow();
  });

  it('rejects remote targets unless the opt-in and every exact normalized seed are present', () => {
    const uri =
      'mongodb://mongo-a.invalid:27017,mongo-b.invalid:27018/?replicaSet=rs-test&tls=true';

    expect(() => parseMongoTestConfig({ MONGODB_TEST_URI: uri })).toThrow(
      /AUFNEHMEN_ALLOW_REMOTE_TEST_MONGODB/u,
    );
    expect(() =>
      parseMongoTestConfig({
        MONGODB_TEST_URI: uri,
        AUFNEHMEN_ALLOW_REMOTE_TEST_MONGODB: 'true',
        MONGODB_TEST_ALLOWED_HOSTS: 'mongo-a.invalid:27017',
      }),
    ).toThrow(/exactly match/u);
    expect(
      parseMongoTestConfig({
        MONGODB_TEST_URI: uri,
        AUFNEHMEN_ALLOW_REMOTE_TEST_MONGODB: 'true',
        MONGODB_TEST_ALLOWED_HOSTS: 'MONGO-A.INVALID:27017,mongo-b.invalid:27018',
      }).normalizedSeeds,
    ).toEqual(['mongo-a.invalid:27017', 'mongo-b.invalid:27018']);
  });

  it('requires explicitly encrypted transport for an opted-in remote target', () => {
    const environment = {
      MONGODB_TEST_URI: 'mongodb://mongo-a.invalid:27017/?replicaSet=rs-test',
      AUFNEHMEN_ALLOW_REMOTE_TEST_MONGODB: 'true',
      MONGODB_TEST_ALLOWED_HOSTS: 'mongo-a.invalid:27017',
    } as const;

    expect(() => parseMongoTestConfig(environment)).toThrow(/tls=true/u);
    expect(
      parseMongoTestConfig({
        ...environment,
        MONGODB_TEST_URI: 'mongodb://mongo-a.invalid:27017/?replicaSet=rs-test&tls=true',
      }).remote,
    ).toBe(true);
  });

  it.each([
    '*.invalid:27017',
    '.invalid:27017',
    '10.0.0.0/8',
    'mongo-a.invalid',
    'mongo-a.invalid:27017,',
  ])('rejects non-exact remote allowlist entry: %s', (allowedHosts) => {
    expect(() =>
      parseMongoTestConfig({
        MONGODB_TEST_URI: 'mongodb://mongo-a.invalid:27017/?replicaSet=rs-test&tls=true',
        AUFNEHMEN_ALLOW_REMOTE_TEST_MONGODB: 'true',
        MONGODB_TEST_ALLOWED_HOSTS: allowedHosts,
      }),
    ).toThrow();
  });
});

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { parseApiConfig } from '../../src/bootstrap/config.js';
import { SILENT_LOGGER } from '../../src/shared/logging/api-logger.js';
import { createMongoReadinessOwner } from '../../src/shared/mongo/mongo-readiness-owner.js';
import {
  createMongoTestHarness,
  type MongoTestDatabase,
  type MongoTestHarness,
} from './mongo-test-harness.js';
import { parseMongoTestConfig } from './test-mongo-config.js';

const OWNERSHIP_COLLECTION = '__aufnehmen_test_ownership';
const OWNERSHIP_DOCUMENT_ID = 'aufnehmen-test-run';

interface OwnershipDocument {
  readonly _id: string;
  readonly runMarker: string;
}

describe('real replica-set Mongo lifecycle', () => {
  let harness: MongoTestHarness;
  let first: MongoTestDatabase;
  let second: MongoTestDatabase;

  beforeAll(async () => {
    const target = parseMongoTestConfig(process.env);
    harness = createMongoTestHarness({ config: target });
    await harness.connect();
    const worker = process.env['VITEST_POOL_ID'] ?? '0';
    first = await harness.createWorkerDatabase(`${worker}-first`);
    second = await harness.createWorkerDatabase(`${worker}-second`);
  });

  afterAll(async () => {
    await harness.close();
  });

  it('uses unique non-development databases against a real replica set', async () => {
    expect(first.name).not.toBe(second.name);
    expect(first.name).not.toBe('aufnehmen_dev');
    expect(second.name).not.toBe('aufnehmen_dev');
    expect(first.name).toMatch(/^aufnehmen_test_[a-f0-9]{32}_[a-f0-9]{8}$/u);

    const hello = await first.database.admin().command({ hello: 1 });
    expect(hello['setName']).toEqual(expect.any(String));

    await first.database.collection('__aufnehmen_test_probe').insertOne({ synthetic: true });
    expect(await first.database.collection('__aufnehmen_test_probe').countDocuments()).toBe(1);
    expect(await second.database.collection('__aufnehmen_test_probe').countDocuments()).toBe(0);
  });

  it('runs the production Mongo owner through connect, ping, cached readiness, and close', async () => {
    const config = parseApiConfig({ NODE_ENV: 'test', MONGODB_URI: first.uri });
    const owner = createMongoReadinessOwner({ config: config.mongo, logger: SILENT_LOGGER });

    expect((await owner.start()).availability).toBe('available');
    expect(owner.current().availability).toBe('available');
    expect((await owner.refresh()).availability).toBe('available');
    await owner.close();
    expect(owner.current().availability).toBe('unavailable');
  });

  it('refuses both an unregistered name and a mismatched on-database marker', async () => {
    await expect(harness.cleanupDatabase(`${first.name}_suffix`)).rejects.toThrow(/unregistered/u);

    const markers = first.database.collection<OwnershipDocument>(OWNERSHIP_COLLECTION);
    await markers.updateOne(
      { _id: OWNERSHIP_DOCUMENT_ID },
      { $set: { runMarker: '00000000000000000000000000000000' } },
    );
    try {
      await expect(harness.cleanupDatabase(first.name)).rejects.toThrow(/mismatched/u);
      expect(await markers.countDocuments({ _id: OWNERSHIP_DOCUMENT_ID })).toBe(1);
    } finally {
      await markers.updateOne(
        { _id: OWNERSHIP_DOCUMENT_ID },
        { $set: { runMarker: harness.runMarker } },
      );
    }
  });
});

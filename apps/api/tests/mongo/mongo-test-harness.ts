import { createHash, randomBytes } from 'node:crypto';
import { MongoClient, type Db } from 'mongodb';
import type { MongoTestConfig } from './test-mongo-config.js';

const OWNERSHIP_COLLECTION = '__aufnehmen_test_ownership';
const OWNERSHIP_DOCUMENT_ID = 'aufnehmen-test-run';

interface OwnershipDocument {
  readonly _id: string;
  readonly runMarker: string;
  readonly databaseName: string;
}

export interface MongoTestDatabase {
  readonly name: string;
  readonly uri: string;
  readonly database: Db;
}

export interface MongoTestHarness {
  readonly runMarker: string;
  connect(): Promise<void>;
  createWorkerDatabase(workerId: string): Promise<MongoTestDatabase>;
  cleanupDatabase(databaseName: string): Promise<void>;
  cleanup(): Promise<void>;
  close(): Promise<void>;
}

export interface CreateMongoTestHarnessOptions {
  readonly config: MongoTestConfig;
  readonly makeRunMarker?: () => string;
}

function uriForDatabase(baseUri: string, databaseName: string): string {
  const queryIndex = baseUri.indexOf('?');
  const beforeQuery = queryIndex < 0 ? baseUri : baseUri.slice(0, queryIndex);
  const query = queryIndex < 0 ? '' : baseUri.slice(queryIndex);
  return `${beforeQuery}${databaseName}${query}`;
}

function workerHash(workerId: string): string {
  return createHash('sha256').update(workerId).digest('hex').slice(0, 8);
}

function defaultRunMarker(): string {
  return randomBytes(16).toString('hex');
}

export function createMongoTestHarness(options: CreateMongoTestHarnessOptions): MongoTestHarness {
  const runMarker = (options.makeRunMarker ?? defaultRunMarker)();
  if (!/^[a-f0-9]{32}$/u.test(runMarker)) {
    throw new Error('The Mongo test run marker must be 128 bits encoded as lowercase hexadecimal.');
  }
  const client = new MongoClient(options.config.uri, {
    connectTimeoutMS: 2_000,
    serverSelectionTimeoutMS: 2_000,
    socketTimeoutMS: 5_000,
    waitQueueTimeoutMS: 1_000,
    maxPoolSize: 10,
    minPoolSize: 0,
  });
  const ownedDatabases = new Map<string, OwnershipDocument>();
  let connected = false;
  let closed = false;

  const connect = async (): Promise<void> => {
    if (closed) throw new Error('The Mongo test harness is closed.');
    if (connected) return;
    await client.connect();
    connected = true;
  };

  const createWorkerDatabase = async (workerId: string): Promise<MongoTestDatabase> => {
    await connect();
    const name = `aufnehmen_test_${runMarker}_${workerHash(workerId)}`;
    if (ownedDatabases.has(name)) {
      throw new Error('A test database has already been created for this worker.');
    }
    const database = client.db(name);
    const marker: OwnershipDocument = {
      _id: OWNERSHIP_DOCUMENT_ID,
      runMarker,
      databaseName: name,
    };
    const existing = await database
      .collection<OwnershipDocument>(OWNERSHIP_COLLECTION)
      .findOne({ _id: OWNERSHIP_DOCUMENT_ID });
    if (existing) throw new Error('Refusing to claim an existing MongoDB test database.');
    await database.collection<OwnershipDocument>(OWNERSHIP_COLLECTION).insertOne(marker);
    ownedDatabases.set(name, marker);
    return Object.freeze({
      name,
      uri: uriForDatabase(options.config.uri, name),
      database,
    });
  };

  const cleanupDatabase = async (databaseName: string): Promise<void> => {
    const expected = ownedDatabases.get(databaseName);
    if (!expected) {
      throw new Error('Refusing to drop an unregistered MongoDB test database.');
    }
    const database = client.db(databaseName);
    const actual = await database
      .collection<OwnershipDocument>(OWNERSHIP_COLLECTION)
      .findOne({ _id: OWNERSHIP_DOCUMENT_ID });
    if (
      actual?.runMarker !== expected.runMarker ||
      actual.databaseName !== expected.databaseName ||
      database.databaseName !== expected.databaseName
    ) {
      throw new Error(
        'Refusing to drop a MongoDB test database with a mismatched ownership marker.',
      );
    }
    await database.dropDatabase();
    ownedDatabases.delete(databaseName);
  };

  const cleanup = async (): Promise<void> => {
    for (const databaseName of [...ownedDatabases.keys()]) await cleanupDatabase(databaseName);
  };

  const close = async (): Promise<void> => {
    if (closed) return;
    closed = true;
    try {
      await cleanup();
    } finally {
      await client.close(true);
    }
  };

  return Object.freeze({
    runMarker,
    connect,
    createWorkerDatabase,
    cleanupDatabase,
    cleanup,
    close,
  });
}

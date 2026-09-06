import { describe, expect, it } from 'vitest';
import { checkSource, validateImport } from './check-architecture.js';

describe('workspace architecture', () => {
  it('permits contracts through their public entry point', () => {
    expect(validateImport('apps/web/src/lib/api.ts', '@aufnehmen/contracts')).toBeUndefined();
  });
  it('permits the runtime-neutral shared clock port from application code', () => {
    expect(
      validateImport(
        'apps/api/src/modules/system/application/get-system-status.ts',
        '../../../shared/clock.js',
      ),
    ).toBeUndefined();
  });
  it.each([
    ['apps/web/src/lib/api.ts', '../../../api/src/bootstrap/main.js'],
    ['apps/web/src/lib/api.ts', 'mongodb'],
    ['apps/web/src/lib/api.ts', 'node:fs'],
    ['packages/contracts/src/status.ts', '@aufnehmen/testing'],
    ['apps/api/src/modules/health/application/service.ts', '../infrastructure/repository.js'],
    [
      'apps/api/src/modules/system/application/get-system-status.ts',
      '../../../shared/mongo/mongo-readiness-owner.js',
    ],
    [
      'apps/api/src/modules/system/domain/system.ts',
      '../../../shared/mongo/mongo-readiness-owner.js',
    ],
    ['apps/api/src/modules/health/domain/health.ts', 'express'],
    ['apps/api/src/modules/health/domain/health.ts', 'next'],
    ['apps/api/src/modules/health/application/service.ts', 'react'],
    ['apps/api/src/modules/health/application/service.ts', 'new-provider-sdk'],
    ['packages/contracts/src/status.ts', 'next'],
    ['packages/contracts/src/status.ts', 'react'],
    ['apps/api/src/modules/health/application/service.ts', '../../users/application/service.js'],
    ['apps/web/src/lib/api.ts', '@aufnehmen/contracts/src/status'],
  ])('rejects %s -> %s', (file, specifier) => {
    expect(validateImport(file, specifier)).toBeDefined();
  });
  it('inspects re-exports and dynamic imports without treating text as executable imports', () => {
    const issues = checkSource(
      'apps/web/src/page.ts',
      `export { x } from 'mongodb'; import('node:fs'); const note = "require('express')";`,
    );
    expect(issues).toHaveLength(2);
  });
  it('rejects computed loading that conceals a dependency', () => {
    expect(checkSource('apps/api/src/modules/a/domain/x.ts', 'import(providerName)')).toHaveLength(
      1,
    );
  });
  it('enforces boundaries for import types as well as runtime imports', () => {
    expect(
      checkSource(
        'packages/contracts/src/schema.ts',
        "type Client = import('mongodb').MongoClient",
      ),
    ).toHaveLength(1);
  });
});

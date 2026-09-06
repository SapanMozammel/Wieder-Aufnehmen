import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { runOpenApiCli } from './openapi.js';

const temporaryDirectories: string[] = [];

function temporaryArtifactPath(): string {
  const directory = mkdtempSync(join(tmpdir(), 'aufnehmen-openapi-'));
  temporaryDirectories.push(directory);
  return join(directory, 'nested', 'openapi.json');
}

afterEach(() => {
  vi.restoreAllMocks();
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('OpenAPI filesystem command', () => {
  it('runs the public command in a source-only checkout with no contracts build artifacts', () => {
    const root = resolve(import.meta.dirname, '../..');
    const checkout = mkdtempSync(join(tmpdir(), 'aufnehmen-openapi-source-'));
    temporaryDirectories.push(checkout);
    for (const relative of [
      'package.json',
      'tsconfig.base.json',
      'tooling/tsconfig.json',
      'tooling/api/run-openapi.mjs',
      'tooling/api/openapi.ts',
      'packages/contracts/package.json',
      'packages/contracts/src',
    ]) {
      const target = join(checkout, relative);
      mkdirSync(dirname(target), { recursive: true });
      cpSync(join(root, relative), target, { recursive: true });
    }
    // Reuse installed dependencies only; deliberately omit workspace dist output.
    for (const relative of ['node_modules', 'packages/contracts/node_modules']) {
      symlinkSync(join(root, relative), join(checkout, relative), 'dir');
    }

    expect(existsSync(join(checkout, 'packages/contracts/dist'))).toBe(false);
    for (const mode of ['write', 'check']) {
      const result = spawnSync(process.execPath, ['tooling/api/run-openapi.mjs', mode], {
        cwd: checkout,
        encoding: 'utf8',
        timeout: 10_000,
      });
      expect(result.error).toBeUndefined();
      expect(result.status, result.stderr).toBe(0);
    }
    expect(readFileSync(join(checkout, 'docs/api/openapi.json'), 'utf8')).toContain(
      'Aufnehmen API',
    );
    expect(existsSync(join(checkout, 'packages/contracts/dist'))).toBe(false);
  });

  it('writes explicitly and then validates without changing the artifact', () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const artifactPath = temporaryArtifactPath();

    expect(runOpenApiCli('write', artifactPath)).toBe(0);
    expect(existsSync(artifactPath)).toBe(true);
    const written = readFileSync(artifactPath, 'utf8');

    expect(runOpenApiCli('check', artifactPath)).toBe(0);
    expect(readFileSync(artifactPath, 'utf8')).toBe(written);
  });

  it('reports missing artifacts and unsupported modes without writing', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const artifactPath = temporaryArtifactPath();

    expect(runOpenApiCli('check', artifactPath)).toBe(1);
    expect(runOpenApiCli('unknown', artifactPath)).toBe(2);
    expect(existsSync(artifactPath)).toBe(false);
  });
});

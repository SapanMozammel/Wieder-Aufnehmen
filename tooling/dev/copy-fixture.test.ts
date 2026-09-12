import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { includeDevelopmentPath } from './copy-fixture.js';

const fixtures: string[] = [];
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe('isolated development fixture boundary', () => {
  it.each(['.envrc', '.ENV.local', '.env', '.env.production', '.ENV.example'])(
    'excludes local environment file %s',
    async (name) => {
      expect(await includeDevelopmentPath('/project', `/project/apps/api/${name}`)).toBe(false);
    },
  );

  it('rejects symlinks that could write outside the fixture while retaining internal dependency links', async () => {
    const parent = await mkdtemp(join(tmpdir(), 'aufnehmen-copy-check-'));
    fixtures.push(parent);
    const root = join(parent, 'project');
    await mkdir(root);
    await writeFile(join(parent, 'outside.ts'), 'export const synthetic = true;');
    await writeFile(join(root, 'inside.ts'), 'export const synthetic = true;');
    await symlink('../outside.ts', join(root, 'escape.ts'));
    await symlink(join(root, 'inside.ts'), join(root, 'absolute.ts'));
    await symlink('./inside.ts', join(root, 'relative.ts'));
    await expect(includeDevelopmentPath(root, join(root, 'escape.ts'))).rejects.toThrow(/symlink/u);
    await expect(includeDevelopmentPath(root, join(root, 'absolute.ts'))).rejects.toThrow(
      /symlink/u,
    );
    expect(await includeDevelopmentPath(root, join(root, 'relative.ts'))).toBe(true);
  });
});

import { constants } from 'node:fs';
import { cp, lstat, readlink, realpath } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

function outside(root: string, path: string): boolean {
  const target = relative(root, path);
  return target === '..' || target.startsWith(`..${sep}`) || isAbsolute(target);
}

export async function includeDevelopmentPath(root: string, path: string): Promise<boolean> {
  const name = relative(root, path).split(sep).join('/');
  if (
    name.split('/').some((part) => /^\.env/iu.test(part) && part !== '.env.example') ||
    /(?:^|\/)(?:apps|packages)\/[^/]+\/(?:dist|\.next)(?:\/|$)/u.test(name) ||
    /(?:^|\/)node_modules\/(?:\.cache|\.vite|\.vite-temp)(?:\/|$)/u.test(name)
  )
    return false;
  if ((await lstat(path)).isSymbolicLink()) {
    const link = await readlink(path);
    if (
      isAbsolute(link) ||
      outside(root, resolve(dirname(path), link)) ||
      outside(await realpath(root), await realpath(path))
    ) {
      throw new Error('Development fixture cannot copy an absolute or escaping symlink.');
    }
  }
  return true;
}

export async function copyDevelopmentFixture(root: string, fixture: string): Promise<void> {
  // Keep dependencies in the copy so both consumers resolve and watch fixture
  // source. Use filesystem clones when supported, ordinary copies otherwise.
  for (const entry of [
    'apps',
    'packages',
    'tooling',
    'node_modules',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'tsconfig.base.json',
  ]) {
    await cp(join(root, entry), join(fixture, entry), {
      recursive: true,
      verbatimSymlinks: true,
      mode: constants.COPYFILE_FICLONE,
      filter: (path) => includeDevelopmentPath(root, path),
    });
  }
}

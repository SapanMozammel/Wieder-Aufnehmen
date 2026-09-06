import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RUNTIME = { node: '24.20.0', pnpm: '11.25.0' } as const;

export function checkConfiguration(root: string): string[] {
  const issues: string[] = [];
  for (const file of [
    '.editorconfig',
    '.npmrc',
    '.nvmrc',
    '.node-version',
    '.prettierrc',
    '.prettierignore',
    'eslint.config.mjs',
    'pnpm-workspace.yaml',
    'pnpm-lock.yaml',
    'tsconfig.base.json',
  ]) {
    if (!existsSync(resolve(root, file))) issues.push(`${file} is required.`);
  }
  const manifest: unknown = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  if (!manifest || typeof manifest !== 'object')
    return [...issues, 'package.json must contain an object.'];
  if (!('packageManager' in manifest) || manifest.packageManager !== `pnpm@${RUNTIME.pnpm}`)
    issues.push('package.json must pin the supported pnpm version.');
  for (const file of ['.nvmrc', '.node-version']) {
    if (
      existsSync(resolve(root, file)) &&
      readFileSync(resolve(root, file), 'utf8').trim() !== RUNTIME.node
    )
      issues.push(`${file} must pin Node ${RUNTIME.node}.`);
  }
  if (
    existsSync(resolve(root, '.npmrc')) &&
    !/^engine-strict=true$/mu.test(readFileSync(resolve(root, '.npmrc'), 'utf8'))
  )
    issues.push('.npmrc must enforce engines.');
  return issues;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const issues = checkConfiguration(process.cwd());
  for (const issue of issues) console.error(issue);
  if (issues.length) process.exitCode = 1;
  else console.log('Runtime and root configuration passed.');
}

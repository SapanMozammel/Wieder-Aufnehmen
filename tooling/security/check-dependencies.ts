import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const sections = ['dependencies', 'devDependencies', 'optionalDependencies'] as const;
type Manifest = { readonly name: string } & Partial<
  Record<(typeof sections)[number], Record<string, string>>
>;
interface Lockfile {
  readonly importers?: Record<
    string,
    Partial<
      Record<
        (typeof sections)[number],
        Record<string, { readonly specifier: string; readonly version: string }>
      >
    >
  >;
}

export function checkDependencyPolicy(root: string): string[] {
  const paths = [
    'package.json',
    ...['apps', 'packages'].flatMap((directory) => {
      if (!existsSync(resolve(root, directory))) return [];
      return readdirSync(resolve(root, directory), { withFileTypes: true })
        .filter(
          (entry) =>
            entry.isDirectory() && existsSync(resolve(root, directory, entry.name, 'package.json')),
        )
        .map((entry) => `${directory}/${entry.name}/package.json`);
    }),
  ];
  const manifests = paths.map((file) => ({
    file,
    value: JSON.parse(readFileSync(resolve(root, file), 'utf8')) as Manifest,
  }));
  const names = new Set(manifests.map(({ value }) => value.name));
  const lock = parse(readFileSync(resolve(root, 'pnpm-lock.yaml'), 'utf8')) as Lockfile;
  const issues: string[] = [];
  for (const { file, value } of manifests) {
    for (const section of sections) {
      for (const [name, specifier] of Object.entries(value[section] ?? {})) {
        const local = names.has(name);
        if (local ? specifier !== 'workspace:*' : !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/u.test(specifier))
          issues.push(
            `${file}: ${name} must use ${local ? 'workspace:*' : 'an exact registry version'}.`,
          );
        const locked = lock.importers?.[dirname(file)]?.[section]?.[name];
        if (locked?.specifier !== specifier || typeof locked?.version !== 'string')
          issues.push(`${file}: ${name} is not reconciled with the lockfile.`);
        else if (local && !locked.version.startsWith('link:'))
          issues.push(`${file}: ${name} must resolve to a workspace link.`);
      }
    }
  }
  return issues;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const issues = checkDependencyPolicy(process.cwd());
  for (const issue of issues) console.error(issue);
  if (issues.length) process.exitCode = 1;
  else console.log('Direct dependency pins and lockfile importers passed.');
}

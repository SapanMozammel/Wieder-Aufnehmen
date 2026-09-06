import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const root = process.cwd();
const ignored = new Set([
  '.git',
  'node_modules',
  '.next',
  'dist',
  'coverage',
  'runtime',
  'workflow',
  'test-results',
]);
function markdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return ignored.has(entry.name) ? [] : markdownFiles(path);
    return entry.isFile() && entry.name.endsWith('.md') ? [path] : [];
  });
}
let issues = 0;
for (const file of markdownFiles(root)) {
  let fence: string | undefined;
  for (const [index, line] of readFileSync(file, 'utf8').split(/\r?\n/u).entries()) {
    const marker = line.match(/^\s*(```+|~~~+)/u)?.[1]?.[0];
    if (marker) {
      fence = fence === marker ? undefined : (fence ?? marker);
      continue;
    }
    if (fence) continue;
    for (const match of line.replace(/`[^`]*`/gu, '').matchAll(/!?\[[^\]]*\]\(([^)]+)\)/gu)) {
      const raw = match[1]?.replace(/^<|>$/gu, '').split(/\s+/u)[0];
      if (!raw || /^(?:[a-z][a-z\d+.-]*:|#|\/\/)/iu.test(raw)) continue;
      let target: string;
      try {
        target = decodeURIComponent(raw.split('#')[0]?.split('?')[0] ?? '');
      } catch {
        target = raw;
      }
      if (!existsSync(resolve(dirname(file), target))) {
        console.error(`${relative(root, file)}:${index + 1}: missing local link ${target}`);
        issues += 1;
      }
    }
  }
}
if (issues) process.exitCode = 1;
else console.log('Local Markdown link destinations passed.');

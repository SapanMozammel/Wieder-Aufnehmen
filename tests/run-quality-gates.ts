import { spawnSync } from 'node:child_process';
import { createPnpmCommand } from '../tooling/shared/pnpm-command.js';

const mode = process.argv[2];
if (mode !== 'quick' && mode !== 'all') throw new Error('Quality gate mode must be quick or all.');
const manager = process.env.npm_execpath;
if (!manager) throw new Error('Run quality gates through pnpm run.');

const quick = [
  'tooling:check',
  'config:check',
  'docs:check',
  'arch:check',
  'api:openapi:check',
  'format:check',
  'lint',
  'typecheck',
  'test',
  'security:secrets',
  'security:dependency-policy',
];
const gates =
  mode === 'all'
    ? [
        ...quick,
        'build:api',
        'build:web',
        'test:integration',
        'test:e2e',
        'security:dependency-audit',
      ]
    : quick;
for (const gate of gates) {
  console.log(`Running ${gate}`);
  const command = createPnpmCommand(manager, ['run', gate]);
  const result = spawnSync(command.executable, command.args, {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    console.error(
      `Quality gate failed: ${gate}${result.error ? ` (${result.error.message})` : ''}`,
    );
    process.exit(result.status ?? 1);
  }
}
console.log(`${gates.length} quality gates passed (${mode}).`);

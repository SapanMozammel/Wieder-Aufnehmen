#!/usr/bin/env node
import { check } from './workflow.mjs';
try {
  if (process.argv.length !== 2 && (process.argv.length !== 4 || process.argv[2] !== '--root'))
    throw new Error('Usage: node .ai/tools/check.mjs [--root /absolute/project]');
  process.stdout.write(JSON.stringify(check(process.argv[3] ?? process.cwd()), null, 2) + '\n');
} catch (error) {
  process.stderr.write('workflow: ' + error.message + '\n');
  process.exitCode = 1;
}

import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('shared workspace resolution', () => {
  it.each(['contracts', 'testing'])('uses source only in development for %s', (name) => {
    for (const development of [false, true]) {
      const result = spawnSync(
        process.execPath,
        [
          ...(development ? ['--conditions=development'] : []),
          '--input-type=module',
          '--eval',
          `console.log(import.meta.resolve('@aufnehmen/${name}'))`,
        ],
        {
          cwd: resolve(import.meta.dirname, '../../apps/api'),
          env: { ...process.env, NODE_OPTIONS: '' },
          encoding: 'utf8',
          timeout: 5_000,
        },
      );
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout.trim()).toContain(
        `/packages/${name}/${development ? 'src/index.ts' : 'dist/index.js'}`,
      );
    }
  });
});

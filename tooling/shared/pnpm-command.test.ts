import { describe, expect, it } from 'vitest';
import { createPnpmCommand } from './pnpm-command.js';

describe('pnpm launch command', () => {
  it.each(['pnpm', '/opt/tools/pnpm', '/opt/tool path/pnpm', 'C:\\tools\\pnpm.exe'])(
    'executes native manager %s directly',
    (manager) => {
      expect(createPnpmCommand(manager, ['run', 'test'])).toEqual({
        executable: manager,
        args: ['run', 'test'],
      });
    },
  );

  it.each(['/tools/pnpm.cjs', '/tools/pnpm.mjs', '/tools/pnpm.js'])(
    'runs JavaScript manager %s through the current Node runtime',
    (manager) => {
      expect(createPnpmCommand(manager, ['run', 'test'])).toEqual({
        executable: process.execPath,
        args: [manager, 'run', 'test'],
      });
    },
  );

  it.each([undefined, '', ' '])('rejects missing manager %j', (manager) => {
    expect(() => createPnpmCommand(manager, ['run', 'test'])).toThrow(/pnpm run/);
  });

  it('preserves argument boundaries without composing a shell command', () => {
    const args = ['--filter', 'package with spaces', 'run', 'check;not-a-shell-command'];
    expect(createPnpmCommand('/tool path/pnpm', args)).toEqual({
      executable: '/tool path/pnpm',
      args,
    });
  });
});

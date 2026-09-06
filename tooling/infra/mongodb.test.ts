import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  commandPlan,
  describeCommandFailure,
  parseComposeProjectName,
  runSynchronousCommand,
  type CommandResult,
} from './mongodb';

const ROOT = resolve(import.meta.dirname, '../..');
const COMPOSE_FILE = resolve(ROOT, 'infra/compose.yaml');
const COMPOSE_SOURCE = readFileSync(COMPOSE_FILE, 'utf8');

function timedOutResult(timeoutMs: number): CommandResult {
  return {
    status: null,
    error: Object.assign(new Error('spawn timed out'), { code: 'ETIMEDOUT' }),
    stdout: '',
    stderr: '',
    timedOut: true,
    timeoutMs,
  };
}

describe('MongoDB infrastructure command contract', () => {
  it('starts only the bounded MongoDB service', () => {
    expect(commandPlan('up', {})).toMatchObject({
      executable: 'docker',
      cwd: ROOT,
      preservesData: true,
      timeoutMs: 180_000,
      args: expect.arrayContaining([COMPOSE_FILE, 'up', '--detach', 'mongodb']),
    });
  });

  it('uses a read-only service-status command', () => {
    const plan = commandPlan('status', {});
    expect(plan.timeoutMs).toBe(10_000);
    expect(plan.args).toEqual([
      'compose',
      '--project-name',
      'aufnehmen',
      '--file',
      COMPOSE_FILE,
      'ps',
      '--status',
      'running',
      '--services',
    ]);
  });

  it('never deletes the named development volume during normal shutdown', () => {
    const plan = commandPlan('down', {});
    expect(plan.preservesData).toBe(true);
    expect(plan.timeoutMs).toBe(45_000);
    expect(plan.args).not.toContain('--volumes');
    expect(plan.args).not.toContain('-v');
  });

  it('isolates another checkout with an explicit project name and project-scoped volumes', () => {
    const plan = commandPlan('up', { AUFNEHMEN_COMPOSE_PROJECT: 'aufnehmen-foundation-test' });
    expect(plan.args).toContain('aufnehmen-foundation-test');
    expect(COMPOSE_SOURCE).toContain('${AUFNEHMEN_COMPOSE_PROJECT:-aufnehmen}');
    expect(COMPOSE_SOURCE).toContain('${MONGODB_PORT:-27018}');
    expect(COMPOSE_SOURCE).not.toMatch(/^\s+name:/mu);
  });

  it.each(['../another-project', '--project-name', 'NAME', '', 'x'.repeat(64)])(
    'rejects malformed Compose project names without echoing them: %s',
    (name) => {
      expect(() => parseComposeProjectName(name)).toThrow(/AUFNEHMEN_COMPOSE_PROJECT/u);
    },
  );

  it('reports Compose health only after rs0 has a writable primary', () => {
    expect(COMPOSE_SOURCE).toContain('db.hello().isWritablePrimary === true');
    expect(COMPOSE_SOURCE).not.toContain('db.adminCommand({ ping: 1 })');
  });

  it('terminates a blocked child process at its explicit timeout', () => {
    const result = runSynchronousCommand(
      process.execPath,
      ['--eval', "process.on('SIGTERM', () => undefined); setInterval(() => undefined, 60_000)"],
      { cwd: ROOT, timeoutMs: 100 },
    );

    expect(result.timedOut).toBe(true);
    expect(result.status).toBeNull();
    expect(describeCommandFailure('Test child process', result)).toBe(
      'Test child process timed out after 100ms.',
    );
  });

  it('formats timeout errors deterministically without child-process output', () => {
    const result = timedOutResult(5_000);
    expect(describeCommandFailure('MongoDB ping check', result)).toBe(
      'MongoDB ping check timed out after 5s.',
    );
  });
});

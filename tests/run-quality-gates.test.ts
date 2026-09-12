import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { spawnSync } = vi.hoisted(() => ({ spawnSync: vi.fn() }));
vi.mock('node:child_process', () => ({ spawnSync }));

const originalArguments = process.argv;
const successful = { status: 0 };

describe('quality gate launcher', () => {
  beforeEach(() => {
    vi.resetModules();
    spawnSync.mockReset().mockReturnValue(successful);
    process.argv = [process.execPath, 'tests/run-quality-gates.ts', 'quick'];
    vi.stubEnv('npm_execpath', 'pnpm');
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.argv = originalArguments;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('executes the native pnpm command directly rather than treating it as a Node script', async () => {
    await import('./run-quality-gates.js');
    expect(spawnSync).toHaveBeenNthCalledWith(1, 'pnpm', ['run', 'tooling:check'], {
      stdio: 'inherit',
      env: process.env,
    });
    expect(spawnSync).toHaveBeenCalledTimes(11);
  });

  it('stops at the first failed gate and propagates its exit status', async () => {
    spawnSync.mockReturnValueOnce(successful).mockReturnValueOnce({ status: 7 });
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('quality gate exited');
    });
    await expect(import('./run-quality-gates.js')).rejects.toThrow('quality gate exited');
    expect(exit).toHaveBeenCalledWith(7);
    expect(spawnSync).toHaveBeenCalledTimes(2);
  });

  it('reports an unsuccessful spawn as failure without running later gates', async () => {
    spawnSync.mockReturnValue({ status: null, error: new Error('executable unavailable') });
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('quality gate exited');
    });
    await expect(import('./run-quality-gates.js')).rejects.toThrow('quality gate exited');
    expect(exit).toHaveBeenCalledWith(1);
    expect(spawnSync).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      'Quality gate failed: tooling:check (executable unavailable)',
    );
  });
});

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { chromium, expect } from '@playwright/test';
import { createPnpmCommand } from '../tooling/shared/pnpm-command.js';
import { copyDevelopmentFixture } from '../tooling/dev/copy-fixture.js';

const root = resolve(import.meta.dirname, '..');
const manager = process.env.npm_execpath;
if (!manager) throw new Error('Run the development refresh check through pnpm run.');

async function reservePort() {
  const server = createServer((socket) => socket.destroy());
  await new Promise<void>((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  assert(address && typeof address !== 'string');
  return {
    port: address.port,
    close: () => new Promise<void>((resolveClose) => server.close(() => resolveClose())),
  };
}

async function eventually(check: () => Promise<boolean>, label: string, timeoutMs = 45_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return;
    await wait(2_000);
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

async function hasVersion(origin: string, version: string): Promise<boolean> {
  try {
    const response = await fetch(`${origin}/v1/system/status`, {
      signal: AbortSignal.timeout(1_000),
    });
    const value: unknown = await response.json();
    return (
      response.ok &&
      typeof value === 'object' &&
      value !== null &&
      'contractVersion' in value &&
      value.contractVersion === version
    );
  } catch {
    return false;
  }
}

const fixture = await mkdtemp(join(tmpdir(), 'aufnehmen-dev-refresh-'));
const reservations = await Promise.all([reservePort(), reservePort(), reservePort()]);
const [apiPort, webPort, mongoPort] = reservations.map(({ port }) => port);
assert(apiPort && webPort && mongoPort);
const apiOrigin = `http://127.0.0.1:${apiPort}`;
const webOrigin = `http://127.0.0.1:${webPort}`;
let stopServices: (() => Promise<void>) | undefined;
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
let output = '';
let cleanupRun: Promise<void> | undefined;

function cleanup(): Promise<void> {
  cleanupRun ??= (async () => {
    const outcomes = await Promise.allSettled([
      browser?.close(),
      stopServices?.(),
      ...reservations.map(({ close }) => close()),
    ]);
    await rm(fixture, { recursive: true, force: true });
    const failures = outcomes.filter((outcome) => outcome.status === 'rejected');
    if (failures.length) throw new AggregateError(failures, 'Development fixture cleanup failed.');
  })();
  return cleanupRun;
}

function stopForSignal(code: number): void {
  void cleanup().then(
    () => process.exit(code),
    () => {
      console.error('Development fixture cleanup failed during interruption.');
      process.exit(1);
    },
  );
}
const interrupt = (): void => stopForSignal(130);
const terminate = (): void => stopForSignal(143);

try {
  console.log('Preparing an isolated development checkout with installed dependencies.');
  await copyDevelopmentFixture(root, fixture);
  // The harness owns cancellation so Playwright cannot exit the parent before
  // the application supervisor and temporary checkout have been cleaned up.
  browser = await chromium.launch({ handleSIGINT: false, handleSIGTERM: false });
  await Promise.all(reservations.slice(0, 2).map(({ close }) => close()));
  const command = createPnpmCommand(manager, ['run', 'dev']);
  const child = spawn(command.executable, command.args, {
    cwd: fixture,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      NEXT_TELEMETRY_DISABLED: '1',
      HOST: '127.0.0.1',
      PORT: String(apiPort),
      WEB_PORT: String(webPort),
      NEXT_PUBLIC_API_BASE_URL: apiOrigin,
      CORS_ALLOWED_ORIGINS: webOrigin,
      MONGODB_URI: `mongodb://127.0.0.1:${mongoPort}/aufnehmen_dev_refresh?replicaSet=rs0&directConnection=true`,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
  });
  let spawnError: Error | undefined;
  let closed = false;
  const exited = new Promise<void>((resolveExit) => {
    child.once('error', (error) => {
      spawnError = error;
    });
    child.once('close', () => {
      closed = true;
      resolveExit();
    });
  });
  for (const stream of [child.stdout, child.stderr]) {
    stream.setEncoding('utf8');
    stream.on('data', (chunk: string) => {
      output = `${output}${chunk}`.slice(-20_000);
    });
  }
  const signalChild = (signal: NodeJS.Signals): void => {
    try {
      if (process.platform === 'win32') child.kill(signal);
      else if (child.pid) process.kill(-child.pid, signal);
    } catch (error) {
      if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ESRCH'))
        throw error;
    }
  };
  let shutdown: Promise<void> | undefined;
  stopServices = () => {
    shutdown ??= (async () => {
      // The pnpm leader may exit before descendants close their inherited pipes.
      // Signal its owned group and wait for close, not merely the leader's exit.
      if (closed || spawnError) return;
      signalChild('SIGTERM');
      const timeout = setTimeout(() => signalChild('SIGKILL'), 20_000);
      try {
        await exited;
      } finally {
        clearTimeout(timeout);
      }
    })();
    return shutdown;
  };
  // Once owned services exist, cancellation must also shut down their supervisor.
  process.on('SIGINT', interrupt);
  process.on('SIGTERM', terminate);

  await eventually(() => hasVersion(apiOrigin, 'v1'), 'initial API contract');
  console.log('Development API is serving the initial contract.');
  const page = await browser.newPage();
  await eventually(
    async () => {
      try {
        const response = await fetch(`${webOrigin}/system-status`, {
          signal: AbortSignal.timeout(5_000),
        });
        if (response.status >= 500) throw new Error('Development web compilation failed.');
        return response.ok;
      } catch (error) {
        if (error instanceof Error && error.message === 'Development web compilation failed.')
          throw error;
        return false;
      }
    },
    'development web server',
    90_000,
  );
  await page.goto(`${webOrigin}/system-status`);
  await expect(page.locator('dd').filter({ hasText: /^v1$/u })).toBeVisible();
  console.log('Development browser accepted the initial contract; editing fixture source.');

  const sourcePath = join(fixture, 'packages/contracts/src/system/status.ts');
  const original = await readFile(sourcePath, 'utf8');
  assert(original.includes("CONTRACT_VERSION = 'v1'"));
  const compiledPath = join(fixture, 'packages/contracts/dist/system/status.js');
  const compiled = await readFile(compiledPath, 'utf8');
  await writeFile(
    sourcePath,
    original.replace("CONTRACT_VERSION = 'v1'", "CONTRACT_VERSION = 'dev-refresh-v2'"),
  );
  await eventually(
    () => hasVersion(apiOrigin, 'dev-refresh-v2'),
    'API to observe edited contracts',
  );
  // Keep the same page open: Next's live update must accept the edited schema,
  // and the button fetches a new response if Fast Refresh preserved its state.
  await expect(async () => {
    const retry = page.getByRole('button', { name: /Retry status check|Refresh status/u });
    if (await retry.isVisible()) await retry.click();
    await expect(page.locator('dd').filter({ hasText: /^dev-refresh-v2$/u })).toBeVisible({
      timeout: 1_000,
    });
  }).toPass({ timeout: 45_000 });
  assert.equal(
    await readFile(compiledPath, 'utf8'),
    compiled,
    'Development must not rewrite compiled contracts.',
  );
  console.log(
    'Contract source edit reached the running API and browser without rebuilding shared packages.',
  );

  await stopServices();
  stopServices = undefined;
  const portsClosed = await Promise.all(
    [apiPort, webPort].map(async (port) => {
      try {
        const server = createServer();
        await new Promise<void>((resolveListen, reject) => {
          server.once('error', reject);
          server.listen(port, '127.0.0.1', resolveListen);
        });
        await new Promise<void>((resolveClose) => server.close(() => resolveClose()));
        return true;
      } catch {
        return false;
      }
    }),
  );
  assert(
    portsClosed.every(Boolean),
    'Development services must release both owned listening ports.',
  );
} catch (error) {
  console.error(output);
  throw error;
} finally {
  try {
    await cleanup();
  } finally {
    process.off('SIGINT', interrupt);
    process.off('SIGTERM', terminate);
  }
}

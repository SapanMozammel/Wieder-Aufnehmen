import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export type InfraAction = 'down' | 'status' | 'up';

const REPOSITORY_ROOT = resolve(import.meta.dirname, '../..');
const COMPOSE_FILE = resolve(REPOSITORY_ROOT, 'infra/compose.yaml');
const MONGODB_SERVICE = 'mongodb';
const RETRY_INTERVAL_MS = 500;
const READINESS_TIMEOUT_MS = 30_000;
const DOCKER_CHECK_TIMEOUT_MS = 10_000;
const MONGO_CHECK_TIMEOUT_MS = 5_000;
const COMPOSE_UP_TIMEOUT_MS = 180_000;
const COMPOSE_DOWN_TIMEOUT_MS = 45_000;

const PING_SCRIPT = 'quit(db.adminCommand({ ping: 1 }).ok === 1 ? 0 : 1)';
const PRIMARY_SCRIPT = 'quit(db.hello().isWritablePrimary === true ? 0 : 1)';
const REPLICA_STATUS_SCRIPT =
  "const status = rs.status(); quit(status.ok === 1 && status.set === 'rs0' ? 0 : 1)";
const INITIALIZE_SCRIPT = [
  "try { const config = rs.conf(); if (config._id !== 'rs0') { quit(2); } }",
  'catch (error) {',
  "  if (error.code === 94 || error.codeName === 'NotYetInitialized') {",
  "    const result = rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'mongodb:27017' }] });",
  '    if (result.ok !== 1) { quit(3); }',
  '  } else { throw error; }',
  '}',
].join(' ');

export interface CommandResult {
  readonly status: number | null;
  readonly error?: Error;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut: boolean;
  readonly timeoutMs: number;
}

export interface SynchronousCommandOptions {
  readonly cwd: string;
  readonly inherit?: boolean;
  readonly timeoutMs: number;
}

export interface InfraCommandPlan {
  readonly executable: 'docker';
  readonly args: readonly string[];
  readonly cwd: string;
  readonly preservesData: boolean;
  readonly timeoutMs: number;
}

function isErrorCode(error: Error | undefined, code: string): boolean {
  return error !== undefined && (error as NodeJS.ErrnoException).code === code;
}

function normalizeResult(result: SpawnSyncReturns<string>, timeoutMs: number): CommandResult {
  return {
    status: result.status,
    ...(result.error ? { error: result.error } : {}),
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    timedOut: isErrorCode(result.error, 'ETIMEDOUT'),
    timeoutMs,
  };
}

export function runSynchronousCommand(
  executable: string,
  args: readonly string[],
  options: SynchronousCommandOptions,
): CommandResult {
  const result = spawnSync(executable, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    killSignal: 'SIGKILL',
    maxBuffer: 1024 * 1024,
    timeout: options.timeoutMs,
    ...(options.inherit ? { stdio: 'inherit' } : {}),
  });
  return normalizeResult(result as SpawnSyncReturns<string>, options.timeoutMs);
}

function runDocker(
  args: readonly string[],
  options: { readonly inherit?: boolean; readonly timeoutMs?: number } = {},
): CommandResult {
  return runSynchronousCommand('docker', args, {
    cwd: REPOSITORY_ROOT,
    timeoutMs: options.timeoutMs ?? DOCKER_CHECK_TIMEOUT_MS,
    ...(options.inherit ? { inherit: true } : {}),
  });
}

function succeeded(result: CommandResult): boolean {
  return !result.error && result.status === 0;
}

export function parseComposeProjectName(value: string | undefined): string {
  if (value === undefined) return 'aufnehmen';
  if (!/^[a-z0-9][a-z0-9_-]{0,62}$/u.test(value)) {
    throw new Error(
      'AUFNEHMEN_COMPOSE_PROJECT must be a lowercase project identifier of 1–63 characters.',
    );
  }
  return value;
}

function composeArgs(
  environment: Readonly<Record<string, string | undefined>>,
  ...args: readonly string[]
): string[] {
  return [
    'compose',
    '--project-name',
    parseComposeProjectName(environment['AUFNEHMEN_COMPOSE_PROJECT']),
    '--file',
    COMPOSE_FILE,
    ...args,
  ];
}

function mongoExecArgs(script: string): string[] {
  return composeArgs(
    process.env,
    'exec',
    '-T',
    MONGODB_SERVICE,
    'mongosh',
    'mongodb://127.0.0.1:27017/?directConnection=true',
    '--quiet',
    '--eval',
    script,
  );
}

export function commandPlan(
  action: InfraAction,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): InfraCommandPlan {
  const args =
    action === 'up'
      ? composeArgs(environment, 'up', '--detach', MONGODB_SERVICE)
      : action === 'down'
        ? composeArgs(environment, 'down', '--remove-orphans')
        : composeArgs(environment, 'ps', '--status', 'running', '--services');

  return {
    executable: 'docker',
    args,
    cwd: REPOSITORY_ROOT,
    preservesData: !args.includes('--volumes') && !args.includes('-v'),
    timeoutMs:
      action === 'up'
        ? COMPOSE_UP_TIMEOUT_MS
        : action === 'down'
          ? COMPOSE_DOWN_TIMEOUT_MS
          : DOCKER_CHECK_TIMEOUT_MS,
  };
}

function durationLabel(timeoutMs: number): string {
  return timeoutMs % 1000 === 0 ? `${timeoutMs / 1000}s` : `${timeoutMs}ms`;
}

export function describeCommandFailure(label: string, result: CommandResult): string {
  return result.timedOut
    ? `${label} timed out after ${durationLabel(result.timeoutMs)}.`
    : `${label} failed.`;
}

async function retryUntilReady(args: readonly string[], label: string): Promise<void> {
  const deadline = Date.now() + READINESS_TIMEOUT_MS;
  let lastError = '';

  while (Date.now() < deadline) {
    const result = runDocker(args, { timeoutMs: MONGO_CHECK_TIMEOUT_MS });
    if (succeeded(result)) return;
    lastError = describeCommandFailure(`${label} check`, result);
    await wait(RETRY_INTERVAL_MS);
  }

  throw new Error(
    `${label} did not become ready within ${READINESS_TIMEOUT_MS / 1000}s${
      lastError ? `: ${lastError}` : ''
    }`,
  );
}

function requireDocker(): void {
  const version = runDocker(['--version']);
  if (!succeeded(version)) {
    if (version.timedOut) throw new Error(describeCommandFailure('Docker version check', version));
    throw new Error('Docker is not installed; run pnpm setup:check for supported alternatives.');
  }

  const daemon = runDocker(['info', '--format', '{{.ServerVersion}}']);
  if (!succeeded(daemon)) {
    if (daemon.timedOut) throw new Error(describeCommandFailure('Docker daemon check', daemon));
    throw new Error('Docker is installed, but its daemon is unavailable.');
  }

  const compose = runDocker(['compose', 'version']);
  if (!succeeded(compose)) {
    if (compose.timedOut) {
      throw new Error(describeCommandFailure('Docker Compose version check', compose));
    }
    throw new Error('Docker Compose v2 is required (`docker compose`).');
  }
}

async function up(): Promise<void> {
  requireDocker();
  const plan = commandPlan('up');
  const started = runDocker(plan.args, { inherit: true, timeoutMs: plan.timeoutMs });
  if (!succeeded(started)) {
    throw new Error(describeCommandFailure('Docker Compose MongoDB startup', started));
  }

  await retryUntilReady(mongoExecArgs(PING_SCRIPT), 'MongoDB');
  const initialized = runDocker(mongoExecArgs(INITIALIZE_SCRIPT), {
    timeoutMs: MONGO_CHECK_TIMEOUT_MS,
  });
  if (!succeeded(initialized)) {
    if (initialized.timedOut) {
      throw new Error(describeCommandFailure('MongoDB replica-set initialization', initialized));
    }
    throw new Error(
      'MongoDB replica-set initialization failed or found an unexpected replica set.',
    );
  }
  await retryUntilReady(mongoExecArgs(PRIMARY_SCRIPT), 'MongoDB replica-set primary');
  console.log('✓ MongoDB replica set rs0 is ready on the configured loopback port');
}

function status(): void {
  requireDocker();
  const services = runDocker(commandPlan('status').args);
  const running = services.stdout
    .split(/\r?\n/u)
    .map((value) => value.trim())
    .includes(MONGODB_SERVICE);
  if (!succeeded(services) || !running) throw new Error('Aufnehmen MongoDB is not running.');

  for (const [label, script] of [
    ['ping', PING_SCRIPT],
    ['replica-set status', REPLICA_STATUS_SCRIPT],
    ['writable primary', PRIMARY_SCRIPT],
  ] as const) {
    const checked = runDocker(mongoExecArgs(script), { timeoutMs: MONGO_CHECK_TIMEOUT_MS });
    if (!succeeded(checked)) {
      throw new Error(describeCommandFailure(`MongoDB ${label} check`, checked));
    }
  }
  console.log('✓ MongoDB is running as writable replica-set primary rs0');
}

function down(): void {
  requireDocker();
  const plan = commandPlan('down');
  if (!plan.preservesData) throw new Error('Refusing an infrastructure command that deletes data.');
  const stopped = runDocker(plan.args, { inherit: true, timeoutMs: plan.timeoutMs });
  if (!succeeded(stopped)) {
    throw new Error(describeCommandFailure('Docker Compose infrastructure shutdown', stopped));
  }
  console.log('✓ Aufnehmen infrastructure stopped; the development volume was preserved');
}

export async function runInfraAction(action: InfraAction): Promise<void> {
  if (action === 'up') await up();
  else if (action === 'status') status();
  else down();
}

async function main(): Promise<void> {
  const action = process.argv[2];
  if (action !== 'up' && action !== 'status' && action !== 'down') {
    console.error('Usage: pnpm infra:<up|status|down>');
    process.exitCode = 1;
    return;
  }

  try {
    await runInfraAction(action);
  } catch (error) {
    console.error(`✗ ${error instanceof Error ? error.message : 'Infrastructure command failed.'}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}

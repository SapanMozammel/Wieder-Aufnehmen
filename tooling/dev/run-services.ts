import { spawn, type ChildProcess } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { createPnpmCommand } from '../shared/pnpm-command.js';

type ServiceName = 'api' | 'web';
interface LocalEnvironment {
  readonly api?: NodeJS.ProcessEnv;
  readonly web?: NodeJS.ProcessEnv;
}
export interface ServicePlan {
  readonly name: ServiceName;
  readonly environment: NodeJS.ProcessEnv;
}

const root = resolve(import.meta.dirname, '../..');

function localEnvironment(file: string): NodeJS.ProcessEnv {
  try {
    return parseEnv(readFileSync(resolve(root, file), 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return {};
    throw new Error(`${file} could not be read.`, { cause: error });
  }
}

function port(value: string, label: string): string {
  if (!/^\d+$/u.test(value) || Number(value) < 1 || Number(value) > 65535)
    throw new Error(`${label} must be an integer port between 1 and 65535.`);
  return String(Number(value));
}

export function createServicePlans(
  selection: string,
  environment: NodeJS.ProcessEnv,
  local: LocalEnvironment,
): readonly ServicePlan[] {
  if (!['api', 'web', 'all'].includes(selection)) throw new Error('Choose all, api, or web.');
  if (environment.NODE_ENV === 'production')
    throw new Error(
      'The local supervisor is not a deployment command. Use the application start commands with deployment configuration.',
    );
  if (local.api?.NODE_ENV !== undefined || local.web?.NODE_ENV !== undefined)
    throw new Error(
      'Local environment files cannot select NODE_ENV. Set the runtime mode in the parent process.',
    );
  const apiPort = port(environment.PORT ?? local.api?.PORT ?? '4000', 'PORT');
  const apiHost = environment.HOST ?? local.api?.HOST ?? '127.0.0.1';
  if (selection === 'all' && !['127.0.0.1', '0.0.0.0'].includes(apiHost))
    throw new Error(
      'Combined local services require HOST=127.0.0.1 or HOST=0.0.0.0 for the IPv4 browser API origin.',
    );
  const webPort = port(
    environment.WEB_PORT ?? local.web?.WEB_PORT ?? local.web?.PORT ?? '3000',
    'WEB_PORT',
  );
  if (apiPort === webPort && selection === 'all')
    throw new Error('API and web must use different ports.');
  const apiBase =
    environment.NEXT_PUBLIC_API_BASE_URL ??
    local.web?.NEXT_PUBLIC_API_BASE_URL ??
    `http://127.0.0.1:${apiPort}`;
  const parsed = new URL(apiBase);
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== '/' ||
    parsed.search ||
    parsed.hash
  )
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL must be an HTTP(S) origin without credentials, path, query, or fragment.',
    );
  if (
    selection === 'all' &&
    String(Number(parsed.port || (parsed.protocol === 'https:' ? '443' : '80'))) !== apiPort
  )
    throw new Error('Browser API origin port must match PORT for the combined local stack.');
  if (selection === 'all' && (parsed.protocol !== 'http:' || parsed.hostname !== '127.0.0.1'))
    throw new Error(
      'The combined development stack requires a loopback HTTP API origin on 127.0.0.1.',
    );
  const plans: ServicePlan[] = [
    {
      name: 'api',
      environment: {
        ...local.api,
        ...environment,
        HOST: apiHost,
        PORT: apiPort,
        CORS_ALLOWED_ORIGINS:
          environment.CORS_ALLOWED_ORIGINS ??
          local.api?.CORS_ALLOWED_ORIGINS ??
          `http://127.0.0.1:${webPort}`,
      },
    },
    {
      name: 'web',
      environment: {
        ...local.web,
        ...environment,
        PORT: webPort,
        NEXT_PUBLIC_API_BASE_URL: parsed.origin,
      },
    },
  ];
  return plans.filter(({ name }) => selection === 'all' || selection === name);
}

export async function runServices(selection = 'all', execution = 'development'): Promise<number> {
  if (execution !== 'development' && execution !== 'browser-test')
    throw new Error('Execution must be development or browser-test.');
  const built = execution === 'browser-test';
  if (!built && process.env.NODE_ENV === 'production')
    throw new Error(
      'Use the application start commands for production; the local supervisor does not read production configuration.',
    );
  const manager = process.env.npm_execpath;
  if (!manager) throw new Error('Start services through pnpm run.');
  const plans = createServicePlans(
    selection,
    built ? { ...process.env, NODE_ENV: 'test' } : process.env,
    built
      ? {}
      : {
          api: localEnvironment('apps/api/.env.local'),
          web: localEnvironment('apps/web/.env.local'),
        },
  );
  const running: { name: ServiceName; child: ChildProcess; closed: boolean }[] = plans.map(
    ({ name, environment }) => {
      const command = createPnpmCommand(manager, [
        '--filter',
        `aufnehmen-${name}`,
        'run',
        built ? 'start' : 'dev',
      ]);
      return {
        name,
        child: spawn(command.executable, command.args, {
          cwd: root,
          env: built && name === 'web' ? { ...environment, NODE_ENV: 'production' } : environment,
          stdio: 'inherit',
          detached: process.platform !== 'win32',
        }),
        closed: false,
      };
    },
  );

  return new Promise((resolveExit) => {
    let stopping = false;
    let exitCode = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const signalChildren = (signal: NodeJS.Signals): void => {
      for (const service of running) {
        if (service.closed || !service.child.pid) continue;
        try {
          if (process.platform === 'win32') service.child.kill(signal);
          else process.kill(-service.child.pid, signal);
        } catch (error) {
          if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ESRCH'))
            console.error(`[dev] Could not signal owned ${service.name} process.`);
        }
      }
    };
    const finish = (): void => {
      if (!running.every(({ closed }) => closed)) return;
      if (timer) clearTimeout(timer);
      process.off('SIGINT', interrupt);
      process.off('SIGTERM', terminate);
      resolveExit(exitCode);
    };
    const stop = (code: number): void => {
      if (stopping) return;
      stopping = true;
      exitCode = code;
      signalChildren('SIGTERM');
      timer = setTimeout(() => signalChildren('SIGKILL'), 15_000);
    };
    const interrupt = (): void => stop(130);
    const terminate = (): void => stop(143);
    process.on('SIGINT', interrupt);
    process.on('SIGTERM', terminate);
    for (const service of running) {
      service.child.once('error', () => {
        console.error(`[dev] Could not start ${service.name}.`);
        stop(1);
      });
      service.child.once('close', (code) => {
        service.closed = true;
        if (!stopping) {
          console.error(`[dev] ${service.name} stopped unexpectedly.`);
          stop(code && code > 0 ? code : 1);
        }
        finish();
      });
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = await runServices(process.argv[2], process.argv[3]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Service startup failed.');
    process.exitCode = 1;
  }
}

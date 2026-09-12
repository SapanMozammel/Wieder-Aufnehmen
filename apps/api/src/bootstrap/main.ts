import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadApiConfig } from './load-config.js';
import { startApiRuntime, type ApiRuntime, type ApiShutdownOutcome } from './runtime.js';
import { safeErrorClass } from '../shared/errors/api-error.js';
import { createStructuredConsoleLogger, type ApiLogger } from '../shared/logging/api-logger.js';

export type ForceProcessExit = (code: number) => void;

export interface ShutdownForSignalOptions {
  readonly runtime: Pick<ApiRuntime, 'shutdown'>;
  readonly logger: ApiLogger;
  readonly signal: 'SIGINT' | 'SIGTERM';
  readonly forceExit?: ForceProcessExit;
}

const defaultForceExit: ForceProcessExit = (code) => {
  process.exit(code);
};

export async function shutdownForSignal(options: ShutdownForSignalOptions): Promise<void> {
  const forceExit = options.forceExit ?? defaultForceExit;
  let outcome: ApiShutdownOutcome;
  try {
    outcome = await options.runtime.shutdown(options.signal);
  } catch (error) {
    options.logger.emit({
      name: 'api.lifecycle',
      timestamp: new Date().toISOString(),
      severity: 'error',
      action: 'shutdown_forced',
      reason: options.signal,
      errorClass: safeErrorClass(error),
    });
    forceExit(1);
    return;
  }
  if (outcome === 'forced') forceExit(1);
}

export async function main(forceExit: ForceProcessExit = defaultForceExit): Promise<void> {
  let config;
  try {
    config = await loadApiConfig();
  } catch (error) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        severity: 'error',
        service: 'aufnehmen-api',
        environment: 'unknown',
        event: 'api.lifecycle',
        action: 'startup_failed',
        errorClass: safeErrorClass(error),
      }),
    );
    forceExit(1);
    return;
  }

  const logger = createStructuredConsoleLogger(config.mode);
  let runtime;
  try {
    runtime = await startApiRuntime({ config, logger });
  } catch (error) {
    logger.emit({
      name: 'api.lifecycle',
      timestamp: new Date().toISOString(),
      severity: 'error',
      action: 'startup_failed',
      errorClass: safeErrorClass(error),
    });
    forceExit(1);
    return;
  }

  const handleSignal = (signal: 'SIGINT' | 'SIGTERM'): void => {
    process.off('SIGINT', handleSigint);
    process.off('SIGTERM', handleSigterm);
    void shutdownForSignal({ runtime, logger, signal, forceExit });
  };
  const handleSigint = (): void => handleSignal('SIGINT');
  const handleSigterm = (): void => handleSignal('SIGTERM');
  process.once('SIGINT', handleSigint);
  process.once('SIGTERM', handleSigterm);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void main();
}

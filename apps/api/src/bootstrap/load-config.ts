import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';
import {
  ConfigurationError,
  parseApiConfig,
  parseApiMode,
  type ApiConfig,
  type RawEnvironment,
} from './config.js';

export interface LoadApiConfigOptions {
  readonly environment?: RawEnvironment;
  readonly envFilePath?: string;
  readonly readTextFile?: (path: string) => Promise<string>;
  readonly onParse?: () => void;
}

const DEFAULT_ENV_FILE = fileURLToPath(new URL('../../.env.local', import.meta.url));

async function loadDevelopmentFile(
  path: string,
  readTextFile: (path: string) => Promise<string>,
): Promise<Readonly<Record<string, string>>> {
  let source: string;
  try {
    source = await readTextFile(path);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
      return Object.freeze({});
    }
    throw new ConfigurationError('apps/api/.env.local could not be read.', { cause: error });
  }

  let parsed: Readonly<Record<string, string | undefined>>;
  try {
    parsed = parseEnv(source);
  } catch (error) {
    throw new ConfigurationError('apps/api/.env.local could not be parsed.', { cause: error });
  }
  if (Object.hasOwn(parsed, 'NODE_ENV')) {
    throw new ConfigurationError('NODE_ENV must not be set by apps/api/.env.local.');
  }
  return Object.freeze(
    Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => entry[1] !== undefined),
    ),
  );
}

export async function loadApiConfig(options: LoadApiConfigOptions = {}): Promise<ApiConfig> {
  const environment = options.environment ?? process.env;
  const mode = parseApiMode(environment['NODE_ENV']);
  const fromFile =
    mode === 'development'
      ? await loadDevelopmentFile(
          options.envFilePath ?? DEFAULT_ENV_FILE,
          options.readTextFile ?? ((path) => readFile(path, 'utf8')),
        )
      : {};
  const definedProcessValues = Object.fromEntries(
    Object.entries(environment).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );
  options.onParse?.();
  return parseApiConfig({ ...fromFile, ...definedProcessValues, NODE_ENV: mode });
}

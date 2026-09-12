import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { register } from 'tsx/esm/api';

const OPENAPI_MODULE_URL = new URL('./openapi.ts', import.meta.url);
const TOOLING_TSCONFIG_PATH = fileURLToPath(new URL('../tsconfig.json', import.meta.url));

export async function runOpenApi(mode) {
  const unregister = register({ tsconfig: TOOLING_TSCONFIG_PATH });
  try {
    const { runOpenApiCli } = await import(OPENAPI_MODULE_URL.href);
    return runOpenApiCli(mode);
  } finally {
    await unregister();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await runOpenApi(process.argv[2]);
}

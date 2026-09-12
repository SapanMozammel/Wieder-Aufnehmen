import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkOpenApiDocument, serializeOpenApiDocument } from '@aufnehmen/contracts';

const REPOSITORY_ROOT = resolve(import.meta.dirname, '../..');
const DEFAULT_OPENAPI_PATH = resolve(REPOSITORY_ROOT, 'docs/api/openapi.json');

export type OpenApiCliMode = 'check' | 'write';

export function runOpenApiCli(
  mode: string | undefined,
  artifactPath = DEFAULT_OPENAPI_PATH,
): number {
  if (mode === 'write') {
    mkdirSync(dirname(artifactPath), { recursive: true });
    writeFileSync(artifactPath, serializeOpenApiDocument(), 'utf8');
    console.log(`Updated ${artifactPath}`);
    return 0;
  }

  if (mode === 'check') {
    if (!existsSync(artifactPath)) {
      console.error(`Missing generated OpenAPI artifact: ${artifactPath}`);
      console.error('Run pnpm api:openapi to create it.');
      return 1;
    }

    const committed = readFileSync(artifactPath, 'utf8');
    if (!checkOpenApiDocument(committed).matches) {
      console.error(`OpenAPI artifact is out of date: ${artifactPath}`);
      console.error('Run pnpm api:openapi and review the generated diff.');
      return 1;
    }

    console.log(`OpenAPI artifact is current: ${artifactPath}`);
    return 0;
  }

  console.error('Usage: openapi.ts <write|check>');
  return 2;
}

const entryPath = process.argv[1];
if (entryPath !== undefined && import.meta.url === pathToFileURL(resolve(entryPath)).href) {
  process.exitCode = runOpenApiCli(process.argv[2]);
}

import type { ZodType } from 'zod';
import { describe, expect, it } from 'vitest';
import {
  buildOpenApiDocument,
  checkOpenApiDocument,
  contractSchemaRegistry,
  serializeOpenApiDocument,
} from '../index.js';

const JSON_SCHEMA_OPTIONS = {
  target: 'draft-2020-12',
  io: 'output',
  unrepresentable: 'throw',
  cycles: 'throw',
  reused: 'inline',
} as const;

function expectedComponent(schema: ZodType): Record<string, unknown> {
  const generated: Record<string, unknown> = { ...schema.toJSONSchema(JSON_SCHEMA_OPTIONS) };
  delete generated.$schema;
  return generated;
}

function collectReferences(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectReferences);
  }
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const ownReference = typeof record.$ref === 'string' ? [record.$ref] : [];
    return [...ownReference, ...Object.values(record).flatMap(collectReferences)];
  }
  return [];
}

function resolveLocalReference(document: unknown, reference: string): unknown {
  if (!reference.startsWith('#/')) return undefined;
  return reference
    .slice(2)
    .split('/')
    .reduce<unknown>((current, segment) => {
      if (current === null || typeof current !== 'object') return undefined;
      return (current as Record<string, unknown>)[segment];
    }, document);
}

describe('OpenAPI document', () => {
  it('generates the exact OpenAPI 3.1 path and exposure matrix', () => {
    const document = buildOpenApiDocument();

    expect(document.openapi).toBe('3.1.0');
    expect(document.jsonSchemaDialect).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(Object.keys(document.paths)).toEqual([
      '/health/live',
      '/health/ready',
      '/v1/system/status',
    ]);
    expect(document.paths['/health/live']?.get?.['x-aufnehmen-exposure']).toBe('internal');
    expect(document.paths['/health/ready']?.get?.['x-aufnehmen-exposure']).toBe('internal');
    expect(document.paths['/v1/system/status']?.get?.['x-aufnehmen-exposure']).toBe('public');
    expect(Object.keys(document.paths['/health/ready']?.get?.responses ?? {})).toEqual([
      '200',
      '500',
      '503',
    ]);
    expect(Object.keys(document.paths['/v1/system/status']?.get?.responses ?? {})).toEqual([
      '200',
      '429',
      '500',
      '504',
    ]);
  });

  it('derives every named component directly from its registered Zod schema', () => {
    const document = buildOpenApiDocument();

    for (const [name, schema] of Object.entries(contractSchemaRegistry)) {
      expect(document.components.schemas[name]).toEqual(expectedComponent(schema));
      expect(document.components.schemas[name]).not.toHaveProperty('$schema');
    }
  });

  it('emits only resolvable local references', () => {
    const document = buildOpenApiDocument();
    const references = collectReferences(document);

    expect(references.length).toBeGreaterThan(0);
    for (const reference of references) {
      expect(resolveLocalReference(document, reference), reference).toBeDefined();
    }
  });

  it('serializes deterministically and detects byte-level drift without writing', () => {
    const first = serializeOpenApiDocument();
    const second = serializeOpenApiDocument();

    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
    expect(checkOpenApiDocument(first)).toEqual({ matches: true, generated: first });
    expect(checkOpenApiDocument(`${first} `)).toEqual({ matches: false, generated: first });
  });
});

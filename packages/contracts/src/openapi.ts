import type { ZodType } from 'zod';
import { RequestIdSchema } from './response-metadata.js';
import { contractSchemaRegistry } from './registry.js';
import { technicalHttpOperations } from './system/operations.js';

type OpenApiSchemaObject = Record<string, unknown>;

interface OpenApiResponseObject {
  readonly description: string;
  readonly headers: {
    readonly 'X-Request-Id': { readonly $ref: string };
  };
  readonly content: {
    readonly 'application/json': {
      readonly schema: { readonly $ref: string };
    };
  };
}

interface OpenApiOperationObject {
  readonly operationId: string;
  readonly summary: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly security: readonly [];
  readonly 'x-aufnehmen-exposure': 'internal' | 'public';
  readonly responses: Record<string, OpenApiResponseObject>;
}

export interface OpenApiDocument {
  readonly openapi: '3.1.0';
  readonly jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema';
  readonly info: {
    readonly title: 'Aufnehmen API';
    readonly version: '1.0.0';
    readonly description: string;
  };
  readonly tags: readonly {
    readonly name: string;
    readonly description: string;
  }[];
  readonly paths: Record<string, Record<string, OpenApiOperationObject>>;
  readonly components: {
    readonly headers: {
      readonly RequestId: {
        readonly description: string;
        readonly required: true;
        readonly schema: OpenApiSchemaObject;
      };
    };
    readonly schemas: Record<string, OpenApiSchemaObject>;
  };
}

export interface OpenApiCheckResult {
  readonly matches: boolean;
  readonly generated: string;
}

const JSON_SCHEMA_OPTIONS = {
  target: 'draft-2020-12',
  io: 'output',
  unrepresentable: 'throw',
  cycles: 'throw',
  reused: 'inline',
} as const;

function toOpenApiSchema(schema: ZodType): OpenApiSchemaObject {
  const generated: OpenApiSchemaObject = { ...schema.toJSONSchema(JSON_SCHEMA_OPTIONS) };
  delete generated.$schema;
  return generated;
}

function buildResponse(
  description: string,
  schemaName: keyof typeof contractSchemaRegistry,
): OpenApiResponseObject {
  return {
    description,
    headers: {
      'X-Request-Id': { $ref: '#/components/headers/RequestId' },
    },
    content: {
      'application/json': {
        schema: { $ref: `#/components/schemas/${schemaName}` },
      },
    },
  };
}

export function buildOpenApiDocument(): OpenApiDocument {
  const schemas = Object.fromEntries(
    Object.entries(contractSchemaRegistry).map(([name, schema]) => [name, toOpenApiSchema(schema)]),
  );
  const paths: OpenApiDocument['paths'] = {};

  for (const operation of Object.values(technicalHttpOperations)) {
    if (paths[operation.path] !== undefined) {
      throw new Error(`Duplicate OpenAPI path registration: ${operation.path}`);
    }

    const responses = Object.fromEntries(
      Object.entries(operation.responses).map(([status, response]) => [
        status,
        buildResponse(response.description, response.schema),
      ]),
    );
    const isInternal = operation.exposure === 'internal';

    paths[operation.path] = {
      [operation.method]: {
        operationId: operation.operationId,
        summary: operation.summary,
        description: isInternal
          ? 'Internal operational probe. Deployment routing must exclude this path from public ingress.'
          : 'Unauthenticated public product API containing only bounded, non-sensitive status data.',
        tags: [isInternal ? 'Internal health' : 'System'],
        security: [],
        'x-aufnehmen-exposure': operation.exposure,
        responses,
      },
    };
  }

  return {
    openapi: '3.1.0',
    jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
    info: {
      title: 'Aufnehmen API',
      version: '1.0.0',
      description:
        'MENN foundation API contract. Health probes are internal; system status is sanitized for public access.',
    },
    tags: [
      {
        name: 'Internal health',
        description:
          'Operational probes that must not be exposed through public production ingress.',
      },
      {
        name: 'System',
        description: 'Sanitized public technical status operations.',
      },
    ],
    paths,
    components: {
      headers: {
        RequestId: {
          description: 'Opaque server-generated request identifier.',
          required: true,
          schema: toOpenApiSchema(RequestIdSchema),
        },
      },
      schemas,
    },
  };
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue);
  }

  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort((left, right) => left.localeCompare(right))
        .map((key) => [key, sortJsonValue(record[key])]),
    );
  }

  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  throw new TypeError(`OpenAPI document contains a non-JSON value of type ${typeof value}.`);
}

export function serializeOpenApiDocument(document = buildOpenApiDocument()): string {
  const serialized = JSON.stringify(sortJsonValue(document), null, 2);
  if (serialized === undefined) {
    throw new TypeError('OpenAPI document could not be serialized.');
  }
  return `${serialized}\n`;
}

export function checkOpenApiDocument(committed: string): OpenApiCheckResult {
  const generated = serializeOpenApiDocument();
  return {
    matches: committed === generated,
    generated,
  };
}

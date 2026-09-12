# @aufnehmen/contracts

Browser-safe runtime contracts for the HTTP boundary between Aufnehmen applications.
Zod schemas are the source of truth for runtime validation, inferred TypeScript
types, and the generated OpenAPI 3.1 document.

This package contains transport shapes only. It must not import Express, Next.js,
MongoDB, Node-only modules, provider SDKs, or persistence document types.

The foundation surface is deliberately small: process liveness, API readiness,
sanitized public system status, response metadata, and the stable error envelope.
Operational probes are marked internal in the route metadata and OpenAPI document.

OpenAPI is generated from these schemas. Never edit `docs/api/openapi.json` by
hand.

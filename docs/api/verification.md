# API foundation verification

Recorded on 2026-09-06 with Node.js `24.20.0`, pnpm `11.25.0`, and Vitest `4.1.11`.
This evidence covers the extracted generic API, contracts, fixtures, OpenAPI
tooling, and MongoDB infrastructure. It does not establish production deployment
readiness or client-runtime verification of the AI workflow.

| Check                                                                       | Result                                                                                              |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Focused API/contracts/testing/OpenAPI/infrastructure tests                  | 13 files, 87 tests passed                                                                           |
| API package's own standalone test command                                   | 8 files, 58 tests passed; a subset of the focused suite, using its independent Vitest configuration |
| Real MongoDB integration                                                    | 1 file, 3 tests passed                                                                              |
| Node/API/contracts source TypeScript check                                  | Passed                                                                                              |
| OpenAPI generation and read-only drift check                                | Passed                                                                                              |
| Infrastructure project/port/volume configuration and writable-primary check | Passed                                                                                              |

```bash
pnpm exec vitest run apps/api packages/contracts packages/testing tooling/api tooling/infra
pnpm --filter aufnehmen-api test
pnpm exec tsc --noEmit -p tsconfig.check.node.json
pnpm api:openapi
pnpm api:openapi:check
```

The OpenAPI regression creates a temporary source-only checkout without
`packages/contracts/dist`, then exercises the public generation/check entry
point. The API's standalone test configuration resolves shared contracts and
fixtures from source independently of the root test configuration.

MongoDB integration used only the isolated Compose project
`aufnehmen-foundation-test`, published at `127.0.0.1:27028`. Tests created random,
marker-owned databases and cleaned them through exact ownership checks.

```bash
AUFNEHMEN_COMPOSE_PROJECT=aufnehmen-foundation-test MONGODB_PORT=27028 pnpm infra:up
MONGODB_TEST_URI='mongodb://127.0.0.1:27028/?replicaSet=rs0&directConnection=true' pnpm test:integration
AUFNEHMEN_COMPOSE_PROJECT=aufnehmen-foundation-test MONGODB_PORT=27028 pnpm infra:status
```

The isolated instance was handed to the repository integrator for browser checks.
Its later data-preserving shutdown is recorded with the overall verification
handoff. Existing unrelated infrastructure was not stopped or modified.

The extraction review fixed a temporary-directory identifier rename regression
and added fail-closed production-origin checks for IPv6 loopback, dotted
`localhost`, and the IPv4 loopback range. The origin regression was reproduced
before the change and verified afterward. Mongo cancellation, late-client
cleanup, startup/readiness deadlines, forced shutdown, safe logs/errors, and
HTTP boundary tests were preserved.

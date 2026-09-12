# MENN architecture

Aufnehmen is a TypeScript modular monolith with two runtime entry points. Next.js
owns presentation. Express owns API composition and application use cases.
MongoDB is an infrastructure adapter. Shared HTTP contracts are runtime validated.

```text
Next.js UI → HTTP client → Express transport → application use case
                         ↑                         ↓
                  shared contracts          application-owned port
                                                   ↑
                                            MongoDB adapter
```

## Ownership rules

- `apps/web/src/app` contains thin route/layout composition. Feature behavior
  belongs to `apps/web/src/features/<capability>`.
- The browser reaches Express through HTTP. Web code never imports API or MongoDB internals.
- API transport validates input, obtains trusted request context, invokes a use
  case, and presents a validated response. Domain/application code imports no
  Express, Next.js, MongoDB, storage, billing, or AI SDK.
- API infrastructure implements application-owned ports. Bootstrap selects adapters.
- Each future capability owns its persistence and invariants. Cross-capability
  calls use deliberate application interfaces rather than shared collection access.
- `packages/contracts` is runtime-neutral transport policy, never a persistence model.
- `packages/testing` is private test-only content shared by real API and web consumers.
- Add packages only for a real runtime boundary or at least two real consumers.

## Implemented example

`GET /v1/system/status` returns a cached, sanitized database-readiness snapshot.
`/health/live` has no database dependency. `/health/ready` supports bounded
readiness checking. The public page receives only the public contract.

The MongoDB owner bounds connection and shutdown attempts, handles late driver
completion, and publishes readiness honestly. Test databases require a generated
name and ownership marker before cleanup. Stopping local Compose preserves data.

## Failure and security model

Configuration is validated before startup. Production mode requires explicit
origins, connection configuration, and proxy trust choices. Logs do not contain
credentials, request bodies, or arbitrary exception messages. Errors expose a
closed display-safe code/message and request ID.

The initial API is read-only infrastructure. Authentication, authorization,
CSRF, ownership isolation, writes, background jobs, uploads, payments, and
production ingress are new boundaries that require separate implementation.
Do not treat local loopback deployment as production isolation. Restrict internal
probes at ingress before exposing the API to the internet.

## Decisions that require a record

Record alternatives, consequences, security/data impact, operating cost,
reversibility, and verification before changing dependency direction, persistence,
authentication, external providers, or deployment topology. Use the universal
workflow ADR template and keep decisions with the consumer repository.

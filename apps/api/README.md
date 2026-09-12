# Aufnehmen API

Private Node.js/Express composition root for Aufnehmen. The web application reaches this application
only over versioned HTTP contracts from `@aufnehmen/contracts`.

## Commands

```bash
pnpm --filter aufnehmen-api typecheck
pnpm --filter aufnehmen-api test
pnpm --filter aufnehmen-api build
pnpm --filter aufnehmen-api dev
pnpm --filter aufnehmen-api start
```

`createApiApp` constructs the complete Express application without opening a listener. The
executable validates configuration before constructing MongoDB or Express, attempts a bounded
MongoDB connection, and may start degraded so liveness remains useful during a dependency outage.

## Configuration

Copy `.env.example` to the ignored `apps/api/.env.local` for development overrides. The loader
reads that file only when the process-provided `NODE_ENV` is `development`; test and production
never read it. Defined process variables override file values. Configuration errors name the key
and safe corrective action, never its value.

- `HOST`, `PORT`: listener binding (`127.0.0.1:4000` in development).
- `CORS_ALLOWED_ORIGINS`: comma-separated exact origins; no wildcard or credentials.
- `TRUST_PROXY`: must remain the literal `false` until a deployment topology is approved.
- `MONGODB_URI`: official-driver URI selecting a replica-set database. It is secret outside the
  committed credential-free loopback example and is never logged.

Production requires every value explicitly, requires HTTPS non-loopback browser origins, and
rejects the local development database/direct-connection settings.

## Technical endpoints

- `GET /health/live`: process-only liveness; never queries MongoDB.
- `GET /health/ready`: bounded, single-flight Mongo refresh; `200` ready or safe `503`.
- `GET /v1/system/status`: public sanitized cached status; `200` available/degraded or safe error.

All responses receive a new opaque `X-Request-Id`; incoming IDs never replace it. Public status is
limited per directly connected socket to 60 requests/minute and four concurrent requests, with a
bounded 4,096-identity process-local store. Proxy headers are ignored.

## Fixed safety bounds

- JSON body: 16 KiB, strict JSON objects/arrays only.
- Application request: 3 s; Mongo ping: 1 s.
- HTTP headers: 5 s; full request receipt: 10 s; keep-alive: 5 s; header bytes: 16 KiB.
- Mongo connect/server selection: 2 s; socket: 5 s; pool wait: 1 s; pool size: 10.
- Readiness refresh: every 5 s; snapshots fail closed after 10 s.
- Shutdown: stop accepting work and drain for 8 s, then allow 4 s to close MongoDB.

The local MongoDB default is `127.0.0.1:27018`, database `aufnehmen_dev`, replica
set `rs0`. `MONGODB_PORT` changes the Docker host binding only: update
`MONGODB_URI` and `MONGODB_TEST_URI` explicitly when choosing a different port.
Integration tests read `MONGODB_TEST_URI` from the process environment, independently
of application configuration; exporting it is required when overriding the default.

The template permits only `GET`, `HEAD`, and `OPTIONS` in its initial CORS policy.
Adding write endpoints or authentication requires corresponding method, header,
credential, origin, and abuse-control policy changes with boundary tests.
Health probes are marked internal in OpenAPI; production ingress must restrict
`/health/*`. The application itself does not authenticate those probes.

Logs are JSON records built from event-specific allowlists. They include request metadata and safe
machine codes, never URLs/query strings, bodies, headers, cookies, credentials, connection strings,
or raw exceptions.

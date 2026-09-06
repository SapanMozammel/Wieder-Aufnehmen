# Local MongoDB

`pnpm infra:up` starts the pinned MongoDB image, initializes replica set `rs0`, and
waits for a writable primary. It exposes MongoDB only at `127.0.0.1:27018`.
`pnpm infra:status` checks the Docker daemon, replica set, and primary.
`pnpm infra:down` stops the project while preserving its data volumes.

The Compose project defaults to `aufnehmen`. Before starting a second template
checkout, choose a distinct `AUFNEHMEN_COMPOSE_PROJECT` and `MONGODB_PORT` in the
process environment. Keep those values consistent for up, status, and down. Docker
names each persistent volume under that project, avoiding shared global volumes.

```bash
AUFNEHMEN_COMPOSE_PROJECT=my-app MONGODB_PORT=27028 pnpm infra:up
AUFNEHMEN_COMPOSE_PROJECT=my-app MONGODB_PORT=27028 pnpm infra:status
MONGODB_TEST_URI='mongodb://127.0.0.1:27028/?replicaSet=rs0&directConnection=true' pnpm test:integration
AUFNEHMEN_COMPOSE_PROJECT=my-app MONGODB_PORT=27028 pnpm infra:down
```

For API development on a different host port, also set `MONGODB_URI` to that port
and a development database in `apps/api/.env.local` or the process environment.
The application configuration never uses the test URI. Integration tests never
use the application URI and reject credentials or a database in their base URI.
Each run creates random, marker-owned databases; cleanup checks exact ownership
before dropping only those test databases.

The local replica set has no authentication and is for development only. Use
explicit production configuration and an authenticated, encrypted, supported
MongoDB deployment before exposing an application. Configure ingress and the
application's proxy trust to match the chosen deployment topology.

# Local development

The root scripts own the development experience. Run commands from the repository
root with the pinned Node/pnpm versions.

| Service | Local default                        |
| ------- | ------------------------------------ |
| Web     | `127.0.0.1:3000`                     |
| Express | `127.0.0.1:4000`                     |
| MongoDB | `127.0.0.1:27018`, replica set `rs0` |

```bash
pnpm install --frozen-lockfile
pnpm setup:check
pnpm infra:up
pnpm infra:status
pnpm dev
```

`pnpm dev` builds the shared contracts and supervises web/API processes. Failure
of either child stops the sibling; Ctrl-C shuts down the owned services. It does
not kill another project's processes. `pnpm infra:down` stops the project's
MongoDB container while preserving named volumes.

The Compose project defaults to `aufnehmen`. Use a unique `AUFNEHMEN_COMPOSE_PROJECT`
and `MONGODB_PORT` for multiple projects. Each command must receive the same
project/port settings. Update `MONGODB_URI` and `MONGODB_TEST_URI` to match custom
ports; the browser/API topology must also use matching origins.

## Configuration

Environment values override ignored local files. `.env.example` files are safe
examples, not implicit production credentials. Development mode supplies
documented loopback defaults through root scripts. Direct Next.js invocation
requires `NEXT_PUBLIC_API_BASE_URL`. Never put secrets in `NEXT_PUBLIC_*` fields.

Changing web/API ports requires coherent `WEB_PORT`, `PORT`,
`NEXT_PUBLIC_API_BASE_URL`, and `CORS_ALLOWED_ORIGINS`. The launcher derives safe
local defaults from the selected ports; explicit values remain validated.

## Verification

`pnpm check:quick` runs offline static and unit checks. `pnpm check:all` adds
builds, real MongoDB integration, browser journeys, and the online dependency audit.
Install the browser once
with `pnpm exec playwright install chromium`.

After starting the default local database, run the full gate with explicit build
and test configuration (shell example; set the same variables in PowerShell):

```bash
MONGODB_TEST_URI='mongodb://127.0.0.1:27018/?replicaSet=rs0&directConnection=true' \
  NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4000 pnpm check:all
```

The browser harness selects separate API/web ports and builds its matching public
origin. It runs the built API in test mode against a loopback fixture and Next.js
in production mode; this is production-artifact testing, not production deployment.

Integration tests read `MONGODB_TEST_URI`, never the application's `MONGODB_URI`.
Use a local disposable replica set. Tests create a unique synthetic database and
only delete it after checking its ownership marker.

Online dependency audit is `pnpm security:dependencies`. Run it when installing
or updating dependencies and before release; unavailable registry results are failures.

## Troubleshooting

- **API public URL missing:** use `pnpm dev`, or set the public URL before direct
  web build/start. This configuration is frozen at build time.
- **Degraded status:** check `pnpm infra:status` and matching database URI/port.
  An available HTTP server does not imply an available database.
- **Port occupied:** choose documented alternate ports; do not terminate the owner.
- **Docker unavailable:** start Docker with Compose or supply a disposable local
  replica-set URI. A mock does not satisfy the integration gate.
- **Browser unavailable:** install the pinned Playwright Chromium revision.
- **Build cannot resolve contracts:** run through root `build:*` scripts, which
  compile shared workspaces first. Source tests intentionally run without `dist`.

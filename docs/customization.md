# Starting your application

1. Create a repository from the template or copy a reviewed release into a new
   checkout. Retain relevant source notices.
2. Read `AGENTS.md`, `.ai/manifest.json`, `.ai/project.json`, the manifest's current
   task, and its linked decisions. Before changing project identity, create your
   initialization task from `.ai/templates/task.md` and point `currentTask` in
   `.ai/manifest.json` to it. Record the intended names, owned files, preserved
   boundaries, acceptance, and authorized local checks. Retain inherited task
   history as provenance; it does not authorize new application work.
3. Apply the identity changes below together. Update the project-owned workflow
   profile, command registry, architecture/design links, and protected behavior.
   Preserve upstream-managed `.ai/core`, `.ai/templates`, and `.ai/tools`.
4. Run the baseline commands below and record their results in the initialization
   task. Resolve failures before treating the derived project as initialized.
5. Write the first product/design task: user outcome, scope, non-goals, states,
   contracts, risks, and observable acceptance. Use the relevant core workflow.

## Identity changes

Package names participate in executable checks and runtime resolution. A partial
rename can break startup or leave the architecture guard checking the old scope.

| Identity                           | Change together                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project name and presentation      | Root `package.json`, `.ai/project.json`, README, application metadata/content, package descriptions, and project-owned documentation. Preserve upstream attribution and historical evidence.                                                                                                                                                                                                                                                                |
| Workspace names                    | `apps/api/package.json` (`aufnehmen-api`), `apps/web/package.json` (`aufnehmen-web`), and the two `packages/*/package.json` names (`@aufnehmen/contracts`, `@aufnehmen/testing`); update workspace dependencies and all source/test imports.                                                                                                                                                                                                                |
| Package filters                    | Root `package.json` build/integration filters and the `aufnehmen-${name}` service filter in `tooling/dev/run-services.ts`; update command examples in `apps/api/README.md` and `docs/api/verification.md`.                                                                                                                                                                                                                                                  |
| Resolution and architecture policy | `tsconfig.check.node.json`, `tsconfig.check.web.json`, `tooling/tsconfig.json`, root/API Vitest aliases, `apps/web/next.config.ts` transpile list, `eslint.config.mjs` deep-import restriction, and **all** `@aufnehmen/` public-entry, application-dependency, and test-fixture rules in `tooling/architecture/check-architecture.ts` with their tests. Keep the `@/` web alias and its traversal protections unless deliberately replacing it everywhere. |
| Local infrastructure               | Select a unique Compose project and port using `AUFNEHMEN_COMPOSE_PROJECT` and `MONGODB_PORT`; keep `infra/compose.yaml` and `tooling/infra/mongodb.ts` defaults, environment-key validation, and tests coherent if renaming the key itself. Set matching `MONGODB_URI` and `MONGODB_TEST_URI`.                                                                                                                                                             |
| Database and service identifiers   | Development database name and its production rejection in API config/tests/examples; log service name; browser/integration database prefixes and matching ownership markers/cleanup guards. Rename ownership markers only for new disposable resources, never to claim an existing database.                                                                                                                                                                |
| Public origins and API metadata    | API/web `.env.example` files and ignored local settings; matching CORS/public origins. If changing `x-aufnehmen-exposure`, update contract generation/tests and regenerate the OpenAPI artifact with `pnpm api:openapi`.                                                                                                                                                                                                                                    |

Search tracked and project-owned hidden files for `Aufnehmen`, `aufnehmen`, and
`AUFNEHMEN` to catch additional references. Do not mechanically replace upstream
notices, managed workflow files, or historical task evidence. Run `pnpm install`
after changing manifests so pnpm updates the lockfile and workspace links; review
the resulting diff. Subsequent installs must pass `pnpm install --frozen-lockfile`.

## Verify the new baseline

Use the pinned Node/pnpm versions and install dependencies first. Then run:

```bash
pnpm install --frozen-lockfile
pnpm setup:check
pnpm check:quick
pnpm exec playwright install chromium
```

Choose unused service ports and a unique Compose project. For example, keep these
settings in the same shell for every infrastructure and verification command:

```bash
export AUFNEHMEN_COMPOSE_PROJECT=myapp-initialization
export MONGODB_PORT=27118
export MONGODB_TEST_URI='mongodb://127.0.0.1:27118/?replicaSet=rs0&directConnection=true'
export MONGODB_URI='mongodb://127.0.0.1:27118/myapp_dev?replicaSet=rs0&directConnection=true'
export PORT=4100
export WEB_PORT=3100
export NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4100
export CORS_ALLOWED_ORIGINS=http://127.0.0.1:3100
export E2E_API_PORT=4500
export E2E_WEB_PORT=3500
pnpm infra:up
pnpm infra:status
pnpm check:all
pnpm dev
```

Open `http://127.0.0.1:3100/system-status`, confirm the services respond, and stop
development with Ctrl-C. Run `pnpm infra:down` from that same configured shell to
stop only the chosen Compose project and preserve its volumes. Record the exact
commands, results, remaining risks, and handoff in the initialization task.

## UI foundations

Semantic CSS tokens live in `apps/web/src/app/globals.css`. They cover surfaces,
text, borders, actions, success, degraded, and error states in light/dark settings.
The shell uses system fonts, responsive spacing, keyboard focus, a skip link,
semantic landmarks, and visible text labels. Choose your product direction through
the design workflow before expanding the visual system.

Co-locate feature UI with its behavior and keep shared primitives small. Keep
server, URL, form, and transient interaction state with their actual owners.
A global store or UI library is a project decision, not a starter requirement.

## Extending the API

Start with contracts and application invariants. Implement the use case against
an application-owned port, test it independently, then add MongoDB/HTTP adapters.
New account-scoped data requires trusted identity and isolation tests. New writes
need method/CORS/CSRF/idempotency decisions as appropriate; the sample API is read-only.

## What can be removed

The starter home content and synthetic system-status feature may be replaced after
your own tested vertical path proves the architecture. Preserve the error contract,
environment validation, package boundaries, lifecycle safety, and applicable tests.
Remove an example and its now-unused files together; do not weaken shared gates.

## Updating a derived application

Review each upstream Aufnehmen change against your project. Apply small patches
with regression evidence. Do not bulk-copy the template over business code.
Update the universal workflow separately through its versioned update plan;
project policy and task history stay owned by the consumer.

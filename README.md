# Aufnehmen

A reusable TypeScript **MENN** foundation: MongoDB, Express, Next.js, and Node.js,
with a repository-owned AI development workflow.

Aufnehmen owns application infrastructure and engineering conventions. The
[Auterix workflow](https://github.com/SapanMozammel/auterix) supplies
shared planning, design, implementation, review, verification, and handoff guidance.
Your application owns its business rules, branding, and integrations.

**Auterix — One workflow. Any AI coding tool.**
Its tool-neutral design uses shared repository context; native client verification
is tracked separately in the [AI workflow guide](docs/ai-workflow.md).

## Start locally

Use Node.js `24.20.0`, pnpm `11.25.0`, and Docker with Compose:

```bash
pnpm install --frozen-lockfile
pnpm setup:check
pnpm infra:up
pnpm dev
```

Open `http://127.0.0.1:3000`. The home page is a small starter shell;
`/system-status` exercises the browser → Express → MongoDB boundary. Database
unavailability is displayed as a degraded state with a retry action.

The local launcher supplies safe development defaults. An ignored
`apps/api/.env.local` or `apps/web/.env.local` can override them; committed
`.env.example` files document the settings. Direct production builds require
an explicit public API origin:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.example.com pnpm build:web
pnpm build:api
```

The public API origin is embedded in the browser build. Rebuild when changing it.
These commands create build artifacts; they do not deploy your application.

## What is included

- Next.js App Router with semantic CSS tokens, dark appearance, keyboard focus,
  responsive layout, error/404 recovery, and no network font dependency.
- Express composition root with validated configuration, safe error envelopes,
  request IDs, CORS allowlist, security headers, bounded requests, and structured logs.
- Official MongoDB driver behind application-owned ports, connection recovery,
  bounded shutdown, isolated integration databases, and local replica-set tooling.
- Shared Zod HTTP contracts and generated OpenAPI, consumed without database types.
- Strict types, independent formatter/linter, architecture checks, unit/contract,
  integration, browser, accessibility, dependency, and secret checks.
- A versioned universal AI workflow with project-specific MENN guidance and
  documented discovery adapters; native runtime verification is tracked separately.

This is a foundation, not a preconfigured identity, payment, email, upload, or
business-feature service. Add each capability through an explicit task and review
its data, failure, security, and operational requirements.

## Find your way

```text
apps/web/             Next.js routes, feature UI, browser-safe API client
apps/api/             Express bootstrap, application ports, infrastructure adapters
packages/contracts/   Shared runtime HTTP validation and OpenAPI source
packages/testing/     Synthetic fixtures shared by API and web tests
infra/                Loopback MongoDB replica set
tooling/              Architecture, environment, dev, docs, and security checks
tests/                Quality gate and real browser harness
.ai/                  Installed workflow, project configuration, task, and evidence
docs/                 Architecture, setup, design, provenance, and maintenance
```

Start with [architecture](docs/architecture.md), [local development](docs/local-development.md),
[AI workflow](docs/ai-workflow.md), and [customization](docs/customization.md).

## Daily checks

```bash
pnpm check:quick
pnpm api:openapi:check
pnpm security:dependencies
pnpm exec playwright install chromium
MONGODB_TEST_URI='mongodb://127.0.0.1:27018/?replicaSet=rs0&directConnection=true' \
  NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4000 pnpm check:all
```

The full gate requires a disposable MongoDB replica set and an installed Playwright
browser. Missing services/checks fail visibly. See the setup guide for overrides.

AI tools begin at `AGENTS.md`. A discovery adapter is not proof of runtime
compatibility: the support registry separates documented adapters from tools
that have completed a real handoff test. Human review and acceptance remain
part of every task regardless of the tool.

## Maintenance

Aufnehmen receives generic infrastructure improvements. Consumer applications
adopt relevant changes deliberately; application folders are never bulk-synced.
The universal workflow has its own source version and managed-file hashes, allowing
workflow updates without overwriting local project policy or task history.

See [provenance and release status](docs/provenance.md) before distributing a
derived template. Production deployment needs your project's identity, data,
ingress, secrets, backup, monitoring, and recovery decisions.

## License

Original template code is [MIT licensed](LICENSE). Retain the existing
[Recto notice](third-party/recto-LICENSE.txt) and installed Auterix notice when
reusing their code; third-party dependencies keep their own licenses.

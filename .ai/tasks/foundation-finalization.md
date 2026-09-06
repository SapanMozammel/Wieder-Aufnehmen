# Foundation finalization and Auterix integration

Status: in_progress
Owned files: tooling/architecture/check-architecture.ts, tooling/architecture/check-architecture.test.ts, .ai/manifest.json, .ai/tasks/foundation-finalization.md, .ai/workflow.lock.json, .ai/core/LICENSE.md, .ai/tools/workflow.mjs, LICENSE, package.json, README.md, docs/, .github/workflows/ci.yml

## Objective

Complete the MENN template's remaining engineering and distribution preparation,
adopt Auterix 1.1.0 without changing project policy, and open a verified review PR.
The owner authorized commits, pushes and PRs and delegated license selection.
MIT covers original work; existing third-party licenses are preserved. No merging,
visibility changes, tags, package/release publication or deployment is authorized.

## Scope

Own `tooling/architecture/check-architecture.ts` and its regression tests,
`.ai/manifest.json`, this task, `.ai/workflow.lock.json` and installer-managed
update targets, `LICENSE`, `package.json`, `README.md`, `docs/` and
`.github/workflows/ci.yml`. Managed files change only through a reviewed Auterix
update plan. Preserve business-free starter scope and unrelated working changes.

## Acceptance

- Protected application/domain code cannot import shared MongoDB infrastructure.
  A failing regression precedes the minimal gate fix.
- A reviewed Auterix upgrade preserves project instructions/profile/task history;
  standalone validation and a repeated no-op update pass.
- MIT and retained third-party notices accurately describe distribution terms.
- All root quality gates pass, including real MongoDB/browser/accessibility checks
  against isolated test resources. Existing Recto resources remain untouched.
- A review branch and PR exist; remote CI results and remaining limits are explicit.

## Progress and findings

- Review reproduced an architecture-check gap for imports from protected layers
  into `apps/api/src/shared/mongo`; the focused fix and tests are implemented.
- Workflow source rename is independent of Aufnehmen's template identity.
- Earlier foundation evidence remains in `current.md` and `docs/verification.md`.

## Evidence

- Architecture regression first: two failing cases, 18 passing; after the minimal
  rule fix, 20/20 focused tests pass, including the allowed shared clock import.
- Reviewed Auterix 1.1.0 plan updated the managed checker, added the MIT notice and
  refreshed the lock. All five inspected project context files were byte-preserved;
  repeated preview proposes no writes or conflicts. Standalone validation passes.
- Source: `SapanMozammel/auterix`; 26 managed files; digest
  `205d0a55f2f543049c1f353a4d84d6f16a198929a9f2ec9cff7d3f15fef2ae6f`.
- `MONGODB_TEST_URI='mongodb://127.0.0.1:27028/?replicaSet=rs0&directConnection=true'
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4000 pnpm check:all` passed all 16 gates
  on 2026-09-06: 144 unit/API/contract/tooling tests, 3 real MongoDB tests,
  4 browser/accessibility tests, production builds, static checks and audit.
- The initial run rejected incomplete headings/ownership in this new task record;
  the record was corrected before the full passing run. No check was disabled.
- Auterix source: 35/35 conformance tests pass. GitHub PR/remote CI and test-service
  cleanup remain the final integration steps.

## Handoff

Native AI client checks remain a founder task and are not claimed by automated
adapter checks. Review PRs are not merged or published releases. Next: finish
reviewed workflow adoption, run all gates, stop only the owned test resources,
then commit, push and open the review PR.

# Foundation verification

Status: local implementation verified. Current Git integration and review status
is recorded in [the active task](../.ai/tasks/foundation-finalization.md).

## Acceptance

- A fresh install builds the web, API, and shared contracts.
- Browser requests cross HTTP/runtime validation to an application-owned MongoDB port.
- Unit, API, contract, architecture, configuration, docs, and workflow checks pass.
- The real MongoDB integration uses an isolated replica set and owned databases.
- Browser checks cover home navigation, available/degraded/unavailable status,
  recovery, responsive layout, keyboard access, and automated accessibility.
- The installed workflow validates without depending on the source checkout.
- The template contains no resume product, publisher settings, credentials, or
  Recto runtime dependency.

## Historical foundation evidence — before the 1.1 update

Verified on 2026-09-06 with Node 24.20.0, pnpm 11.25.0, macOS, Docker/Colima,
MongoDB 8.0.26 replica set, and the pinned Playwright Chromium revision.

```bash
pnpm install --frozen-lockfile
MONGODB_TEST_URI='mongodb://127.0.0.1:27028/?replicaSet=rs0&directConnection=true' \
  NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4000 pnpm check:all
```

- Full gate: **16 checks passed**, including workflow integrity, configuration,
  documentation links, architecture, OpenAPI drift, formatting, lint, strict
  types, unit tests, secret patterns, dependency policy, builds, integration,
  browser journeys, and online dependency audit.
- Unit/API/contract/tooling: **141 tests passed** across 19 files.
- Real MongoDB integration: **3 tests passed** with ownership-checked cleanup.
- Browser: **4 tests passed**, including live status, narrow-screen accessibility,
  keyboard outage recovery, and dark/degraded-state accessibility. Error/degraded
  presentation uses controlled browser fixtures; live status reaches real MongoDB.
- Production builds of web/API/shared packages passed. Browser harness uses the
  built API in test mode and Next.js in production mode, not a production rollout.
- Online dependency audit: **no known vulnerabilities found** at check time.
- Reviewed full-page desktop/mobile home and dark status screenshots. No visible
  overflow or readability issues found in those captures. Automated checks and
  screenshots do not constitute a full assistive-technology audit.
- Workflow 1.0.0: **25 managed files** validate standalone. A no-op update preview
  preserves all four project-owned files and proposes no writes/conflicts.
- Workflow source conformance: **29 tests passed**, including unrelated-stack
  adoption, standalone validation, drift, path collisions, byte limits, and
  partial-write recovery. Two independent-review findings were fixed and retested.
- Read-only Compose validation passed default and alternate project/port settings.
  Verification used only `aufnehmen-foundation-test` on port 27028, not Recto's
  existing service at 27017. Test fixture cleanup preserved unrelated data.
- After relocating the review checkout, all 11 quick gates passed again. The
  isolated test container/network were then removed with `pnpm infra:down`;
  both project volumes were retained. Recto's container remained running.
- `git diff --check` passed. The old placeholder routes/configuration are replaced
  by the workspace; their original content remains recoverable from Git history.

See [backend evidence](api/verification.md) for focused lifecycle/configuration
tests. Subset counts there are not additional tests on top of the 141 above.

## Remaining limits

- Native execution in Claude, Cursor, Augment, Copilot, and Antigravity will be
  tested by the founder later. Discovery adapters alone are not runtime evidence.
- Original code is now MIT licensed by the owner's delegated decision; retained
  third-party notices remain applicable.
- Git integration is authorized; remote CI results belong to the review PR.
  Aufnehmen is already configured as a public GitHub template. Local verification
  cannot substitute for remote checks, founder review or release approval.

## Auterix 1.1 and completion verification — 2026-09-06

The same full-gate command above passed all **16 checks** after the source-name
migration and architecture-guard fix: **144 unit/API/contract/tooling tests**,
**3 real MongoDB tests**, and **4 browser/accessibility tests**. Source conformance
now has **35 passing tests**, including authentic legacy installation upgrades.

The new guard rejects direct shared MongoDB adapter imports from protected domain
and application layers. Its regression failed before the fix; the neutral shared
clock remains allowed. No application feature behavior changed.

Installed Auterix is **1.1.0**, source **SapanMozammel/auterix**, **26 managed files**,
digest `205d0a55f2f543049c1f353a4d84d6f16a198929a9f2ec9cff7d3f15fef2ae6f`.
The reviewed installer plan changed only the checker, license notice and lock;
project context was byte-preserved and a repeated preview was a no-op.
Historical counts above remain evidence of the earlier 1.0.0 foundation.

# Pre-merge foundation quality

Task schema: 1
Status: complete
Risk: medium
Workflow: .ai/core/workflows/implementation.md
Dependencies: none
Owned files: tooling/, tests/, packages/contracts/package.json, packages/testing/package.json, apps/api/package.json, apps/web/package.json, apps/web/next.config.ts, package.json, .ai/, docs/, README.md, .github/workflows/ci.yml

## Objective

Close the foundation review findings and make this MENN template reliable to
adopt and develop with across AI tools.

## Scope

Normalize architecture aliases, keep shared contracts fresh in development,
document and verify initialization, and adopt the corrected Auterix source through
a reviewed update plan. The owner subsequently authorized committing the verified
changes locally. Business features, pushes, merges, releases, visibility changes
and native AI-client executions remain outside this action.

## Acceptance

- Resolvable web-to-API alias imports fail architecture checks.
- Shared contract edits reach both development consumers without manual rebuilds.
- Initialization identifies package/filter/architecture identity changes.
- Reviewed workflow update preserves project policy and existing task history.
- Relevant regressions and full quality gates pass with isolated test resources.

## Evidence

Starting revision: a7d0e84b12735b551850852920de530042b9c841, clean worktree.
Read-only review reproduced the architecture alias bypass and established stale
compiled contracts in the current development command. Both regression cases
failed before their fixes. The architecture gate now normalizes alias targets.
Development conditions resolve shared TypeScript sources through Node/webpack,
while production build/start still resolves compiled exports.

The live refresh regression reached both API and an open Chromium page after a
synthetic contract edit, confirmed unchanged compiled artifacts, and checked port
release. Copy guards exclude local environment files and refuse escaping links.
A SIGINT diagnostic verified service/temporary-checkout cleanup; repeated signals
cannot bypass the harness cleanup handler through Playwright's default behavior.

Auterix 1.2.0 was adopted through a reviewed plan: nine managed writes plus lock,
29 managed files, source digest
`05010a2c51570f91cb6e996e3f7abd482a9e41a548f3e9df865b6c55794a8c69`.
Six project-owned context/history files were byte-preserved during adoption.
Standalone checking and a repeated no-op update preview pass. Upstream 65 tests
pass; frozen-lockfile install remains unchanged.

Final full run passed on Node 24.20.0/pnpm 11.25.0, using the native pnpm command
shape exercised in CI:

```bash
MONGODB_TEST_URI='mongodb://127.0.0.1:27028/?replicaSet=rs0&directConnection=true' \
  NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4000 npm_execpath=pnpm \
  node --import tsx tests/run-quality-gates.ts all
```

All 17 gates passed: 167 unit/API/contract/tooling tests across 23 files, 3 real
MongoDB integration tests, 4 browser/accessibility tests, live API/browser contract
refresh, production builds, lint/types/format, drift/architecture/secret checks,
and dependency audit with no known vulnerabilities found. The first full run
stopped on a test-harness type error; it was fixed and the complete suite rerun.

## Review

Independent review reproduced and resolved fixture symlink/environment exclusions
and descendant-process cleanup, with failing-first coverage and a real interruption
diagnostic. The API/web source boundary and development/production export split
are regression-tested. No reported high/medium finding remains unresolved in this
implementation scope. The UI starter and product-service non-goals are unchanged.

## Handoff

The isolated `aufnehmen-premerge-test` container/network were removed after the
passing run. Both test volumes were retained; readback confirmed Recto's original
MongoDB at port 27017 remained healthy.

The pre-merge fixes are complete on the existing feature branch. The owner
authorized recording these verified changes in a local commit so work can return
to Recto. Git history identifies the resulting commit. Push and remote CI remain
separate next steps before merge; existing PR #4 does not yet contain this revision.
Native AI client testing remains the owner's deferred follow-up; visibility and
releases are unchanged. No new remote CI pass is claimed for this local revision.

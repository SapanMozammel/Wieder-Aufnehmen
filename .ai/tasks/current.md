# MENN template and shared workflow integration

Status: complete
Owned files: apps/, packages/, tooling/, tests/, infra/, docs/, .ai/project.json, .ai/manifest.json, .ai/tasks/current.md, AGENTS.md, root build/configuration files, .github/workflows/ci.yml

## Objective

Provide a reusable MENN application foundation with an independently maintained,
stack-neutral workflow that any agent can follow from repository state alone.

## Scope

Replace the old placeholder Next.js routes with a generic web/API/MongoDB path,
strict boundaries, useful checks, accessible technical UI, documentation, and a
content-addressed workflow installation. No business features or external release.

## Acceptance

- Root static/unit, build, real MongoDB, browser, accessibility, and dependency
  checks pass with exact evidence in `docs/verification.md`.
- The installed workflow validates without its source checkout and preserves
  project-owned profile/task changes during a no-op update preview.
- No Recto runtime dependency, product domain, credentials, or publisher workflow.
- A new consumer can follow README setup and select its own first product task.

## Evidence

See `docs/verification.md` and `docs/api/verification.md`. Workflow installation
1.0.0 uses digest `a073d5251e29ecffa545afa11ee1bf05cb21b198f5de86bfb2c5de56c9425d43`.
Static adapter installation does not prove actual client runtime behavior.

## Handoff

All 16 integrated gates passed: 141 unit/contract/tooling tests, 3 real MongoDB
tests, and 4 browser tests. Local implementation is ready for founder review.
Founder review precedes any commit, push, PR, or publication. Actual
native client checks and root distribution licensing remain explicit later steps.
Consumers should create a project-initialization task using the shared template
before changing identity, architecture, design, or application behavior.

## Auterix naming — 2026-09-06

The owner selected **Auterix** and **One workflow. Any AI coding tool.** for the
shared workflow, not for the Aufnehmen MENN template. Scope: `README.md`,
`docs/ai-workflow.md`, `docs/provenance.md`, and this project-owned handoff.
The installed managed files, lock, source identity and digest are unchanged;
GitHub still uses `SapanMozammel/claude-workflow`. Native compatibility remains
subject to the documented runtime checks. No application code or remote changes.

Verification: `pnpm tooling:check`, `pnpm docs:check`, focused Prettier and
`git diff --check` passed. The renamed source checkout passed all 29 conformance
tests and reproduced the installed bundle source/digest exactly. Independent
read-only naming review found no substantive issue. Application tests were not
rerun for this documentation-only change. All changes remain uncommitted; owner
review is next, with no remote rename or publication authorized.

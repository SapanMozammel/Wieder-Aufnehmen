# Engineering contract

Use Node `24.20.0` and pnpm `11.25.0`; the root scripts are the command contract.
The project-owned `.ai/project.json` registers command effects. Workflow files
under `.ai/core`, `.ai/templates`, and `.ai/tools` are upstream-managed; change
the source and adopt a reviewed update instead of editing those files locally.

## Before changing code

Read the current task and affected/sibling code. Record outcome, scope, non-goals,
owned files, acceptance, risks, and the relevant architecture/design decision.
For a defect or protected behavior, demonstrate a failing regression test before
the fix. Keep mechanical moves, behavior changes, and unrelated cleanup separate.
Preserve unrelated working-tree changes, including those made by another agent.

## Implementation quality

- Keep strict TypeScript. No explicit `any`, unjustified assertion, silent catch,
  blanket lint suppression, or disabled test to hide a defect.
- Validate external data at runtime. Keep domain/application code independent
  from HTTP frameworks, persistence, and providers; follow `docs/architecture.md`.
- Use the existing feature/module pattern. Add a package only for an actual
  runtime boundary or two real consumers; avoid speculative infrastructure.
- Prefer explicit errors and bounded work. Consider cancellation, size limits,
  timeout, retry, race conditions, cleanup, and observability for each I/O boundary.
- Do not log credentials, personal data, arbitrary request bodies, or raw errors.
  Use synthetic fixtures; never copy production data into prompts or tests.
- Authorization belongs on the server for every protected operation. The example
  status path is not an authentication or data-isolation implementation.
- Keep public configuration separate from secrets. Do not relax production
  validation merely to make a local fixture start.

## UI and design

Use the shared design workflow before introducing product screens. Record the
user job, journey, content hierarchy, states, accessibility, and chosen direction.
Reuse semantic tokens and a small set of proven components. Inspect actual
rendering in light/dark modes and at narrow/large viewports; test keyboard flow,
loading/error/recovery, long content, and relevant assistive semantics. Automated
accessibility checks are evidence, not a complete usability or accessibility claim.

## Verification and review

Run focused tests while developing, then the applicable root gates. Report exact
commands/results and unavailable prerequisites. Review changed runtime paths,
contracts, failure behavior, security implications, and the final diff. Resolve
critical/high findings before handoff. Record self-review honestly; use an
independent reviewer when the risk warrants it.

Do not commit, push, open/merge PRs, deploy, migrate data, change external accounts,
or publish without the current user's explicit authority. Local check commands do
not confer release permission. End with durable evidence, remaining risks, and
the next safe action so a different tool can continue without chat history.

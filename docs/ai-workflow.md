# Auterix AI workflow

**One workflow. Any AI coding tool.**

Aufnehmen includes a versioned installation of
[Auterix](https://github.com/SapanMozammel/auterix), the stack-neutral AI
engineering workflow, previously hosted under the name `claude-workflow`.
The tagline describes tool-neutral context sharing, not verified native support
for every client.

Start every tool at `AGENTS.md`. The manifest selects the current task, project
profile, relevant standards, and registered commands. Canonical files hold policy;
tool-specific adapters provide discovery only.

The project profile contains Aufnehmen's MENN architecture, runtime versions,
commands, protected boundaries, and local review requirements. Generic planning,
design, implementation, bug-fix, security, migration, AI-change, review, and
release practice belongs to the shared core.

The repository includes adapter candidates for Codex, Claude Code, Cursor,
Augment, GitHub Copilot, and Antigravity. See the installed adapter registry for
official discovery references and exact support status. Installing an adapter
does not mean its native runtime has been verified. The manual fallback is to
open `AGENTS.md` and follow its linked task/standards.

## Task discipline

Auterix 1.2 validates the current task and linked decisions as well as managed
file integrity. Start from `.ai/templates/task.md`: declare `Task schema: 1`,
`Status`, explicit `Owned files`, `Risk`, a registered `Workflow` path, and
`Dependencies: none` or task paths. Keep Objective, Scope, Acceptance, Evidence
and Handoff substantive; completion also requires Review and no unchecked
acceptance items. Active tasks require completed dependencies. Supported states
are draft, discovery, ready, in_progress, verification, review, complete, blocked
and cancelled. Preserve inherited history; create a new task for new work.

Profile architecture/design/external-reference arrays point to existing local
instruction artifacts, not remote URLs. Deferred commands/capabilities require
an owner, trigger, fallback and nonexpired `expires: YYYY-MM-DD`. Validation is
structural evidence, not proof that commands ran or acceptance outcomes occurred.

Before implementation, capture outcome, scope, non-goals, acceptance, risks,
dependencies, owned files, and relevant design/architecture decisions. Record
verification, review findings, and the next step before handing off. Use realistic
synthetic fixtures and keep secrets/customer content out of agent context.

For product UI, define the user problem, journey, states, content, responsive and
accessibility behavior, references, and distinct design directions. Record a
selected direction before implementation, then compare the built result and test
its complete flow. The starter's technical shell is not a prescribed product design.

## Updates

The workflow lock identifies managed source files. Inspect an update plan from a
selected release; changed managed files and existing unknown instructions require
manual conflict resolution. Applying a workflow update must preserve project
policy, task history, application code, and local decisions.

The installed validator can run without the workflow source checkout. Run
`pnpm tooling:check` as part of regular quality gates. Runtime support evidence
must be repeated when an adapter or tool version materially changes.

The 1.1.0 source-name migration accepts the exact legacy identity and preserves
project-owned context. Use a reviewed upstream update plan instead of editing the
lock or installed checker manually. Keep the MIT notice in `.ai/core/LICENSE.md`.
The upstream source repository is currently private; maintainers need authorized
source access to review updates. The installed workflow remains self-contained
and needs no private checkout to run.

The installed 1.2.0 update was applied through a reviewed plan. It adds strict
context validation, design decision sequencing, conditional AI-change evaluation,
and guarded adoption rollback. Updates preserve the selected adapters; all six
documented candidates remain selected in this template. Other projects can select
a subset when installing upstream. Root Codex overrides are explicitly checked;
scoped/global/client instruction behavior still requires the deferred native test.

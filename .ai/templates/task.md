# Task title

Task schema: 1
Status: draft
Owned files: list explicit paths or scoped globs
Risk: low
Workflow: .ai/core/workflows/implementation.md
Dependencies: none

## Objective

User outcome and concrete reason.

## Scope

Included work, exclusions, risk rationale, accepted decisions and owner/tool.
Replace the header ownership placeholder with comma-separated repository paths
or directory-scoped globs. Select a workflow registered in the manifest. Declare
prerequisite task paths in Dependencies, or explicitly keep none. Prerequisites
must be complete before ready, in_progress, verification, review or complete.

## Acceptance

Observable success criteria and protected behavior.

## Evidence

Inspected sources; commands and results; review findings; deferred capabilities.
Record dates/tool versions where reproducibility depends on them.
Deferred commands and optional profile deferrals require an owner, trigger,
fallback and a nonexpired expires date in YYYY-MM-DD form. Deferred work is not
passing evidence; record its reason and effect on acceptance.

## Review

Reviewer, inspected changes, findings, resolutions or authorized acceptance,
and remaining risk. Complete tasks require concrete review content and no
unchecked acceptance items; textual validation does not prove the review ran.

## Handoff

Completed work, next step, open decisions, risks and rollback.

Supported lifecycle: draft, discovery, ready, in_progress, verification, review,
complete, blocked, cancelled. Keep all five required sections (Objective, Scope,
Acceptance, Evidence, Handoff) nonempty even while drafting; state what is known
and the next discovery step. The checker validates the recorded state, not the
history of transitions. Migrate the current task explicitly; preserve old tasks
unless they are selected as current or declared as prerequisites.

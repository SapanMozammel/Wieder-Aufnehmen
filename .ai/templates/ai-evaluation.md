# AI change evaluation

Task: project task path
Owner and decision authority: accountable role and existing authorization
Status: proposed | evaluated | accepted | rejected

## Outcome and boundary

User outcome, baseline behavior, proposed change, protected behavior and affected
input/output/tool boundaries. State sensitive-data exclusions and recovery route.

## Frozen corpus and method

Corpus path/version/digest, synthetic or approved redacted provenance, expected
outcomes, grading rules, sample size, held-out cases and known coverage gaps.
Record baseline/candidate configuration, evaluation environment and commands.
Distinguish offline fixtures, recorded responses and live runs.

## Thresholds and hard limits

Preselected quality/factual-support criteria, invalid/unsafe-output tolerance,
latency, token and cost budgets; request/input/output limits, retry count, timeout,
cancellation and fallback behavior. Use justified not-applicable entries where
the operation has no corresponding cost or capability.

## Comparison and evidence

Baseline and candidate results on the same corpus and grading; variation and
failures, representative safe output evidence, regressions and unresolved checks.
Report unavailable live measurements as deferred, never inferred from a mock.

## Decision, rollout and handoff

Selected behavior, rationale, decision authority, exceptions and residual risks.
State rollout scope, monitoring signals, rollback trigger and recoverable prior
configuration. Link task evidence and the next action with its required authority.

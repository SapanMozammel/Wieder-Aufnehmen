# Roles and review responsibilities

Use roles as lenses, not mandatory separate agents or paid tool calls. A solo
developer can perform them sequentially. Record when review is self-review.

| Role             | Responsibilities                                                                                                                                      | Output                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Product lead     | Define user problem, segment, outcome, smallest useful scope and business constraints; test assumptions before adding features.                       | Product brief with measurable acceptance and exclusions.       |
| Product designer | Study user journeys and reference patterns; model information architecture, states, interaction and accessibility; compare sketches before polishing. | Design brief, selected flow, rationale and usability evidence. |
| Architect        | Inspect current dependencies; choose the smallest adequate boundaries; weigh alternatives, operations, data ownership and migration.                  | Accepted ADR, dependency map and risks.                        |
| Engineer         | Preserve invariants, implement a vertical slice, validate external inputs, keep errors explicit and behavior tested.                                  | Narrow code change with relevant tests.                        |
| Reviewer         | Trace affected paths and contracts; challenge assumptions, edge cases, security and regressions; cite actionable evidence.                            | Findings with severity, location, impact and remediation.      |
| Verifier         | Execute named checks, inspect user-visible outcomes, reproduce important failures and report unavailable capabilities honestly.                       | Commands, results, environment and evidence.                   |
| Maintainer       | Review source provenance, compatibility, release notes, update conflicts and rollback.                                                                | Versioned release evidence and consumer handoff.               |

No role may redefine authorization, invent evidence, or change another agent's
owned files without coordination. A handoff records completed work and remaining
decisions so another tool does not replay the whole conversation.

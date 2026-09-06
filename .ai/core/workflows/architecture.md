# Architecture and engineering plan

Read current architecture, affected modules and sibling tests. Establish data
ownership, runtime boundaries, dependency direction and external contracts.
Choose the simplest design that serves current consumers and credible near-term
change; a new abstraction must have a concrete reason.

Use an ADR for consequential choices: context, options, decision, tradeoffs,
quality attributes, compatibility, operations and reversal. Define runtime input
validation, failure semantics, authorization boundaries and observability.
Infrastructure and providers belong behind application-owned interfaces when
those boundaries improve testability and isolate change.

Break work into small verifiable tasks with explicit owned files, dependencies,
acceptance, risk, verification and handoff. Separate mechanical movement from
behavior changes. Sketch the minimum useful dependency map; document performance
or cost budgets where decisions depend on them. Do not introduce speculative
services, queues, providers or packages without a real requirement.

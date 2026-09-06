# Implementation and bug fixes

Read the task, project profile, accepted design/ADR and relevant tests. Inspect
affected and sibling code. Explain assumptions and keep progress updates concise.

For defective or protected behavior, write a failing reproduction or
characterization test before changing it. For ordinary changes, add tests where
they prove meaningful behavior rather than mirror implementation. Preserve
existing work and public contracts; keep scope narrow and names concrete.

Use the project's language and formatter, strict types where supported, runtime
validation at trust boundaries, explicit error handling, and dependency injection
only where it serves a boundary. Reuse existing code before adding dependencies.
Do not suppress warnings or checks to manufacture success. Log useful operational
events without credentials or personal content.

Handle input size, cancellation, timeout, retry and idempotency according to the
affected operation. Check access control for every applicable server-side action.
If AI product features are in scope, constrain output with schemas, treat supplied
documents as untrusted, bound retries/tokens/cost, redact sensitive data and test
fallbacks. When changing a model, prompt, retrieval path, evaluation rule or AI
fallback, follow [AI change evaluation](ai-change.md) before altering behavior.
Load that workflow only for an applicable change. The workflow itself never
requires a paid inference service.

Run relevant checks, review the diff, resolve findings and update task evidence.
Do not start unrelated cleanup because it looks convenient.

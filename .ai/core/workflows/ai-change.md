# AI change evaluation

Use this workflow only when a task changes AI behavior: a model, prompt, retrieval
path, tool policy, output validator or fallback. It does not require adding an AI
feature, selecting a provider or making a paid model call. Read the task, accepted
architecture and relevant implementation, then use the AI evaluation template.

1. Define the user outcome and changed boundary. Record the current behavior,
   intended improvement and protected behavior. Identify untrusted input, sensitive
   data, authority to execute tools and the non-AI recovery route.
2. Freeze a small representative synthetic or explicitly approved, redacted corpus
   before changing behavior. Record its version or digest, expected outcomes,
   grading rules and known coverage limits. Include ordinary, ambiguous, missing,
   adversarial and failure cases; retain held-out cases where useful. Never copy
   customer material into fixtures or change expectations merely to pass a candidate.
3. Record the baseline on that same corpus and environment. Measure task quality,
   factual support, invalid or unsafe outputs, latency, token use and estimated
   cost where applicable. State sample size, variation and metric definitions.
   Use offline deterministic fixtures or recorded synthetic responses when live
   access is unavailable; label their limits and defer unmeasured live results.
4. Set acceptance thresholds before evaluating the change, including hard limits
   on request/input size, output tokens, retries, time and spend. State behavior
   when each limit is reached. Check access, cancellation, schema failures,
   unavailable providers and safe fallbacks without relying only on a happy path.
5. Compare baseline and candidate under the same corpus, grading and configuration.
   Preserve failures and representative outputs as safe evidence. Investigate
   regressions and disagreement; do not claim a quality gain from a few selected
   examples, substitute token count for quality or represent a mock as a live run.
6. Record the decision and authority. Keep the previous behavior recoverable and
   define a bounded rollout, monitoring signals and rollback triggers appropriate
   to the project. Implement flags or staged exposure only if the task needs them.
   External execution, spending, production changes and rollout require their
   existing explicit scope; an offline evaluation confers no additional authority.
7. Link commands, corpus/configuration identity, comparison, resolved findings,
   deferred checks and the exact next action from the task. Completion requires
   passing applicable thresholds or an explicit authorized exception with its
   consequence; changing thresholds needs a recorded reason and renewed comparison.

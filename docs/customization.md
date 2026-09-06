# Starting your application

1. Create a repository from the template or copy a reviewed release into a new
   checkout. Retain relevant source notices.
2. Set project identity, package names, metadata, Compose project, local database
   name, and public URLs. Keep workspace dependencies and import aliases coherent.
3. Read `AGENTS.md` and update the project-owned workflow profile, commands,
   task record, architecture links, and protected behavior.
4. Run the fresh setup, static/unit, build, integration, and browser checks before
   adding business features. This becomes the new project's verified baseline.
5. Write the first product/design task: user outcome, scope, non-goals, states,
   contracts, risks, and observable acceptance. Use the relevant core workflow.

## UI foundations

Semantic CSS tokens live in `apps/web/src/app/globals.css`. They cover surfaces,
text, borders, actions, success, degraded, and error states in light/dark settings.
The shell uses system fonts, responsive spacing, keyboard focus, a skip link,
semantic landmarks, and visible text labels. Choose your product direction through
the design workflow before expanding the visual system.

Co-locate feature UI with its behavior and keep shared primitives small. Keep
server, URL, form, and transient interaction state with their actual owners.
A global store or UI library is a project decision, not a starter requirement.

## Extending the API

Start with contracts and application invariants. Implement the use case against
an application-owned port, test it independently, then add MongoDB/HTTP adapters.
New account-scoped data requires trusted identity and isolation tests. New writes
need method/CORS/CSRF/idempotency decisions as appropriate; the sample API is read-only.

## What can be removed

The starter home content and synthetic system-status feature may be replaced after
your own tested vertical path proves the architecture. Preserve the error contract,
environment validation, package boundaries, lifecycle safety, and applicable tests.
Remove an example and its now-unused files together; do not weaken shared gates.

## Updating a derived application

Review each upstream Aufnehmen change against your project. Apply small patches
with regression evidence. Do not bulk-copy the template over business code.
Update the universal workflow separately through its versioned update plan;
project policy and task history stay owned by the consumer.

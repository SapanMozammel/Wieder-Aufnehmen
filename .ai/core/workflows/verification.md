# Verification and review

Select checks from the inspected project command contract. Installing this
workflow does not make any command available. Never execute scripts just because
an inventory found them. Record exact commands, environment, exit status and
relevant outcomes; a deferred check is not a pass.

Verify changed behavior at its lowest useful level, then exercise real integration
boundaries. Use synthetic fixtures and deterministic failure cases. For user
interfaces, inspect actual rendering and exercise keyboard, responsive states and
the main journey. For APIs/data, test runtime validation, errors, access boundaries
and state consistency as applicable.

Review the diff for unintended changes, secrets, dependency direction, tests that
miss behavior and unnecessary complexity. Use the review template. Severity
reflects observable impact, not style preference. Independently review high-risk
changes when another reviewer is available; label self-review honestly.

## Cross-tool proof

In each supported client, start a fresh session with only the repository. Ask it
to identify current task, authority, owned files, commands and deferred checks;
make a harmless synthetic task update; then hand off to a different client.
Record tool/version/date, exact prompt, observed discovery, diff, checks and
handoff in a project-owned evidence file using the tool-verification template.
A bridge file's presence establishes documented integration only.

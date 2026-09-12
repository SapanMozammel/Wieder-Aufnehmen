# Release and maintenance

Read the project release contract. Verify acceptance, checks, risk review,
consumer compatibility, documentation and rollback before release. Derive release
notes from the final diff. Do not publish, tag, push, create PRs or deploy without
the user's explicit authorization; existing authorization remains valid.

Version portable changes using semantic versioning: breaking contracts need a
major version and migration guidance; compatible capabilities are minor changes;
corrections are patches. Record source identity and digest with each reviewed
artifact. Run clean consumer conformance and update conflict tests. Hashes provide
integrity comparison, not authorship or license clearance.

Review vendor discovery docs when changing adapters and record the date and
source. Keep documented, statically tested and client-runtime-verified states
distinct. Do not change permission defaults to make a tool seem supported.

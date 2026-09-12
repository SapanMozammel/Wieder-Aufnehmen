# @aufnehmen/testing

Private, test-only synthetic fixtures that have at least two real consumers.
Production packages and applications must never depend on this package.

The foundation exports are limited to public system-status and safe-error fixtures
used by both API and web tests. Express harnesses, MongoDB lifecycle helpers,
clocks, log captures, and internal-probe fixtures remain beside their single owner
until another real consumer earns a shared abstraction.

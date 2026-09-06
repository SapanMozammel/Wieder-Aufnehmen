# Source provenance and release status

The MENN infrastructure was extracted from the author's Recto repository at
`281ef262e258b917f1dc4c9ffa43cb13f0f86d31`, preserving generic lifecycle,
configuration, HTTP, validation, and testing behavior. Recto resume, renderer,
theme, PDF, CLI, billing, and product-specific modules are excluded.

The source template is Aufnehmen `main` at
`8a793798e62437276557ee359ee32b4076aa61a8`. Its placeholder landing/access/dashboard
routes and unrelated metadata were replaced by the MENN starter shell; they remain
recoverable from Git history. The separate `architecture` branch at
`7438f50eddfb76d9cf550da6966bc072e49e26cc` was inspected as a reference and preserved.

The formatter/folder/design principles in sapan.dev at
`26482b73d05c44e9bf5bcc864d6f76b69140ef47` informed the design. No portfolio assets
or unlicensed third-party source were copied from it. Root executable formatter
configuration owns policy; Markdown does not generate executable settings.

The Auterix workflow is maintained in
[`SapanMozammel/auterix`](https://github.com/SapanMozammel/auterix). Its installed
lock records the exact version/content hashes; it is not an unpinned live sync.
The current local candidate is not a published upstream release.
Auterix's tagline is **One workflow. Any AI coding tool.** The source repository
was renamed in place. A reviewed 1.1.0 installer update migrates the prior
`SapanMozammel/claude-workflow` source identity and preserves project context.
The subsequent reviewed 1.2.0 update adds context validation and workflow
improvements, with 29 managed files and source digest
`05010a2c51570f91cb6e996e3f7abd482a9e41a548f3e9df865b6c55794a8c69`.
The upstream repository remains private; the included validator/guidance have
no runtime dependency on access to that checkout.

Recto-derived source carries the MIT notice in `third-party/recto-LICENSE.txt`.
Neither original Aufnehmen nor claude-workflow supplied a repository-wide license
at the inspected revisions. The owner subsequently delegated license selection:
original template code is now covered by the root [MIT license](../LICENSE).
Auterix's MIT notice is retained at `.ai/core/LICENSE.md`. Existing third-party
licenses remain unchanged; the root grant does not relicense external material.

See `docs/verification.md` for executed checks and remaining environment limits.

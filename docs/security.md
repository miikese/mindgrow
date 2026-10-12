# Privacy and security review

- Trusted hosted identity comes from ChatGPT/Sites dispatch. Every mutation requires
  identity; learner progress checks ownership of its associated profile.
- Public record endpoints return no child profiles or practice history.
- Child records use only nicknames, coarse age paths and optional reminder lengths.
  Arbitrary email, birth date or location fields are discarded by validation.
- The chosen learning path is checked on the server when saving practice.
- SQL uses bound values; request bodies are capped during streaming; writes have
  persistent rate limits and cross-origin writes are rejected.
- Blockly can only move/repeat. Programs have nesting, loop and step limits.
  There is no eval, backend compiler or arbitrary server execution.
- HTML iframe has no scripts/same-origin permission and blocks external resources.
- The local runner has a random HttpOnly SameSite test session, Host checks and a
  loopback bind. It is explicitly development-only.
- Deleting a learner removes their private practice; deleting the account removes
  all application records. Host backup retention remains separately managed.
- Practice scores are learning feedback, not verified examination credentials,
  a leaderboard, medical advice, or an intelligence measurement.

Follow-up: formal retention/export policy, guardian PIN/session protections,
more accessibility review of Blockly, verified age/guardian consent requirements
before large-scale deployment, and production backup/recovery monitoring.

## Dependency review — 12 October 2026

Targeted patch updates remove all findings from `npm audit --omit=dev` (0 total).
The full audit still reports development-tool dependencies: 11 high, 5 moderate
and 3 low findings (19 packages including parent propagation). These include
glob/parser dependencies of ESLint/Vinext, tooling and migration-time utilities.
The apps do not accept user-supplied build configurations, source globs or
migration files. Keep preview servers on loopback and build only trusted source.
A full supported toolchain upgrade and revalidation remains necessary; a clean
production dependency audit does not mean the entire build toolchain is clean.

`npm audit fix` failed with an internal npm 10 dependency-graph error. Targeted
manifest updates and a committed lockfile were used instead of forcing major
upgrades or accepting a framework downgrade. Re-audit on every dependency change.

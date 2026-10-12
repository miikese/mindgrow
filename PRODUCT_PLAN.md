# MindGrow product plan

## Purpose and learners
A cohesive, untimed learning garden: age-appropriate programming/problem-solving
practice for children and relaxed memory/logic activities for older learners.
No intelligence, medical or treatment claims; no coercive streaks or advertising.

## Current MVP and architecture
Eight interactive React/TypeScript activities, Blockly visual programming and
sandboxed HTML/CSS practice share one navigation and private learning history.
A separate Worker REST API stores guardian-owned nickname profiles and results in
D1/SQLite. The browser keeps guest game state locally. Hosted identity is checked
server-side; the local runner uses an explicit development account on loopback.
See README.md, db/schema.ts, docs/api.md and docs/security.md.

## Implemented learning progression
Movement/sequence practice → maze problem solving → Blockly movement and repeat
blocks → introductory HTML/CSS challenges. Every activity includes feedback,
hints and difficulty choices. Four paths restrict saved content by age range.
Practice points derive from hints on the server; recommendations use attempt
history. Existing levels rotate some variants rather than claiming 50 authored
lessons. Calm mode, text size, keyboard alternatives and reminders support access.

## Improvements in this phase
- Delete a learner through one server transaction, including all their history.
  Avoid per-result deletion requests that can exhaust the minute write quota and
  leave partially deleted family data. Preserve other learners' records.
- Scope private history to its owner in SQL before applying the result limit.
  Another household's volume must never hide a learner's own profile/history.
- Verify deletion through the actual family UI and assert one DELETE request.

## Security and researched dependencies
Blockly's Apache-2.0 distribution remains separate from this project's licensing.
Movement programs use a bounded interpreter, never eval or generated code execution.
HTML/CSS previews have an empty iframe sandbox and block network resources.
See https://docs.blockly.com/guides/get-started/code-generation/
for the distinction between blocks and generated-code execution; this MVP does
not run arbitrary JavaScript/Python. Child profiles contain nicknames and path
choices, not child email, location or birthdate. No unrestricted chat or payments.

## Dependency maintenance
Patch Next.js/eslint-config-next to 16.3.8, sharp to 0.35.5 and source-map-js to
1.2.2. Patch React and React Server DOM to 19.2.8, Vite to 8.0.16, and vulnerable
image-size/undici/ws dependencies within their existing major versions. Retain
committed lockfiles and audit dependencies before delivery.
Maintainer advisories:
- https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j
- https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w

## Next phases and acceptance
1. Author unique lessons and explicit objectives for loops, conditions and debugging.
2. Add safe profile editing and guardian controls before teacher-managed classrooms.
3. Add pagination and export of private history beyond the current 1,000-record cap.
4. Validate offline asset upgrades and shared-device storage recovery.
5. Treat real-language execution as a separately reviewed sandbox project.

Test game rules and real SQLite permissions, learner deletion beyond 35 results,
strict types/lint, both builds and eight browser games on desktop/mobile.
Use /api/health and runtime error monitoring; back up D1 and exercise restore.
Status: working MVP, continuing development; the full curriculum is not complete.

# Delivery checkpoint

Eight playable games, safe Blockly/HTML, private learning paths, guardian-owned
profiles, account history, Daily Five, calm mode and independent D1 deployment
are implemented. 24 rule/API tests pass. All eight browser game journeys, reload persistence, child privacy, guardian
deletion and desktop/mobile layouts pass with no JavaScript errors. Actual
screenshots are in docs/screenshots. Final publication is recorded in the overall
delivery report after verifying GitHub and the native deployment response.

GitHub: https://github.com/miikese/mindgrow
Local URL: http://127.0.0.1:3102
See README.md for remaining advanced phases and docs/security.md for limitations.

## 12 October 2026 — reliable family cleanup and scoped private history

- Learner removal now sends one DELETE; the server deletes its full history
  atomically while preserving other learners. This avoids write-quota exhaustion.
- Private listing ownership is applied in SQL before the result limit, so another
  household's volume cannot hide a learner's profile or results.
- Added PRODUCT_PLAN.md, regression tests for 45-result deletion and 1,001
  unrelated records, and a browser assertion for one-request family deletion.
- Patch dependency updates and a clean npm ci were verified. Production dependency
  audit: 0 findings. Full toolchain audit: 19 findings (11 high, 5 moderate, 3 low),
  documented in docs/security.md; do not claim a fully clean toolchain audit.
- 26/26 unit/API tests, strict TypeScript, authored-code ESLint and both production
  builds pass. The final browser run checks all eight activities, account-backed
  reload persistence, learner UI deletion, safe HTML preview and desktop/mobile.
- The Blockly chunk remains large but is loaded only when visual coding opens.
- Status: working MVP, continuing development; full curriculum and toolchain
  maintenance remain future phases. Hosted updates must be separately verified.

## 12 October 2026 — restart recovery verified

- Last completed task: Preserved the recovered application and verified its complete browser feature journeys.
- Current phase: tested recovery checkpoint, independent GitHub and Sites delivery.
- Implemented recovery improvements: `APP_STATE_DIR` isolates browser fixtures
  from saved local records; browser checks now assert 320/390/768/1440px layouts.
- Latest verified source commit before this checkpoint: `5c6cf20a03483037e06ff079f944f39764872364`.
  The checkpoint commit is available with `git rev-parse HEAD`; the exact final
  remote SHA/CI/deployment outcomes are recorded in the workspace recovery report.
- Tests: 26/26 unit/API tests, strict TypeScript and authored-code ESLint
  passed. Local and hosted Worker production builds passed. Browser journeys
  passed with no JavaScript errors; screenshots were refreshed.
- Dependency audit: runtime 0 findings; full toolchain 19 findings
  (11 high, 5 moderate, 3 low). Benue also passed a clean `npm ci`.
- Deployment: existing restricted Site confirmed successfully published at
  `https://mindgrow.readyloom3.chatgpt.site`; this new checkpoint requires its
  matching source push, saved version and terminal deployment verification.
- Remaining features: see PRODUCT_PLAN.md; advanced scope is still in development.
- Next recommended task: verify checkpoint delivery, then review supported
  build-toolchain upgrades and the project's prioritized product roadmap.
- Local opening: `python3 /home/student/portfolio-site/scripts/open-local-projects.py`
  starts all four previews without resetting their normal local databases.

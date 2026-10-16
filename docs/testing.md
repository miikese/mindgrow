# Validation

64 Vitest rule, learning-plan, and SQLite-backed API tests cover deterministic matching decks, pattern and
sequence rules, maze collisions and wins, interpreted Blockly loops/budgets,
Sudoku validity across 100 levels, word solvability, HTML challenge checks,
difficulty recommendations, private profiles, guardian permissions,
free access across learning paths, progress persistence and cascade deletion.

Browser QA uses the actual built React application and checks all eight games
through UI interactions, plus wrong answers, real Blockly execution, restricted
iframe attributes, eight account completions after reload, public-record privacy,
guardian deletion, mobile navigation and horizontal overflow.

```sh
python3 -m pip install playwright
python3 -m playwright install chromium
# Start PORT=3102 npm run local in another terminal.
python3 scripts/e2e.py
```

A system Chrome can be selected with PLAYWRIGHT_CHROMIUM_EXECUTABLE.
Screenshots are actual browser captures under ignored `outputs/browser-qa/`.
TypeScript strict checking, authored-code lint and both production builds are
run before publication. Hosted ChatGPT login is independent of local mock identity.

## Expanded experience

`tests/expansion.test.ts` verifies reachable mazes for every level/difficulty,
sliding puzzle solvability, reachable lantern boards, 100 distinct scrambled
words, valid Sudoku solutions, recall lengths, arithmetic targets, progressive
HTML validation, and complete learning plans within the chosen daily budget.
The service suite verifies that all four new game types save at level 100.

Run the original eight-game regression and the expanded UI checks against a
separate local database so your normal learning history is left alone:

```sh
APP_STATE_DIR=/tmp/mindgrow-browser-qa PORT=3103 npm run local
APP_URL=http://127.0.0.1:3103 python3 scripts/e2e.py
APP_URL=http://127.0.0.1:3103 python3 scripts/e2e-expansion.py
```

The expansion script solves the displayed sliding and lantern puzzles, observes
and repeats the actual recall sequence, checks level-100 play, exercises lesson
quiz feedback and persistence, verifies saved plan settings and the quiet garden,
and checks all new sections at 320, 390, 768, and 1440 pixels. Its screenshots are
saved to ignored `outputs/browser-qa/`. Python examples are reading exercises;
there is no Python runtime or arbitrary code evaluation in the site.

## Rules, falling blocks, and final assessments

`tests/falling-blocks.test.ts` checks all seven shapes, rotation, collisions,
row removal, ghost/hard drop, hold restrictions, pause, speed progression, top
out, and reset. `tests/assessments.test.ts` checks course gates, private attempts,
server grading, hidden keys, immutable submissions, practical response bounds,
owner-only certificate assignment, revision, and learner deletion.

For the complete browser journey, create ignored fixtures and use isolated state:

```sh
node scripts/create-qa-fixtures.mjs
APP_ENV_FILE=outputs/browser-qa/owner.env APP_STATE_DIR=/tmp/mindgrow-exam-qa PORT=3103 npm run local
# In another terminal:
APP_URL=http://127.0.0.1:3103 python3 scripts/e2e-rules-exams.py
```

That script observes actual falling-block controls, advances active browser time
to verify faster gravity, checks pause/reset and mobile boards, completes all six
Go quizzes through the UI, resumes an exam draft, submits a qualifying response,
and manually awards a test-only certificate in the isolated owner account. It
also checks that a passing learner cannot automatically issue a certificate.
Only isolated QA fixtures receive test awards; normal local learner data is not
modified. Screenshots are saved to ignored `outputs/browser-qa/`.

## Visitor access and administration

Using the same isolated server and generated fake-owner environment, run:

```sh
APP_URL=http://127.0.0.1:3103 python3 scripts/e2e-admin-access.py
```

This checks the one playable visitor game, locked game/course previews, first-play
rules and progress, returning to the next level, free membership, owner login and
logout, real monitoring counts, pricing drafts, rejection of paid mode, and four
viewport widths. `tests/administration.test.ts` also covers password hashing,
forged/expired/revoked sessions, credential rotation, login rate limits, cross-origin
requests, trusted platform owners, and rejection of member access to owner APIs.
Generated fixture credentials are test-only; real owner credentials are never
used by these browser scripts.

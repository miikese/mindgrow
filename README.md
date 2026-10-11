# MindGrow

**Play. Think. Learn. Grow.**

A working educational-game MVP with eight playable activities, real Blockly
programming, safe HTML/CSS previews, and private guardian-owned learner progress.
React, TypeScript, Vinext, SQLite-compatible D1, and a lightweight local runner.
This repository and its database/deployment are independent of the other projects.

## Run locally on Linux

Node 22.13+ and npm:

```sh
npm ci
npm run build:local
PORT=3102 npm run local
```

Open http://127.0.0.1:3102. SQLite is created and schema migrations are applied
automatically in ignored `.local-state/data.sqlite`.
Sign-in uses an explicit loopback-only development account.
Guest play needs no account; game positions and guest completions stay on the
device. Sign in and create a private nickname profile for account-backed history.
Guardian profiles persist across restarts; local sessions require a new sign-in.

## Playable activities

1. **Fruit friends:** matching cards with deterministic shuffled pairs.
2. **What comes next?:** repeating color patterns.
3. **Number trails:** arithmetic sequences at three difficulty choices.
4. **Robot ramble:** a real 5 × 5 logic maze with buttons and arrow-key controls.
5. **Code your adventure:** a real Blockly workspace with movement and repeat
   blocks, drag-and-drop, bounded interpretation, visual execution, step-through,
   reset, saved blocks, and a keyboard-friendly block insertion alternative.
6. **A moment of Sudoku:** valid introductory 4 × 4 puzzles.
7. **Word wander:** letter-unscrambling with meaningful hints, including Benue.
8. **Your first web page:** editable HTML/CSS, syntax-colored source, a live
   sandboxed preview, and actual challenge validation.

All games have 50 selectable practice levels, hints and completion feedback.
Memory, maze, Sudoku, HTML and Blockly work can be resumed from device storage.
Some activities rotate deterministic variants; levels are not 50 unique authored
lessons. No game score claims to measure intelligence or diagnose cognitive health.

## Accounts, paths and family tools

Four paths: Little Thinkers (4–7), Young Coders (8–12), Future Developers (13–17),
and Mind Fitness (18+). Content selection is enforced when saving practice.
Guardian accounts own linked nickname profiles; no child birth date, email,
location, public profile, unrestricted messaging, advertising tracker or payment
is collected. Guardians view history, select a path at creation, set gentle
reminders, switch learners and delete learners plus their associated practice.

Completed activities save to D1/SQLite. Points are derived from hints on the
server. Rules-based recommendations use recent attempts, with no paid AI API.
Optional achievement feedback, a Daily Five, sound, calm Relax Mode, dark/light
themes, reduced-motion support and adjustable text size are included.
There are no forced timers, missed-day penalties, competitive leaderboards
or punitive streaks.

## Safety

Blockly programs are read into a small instruction tree and interpreted with
maximum nesting/loop/step budgets. No eval, generated-JavaScript execution or
arbitrary backend code execution is used.
HTML previews use an iframe without allow-scripts or allow-same-origin, and a
CSP blocking external resources. Python and arbitrary JavaScript execution are
not enabled. Hosted authentication remains dispatch-owned ChatGPT sign-in.

## Verify

```sh
npm run typecheck
npm run lint
npm test
npm run build:local
npm run build
```

24 executed rule/API tests cover all game engines and private profile permissions.
Python Playwright exercises all eight games, including actual Blockly commands,
wrong/correct answers, persistence after reload, safe preview configuration,
account privacy, deletion and mobile layouts. See docs/testing.md.

## Deploy

The independent .openai/hosting.json declares the Site and D1 binding.
Sites provisions D1 and applies committed Drizzle schema-only migrations before
publishing the built Worker. New connected Sites are private and require ChatGPT
sign-in. See docs/deployment.md. The local companion's mock login must never be
exposed as a public production authentication service.

The installable shell cache excludes private APIs and auth routes. Device-local
games can be revisited offline after their assets load; hosted sign-in and
account synchronization need a connection. Blockly is loaded only when opened.

## Future phases

9 × 9 Sudoku, chess/crosswords/logic grids, more unique authored levels, full
condition/variable/function adventure campaigns, safe JavaScript/Python sandboxes,
teacher assignments/classrooms, guardian PIN controls, profile editing,
soundtracks and additional languages remain future work.
The playable MVP does not claim completion of the full advanced feature brief.

No overall software license has been selected. Blockly is Apache-2.0; dependency
and media license notices retain their original terms.

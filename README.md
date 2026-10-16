# MindGrow

**Play. Think. Learn. Grow.**

A working educational-game MVP with thirteen playable activities, real Blockly
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
Visitors can play Fruit friends and preview the other games and course outlines.
Signing in unlocks every game, course, learning plan, and quiet break for free.
Game positions and visitor completions stay on the device. Create a private
nickname profile for account-backed history.
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
8. **Your first web page:** progressive HTML/CSS challenges, syntax-colored source,
   a sandboxed live preview, and validation of headings, lists, links and styles.
9. **Sliding squares:** solvable 3 × 3 sliding-tile puzzles.
10. **Lantern garden:** light every lantern by toggling neighboring cells.
11. **Remember the rhythm:** watch a color sequence and repeat it.
12. **Make the number:** choose the arithmetic operation that reaches the target.
13. **Falling blocks:** rotate seven kinds of pieces, hold/swap, soft or hard drop,
    and clear rows. Active play time and cleared rows increase gravity speed.
    Includes keyboard/touch controls, a ghost outline, next/held previews, pause,
    tab-switch auto-pause, restart, and a device-local personal best.

Opening a game for the first time shows its rules, controls, strategy, and personal
progress before play starts. Returning visits resume the next unexplored level.
The **Rules & progress** panel remains inside each game; opening it pauses Falling
blocks without resetting the board. Movement and rotation buttons sit together
directly below that board, including on phones.

The twelve practice games have 100 selectable levels; Falling blocks is endless.
Practice games include hints and completion feedback.
Memory, maze, Sudoku, HTML and Blockly work can be resumed from device storage.
Word Wander has 100 distinct words. Robot and Blockly mazes change by level,
with larger boards later or at higher difficulties. Other activities use seeded
practice variants; these are not 100 separately authored lessons. No game score claims to measure intelligence or diagnose cognitive health.

## Beginner lessons, learning plans, and quiet breaks

**Learn something** includes 30 lessons across Programming foundations, Build your
first website, Python for beginners, Go for beginners, and CSS for beginners. Each has an explanation, a code example,
a small task and a checked quiz. Examples are read-and-reason exercises; Python and Go
are not executed in the browser. The web and foundations tracks connect to games.

**Learning plan** lets learners choose a track and a 10-, 15-, or 20-minute daily
pace. Longer lessons split across study days. Plans and reading progress are
saved per learner in this browser. Correct lesson quizzes are also verified and
saved on the account when a private learner profile is selected. A free membership
is required to use lessons and learning plans.

**Unwind** offers Cloud bubbles, a saved Quiet garden, and a pausable breathing
circle. These have no levels, scores, deadlines or completion requirements.

## Final exams and personally awarded certificates

Every track ends in a final exam, unlocked only after all lesson quizzes have
been verified on the learner's account. Each has 12 multi-step reasoning or
code-tracing questions and two practical tasks requiring code, explanation,
and edge-case tests. Drafts save on the device; submitted attempts persist in
the database and are immutable. The server marks reasoning answers with an 85%
pass threshold. Marking keys are never included in the client bundle or an
unsubmitted learner paper. Failed reasoning requires a fresh attempt.

Passing reasoning places practical work in **Owner review**; it never issues a
certificate. Only an administrator/site owner (not a learner or moderator) can
review both practical responses, attest to approval, give feedback, and assign
their own certificate reference. They can also request a revised attempt. Exam
reports can be downloaded as JSON and are explicitly not certificates. Awarded
records display the owner's reference, reviewer, feedback, and review date.

The loopback development sign-in is an ordinary member by default. Owner access
uses the private `/admin` login or an authorized ChatGPT identity. Deleting a
learner or account removes associated lessons and exam records as well.

## Owner administration

`/admin` provides private monitoring of learners, practice, verified lessons, exam
reviews, and manually awarded certificates. Its access settings keep all members
in free mode. A future membership price and currency can be saved as a draft;
paid mode cannot be enabled until a real payment integration is connected.

To configure the owner locally, run `node scripts/configure-owner.mjs` and provide
the requested JSON through its hidden terminal input. The helper writes only the
owner email and a salted scrypt hash to ignored, restricted `.env.local`. Configure
`OWNER_EMAIL` and `OWNER_PASSWORD_HASH` as hosted runtime secrets for deployment.
Passwords never belong in source or browser assets. Owner sessions expire after
12 hours and can be revoked by signing out or rotating the configured hash.

## Accounts, paths and family tools

Four paths: Little Thinkers (4–7), Young Coders (8–12), Future Developers (13–17),
and Mind Fitness (18+). These paths guide discovery; all signed-in members may
explore every game.
Guardian accounts own linked nickname profiles; no child birth date, email,
location, public profile, unrestricted messaging, advertising tracker or payment
is collected. Guardians view history, select a path at creation, set gentle
reminders, switch learners and delete learners plus their associated practice.

Completed activities save to D1/SQLite. Points are derived from hints on the
server. Rules-based recommendations use recent attempts, with no paid AI API.
Optional achievement feedback, a Daily Five, sound, calm Relax Mode, dark/light
themes, reduced-motion support and adjustable text size are included.
Practice puzzles are untimed. Falling blocks has increasing gravity and can
be paused. There are no missed-day penalties or punitive streaks.

## Safety

Blockly programs are read into a small instruction tree and interpreted with
maximum nesting/loop/step budgets. No eval, generated-JavaScript execution or
arbitrary backend code execution is used.
HTML previews use an iframe without allow-scripts or allow-same-origin, and a
CSP blocking external resources. Python and arbitrary JavaScript execution are
not enabled. Member authentication uses dispatch-owned ChatGPT sign-in. The
separate owner password login is rate-limited and uses HttpOnly session cookies.

## Verify

```sh
npm run typecheck
npm run lint
npm test
npm run build:local
npm run build
```

64 executed rule/API tests cover game engines, all 100 generated levels, learning plans,
falling-block physics, assessment permissions, marking, manual awards, and privacy.
Python Playwright exercises the original eight games and the expanded games,
lessons, exams, signup gates, owner dashboard, and mobile layouts. It checks real
Blockly commands, wrong/correct answers, persistence, privacy, and deletion.
See docs/testing.md.

## Deploy

The independent .openai/hosting.json declares the Site and D1 binding.
Sites provisions D1 and applies committed Drizzle schema-only migrations before
publishing the built Worker. The public site permits visitor previews; ChatGPT
sign-in unlocks free member content. See docs/deployment.md. The local mock login must never be
exposed as a public production authentication service.

The installable shell cache excludes private APIs and auth routes. Device-local
games can be revisited offline after their assets load; hosted sign-in and
account synchronization need a connection. Blockly is loaded only when opened.

## Future phases

9 × 9 Sudoku, chess/crosswords/logic grids, more advanced authored campaigns, full
condition/variable/function adventure campaigns, safe JavaScript/Python sandboxes,
teacher assignments/classrooms, guardian PIN controls, profile editing,
soundtracks and additional languages remain future work.
The playable MVP does not claim completion of the full advanced feature brief.

No overall software license has been selected. Blockly is Apache-2.0; dependency
and media license notices retain their original terms.

## Isolated browser verification

Set `APP_STATE_DIR` on the local runner to keep browser fixtures separate from
your saved data. The default remains `.local-state`; existing records are preserved.
For example, use `APP_STATE_DIR=/tmp/mindgrow-qa npm run local`,
then run `python3 scripts/e2e.py` in another terminal. Use a fresh directory for
each run. Browser checks include 320px, 390px, 768px and 1440px layouts.

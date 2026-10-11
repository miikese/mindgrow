# Validation

24 real SQLite-backed Vitest tests cover deterministic matching decks, pattern and
sequence rules, maze collisions and wins, interpreted Blockly loops/budgets,
Sudoku validity across 50 levels, word solvability, HTML challenge checks,
difficulty recommendations, private profiles, guardian permissions,
age-based server validation, progress persistence and cascade deletion.

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
Screenshots are actual browser captures under screenshots/.
TypeScript strict checking, authored-code lint and both production builds are
run before publication. Hosted ChatGPT login is independent of local mock identity.

---
name: fix-issue
argument-hint: [issue-number]
description: Read GitHub issue, fix bug, write regression test, commit.
---

Fix GitHub issue #$ARGUMENTS:

1. `gh issue view $ARGUMENTS` — read the full issue and comments.
2. Identify which platform(s) are affected (iOS / Android / both).
3. Trace the code path to the root cause.
4. State the root cause before writing any code.
5. Implement the minimal fix.
6. Verify the fix doesn't break the other platform.
7. Write a regression test (RNTL for component bugs, Detox for flow bugs).
8. `npm test` — all tests must pass.
9. Commit: `fix: [description] (closes #$ARGUMENTS)`

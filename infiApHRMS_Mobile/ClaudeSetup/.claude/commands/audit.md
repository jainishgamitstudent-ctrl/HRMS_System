---
name: audit
argument-hint: [performance|security|all]
description: Run a full audit of the app. Covers performance, security, and code quality.
---

Run "$ARGUMENTS" audit:

## If "performance" or "all"
1. Invoke `performance-auditor` agent — full scan.
2. Report: HIGH IMPACT issues first, then MEDIUM, then LOW.

## If "security" or "all"
1. Invoke `security-auditor` agent — full scan.
2. `npm audit --audit-level=high` — flag CVEs.
3. `npx expo-doctor` — flag outdated/mismatched packages.
4. Report: CRITICAL first, then HIGH, then MEDIUM.

## If "all"
Run both audits, then produce a combined priority-ordered action plan:
- Immediate (CRITICAL security / HIGH perf)
- This sprint (HIGH security / MEDIUM perf)
- Backlog (MEDIUM security / LOW perf)

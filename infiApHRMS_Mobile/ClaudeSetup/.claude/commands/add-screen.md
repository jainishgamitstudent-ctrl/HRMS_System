---
name: add-screen
argument-hint: [screen-name e.g. "PostDetail" or "UserProfile"]
description: Scaffold a complete Expo Router screen with query hook, component, and tests.
---

Scaffold the "$ARGUMENTS" screen:

1. Read `CLAUDE.md` and browse `app/` to understand current routing structure.
2. Determine the correct file path in `app/` based on the screen name and navigation context.
3. Invoke `screen-builder` agent to create:
   - `app/[path].tsx` — Expo Router screen
   - `components/[feature]/[Name].tsx` — Presentational component
   - `hooks/use[Name].ts` — TanStack Query hook
4. Invoke `test-writer` agent to create component and hook tests.
5. `npm test` — all tests must pass.
6. Commit: `feat: add $ARGUMENTS screen`

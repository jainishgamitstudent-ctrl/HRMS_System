---
name: ship
argument-hint: [ota|build] [staging|production]
description: Ship an update. "ota" for JS-only changes, "build" for native changes.
---

Ship via $ARGUMENTS:

## If "ota [branch]" — JS-only OTA update
1. `npm run type-check` — zero TS errors.
2. `npm run lint` — zero lint errors.
3. `npm test` — all tests passing.
4. Confirm no native module changes in the diff (`git diff HEAD~1 -- ios/ android/` must be empty).
5. `eas update --branch [branch] --message "[describe the change]"`
6. Report the update URL and confirm it's live.

## If "build [platform] [environment]" — Full EAS build (native changes)
1. `npm run type-check` — zero TS errors.
2. `npm run lint` — zero lint errors.
3. `npm test` — all tests passing.
4. Invoke `security-auditor` agent — no CRITICAL findings.
5. `npx expo-doctor` — no errors.
6. Bump version in `app.json` (`version` and `buildNumber`/`versionCode`).
7. `eas build --platform [platform] --profile [environment]`
8. Report the build ID and monitor for completion.
9. On success: `eas submit --platform [platform]` if deploying to stores.

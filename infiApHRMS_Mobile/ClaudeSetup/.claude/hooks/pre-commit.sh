#!/bin/bash
# Pre-commit: TypeScript → ESLint → Tests → Expo Doctor check
# Exit 2 = BLOCK. Exit 0 = allow.

set -e
echo ""
echo "🔍 Running React Native pre-commit checks..."

# ── TypeScript ──────────────────────────────────────────────
echo "  [1/3] TypeScript..."
npx tsc --noEmit 2>&1
if [ $? -ne 0 ]; then
  echo "  ❌ TypeScript errors. Fix before committing."
  exit 2
fi
echo "  ✅ TypeScript clean"

# ── ESLint on staged files ──────────────────────────────────
echo "  [2/3] ESLint..."
STAGED=$(git diff --cached --name-only | grep -E "\.(ts|tsx)$" || true)
if [ -n "$STAGED" ]; then
  npx eslint $STAGED --quiet 2>&1
  if [ $? -ne 0 ]; then
    echo "  ❌ ESLint errors. Run 'npm run lint:fix' then re-stage."
    exit 2
  fi
fi
echo "  ✅ ESLint clean"

# ── Jest tests ──────────────────────────────────────────────
echo "  [3/3] Tests..."
npm test -- --silent --passWithNoTests 2>&1
if [ $? -ne 0 ]; then
  echo "  ❌ Tests failing. Fix before committing."
  exit 2
fi
echo "  ✅ Tests passing"

echo ""
echo "✅ All checks passed!"
exit 0

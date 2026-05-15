#!/bin/bash
# After `npx expo install *`: run expo-doctor to catch version mismatches early.

echo ""
echo "📦 Running expo-doctor after install..."
npx expo-doctor 2>&1

if [ $? -ne 0 ]; then
  echo ""
  echo "⚠️  expo-doctor flagged issues. Review above before continuing."
  echo "   Run 'npx expo install --fix' to auto-resolve version conflicts."
fi

exit 0

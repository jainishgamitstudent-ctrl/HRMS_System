#!/bin/bash
# Post-edit: auto-format saved file.

if [ -z "$CLAUDE_FILE_PATH" ]; then exit 0; fi

FILE="$CLAUDE_FILE_PATH"

if [[ "$FILE" =~ \.(ts|tsx)$ ]]; then
  npx prettier --write "$FILE" --log-level silent 2>/dev/null
  npx eslint "$FILE" --fix --quiet 2>/dev/null
fi

exit 0

#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

# Pushlabs OS: .env and node_modules are gitignored, so a fresh container starts
# without them. Restore the local dev setup so the app is runnable immediately.
cd "${CLAUDE_PROJECT_DIR}"
if [ -f package.json ] && grep -q '"pushlabs-production-os"' package.json; then
  [ -f .env ] || cp .env.example .env
  if [ ! -d node_modules ]; then
    npm install --no-audit --no-fund
    ./node_modules/.bin/prisma db push --skip-generate
    npm run db:seed
  fi
fi

RUFLO_VERSION="3.5.80"

# Install ruflo globally from npm (pinned version; npm verifies tarball integrity via registry SRI)
if ! command -v ruflo &>/dev/null; then
  npm install -g "ruflo@${RUFLO_VERSION}"
  # Assert installed version matches pin — catches registry substitution attacks
  installed=$(ruflo --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "unknown")
  if [ "$installed" != "$RUFLO_VERSION" ]; then
    echo "ERROR: ruflo version mismatch: expected ${RUFLO_VERSION}, got ${installed}" >&2
    exit 1
  fi
else
  echo "ruflo already installed: $(ruflo --version 2>/dev/null || true)"
fi

# Install Google Magika with hash-verified wheels (prevents supply-chain tampering)
if ! command -v magika &>/dev/null; then
  pip3 install --quiet --require-hashes --no-cache-dir \
    -r "${CLAUDE_PROJECT_DIR}/.claude/requirements-magika.txt"
else
  echo "magika already installed: $(magika --version 2>/dev/null || true)"
fi

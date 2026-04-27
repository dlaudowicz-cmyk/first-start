#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

# Install ruflo globally from npm (pinned to known-good version for supply-chain security)
if ! command -v ruflo &>/dev/null; then
  npm install -g ruflo@3.5.80
else
  echo "ruflo already installed: $(ruflo --version 2>/dev/null || true)"
fi

# Install Google Magika (AI-powered file-type detection for security analysis)
if ! command -v magika &>/dev/null; then
  pip3 install --quiet magika==1.0.2
else
  echo "magika already installed: $(magika --version 2>/dev/null || true)"
fi

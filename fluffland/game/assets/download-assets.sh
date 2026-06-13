#!/usr/bin/env bash
# Download all official FLUFFLAND game assets into this folder for offline use.
# Run once from a machine that can reach the CDN (e.g. your Mac):
#     cd fluffland/game/assets && ./download-assets.sh
# Afterwards the game loads everything from ./assets/ (CDN is only a fallback).

set -euo pipefail
cd "$(dirname "$0")"

BASE="https://d8j0ntlcm91z4.cloudfront.net/user_2zgOr7TeJ3XfOp5A4ZVnU1QsvmW"

FILES=(
  # start-screen key visual (whole Fluffland crew)
  "hf_20260613_145226_a7c4e419-56c5-46c2-ba70-b5ad1515c9e3.png"
  # leader / friend cards (gallery)
  "hf_20260612_145509_c6b54112-1c47-4710-9cd0-0f764f850112.png"  # crossi
  "hf_20260612_145511_b6698837-6cab-4e30-b50e-0aef468e9c23.png"  # zeddy
  "hf_20260612_152241_8350ab34-5f37-4132-aa52-5bc37e992049.png"  # nana
  "hf_20260612_145516_b196119e-f5b6-4252-8bae-da63872a48ac.png"  # manny
  "hf_20260612_145519_dd92b5ff-bea5-43cb-b4a2-be1a57199fb9.png"  # lunelle
  "hf_20260612_145523_40c9bcb7-e3d3-44c0-a7a5-603cb707bdbb.png"  # risto
  "hf_20260612_145526_e202aa2e-7307-43e9-ab14-1e5d22f1629e.png"  # cora
  "hf_20260612_145741_822343b9-4b0b-4135-9a03-d25fb1bc7b25.png"  # fluffs group
  # plush mini-fluff body sprites
  "hf_20260613_103709_5fee7daa-a77b-4809-8d5f-1c3dcbdc8cd2.png"  # pink
  "hf_20260613_103714_78b008db-25ef-4bc6-8755-bf03c89912b9.png"  # mint
  "hf_20260613_120457_23934851-bb8c-4c94-b815-bb423a220922.png"  # lilac (braids)
  "hf_20260613_120458_4729f163-cefd-4657-9a3c-f34c12696c86.png"  # peach (braids)
)

ok=0; fail=0
for f in "${FILES[@]}"; do
  if [ -s "$f" ]; then echo "skip (exists): $f"; ok=$((ok+1)); continue; fi
  echo "downloading: $f"
  if curl -fsSL "$BASE/$f" -o "$f"; then ok=$((ok+1)); else echo "  FAILED: $f"; fail=$((fail+1)); fi
done

echo "----"
echo "done: $ok ok, $fail failed"
[ "$fail" -eq 0 ] || { echo "Some downloads failed (CDN links can expire). Re-run or refresh the assets."; exit 1; }

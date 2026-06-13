# Game assets (offline copies)

The game loads images **offline-first**: it tries `./assets/<file>` first and
falls back to the Higgsfield CDN only if a local copy is missing. That means the
game works whether or not these files are present — but downloading them makes it
self-contained and immune to expiring CDN links.

## Populate this folder

Run once from a machine that can reach the CDN (e.g. your Mac):

```bash
cd fluffland/game/assets
./download-assets.sh
```

This fetches all 13 PNGs (start-screen key visual, 8 friend cards, 4 plush
Mini-Fluff body sprites) into this folder. Re-run any time to refresh.

> Note: This couldn't be run from the Claude Code web environment because the
> CDN host is not on that environment's network allowlist. Run it locally, or add
> `d8j0ntlcm91z4.cloudfront.net` to the environment allowlist so it can fetch
> them. After the files are here, commit them to keep the game fully offline.

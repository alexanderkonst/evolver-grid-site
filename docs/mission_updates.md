# Mission Updates (Source of Truth + Sync)

## What this does
Mission data lives in files inside the repo, but the app reads mission data from the database. The sync flow replaces the database with whatever is in the files so the app and the source data stay aligned.

## Source-of-truth files
All mission edits happen here:

- `src/modules/mission-discovery/data/pillars.ts`
- `src/modules/mission-discovery/data/focusAreas.ts`
- `src/modules/mission-discovery/data/challenges.ts`
- `src/modules/mission-discovery/data/outcomes.ts`
- `src/modules/mission-discovery/data/missions.ts`

## Update flow (single path)
1) Edit the mission files above.  
2) Update the mission summary file:

```
npm run update:mission-manifest
```

This regenerates `public/mission-manifest.json`, which is used to confirm your local dataset matches `main`.

If you prefer, open `/admin/mission-sync` and click **Download mission summary file** to grab the updated `mission-manifest.json`, then replace the file in your repo.

3) Open `/admin/mission-sync` and click **Check and Sync Missions**.

The admin page will:
- verify the local summary matches `main`,
- block sync if it does not,
- then replace all mission data in the database with the updated files.

## Why this flow exists
- Prevents syncing from a stale or partial copy of the mission files.
- Makes the mission dataset evolve safely over time.
- Creates a predictable, documented process for anyone who touches missions.

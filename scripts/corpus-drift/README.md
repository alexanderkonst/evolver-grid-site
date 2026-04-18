# Corpus Drift Check

Guards the invariant that **the code and the corpus tell the same story** about the 7-step journey.

## What it checks

| # | Invariant | Why |
|---|---|---|
| **C1** | `PLAYBOOK_STEPS[i].price` agrees with the Price column in the canvas v3.0 table | Commercial packaging must stay coherent. Catches bugs like "canvas says $222, code says $555". |
| **C2** | `PLAYBOOK_STEPS[i].subtitle` matches the canvas Canonical Subtitle column | Subtitles are psychoactive and verbatim from Sasha. Zero paraphrasing. |
| **C3** | If Step X bundles with Step Y then Step Y bundles with Step X, and both canvas rows name the same container | Asymmetric or mis-named bundles break the Ignition / Build story. |

## How to run

```bash
npm run corpus:drift           # human-readable, exits 1 on drift
npm run corpus:drift:md        # also writes corpus-drift-report.md
node scripts/corpus-drift/index.mjs --json    # JSON-only for CI parsing
```

Exit codes:

- `0` — all checks green
- `1` — drift detected
- `2` — reader failure (source file missing / unparseable)

## Price normalisation

Code uses terse display strings (`"$1,111 + rev share"`) while the canvas often uses verbose spec strings (`"$1,111 + rev share (bundled with Step 5; full terms: $1,111 upfront + $2.5K capped from first $10K revenue)"`). The check extracts a semantic fingerprint — dollar amounts + `rev share` / `equity` / `free` / `tbd` tokens — and compares those. Same dollars in the same set → match.

## Adding a new check

1. Create `scripts/corpus-drift/checks/my-check.mjs`.
2. Export `id`, `name`, and `run({ code, canvas })` returning `{ id, name, total, aligned, issues, passed }`.
3. Register it in `CHECKS` inside `index.mjs`.

Each issue should include `step`, `message`, and optionally `expected` / `actual` for contrasting output.

## CI

`.github/workflows/corpus-drift.yml` runs this on every PR and nightly at 03:00 UTC. PRs are blocked if drift is detected. The nightly run appends to `docs/09-logs/drift-reports/` so you always have a trail.

## Phase 2 (not yet built)

- `stageToStep()` mapping matches canvas "Output" column.
- Roadmap "Current Status" revenue field isn't stale (>7 days).
- `docs_index.md` covers every file under `docs/`.
- Founder-canvas state fields (e.g., `oyis_unique_business.md` tribe version) don't drift from the Supabase `game_profiles` row.

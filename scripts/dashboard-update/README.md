# Dashboard Update — Snapshot Renderer

Dated markdown snapshots of the project's operating state. **Precursor** to the `/admin/dashboard` page (Phase 1 of the autonomous navigation loop) — ships value today while the Supabase view + React page are in-flight.

## What it reads

1. `docs/02-strategy/roadmap.md` — Current Status + This Week's Scope (via the holomap-update input parser, reused)
2. `docs/09-logs/broadcast_tracker.md` — CRM via `scripts/sources/broadcast-tracker.mjs`
3. `docs/09-logs/session_log.md` — last 14 days of daily entries

## What it writes

`docs/09-logs/dashboard/YYYY-MM-DD.md` — one snapshot per run. Structure:

1. Headline numbers (cash, contracts, contacts, active clients, leaks)
2. Pipeline — stage distribution
3. Energy leaks — need boundary
4. Open commitments (open + done counts, first 15 open items)
5. Upcoming events
6. Roadmap snapshot (collapsed)
7. Recent activity (14-day session-log deltas)
8. Active clients table
9. Content pillars

## Usage

```bash
npm run dashboard:update             # write docs/09-logs/dashboard/<today>.md
node scripts/dashboard-update/index.mjs --stdout
node scripts/dashboard-update/index.mjs --date 2026-04-17
```

## Why a dated file, not a single "latest"

Keeps a frozen record of how Sasha understood the project on any given day. Git history + snapshot history = "what did we believe on Apr 10" is one `git log` away. When the `/admin/dashboard` page ships, these snapshots stay as a chronological archive.

## Hard constraints

1. **Read-only on upstream.** Never mutates roadmap or broadcast_tracker.
2. **Idempotent for the same day.** Rerunning overwrites today's file.
3. **Fails soft.** If any source is missing or parser throws, the section is marked unavailable — the run still succeeds.

## Phase 2 (later)

- Add Supabase signals once `founder_state_v1` ships (Phase 1 of nav loop): revenue funnel, onboarding-stage breakdown.
- Add week-over-week deltas (compare today's snapshot to last Monday's).
- Wire the GitHub Action so a nightly snapshot lands in PR form.

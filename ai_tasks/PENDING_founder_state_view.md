# PENDING: Founder State View (Phase 1 of Autonomous Navigation Loop)

**Lane:** Claude Code (multi-file src/ + supabase/ + /api/ pass)
**Blocked by:** none
**Spec source:** `docs/06-architecture/autonomous-navigation-loop.md` — Phase 1
**Priority:** 🔴 (blocks CRM integration, directive engine, and dashboard)

---

## Goal

Give the autonomous navigation loop a canonical view of **what's true about each founder right now** — one materialised Supabase view, one Sasha-only route, one dashboard roll-up. The holomap briefing packet and the directive engine both read from this view.

---

## Deliverables

### 1. Supabase view `founder_state_v1`

One row per user. Columns:

| Column | Type | Source |
|---|---|---|
| `user_id` | uuid | `game_profiles.user_id` |
| `slug` | text | derived from `game_profiles.display_name` or email local-part (kebab-case) |
| `display_name` | text | `game_profiles.display_name` |
| `email` | text | `auth.users.email` |
| `onboarding_stage` | text | `game_profiles.onboarding_stage` |
| `current_step` | int | derived via `stageToStep` logic mirrored in SQL (1–7) |
| `latest_zog_snapshot_at` | timestamptz | `MAX(zog_snapshots.created_at)` |
| `latest_zog_top_talent` | text | most-recent `zog_snapshots.top_talent_sentence` (or equivalent field) |
| `latest_qol_snapshot_at` | timestamptz | `MAX(qol_snapshots.created_at)` |
| `has_ignition` | bool | derived from `game_profiles.onboarding_stage` — `true` once stage ≥ `ignition_completed` (Ignition is already funnel-gated via the hardcoded Stripe payment link + existing webhook; no Stripe lookup needed here) |
| `has_build` | bool | derived from `game_profiles.onboarding_stage` — `true` once stage ≥ `build_entered`. Build is gated by Ignition completion in the funnel, so Stripe detection is not required |
| `revenue_total_usd` | numeric | Optional for v1. If a `payments` table exists, `SUM(amount_paid) / 100`. Otherwise leave `null` and populate once the payment-event ledger lands |
| `last_touch_at` | timestamptz | latest of `onboarding_stage_updated_at`, any snapshot insert |

Implement as a regular view first (refresh on read). If read volume warrants, promote to `MATERIALIZED VIEW` + pg_cron refresh every 10 minutes — but not in v1.

Migration file: `supabase/migrations/YYYYMMDDHHMMSS_founder_state_view.sql`.

### 2. Route `/founders` and `/founders/:slug`

**Access control:** Sasha-only. Check against a `profiles.role = 'admin'` column OR a `OWNER_USER_IDS` env array — whichever the repo already uses for admin gating.

**/founders (index):**
- Grid or table of every founder
- Columns: Display name, Current step (1–7 with a mini progress bar), Latest ZoG talent sentence (truncated), Revenue total, Last touch (relative), Link to detail
- Sort: last_touch_at DESC by default; toggles for current_step, revenue_total_usd

**/founders/:slug (detail):**
- Header: display name, email, current step, onboarding stage
- Card: Latest ZoG snapshot — full sentence + created_at
- Card: Latest QoL snapshot summary (if present)
- Card: Container flags — Ignition ✓ / Build ✓ derived from `onboarding_stage` (show the stage string and the transition timestamp from `onboarding_stage_updated_at`)
- Card: Revenue timeline — Optional for v1. Render only if a payments/charges source exists. Otherwise omit this card
- Card: Link to the founder's canvas file under `docs/02-strategy/unique-businesses/{slug}_unique_business.md` (render as `computer://` link if the file exists)
- Card: "Next action" — pulled from `founder_state_v1.next_action` if we add that column later; empty for v1

Put the page under `src/pages/admin/FoundersIndex.tsx` + `FounderDetail.tsx`. Reuse existing admin shell if one exists (check `src/pages/` for admin routes). Use shadcn cards, tables, and the existing liquid-glass styling.

### 3. Dashboard roll-up `/admin/dashboard`

Aggregates from `founder_state_v1`:

- Total founders (all-time)
- Founders at each step (1–7) — bar chart
- **Revenue total (read from the CRM snapshot)** — pull `cashReceivedUsd` and `revShareContractsUsd` from `scripts/sources/broadcast-tracker.mjs` until a DB-level payments ledger exists. Do **not** block the dashboard on a revenue table.
- New founders in last 7 days
- Founders who've completed Ignition but not entered Build (action surface)
- Stale founders — no touch in 14+ days

**CRM overlay.** Until the DB is the single source of truth for contact stage + segment, the dashboard additionally renders a CRM block pulled from `docs/09-logs/broadcast_tracker.md` via the existing `scripts/dashboard-update/` snapshot: total contacts, stage distribution, energy leaks flagged, upcoming events. Reuse the parser in `scripts/sources/broadcast-tracker.mjs`; do **not** reimplement it in the UI layer.

Put under `src/pages/admin/Dashboard.tsx`. Use `recharts` for bar charts; it's already available.

### 4. JSON export endpoint

Add `/api/founder-state.json` — edge function that returns the `founder_state_v1` rows as JSON. This is what the **holomap briefing packet** (Phase 3+ of the loop) will consume.

Auth: same gate as the admin UI. Env-based `FOUNDER_STATE_API_KEY` bearer token also acceptable for script access.

---

## Hard constraints

1. **Do not expose PII without auth.** `email` and `last_touch_at` are sensitive. Any unauth response must return 401.
2. **Do not refactor `useJourneyProgression.ts`** — mirror its `stageToStep` logic in SQL. If the logic drifts later, the corpus drift check (Phase 2 of that tool, not shipped yet) will catch it.
3. **Canvas file link is optional.** If `docs/02-strategy/unique-businesses/{slug}_unique_business.md` doesn't exist, hide the card. Do not create the file.
4. **Do NOT reintroduce Stripe priceId detection in v1.** Ignition is already funnel-gated via the hardcoded `STRIPE_PAYMENT_LINK` (`src/pages/IgniteSession.tsx`, `src/modules/zone-of-genius/AppleseedDisplay.tsx`) and the existing webhook that flips `onboarding_stage`. Build is gated by Ignition completion in the UX flow. Both flags derive from `onboarding_stage` only. A Stripe-level ledger can arrive later as a separate brief — do not scope it into this one.

---

## Acceptance

- [ ] `founder_state_v1` returns rows for every existing user in `game_profiles`
- [ ] `/founders` renders the index, Sasha-only
- [ ] `/founders/:slug` renders detail for each user
- [ ] `/admin/dashboard` renders aggregates + the CRM overlay block (pulled via `scripts/sources/broadcast-tracker.mjs`)
- [ ] `/api/founder-state.json` returns JSON with 401 for unauth
- [ ] `has_ignition` / `has_build` derive from `onboarding_stage` only — no Stripe priceId joins in the view
- [ ] `npm run test` green (including `scripts/sources/broadcast-tracker.test.mjs`)
- [ ] `npm run corpus:drift` still green after any UI copy edits
- [ ] `npm run dashboard:update` still renders a clean snapshot
- [ ] New migration applied and rollback-able

---

## Out of scope for this brief

- **Stripe-level ledger / payments ingest** — separate brief, if and when needed
- CRM migration to DB — CRM lives in `docs/09-logs/broadcast_tracker.md`; the dashboard reads it via the shipped parser. Migration to a DB-backed CRM is a later phase
- Holomap auto-apply (Phase 2 of nav loop, different spec)
- Directive engine proposals surface (Phase 5)
- Founder canvas edit-in-UI (corpus stays in markdown for now)

---

## Hand-back

When done, move this file to `ai_tasks/DONE_founder_state_view.md` with a "Notes from execution" section: what changed relative to this brief, any pattern-divergences, and the migration filename.

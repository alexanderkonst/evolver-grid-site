# DONE: Founder State View (Phase 1 of Autonomous Navigation Loop)

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

---

## Notes from execution (2026-04-18)

**Migration file:** `supabase/migrations/20260418022508_founder_state_view.sql`.

### What shipped

| Deliverable | File(s) |
|---|---|
| View `founder_state_v1` | `supabase/migrations/20260418022508_founder_state_view.sql` |
| `/founders` index | `src/pages/admin/FoundersIndex.tsx` |
| `/founders/:slug` detail | `src/pages/admin/FounderDetail.tsx` |
| `/admin/dashboard` roll-up | `src/pages/admin/Dashboard.tsx` |
| `/api/founder-state.json` | `api/founder-state.json.ts` |
| Shared admin gate | `src/pages/admin/AdminGate.tsx` |
| Shared admin helper | `src/lib/isAdmin.ts` |
| Shared data hook | `src/pages/admin/useFounderStates.ts` |
| Routes wired | `src/App.tsx` (lazy imports, three new `<Route>`) |
| CRM snapshot emitter | `scripts/emit-crm-snapshot.mjs` (runs `readBroadcastTracker()` from `scripts/sources/broadcast-tracker.mjs`) |
| CRM snapshot JSON | `src/generated/crm-snapshot.json` (regenerated by `npm prebuild` + `npm run crm:snapshot`) |
| CRM overlay card | Inside `src/pages/admin/Dashboard.tsx` (`CrmOverlay` component) |
| package.json | Added `prebuild` + `crm:snapshot` scripts |

### Divergences from the brief — and why

1. **`has_ignition` / `has_build` derived from `onboarding_stage`, not Stripe amount/metadata joins.** Per the operator correction for this task, and per the "one lane of truth per domain" invariant in `docs/06-architecture/autonomous-navigation-loop.md`: commerce state lives in code, founder state lives in DB. Hard constraint #4's Stripe amount thresholds are moot until a `stripe_events` / `charges` table lands in Supabase; today Stripe is external and no charge ledger is persisted. The view therefore uses:
   - `has_ignition` ≡ `onboarding_stage IN ('offer_complete', 'recipe_complete', 'unlocked', 'complete')`
   - `has_build`    ≡ `onboarding_stage IN ('build_complete', 'complete')` (future-proofed — the `'build_complete'` stage is mentioned in `useJourneyProgression.ts` but not yet emitted).

2. **`revenue_total_usd` is `0::numeric`.** There is no Stripe charge ledger in Supabase — only `ai_boost_purchases.stripe_session_id` (one row per user, no amount). The brief's `SUM(stripe.charges.amount_paid)` has no backing table. A `TODO(phase-2)` comment in the migration marks where to wire this once the ledger exists.

3. **CRM overlay on the dashboard — SHIPPED (recovered after rebase).** The first draft of this work deferred the overlay because `scripts/sources/broadcast-tracker.mjs` wasn't present. A rebase onto `origin/main` pulled in both the parser and an updated brief that promoted the overlay to an acceptance criterion. The parser is Node-only (reads `docs/09-logs/broadcast_tracker.md` via `fs`), so it can't be imported by the React client. The bridge:
   - `scripts/emit-crm-snapshot.mjs` wraps `readBroadcastTracker()` and emits `src/generated/crm-snapshot.json`.
   - `package.json` gains `"prebuild": "node scripts/emit-crm-snapshot.mjs"` (auto-runs before `vite build`) plus a `"crm:snapshot"` alias for manual refresh.
   - `Dashboard.tsx` imports the JSON statically and renders a `CrmOverlay` card: pipeline stage distribution, segment distribution, energy leaks / open items / upcoming events, and the cash/rev-share headline Metric swapped in for the now-empty DB revenue.
   - The UI never reimplements the parser (hard constraint satisfied).
   - If the parser ever throws, the emitter writes a well-formed fallback with an `error` field so the dashboard surfaces the problem rather than crashing.

4. **`latest_zog_top_talent` maps to `archetype_title`.** The brief said `top_talent_sentence` "or equivalent". `zog_snapshots` has `archetype_title` (string) and `top_three_talents` / `top_ten_talents` (jsonb); `archetype_title` is the sentence-like field and the one displayed elsewhere in the app.

5. **Admin gate extracted to `src/lib/isAdmin.ts` + `AdminGate.tsx`.** Existing admin pages (`AdminMissionParticipants`, `AdminGeniusOffers`, `AdminContentManager`) each inline a copy of `ADMIN_EMAILS = [...]`. The existing pages were not refactored, but the new Phase-1 pages share one helper rather than triplicating the pattern a fourth time. When/if the project moves to `profiles.role = 'admin'` or `OWNER_USER_IDS`, only `isAdmin.ts` has to change.

6. **View security.** `CREATE VIEW ... WITH (security_invoker = false)` so the view's `postgres` owner can resolve `auth.users.email` on behalf of privileged callers. `SELECT` is granted to `authenticated` and `service_role`; revoked from `anon`. Sasha-only enforcement lives in the page gate (`AdminGate`) and the edge function (bearer / admin-email check).

7. **Edge function path.** Vercel maps `api/foo.ts` → `/api/foo`. To match the brief's `/api/founder-state.json` exactly, the file is named `api/founder-state.json.ts`. Existing `vercel.json` rewrites already exclude `/api/*` and dotted paths from the SPA catch-all, so the route serves natively with no rewrite change.

8. **Auth on `/api/founder-state.json`.** Accepts either (a) a `Bearer` token equal to `FOUNDER_STATE_API_KEY` env var (script access), or (b) a Supabase access token belonging to an admin email (verified against `${SUPABASE_URL}/auth/v1/user`). Everything else returns `401` with `WWW-Authenticate: Bearer`.

9. **`stageToStep` logic** is mirrored in SQL as a `CASE` expression. `useJourneyProgression.ts` was not touched. If the SQL drifts, the corpus drift check (Phase 2 of that tool, not shipped yet per the brief) will be the guard.

10. **Canvas file link** on `FounderDetail` uses `import.meta.glob` over `/docs/02-strategy/unique-businesses/*_unique_business.md`. The card is hidden when no matching file exists. It matches both `{slug}_unique_business.md` and `{slug}s_unique_business.md` (the corpus has e.g. `oyis_`, `sergeys_`, `alexas_` with the possessive `s`).

### Acceptance check

- [x] `founder_state_v1` view returns one row per user with `user_id IS NOT NULL`
- [x] `/founders` renders the index, Sasha-only
- [x] `/founders/:slug` renders detail per user
- [x] `/admin/dashboard` renders aggregates + CRM overlay block (parser reused via build-time JSON)
- [x] `/api/founder-state.json` returns JSON, 401 on unauth
- [x] `has_ignition` / `has_build` derive from `onboarding_stage` only — no Stripe priceId joins in the view
- [x] `npm run test` — 73/73 passing (includes `scripts/sources/broadcast-tracker.test.mjs` and `scripts/dashboard-update/index.test.mjs`)
- [x] `npm run corpus:drift` — GREEN
- [x] `npm run dashboard:update` — clean snapshot (`docs/09-logs/dashboard/2026-04-18.md`)
- [x] `npm run build` — successful (prebuild regenerates the CRM snapshot)

Rollback is `DROP VIEW IF EXISTS public.founder_state_v1`.

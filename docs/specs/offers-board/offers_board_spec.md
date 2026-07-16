# Spec: Offers Board (waiting-on-response) — for Codex

## Goal
An admin-gated page in the existing app that answers, at a glance: which offers are out, to whom, at what price, since when, and when the next follow-up is due — plus the weekly OMTM count. Zero chat tokens to consult.

## Data source
The board is a projection of the existing Pulse corpus, not a separate tracker:

- `docs/09-logs/project_pulse_log.md` records what moved and when.
- `docs/02-strategy/strategic_crm_outreach_tracker.md` records current relationship state and contains the structured **Offer Ledger** maintained by Pulse.
- `scripts/emit-crm-snapshot.mjs` publishes the current projection as committed JSON.

Sasha reports a movement once through Pulse. The agent updates the Pulse log, CRM row, and Offer Ledger; runs `npm run snapshots:generate`; then commits and pushes the documents and generated snapshots together. The cockpit fetches the latest committed CRM snapshot from `main` at runtime. No duplicate CSV, manual offer form, Supabase table, frontend rebuild, or Lovable publish is required for subsequent data updates.

## Page
- Route: `/build/cockpit/offers`, wrapped in the existing `RequireAdmin` guard (same as `/build/cockpit/dashboard`).
- Register: match the cockpit's existing editorial style (back-office matches the landing register — no utilitarian admin tier).
- Sections:
  1. **OMTM strip:** offers sent this week (Mon-Sun) and last week, split paid/free/partnership; total pending $ (sum of amount_usd where status=waiting).
  2. **Open offers:** table sorted by next_followup_date ascending: Who · Offer · $ · Sent · Status · Next follow-up (overdue rows highlighted).
  3. **Follow-ups due today/overdue** pulled to the top as a short list.
- i18n not required (admin-only, English fine).

## DoD
| # | Criterion | Evidence |
|---|---|---|
| 1 | Strategic CRM contains a Pulse-maintained Offer Ledger | parser test + git diff |
| 2 | /build/cockpit/offers renders the generated CRM projection, admin-gated | screenshot logged-in vs logged-out |
| 3 | OMTM weekly counts honor aggregate campaign quantities | unit test with fixture offers |
| 4 | Overdue follow-ups highlighted and listed on top | screenshot |
| 5 | Register matches cockpit aesthetic | screenshot |
| 6 | `npx tsc --noEmit` + existing tests pass | CI/local output |

## Architecture correction — 2026-07-15

The first implementation followed the earlier CSV wording literally. Sasha clarified the governing invariant: Pulse already routes client movement into the corpus, so asking the founder or an agent to maintain another ledger is product failure. The CSV-backed path and manual `offer_pulses` cockpit form were removed. The database table remains historical/unused; dropping it is unnecessary for this frontend correction.

## Runtime delivery — 2026-07-15

### Goal

Make newly committed Pulse offer movements visible after a browser refresh without rebuilding or republishing the frontend, while preserving the existing corpus as the only writable source of truth.

### Scope of work

1. Fetch the latest committed `src/generated/crm-snapshot.json` from the public GitHub `main` branch at page load with cache bypassing.
2. Validate and normalize the runtime payload before using it.
3. Use the same runtime result in the dashboard Offer Cadence section and full Offers Board.
4. Display source freshness, loading, refresh, and fallback state explicitly.
5. Retain the bundled snapshot only as a resilient fallback when GitHub is unavailable.
6. Keep Pulse's write contract atomic: canonical docs + regenerated snapshots + one commit/push.

### Non-goals

- No second offer ledger in Supabase.
- No client-side mutation of offers.
- No automatic Git commit from the browser.
- No migration of historical `offer_pulses` rows.

### Planning definition of done

- Canonical source, runtime URL, cache policy, validation, fallback, and deployment boundary are explicit.
- The design has one writable source and does not depend on Lovable Cloud for recurring data freshness.

### Implementation definition of done

- Both cockpit offer surfaces use one shared runtime reader.
- A cache-busted page refresh can see the latest committed snapshot without a frontend deployment.
- Runtime failures preserve a clearly identified bundled fallback instead of blanking the board.

### Testing and debugging definition of done

- Tests cover runtime success, cache bypass, malformed rows, network failure, fallback, and existing offer metrics.
- TypeScript, lint, the full unit suite, production build, and responsive browser QA pass.
- Production is verified against the same latest snapshot available from GitHub `main`.

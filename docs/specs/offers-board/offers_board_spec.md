# Spec: Offers Board (waiting-on-response) — for Codex

## Goal
An admin-gated page in the existing app that answers, at a glance: which offers are out, to whom, at what price, since when, and when the next follow-up is due — plus the weekly OMTM count. Zero chat tokens to consult.

## Data source
The board is a projection of the existing Pulse corpus, not a separate tracker:

- `docs/09-logs/project_pulse_log.md` records what moved and when.
- `docs/02-strategy/strategic_crm_outreach_tracker.md` records current relationship state and contains the structured **Offer Ledger** maintained by Pulse.
- `scripts/emit-crm-snapshot.mjs` publishes the current projection to the app at build time.

Sasha reports a movement once through Pulse. The agent updates the Pulse log, CRM row, and Offer Ledger together. No duplicate CSV, manual offer form, or Supabase table is required by the product.

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

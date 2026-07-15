# Spec: Offers Board (waiting-on-response) — for Codex

## Goal
An admin-gated page in the existing app that answers, at a glance: which offers are out, to whom, at what price, since when, and when the next follow-up is due — plus the weekly OMTM count. Zero chat tokens to consult.

## Data source
`docs/02-strategy/outreach_tracker.csv` in this repo, extended to these columns:
`date_sent,name,segment_or_campaign,channel,offer_type(paid|free|partnership),amount_usd,status(waiting|replied|booked|paid|closed),next_followup_date,notes`
Claude (the clerk) maintains the CSV; the page just renders it. Import the CSV at build time (vite raw import or a small parser) — data refreshes on every deploy, which happens on every commit. No Supabase, no new backend.

## Page
- Route: `/build/cockpit/offers`, wrapped in the existing `RequireAdmin` guard (same as `/build/cockpit/dashboard`).
- Register: match the cockpit's existing editorial style (back-office matches the landing register — no utilitarian admin tier).
- Sections:
  1. **OMTM strip:** offers sent this week (Mon-Sun) and last week, split paid/free/partnership; total pending $ (sum of amount_usd where status=waiting).
  2. **Waiting board:** table sorted by next_followup_date ascending: Who · Offer · $ · Sent · Status · Next follow-up (overdue rows highlighted).
  3. **Follow-ups due today/overdue** pulled to the top as a short list.
- i18n not required (admin-only, English fine).

## DoD
| # | Criterion | Evidence |
|---|---|---|
| 1 | CSV extended with new columns, existing rows preserved | git diff |
| 2 | /build/cockpit/offers renders board from CSV, admin-gated | screenshot logged-in vs logged-out |
| 3 | OMTM weekly counts correct vs CSV fixture | unit test with fixture CSV |
| 4 | Overdue follow-ups highlighted and listed on top | screenshot |
| 5 | Register matches cockpit aesthetic | screenshot |
| 6 | `npx tsc --noEmit` + existing tests pass | CI/local output |

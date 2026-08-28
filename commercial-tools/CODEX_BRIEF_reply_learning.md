# CODEX BRIEF — Reply-Learning Loop (KEEP IT SIMPLE — functional prototype first)

Goal: after messages go out, learn what's working and feed it back into targeting + copy. **No ML, no external services.** Deterministic tags + counts + one-click "promote the winner". Ship a prototype that does most of the job; improve later. Build this AFTER the merged app exists.

Everything reuses code we already have — don't invent.

## 1. Stamp each message with what produced it
When a message is sent, stamp the person:
`outreach = { templateId, icpId, searchTerm, sentAt }`
(icpId + searchTerm already live on `person.source`; templateId is the template used to draft it.)

## 2. Capture the outcome (light auto + one-click confirm)
Add one field per messaged person: `outcome ∈ { awaiting, replied, positive, negative, no_reply }` (default `awaiting`).
Auto-SUGGEST on each sync (never auto-overwrite a manual choice):
- new inbound message after `sentAt` → suggest `replied`
- booking/interest regex hits (reuse `relationship-hub/core.mjs` `bookingRe`) → suggest `positive`
- pass/not-interested regex hits (reuse `closedRe`) → suggest `negative`
- >14 days, no inbound → `no_reply`
Show a tiny outcome dropdown on the card so Sasha confirms/overrides in one click.

## 3. "Learnings" tab (just an aggregate table)
One new tab. A table you can group three ways (toggle): **by Template · by ICP · by Search term**.
Columns: Sent · Replied · Positive · Reply-rate% · Positive-rate%. Sort by positive-rate. Badge top/bottom performers. That's the whole analysis.

## 4. Act (simple)
- **Promote winner:** from a `positive` thread, reuse Outreach Radar's **Update-template** (reverse-substitution) to make that phrasing the template default for its ICP.
- **Export `learnings.json`** (the aggregates) so an AI or the config editor can retune `scoreWeights` / `templates` next round.

## Keep it simple
One `outcome` field + one stamp on send + one aggregate table + one "promote" button + one export. No sentiment model, no dashboards-of-dashboards. Persist in the same local store. Iterate from real data once messages are actually landing.

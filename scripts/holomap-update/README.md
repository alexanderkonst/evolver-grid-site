# Holomap Update — Briefing Packet Generator

Codifies Sasha's verbal "update the holomap" protocol as a deterministic, zero-dependency script.

## What it does

Reads three sources:

1. `docs/02-strategy/morphogenetic_holomap.md` — current state (last-updated date, center reading, ► markers per perspective)
2. `docs/02-strategy/roadmap.md` — Current Status + This Week's Scope
3. `docs/09-logs/session_log.md` — all day-entries newer than the holomap's `Updated:` date
4. `docs/02-strategy/unique-businesses/alexanders_unique_business.md` — header snapshot

Synthesises a **briefing packet** at `scripts/holomap-update/last-briefing.md`. Hand it to Claude (Cowork or Claude Code) with one line: *"update the holomap based on this briefing."*

## Why briefing-packet, not auto-apply

The holomap is semantically dense — moving `►` from Sprout to Growth on a perspective is a judgement call based on qualitative evidence. An LLM can do that well; a regex can't. Rather than fake it, v1 ships a **deterministic aggregator** and delegates the semantic update back to a model.

Apply-mode (direct mutation) is Phase 2 — it requires structured diff emission (JSON patch) from the model plus an apply-and-verify loop. Not ready to ship unsupervised.

## Usage

```bash
npm run holomap:update            # write scripts/holomap-update/last-briefing.md
node scripts/holomap-update/index.mjs --stdout   # print to stdout
node scripts/holomap-update/index.mjs --since 2026-04-01   # force window
```

## Phase 2 (later)

- Add founder-canvas deltas beyond Alexander (Oyi, Sergey, Sandra, Alexa) — per-founder Stage X→Y detection via header-version parsing.
- CRM adapter — once Sasha points at a real CRM (spreadsheet? Notion? Supabase table?), feed contact-stage transitions into the packet.
- Stripe + Supabase adapter — revenue deltas, onboarding-stage transitions.
- Direct apply-mode: the LLM returns structured patches `{perspective, from, to, evidence}`; script validates + writes.
- Scheduled run (GitHub Action nightly) + PR auto-open with the regenerated holomap draft.

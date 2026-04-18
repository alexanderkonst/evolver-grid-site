# Autonomous Navigation Loop

*Last updated: 2026-04-17 · Day 43 · Spec v0.1 (scaffolding + drift check + briefing-packet holomap updater shipped)*

---

## Intent

> *"Постоянно обновляющийся холломап, который затем начинает все больше автономности приобретать. Чем больше холомапу и самому проекту видно, куда двигаться, тем больше он может брать и осуществлять задачи."* — Sasha, April 17, 2026

The navigation instrument stops being something Sasha maintains by hand and becomes a **self-refreshing map of reality**, fed by every signal the project emits. The more the map sees, the more agentic work it can absorb — first as proposals, then as directly-executed tasks.

This doc defines the loop, names its components, and phases the build so each next step is clear and small enough to ship.

---

## The loop (in one picture)

```
  SOURCES                SYNTHESIZER              STATE               DIRECTIVE ENGINE          WORK
  ─────────              ───────────              ─────               ───────────────           ────
  • Roadmap              drift check              Holomap             propose next actions       • Code edits
  • Session log          briefing packet     ──►  (navigation)  ──►   (ranked by leverage)  ──►  • Corpus edits
  • Founder canvases     stage detector           Founder views                                  • Outreach
  • Stripe / Supabase    revenue aggregator       Dashboard                                      • Build cohort ops
  • CRM (future)         CRM adapter
         │                                              ▲
         └──────────── events ───────────────────────────┘
                  (write back into sources
                   as work gets executed)
```

Three arcs:

1. **Ingest** — sources → synthesizer (regex for structured; LLM for semantic).
2. **Render** — synthesizer → state (holomap, dashboard, founder views).
3. **Act** — state → directive engine → work queue → back into sources as the work lands. Closed loop.

---

## Source of truth per surface

Sasha runs on files and a database. The loop has to respect which artifact is authoritative for what, or it will produce garbage.

| Surface | Authoritative source | Lives in | Update cadence |
|---|---|---|---|
| **Commerce (prices, CTAs)** | `src/data/playbookSteps.ts` | code | event-driven |
| **Methodology (subtitles, principles)** | `docs/02-strategy/unique-businesses/alexanders_unique_business.md` + `docs/03-playbooks/unique_business_playbook.md` | corpus | manual, Sasha |
| **Founder state (onboarding stage, revenue, snapshots)** | Supabase `game_profiles` + `*_snapshots` + Stripe | DB | event-driven |
| **Founder meaning (tribe, myth, pain, promise)** | `docs/02-strategy/unique-businesses/*_unique_business.md` | corpus | session-driven |
| **Project motion (decisions, priorities, scope)** | `docs/02-strategy/roadmap.md` | corpus | daily |
| **Project memory (chronology)** | `docs/09-logs/session_log.md` | corpus | per-session |
| **Navigation state** | `docs/02-strategy/morphogenetic_holomap.md` | corpus | triggered by the above |
| **CRM (contacts, pipeline stage)** | TBD (currently Sasha's head + roadmap W1-W10) | TBD | manual for now |

Rule: the synthesizer **pulls** from authoritative sources and **writes** only to the navigation state and dashboard views. It never silently edits the upstream artifact.

---

## Three runtime tracks

| Track | Runtime | What runs there |
|---|---|---|
| **Edge events** | Supabase edge functions, `/api/` | Stripe webhook → `onboarding_stage` update; snapshot insert → view recompute. Near-real-time. |
| **DB cron** | Supabase `pg_cron` | Materialized views for the dashboard and founder-state page; aggregate counters; run hourly. |
| **Repo cron** | GitHub Actions + `npm run` scripts (executed locally by Sasha or Claude Code) | Corpus drift check, holomap briefing, docs index regen, memory consolidation, CRM pull. |

The three tracks coexist; they don't compete. Edge events drive real-time state, DB cron handles aggregations, repo cron handles corpus synthesis.

---

## Phase roadmap

### Phase 0 — Foundation (shipped today, 2026-04-17)

- [x] **Corpus drift check** — `scripts/corpus-drift/` · C1 prices · C2 subtitles · C3 bundle symmetry. CLI + vitest + GitHub Action on PR + nightly. **Green.**
- [x] **Holomap briefing packet** — `scripts/holomap-update/` · reads roadmap + session log + canvas header + current holomap state → produces `last-briefing.md`. Manual handoff to Claude for the semantic pass.
- [x] **This spec** — `docs/06-architecture/autonomous-navigation-loop.md`.

### Phase 1 — Founder-state view (next up)

- [ ] **Supabase view:** `founder_state_v1` — one row per user joining `game_profiles` + latest `zog_snapshot` + latest `qol_snapshot` + Stripe-funded container flags (`has_ignition`, `has_build`).
- [ ] **Page:** `/founders/:slug` (Sasha-only route) — renders the view. One card per founder: name, stage, last session date, canvas link, revenue-to-date, next action.
- [ ] **Dashboard roll-up:** `/admin/dashboard` — counts, funnel, revenue by container, weekly deltas.
- [ ] **Claude Code brief:** `ai_tasks/PENDING_founder_state_view.md`.

### Phase 2 — Holomap auto-apply

- [ ] Upgrade the briefing-packet runner to call Claude API (requires `ANTHROPIC_API_KEY`) and receive structured patches: `{perspective, fromStage, toStage, evidenceRef}`.
- [ ] Validator: patches must cite an evidence ref (roadmap line, session-log day). Unsupported patches → rejected.
- [ ] Apply step: write the mutations into the holomap file as an atomic change; emit a changelog line.
- [ ] Nightly GitHub Action that runs the full cycle and opens a PR with the regenerated holomap + the evidence trail. Sasha reviews + merges.

### Phase 3 — CRM integration

Open question: **which CRM?** Sasha runs contacts through roadmap weekly scope + his head. Options to pick from:

- (a) **Spreadsheet** (Google Sheets) — adapter reads a published CSV. Simplest.
- (b) **Notion** — adapter via Notion API. Fine if Sasha already uses it.
- (c) **Supabase table** — roll our own. Full control but needs data entry UI.
- (d) **Attio / Folk / similar** — integration-heavy; overkill unless Sasha already uses one.

**Recommendation:** (a) first — spreadsheet where each row = a contact with columns `name`, `entry_channel`, `stage` (DM / ZoG / Ignition / Build / Lost), `last_touch`, `notes`. Five minutes to set up, sufficient signal for the holomap until volume demands more.

- [ ] **CRM adapter interface:** `scripts/crm-adapter/spec.ts` — `listContacts()`, `listRecentMoves(since)`.
- [ ] Spreadsheet adapter (Phase 3a).
- [ ] Briefing packet extends to include CRM deltas.

### Phase 4 — Founder canvas deltas

- [ ] Per-founder parser: reads `oyis_unique_business.md`, `sergeys_unique_business.md`, etc. Extracts current tribe/myth/pain/promise versions.
- [ ] Stage-transition detector: if canvas header version bumped since last holomap update, surface it.
- [ ] Briefing packet gains a Section 4b "Founder canvas deltas".

### Phase 5 — Directive engine

The step where the loop closes: the holomap starts **proposing next actions** based on its own state.

- [ ] Rule-based first: `if (P7 stuck at Sprout > 14 days) → propose action "unblock P7 — revisit tribe framing"`.
- [ ] LLM-assisted next: feed current holomap + roadmap + last 14 days of session log → Claude proposes 3-5 next actions ranked by leverage, each with rationale + estimated effort.
- [ ] Output: append to roadmap **"Directive Engine — Proposals"** section with confidence scores. Sasha promotes / demotes / archives. Nothing is auto-scheduled.

### Phase 6 — Autonomous execution (earned, not granted)

Only after Phase 5 proposals prove reliable over a multi-week window:

- [ ] Whitelist categories of work the engine can execute directly: corpus tidy-ups, drift fixes, index regeneration, link validation.
- [ ] Everything else remains proposal-only. Sasha's signature stays on the moves that matter.

---

## Invariants the loop must preserve

1. **Never overwrite the canon.** The locked master texts (Epicenter Broadcast, myth, value ladder versions) are quoted, never paraphrased. The loop reads them; it doesn't rewrite them.
2. **Never silent-commit corpus changes.** Every autonomous edit leaves a visible trace — a diff in a PR, a changelog line, a proposal note.
3. **Evidence-bound moves.** A ► shift in the holomap must cite a specific artifact (session log day, roadmap line). If there's no evidence, the shift doesn't happen.
4. **One lane of truth per domain.** Commerce = code. Methodology = corpus. Founder state = DB. The loop does not blur these.
5. **Kill switch always available.** Every autonomous step has a `--dry-run` default. `--apply` is explicit.

---

## Status summary

- **Scaffolded + shipped:** corpus drift check, holomap briefing packet, this spec.
- **Directly next:** founder-state Supabase view + `/founders/:slug` page (Claude Code brief going into `ai_tasks/`).
- **Blocked on Sasha decision:** CRM surface (spreadsheet vs Notion vs Supabase).
- **Open research:** holomap auto-apply safety (how strict the patch validator needs to be before unsupervised nightly runs).

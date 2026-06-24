# PENDING: Directive Engine v0.1 (Phase 5 of Autonomous Navigation Loop)

**Lane:** Claude Code
**Blocked by:** `PENDING_founder_state_view.md` (the engine reads founder state as an input)
**Spec source:** `docs/06-architecture/autonomous-navigation-loop.md` — Phase 5
**Priority:** 🟡 (the payoff of the whole loop — but only worth building once Phases 1–4 are in place)

---

## Goal

Close the navigation loop. The holomap stops being a snapshot and becomes a **proposer of next actions**. Every night, the engine reads the current state of the project and emits 3–5 ranked proposals. Sasha promotes the ones that resonate into the roadmap backlog; the rest are archived with their reasoning preserved.

This brief is **spec-level**. Do not build yet — the prerequisites (founder state view, CRM adapter, holomap auto-apply) need to land first. Build this once the three input signals are reliable.

---

## Inputs the engine reads

1. `docs/02-strategy/morphogenetic_holomap.md` — current state, including ► markers per perspective
2. `docs/02-strategy/roadmap.md` — Current Status, Active Backlog (with priority marks), Parked/Future, Completed
3. `docs/09-logs/session_log.md` — last 14 days of entries
4. `/api/founder-state.json` — per-founder state (from Phase 1)
5. CRM deltas (Phase 3, once available)

---

## What it outputs

A section appended to the top of the roadmap's "Active Backlog" under a dated heading:

```markdown
## 🧭 Directive Engine — Proposals · 2026-05-01

1. **[Leverage 9/10]** Bump "Build Cohort 1" to this week. Evidence: 5 Ignition graduates, 3 have asked about Build in the last 7 days (session log Day 48, Day 50). Threshold of 4+ from the spec is met.
   - Proposed action: post Build Cohort 1 announcement by Thursday, open slots for 4.
   - Why now: window of warm intent closes fast.

2. **[Leverage 7/10]** Move Step 7 (Venture Studio) from Parked → Backlog. Evidence: Sasha spoke about it in Day 49 session; two founders (Oyi, Sergey) named venture interest.
   - Proposed action: write spec v0.1 for Venture Studio container.

3. **[Leverage 5/10]** Unblock P11 — Tribe Must Act. Current stage has been at "Sprout" for 21 days. Evidence: no new content-driven inbound in 14 days (session log silence + zero new ZoG snapshots from non-referral traffic).
   - Proposed action: post the "Steps ≠ Containers" essay publicly — content surface drives the tribe forward.

[Archived proposals below — scroll only if you want to see the engine's prior picks]
```

Each proposal carries:
- **Leverage score 1–10** — the engine's estimate, grounded in evidence
- **Evidence refs** — specific artifact locations (session log day, roadmap line, founder state row)
- **Proposed action** — concrete next step Sasha could take
- **Expiry condition** — when this proposal stops being relevant

Sasha's three moves per proposal:
- `promote` → engine copies the action into the Active Backlog, archives the proposal
- `defer` → stays in proposals for N days, then archives
- `reject` → archives with a one-line reason (feeds future tuning)

---

## How it ranks

Two-stage:

**Stage 1 (rule-based filter):** exclude candidates that violate hard constraints.
- A proposal cannot contradict an explicit "parked" decision within the last 7 days
- A proposal cannot duplicate an existing Active Backlog row
- A proposal cannot be "do X" where X is already in progress

**Stage 2 (LLM ranking):** feed the surviving candidates to Claude with this context:
- Current holomap center reading
- Sasha's "One Rule" from the roadmap (*"I don't need a better funnel. I need more people inside it."*)
- The last 3 "Key decisions" from roadmap Current Status

Prompt the LLM to score each candidate 1–10 on leverage (how much it moves the center reading) and emit 3–5 top proposals. Reject anything scoring <5.

---

## Architecture

```
scripts/directive-engine/
├── index.mjs          — orchestrator, runs nightly via GitHub Action
├── sources.mjs        — reads holomap, roadmap, session log, founder-state API
├── candidates.mjs     — generates candidate proposals (rule-based + pattern-matched)
├── filter.mjs         — Stage 1 hard-constraint filter
├── rank.mjs           — Stage 2 LLM ranking (Claude API)
├── write.mjs          — appends to roadmap Proposals section
└── README.md
```

---

## Hard constraints

1. **Never overwrite the roadmap.** The engine appends under a dated Proposals heading. It does not touch Active Backlog rows or Current Status.
2. **Evidence is mandatory.** A proposal without an artifact ref is dropped before ranking.
3. **Idempotent.** Running twice in a row with the same inputs produces the same output (or a near-identical one — LLM nondeterminism is bounded by temperature ≤ 0.3).
4. **Kill switch.** `--dry-run` default. `--apply` explicit. GitHub Action runs `--dry-run` and opens a PR rather than committing.
5. **Evidence must be reachable.** Evidence refs are links (relative paths + line numbers) or the proposal is rejected.

---

## Acceptance

- [ ] Runs locally with `npm run directive-engine`
- [ ] Emits 3–5 ranked proposals with evidence refs
- [ ] Opens a PR with roadmap diff when run in `--apply` mode
- [ ] Tests cover filter rules (existing-row detection, parked-decision detection)
- [ ] Runs nightly via GitHub Action, produces a PR for Sasha's review

---

## Out of scope

- Direct autonomous execution (Phase 6 — unlocked only after the engine's proposals prove reliable)
- Pre-populating the dashboard with predictive metrics (separate brief)
- Founder-facing UI (this is Sasha-only infrastructure)

---

## Hand-back

When done, move to `ai_tasks/DONE_directive_engine.md` with:
- First 5 proposals the engine produced on real data
- Notes on rank-stage temperature + model choice
- Any candidate patterns that proved too noisy (and were removed)

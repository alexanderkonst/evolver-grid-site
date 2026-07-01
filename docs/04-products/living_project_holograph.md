# Living Project Holograph / Project Pulse

> *Created: 2026-06-30*
>
> A product spec for turning lived professional movement into project self-awareness.

---

## Essence

The Living Project Holograph is the operational layer where Sasha gives one pulse about what happened in professional life, and the project updates its own living memory.

The primitive is simple:

> **One lived event enters once; every relevant mirror updates from it.**

This turns documentation from manual surface maintenance into a self-awareness loop. The project sees its own form, tracks energy moving among its parts, into it, and out of it, feeds actual observed movement back into itself, detects contradiction, and clarifies the next action.

---

## The Core Object: Pulse Event

A **Pulse Event** is any meaningful movement in the field:

- a payment, proposal, referral, call, reply, silence, meeting, introduction, collaboration, sale, ship, strategic insight, product decision, or opportunity that became visible
- a relationship changing stage
- a business artifact changing meaning
- a contradiction between current reality and stale documentation
- a next move becoming simple, alive, and available

### Pulse Event Card

Every pulse should resolve into this shape:

```yaml
date:
day_number:
title:
source:
actors:
what_happened:
energy_exchanged: # money, trust, proposal, silence, referral, response, commitment, insight, product decision
affected_holons: # individual, group/team, community, civilization
affected_artifacts: # CRM, dashboard, holomap, roadmap, proposal, product spec, session log, etc.
phase_shift_significance: none | minor | major
next_action:
staleness_or_contradictions:
```

The event card is the single source. All other updates are projections from it.

---

## Architecture Blueprint

The Living Project Holograph has two layers:

1. **Architecture blueprint:** the invariant and system design that can be shared with people.
2. **Technology stack:** the actual surfaces, files, data, scripts, and agents that make the invariant operate.

### The Invariant

> **A living system becomes self-aware when it can see its own form — its architecture — track energy moving among its parts, into it, and out of it, and loop actual observed happenings, movements, and performed activities back into the system.**

### The Product Shape

The product is a living operating layer for a project, founder, community, or venture.

It receives pulses from real life, turns them into structured event cards, feeds them through an intelligence architecture, detects growth drivers and bottlenecks, and helps the next strategically high-leverage move become visible.

The product is not only a pulse ledger. The pulse is the input. The trinity stack is the metabolizer. Strategic moves and matchmaking are outputs.

### The Data Flow

```text
Actual happening
  -> Canonical pulse source
  -> Hero's Journey Ledger
  -> Energy Exchange Ledger
  -> Strategic Oracle
  -> Highest-leverage move / bottleneck removal / growth driver / matchmaking candidate
  -> Next action + feedback
```

The loop is the product. The product is not a dashboard alone; it is the intelligence architecture that lets a living project read its own becoming and speak back through AI.

---

## Intelligence Architecture

The Living Project Holograph works through three ledgers:

| Layer | Ledger | Function | Output |
|---|---|---|---|
| **Lived becoming** | **Hero's Journey Ledger** | Records what is actually happening in the project's unfolding: trials, thresholds, completions, stalls, impulses, actions, integrations | Current arc, stage, open threshold, actual movement |
| **Relational field** | **Energy Exchange Ledger** | Records energy moving between forms: money, trust, attention, silence, proposals, referrals, commitments, reciprocity | Relationship truth, live loops, energetic bottlenecks, ripe openings |
| **Strategic seeing** | **Strategic Oracle** | Reads the morphogenetic field like a Prime Radiant: growth drivers, bottlenecks, timing, leverage, phase-shift signals | Highest-leverage strategic moves |

The sequence is:

```text
Hero's Journey Ledger
  -> Energy Exchange Ledger
  -> Strategic Oracle
  -> AI as intelligence antenna
  -> Project speaks back
```

The holomap is the strategic oracle. Like the Prime Radiant in *Foundation*, it is a seeing and mapping instrument for the morphogenetic field. It does not merely display status; it forecasts the shape of emergence by reading structure, stage, tension, energy flow, and timing.

AI acts as the intelligence antenna: it reads the ledgers, sees patterns across time, detects contradiction, and translates the project's self-knowledge back into strategic guidance.

### What The System Produces

The output is **strategic self-awareness that produces high-leverage moves**:

- what to do next
- who to talk to
- what bottleneck to remove
- what opportunity is ripe
- what relationship to activate
- what offer to ship
- what collaboration to broker
- what signal to broadcast
- what stale self-model to update

Before this system, the founder has scattered memory, intuition, notes, dashboards, and relationships. After this system, the project becomes a self-aware strategic organism that can read its own becoming and communicate back through AI.

### Why Matchmaking Belongs Here

Matchmaking is one of the natural outputs of a living system that can see form, energy, and trajectory.

Once the system understands the project's architecture, relationship field, unused capacity, and current arc, it can see where energy wants to move next:

- who should meet
- which resource belongs where
- which collaboration is ripe
- which community node has unused capacity
- which relationship field is ready for an introduction
- which proposal or pilot wants to form

Matchmaking is therefore not an add-on. It is the coordination output of the holograph.

---

## Cross-Chat / Multi-Agent Protocol

Any AI agent working on the project should follow this contract when Sasha gives a pulse.

### Trigger

If a message starts with `Pulse:` or clearly reports meaningful professional movement, the agent should treat it as a candidate Project Pulse.

### Agent Contract

1. Read this spec.
2. Convert the update into a Pulse Event Card.
3. Append the card to [Project Pulse Log](../09-logs/project_pulse_log.md).
4. Route updates only to surfaces that actually changed.
5. Regenerate snapshots if a generated surface changed.
6. Report what was updated and what stayed untouched.
7. If the pulse reveals a reusable law, propose a Phase Shift Library update; do not assume every pulse is a phase shift.

### Repeatable User Instruction

Sasha can paste this into any chat or agent:

> **Project Pulse:** Treat the following update as a Living Project Holograph pulse. Read `docs/04-products/living_project_holograph.md`, convert the update into a Pulse Event Card, append it to `docs/09-logs/project_pulse_log.md`, update only the relevant mirrors, regenerate snapshots if needed, and tell me what changed.

---

## Trinity Stack

| Layer | Surface | Function |
|---|---|---|
| **Mind** | Morphogenetic Holomap | Reads meaning, phase, pattern, hero's journey, phase shifts, contradictions |
| **Heart** | Strategic CRM & Outreach Tracker | Records relationship energy, invitations, trust, money, referrals, proposals, silence, reciprocity |
| **Gut** | Dashboard / Admin / Equilibrium data | Shows operational truth: metrics, open loops, next actions, snapshots, exports, lived timing, readiness to act |

Equilibrium belongs to the third, visceral 3D/action layer. It is not just a calendar or mood surface; it is lived-time data about ripening, readiness, action energy, cycles, and whether the next move is available now.

The gut layer answers: *what is actually true now, what has energy, what is stale, what must move, and what is ready to be done?*

---

## Update Routing Rules

The AI routes each pulse by what changed:

- **Relationship moved:** update `docs/02-strategy/strategic_crm_outreach_tracker.md`, then regenerate `src/generated/crm-snapshot.json`.
- **System meaning changed:** update `docs/02-strategy/morphogenetic_holomap.md`.
- **Roadmap priority changed:** update `docs/02-strategy/roadmap.md`.
- **Product idea became real enough to build:** create or update a file in `docs/04-products/`.
- **Operational reality changed:** update the dashboard/admin source or generated snapshots.
- **Only continuity changed:** append to `docs/09-logs/project_pulse_log.md`.

The AI should also run a contradiction check: stale milestones, inconsistent dates, duplicated states, and metrics that disagree with relationship reality.

---

## MVP Implementation

### Phase 1 — Codex-Operated Pulse

Sasha says:

> `Pulse: [what happened]`

Codex turns it into a Pulse Event Card, appends it to [Project Pulse Log](../09-logs/project_pulse_log.md), updates relevant docs, regenerates snapshots, and reports what changed.

This phase is ready now.

### Current Product Surface — Founder Cockpit

`/cockpit` is the public front-door for Founder Life's Work Navigation and now lives inside the GameShell `BUILD` space as **Founder Cockpit**.

This matters because the cockpit is not a detached marketing page. It is a BUILD instrument: a founder-facing place where the life-work project can be seen as one living system rather than scattered strategy, relationships, opportunities, and next moves.

### Phase 2 — Generated Pulse Snapshot

The build already includes a script that reads the pulse log and generates:

```text
src/generated/project-pulse-snapshot.json
```

The dashboard can then show latest pulses, open loops, phase-shift events, and stale surfaces.

Command:

```bash
npm run pulse:snapshot
```

### Phase 3 — Admin Pulse Intake

Add an `/admin` panel section:

- textarea: "What happened?"
- actor picker
- energy-exchange selector
- affected-artifact checkboxes
- AI-generated event card preview
- "Apply pulse" button

The admin surface becomes the daily operator console for project self-awareness.

### Phase 4 — Database Event Stream

Move pulse events into Supabase:

- `project_pulses`
- `pulse_artifact_updates`
- `relationship_events`
- `energy_exchanges`
- `pulse_contradictions`
- `equilibrium_state_snapshots`
- `pulse_matchmaking_candidates`

Markdown remains the canonical narrative layer; the database becomes the queryable operational layer.

### Phase 5 — Ambient Capture / AI Pendant

The future form is an AI pendant or equivalent ambient companion that can transcribe calls, live conversations, and meetings; extract candidate pulses; detect relationship movements; and propose matchmaking opportunities.

The important boundary: ambient capture creates **candidate pulses**, not automatic truth. Sasha or the relevant human approves what enters the holograph.

---

## Matchmaking Future

The holograph becomes more powerful when pulse events combine with the consent-based uniqueness data layer.

The system can then notice:

- which people keep appearing around the same mission
- which assets and top talents are complementary
- where a community has unused capacity
- which relationship field is ready for an introduction
- where a proposal, collaboration, or pilot wants to form

This is the bridge from self-awareness to living coordination.

---

## Bottom Line

The Living Project Holograph makes the project aware of its own movement.

The pulse is the unit of professional life.

The holograph is the living memory that lets the next right move become visible.

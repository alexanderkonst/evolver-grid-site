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

## Pulse Protocol v1

Pulse Protocol v1 is the operating contract for making the project readable by any AI agent without Sasha re-explaining the whole field.

### Trigger

If Sasha gives a professional-life update — a call, proposal, payment, silence, referral, relationship movement, product decision, inner clarity shift, or opportunity becoming visible — the agent should treat it as a **Living Project Pulse**.

### Required Read Path

Before advising, the agent reads the current living context in this order:

1. **Equilibrium AI Context Export** — visceral/action layer: current focus, strategies, workstreams, tasks, synthesis, readiness.
2. **Project Pulse Log** — narrative continuity: what moved recently.
3. **Strategic CRM & Outreach Tracker** — relationship and energy-exchange ledger.
4. **Living Project Holograph** — architecture and routing protocol.
5. **Relevant artifact docs** — only where the pulse actually changes meaning or strategy.

### Required Output

Every pulse pass returns four operational lenses:

- **Movement:** what changed in the living field.
- **Bottlenecks:** where energy is stuck, leaking, waiting, or over-concentrated.
- **Follow-Ups:** who to message, why now, and what the clean next ask is.
- **High-Leverage Moves:** the few actions most likely to move strategy, relationships, money, or product reality now.

### Agent Contract

1. Read the required context before advising.
2. Convert the update into a Pulse Event Card.
3. Append the card to [Project Pulse Log](../09-logs/project_pulse_log.md).
4. Route updates only to surfaces that actually changed.
5. Regenerate snapshots if a generated surface changed.
6. Return Movement, Bottlenecks, Follow-Ups, and High-Leverage Moves.
7. Report what was updated and what stayed untouched.
8. If the pulse reveals a reusable law, propose a Phase Shift Library update; do not assume every pulse is a phase shift.

### Equilibrium AI Context Export

The automatic Equilibrium read path is:

```text
supabase/functions/equilibrium-ai-context
```

The endpoint supports two access modes:

- logged-in Supabase session from the private cockpit UI
- read-only agent token via `x-agent-token`, configured with `EQUILIBRIUM_AI_CONTEXT_TOKEN` and `EQUILIBRIUM_AI_CONTEXT_USER_ID`

This removes the manual export bottleneck. Sasha should not have to press an "export Equilibrium data" button before a useful agent can read what is live in the gut/action layer.

---

## Cross-Chat / Multi-Agent Protocol

Any AI agent working on the project should follow this contract when Sasha gives a pulse.

### Trigger

If a message starts with `Pulse:` or clearly reports meaningful professional movement, the agent should treat it as a candidate Project Pulse.

### Repeatable User Instruction

Sasha can paste this into any chat or agent:

> **Project Pulse:** Treat the following update as a Living Project Pulse. Read the Equilibrium AI Context Export, `docs/04-products/living_project_holograph.md`, `docs/09-logs/project_pulse_log.md`, and `docs/02-strategy/strategic_crm_outreach_tracker.md`; convert the update into a Pulse Event Card; update only the relevant mirrors; regenerate snapshots if needed; and return Movement, Bottlenecks, Follow-Ups, and High-Leverage Moves.

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

`/build/cockpit` is the public front-door for Founder Life's Work Navigation and now lives inside the GameShell `BUILD` space as **Founder Cockpit**.

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

### Phase 2.5 — Private Cockpit Dashboard

`/build/cockpit/dashboard` is the private operational cockpit.

Its first version reads:

- `src/generated/project-pulse-snapshot.json`
- `src/generated/crm-snapshot.json`
- `equilibrium-ai-context`

The founder-facing surface is not a generic dashboard. It is a navigation instrument.

The operating metaphor is a founder starship cockpit:

- **Mission Vector:** shows whether the venture is aligned with true north.
- **Founder State:** shows focus, capacity, and how much force is being applied.
- **Opportunity Field:** shows relationship doors by ripeness, not by chronological inbox order.
- **Energy Ledger:** shows where money, trust, attention, referrals, commitments, and silence are actually moving.
- **Strategic Oracle:** reads pattern, bottleneck, timing, and leverage.
- **Readiness Signal:** distinguishes "alive now" from "still ripening."
- **Next Move Engine:** compresses the field into the few moves that matter now.
- **Field Coherence:** checks whether mission, founder, offer, relationships, execution, money, and meaning agree.

The four reusable action buttons are the command surface:

- **What Moved**
- **Generate Follow-Ups**
- **Find Bottlenecks**
- **Name High-Leverage Moves**

Each button should output three layers:

1. **Field reading:** what the living system is actually doing.
2. **Ripeness filter:** what has energy now vs. what should stay warm but inactive.
3. **Crystallized action:** what exact next move is obvious enough to do.

This is the first UI form of the pulse protocol: one private surface where the living project can show movement, pressure, relationship action, and next moves without Sasha manually recomposing the context.

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

### Phase 5.1 — Transcript-Fed Organizational Intelligence

The July 1 Sergey call clarified that the same architecture scales from solo founder to team and organization.

The biggest product insight:

> **Founder Cockpit scales beyond solo founders. Meeting transcripts, decisions, unresolved tensions, outcomes, and burnout signals can become organizational AI context.**

For a solo founder, the project can receive pulses from Sasha directly. For a team or company, the richest pulse source is often not a manual update but the actual record of work: meeting transcripts, call recordings, decisions, unresolved debates, customer conversations, proposals, task movement, and outcome notes.

This makes the AI context holonic:

```text
AI for a person
  -> AI for a project
  -> AI for a team
  -> AI for an organization
```

An organization-level cockpit should be able to answer:

- What decisions were made while I was not present?
- What cannot the team resolve across repeated meetings?
- Where is pressure rising, trust dropping, or burnout appearing?
- Which topic needs founder/leader intervention?
- Which opportunity, workflow, or bottleneck is now ripe?

This is not generic meeting summarization. The transcript layer becomes useful only when interpreted through the project's strategic ontology: what matters, what success means, which tensions matter, and which outcomes the organization is trying to create.

The emerging product category is therefore broader than a personal second brain:

> **Living Work Intelligence:** a pulse-fed AI context layer that helps a person, project, team, or organization know what is actually happening and where high-leverage action is needed.

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

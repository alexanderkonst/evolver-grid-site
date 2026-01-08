# Matchmaking Engine — Evolutionary Coordination System

> The core engine that connects entities across the holonic operating system
> This is not a dating app. It's an evolutionary coordination engine.

*Day 5 — Jan 8, 2026*

---

## Core Question

> "What needs to meet what, under which conditions, and for what evolutionary outcome?"

---

## Primary Matching Layers

From most fundamental to most applied:

| Match Type | Description |
|------------|-------------|
| **Human ↔ Self** | Clarity, coherence, readiness, phase of evolution (internal alignment before external) |
| **Human ↔ Human** | Peers, mentors, collaborators, partners, mirrors |
| **Human ↔ Mission** | Purpose alignment, callings, real-world needs |
| **Human ↔ Venture** | Roles, contributions, stages, incentives |
| **Human ↔ Community** | Culture, values, tempo, norms, collective intent |
| **Human ↔ Practice** | Tools, rituals, trainings, challenges, games |
| **Venture ↔ Capital** | Money, attention, talent, infrastructure |

*Not all needed at once — this is the full map.*

---

## Universal Entity Structure

Every matchable entity shares a common spine:

```
┌─────────────────────────────────────┐
│             ENTITY CORE             │
├─────────────────────────────────────┤
│ Identity      — what it is          │
│ Intent        — what it's for       │
│ Stage         — lifecycle position  │
│ Capacity      — what it can give    │
│ Need          — what it requires    │
│ Constraints   — deal-breakers       │
│ Preferences   — nice-to-haves       │
│ Signal Strength — data confidence   │
└─────────────────────────────────────┘
```

**Critical Insight:** Humans, missions, projects, and communities are **structurally comparable**.

---

## Human Profile (Minimal, Powerful)

For a human node:

### Essence
- Zone of genius
- Archetypal role(s)

### State
- Energy, availability, nervous system bandwidth
- Current life phase

### Intent
- What they want **now** (not forever)

### Capacity
- Skills, time, capital, leadership, care

### Constraints
- Red lines, values, boundaries

### Trajectory
- Where they're heading next

---

## Match Logic — Resonance Scoring

Matching is **not binary**. It's a weighted resonance score across dimensions:

| Dimension | Description |
|-----------|-------------|
| **Alignment** | Values, intent |
| **Complementarity** | Needs ↔ Capacities |
| **Timing** | Stage compatibility |
| **Intensity** | Tempo, ambition |
| **Trust Potential** | Reputation, coherence |
| **Friction Cost** | Coordination overhead |

### Resonance Formula

```
Resonance = (Alignment × Timing × Capacity) − Friction
```

---

## Match Outputs

A match doesn't just say "yes/no" — it outputs:

| Output | Description |
|--------|-------------|
| **Match Type** | Peer / Mentor / Collaborator / Mission-fit |
| **Strength Score** | Resonance value (0-100) |
| **Risk Flags** | Potential friction points |
| **Suggested Next Step** | See below |

### Suggested Actions

1. **Intro** — Connect via facilitated introduction
2. **Micro-collaboration** — Small shared task
3. **Practice together** — Joint practice session
4. **Wait / Recheck** — Timing not right, revisit later

---

## Meta-Principles

### Matches Are Temporary
- Context-aware
- Re-evaluated as people evolve
- Designed for **movement**, not permanence

### Match ≠ Relationship
- A match opens a door
- What happens next is emergent
- System facilitates, doesn't force

### Trust Is Earned
- Signal strength increases with interaction
- Coherence between stated intent and action builds reputation
- Past matches inform future recommendations

---

## Implementation Layers (Planned)

### Phase 1: Human ↔ Mission (Current)
- Mission Discovery with commitment
- Connection Requests via email threads
- Token-based matching

### Phase 2: Human ↔ Human
- Genius archetype pairing
- Asset complementarity
- Shared mission alignment

### Phase 3: Human ↔ Venture
- Startup Co-op matching
- Role/contribution fit
- Stage alignment

### Phase 4: Full Engine
- Multi-dimensional resonance scoring
- Dynamic re-matching
- Collective intelligence layer

---

## Data Model (Proposed)

```typescript
interface MatchableEntity {
  id: string;
  type: 'human' | 'mission' | 'venture' | 'community' | 'practice';
  identity: EntityIdentity;
  intent: string[];
  stage: LifecycleStage;
  capacity: Capacity[];
  needs: Need[];
  constraints: Constraint[];
  preferences: Preference[];
  signalStrength: number; // 0-100
}

interface Match {
  entityA: MatchableEntity;
  entityB: MatchableEntity;
  type: MatchType;
  resonanceScore: number;
  riskFlags: string[];
  suggestedAction: MatchAction;
  createdAt: Date;
  expiresAt?: Date; // Matches are temporary
}

type MatchType = 
  | 'peer' 
  | 'mentor' 
  | 'collaborator' 
  | 'mission-fit' 
  | 'venture-role'
  | 'practice-partner';

type MatchAction = 
  | 'intro' 
  | 'micro-collab' 
  | 'practice-together' 
  | 'wait';
```

---

## Questions to Explore

- How does signal strength decay over time?
- What's the minimum data needed for a viable match?
- How do we handle match rejection gracefully?
- What creates "match fatigue" and how do we prevent it?
- How does community-level matching differ from individual?

---

*This document evolves as we build the matchmaking engine.*

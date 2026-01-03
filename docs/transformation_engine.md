# Transformation Engine

> How game mechanics and real human development unite into one system

*This is the theoretical core of the Reality RPG — how inner work produces outer results, and how the game makes this visible.*

---

## The Core Insight

| Inner (Input Levers) | Outer (Output Gauges) |
|---------------------|----------------------|
| **5 Vectors** | **8 QoL Domains** |
| Where you do the work | Where you see results |
| Spirit, Mind, Emotions, Uniqueness, Body | Wealth, Health, Happiness, Love, Impact, Growth, Social, Home |

**You cannot directly "level up Wealth"** — you develop inner capacities (Uniqueness, Mind) that *produce* Wealth as a natural byproduct.

---

## Inner → Outer Mapping

| Vector | Primary Domains | Secondary |
|--------|-----------------|-----------|
| **Spirit** | Happiness, Growth | Love |
| **Mind** | Impact, Growth | Wealth |
| **Emotions** | Love, Social Ties | Happiness, Home |
| **Uniqueness** | Impact, Wealth | Growth |
| **Body** | Health, Home | Happiness, Social |

This is why we track XP per *vector* (input) but show progress in *domains* (output).

---

## The XP + Levels System

### XP Per Vector
- `xp_spirit`, `xp_mind`, `xp_emotions`, `xp_uniqueness`, `xp_body`
- Earned by completing practices tagged to that vector

### Levels Per Vector
| Level | XP Threshold | Meaning |
|-------|--------------|---------|
| 1 | 0-99 | Beginner |
| 2 | 100-249 | Apprentice |
| 3 | 250-499 | Practitioner |
| 4 | 500-999 | Adept |
| 5 | 1000-1999 | Master |
| 6+ | 2000+ | Elder |

### Overall Character Level
- Aggregate of all 5 vectors
- Incentivizes balanced development (not maxing one vector)

---

## The Game Loop

```
Player enters "Your Next Move"
           ↓
1. QoL Map shows weakest domain(s)
           ↓
2. System maps domain → underlying vector(s)
           ↓
3. Shows relevant skill tree + available node
           ↓
4. Serves ONE practice (unit of transformation)
           ↓
   [Microlearning: "Why this matters"]
           ↓
5. Player does the practice (in real life)
           ↓
6. Marks complete → XP awarded → streak updated
           ↓
7. Skill tree node progresses → visual feedback
           ↓
8. Over weeks → retake QoL → domains improved
           ↓
   "I was Stage 2.3, now I'm Stage 2.8"
           ↓
[FELT transformation → intrinsic motivation → continue]
```

---

## QoL Decimal Stages (Zoom-In)

**The Problem**: Stage jumps (2 → 3) may take months. Player doesn't see progress.

**The Solution**: Decimal stages within each level.

| Stage | Decimal | Meaning |
|-------|---------|---------|
| 2 | 2.0-2.2 | Just entered Stage 2 |
| 2 | 2.3-2.6 | Consolidating Stage 2 |
| 2 | 2.7-2.9 | Approaching Stage 3 |
| 3 | 3.0 | Threshold crossed |

**Why This Matters**:
- Visible progress in 1-2 weeks (not months)
- Micro-victories sustain motivation
- Self-tracking + inner work shows up quickly
- "I was 2.4, now I'm 2.7" = dopamine hit

**Implementation Options**:
1. Sub-questions that add granularity within each stage
2. Self-rated confidence scale (how solid within the stage)
3. Behavioral indicators (quantifiable actions that prove stage)

> **Future**: Qualify stages more unmistakably with data-driven metrics for outer domains. Inner vectors remain harder to quantify — rely on proxy measures.

---

## Microlearning Integration

Each skill tree node contains:
- **Explainer** (30-60 sec): "Why nervous system regulation improves Wealth"
- **Practices** (the actions): Breathwork, HRV tracking, etc.
- **Milestones** (proof): "7-day streak", "First 100 XP"

Microlearning makes it *educational* without being *academic*.

---

## What Code Already Has

| Element | Status | Location |
|---------|--------|----------|
| XP per vector | ✅ Built | `game_profiles` table |
| Skill trees (5) | ✅ Built | `skillTrees.ts` |
| Practice library | ✅ Built | `libraryContent.ts` |
| QoL 8 domains | ✅ Built | `qolConfig.ts` |
| Recommendation engine | 🟡 Basic | `use-recommendations.ts` |
| Per-vector levels | ❌ Missing | — |
| Domain→Vector mapping | ❌ Missing | — |
| Microlearning layer | ❌ Missing | — |
| Decimal stages | ❌ Missing | — |
| QoL retake prompts | ❌ Missing | — |

---

## The One-Sentence Version

> **You develop inner capacities (5 vectors) through practices → which improves your outer life (8 domains) → which you can see and measure → which motivates more practice.**

Game mechanics (XP, levels, trees, streaks) make it *engaging*.
Real transformation makes it *meaningful*.
The two aren't separate — **the game IS the transformation visualized**.

---

*Transformation Engine Synthesis v1.0*
*Last updated: 2025-01-03*

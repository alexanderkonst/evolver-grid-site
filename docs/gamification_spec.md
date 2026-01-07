# Gamification Spec

> XP, Levels, Reveal Moments, Spaced Repetition, Explainers

*Updated: 2025-01-07 v2.0*

---

## XP Philosophy

**The Question:** What unifies XP across all activities (transformation, collaboration, self-understanding)?

**Proposal: Depth of Engagement**

| Dimension | Low XP (5-15) | Medium XP (20-35) | High XP (50+) |
|-----------|---------------|-------------------|---------------|
| **Time** | <2 min | 2-15 min | 15+ min |
| **Depth** | Passive (watch/read) | Active (reflect/do) | Immersive (transform) |
| **Novelty** | Repeat | New | First-ever |

*XP = Time × Depth × Novelty*

**Examples:**
- Watch 90s micro-learning (first time) = 2 min × Passive × First = 15 XP
- Complete breathwork activation (repeat) = 10 min × Immersive × Repeat = 35 XP
- Complete ZoG test (first) = 5 min × Active × First = 50 XP

---

## XP by Action Type

| Action Type | XP | Rationale |
|-------------|-----|-----------|
| First Action (any) | 20 | Extra for starting |
| Micro-learning (90s) | 15 | Quick, easy |
| Activation (short, <5 min) | 20 | Effort + experience |
| Activation (medium, 5-15 min) | 35 | More effort |
| Activation (long, 15+ min) | 50 | Significant commitment |
| Self-assessment | 25 | Profile deepening |
| Reflection prompt | 10 | Low effort, high value |
| Streak bonus (daily) | +5 | Consistency reward |

---

## Streak Logic

### Grace Period

| Scenario | Result |
|----------|--------|
| Complete action today | Streak continues (+1 day) |
| Miss 1 day | Streak **pauses** (not broken) |
| Miss 2+ days | Streak resets to 0 |

**Freeze Token:** User earns 1 "streak freeze" per week that allows 1 additional missed day.

### Streak Milestones

| Days | Reward |
|------|--------|
| 3 | 🔥 Badge + 50 bonus XP |
| 7 | 🔥🔥 Badge + 100 bonus XP |
| 14 | 🔥🔥🔥 Badge + 200 bonus XP |
| 30 | ⭐ Special badge + 500 bonus XP |
| 100 | 🏆 Legend badge + 1000 bonus XP |

---

## Level Thresholds

| Level | Total XP | Title |
|-------|----------|-------|
| 1 | 0 | Newcomer |
| 2 | 100 | Explorer |
| 3 | 250 | Seeker |
| 4 | 500 | Practitioner |
| 5 | 1000 | Adept |
| 6 | 2000 | Guide |
| 7 | 4000 | Master |
| 8 | 8000 | Sage |
| 9 | 16000 | Elder |
| 10 | 32000 | Architect |

---

## Reveal Moments — Concrete Specs

### Genius Reveal (Peak)

| Element | Spec |
|---------|------|
| **Sound** | Rising chime (2s) → Bell flourish |
| **Visual** | Screen darkens → Archetype title fades in (gold text) → Confetti burst (3s) → Profile card slides up |
| **Text** | "You are [Archetype Name]" (large, centered) |
| **Duration** | 5 seconds total |

### Life Snapshot (High)

| Element | Spec |
|---------|------|
| **Sound** | Soft whoosh → Completion chime |
| **Visual** | Radar chart draws itself (animated, 2s) → Highest domain pulses green → Lowest domain pulses amber |
| **Text** | "Your life map" (header) |
| **Duration** | 3 seconds |

### Level Up (High)

| Element | Spec |
|---------|------|
| **Sound** | Fanfare (triumphant, 2s) |
| **Visual** | Full-screen flash (gold) → New title appears → Particle burst |
| **Text** | "Level [N]! You are now a [Title]" |
| **Duration** | 3 seconds |

### First Action (High)

| Element | Spec |
|---------|------|
| **Sound** | Victory chime |
| **Visual** | XP counter animates up → Badge appears |
| **Text** | "You did it! +[XP] XP" |
| **Duration** | 2 seconds |

### Path Progress (Low)

| Element | Spec |
|---------|------|
| **Sound** | Soft ping |
| **Visual** | Toast slides in from bottom right |
| **Text** | "+[XP] XP · [Path Name]" |
| **Duration** | 2 seconds |

### Recommendation Fallback

If recommendation engine fails:
> "Finding your next move... Try a conscious breath."

*Show conscious breath action as fallback.*

---

## Spaced Repetition

| Status | Next Prompt |
|--------|-------------|
| Unwatched | Recommend based on path |
| Watched | Rewatch in 3 days |
| Rewatched (1) | Rewatch in 2 weeks |
| Rewatched (2) | Rewatch in 1 month |
| Mastered | No prompt |

---

## Game Explainers

> **XP:** Experience Points. Earn by completing actions.

> **Levels:** Your progress. Level up by earning XP.

> **Streak:** Days in a row with an action. Miss one? Streak pauses, not breaks.

> **Growth Paths:** Spirit, Mind, Emotions, Genius, Body.

> **My Next Move:** One recommended action. Under 3 min to start.

---

*Gamification Spec v2.0*

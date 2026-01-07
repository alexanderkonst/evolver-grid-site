# Gamification Spec

> XP, Levels, Reveal Moments, Spaced Repetition, Explainers

*Draft: 2025-01-07*

---

## XP Scheme

### XP by Action Type

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

### XP by Growth Path

Each action tags a Growth Path. XP goes to:
1. **Total XP** (overall level)
2. **Path XP** (path-specific progress)

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

*Doubling pattern: each level requires 2x the previous.*

---

## Reveal Moments

### When They Happen

| Moment | Trigger | Effect |
|--------|---------|--------|
| Genius Reveal | After ZoG test | Confetti + sound + archetype title |
| Life Snapshot | After QoL | Radar animation + celebration |
| Level Up | Crossing threshold | Full-screen flash + sound + new title |
| Streak Milestone | 3, 7, 14, 30 days | Badge + sound |
| First Action | Completing first action ever | Special celebration |
| Path Progress | Completing path step | Subtle glow + XP toast |

### Effect Components

| Component | Options |
|-----------|---------|
| **Sound** | Chime (short), Fanfare (level up), Whoosh (transition) |
| **Visual** | Confetti, Glow, Flash, Pulse, Particle burst |
| **Text** | Toast notification, Full-screen message, Badge |
| **Duration** | Micro (0.5s), Short (1-2s), Full (3-5s) |

### Intensity by Importance

| Importance | Example | Intensity |
|------------|---------|-----------|
| Low | XP toast after action | Micro + toast only |
| Medium | Streak milestone | Short + sound + badge |
| High | Level up | Full + fanfare + full-screen |
| Peak | Genius Reveal | Full + confetti + archetype animation |

---

## Spaced Repetition

### For Micro-learnings

| Status | Trigger | Next Prompt |
|--------|---------|-------------|
| Unwatched | — | Recommend based on path |
| Watched | After first view | "Rewatch in 3 days" |
| Rewatched (1) | After 3 days | "Rewatch in 2 weeks" |
| Rewatched (2) | After 2 weeks | "Rewatch in 1 month" |
| Mastered | After 1 month | Optional review, no prompt |

### UI Indicator

| Status | Badge |
|--------|-------|
| Unwatched | ⬜ Empty |
| Watched | ✅ Check |
| Rewatched (1) | ✅✅ Double check |
| Mastered | 🌟 Star |

---

## Game Explainers

*Short copy to onboard users to gamified experience*

### XP Explainer
> **What's XP?**
> Experience Points. You earn them by completing actions. The more you do, the more you grow.

### Level Explainer
> **What are Levels?**
> Your overall progress. Level up by earning XP. Each level unlocks new titles and capabilities.

### Streak Explainer
> **What's a Streak?**
> Days in a row you've completed at least one action. Keep it going for bonus XP and milestones.

### Growth Path Explainer
> **What are Growth Paths?**
> The 5 dimensions of your development: Spirit, Mind, Emotions, Genius, Body. Each path has its own upgrades.

### My Next Move Explainer
> **What's My Next Move?**
> The one action the game recommends right now. Based on your profile, your life, and your progress. Always under 3 minutes to start.

---

## First Session Flow

1. Complete ZoG → **Genius Reveal** (Peak)
2. Complete QoL → **Life Snapshot** (High)
3. Enter Game World → "This is your game" (Medium)
4. Complete First Action → **First Action Celebration** (High)
5. See XP awarded → Toast (Low)
6. See streak started → "1 day streak!" (Low)

*Total dopamine hits in first session: 6*

---

*Gamification Spec v1.0*

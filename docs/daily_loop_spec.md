# Daily Loop Spec v2

> The core daily experience — how a person engages each time they return

*This spec defines the "game loop" that drives engagement and transformation.*

---

## North Star

> **"My Next Move"** — ONE recommended action, no overwhelm

The player opens the portal, sees where they are, and gets ONE clear thing to do.

---

## Home Screen Structure

```
┌─────────────────────────────────────────┐
│                                         │
│              ME                         │
│   (Profile summary: who I am)           │
│   Archetype · Talents · Level           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│            MY LIFE                      │
│   (QoL snapshot: where I'm at)          │
│   8 domains at a glance                 │
│   "My life is asking for attention in:  │
│    [Wealth] and [Health]"               │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         MY NEXT MOVE                    │
│   (ONE action, dynamically chosen)      │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ [Practice/Step/Action Card]     │   │
│   │ Title · Duration · XP           │   │
│   │ [DO IT] button                  │   │
│   └─────────────────────────────────┘   │
│                                         │
│   "Not this? Explore more →"            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Action Types

All actions are tagged to one of the **5 vectors** and award XP accordingly:

| Action Type | Description | Example |
|-------------|-------------|---------|
| **Practice** | Transformational activity from Library | 10-min breathwork |
| **Profile Step** | Deeper self-understanding | Take personality test |
| **Microlearning** | Bite-sized education | 2-min video on shadow work |
| **Life Action** | Real-world task | "Have a difficult conversation" |
| **Monetization Step** | Genius business progression | "Draft your offer headline" |
| **Connection** | Social/collaboration | "Message your accountability partner" |

---

## Recommendation Logic

The system chooses "My Next Move" based on:

1. **QoL Bottleneck** — Which domain is lowest?
2. **Vector Mapping** — Which vector(s) drive that domain?
3. **What's Unlocked** — What has the player already done?
4. **What's Next in Sequence** — Each vector has a progression path
5. **Time Available** — Short (5 min) vs medium (15 min) vs deep (45 min)
6. **Energy/Mood** — Activating vs calming (if tracked)

### Simple v1 Algorithm:
```
1. Find lowest QoL domain
2. Map to primary vector (e.g., Wealth → Genius)
3. Find next unlocked action in that vector's sequence
4. Show as "My Next Move"
```

---

## Completion Flow

```
Player clicks [DO IT]
       ↓
Action screen/external link
       ↓
Player completes action (in real life or in-app)
       ↓
Returns to portal
       ↓
Marks complete
       ↓
+XP awarded (to relevant vector)
       ↓
Celebration moment (subtle, not over-the-top)
       ↓
Back to home — new "My Next Move" appears
```

---

## XP Per Vector

| Vector | XP Column | Domain Impacts |
|--------|-----------|----------------|
| Spirit | xp_spirit | Happiness, Growth |
| Mind | xp_mind | Impact, Growth, Wealth |
| Emotions | xp_emotions | Love, Social, Happiness |
| Genius | xp_genius | Impact, Wealth |
| Body | xp_body | Health, Home |

---

## Freedom Mode

When player clicks "Explore more →":

```
Show full action library, filterable by:
   ├── Vector (Spirit, Mind, Emotions, Genius, Body)
   ├── Action Type (Practice, Learning, Life Action, etc.)
   ├── Duration (5, 10, 15, 30, 60 min)
   └── Energy (Activating, Calming, Balanced)
```

Like open-world games: guided recommendation, but freedom to wander.

---

## Sequence Design (Alexander's Job)

Each vector needs a **growth sequence** — the recommended order of actions:

```
Example: Genius Vector

Level 1: Zone of Genius basic (swipe talents)
Level 2: Personality tests upload
Level 3: Values clarification
Level 4: Strengths articulation
Level 5: Offer draft
Level 6: First client conversation
Level 7: Offer refinement
Level 8: Business model
...
```

Each step can include:
- Micro-learning (context)
- Practice (skill-building)
- Life action (real-world application)
- Profile update (self-knowledge captured)

---

## Key Differences from v1

| v1 (Current) | v2 (New) |
|--------------|----------|
| Main Quest / Side Quest / Upgrade | Just "My Next Move" |
| Multiple cards competing for attention | ONE recommended action |
| Separate flows for different action types | All action types unified |
| "Your World" | "My Life" |
| Game-labeled | Gamified but not labeled "game" |

---

## Visual Design Principles

1. **First-person language**: "Me", "My Life", "My Next Move"
2. **Calm confidence**: Not flashy, not guilt-inducing
3. **Progress visible**: XP bars, level indicators, streak (subtle)
4. **One clear CTA**: The main action button dominates
5. **Graceful escape**: Easy to explore without pressure

---

*Daily Loop Spec v2.0*
*Created: 2025-01-04*

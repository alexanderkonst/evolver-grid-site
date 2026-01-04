# Customer Journey Map

> The complete user journey through the Member Portal

*Three entry portals, one unified experience, one profile.*

---

## Three Entry Portals

| Portal | Primary Audience | Value Proposition |
|--------|-----------------|-------------------|
| **Transformational Ecosystem** | Growth seekers | Transform yourself |
| **Venture Cooperative** | Entrepreneurs | Monetize your genius |
| **Conscious Community Portal** | Community members | Belong to something |

All three lead to the **same unified onboarding** and **same core experience**.

---

## Unified Onboarding Sequence

```
Entry (any portal)
       ↓
┌─────────────────────────────────────────┐
│ ZONE OF GENIUS                          │
│ "Discover who you are at your best"     │
│ ~5 minutes · Immediate wow · Free       │
│                                         │
│ Swipe talents → Select top 10 →         │
│ Narrow to 3 → Rank → AI generates       │
│ Genius Profile with archetype           │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│ QUALITY OF LIFE MAP                     │
│ "See where your life is asking for      │
│  attention — and unlock your            │
│  exponential growth drivers"            │
│ ~5 minutes · Free                       │
│                                         │
│ Assess 8 domains (Wealth, Health,       │
│ Happiness, Love, Impact, Growth,        │
│ Social, Home) → Stages 1-10             │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│ PROFILE COMPLETE                        │
│ System can now recommend actions        │
│                                         │
│ "Based on your genius and where your    │
│  life is asking for attention, here's   │
│  your first move..."                    │
└─────────────────────────────────────────┘
       ↓
FREEDOM: Explore what calls you
(Like open-world games — guided but free)
```

---

## The Profile (One Profile Per Person)

All information about the person lives in ONE profile:

| Component | Description | Source |
|-----------|-------------|--------|
| **Genius Profile** | Archetype, talents, core pattern | Zone of Genius |
| **Quality of Life** | 8 domains × 10 stages (with decimals) | QoL Assessment |
| **Personality Data** | MBTI, Enneagram, Human Design, etc. | Personality tests |
| **Progress Data** | XP per vector, level, streak, completions | Actions taken |
| **Chosen Missions** | What they're contributing to | Mission discovery |
| **Assets** | What resources they have | Asset inventory |

The profile is:
- **Visible to the person** (they can see their data)
- **Shareable** (with permission, to third parties)
- **Driving recommendations** (informs "My Next Move")

---

## Daily Return Experience

See [Daily Loop Spec](./daily_loop_spec.md) for full details.

```
Person opens portal
       ↓
┌─────────────────────────────────────────┐
│              ME                         │
│   Archetype · Talents · Level · XP      │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│            MY LIFE                      │
│   8 QoL domains at a glance             │
│   "My life is asking for attention in:  │
│    [Wealth] and [Health]"               │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│         MY NEXT MOVE                    │
│   ONE action, dynamically chosen        │
│   Could be: practice, profile step,     │
│   microlearning, life action,           │
│   monetization step, connection         │
│                                         │
│   [DO IT] button                        │
│   "Not this? Explore more →"            │
└─────────────────────────────────────────┘
```

---

## Action Types (All Award XP to Vectors)

| Action Type | Description | Example |
|-------------|-------------|---------|
| **Practice** | Transformational activity | 10-min breathwork |
| **Profile Step** | Deeper self-understanding | Take personality test |
| **Microlearning** | Bite-sized education | 2-min video on shadow work |
| **Life Action** | Real-world task | Have a difficult conversation |
| **Monetization Step** | Genius business progression | Draft your offer headline |
| **Connection** | Social/collaboration | Message your partner |

---

## Zone of Genius Flow (Detailed)

```
/zone-of-genius (Landing)
       ↓
CTA: "Start Discovery" → /zone-of-genius/assessment
       ↓
Step 0: Swipe Talents (60 talents, Tinder-style)
       ↓
Step 1: Select Top 10 (from liked talents)
       ↓
Step 2: Select Top 3 Core Talents
       ↓
Step 3: Order Talents (1st, 2nd, 3rd)
       ↓
Step 4: AI Generates Genius Profile
       → Archetype title
       → Core pattern description
       → Top 3 talents
       → One-sentence genius
       → Save to profile
       → Optional PDF download
       ↓
Return to portal with profile created
```

---

## Quality of Life Flow (Detailed)

```
/quality-of-life-map/assessment
       ↓
Assess 8 domains (each has 10 stages):
   1. Wealth
   2. Health
   3. Happiness
   4. Love & Relationships
   5. Impact
   6. Growth
   7. Social Ties
   8. Home
       ↓
Complete → /quality-of-life-map/results
       ↓
Show:
   - Visual snapshot (radar chart or grid)
   - Lowest domains highlighted
   - Recommended next moves
       ↓
Save to profile
       ↓
Return to portal — recommendations now work
```

---

## Freedom Mode (Explore)

When person clicks "Explore more →":

```
Full action library, filterable by:
   ├── Vector (Spirit, Mind, Emotions, Uniqueness, Body)
   ├── Action Type (Practice, Learning, Life Action, etc.)
   ├── Duration (5, 10, 15, 30, 60 min)
   └── Energy (Activating, Calming, Balanced)
```

Like open-world games: there's a recommended path, but freedom to wander.

---

## Monetization Integration

Paid modules fit naturally into the action sequence:

| Free Actions | Paid Actions |
|--------------|--------------|
| ZoG Basic | ZoG Deep Dive |
| QoL Assessment | Coaching call |
| Practice from Library | Premium course |
| Microlearning | Genius Offer ($111) |
| Community connection | Destiny program ($3k) |

The system recommends paid actions when appropriate based on progress.

---

## Guest vs Authenticated

```
IF not logged in:
    ├── Guest mode: profile in localStorage
    ├── Banner: "Save your progress — create account"
    └── Full functionality, but data can be lost

IF logged in:
    ├── Profile in Supabase (persisted)
    ├── Cross-device sync
    └── Shareable profile for matchmaking
```

---

## Notation

- **Gamified**: Yes (XP, levels, progress bars, streaks)
- **Labeled as "game"**: No — it's just a well-designed portal
- **First-person language**: "Me", "My Life", "My Next Move"

---

*Customer Journey Map v2.0*
*Updated: 2025-01-04*

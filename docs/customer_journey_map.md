# Customer Journey Map

> Every click, every action — extracted from actual code

*This document maps the complete user journey through the Member Portal, from first visit to ongoing gameplay.*

---

## Current Entry Points

### Homepage (`/`)

```
User lands on homepage
    │
    ├── [CTA] "Explore Transformational Tools" → scroll to modules grid
    │
    ├── [CTA] "Explore the Library of Transformation" → /library
    │
    └── [Card] "PLAY YOUR LIFE AS A GAME" → /game
                "See yourself as a character, your life as a world, 
                 and choose one next move."
```

**Available Modules on Homepage:**
| Module | Category | Price | CTA Route |
|--------|----------|-------|-----------|
| Zone of Genius Discovery | Tools | Free | `/zone-of-genius` |
| Quality of Life Activation | Tools | Free | `/quality-of-life-map/assessment` |
| Multiple Intelligences | Tools | Free | `/intelligences` |
| Genius Offer Snapshot | Business | $111 | `/genius-offer` |
| Destiny: Genius Business | Business | 10% rev | `/destiny` (Calendly) |
| Genius-Layer Matching | Business | — | Calendly |
| AI Upgrade | AI | $33 | `/ai-upgrade` |
| Men's Circle | Ceremonies | — | `/mens-circle` |

---

## Flow 1: Game Entry (First-Time Player)

```
/game (GameHome)
    │
    ├── IF no profile exists:
    │       │
    │       └── Onboarding CTA: "Start Your Character"
    │               │
    │               └── "Begin: Discover My Zone of Genius" → /zone-of-genius?fromGame=1
    │
    └── IF profile exists:
            │
            ├── Character Section (Who I Am)
            │       ├── Archetype title
            │       ├── Core pattern
            │       └── Top 3 talents
            │
            ├── World Section (Where I Am)
            │       └── 8 QoL domains grid
            │
            └── Next Move Section
                    ├── Main Quest progress strip
                    ├── [Card] "Start Side Quest" → Quest Picker Modal
                    └── [Card] "Suggested Upgrade" → action
```

---

## Flow 2: Zone of Genius Assessment (Character Creation)

```
/zone-of-genius (Landing Page)
    │
    └── CTA: "Start Assessment" → /zone-of-genius/assessment
            │
            ├── Step 0: Swipe Talents (Tinder-style, 60 talents)
            │       → Swipe right/left on each talent
            │
            ├── Step 1: Select Top 10 (from liked talents)
            │       → Pick your strongest 10
            │
            ├── Step 2: Select Top 3 Core Talents
            │       → Narrow to top 3
            │
            ├── Step 3: Order Talents
            │       → Rank 1-2-3
            │
            └── Step 4: Generate Snapshot
                    → AI generates Genius Profile
                    → Save to database
                    → Download PDF option
                    │
                    └── Return to /game (with profile now exists)
```

---

## Flow 3: Quality of Life Assessment

```
/quality-of-life-map/assessment
    │
    └── Assess 8 domains (slider or multi-choice per domain):
            1. Wealth (10 stages)
            2. Health (10 stages)
            3. Happiness (10 stages)
            4. Love & Relationships (10 stages)
            5. Impact (10 stages)
            6. Growth (10 stages)
            7. Social Ties (10 stages)
            8. Home (10 stages)
            │
            └── Complete → /quality-of-life-map/results
                    │
                    └── Show snapshot + recommendations
```

---

## Flow 4: Daily Game Loop (Return Player)

```
Player opens /game
    │
    ├── See Main Quest progress (which quest am I on?)
    │       │
    │       └── CTA to advance Main Quest stage
    │
    ├── "YOUR NEXT MOVE" section:
    │       │
    │       ├── [Side Quest Card] "Start Side Quest"
    │       │       │
    │       │       └── Opens Quest Picker Modal:
    │       │               ├── Duration chips (5-150 min)
    │       │               ├── Mode chips (Activating/Relaxing/Balanced)
    │       │               └── Submit → AI recommends practice → "Start Quest"
    │       │                       │
    │       │                       └── Player does practice IRL
    │       │                               │
    │       │                               └── Marks complete → +XP → streak updated
    │       │
    │       └── [Upgrade Card] "Suggested Upgrade" → action route
    │
    └── Explore option → /library
```

---

## Flow 5: Library (Practice Selection)

```
/library
    │
    ├── Filter by Path: Spirit, Mind, Emotions, Uniqueness, Body
    │
    ├── Filter by Category: Meditation, Breathwork, Somatics, etc.
    │
    └── Each practice card:
        ├── Title, duration, path
        └── CTA → External link or embedded player
```

---

## Flow 6: Skill Trees

```
/skills or /game/path/:pathId
    │
    ├── Tab selector: 5 paths (Spirit, Mind, Emotions, Uniqueness, Body)
    │
    └── Each tree shows:
        ├── Nodes with status (locked/available/in_progress/completed)
        ├── Visual connections between nodes
        └── Click node → See description + linked quests
```

---

## Main Quest Stages (Storyline)

| Stage | Name | Completion Trigger |
|-------|------|-------------------|
| 0 | Entry | User exists |
| 1 | Know Thyself | ZoG completed |
| 2 | Map Your World | QoL completed |
| 3 | First Practice | 1 practice done |
| 4 | Building Momentum | 5 practices done |
| 5 | Real World Output | User marks done |

---

## Guest vs Authenticated

```
IF not logged in:
    ├── Guest banner: "Playing as guest. Log in to save progress."
    └── Profile stored in localStorage (lost on clear)

IF logged in:
    └── Profile stored in Supabase (persisted)
```

---

## 🚧 Open Questions (For Alexander)

1. **Where does QoL live?**
   - Is it part of Profile (character creation) or Game (transformation)?
   - Currently: QoL is done early, saved to profile, shown in Game

2. **Monetization path sequence?**
   - Currently ZoG → Genius Offer ($111) → Destiny ($3k) are separate flows
   - How should game connect to monetization?

3. **Library vs Side Quests?**
   - Same content, different framing
   - Should these merge or stay separate?

4. **Missing from current build:**
   - Per-vector levels (only total XP)
   - Domain → Vector mapping for recommendations
   - Microlearning content per skill node
   - Decimal QoL stages

---

## Next: Module Mapping

*See [module_registry.md](./module_registry.md) for the full LEGO blocks catalog.*

---

*Customer Journey Map v1.0*
*Extracted from code: 2025-01-04*

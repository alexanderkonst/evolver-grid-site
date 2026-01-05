# Game Architecture

> Implementation-level architecture for the Member Portal game engine

*This document captures the "how" — the UX contracts, core loops, and implementation patterns. For the philosophical "why" and ontological structure, see [Prime Radiant Spec](./prime_radiant_spec.md).*

> ⚠️ **Note**: Where this doc conflicts with the actual codebase, the code is the source of truth. This document is versioned design reference.

---

## North Star

> **"See yourself as a character, your life as a world, and choose one next move."**

The whole product resolves to this one sentence. Home screen always returns to ONE actionable next move (no overwhelm).

---

## The Kernel

> "Genius Profile = Player Model; everything else is a loop derived from it."

One intake → one Genius Profile → everything else is quests, upgrades, and matchmaking derived from that profile.

---

## Canonical Vectors (5 Development Dimensions)

**Only these 5 names appear in UI:**

| Key | Display Name | Path |
|-----|--------------|------|
| `spirit` | Spirit | Waking Up |
| `mind` | Mind | Growing Up |
| `emotions` | Emotions | Cleaning Up |
| `genius` | Genius | Showing Up |
| `body` | Body | Body |

> **Important**: These 5 Vectors (for XP/skill trees) are the development dimensions. The 8 QoL Domains (Wealth, Health, Happiness, Love, Impact, Growth, Social, Home) measure life outcomes.

---

## Being vs Doing Ontology

| Dimension | Concept | Definition |
|-----------|---------|------------|
| **BEING** | Purpose / Zone of Genius | To be authentically yourself — operating at your best |
| **DOING** | Mission / Contribution | What you DO from that place — projects, causes, impact |

**Purpose = Zone of Genius.** They are the same thing.
**Mission = Contribution.** What flows from being in your ZoG.

---

## Four Quadrants (Under the Hood)

*This is architectural — not for user interface.*

| Quadrant | Perspective | Loop | Focus |
|----------|-------------|------|-------|
| **Q1 (I)** | Interior Individual | Self-Understanding + Transformation | Being, Growing |
| **Q2 (WE)** | Interior Collective | Social | Relating, Community |
| **Q3 (IT)** | Exterior Individual | Economic + Venture Co-op | Doing, Professional |
| **Q4 (ITS)** | Exterior Collective | Systemic | Structures, Collective |

---

## Glossary (Non-Negotiable Meanings)

| Term | Definition |
|------|------------|
| **Main Quest** | Storyline milestone (identity → business → build → coop) |
| **Side Quest** | A practice chosen from the Library (breathwork, somatics, micro-actions) |
| **Upgrade** | Skill-tree node (unlocks next nodes; awards XP) |
| **Quest** | Small, scoped arc of play with completion criteria |
| **Practice** | A specific transformational activity from the Library |

---

## Core Loop

### Inputs
- Genius Profile
- Current state (active quests, XP, domain balances)

### Output on Home ("Your Next Move")
1. **Suggested Side Quest** — 1 practice card from Library
2. **Suggested Upgrade** — 1 next node from relevant skill tree
3. **Optional: Main Quest progress** — 1 compact progress line

---

## Recommendation Rules (v1)

1. Pick a **focus domain** (lowest XP or "life asks for attention" style)
2. **Side Quest**: Choose a Library practice tagged to focus domain (with duration filter)
3. **Upgrade**: Choose the next available node in that domain's tree (prereqs satisfied)
4. **When Side Quest is marked done**:
   - Add XP
   - Update streak
   - Save `last_completed_quest`

---

## UI Contract (Must Stay True as Complexity Grows)

| Principle | Rule |
|-----------|------|
| **Home** | Character + World + Next Move (in that order) |
| **Library** | Not "content browsing" — it's Side Quest selection + completion tracking |
| **Profile** | The "single source" object; everything derives from it |
| **No overwhelm** | Home always returns to "one next move" |
| **No guilt** | Gentle truth + one clear step; always safe to just look and leave |

---

## Four Core Loops

### 1. Self-Understanding Loop (Q1 — Profile precision)
*Know yourself deeper*
```
ZoG + Tests + Mission Discovery → Genius Profile → deeper mastery → better model
```

### 2. Transformation Loop (Q1 — Daily growth)
*Real change through consistent practice*
```
Recommended practice → completion → XP → momentum → identity evolution
```

### 3. Economic Loop (Q3 — Genius monetization + Venture Co-op)
*Turn genius into sustainable value exchange + collective wealth*
```
Genius Profile → Asset Mapping → Offer → Business → Revenue → Co-op → Reinvestment
```

### 4. Social Loop (Q2 — Connection)
*Find your people, create together*
```
Matchmaking → Collabs → "Soul Fam" → Guilds → Community
```

**Rewards are not cosmetic. They're functional:** XP + better matches + more opportunity.

---

## Player Flow (Entry to Economy)

```
Entry Scene
    ↓
Genius Discovery
    ↓
Character Creation (Genius Profile)
    ↓
World Unlock (enter game world)
    ↓
Onboarding (show what's possible + suggest 3 fun actions + rewards)
    ↓
Quest: Genius Business Reveal (play/level up)
    ↓
Daily Loop (nudges: recommended practice + "best next action")
    ↓
Next Best Profile Enhancement + Reward
    ↓
Enter Economic Engine (Genius Business Build)
    ↓
Co-op / Co-own the game (multiplayer economy)
```

---

## Character Data Structure

### Genius Profile (the canonical object)
| Field | Description |
|-------|-------------|
| One-sentence Genius | The core articulation |
| One mastery action | Daily action that builds mastery |
| Top 3 roles/functions | Primary expressions |
| Artistic self-expression | Creative manifestation |
| How to apply it | Practical guidance |
| Ideal co-founder | Complementary archetype |
| Essential colors | Visual identity |

### Quality of Life Map
| Domain | Example Stage |
|--------|---------------|
| Wealth | Stage 3 — Cautious Saver |
| Health | Stage 5 — Emerging Athlete |
| Happiness | Stage 4 — Grounded Joy |
| Love & Relationships | Stage 6 — Deep Partnership |
| Impact | Stage 2 — Seeking Purpose |
| Growth | Stage 5 — Active Learner |
| Social Ties | Stage 3 — Small Circle |
| Home | Stage 4 — Settled Base |

---

## UX Architecture (Layers)

### Layer 0: Public Website
- Home page with module tiles
- Library as standalone browsable tool
- CTA: "Enter the Game"

### Layer 1: Game Hub (`/game`)
*The heart of the RPG*

**If no profile yet:**
1. ZoG (character creation)
2. QoL (life stats)
3. Show Character Card, save with email/login

**If profile exists:**
- Character Dashboard with archetype + talents
- Latest QoL snapshot across 8 domains
- "Suggested focus for you now"
- Buttons: Get a Quest, Reassess My Life, Revisit My Genius

### Layer 2: Modules (reused, not replaced)
Each module is a scene the game can send the player into:
- Zone of Genius module
- Quality of Life module
- Library module
- (Later) Mission Discovery, Asset Mapping, Destiny Pack

**Key principle:** Don't wrap the whole site inside the game — add a `/game` hub that orchestrates existing modules.

---

## Character Home UX (Dec 2025)

### Layout: Three Bands
1. **You (Character)** — Who you are
2. **Your World (Now)** — Where you stand
3. **Your Next Move** — What to do

### Section Details

**Hero Strip:**
- First-time: "Welcome, Player One. You're about to turn your life into a game of evolution."
- Returning: "Welcome back, [Name]. You've completed [X] quests since you started."

**Character Card:**
- Archetype name as headline
- 1-line description
- Top 3 talents as pills
- "View Full Snapshot" link

**World State:**
- 8 QoL domains in compact grid
- Highlight lowest 1-2 domains needing attention
- Summary: "Your life is asking most for attention in: [domains]"

**Next Move Section:**
- Two cards side-by-side (stack on mobile):
  - Suggested Upgrade
  - Suggested Quest
- Quest Picker Modal with duration/mode chips

**Footer:**
- Reassess My Life
- Rediscover My Genius
- (Later) See My Journey

---

## Quest Picker Modal

**Duration chips:** 5, 10, 15, 20, 30, 45, 60, 90, 120, 150 min

**Mode chips:** Activating, Relaxing, Balanced

**Flow:** Selection → AI call → single recommended practice → "Start Quest" button

---

## Emotional Arc of Home Page

1. **Threshold** — "You're in a game. This matters, but it's not heavy."
2. **Recognition** — "This is who you are when you're most yourself." (warm, affirming)
3. **Clear Mirror** — "This is how your life looks across 8 domains." (honest, grounded)
4. **Invitation** — "Here is one powerful, doably-small next move." (no overwhelm)
5. **Micro-victory** — "You did something that moves the needle." (celebrate without fireworks)
6. **Continuity** — "You can come back, re-map, and keep evolving." (long-term relationship)

---

## Non-Goals (For Now)

- No "campaign layer"
- No marketing mechanics inside the game loop
- No multi-step funnels on Home
- Home always returns to "one next move"

---

## Quest Ladder (0-5)

| Quest | Name | Price | Output |
|-------|------|-------|--------|
| 0 | $1 Start (Gateway) | $1 | Initial Genius Profile seed |
| 1 | Genius Discovery | — | Polished Genius Profile |
| 2 | Genius Business | $33 | Ideal client, UVP, promise |
| 3 | Build Your Genius Biz | ~$3k | Paid build container |
| 4 | MVGB | — | 1 pain, 1 promise, 1 channel, 1 price |
| 5 | Genius Coop / Scale | — | Co-founder matching, team scan |

---

## Elevator Pitches

**15 seconds:**
> "I'm building a game entry into human mission: Genius Profile becomes the engine — it gives quests, upgrades, matchmaking, and cooperation economy."

**45 seconds:**
> "Right now people and communities have fragmented tools and intentions. I'm making a holonic gateway: one intake → one Genius Profile → then the system itself delivers the right quests/practices/collabs and builds a cooperation layer. Goal: communities can fork this with one button."

---

*Game Architecture — Implementation Reference*
*Last updated: 2025-01-03*

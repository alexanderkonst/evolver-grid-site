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

## Key Architectural Distinction

| Growth Paths | Game Spaces |
|--------------|-------------|
| Personal transformation | Game capabilities |
| Sequential progression | Always available |
| You change | You act |
| Unlock through effort | Available on entry |
| 5 paths (Genius, Spirit, Mind, Emotions, Body) | 5 spaces (Profile, Transformation, Marketplace, Matchmaking, Venture Co-op) |

**Growth Paths** = how you develop yourself → [growth_paths.md](./growth_paths.md)
**Game Spaces** = what you can DO → [game_spaces.md](./game_spaces.md)

---

## The Player Journey (5 Loops = 5 Spaces)

The arc of transformation (implicit narrative, visible as progression):

| Step | Journey | Space | What Happens |
|------|---------|------------|--------------|
| 1 | KNOW YOURSELF | Profile | ZoG, tests, assets, all self-data |
| 2 | MASTER YOURSELF | Transformation | Practices, 5 growth paths, QoL tracking |
| 3 | MONETIZE YOUR GENIUS | Marketplace | Offers, buying/selling, revenue |
| 4 | FIND YOUR PEOPLE | Matchmaking | Geniuses, teams, assets, missions, orgs |
| 5 | BUILD TOGETHER | Venture Co-op | Collective wealth, studio services |

**"My Next Move" = ACROSS ALL 5 LOOPS.** The unifying element.

### What You Do in Each Space

| Space | What You DO | Question Answered |
|-------|-------------|-------------------|
| **Profile** | Discover yourself: take tests, map assets, refine genius | "Who am I?" |
| **Transformation** | Grow yourself: complete practices, unlock upgrades, level up | "How do I grow?" |
| **Marketplace** | Monetize yourself: create offers, sell services, earn revenue | "How do I earn?" |
| **Matchmaking** | Connect yourself: find geniuses, teams, missions, orgs | "Who are my people?" |
| **Venture Co-op** | Scale yourself: join collective ventures, build together | "What can we build?" |

---

## The Core Insight

> **Life results ← Self-development**

This is the major unlock. QoL assessment reveals it. Then:

```
SAME START ─────────────────────────────► UNIQUE PATH
     │                                         │
     │ Genius Discovery (gateway)              │
     ▼                                         │
     │ QoL Assessment (unlock insight)         │
     ▼                                         │
     │ "Life results ← Self-development"       │
     ▼                                         │
     │ 5 Growth Paths revealed                 │
     ▼                                         │
     │ First actions (personalized)            │
     ▼                                         │
     └───► More actions ───► More divergence ──┘
```

**Starts the same, diverges as we learn about you.**

---

## 5 Growth Paths (Development Dimensions)

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
| **BEING** | Purpose / Unique Gift | To be authentically yourself — operating at your best |
| **DOING** | Mission / Contribution | What you DO from that place — projects, causes, impact |

**Purpose = Unique Gift.** They are the same thing.
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

### Output on Home ("My Next Move")
1. **One primary action** — unified action schema across quests, upgrades, practices, and growth path steps.
2. **Two alternates** — optional fallbacks for non-overwhelm and user choice.
3. **Context strip** — profile snapshot, QoL focus, and streak/level status.

### Unified Action Pipeline (v2)
Actions are normalized into a single schema with shared metadata (loop, growth path, QoL domain, duration, rationale) and routed through one completion handler. Telemetry is recorded via `action_events` for presented, accepted, completed, and override picks.

---

## Recommendation Rules (v2)

1. Select a **focus domain** (lowest QoL domains) when available.
2. Prefer **quick wins** for the first 1-3 actions (<=10 minutes).
3. Surface **one primary action** across all loops (Profile, Transformation, Marketplace, Matchmaking, Co-op).
4. Offer **two alternates** and a Freedom Mode escape hatch.
5. Completion updates XP, streaks, and growth path progress through a single handler.

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

## Five Core Loops (= 5 Spaces)

### 1. Profile Loop — KNOW YOURSELF
*Tell AI who you are*
```
ZoG + Tests + Mission Discovery + Assets → Complete Profile
```

### 2. Transformation Loop — MASTER YOURSELF
*Gamified growth across 5 vectors*
```
Practice → XP → Level Up → QoL improves
```

### 3. Marketplace Loop — MONETIZE YOUR GENIUS
*Turn genius into revenue*
```
Offer Creation → Listing → Sales → Revenue
```

### 4. Matchmaking Loop — FIND YOUR PEOPLE
*Connect with complementary geniuses*
```
Search → Match → Collaborate → Teams/Guilds
```

### 5. Venture Co-op Loop — BUILD TOGETHER
*Collective wealth creation*
```
Join → Contribute → Revenue Share → Scale
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
Quest: Unique Business Reveal (play/level up)
    ↓
Daily Loop (nudges: recommended practice + "best next action")
    ↓
Next Best Profile Enhancement + Reward
    ↓
Enter Economic Engine (Unique Business Build)
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
- Unique Gift module
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
| 2 | Unique Business | $33 | Ideal client, UVP, promise |
| 3 | Build Your Genius Biz | ~$3k | Paid build container |
| 4 | MVGB | — | 1 pain, 1 promise, 1 channel, 1 price |
| 5 | Genius Coop / Scale | — | Co-founder matching, team scan |

---

## Pitches (Simple Enough for a 13-Year-Old)

**One-liner (hallway):**
> "I'm building a real-life RPG where you're the character."

**10 seconds:**
> "I'm building a game that helps people figure out what they're best at and then grow into it."

**30 seconds:**
> "You know how video games have character creation and skill trees? I'm building that for real life. You take a quiz, discover your 'genius' — what makes you uniquely valuable — and then the app recommends small daily actions to level up. Complete actions, earn XP, see your life improve."

**60 seconds:**
> "Imagine a Duolingo for becoming your best self. You create a profile of your unique talents. You see a map of your life across 8 areas — money, health, happiness, relationships, etc. The app gives you ONE thing to do each day that's designed specifically for you. Do it, get XP, see progress. Over time, you unlock abilities, find your people, and even turn your genius into a business. It's already prototyped. I need help building the next version."

**For developers:**
> "I need help building a gamified self-development platform. Think: profile system, recommendation engine, XP/levels, and a modular architecture so different communities can fork it with their own branding. Stack is Next.js + Supabase. Want to build something meaningful?"

---

## Digital Village Concept (Future Game Screen)


*Decision made: Jan 5, 2025. Updated: Jan 6, 2025*

**Metaphor**: A village with spaces. Each space = one loop.

**5 Spaces (= 5 Loops = 5 Journey Steps):**
| Space | Loop | What You Do There |
|-------|------|-------------------|
| **Profile Space** | Profile | ZoG, tests, assets, all self-data |
| **Transformation Space** | Transformation | Practices, 5 growth paths, QoL tracking |
| **Marketplace Space** | Marketplace | Offers, buying/selling, revenue |
| **Matchmaking Space** | Matchmaking | Find geniuses, teams, assets, missions, orgs |
| **Venture Co-op Space** | Venture Co-op | Collective wealth, studio services |

**Themeable Villages (for White-Label):**
- Ascension/spiritual village
- Crypto/web3 village
- Land-based/regenerative village
- Venture studio village
- Self-development village

**UI Spectrum:**
```
SIMPLE                                              IMMERSIVE
   │                                                    │
   ▼                                                    ▼
Text buttons → Cards → illustrated map → 3D isometric → full VR
```

**Current Decision**: Stay minimal (text buttons, black/white). Village metaphor works at ANY point.

**Future Path**: Architecture supports 3D/VR/metaverse.

---

*Game Architecture — Implementation Reference*
*Last updated: 2025-01-05*

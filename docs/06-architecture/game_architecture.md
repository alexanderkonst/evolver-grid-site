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

Since 2026-10-30 the loops are read as one network of nodes with one data model: see [Node Architecture](#node-architecture-one-network-one-data-model-2026-10-30).

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

---

## Node Architecture: one network, one data model (2026-10-30)

*Provenance: Sasha approved «Node architecture, document only» (2026-10-30). Inspired by Qwatra's node (see [qwatra_blog_2026-10.md](../ai/qwatra_blog_2026-10.md) §1 post 5, §4). Sasha: «our list of modules is already a variation of this — see how it can enrich what we do.» Sources for the module list: the product architecture brief for Vladimir (`docs/02-strategy/partners/vladimir_product_architecture_brief.md`, Oct 2026; not present on main at `b0ca978`, read from a working copy): value ladder of 8 steps + other products; the village places in [game_of_being_you.md](../02-strategy/game_of_being_you.md) §13.1 and the Journey §14.2; the seven organs in [evolutionary_avantgarde_taxonomy.md](../02-strategy/evolutionary_avantgarde_taxonomy.md) («The whole»); the working matchmaker in `supabase/functions/*match*` and [matchmaker_brief_v4.31.md](../02-strategy/briefs/matchmaker_brief_v4.31.md). **Documentation only: no code, no migration.***

### The idea in one paragraph

The game, the Life OS and the Mastermind are not three products. They are one network of **nodes**, and every node carries the same four things. Qwatra's node is an enterprise, project or task. **Ours puts the person at the center:** the player is the root node, and every other node (a quest, a practice, a Workshop project, a stall, a match, a circle, a village) exists because it serves one or more people. This extends the Kernel above («Genius Profile = Player Model; everything else is a loop derived from it»): the loops are now nodes with one shape.

### The four properties (every node, no exceptions)

| Property | Plain meaning | Rule |
|---|---|---|
| **Goal** | why this node exists, and by when (if there is a when) | one sentence, in the owner's words |
| **Done when…** | the check that says it is finished, **written before work starts** | must point at a real event (fidelity §10a of the game blueprint): a saved artifact, a recorded sale, a sent intro, a re-taken map. Never points, never «feels done» |
| **Ledger** | what went in, what came back | many currencies, not only money (see below); append-only |
| **Agents** | who serves it: AI agents and the humans who hold the irreversible steps | each agent has «may do» and «must ask» lists |

### Node types, mapped to the modules and organs

Order runs from the center outward, as in the seven organs: person → path → circle → exchange → village → planet.

| Node type | Organ (taxonomy) | Village place (§13.1) | Modules / products today | Goal | Done when… (written in advance) | Ledger: in → back | Agents |
|---|---|---|---|---|---|---|---|
| **Person (player)** | Mirror + Myth-initiation | Gate, Your House | Top Talent / ZoG, Mission, Assets, QoL map, Character Sheet, Hero's-Journey quiz | a high quality of life; be recognized and paid for being yourself | **season:** the whole QoL map rises one stage (level = weakest domain); **journey:** first real «yes» from the world (first sale, the Slipper) | time, money spent on own growth → victories, resonance, QoL stages, income | the player's own AI (§18 «Your Familiar»), Evolver/Hark |
| **Quest** (journey step, daily practice, comeback quest, threshold) | Myth-initiation | Quest Board | `journeySequence`, `quests`/`quest_runs`, ModuleIntro/Outro | the module's one transformational result | the Outro artifact is saved (e.g. mission committed, tagline saved) | minutes, money (e.g. $37 Oracle Reading) → victory + resonance 1–10 | module AI; next-move recommender |
| **Practice / season (Life OS)** | Path | Academy, Your House | QoL Save Point, 21-day practice, Equilibrium (cycles + tasks), Founder Cockpit | move one domain, live by natural cycles | 21 days logged / weekly Save Point shows «up» in the chosen domain / season map re-taken | minutes, streak freezes → QoL stage changes | Equilibrium planner, Cockpit, own AI |
| **Workshop project** (a unique business) | Guild/Circle (creation) | Workshop | UBB, Founder-Market Fit ($555), Product-Market Fit ($5,555), product builder, commercial tools (ICP prospector, outreach radar, ledger) | a scalable product built on the person's top talent | tagline + priced offer published (J7); then first paid client (J12) | hours, money, attention → artifacts, revenue | UBB AI, product builder, ICP prospector; human coach (Sasha) |
| **Offer / stall** | Market of geniuses | Market | marketplace products, `/p/:slug`, offer pulses | a paid «yes» | a sale is recorded (`sales_events`) | price named, visits → revenue, testimonials | stall assembler (§14.12); the owner names price |
| **Match** (between two people) | Guild/Circle (meeting) | Café, Co-working | the existing matchmaker (below) | a useful encounter between two people | **v0:** mutual intro email sent after both said yes; **v1 (from the brief):** a next step chosen | proposals, attention → intros, conversations, collaborations, sales | proactive-match-proposal, match scoring; both people consent |
| **Circle** (Mastermind, founder circle, guild, Sovereign Founder Collective) | Guild/Circle | Mastermind (formerly Fire Circle) | Mastermind ($222, 2 sessions + 7 days), Mystery School, Entrepreneur's Evolution, Sovereign Founder Collective (10% to treasury) | each member takes a real step this season | before/after map at the closing ceremony; each member's chosen step done or honestly not | seats, hours → members' victories, income; treasury share | human facilitator holds the field; circle agent prepares and records |
| **Venture** (several people, one project) | Guild/Circle → Market | Town Hall (Venture Co-op) | missions, Venture Co-op, delivery for clients (50/50), licence (90/10) | a shared product or delivery | the agreed result accepted by the client / partners | each partner's contribution → revenue split by agreement | venture agent; partners sign terms |
| **Village** | Village | the map itself | `communities`, white-label onboarding, San Pancho Village #1 | residents earn from their gifts (one public number: residents' income) | target set by the Town Hall each season (e.g. N residents with a first sale) | residents' time → residents' income; share to Community Projects | village host agent, matchmaker; Town Hall decides |
| **Federation** *(horizon)* | Federation | — | network of villages (§16.5) | villages share method and matching | — later | — later | — later |

A **person can sit in many nodes at once** (several circles, matches, a venture), so links are a graph, not only a tree: «part of» gives the holarchy, «member of» and «between» give the network.

### Holonic relations: what rolls up, and how

- **Ledger rolls up by sum.** An entry is written once, at the node where it happened (a sale on the stall). Parents see it through the link: stall → project → person → village income. Nothing is double-written.
- **Progress rolls up by the bottleneck, not the average.** A person's level is the weakest QoL domain (Liebig's barrel, §10). The same rule can hold upward: a circle's season is as strong as its least-moved member is honestly seen; a village's number is residents' income, not visitors.
- **«Done when» rolls up by reference.** A parent's criterion may name its children («Workshop project is done when its stall has a first sale»). A child being done never closes a parent by itself; the parent's own check does.
- **Opening follows the same chain.** The lock rule (§14.3) is node logic: a node opens when an upstream node's «done when» fires (Top Talent saved → Your House opens; first sale → Town Hall opens).
- **Recursive self-investment.** Qwatra: a node reinvests in itself. Ours, at three scales: the person reinvests income in their own growth (value ladder steps 2 → 5); the Workshop's revenue share flows up (delivery 50/50, licence 90/10 with 10% to the Sovereign Founder Collective); the village sends a share to Community Projects. The ledger makes each flow visible.

### Where irreversible steps stay with the human

Agents prepare; a human confirms. Same boundary as Qwatra (reversibility), and the same as our approval rules.

| Irreversible step | Who confirms |
|---|---|
| Paying (seat, $37 reading, session, Product-Market Fit) | the player |
| Naming a price to a client; accepting paid terms; revenue-share agreements | the owner of the offer / the partners |
| Any introduction to another person | both people (double yes, below) |
| Publishing a stall, profile fields beyond the visibility matrix ([data_architecture.md](./data_architecture.md)) | the owner |
| Joining a circle or venture; a Town Hall decision | the person / the village |
| Outreach on someone's behalf | that person, always |

Everything an agent does on a node is written to the node's log (append-only), with its source, so a mistake becomes a search for the cause, not for the guilty.

### Matchmaking: the existing node flow (do not redesign)

Matchmaking already works and is modelled as it is, not replaced by a new needs/offers market. Per Sasha, it includes and exceeds Boardy's mechanics.

1. **Proposal.** Weekly, `proactive-match-proposal` picks one best candidate per eligible player from `suggest-asset-matches`, biased by their accept/decline history; writes `match_interests` + `match_proposals`; sends a 3-line email with Yes / Not now. Cap: one proposal a week; a decline cools off for 90 days; silence has no side effects.
2. **Or the player asks.** «I'd like to meet» on a card → `send-match-headsup-email` tells the other person who and why, with Yes / Not now.
3. **Consent.** `match-consent` (signed link) records the answer.
4. **Introduction.** Both yes → `send-mutual-intro-email`: both people on «to», equal standing, the platform introduces.
5. **Scoring.** resonance = 100 × ⁴√(top talent × mission × assets × QoL) (`_shared/matchScoring.ts`).

As a node: **goal** = a useful encounter; **done when** = mutual intro sent (v0), next step chosen (v1); **ledger** = proposals sent, answers, intros, and later conversations, collaborations, sales (the event chain in the matchmaker brief: found → accepted → reply → opening confirmed → next step → paid agreement → delivery → result); **agents** = proposer, scorer, consent handler; **human step** = the two yeses.

### What our module list adds that Qwatra lacks

1. **The person is the root, and being comes before doing.** Qwatra optimizes work objects; our root goal is a person's quality of life.
2. **Bottleneck progress.** Level = the weakest domain; Qwatra's account is a cost sum.
3. **A many-currency ledger.** Time, money, attention, resonance (1–10), QoL stages, victories. Recognition is a return, not only revenue.
4. **Consent on relationship nodes.** People are never bargained over; a match needs two yeses.
5. **Natural cycles as the clock.** Moon and sun (Equilibrium, §15.7a), not only deadlines.
6. **Privacy per field.** The visibility matrix: me / community / public.
7. **The player's own AI grows with every node** (§18): each finished node teaches it something.
8. **A path, not a plan.** Nodes open in the order life earns them (lock rule); a value ladder turns completed nodes into the next ones.

### What Qwatra adds that we lack (to adopt)

1. **«Done when» written in advance for every node**, including projects and circles (today only modules have a clear Outro artifact).
2. **The «invested» side of the ledger.** We record returns (victories, sales) but not what went in; adding it shows real return on a season.
3. **A critic agent and an append-only log per node**, with disagreements raised to the human with both positions.
4. **Event as the unit of change.** Each real event re-plans the next move locally (we already fire `JOURNEY_ITEM_COMPLETED_EVENT`; the node model makes it general).
5. **Not adopted:** the priced assignment market. Our coordination between people is the matchmaker plus consent.

### Minimal data model (overlay on existing tables)

The node model is a **thin layer over tables that already exist**; each node points at its source row. No migration until Sasha says yes.

```ts
type NodeKind = 'person' | 'quest' | 'practice' | 'project' | 'offer'
              | 'match' | 'circle' | 'venture' | 'village' | 'federation';

interface Node {
  id: string;
  kind: NodeKind;
  owner_id: string;                 // a person (game_profiles.id); for village/circle: its host
  parent_id: string | null;         // holarchy: «part of»
  goal: { text: string; by?: string };
  done_when: {
    text: string;                   // in plain words
    check: string;                  // the real event that proves it, e.g. 'sales_events:first'
    written_at: string;             // must precede the first ledger entry
    written_by: string;
  };
  state: 'closed' | 'open' | 'live' | 'done' | 'dropped';   // the lock rule states
  opened_by?: string;               // node id whose done_when opened this one
  visibility: 'me' | 'community' | 'public';
  source: { table: string; id: string };                    // existing row
  done_at?: string;
}

interface NodeLink {                 // the network beyond the tree
  from_id: string; to_id: string;
  relation: 'member_of' | 'between' | 'serves';
}

interface LedgerEntry {              // append-only
  id: string; node_id: string;
  direction: 'invested' | 'returned';
  currency: 'usd' | 'minutes' | 'attention' | 'resonance' | 'qol_stage' | 'victory';
  amount: number; note?: string;
  source: { table: string; id: string };
  recorded_by: 'agent' | 'human'; at: string;
}

interface AgentAssignment {
  node_id: string;
  agent: string;                    // 'own_ai' | 'evolver' | 'module:ubb' | 'matchmaker' | 'critic' | 'human:facilitator' …
  may_do: string[];                 // reversible actions
  must_ask: string[];               // irreversible actions → a named human
}

interface NodeEvent {                // the log
  id: string; node_id: string; type: string; actor: string;
  reversible: boolean; approved_by?: string; payload: unknown; at: string;
}
```

| Node kind | Source tables today |
|---|---|
| person | `game_profiles`, `zog_snapshots`, `qol_snapshots`, `user_assets` |
| quest | `quests`, `quest_runs`, `journey_victories`, `module_choices` |
| practice | `equilibrium_*`, `qol_snapshots` |
| project | `unique_business_dossiers`, `user_business_artifacts`, `product_builder_snapshots`, `founder_canvases` |
| offer | `marketplace_products`, `offer_pulses`; returns in `sales_events`, `testimonials` |
| match | `match_proposals`, `match_interests`, `match_intros`, `connections` |
| circle | `communities`, `community_members`, `events`, `event_rsvps` |
| venture | `missions`, `mission_participants`, `mission_outcomes` |
| village | `communities`, `village_particles` |
| log (all) | `action_events`, `resonance_events`, `email_send_log` |

### Later

- **Weekly journal + critic in the Workshop** — deferred.
- Federation node, cross-village matching.
- Building the overlay (tables `nodes`, `node_links`, `ledger_entries`, `node_agents`, `node_events`) — needs Sasha's yes.

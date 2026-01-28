# Prime Radiant Spec

> **v0.1** — Holonic Game Engine for New Earth Emergence

*This is the foundational architecture specification for the Member Portal of the Planetary OS. It defines the core ontology, game mechanics, and layered structure that everything else plugs into.*

> ⚠️ **Note**: Where this spec conflicts with the actual codebase, the code is the source of truth. This document represents design vision; the code represents current implementation.

---

## L0 — SOURCE / MYTH

### New Earth Emergence Field

**Assumptions:**
- Planet and humanity are in a phase shift: from extraction and fragmentation to regeneration and coherence
- Human + AI co-evolution is the main evolutionary lever of this phase
- The joint vision is:
  - Every being in its Genius
  - Every venture in right relationship to life
  - Every system tending toward regenerative coherence

**This OS exists to:**
Make that transition playable, navigable, and collaborative — from the scale of one person to the scale of civilization.

*This is the why.*

---

## L1 — ONTOLOGY KERNEL

### Integral Holonic Schema

These are the "tables of the universe" but alive — structured as holons. All higher layers (game engine, apps, DAO) rely on these.

### 1. Player Holon

*A human in symbiosis with AI*

| Field Group | Fields |
|-------------|--------|
| **Identity & Symbiosis** | player_id, basic profile (name, location, language, time zone), AI relationship state |
| **Zone of Genius** | Primary Genius archetype, top talents, Genius orientation text (Excalibur statement) |
| **Life Stats** | Current Quality of Life scores across key domains, history of snapshots (time-series) |
| **Developmental Paths** | Which Paths they're on, which Upgrades completed, XP totals & levels by path |
| **Missions** | Missions pledged to, role(s) in each, contribution history |

---

### 2. Practice / Upgrade Holon

*Any unit of transformation*

Examples: breathwork track, ceremony, coaching session, course/module, PMF sprint, inner practice

| Field | Description |
|-------|-------------|
| **Core** | id, title, description |
| **Type** | practice / assessment / container / milestone |
| **Domains Impacted** | Life domains (Wealth, Health, etc.), developmental paths |
| **Metadata** | Length (time), depth (light/medium/deep), energetic quality (calming/activating/integrating) |
| **Format** | Media type (video, audio, text, live session) |
| **XP & Rewards** | XP by path, possible badges/milestones unlocked |
| **Prerequisites** | Required upgrades, suggested starting state |

---

### 3. Mission Holon

*Things that actually want to exist in the world*

Examples: projects, ventures, movements, land-based communities

| Field | Description |
|-------|-------------|
| **Core** | id, name, core purpose |
| **Type** | venture / movement / community / experiment |
| **Stage** | idea → prototype → PMF → scale → stewarded transition |
| **Needs** | roles, skills, capital, land/resources, partnerships |
| **Metrics** | Impact indicators (qualitative/quantitative) |
| **Paths** | Which developmental paths this mission most activates |

---

### 4. Asset Holon

*Everything that can be brought into play*

Examples: skills, methodologies, capital, land, IP, relationships, tools

| Field | Description |
|-------|-------------|
| **Core** | id, name, description |
| **Type** | skill / capital / land / IP / tool / network |
| **Owner(s)** | players / communities / entities |
| **Availability** | available / limited / not available |
| **Terms** | gift, reciprocity, equity, revenue share |
| **Discoverability** | Tags, matchability index |

---

### 5. Place / Ecosystem Holon

*Where the game is physically & socially anchored*

Examples: eco-villages, hubs, bioregions, DAOs, studios, cooperatives

| Field | Description |
|-------|-------------|
| **Core** | id, name, geo/digital coordinates |
| **Type** | physical hub / digital community / hybrid |
| **Population** | players present, missions hosted, assets located |
| **Governance** | consensus, DAO rules, steward councils |
| **Quests** | Place-specific upgrades & missions |

---

### 6. Coordination Layer Holon

*Meta-level intelligence & stewardship*

Examples: blueprint circles, steward councils, DAO working groups, protocol maintainers

| Field | Description |
|-------|-------------|
| **Core** | id, name, scope (what they coordinate) |
| **Members** | players / orgs |
| **Jurisdiction** | protocols, schemas, rules, shared resources (treasury) |
| **Outputs** | new blueprints, upgraded rules, certified modules, conflict resolutions |

*This layer keeps the whole OS self-aware and self-evolving.*

---

## L2 — GAME ENGINE

### Loops, XP, Quests, Skill Trees

The game engine turns the ontology into playable reality.

### 1. XP System

XP is awarded for real actions that move life forward:
- Completing a Practice / Upgrade
- Improving a Life Stat (QoL step up)
- Contributing to a Mission milestone
- Offering an Asset that gets used

**XP is tracked per Path:**
- **Waking Up** — Spirit / Awareness / Love
- **Growing Up** — Mind / Meaning / Worldview
- **Cleaning Up** — Emotions / Shadow / Trauma
- **Showing Up** — Genius / Work / Entrepreneurship
- **Body** — Body / Nervous System / Home / Health

And optionally per domain (Wealth, Health, etc.)

XP thresholds define levels (per path and/or overall).

---

### 2. Skill Trees & Paths

Each Path is a skill tree:
- **Nodes** = Upgrades (assessments, practices, containers, milestones)
- **Edges** = Prerequisite relationships (what unlocks what)

**Example: Showing Up / Genius Path**
1. Take Zone of Genius Assessment
2. Receive AppleSeed (applications of Genius)
3. Receive Excalibur (unique Genius offer)
4. Design Destiny business (minimally viable Genius business)
5. Place first product in transformational marketplace
6. Enter Venture Cooperative

Each node:
- Gives XP
- May unlock new nodes
- May change visible options (new quests, missions, etc.)

---

### 3. Quests

Quests are small, scoped arcs of play.

| Type | Duration | Description |
|------|----------|-------------|
| **Micro-quest** | 1 session | Single practice or action |
| **Mini-arc** | 1–2 weeks | Focused on one domain or node |
| **Season** | 4–12 weeks | Multi-node journeys |

Each quest defines:
- **Objective** (e.g., "Move Wealth from Stage 2 → 3")
- **Required actions** (set of upgrades/practices)
- **Completion criteria** (self-assessment, QoL rescan, artifact created)
- **Rewards** (XP, badges, new nodes/missions unlocked, access to containers)

---

### 4. Seasons

A Season is a time-bounded, story-shaped container for multiple players to journey together.

- **Duration**: 4–12 weeks
- **Structure**: onboarding → weekly quests → mid-season check-in → closing ritual
- **Output**:
  - Upgraded Life Stats
  - Clarified Genius + path
  - New missions or contributions initiated
  - Relational bonds formed

*Seasons are the main unit of experience design on top of the engine.*

---

## L3 — INTERFACE SKINS

### Different Faces of the Same Engine

The same Prime Radiant can power multiple skins (apps/experiences):

| Skin | Focus | Suited For |
|------|-------|------------|
| **Game of You / LifeOS** | Individual life as character sheet. Genius, Life Stats, Paths, Next Quests | General players, 1:1 clients, personal evolution |
| **Founder Path** | Showing Up & Mission paths. Excalibur, Destiny business, PMF game, venture sprints | Founders, creators, entrepreneurs |
| **Mystery School** | Waking Up, Growing Up, Cleaning Up. Seasonal initiations, inner work, archetypal journeys | Spiritual dojos, integral schools, sanghas |
| **Community / Eco-Village OS** | Player + Place + Mission as shared dashboard. Community quests, shared assets, local rituals | Eco-villages, hubs, co-living, DAOs |
| **Venture Studio / Cooperative** | Mission + Asset + Player matching. Venture arcs, contributions, shared upside, PMF stages | Venture studios, regenerative funds, impact cooperatives |

Each skin:
- Reuses the same ontology + engine
- Adjusts copy, visuals, emphasis
- Can plug into the same AI matchmaking layer

---

## L4 — ECOSYSTEM & ECONOMY

### Marketplace, Venture Co-op, DAO

Once Players, Practices, Missions, Assets, and Places share a schema, the OS naturally grows an economy:

### Marketplace of Transformational Products
- Curated Practices / Upgrades exposed as "products"
- Discoverable by: Genius archetype, Life Stats, Paths, Missions, length, depth, cost
- Both internal (within a community/Season) and external (open marketplace)

### Venture Cooperative
- Missions + Assets + Players coordinated with:
  - Clear contribution records
  - Shared upside models (equity, tokens, revenue share)
  - XP and reputation tied to real contributions

### DAO / Stewardship Layer
- Governance of:
  - What counts as a canonical Upgrade
  - Quality standards
  - Protocol evolution
  - Treasury allocation
- Implemented via DAO tooling or simpler council structures

---

## L5 — PLANETARY PROTOCOL

### White-Label New Earth OS

Over time, the Prime Radiant can crystallize as a protocol:

### Data Model Spec
Schemas for: Player, Genius, Life Stats, Paths, Mission, Practice, Asset, Place, Coordination

### Interoperability Rules
- How instances talk to each other
- How AI agents consume and act on this data

### Reference Implementation(s)
- A working "Game of You" app
- Example integrations for communities, studios, DAOs

**Any conscious community, eco-village, school, or venture studio can:**
- Adopt the protocol as-is
- Fork it with local language/rituals
- Still stay compatible at the data and AI layer

---

## The Vision

> This OS is a shared planetary infrastructure for evolution — with a myth, a schema, and a game engine that all point to the same thing:
>
> **Every being in their Genius, every mission in right relation to life.**

---

*Prime Radiant Spec v0.1*

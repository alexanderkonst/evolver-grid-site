# Module Taxonomy — Holonic Map by Spaces

> **Version:** 2.2
> **Created:** 2026-01-28
> **Updated:** 2026-02-10
> **Purpose:** Master reference for all modules organized by Spaces + Versioning

---

## 🏷️ Module Versioning Scheme

> **Semantic versioning for product modules — simple, industry-standard, progressive.**

| Version | Stage | Definition | Criteria |
|---------|-------|------------|----------|
| **0.1** | Concept | Idea documented | Spec exists, no code |
| **0.3** | Prototype | Basic implementation | Works in isolation, may break |
| **0.5** | Proof of Concept | Integrated, testable | Connects to real data, basic flow |
| **0.7** | Alpha | Feature-complete | All features exist, needs polish |
| **0.9** | MVP | Minimum Viable Product | Usable by real users, stable |
| **1.0** | Commercial | Production-ready | Polished, tested, monetizable |
| **1.x** | Iterations | Post-launch improvements | Bug fixes, enhancements |

### Quick Reference
```
0.1 → 0.3 → 0.5 → 0.7 → 0.9 → 1.0 → 1.1+
Concept  Prototype  PoC   Alpha   MVP  Commercial
```

---

## 🎯 SLOGAN = SPACES

> **ME. LEARN. MEET. COLLABORATE. BUILD. BUY & SELL.**

| # | Word | Space Purpose | Modules |
|---|------|---------------|---------|
| 1 | **ME** | Know yourself, your profile | ZoG, QoL, Resources, Mission, Personality Tests |
| 2 | **LEARN** | Practices, growth paths | Library, Growth Paths, Skill Trees, Daily Loop |
| 3 | **MEET** | Events, coffee chats | Events, Men's Circle |
| 4 | **COLLABORATE** | Matchmaking, discover | Matchmaking, Connections |
| 5 | **BUILD** | Create products | Unique Business, Product Builder, Business Incubator |
| 6 | **BUY & SELL** | Marketplace | Browse/purchase offerings |

> **Note:** ME Space routes use `/game/grow/*` paths (legacy from "GROW" rename). SpacesRail displays "ME" label.

---

## 📊 MODULE VERSION MATRIX

### Overview by Space

| Space | Module | Version | Status | Route |
|-------|--------|---------|--------|-------|
| **ME** | Unique Gift | 0.9 | MVP | `/zone-of-genius` |
| **ME** | Quality of Life | 0.9 | MVP | `/quality-of-life-map` |
| **ME** | Mission Discovery | 0.7 | Alpha | `/mission-discovery` |
| **ME** | Resource Mapping | 0.7 | Alpha | `/game/grow/assets` |
| **ME** | Personality Tests | 0.5 | PoC | `/resources/personality-tests` |
| **LEARN** | Daily Loop | 0.7 | Alpha | `/game/next-move` |
| **LEARN** | Library | 0.7 | Alpha | `/library` |
| **LEARN** | Growth Paths | 0.7 | Alpha | `/game/learn/paths` |
| **LEARN** | Skill Trees | 0.3 | Prototype | `/game/skill-trees` |
| **MEET** | Events | 0.9 | MVP | `/game/meet` |
| **MEET** | Men's Circle | 1.0 | Commercial | `/mens-circle` |
| **COLLABORATE** | Matchmaking | 0.7 | Alpha | `/game/collaborate/matches` |
| **COLLABORATE** | Connections | 0.5 | PoC | `/game/collaborate/connections` |
| **BUILD** | Unique Business | 0.7 | Alpha | `/game/grow/genius-business` ¹ |
| **BUILD** | Product Builder | 0.7 | Alpha | `/game/build/product-builder` |
| **BUILD** | Business Incubator | 0.3 | Prototype | `/game/build` |
| **BUY & SELL** | Marketplace | 0.5 | PoC | `/game/marketplace` |
| **Special** | Onboarding | 0.7 | Alpha | `/start` |
| **Special** | Tour | 0.5 | PoC | (within onboarding) |
| **Standalone** | Art | 0.5 | PoC | `/art` |
| **Standalone** | Transcriber | 0.5 | PoC | `/transcriber` |
| **Standalone** | Equilibrium | 0.1 | Concept | — |
| **Standalone** | Clock | 0.1 | Concept | — |

> ¹ Unique Business is routed under `/game/grow` (ME Space) but logically belongs to BUILD Space.

---

## 📊 MODULES BY SPACE (Detailed)

### 🪞 ME SPACE (Profile)

#### Module: Unique Gift (UG) — v0.9

| Field | Value |
|-------|-------|
| Version | **0.9** (MVP) |
| Master Result | "Who am I?" → I know my genius and how to use it |
| Start | `/zone-of-genius/entry` |
| End | ZoG saved → `/game` |
| Dependencies | None (starting point) |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Appleseed (Talent Discovery) | 0.9 | MVP |
| Excalibur (Unique Offer) | 0.9 | MVP |
| ZoG Profile Display | 0.7 | Alpha |
| Bullseye Sentence | 0.9 | MVP |
| Vibrational Key | 0.9 | MVP |
| Three Lenses | 0.9 | MVP |
| Appreciated For | 0.9 | MVP |
| Mastery Stages | 0.7 | Alpha |
| Professional Activities | 0.9 | MVP |
| Roles & Environments | 0.9 | MVP |
| Complementary Partner | 0.9 | MVP |
| Monetization | 0.9 | MVP |
| Life Scene | 0.9 | MVP |
| Visual Codes | 0.5 | PoC |
| Elevator Pitch | 0.9 | MVP |

#### Module: Quality of Life (QoL) — v0.9

| Field | Value |
|-------|-------|
| Version | **0.9** (MVP) |
| Master Result | Fog about my life → Clear map of where I stand |
| Start | `/quality-of-life` |
| End | QoL saved → priorities set |
| Dependencies | None |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| 8-Domain Assessment | 0.9 | MVP |
| Priority Selection | 0.9 | MVP |
| Results Visualization | 0.9 | MVP |
| Growth Recipe | 0.7 | Alpha |

#### Module: Personality Tests — v0.5

| Field | Value |
|-------|-------|
| Version | **0.5** (PoC) |
| Master Result | Surface knowledge → Deep personality insights |
| Start | `/resources/personality-tests` |
| End | Results saved to profile |
| Dependencies | None |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| MBTI Import | 0.5 | PoC |
| Enneagram Import | 0.5 | PoC |
| Human Design Import | 0.3 | Prototype |
| Astrology Import | 0.1 | Concept |

#### Module: Mission Discovery — v0.7

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | Unclear purpose → Clear life mission I can live |
| Start | `/mission-discovery` |
| End | Mission saved |
| Dependencies | ZoG recommended |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| 800+ Mission Database | 0.9 | MVP |
| AI Mission Matching | 0.7 | Alpha |
| Mission Display | 0.7 | Alpha |
| Adjacent Missions | 0.5 | PoC |

#### Module: Resource Mapping — v0.7

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | Hidden assets → Visible superpowers ready to share |
| Start | `/game/grow/assets` |
| End | Resources saved |
| Dependencies | None |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| AI Resource Discovery | 0.7 | Alpha |
| Manual Resource Entry | 0.9 | MVP |
| Resource Categories | 0.7 | Alpha |
| Leverage Scoring | 0.3 | Prototype |

---

### ✨ LEARN SPACE (Transformation)

#### Module: Daily Loop (My Next Move) — v0.7

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | Overwhelmed → Clear on my ONE next move |
| Start | `/game` |
| End | Action complete → celebration → new recommendation |
| Dependencies | ZoG, QoL, Tour |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Recommendation Engine | 0.7 | Alpha |
| ME → LEARN → Nudges Logic | 0.7 | Alpha |
| Badge System | 0.7 | Alpha |
| Action Cards | 0.7 | Alpha |

#### Module: Library (Practices) — v0.7

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | Stuck in my head → Embodied daily practice |
| Start | `/library` |
| End | Practice complete → XP |
| Dependencies | None |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Practice Catalog (28 items) | 0.9 | MVP |
| Guided Audio Player | 0.9 | MVP |
| Practice Detail View | 0.9 | MVP |
| Practice Search/Filter | 0.5 | PoC |
| Practice Combos | 0.1 | Concept |
| Practice Sequences | 0.1 | Concept |

#### Module: Growth Paths (5 Vectors) — v0.7

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | Scattered efforts → Step-by-step mastery path |
| Start | `/game/learn/paths` |
| End | Step complete → XP → unlock next |
| Dependencies | Onboarding |

> **v2.2 change:** Upgraded from v0.5 to v0.7 — has dedicated module folder, 5 path sections with upgrades, path detail pages.

**Submodules (5 Growth Paths with 48 Upgrades):**

##### Path: Genius (Showing Up) — v0.7
| Upgrade | Version | Type | Status |
|---------|---------|------|--------|
| Unique Gift Test | 0.9 | Assessment | `module` |
| Apply Your Genius | 0.1 | Assessment | `coming-soon` |
| Upload Personality Tests | 0.5 | Assessment | `module` |
| Micro: Genius Distinctions | 0.1 | Micro | `coming-soon` |
| Unique Gift Activation | 0.7 | Activation | `available` |
| Multiple Intelligences | 0.7 | Assessment | `module` |
| Unique Offering | 0.9 | Paid | `module` |
| Unique Business | 0.7 | Paid | `coming-soon` |

##### Path: Spirit (Waking Up) — v0.5
| Upgrade | Version | Type | Status |
|---------|---------|------|--------|
| Micro: What is Spirit? | 0.1 | Micro | `coming-soon` |
| Spirit Baseline Assessment | 0.1 | Assessment | `coming-soon` |
| Micro: Shifting Consciousness | 0.1 | Micro | `coming-soon` |
| Conscious Breath | 0.7 | Activation | `available` |
| Heart Centering | 0.7 | Activation | `available` |
| State Shifting Experience | 0.7 | Activation | `available` |
| Micro: States of Consciousness | 0.1 | Micro | `coming-soon` |
| Micro: Depth Perception | 0.1 | Micro | `coming-soon` |
| Breathwork + Meditation | 0.7 | Activation | `available` |
| Micro: Five Major States | 0.1 | Micro | `coming-soon` |

##### Path: Mind (Growing Up) — v0.3
| Upgrade | Version | Type | Status |
|---------|---------|------|--------|
| Micro: Why This Matters | 0.7 | Micro | `available` |
| Micro: Mind Development | 0.1 | Micro | `coming-soon` |
| Micro: Thinking About Thinking | 0.1 | Micro | `coming-soon` |
| Micro: Essence of Mind | 0.1 | Micro | `coming-soon` |
| Micro: Cognitive Distortions | 0.1 | Micro | `coming-soon` |
| Distortion Discovery | 0.1 | Activation | `coming-soon` |
| Micro: Thinking Patterns | 0.1 | Micro | `coming-soon` |
| Micro: Blind Spots by Stage | 0.1 | Micro | `coming-soon` |
| Micro: Perspectives | 0.1 | Micro | `coming-soon` |
| Micro: Quadrants | 0.1 | Micro | `coming-soon` |
| Micro: Lines (MI) | 0.5 | Micro | `module` |
| Micro: Types | 0.5 | Micro | `module` |
| Micro: Holistic Thinking | 0.1 | Micro | `coming-soon` |
| Micro: Holonic Thinking | 0.1 | Micro | `coming-soon` |

##### Path: Emotions (Cleaning Up) — v0.5
| Upgrade | Version | Type | Status |
|---------|---------|------|--------|
| Emotional Baseline | 0.1 | Assessment | `coming-soon` |
| Emotion Vocabulary | 0.1 | Micro | `coming-soon` |
| Trigger Map | 0.1 | Assessment | `coming-soon` |
| Release Activation | 0.7 | Activation | `available` |
| Micro: Shadow Basics | 0.1 | Micro | `coming-soon` |
| Shadow Encounter | 0.7 | Activation | `available` |
| Integration Activation | 0.7 | Activation | `available` |
| Emotional Sovereignty | 0.1 | Micro | `coming-soon` |

##### Path: Body (Foundation) — v0.5
| Upgrade | Version | Type | Status |
|---------|---------|------|--------|
| Body Baseline | 0.1 | Assessment | `coming-soon` |
| Somatic Awareness Activation | 0.7 | Activation | `available` |
| Energy Audit | 0.1 | Assessment | `coming-soon` |
| Stress Response Map | 0.1 | Assessment | `coming-soon` |
| Nervous System Activation | 0.7 | Activation | `available` |
| Micro: Recovery Science | 0.1 | Micro | `coming-soon` |
| Full Body Reset | 0.7 | Activation | `available` |
| Body-Mind Integration | 0.7 | Activation | `available` |

#### Module: Skill Trees — v0.3

| Field | Value |
|-------|-------|
| Version | **0.3** (Prototype) |
| Master Result | Plateau → Next level unlocked |
| Start | `/game/skill-trees` |
| End | Upgrade complete → XP |
| Dependencies | Basic onboarding |

---

### 👥 COLLABORATE SPACE (Teams)

#### Module: Matchmaking — v0.7

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | Alone → Matched with my people |
| Start | `/game/collaborate/matches` |
| End | Matches displayed → intro sent |
| Dependencies | ZoG, Resources |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Genius Match (Similar) | 0.7 | Alpha |
| Complementary Match | 0.5 | PoC |
| Resource Match | 0.3 | Prototype |
| Mission Match | 0.3 | Prototype |
| Match Refresh | 0.7 | Alpha |

#### Module: Connections — v0.5

| Field | Value |
|-------|-------|
| Version | **0.5** (PoC) |
| Master Result | Invisible network → See who's aligned with me |
| Start | `/game/collaborate/connections` |
| End | Connection requested |
| Dependencies | Profile complete |

> **v2.2 change:** Upgraded from v0.3 to v0.5 — has people directory, mission selection, and connection management sub-routes.

---

### 🎉 MEET SPACE (Events)

#### Module: Events — v0.9

| Field | Value |
|-------|-------|
| Version | **0.9** (MVP) |
| Master Result | Solo journey → Part of live community |
| Start | `/game/meet` |
| End | Event registered |
| Dependencies | None |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Event CRUD | 0.9 | MVP |
| Event RSVP | 0.9 | MVP |
| Calendar Integration | 0.7 | Alpha |
| Event Discovery | 0.5 | PoC |

#### Module: Men's Circle — v1.0

| Field | Value |
|-------|-------|
| Version | **1.0** (Commercial) |
| Master Result | Alone in my journey → Held by brothers |
| Start | `/mens-circle` |
| End | Registration complete |
| Dependencies | None |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Landing Page | 1.0 | Commercial |
| Stripe Payment | 1.0 | Commercial |
| Registration Flow | 1.0 | Commercial |

---

### 🛠️ BUILD SPACE (Creation)

#### Module: Unique Business — v0.7

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | Hidden genius → Offer the world wants |
| Start | `/game/grow/genius-business` |
| End | Business saved |
| Dependencies | ZoG complete |

> **Route note:** Currently routed under `/game/grow` (ME Space) but logically belongs to BUILD.

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Ideal Client Profile (ICP) | 0.7 | Alpha |
| Promise Statement | 0.7 | Alpha |
| Distribution Channels | 0.5 | PoC |
| Vision Statement | 0.7 | Alpha |

#### Module: Product Builder — v0.7

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | Idea in my head → Working product |
| Start | `/game/build/product-builder` |
| End | Product deployed |
| Dependencies | Unique Business recommended |

> **v2.2 change:** Upgraded from v0.3 to v0.7 — has 7 working steps (ICP, Pain, Promise, Landing, Blueprint, CTA, Published), not just a prototype.

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| ICP Discovery | 0.7 | Alpha |
| Pain Analysis | 0.7 | Alpha |
| Promise Builder | 0.7 | Alpha |
| Landing Page Builder | 0.7 | Alpha |
| Blueprint Generator | 0.7 | Alpha |
| CTA Configuration | 0.7 | Alpha |
| Product Publishing | 0.5 | PoC |

#### Module: Business Incubator — v0.3

| Field | Value |
|-------|-------|
| Version | **0.3** (Prototype) |
| Master Result | Building alone → Backed by a studio |
| Start | `/game/build` |
| End | Application complete → onboarded |
| Dependencies | Unique Business |

> **v2.2 change:** Upgraded from v0.1 to v0.3 — has a basic BuildSpace page.

---

### 🏪 BUY & SELL SPACE

#### Module: Marketplace — v0.5

| Field | Value |
|-------|-------|
| Version | **0.5** (PoC) |
| Master Result | No visibility → My offer discoverable |
| Start | `/game/marketplace/browse` |
| End | Purchase/listing complete |
| Dependencies | Genius Offer |

> **v2.2 change:** Upgraded from v0.3 to v0.5 — has browse, creator pages (`/p/:slug`), and product pages (`/mp/:slug`).

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Browse Offerings | 0.5 | PoC |
| Public Profile Page | 0.5 | PoC |
| Genius Offer Listing | 0.5 | PoC |

---

### ⏰ STANDALONE PRODUCTS

#### Module: Equilibrium — v0.9

| Field | Value |
|-------|-------|
| Version | **0.9** (MVP) |
| Master Result | Arbitrary willpower-driven work → Harmonious cycle-aware deep work |
| Start | Standalone web app (iPad, desktop, phone) |
| End | Continuous tool — success = daily use |
| Dependencies | None (standalone, future Evolver integration) |
| Tech | Vite + TypeScript, Vanilla CSS, localStorage, no backend |
| Source | [Holonic Cycles Synthesis](file:///Users/alexanderkonst/evolver-grid-site/docs/01-vision/holonic_cycles.md) |
| Spec | [Product Spec](file:///Users/alexanderkonst/evolver-grid-site/docs/specs/equilibrium/equilibrium_product_spec.md) |
| Tracker | [Progress Tracker](file:///Users/alexanderkonst/evolver-grid-site/docs/specs/equilibrium/equilibrium_tracker.md) |
| Code | `equilibrium/` |

> **Essence:** Replaces mechanical clock with biological clock. Your breath is the clock.
> **Significance:** Infrastructure for a different relationship with time — time harmonization, not time management.
> **Nth-Consequence:** Humanity returns from mechanical time to biological time. The 8-hour workday dies.

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Breathing Circle (11s animation) | 0.9 | MVP |
| Sprint Timer (4×24min pulses) | 0.9 | MVP |
| Day Ring (progress through day) | 0.9 | MVP |
| Week Ring (planetary day) | 0.9 | MVP |
| Month Ring | 0.9 | MVP |
| Quarter Ring | 0.9 | MVP |
| Moon Phase | 0.9 | MVP |
| Transition Prompts | 0.9 | MVP |
| Settings (breath duration, toggles) | 0.9 | MVP |
| Actionable Guidance | 0.9 | MVP |
| Sprint Logging (localStorage) | 0.9 | MVP |

---

## 🗺️ SPECIAL MODULES

### Module: Onboarding — v0.7

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | Stranger → System knows who I am |
| Start | `/start` |
| End | Game unlocked |
| Dependencies | None |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Welcome Screen | 0.9 | MVP |
| Name Capture | 0.9 | MVP |
| ZoG Onboarding | 0.9 | MVP |
| QoL Onboarding | 0.7 | Alpha |
| Stage Tracking | 0.7 | Alpha |

### Module: Tour — v0.5

| Field | Value |
|-------|-------|
| Version | **0.5** (PoC) |
| Master Result | Lost → Know exactly where to start |
| Start | After ZoG complete |
| End | Tour complete → game starts |
| Dependencies | Onboarding |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Tour Steps Screen | 0.5 | PoC |
| Space Overview Cards | 0.5 | PoC |
| Skip/Continue Logic | 0.7 | Alpha |

---

## 🎨 STANDALONE MODULES

> These modules exist outside the 6 Spaces. They are independent tools or creative projects not shown in the platform's main navigation.

### Module: Art — v0.5

| Field | Value |
|-------|-------|
| Version | **0.5** (PoC) |
| Master Result | Abstract self → Visual expression of my essence |
| Start | `/art` |
| End | Art displayed |
| Dependencies | None |

> Previously listed under ME Space. Moved to Standalone in v2.2 per architectural decision.
> Navigation to Art is only visible to `alexanderkonst@gmail.com`.
> The `/art/*` routes remain publicly accessible via direct URL.

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Gallery | 0.5 | PoC |
| Ceremonial Spaces | 0.5 | PoC |
| Illustrations | 0.5 | PoC |
| Star Codes | 0.5 | PoC |
| Webportals | 0.5 | PoC |

### Module: Transcriber — v0.5

| Field | Value |
|-------|-------|
| Version | **0.5** (PoC) |
| Master Result | Video content → Searchable text transcript |
| Start | `/transcriber` |
| End | Transcript generated |
| Dependencies | None |

### Module: Equilibrium — v0.1

| Field | Value |
|-------|-------|
| Version | **0.1** (Concept) |
| Master Result | TBD |
| Start | — |
| End | — |
| Dependencies | None |

### Module: Clock — v0.1

| Field | Value |
|-------|-------|
| Version | **0.1** (Concept) |
| Master Result | TBD |
| Start | — |
| End | — |
| Dependencies | None |

---

## 📈 VERSION STATISTICS

### Module Count by Space

| Space | Modules | Submodules | Total Items |
|-------|---------|------------|-------------|
| ME | 5 | 25 | 30 |
| LEARN | 4 | 62 | 66 |
| MEET | 2 | 7 | 9 |
| COLLABORATE | 2 | 6 | 8 |
| BUILD | 3 | 11 | 14 |
| BUY & SELL | 1 | 3 | 4 |
| Special | 2 | 8 | 10 |
| Standalone | 4 | 5 | 9 |
| **TOTAL** | **23** | **127** | **150** |

---

## 🔔 My Next Move Logic (FINAL)

### The Sequence

```
1. ME → Profile completion first
   └── ZoG → QoL → Resources → Mission

2. LEARN → Ongoing forever (default rabbit hole)
   └── Library → Growth Paths → Skill Trees

3. One-time nudges:
   ├── Resources done → nudge COLLABORATE
   └── ZoG done → nudge BUILD (badge on icon)
```

### What's NOT in My Next Move

| Space | Why Not |
|-------|---------|
| **MEET** | User discovers events naturally |
| **BUY & SELL** | User browses anytime |
| **BUILD** (ongoing) | One-time nudge only |

### Badge System

🔓 Badge on space icon when something unlocks → user clicks → badge disappears

---

## 🧭 Three Lenses (for deep analysis)

| Lens | Question |
|------|----------|
| **Essence** | What is this fundamentally? |
| **Significance** | Why does it matter? |
| **Nth-Consequence** | What happens at 10K scale? |

---

## 📝 CHANGELOG

### v2.2 (2026-02-10)
- **Art** moved from ME Space to new Standalone section (v0.5, confirmed by code)
- **Growth Paths** upgraded v0.5 → v0.7 (dedicated module folder, 5 paths, detail pages)
- **Product Builder** upgraded v0.3 → v0.7 (7 working steps, feature-complete flow)
- **Connections** upgraded v0.3 → v0.5 (people directory, mission selection sub-routes)
- **Marketplace** upgraded v0.3 → v0.5 (browse, creator pages, product pages)
- **Business Incubator** upgraded v0.1 → v0.3 (basic BuildSpace page exists)
- **Standalone section** added: Art (v0.5), Transcriber (v0.5), Equilibrium (v0.1), Clock (v0.1)
- Added **route annotations** to version matrix for developer reference
- Added **route discrepancy notes** (ME uses `/game/grow`, Unique Business under ME not BUILD)
- ME Space module count: 6 → 5 (Art removed)
- Total modules: 20 → 23 (4 standalone added)
- Product Builder submodules rewritten to match actual 7-step implementation

### v2.1 (2026-02-06)
- Added versioning scheme and submodule detail tables
- Added version statistics

### v2.0 (2026-02-01)
- Restructured by Spaces architecture

---

*Module Taxonomy v2.2 — Versioned by Spaces*
*Last updated: 2026-02-10*

# Module Taxonomy — Holonic Map by Spaces

> **Version:** 3.3
> **Created:** 2026-01-28
> **Updated:** 2026-07-27
> **Purpose:** Master reference for all modules organized by Spaces + Versioning + Divine Stack Architecture

> **Refreshed July 27, 2026 (Day 137).** Audited against `src/App.tsx` route registrations; shipped vs specified vs seed now distinguished. This pass covers modules and routes shipped since v3.1 (2026-03-16) — Founder Cockpit, legal/trust pages, Communities, Evolution Portal (+ Karime variant), Build Container, `/destiny` unlocked from auth — plus three items that are documented but not yet code (Quiz spec, Originals Index v2, Reflection Proposal automation). See changelog v3.3 at the bottom for the full diff. Submodule-level detail below this pass is as of v3.1 and has not been individually re-verified line by line — treat top-level Version/Status/Route as current, submodule tables as directionally current.

---

## 🏛️ THE DIVINE STACK — Architecture of the Whole

> **Feb 18, 2026 discovery:** The modules below are **applications** running on top of **operating systems** which emerge from **cosmogenesis.** This is the nested architecture.

```
╔═══════════════════════════════════════════════════════════════╗
║  TIER 0: COSMOGENESIS (how anything comes into being)        ║
║  ├── Prime Radiant (the origin pattern)                      ║
║  └── Universal Ontology (holonic architecture of reality)    ║
╠═══════════════════════════════════════════════════════════════╣
║  TIER 1: OPERATING SYSTEMS (domain-specific architectures)   ║
║  ├── Uniqueness OS      → scanner → essence → articulation   ║
║  ├── Holomap OS         → seeing wholes within wholes        ║
║  ├── Meta-Blueprint OS  → simplicity → blueprint → AI → loop ║
║  └── Planetary OS       → full integration of all OSes       ║
╠═══════════════════════════════════════════════════════════════╣
║  TIER 2: APPLICATIONS (running on the OSes)                  ║
║  ├── Unique Business OS   (FMF → myth → movement → $)       ║
║  ├── Venture Cooperative  (multi-venture incubation)         ║
║  ├── AI Matchmaking       (structural resonance matching)    ║
║  ├── Equilibrium          (biological time OS)               ║
║  ├── Transformation OS    (QoL → growth paths → embodiment)  ║
║  ├── Community OS         (events → circles → connections)   ║
║  └── Marketplace OS       (discover → buy → sell)            ║
╚═══════════════════════════════════════════════════════════════╝
```

**Key insight:** The modules in Tier 2 are not independent products — they are applications running on shared infrastructure. The Uniqueness OS (Zone of Genius scanner) feeds into Unique Business OS, AI Matchmaking, and Transformation OS. The Meta-Blueprint OS enables all of them to be codified as AI-executable blueprints.

**Mapping to Spaces:**

| Tier 2 Application | Primary Space | OS Dependencies |
|--------------------|---------------|------------------|
| Unique Business OS | BUILD | Uniqueness OS, Meta-Blueprint OS |
| Venture Cooperative | BUILD | Unique Business OS |
| AI Matchmaking | COLLABORATE | Uniqueness OS |
| Equilibrium | Standalone | Holomap OS |
| Transformation OS | ME + LEARN | Uniqueness OS |
| Community OS | MEET + COLLABORATE | — |
| Marketplace OS | BUY & SELL | Unique Business OS |

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

> **Note (corrected v3.3):** `/game/grow/*` now redirects to `/game/me/*` in `src/App.tsx` — the ME Space live routes are `/game/me/*`. Route cells below updated accordingly; `/game/grow/*` kept working only as a redirect for old links.

---

## 📊 MODULE VERSION MATRIX

### Overview by Space

| Space | Module | Version | Status | Route |
|-------|--------|---------|--------|-------|
| **ME** | Unique Gift | 0.9 | MVP | `/zone-of-genius` |
| **ME** | Quality of Life | 0.9 | MVP | `/quality-of-life-map` |
| **ME** | Mission Discovery | 0.7 | Alpha | `/mission-discovery` |
| **ME** | Resource Mapping | 0.7 | Alpha | `/game/me/assets` (was `/game/grow/assets`, now redirects) |
| **ME** | Personality Tests | 0.5 | PoC | `/resources/personality-tests` |
| **LEARN** | Daily Loop | 0.7 | Alpha | `/game/next-move` |
| **LEARN** | Library | 0.7 | Alpha | `/library` |
| **LEARN** | Growth Paths | 0.7 | Alpha | `/game/learn/paths` |
| **LEARN** | Skill Trees | — | **Retired (v3.3)** — no route in `src/App.tsx` | ~~`/game/skill-trees`~~ |
| **MEET** | Events | 0.9 | MVP | `/game/meet` |
| **MEET** | Men's Circle | 1.0 | Commercial | `/mens-circle` |
| **COLLABORATE** | Matchmaking | 0.7 | Alpha | `/game/collaborate/matches` |
| **COLLABORATE** | Connections | 0.5 | PoC | `/game/collaborate/connections` |
| **BUILD** | Unique Business | 0.7 | Alpha | `/game/me/genius-business` (was `/game/grow/genius-business`, now redirects) |
| **BUILD** | Unique Business Canvas | 0.5 | PoC | `/game/build/canvas` (planned) |
| **BUILD** | Product Builder | 0.7 | Alpha | `/game/build/product-builder` |
| **BUILD** | Business Incubator | 0.3 | Prototype | `/game/build` |
| **BUY & SELL** | Marketplace | 0.5 | PoC | `/game/marketplace` |
| **BUY & SELL** | Founders Showcase | 0.7 | Alpha | `/game/marketplace/founders` |
| **System** | Holomap | 0.7 | Alpha | `/holomap` |
| **System** | Dashboard | 0.5 | PoC | `/dashboard` |
| **Special** | Onboarding | 0.7 | Alpha | `/start` |
| **Special** | Tour | 0.5 | PoC | (within onboarding) |
| **BUILD** | "Equilibrium" Biologic Watch (v2) | 1.0 | Implementation Complete | `/build/equilibrium` |
| **Standalone** | Equilibrium v1.x Clock (Web) | 0.9 | MVP, parallel-running | `/equilibrium` |
| **Standalone** | Equilibrium (Bot) | 0.9 | MVP | Telegram |
| **Standalone** | FMF Session | 0.5 | PoC | `/fmf` |
| **Standalone** | Art | 0.5 | PoC | `/art` |
| **Standalone** | Transcriber | 0.5 | PoC | `/transcriber` |
| **Standalone** | Clock | 0.1 | Concept | — |
| **System** | Founder Cockpit (Landing) | 0.9 | MVP | `/build/cockpit` |
| **System** | Founder Cockpit (Dashboard) | 0.9 | MVP | `/build/cockpit/dashboard` |
| **System** | Founder Cockpit (Offers Board) | 0.7 | Alpha — **dataless in prod** (see note) | `/build/cockpit/offers` |
| **MEET** | Community Webinar | 0.7 | Alpha | `/communities` |
| **Trust/Legal** | Your Data, Plainly | 0.9 | MVP | `/data` |
| **Trust/Legal** | Privacy Policy | 0.9 | MVP | `/privacy` |
| **Trust/Legal** | Terms of Service | 0.9 | MVP | `/terms` |
| **BUILD** | Evolution Portal (Practitioner Node) | 0.7 | Alpha | `/products/evolution-portal` |
| **BUILD** | Evolution Portal — Karime variant | 0.5 | PoC (private, noindex) | `/products/evolution-portal/karime` |
| **BUILD** | Build Container | 0.5 | PoC | `/products/built` |
| **Standalone** | Destiny | 0.5 | PoC — now public (auth requirement removed) | `/destiny` |
| **BUY & SELL** | The Originals (v1, founder list) | 0.5 | PoC — precursor to Originals Index v2 | `/the-originals` |
| **ME (seed)** | Quiz | 0.1 | **Specified, no code** — `docs/specs/quiz/quiz_product_spec.md` | — |
| **BUY & SELL (seed)** | Originals Index v2 | 0.1 | **Roadmap seed, no code** — Day 130, see roadmap.md | (planned, extends `/the-originals`) |
| **System (seed)** | Reflection Proposal automation | 0.1 | **Roadmap seed, no code** — Day 132, see roadmap.md | (planned, post-Direction-Call automation) |

> **Offers Board data note:** `CockpitOffersBoard` and `Admin` both read `src/generated/crm-snapshot.json`, which is gitignored — the component is shipped and renders correctly, but production has no live snapshot committed, so the board is currently empty in prod until a snapshot is generated/committed.

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
| Start | `/game/me/assets` (corrected v3.3; `/game/grow/assets` now redirects) |
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

#### Module: Skill Trees — RETIRED (v3.3)

| Field | Value |
|-------|-------|
| Version | **0.3** (Prototype) at last audit (v3.1) → **Retired**, no route found in `src/App.tsx` as of 2026-07-27 |
| Master Result | Plateau → Next level unlocked |
| Start | ~~`/game/skill-trees`~~ (no longer registered) |
| End | Upgrade complete → XP |
| Dependencies | Basic onboarding |

> Row kept for genealogy per project convention — do not delete. Concept lives on inside Growth Paths' upgrade system (5 Vectors, above), which superseded this standalone route.

---

### 👥 COLLABORATE SPACE (Teams)

#### Module: Matchmaking — v0.7

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | Alone → Matched with my people |
| Strategic Role | **Primary Acquisition Funnel (The Trojan Horse)** |
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

#### Module: Community Webinar — v0.7 (NEW, added v3.3)

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | Isolated learner → invited into a live community gathering |
| Start | `/communities` |
| End | Webinar registered |
| Dependencies | None |

---

### 🛠️ BUILD SPACE (Creation)

#### Module: Unique Business — v0.7

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | Hidden genius → Offer the world wants |
| Start | `/game/me/genius-business` (corrected v3.3; `/game/grow/genius-business` now redirects) |
| End | Business saved |
| Dependencies | ZoG complete |

> **Route note:** Currently routed under `/game/me` (ME Space) but logically belongs to BUILD.

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Ideal Client Profile (ICP) | 0.7 | Alpha |
| Promise Statement | 0.7 | Alpha |
| Distribution Channels | 0.5 | PoC |
| Vision Statement | 0.7 | Alpha |

#### Module: Unique Business Canvas — v0.5 (NEW)

| Field | Value |
|-------|───────|
| Version | **0.5** (PoC — exists as proven template, not yet interactive platform module) |
| Master Result | Scattered business ideas → One-page Canvas with 7 precision-scored artifacts |
| Start | `/game/build/canvas` (planned) |
| End | Canvas complete → feeds Product Builder + Marketplace |
| Dependencies | ZoG complete (auto-populates Section 1: Uniqueness) |

> **Context:** The Canvas has been session-tested with 2 founders (Oyi at 9.9, Sergey in progress). Template v5.0 proven. This module will be the interactive platform version of `unique_business_canvas_template.md`.

**Key Features (planned):**
| Feature | Description |
|─────────|─────────────|
| Two-Form Principle | Each artifact has full-signal + universal language versions |
| Precision Scoring | Founder rates each artifact (somatic response = ground truth) |
| Version History | Every iteration saved and comparable |
| ZoG Feed | Uniqueness section auto-populated from Appleseed + Excalibur |
| Product Builder Feed | Promise + Pain + Tribe → auto-generate landing page, lead magnet |

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

#### Module: Evolution Portal (Practitioner Node) — v0.7 (NEW, added v3.3)

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha, base) / **0.5** (PoC, Karime variant) |
| Master Result | Practitioner without a delivery system → client-facing Evolution Portal |
| Start | `/products/evolution-portal` |
| End | Portal configured for a practitioner's clients |
| Dependencies | None |

**Submodules:**
| Submodule | Version | Status | Route |
|-----------|---------|--------|-------|
| Base landing (public) | 0.7 | Alpha | `/products/evolution-portal` |
| Karime variant (private, noindex, personalized proposal) | 0.5 | PoC | `/products/evolution-portal/karime` |

> Legacy `/products/evolution-protocol` and `/product/evolution-portal` redirect to the canonical path.

#### Module: Build Container — v0.5 (NEW, added v3.3)

| Field | Value |
|-------|-------|
| Version | **0.5** (PoC) |
| Master Result | Idea with nowhere to live → contained BUILD-space product surface |
| Start | `/products/built` |
| End | Container configured |
| Dependencies | None |

> Legacy `/products/build` redirects to `/products/built`.

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
> **v3.1 change:** Marketplace now auto-populated via holonic sequencing. Sessions conducted in Antigravity → Canvas created → Marketplace listing generated automatically.

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Browse Offerings | 0.5 | PoC |
| Public Profile Page | 0.5 | PoC |
| Genius Offer Listing | 0.5 | PoC |
| Founders Showcase ("The Originals") | 0.7 | Alpha |
| Auto-Population Pipeline | 0.3 | Prototype |

#### Module: Founders Showcase — v0.7

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | "Who are these people?" → Living proof that unique businesses emerge from genius |
| Start | `/game/marketplace/founders` (in-platform) or `/founders` (public) |
| End | Inspiration → Book Productize Yourself Session |
| Dependencies | Unique Business Canvas complete |

> **Dual-mode rendering:** In-platform version renders with light-mode styling (white bg, tinted cards). Public version renders with dark starfield and aurora effects. Both share the same component.

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Founder Cards (expandable) | 0.7 | Alpha |
| Hero Section (reusable) | 0.7 | Alpha |
| CTA Section (reusable) | 0.7 | Alpha |
| Dual-mode styling (light/dark) | 0.7 | Alpha |

#### Module: The Originals (v1) — v0.5 (NEW, added v3.3)

| Field | Value |
|-------|-------|
| Version | **0.5** (PoC) |
| Master Result | Hardcoded founder list → living proof of the model, one page |
| Start | `/the-originals` |
| End | Continuous — success = list stays current |
| Dependencies | None |

> **Precursor, not the roadmap seed.** `src/pages/TheOriginalsPage.tsx` is a hardcoded 3-founder list (Alexander, Oyi, Sergey), shipped and in code today. The **Originals Index v2** described in the roadmap (Day 130 seed) — account-linked pages per venture, editable one-paragraph reads, public version history — is a **specified-not-built** upgrade of this page. See the seed row in the Version Matrix above and roadmap.md line ~494.

---

### 🧭 SYSTEM-LEVEL MODULES

> These modules span across spaces. They provide system-wide views of holonic emergence — one per person, one for the whole.

#### Module: Holomap — v0.7

| Field | Value |
|-------|-------|
| Version | **0.7** (Alpha) |
| Master Result | Scattered progress → Holonic view of the whole system |
| Start | `/holomap` (public) or `/game/holomap` (in-platform) |
| End | Continuous — success = whole-system awareness |
| Dependencies | Data from all spaces |
| OS Layer | Holomap OS |

> **Holonic Dashboard insight:** The Holomap is both per-person and per-system. Each founder has their own holonic reading. The system has a meta-holomap showing the emergence of the collective. This is a *holonic dashboard* — not just metrics, but nested awareness at every level.

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| 12-Perspective Compass | 0.7 | Alpha |
| Shadow Layer | 0.5 | PoC |
| Tension Mapping | 0.5 | PoC |
| 13th Perspective (Center) | 0.5 | PoC |
| Per-person instance | 0.3 | Prototype |

#### Module: Dashboard — v0.5

| Field | Value |
|-------|-------|
| Version | **0.5** (PoC) |
| Master Result | No overview → Clear view of my journey and the whole |
| Start | `/dashboard` |
| End | Continuous — success = clarity on what matters |
| Dependencies | ZoG, QoL, Unique Business |

> **Holonic Dashboard:** A unique business per person, a unique business canvas per person, and a dashboard for the entire emergence as well as per person. This is a holonic dashboard — nested views of the same living system at different scales.

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Personal Dashboard | 0.5 | PoC |
| System Dashboard (meta-view) | 0.3 | Prototype |
| Founder Progress Cards | 0.5 | PoC |

#### Module: Founder Cockpit — v0.9 (NEW, added v3.3)

| Field | Value |
|-------|-------|
| Version | **0.9** (MVP, landing + dashboard) / **0.7** (Alpha, offers board — dataless in prod) |
| Master Result | Scattered founder-state → one operator console for Sasha's own venture |
| Start | `/build/cockpit` |
| End | Continuous — success = daily-driver operator surface |
| Dependencies | Auth (dashboard: `RequireAuth`), Admin (offers board: `RequireAdmin`) |
| OS Layer | Holomap OS (reads live Equilibrium + CRM state) |

**Submodules:**
| Submodule | Version | Status | Route |
|-----------|---------|--------|-------|
| Cockpit Landing | 0.9 | MVP | `/build/cockpit` |
| Cockpit Dashboard (4 primary buttons + `cockpit-ai-lens` reflection) | 0.9 | MVP | `/build/cockpit/dashboard` (RequireAuth) |
| Cockpit Offers Board | 0.7 | Alpha — ships correctly but reads gitignored `crm-snapshot.json`, empty in prod until a snapshot is committed | `/build/cockpit/offers` (RequireAdmin) |
| `equilibrium-ai-context` edge fn (machine-readable Equilibrium, agent-token access) | 0.9 | MVP | Supabase edge fn |

> Legacy `/cockpit` and `/cockpit/dashboard` redirect to the `/build/cockpit/*` canonical paths.

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
| Spec | [Product Spec](file:///Users/alexanderkonst/evolver-grid-site/docs/specs/equilibrium/equilibrium_v1.1_product_spec.md) |
| Tracker | [Progress Tracker](file:///Users/alexanderkonst/evolver-grid-site/docs/specs/equilibrium/equilibrium_v1.1_tracker.md) |
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
| Watch UI Improvements | 0.5 | PoC |

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

### Module: Equilibrium (Standalone Concept) — v0.1

> ⚠️ **Superseded.** The Equilibrium concept has been fully realized — see the v0.9 entry above in Standalone Products.

### Module: FMF Session — v0.5

| Field | Value |
|-------|-------|
| Version | **0.5** (PoC) |
| Master Result | "I don't know what to build" → "I see my Founder-Market Fit" |
| Start | `/fmf` |
| End | Session booked |
| Dependencies | None (entry point for founders) |
| OS Layer | Unique Business OS (running on Uniqueness OS + Meta-Blueprint OS) |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Landing Page | 0.5 | PoC |
| Booking Flow | 0.3 | Prototype |
| Session Methodology (MAP→MATCH→MOVE) | 0.5 | PoC |

### Module: Equilibrium Bot — v0.9

| Field | Value |
|-------|-------|
| Version | **0.9** (MVP) |
| Master Result | Disconnected from cycles → Daily energy-aware living |
| Start | Telegram `/start` |
| End | Continuous tool — success = daily use |
| Dependencies | None (standalone Telegram bot) |
| Tech | Vercel Edge Functions, Supabase, Telegram Bot API |
| OS Layer | Holomap OS (cycles, rhythms, planetary intelligence) |

**Submodules:**
| Submodule | Version | Status |
|-----------|---------|--------|
| Onboarding (DOB capture) | 0.9 | MVP |
| Daily Energy Reports | 0.9 | MVP |
| On-demand `/energy` readings | 0.9 | MVP |
| 4-layer context engine | 0.9 | MVP |

### Module: Clock — v0.1

| Field | Value |
|-------|-------|
| Version | **0.1** (Concept) |
| Master Result | TBD |
| Start | — |
| End | — |
| Dependencies | None |

### Module: Destiny — v0.5 (NEW, added v3.3)

| Field | Value |
|-------|-------|
| Version | **0.5** (PoC) |
| Master Result | TBD experience, now reachable without login |
| Start | `/destiny` |
| End | — |
| Dependencies | None |

> Route recently unlocked from `RequireAuth` — now public. Audited against `src/App.tsx` line 614 (2026-07-27).

### Module: Trust & Legal Pages — v0.9 (NEW, added v3.3)

| Field | Value |
|-------|-------|
| Version | **0.9** (MVP) |
| Master Result | Vague data promises → plain-language commitments + the legal backing them |
| Start | `/data` |
| End | Reader trusts the platform's data handling |
| Dependencies | None |

**Submodules:**
| Submodule | Version | Status | Route |
|-----------|---------|--------|-------|
| Your Data, Plainly (Day 133 plain-language data promise) | 0.9 | MVP | `/data` |
| Privacy Policy | 0.9 | MVP | `/privacy` |
| Terms of Service | 0.9 | MVP | `/terms` |

---

## 🌱 SEEDS — Specified or Roadmapped, Not Yet Built

> Distinguished from the sections above: these have a spec or a roadmap entry but **no code in `src/`**. Included here so the map shows the full pipeline, not just what ships. Do not confuse with `Concept` version-stage modules elsewhere in this doc that already have some code (e.g. Clock) — these three have none.

### Seed: Quiz Module

| Field | Value |
|-------|-------|
| Status | **Specified, no code** |
| Spec | `docs/specs/quiz/quiz_product_spec.md`, `docs/specs/quiz/quiz_tracker.md` |
| Intended Space | ME |

### Seed: Originals Index v2

| Field | Value |
|-------|-------|
| Status | **Roadmap seed, no code** |
| Source | roadmap.md, Day 130 seed — "each venture in the Index gets an account-linked page; the one-paragraph read is editable by the venture itself; full version history of the paragraph is publicly visible" |
| Intended Space | BUY & SELL, extends `/the-originals` (see The Originals v1 above) |
| Sasha's framing | Parked — "not for the next month or two; the time will come soon." |

### Seed: Reflection Proposal Automation

| Field | Value |
|-------|-------|
| Status | **Roadmap seed, no code** |
| Source | roadmap.md, Day 132 seed — automates the post-Direction-Call reflection message from the call transcript (invariant quoted back, buying question, project core, one door) |
| Intended Space | System (feeds off Direction Call ops) |
| Sasha's framing | Manual first (ops §4a SOP); automate only after the manual pattern proves itself repeatedly. |

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
| BUY & SELL | 2 | 7 | 9 |
| System | 2 | 8 | 10 |
| Special | 2 | 8 | 10 |
| Standalone | 6 | 24 | 30 |
| **TOTAL** | **28** | **158** | **186** |

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

### v3.3 (2026-07-27, Day 137)
- **Refresh pass** — audited the Version Matrix and Standalone/System/BUILD/MEET sections against live `src/App.tsx` route registrations (last audit was v3.1, 2026-03-16 — ~4 months of drift).
- **Founder Cockpit** added as System-level module (v0.9 landing + dashboard, v0.7 offers board) — `/build/cockpit`, `/build/cockpit/dashboard`, `/build/cockpit/offers`. Offers board flagged **dataless in prod**: reads gitignored `src/generated/crm-snapshot.json`.
- **Community Webinar** added to MEET (v0.7) — `/communities`.
- **Trust & Legal Pages** added as Standalone module (v0.9) — Your Data Plainly (`/data`), Privacy Policy (`/privacy`), Terms of Service (`/terms`), all Day 133.
- **Evolution Portal** added to BUILD (v0.7) with Karime variant (v0.5, private/noindex) — `/products/evolution-portal`, `/products/evolution-portal/karime`.
- **Build Container** added to BUILD (v0.5) — `/products/built`.
- **Destiny** added to Standalone (v0.5) — `/destiny`, noted as recently unlocked from `RequireAuth` (now public).
- **The Originals (v1)** added to BUY & SELL (v0.5) — `/the-originals`, the hardcoded 3-founder precursor to the roadmap's Originals Index v2; explicitly distinguished from the seed below so nobody confuses the two.
- **New "SEEDS" section** — three items with a spec or roadmap entry but zero code, called out so the map doesn't imply they're built: Quiz module (`docs/specs/quiz/`), Originals Index v2 (roadmap Day 130 seed), Reflection Proposal automation (roadmap Day 132 seed).
- **Skill Trees retired** — `/game/skill-trees` has no route in `src/App.tsx`; row kept (not deleted) per project genealogy convention, marked Retired.
- **Route corrections** — `/game/grow/*` now redirects to `/game/me/*` in code; Resource Mapping and Unique Business route cells updated from `/game/grow/assets` and `/game/grow/genius-business` to their live `/game/me/*` equivalents.
- Module count: 28 → 35 shipped/specified/seed entries (7 new top-level additions, 1 retired, 3 tracked separately as seeds not counted in the shipped total). Submodule-level counts in the Version Statistics table below are unchanged from v3.1 pending a full submodule re-audit.

### v3.1 (2026-03-16)
- **Founders Showcase** added to BUY & SELL (v0.7) — dual-mode rendering (light/dark), reusable hero + CTA
- **Holomap** added as System-level module (v0.7) — holonic dashboard per person and per system
- **Dashboard** added as System-level module (v0.5) — nested views at different scales
- **System-Level Modules** section created — modules that span across spaces
- **Automated Holonic Sequencing** documented — sessions → canvas → marketplace auto-population
- **Marketplace** submodules expanded (3 → 5) with Founders Showcase and Auto-Population Pipeline
- Module count: 25 → 28, Submodule count: 146 → 158

### v3.0 (2026-02-18)
- **Divine Stack Architecture** added — Tier 0 (Cosmogenesis) → Tier 1 (Operating Systems) → Tier 2 (Applications)
- **Tier 2 Application mapping** added — 7 applications mapped to Spaces and OS dependencies
- **FMF Session** added as standalone product (v0.5)
- **Equilibrium Bot** added as standalone product (v0.9) — Telegram bot for daily energy readings
- **Equilibrium version fixed** — was showing 0.1 in standalone section, actual state is 0.9 (MVP)
- Module count: 23 → 25, Submodule count: 127 → 146

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

## 📐 KNOWLEDGE ARCHITECTURE — The Full System Map

> *v1.0 · March 19, 2026 — The map of the maps*

The knowledge system has the same holonic structure as everything else. Three meta-documents form a Trinity. Everything else nests inside them.

### The Trinity of Meta-Documents

| Document | Face | Trinity | What it answers |
|----------|------|---------|----------------|
| [holonic_vision.md](../01-vision/holonic_vision.md) | **VISION** | 🫀 Heart / Essence | *"What IS the PlanetaryOS? Why does it exist?"* |
| [morphogenetic_holomap.md](../02-strategy/morphogenetic_holomap.md) | **INTELLIGENCE** | 🧠 Mind / Significance | *"How does the system see itself and improve itself?"* |
| **module_taxonomy.md** (this document) | **CODE** | 🔥 Gut / Consequences | *"What actual modules get built and shipped?"* |

> Related vision-level documents: [manifesto.md](../01-vision/manifesto.md), [integration_layer_manifesto.md](../06-architecture/integration_layer_manifesto.md), [prime_radiant_spec.md](../07-technology/prime_radiant_spec.md)

### The Methodology & The Technology

Two kinds of playbooks exist. The distinction is profound:

| | **Business Playbooks** (The Methodology) | **Platform Playbooks** (The Technology) |
|---|---|---|
| **Purpose** | Teach someone how to build THEIR unique business | Build the TECHNOLOGY that runs the protocol |
| **Audience** | Clients, founders, anyone | Engineers, AI agents, the dev team |
| **Can be open-sourced?** | YES — that's the [Open Blueprint Paradox](../03-playbooks/unique_business_playbook.md#principle-2-the-open-blueprint-paradox) | Not yet — this is the proprietary infrastructure |
| **Simple test** | *"Would I put this in a NotebookLM video for a client?"* → **Yes** | *"Would I put this in a NotebookLM video for a client?"* → **No** |

**Business Playbooks (The Methodology):**

| Playbook | What it teaches |
|----------|----------------|
| [unique_business_playbook.md](../03-playbooks/unique_business_playbook.md) | The master methodology: from uniqueness to venture (Parts 0-V) |
| [product_playbook.md](../03-playbooks/product_playbook.md) | How to create a unique product |
| [marketing_playbook.md](../03-playbooks/marketing_playbook.md) | How to express it authentically |
| [distribution_playbook.md](../03-playbooks/distribution_playbook.md) | How to deliver it soul-aligned |
| [unique_business_creation_playbook.md](../03-playbooks/unique_business_creation_playbook.md) | The integrated 10-step version (Zero to Revenue) |

**Platform Playbooks (The Machinery):**

| Playbook | What it governs |
|----------|----------------|
| [ux_playbook.md](../03-playbooks/ux_playbook.md) | User experience standards |
| [ui_playbook.md](../03-playbooks/ui_playbook.md) | Visual design system |
| [software_architecture_playbook.md](../03-playbooks/software_architecture_playbook.md) | Technical architecture |
| [integrated_product_building_workflow.md](../03-playbooks/integrated_product_building_workflow.md) | AI-human co-creation workflow for modules |

### Holonic Theories (the universal principles underneath)

| Theory | What it grounds |
|--------|----------------|
| [universal_ontology.md](../01-vision/universal_ontology.md) | The cosmogenesis pattern — how anything comes into being |
| [integral_transactional_field_theory.md](../01-vision/integral_transactional_field_theory.md) | How value exchange works at every scale |
| [sacred_transaction_field.md](../01-vision/sacred_transaction_field.md) | Why clean transactions create trust and momentum |
| [pain_theory_playbook.md](../03-playbooks/pain_theory_playbook.md) | The 5-layer pain slicer — how to articulate what hurts |

### The Living Source of Truth

| Document | What it is |
|----------|-----------|
| [alexanders_unique_business.md](../02-strategy/alexanders_unique_business.md) | The methodology applied to its own creator. Recursively informs all playbooks. The proof that the system works |

### How It All Nests

```
LEVEL 0: Universal Ontology (how anything comes into being)
   ↓ informs
LEVEL 1: Holonic Theories (pain, transaction, sacred exchange)
   ↓ informs
LEVEL 2: Modular Playbooks (product, marketing, distribution)
   ↓↑ mirrors
LEVEL 3: Integrators
   ├── unique_business_playbook.md  (THE METHODOLOGY — human-facing)
   └── integrated_product_building_workflow.md  (THE MACHINERY — AI-native)
   ↓↑ recursively informs
LEVEL 4: alexanders_unique_business.md  (THE LIVING PROOF)
```

> **The Recursive Proof (Phase Shift #40):** Level 4 is not just an application — it feeds back into Levels 2-3. Every session sharpens the playbooks. Every sharper playbook produces a better session. The methodology improves through use.

---

## 🗺️ THE UNIQUENESS MAP — What It Actually Is (Day 138 finding)

> *Added 2026-07-28. A prior search for an artifact literally named "the uniqueness map" found nothing and concluded it doesn't exist (see `roadmap.md` Day 138 open thread Q5). That was a name-matching search, not a concept search — the thing exists, under other names, distributed across several artifacts that were never consolidated under one label.*

**What "uniqueness map" means in the corpus.** Two distinct things share the name, and the confusion comes from conflating them:

1. **The Uniqueness developmental line** — a 5-stage maturity axis for a person's relationship to their own gift: Unawareness → Initial exploration → Initiation → Integration → Embodiment (`docs/08-content/training_analysis_complete.md` line 181, an early curriculum artifact, "Map of Uniqueness Development"). This is the older, narrower sense — one line among several in a person's development, not an instrument.
2. **"The uniqueness map" as Sasha now uses it in conversation** — the *instrument* that places a person on that line and moves them along it. This is not one file. It is the composite of:
   - **The Ripeness Vector** (Phase Shift Technology 123, `docs/01-vision/phase_shift_technology_library.md` line 7482) — nine axes describing a person's readiness for transformational work; **Uniqueness is one of the nine axes** ("development of their relationship to their own gift," target stage 3-4 of 5 — the same 5-stage line as #1 above).
   - **The Transition Holomap** (Phase Shift Technology 124, `docs/holomaps/transition_holomap.md`) — the 7-stage (extended to 10) Identity/Economy/Fit taxonomy, 63-cell grid. This is the *mechanism*: "a transition is the mechanism by which the uniqueness line advances: uniqueness is the ratchet, a completed transition is the click" (Technology 124, and echoed verbatim in `alexanders_unique_business.md` §10 Method v4.0, line 3442).
   - **The Quiz** (`docs/specs/quiz/quiz_product_spec.md` + `quiz_tracker.md`) — the shipped product that operationalizes both: it places a person on the Transition Holomap's 7 stages, reads the Identity/Economy/Fit spread, and its output loop *is* the crossing-work that advances the Uniqueness axis of the Ripeness Vector. **This is why Sasha says the quiz is based on the uniqueness map** — the quiz is the first artifact that actually implements the instrument, even though no single file is titled "uniqueness map."

**Version state, concretely:**
- v1.0 (implicit): the 2026-01/02-era "Map of Uniqueness Development," 5 stages, curriculum-only, never shipped as a product.
- v1.5 (implicit, Day 136, Jul 26): Technology 123 (Ripeness Vector) formalizes Uniqueness as one of nine scored axes; Technology 124 (Transition Holomap) formalizes the mechanism that moves it. Still three separate documents, no consolidated label.
- **What a "v2.0" would concretely mean**, given what shipped in the last ten days (Day 128-138): the Quiz reaching Phase 3 (retrodiction-tested against the 7 known clients — `roadmap.md` Q1, `quiz_tracker.md`) is the point at which the instrument stops being three cross-referenced documents and becomes one working, validated tool a stranger can use on themselves. A v2.0 uniqueness map is therefore not a new doc to write — it is the Quiz shipped and retrodiction-proven, with Technology 123 and 124 as its named theoretical spine. Scoping it as a fresh artifact (as `roadmap.md` Q5 currently frames it) would duplicate work already in flight under Q1.

**Constituent files (no new file created — this section is the consolidation):**
- `docs/01-vision/phase_shift_technology_library.md` — Technologies 123, 124 (125, 126 are adjacent: Social Physics of the Mirror, Persuasion as a Perception Deficit — not part of the uniqueness map itself, but govern when/how it may be shown to someone).
- `docs/holomaps/transition_holomap.md` — the 7/10-stage instrument.
- `docs/specs/quiz/quiz_product_spec.md`, `docs/specs/quiz/quiz_tracker.md` — the shipping product.
- `docs/02-strategy/unique-businesses/alexanders_unique_business.md` §10 Method v4.0 — names the ratchet/click relationship.
- `docs/08-content/training_analysis_complete.md` — origin of the 5-stage Uniqueness line itself (older, narrower artifact, still the correct definition of the axis).

*Note: `roadmap.md` Day 138 Q5 ("Uniqueness map v2.0 — no v2.0 scope or draft found") was written before this consolidation and is now superseded by the finding above; left unedited pending Sasha's read, per this investigation's scope (correction authority was for the revenue figure only).*

---

*Module Taxonomy v3.2 — Knowledge Architecture added*
*Last updated: 2026-03-19*

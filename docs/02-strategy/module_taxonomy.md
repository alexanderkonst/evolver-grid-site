# Module Taxonomy — Holonic Map by Spaces

> **Version:** 4.0
> **Created:** 2026-01-28
> **Updated:** 2026-11-17
> **Audited against:** `src/App.tsx` at SHA `1524f2ffcadfcfa03f87ac8f5a1306bfb80a6b19` (short `1524f2f`), route table lines 547–1148
> **Purpose:** Master reference for all modules organized by Spaces + Versioning + Divine Stack Architecture. One source of truth for what the platform's modules are, how they nest inside one another, and which products are built from which modules.

> **v4 (2026-11-17).** Five additions, all below: (1) the **v4 Version Matrix**, re-audited route by route against `src/App.tsx` at the SHA above, with a route-coverage ledger; (2) **Nesting**, a tree of module → submodules with one plain sentence per node; (3) **Products × modules**, one row per product in `docs/04-products/product_brief.md` §0; (4) **Module interface**, inputs, outputs and what each top-level module unlocks, with a mark on modules that could be white-labeled or contributed by an external project; and, added the same day on Sasha's approval, (5) the **Crosswalk** shift → product → module → game step, joined by the product keys of `src/data/productMap.ts`, on brief §0 v1. Older sections are kept and marked superseded where v4 replaces them; nothing was deleted. Prices are not in this file (they live in `product_brief.md`). Module names are unchanged; where code and brief use different names for one thing, both are shown. See changelog v4 at the bottom.

> **Previous refresh, July 27, 2026 (Day 137).** Audited against `src/App.tsx` route registrations; shipped vs specified vs seed now distinguished. This pass covers modules and routes shipped since v3.1 (2026-03-16) — Founder Cockpit, legal/trust pages, Communities, Evolution Portal (+ Karime variant), Build Container, `/destiny` unlocked from auth — plus three items that are documented but not yet code (Quiz spec, Originals Index v2, Reflection Proposal automation). See changelog v3.3 at the bottom for the full diff. Submodule-level detail below this pass is as of v3.1 and has not been individually re-verified line by line — treat top-level Version/Status/Route as current, submodule tables as directionally current.

---

## ⟡ Executive Summary & 27-Perspective Synthesis

> *Synthesis layer added 2026-08-16. A plain-language abstract and a holonic reading of the whole. The matrix below stays the source of truth, audited against `src/App.tsx`.*

This is the master reference for every module in the platform: what exists, at what maturity, on which route. It organizes the whole in two crossing views. Vertically, the **Divine Stack** — Tier 0 cosmogenesis (Prime Radiant, Universal Ontology), Tier 1 operating systems (Uniqueness OS, Holomap OS, Meta-Blueprint OS, Planetary OS), Tier 2 applications running on them. Horizontally, the **six Spaces** of the slogan — ME · LEARN · MEET · COLLABORATE · BUILD · BUY & SELL. Every module carries a semantic version (0.1 concept → 1.0 commercial) and a status honestly marked against shipped code, including what is specified-but-not-built and what has been retired. It is the map that keeps the build legible to itself.

**The whole in one line:** *One nested architecture — cosmogenesis under operating systems under applications — laid across six Spaces, each module placed by what it is, how mature it is, and where it lives in the code.*

**Three depths:**
- ❤️ **Essence** — the modules are not independent products but applications running on shared infrastructure; the Uniqueness OS feeds Unique Business, Matchmaking, and Transformation, and the Meta-Blueprint OS lets each be codified as an AI-executable blueprint.
- 🧠 **Significance** — a growing platform stays coherent only when it can see its own interior. This registry is that self-legibility: shipped versus specified versus seed, distinguished on sight, so ambition and reality never blur.
- 🔥 **Consequence** — anyone (or any AI) can look here and know what to build next, what to reuse, and what is already live, without re-reading the codebase.

**Four quadrants:**
- **I (interior)** — the SLOGAN as identity: ME · LEARN · MEET · COLLABORATE · BUILD · BUY & SELL is the felt shape of the member's journey.
- **It (form/mechanism)** — the version matrix: every module with a semantic version, a status, and a verified route.
- **We (culture/meaning)** — Spaces name the member's world in plain verbs, not feature categories; the platform reads as a place to live, not a toolbox.
- **Its (system/scale)** — the Divine Stack: applications nested in operating systems nested in cosmogenesis, one architecture from origin pattern to shipped route.

**◉ The Center (13th):** the registry's real function is self-legibility. A platform grows precisely by making its own interior visible to itself (Technology 115), and this document is that operation performed on the product surface.

**✦ Crystallization (27th):** the map is only worth keeping if it stays honest against the code. The one non-negotiable discipline: every refresh re-audits against `src/App.tsx` and marks shipped versus specified versus seed, so the map never quietly leads the territory.

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

## 🧾 v4 VERSION MATRIX — audited against `src/App.tsx` at `1524f2f`

> **Supersedes** the v3.3 matrix further down (kept for history). Audited 2026-11-17.

**How it was audited.** Every `<Route>` element in `src/App.tsx` lines 547–1148 was read: 301 elements = **294 with a path** + **6 index routes** (children of `/game/learn/genius-assessment`, `/game/build/product-builder`, `/ubb`, `/quality-of-life-map`, `/game/me/quality-of-life`, `/zone-of-genius/assessment`, `/art`; they carry no path of their own) + **1 layout route** (the shell wrapper, no path). Of the 294 paths, **76 are redirects** and **218 render a page** (105 public, 80 behind `RequireAuth`, 30 behind `MeGate`, 3 behind `RequireAdmin`; a child route counts under its parent's wrapper, so the `/ubb/*` steps are `MeGate` and the `/art/:category` page is `RequireAuth`). "Public" means no router wrapper; a few pages check access inside the page (see SY-3). Every one of the 294 is assigned to exactly one row below; the ledger after the matrix lists them all and its counts sum to 294. The tally was made by a one-off script over the route table at this SHA; it is not kept in the repo, so the next refresh should repeat it.

**What v4 re-checks, and what it does not.** It re-checks that each route exists, where it goes, and who can open it. It does **not** re-rate maturity: the Version column keeps the v3.3 rating, and modules new to this file say **not rated**. Submodule tables in the detailed sections further down are as of v3.1 (v3.3 already said so) unless a row below says otherwise.

**Status words.**
- **shipped**: route present and renders a page at this SHA.
- **redirect only**: the old route now forwards elsewhere; no page of its own.
- **no route (concept/retired?)**: the doc names a module but `src/App.tsx` has no route for it. Not guessed further.
- **found in code, undocumented**: a route (or page file) exists with no module row in v3.3.
- **access**: public · `auth` (RequireAuth) · `me-gate` (signed-in users see the page, guests see an account-save card) · `admin` (RequireAdmin).

### The matrix (62 rows)

| ID | Space | Module | Route(s) at SHA (key ones; all in the ledger) | v3.3 rating | v4 status and notes |
|---|---|---|---|---|---|
| ME-1 | ME | Unique Gift (Top Talent, Zone of Genius) | `/zone-of-genius/entry` (public door); `/zone-of-genius/assessment/step-1…4`; `/zone-of-genius/appleseed`, `/zone-of-genius/excalibur` (auth); `/game/me/zone-of-genius`, `/game/me/zone-of-genius/:perspectiveId` (me-gate); `/activate-top-talent`; `/quiz2` | 0.9 | shipped. **Route corrected:** `/zone-of-genius` is only a redirect to `/zone-of-genius/entry`; so are `/genius-offer` and `/game/journey/start`. `/activate` and `/activate/welcome` redirect to `/game/me/zone-of-genius/start-here`. `/quiz2` (a quiz version of the test) and `/my-result` (a result page opened by magic link) are found in code, undocumented. |
| ME-2 | ME | Quality of Life | `/quality-of-life-map`, `/quality-of-life-map/assessment`, `/quality-of-life-map/results`; `/game/me/quality-of-life` (auth); `/game/learn/qol-assessment`, `/game/learn/qol-results` (auth) | 0.9 | shipped. The detailed section below says start `/quality-of-life`; there is no such route. |
| ME-3 | ME | Mission Discovery | `/mission-discovery` (auth); `/game/me/mission` (me-gate); `/mission`, `/discover-mission`, `/zone-of-genius/mission` | 0.7 | shipped. The three guessed URLs show the closed Home door (`MissionLocked`), not the module. |
| ME-4 | ME | Resource Mapping (Asset Mapping) | `/asset-mapping`, `/asset-mapping/wizard` (auth); `/game/me/assets` (me-gate) | 0.7 | shipped. The Journey enters at `/asset-mapping`. |
| ME-5 | ME | Character Sheet (Your House) | `/game/me/overview`, `/game/me/profile` (me-gate); `/game/snapshot` (auth); `/game/me` → `/game/me/zone-of-genius` | not rated | shipped, **not in v3.3**. Village place key `house`, named "Home". `/game/profile*` and `/game/grow*` redirect to `/game/me`. |
| ME-6 | ME | Personality Tests | `/resources/personality-tests`, `/game/learn/tests` (auth) | 0.5 | shipped. |
| ME-7 | ME | Your AI | `/game/your-ai` | not rated | shipped, **not in v3.3**. Code: `src/modules/familiar`, edge function `your-ai-turn`; tracker `docs/specs/ai-familiar/ai-familiar_tracker.md`. Village place key `oracle`, named "Your AI". |
| ME-8 | ME | Transition Quiz ("Where am I on the hero's path", brief calls it Тест «Где я на пути героя») | `/quiz`; `/quiz/r/:id`; `/hero` | 0.1, "specified, no code" | **shipped** (v3.3 said no code). Code: `src/modules/transition-quiz`; edge functions `save-quiz-result`, `get-quiz-result`, `claim-quiz-result`, `save-quiz-email`. `/hero` (a four-line quiz, `HeroQuiz`) is found in code, undocumented. |
| LN-1 | LEARN | Academy (LEARN landing, courses, activations) | `/game/learn`; `/grow/activate-your-dormant-potential`, `/grow/consciousness-meets-science`, `/grow/activation-of-inner-vision`; `/academy/:slug`; `/activations`, `/activations/:slug`, `/activations/:slug/access` | not rated | shipped, **not in v3.3**. A code comment (2026-10-30) says the landing shows two courses; three course routes exist. Not reconciled here. |
| LN-2 | LEARN | Library (Practices) | `/library`, `/library/:stepId`; `/game/learn/library`, `/game/learn/library/:stepId` (auth) | 0.7 | shipped. |
| LN-3 | LEARN | Growth Paths | `/game/learn/paths`, `/game/learn/path/:pathId`, `/game/path/:pathId`, `/skills`, `/growth-paths` (all auth) | 0.7 | shipped. `/skills` now opens Growth Paths, not Skill Trees. |
| LN-4 | LEARN | Daily Loop (My Next Move) | `/game/learn/today`, `/character`, `/next-move`, `/next-move-v2` (all auth) | 0.7 | **route replaced.** `/game/next-move`, `/game/next-move/*`, `/game/next-move-v2` and `/today` now redirect to `/game/journey`. The four routes listed here still render older pages. |
| LN-5 | LEARN | Playbook and Path | `/playbook`, `/playbook/:slug`; `/path` | not rated | shipped, **not in v3.3** (the game blueprint calls the `take-playbook` and `see-path` steps "tutorial lore"). `/path` is public by a code comment of 2026-04-21. |
| LN-6 | LEARN | Skill Trees | none | 0.3, retired in v3.3 | **no route (concept/retired?)**, retirement confirmed. `src/pages/SkillTrees.tsx` and `src/data/skillTrees.ts` still exist but nothing routes to them. |
| GM-1 | Game | Journey and Quest Board | `/game/journey`, `/journey`; `/game/journey/quest/:questId`; `/game/next`; `/game` → `/game/journey` | not rated | shipped, **not in v3.3**. `/game/next` renders nothing and sends a signed-in player to their next move. |
| GM-2 | Game | The Digital Village (map and places) | `/village/:place?`; `/map` → `/village`; `/map-classic` (auth) | not rated | shipped, **not in v3.3**. Eleven places, listed under Nesting. `/map-classic` is the older map page, found in code, undocumented. |
| GM-3 | Game | Title screen and home pages | `/`; `/home`; `/home2` | not rated | shipped. `/` is the title screen of the game (issue #127 comment in code). `/home` (`HomeV2Page`) and `/home2` (`HomeLandingPage`): found in code, undocumented. |
| MT-1 | MEET | Events (Café) | `/game/meet`; `/game/meet/create`, `/game/meet/my-rsvps` (auth); `/events/:id`, `/events/community/:communityId` (auth) | 0.9 | shipped. `/events`, `/game/events*` redirect to `/game/meet`. |
| MT-2 | MEET | Men's Circle | `/mens-circle`, `/mens-circle/thank-you` (both auth) | 1.0 | shipped. Both routes are behind login at this SHA; v3.3 did not say so. |
| MT-3 | MEET | Community Webinar (community-host offer) | `/communities` | 0.7 | shipped. **Description corrected:** v3.3 called it a learner's webinar sign-up; the page's code header says it is an offer to community leaders (host a free Zone of Genius workshop for their members, revenue share). |
| MT-4 | MEET | Mastermind (Fire Circle) | `/build/mastermind`; `/mastermind` → `/build/mastermind` | not rated | shipped, **not in v3.3**. Village place key `fire-circle`, named "Mastermind". |
| CB-1 | COLLABORATE | Matchmaking | `/game/collaborate/matches` (auth) | 0.7 | shipped. `/game/collaborate`, `/game/teams`, `/game/matches` redirect to it. |
| CB-2 | COLLABORATE | Connections and People | `/game/collaborate/connections`, `/game/collaborate/people`, `/game/collaborate/mission` (all auth) | 0.5 | shipped. `/connections`, `/game/mission`, `/community/people` redirect. |
| CB-3 | COLLABORATE | Intros (Sasha's shortlist) | `/intros` | not rated | **found in code, undocumented.** Public page: people Sasha is seeking introductions to (code header). |
| BD-1 | BUILD | Unique Business | `/game/me/genius-business`, `…/audience`, `…/promise`, `…/channels`, `…/vision` (me-gate) | 0.7 | shipped. Still routed under `/game/me`, as v3.3 said. |
| BD-2 | BUILD | Unique Business Builder (UBB) and Canvas | `/ubb` plus 14 child routes; `/game/build/canvas`, `/game/build/my-business`, `/game/build/refine` (auth); `/game/me/canvas` (me-gate); `/my-artifacts` (auth); public outputs `/dossier/:slug`, `/page/:slugWithVersion` | Canvas 0.5, "planned" | shipped, **not in v3.3 as UBB**. The v3.3 "Unique Business Canvas" route `/game/build/canvas` now exists. The game blueprint says UBB has 13 steps; the code has 14 child routes (8 artifacts, 4 compound steps, landing page, dossier). Not reconciled. `/ubd/:slug` and `/ubl/:slugWithVersion` redirect to the public outputs. |
| BD-3 | BUILD | Product Builder | `/game/build/product-builder` plus `icp`, `pain`, `promise`, `landing`, `blueprint`, `cta`, `published` (auth) | 0.7 | shipped. Seven steps confirmed. `/product-builder*` redirects here. |
| BD-4 | BUILD | Business Incubator | none (`/game/build` → `/ubb`) | 0.3 | **no route (concept/retired?)**. The old start route is now a redirect to UBB. |
| BD-5 | BUILD | Equilibrium (web, v2, with cycle journal) | `/build/equilibrium` (me-gate); `/equilibrium` → `/build/equilibrium`; `/preview/equilibrium-v2` | v2 1.0; v1 clock 0.9 | shipped. v3.3 listed v2 and the v1 clock as parallel rows; in this router `/equilibrium` forwards to v2. Whether the separate `equilibrium/` Vite app is still deployed: **not checked**. Cycle journal code: `src/modules/equilibrium` (`CycleJournalInput`, `PastCyclesSection`, `CyclePhaseStory`). `/mdls-preview` is in ST-6. |
| BD-6 | BUILD | Founder Cockpit | `/build/cockpit`; `/build/cockpit/dashboard` (auth); `/build/cockpit/offers` (admin) | 0.9 / 0.7 | shipped, matches v3.3. `/cockpit`, `/cockpit/dashboard`, `/game/cockpit` redirect. The offers-board data note under the v3.3 matrix still applies; not re-checked. |
| BD-7 | BUILD | Evolution Portal (brief: Client Evolution Portal) | `/products/evolution-portal`; `/products/evolution-portal/karime` | 0.7 / 0.5 | shipped. The Karime variant route is not behind login; v3.3 said "noindex", which was not re-checked. |
| BD-8 | BUILD | Build Container (brief: BUILT) | `/products/built` | 0.5 | shipped. `/products/build` redirects. |
| BD-9 | BUILD | The Crossing (brief: Entrepreneur's Evolution / The Crossing) | `/products/crossing` | not rated | shipped, **not in v3.3**. A sales page for the two-month transition program. |
| BD-10 | BUILD | The Vector | `/products/vector` | not rated | shipped, **not in v3.3**. A sales page. |
| BD-11 | BUILD | The Founder Read | `/products/founder-read` | not rated | shipped, **not in v3.3**. A page for an investor-facing instrument (code header). |
| BD-12 | BUILD | Product-Market Fit Core | `/products/pmf-core` | not rated | shipped, **not in v3.3**. A page that explains the one-session format. |
| BD-13 | BUILD | Ignite session (code: Productize Yourself Session; brief: Founder-Market Fit Private Session) | `/ignite`; `/game/marketplace/ignite` (auth) | not rated | shipped, **not in v3.3**. Three names for one page across code and brief; v4 does not pick one. |
| BD-14 | BUILD | FMF Session pages | `/fmf`, `/human-market-fit` (same page); `/founder-market-fit` (category page) | 0.5 | shipped. |
| BD-15 | BUILD | Products index | `/products` | not rated | shipped, **not in v3.3**. The public list of product pages. The brief says a public `/products/map` page will be built from brief §0; **no such route exists** at this SHA. |
| BD-16 | BUILD | Commercial OS | `/built-by-you/commercial-os` (me-gate) | not rated | **found in code, undocumented.** The page embeds another app in a frame and passes it the signed-in session token. |
| BD-17 | BUILD | Private client pages | `/sandra`, `/sergey`, `/oyi` (auth); `/build/karime`, `/build/karime/intake`, `/karima`, `/karime/bluelotus*` | not rated | **found in code, undocumented.** Pages made for named people; not platform modules. `/meet-karima`, `/meet-karime` redirect. |
| BD-18 | BUILD | White-label proposal for a community | `/proposalforwegoodovahere` | not rated | **found in code, undocumented as a module.** One proposal page; the brief lists it as the landing of "White-label онбординг". |
| BS-1 | BUY & SELL | Marketplace | `/game/marketplace`, `/game/marketplace/my-products` (auth); `/p/:slug`, `/mp/:slug`; `/marketplace/create-page`, `/my-page` (auth) | 0.5 | shipped. `/game/marketplace/browse` and `/marketplace*` are redirects (v3.3 gave browse as the start). Village place key `market`. |
| BS-2 | BUY & SELL | Founders Showcase | none of its own (`/game/marketplace/founders` → `/game/marketplace`) | 0.7 | **redirect only.** The showcase cards (`FoundersShowcase.tsx`) now render inside `MarketplaceSpace`. `/founders` and `/founders/:slug` are now the admin founders index (SY-3), not the public showcase v3.3 described. |
| BS-3 | BUY & SELL | The Originals (v1) | `/the-originals` (auth) | 0.5 | shipped. Behind login; v3.3 did not say so. |
| TH-1 | Game | Town Hall (v0) | `/game/coop` | not rated | shipped, **not in v3.3**. The game blueprint (2026-10-27) called this route "a wrong redirect"; at this SHA it renders its own page (`CoopSpace`, "Town Hall v0, J13"). |
| AI-1 | System | AI OS | `/ai-os`; `/ai-os/clarity`, `/ai-os/iteration`, `/ai-os/vibe-code`, `/ai-os/design`, `/ai-os/benchmark`, `/ai-os/work-with-us`; `/ai-upgrade` (auth) | not rated | shipped, **not in v3.3**. Twelve old paths (`/codex*`, `/prompt*`, `/ai-os/auth`, `/ai-os/pricing`, `/ai-os/profile`, `/ai-os/suites`) redirect into it. `/ai-upgrade` (a page of prompts users copy): found in code, undocumented. |
| SY-1 | System | Holomap | `/holomap` (auth) | 0.7 | shipped. **Corrected:** v3.3 gave `/holomap` as public and `/game/holomap` as the in-platform route; at this SHA `/holomap` needs login and `/game/holomap` has no route. |
| SY-2 | System | Dashboard | `/dashboard` | 0.5 | shipped. Public in the router. |
| SY-3 | System | Admin and operations | `/admin`; `/admin/genius-offers`, `/admin/mission-participants`, `/admin/mission-sync`, `/admin/content`, `/admin/return-report`, `/genius-admin` (auth); `/founders`, `/founders/:slug`; `/modules`, `/modules/:slug` (admin); `/game/test-nav` (auth) | not rated | **found in code, undocumented.** `/modules` is the platform's own module list page (admin only). Access on `/admin`, `/founders*` is enforced inside the pages (`AdminGate`), not by the router. |
| SY-4 | System | Onboarding and Tour | `/start` (auth) | 0.7 / 0.5 | Onboarding shipped. **Tour: no route (concept/retired?)**; v3.3 said "within onboarding" and v4 did not find a route for it. |
| SY-5 | System | Account, sign-in and settings | `/auth`, `/auth/callback`, `/auth/reset-password`, `/.lovable/oauth/consent`; `/game/settings`; `/contact`, `/feedback` (auth); `/tools` (auth, redirect) | not rated | shipped, frame. `/settings`, `/profile`, `/game/me/settings` redirect to `/game/settings` or `/game/me`. `/feedback` is a testimonial collection page (code header). |
| SY-6 | System | Public profiles and founder pages | `/:username` (last route, takes any single root path); `/profile/:userId`; `/sasha`, `/founder`, `/about/meet-the-founder` | not rated | shipped, frame. `/u/:username` redirects to `/:username`; `/aleksandr`, `/alexander`, `/integralevolution` redirect to `/sasha`. A root slug that matches no username shows the 404. |
| ST-1 | Standalone | Equilibrium Bot (Telegram) | none in `src/App.tsx` | 0.9 | **no route** (it is a bot). Code present: `api/equilibrium-bot.ts`, `api/equilibrium-cron.ts`, edge functions `equilibrium-telegram`, `equilibrium-telegram-bot`, `equilibrium-cron`. Whether it runs today: **not checked**. |
| ST-2 | Standalone | Art | `/art` (auth), `/art/:category` (auth); `/game/me/art` (me-gate) | 0.5 | shipped. **Corrected:** v3.3 said `/art/*` is publicly reachable; at this SHA both `/art` and `/art/:category` sit inside a `RequireAuth` layout route. |
| ST-3 | Standalone | Transcriber | `/transcriber` (auth) | 0.5 | shipped. |
| ST-4 | Standalone | Destiny | `/destiny` | 0.5 | shipped, public (matches v3.3). |
| ST-5 | Standalone | Clock | none | 0.1 | **no route (concept/retired?)**, unchanged. |
| ST-6 | Standalone | Public essays and thesis pages | `/1-pager`, `/landing`, `/monetization`, `/sohn`, `/web3`, `/you`, `/27`, `/license`, `/investor`, `/mdls-preview`, `/preview/testimonials` | not rated | **found in code, undocumented as modules.** Standalone public pages, not product modules. `/integral_theory_upgrade1` redirects to `/27`. |
| TL-1 | Trust/Legal | Trust and Legal pages | `/data`, `/privacy`, `/terms` | 0.9 | shipped, matches v3.3. |
| FR-1 | Frame | Skin preview and 404 | `/preview`; `*` | not rated | frame. `*` is the not-found page. |
| UD-1 | — | Found in code, undocumented | `/intelligences`, `/genius-layer-matching`, `/m/:slug` (all auth) | not rated | **found in code, undocumented.** `MultipleIntelligences`, `GeniusLayerMatching`, `ModuleDetail`. v4 did not read them far enough to place them; they stay here until Sasha or Hark says where they belong. |

### Seeds (specified or roadmapped, no code)

| Seed | v4 check | Status |
|---|---|---|
| Quiz | **Promoted out of the seed list:** shipped, see ME-8. The spec files in `docs/specs/quiz/` are still the spec. | shipped |
| Originals Index v2 | Only `/the-originals` (v1) is routed; no per-venture pages. | still a roadmap seed, no code |
| Reflection Proposal automation | A search of `src/` for "reflection proposal" found nothing. | still a roadmap seed, no code |

### Route coverage ledger (294 paths → 59 rows)

Rows without a route (LN-6, ST-1, ST-5) are not in the ledger; 59 + 3 = 62 matrix rows. `↪` marks a redirect and shows its target. Access is shown only when it is not public.

| ID | Paths | Of which redirects | Routes |
|---|---|---|---|
| AI-1 | 20 | 12 | `/ai-os`; `/ai-os/auth` ↪ `/ai-os`; `/ai-os/work-with-us`; `/ai-os/pricing` ↪ `/ai-os/work-with-us`; `/ai-os/profile` ↪ `/ai-os`; `/ai-os/benchmark`; `/ai-os/clarity`; `/ai-os/iteration`; `/ai-os/vibe-code`; `/ai-os/design`; `/ai-os/suites` ↪ `/ai-os`; `/codex` ↪ `/ai-os`; `/codex/auth` ↪ `/ai-os`; `/codex/pricing` ↪ `/ai-os/work-with-us`; `/codex/profile` ↪ `/ai-os`; `/prompt` ↪ `/ai-os`; `/prompt/auth` ↪ `/ai-os`; `/prompt/pricing` ↪ `/ai-os/work-with-us`; `/prompt/profile` ↪ `/ai-os`; `/ai-upgrade` (auth) |
| BD-1 | 5 | 0 | `/game/me/genius-business` (me-gate); `/game/me/genius-business/audience` (me-gate); `/game/me/genius-business/promise` (me-gate); `/game/me/genius-business/channels` (me-gate); `/game/me/genius-business/vision` (me-gate) |
| BD-10 | 1 | 0 | `/products/vector` |
| BD-11 | 1 | 0 | `/products/founder-read` |
| BD-12 | 1 | 0 | `/products/pmf-core` |
| BD-13 | 2 | 0 | `/ignite`; `/game/marketplace/ignite` (auth) |
| BD-14 | 3 | 0 | `/founder-market-fit`; `/human-market-fit`; `/fmf` |
| BD-15 | 1 | 0 | `/products` |
| BD-16 | 1 | 0 | `/built-by-you/commercial-os` (me-gate) |
| BD-17 | 10 | 4 | `/sandra` (auth); `/sergey` (auth); `/oyi` (auth); `/build/karime`; `/build/karime/intake`; `/karima`; `/meet-karima` ↪ `/karima${location.search}${location.hash}`; `/meet-karime` ↪ `/karima${location.search}${location.hash}`; `/karime/bluelotus` ↪ `external static page`; `/karime/bluelotus/*` ↪ `external static page` |
| BD-18 | 1 | 0 | `/proposalforwegoodovahere` |
| BD-2 | 24 | 2 | `/dossier/:slug`; `/page/:slugWithVersion`; `/ubd/:slug` ↪ `/dossier/:slug`; `/ubl/:slugWithVersion` ↪ `/page/:slug`; `/game/me/canvas` (me-gate); `/my-artifacts` (auth); `/game/build/canvas` (auth); `/game/build/my-business` (auth); `/game/build/refine` (auth); `/ubb` (me-gate); `/ubb/uniqueness` (me-gate); `/ubb/myth` (me-gate); `/ubb/tribe` (me-gate); `/ubb/pain` (me-gate); `/ubb/promise` (me-gate); `/ubb/lead-magnet` (me-gate); `/ubb/value-ladder` (me-gate); `/ubb/specificity-matrix` (me-gate); `/ubb/session` (me-gate); `/ubb/marketing` (me-gate); `/ubb/distribution` (me-gate); `/ubb/communications` (me-gate); `/ubb/landing-page` (me-gate); `/ubb/dossier` (me-gate) |
| BD-3 | 10 | 2 | `/game/build/product-builder` (auth); `/game/build/product-builder/icp` (auth); `/game/build/product-builder/pain` (auth); `/game/build/product-builder/promise` (auth); `/game/build/product-builder/landing` (auth); `/game/build/product-builder/blueprint` (auth); `/game/build/product-builder/cta` (auth); `/game/build/product-builder/published` (auth); `/product-builder` ↪ `/game/build/product-builder`; `/product-builder/*` ↪ `/game/build/product-builder` |
| BD-4 | 1 | 1 | `/game/build` ↪ `/ubb` |
| BD-5 | 3 | 1 | `/equilibrium` ↪ `/build/equilibrium`; `/build/equilibrium` (me-gate); `/preview/equilibrium-v2` |
| BD-6 | 6 | 3 | `/build/cockpit`; `/build/cockpit/dashboard` (auth); `/build/cockpit/offers` (admin); `/cockpit` ↪ `/build/cockpit`; `/cockpit/dashboard` ↪ `/build/cockpit/dashboard`; `/game/cockpit` ↪ `/build/cockpit/dashboard` |
| BD-7 | 4 | 2 | `/products/evolution-portal`; `/products/evolution-portal/karime`; `/products/evolution-protocol` ↪ `/products/evolution-portal`; `/product/evolution-portal` ↪ `/products/evolution-portal` |
| BD-8 | 2 | 1 | `/products/built`; `/products/build` ↪ `/products/built` |
| BD-9 | 1 | 0 | `/products/crossing` |
| BS-1 | 9 | 3 | `/p/:slug`; `/mp/:slug`; `/marketplace` ↪ `/game/marketplace`; `/marketplace/browse` ↪ `/game/marketplace/browse`; `/marketplace/create-page` (auth); `/game/marketplace` (auth); `/game/marketplace/my-products` (auth); `/game/marketplace/browse` ↪ `/game/marketplace`; `/my-page` (auth) |
| BS-2 | 1 | 1 | `/game/marketplace/founders` ↪ `/game/marketplace` |
| BS-3 | 1 | 0 | `/the-originals` (auth) |
| CB-1 | 4 | 3 | `/game/collaborate` ↪ `/game/collaborate/matches`; `/game/collaborate/matches` (auth); `/game/teams` ↪ `/game/collaborate`; `/game/matches` ↪ `/game/collaborate/matches` |
| CB-2 | 6 | 3 | `/game/collaborate/connections` (auth); `/game/collaborate/mission` (auth); `/game/collaborate/people` (auth); `/connections` ↪ `/game/collaborate/connections`; `/game/mission` ↪ `/game/collaborate/mission`; `/community/people` ↪ `/game/collaborate/people` |
| CB-3 | 1 | 0 | `/intros` |
| FR-1 | 2 | 0 | `/preview`; `*` |
| GM-1 | 10 | 6 | `/journey`; `/game` ↪ `/game/journey`; `/game/next`; `/game/next-move` ↪ `/game/journey`; `/game/next-move/*` ↪ `/game/journey`; `/game/next-move-v2` ↪ `/game/journey`; `/game/journey`; `/game/journey/start` ↪ `/zone-of-genius/entry`; `/game/journey/quest/:questId`; `/today` ↪ `/game/journey` |
| GM-2 | 3 | 1 | `/map` ↪ `/village`; `/map-classic` (auth); `/village/:place?` |
| GM-3 | 3 | 0 | `/`; `/home`; `/home2` |
| LN-1 | 11 | 3 | `/activations`; `/activations/:slug`; `/activations/:slug/access`; `/grow` ↪ `/game/learn`; `/grow/activate-your-dormant-potential`; `/grow/consciousness-meets-science`; `/grow/activation-of-inner-vision`; `/academy/:slug`; `/game/learn`; `/game/transformation` ↪ `/game/learn`; `/game/transformation/*` ↪ `/game/learn` |
| LN-2 | 4 | 0 | `/library`; `/library/:stepId`; `/game/learn/library` (auth); `/game/learn/library/:stepId` (auth) |
| LN-3 | 5 | 0 | `/game/learn/paths` (auth); `/game/learn/path/:pathId` (auth); `/game/path/:pathId` (auth); `/skills` (auth); `/growth-paths` (auth) |
| LN-4 | 4 | 0 | `/game/learn/today` (auth); `/character` (auth); `/next-move` (auth); `/next-move-v2` (auth) |
| LN-5 | 4 | 1 | `/playbook`; `/playbook/discover` ↪ `/playbook`; `/playbook/:slug`; `/path` |
| ME-1 | 26 | 6 | `/zone-of-genius` ↪ `/zone-of-genius/entry`; `/reveal` ↪ `/`; `/reveal/:slug` ↪ `/`; `/my-result`; `/activate-top-talent`; `/activate/welcome` ↪ `/game/me/zone-of-genius/start-here`; `/activate` ↪ `/game/me/zone-of-genius/start-here`; `/genius-offer` ↪ `/zone-of-genius/entry`; `/quiz2`; `/genius-offer-intake` (auth); `/game/me/zone-of-genius` (me-gate); `/game/me/zone-of-genius/:perspectiveId` (me-gate); `/game/learn/genius-assessment` (auth); `/game/learn/genius-assessment/step-1` (auth); `/game/learn/genius-assessment/step-2` (auth); `/game/learn/genius-assessment/step-3` (auth); `/game/learn/genius-assessment/step-4` (auth); `/resources/zog-intro-video` (auth); `/zone-of-genius/appleseed` (auth); `/zone-of-genius/excalibur` (auth); `/zone-of-genius/entry`; `/zone-of-genius/assessment`; `/zone-of-genius/assessment/step-1`; `/zone-of-genius/assessment/step-2`; `/zone-of-genius/assessment/step-3`; `/zone-of-genius/assessment/step-4` |
| ME-2 | 6 | 0 | `/game/learn/qol-assessment` (auth); `/game/learn/qol-results` (auth); `/quality-of-life-map`; `/quality-of-life-map/assessment`; `/quality-of-life-map/results`; `/game/me/quality-of-life` (auth) |
| ME-3 | 6 | 1 | `/zone-of-genius/mission`; `/mission`; `/discover-mission`; `/game/me/mission` (me-gate); `/mission-discovery` (auth); `/mission-discovery/wizard` ↪ `/mission-discovery` |
| ME-4 | 3 | 0 | `/game/me/assets` (me-gate); `/asset-mapping` (auth); `/asset-mapping/wizard` (auth) |
| ME-5 | 8 | 5 | `/game/me` ↪ `/game/me/zone-of-genius`; `/game/me/overview` (me-gate); `/game/me/profile` (me-gate); `/game/profile` ↪ `/game/me`; `/game/profile/*` ↪ `/game/me`; `/game/grow` ↪ `/game/me`; `/game/grow/*` ↪ `/game/me`; `/game/snapshot` (auth) |
| ME-6 | 2 | 0 | `/game/learn/tests` (auth); `/resources/personality-tests` (auth) |
| ME-7 | 1 | 0 | `/game/your-ai` |
| ME-8 | 3 | 0 | `/hero`; `/quiz`; `/quiz/r/:id` |
| MT-1 | 8 | 3 | `/game/meet`; `/game/meet/create` (auth); `/game/meet/my-rsvps` (auth); `/game/events` ↪ `/game/meet`; `/game/events/*` ↪ `/game/meet`; `/events` ↪ `/game/meet`; `/events/:id` (auth); `/events/community/:communityId` (auth) |
| MT-2 | 2 | 0 | `/mens-circle` (auth); `/mens-circle/thank-you` (auth) |
| MT-3 | 1 | 0 | `/communities` |
| MT-4 | 2 | 1 | `/build/mastermind`; `/mastermind` ↪ `/build/mastermind` |
| ST-2 | 3 | 0 | `/game/me/art` (me-gate); `/art` (auth); `/art/:category` (auth) |
| ST-3 | 1 | 0 | `/transcriber` (auth) |
| ST-4 | 1 | 0 | `/destiny` |
| ST-6 | 12 | 1 | `/investor`; `/preview/testimonials`; `/27`; `/integral_theory_upgrade1` ↪ `/27`; `/license`; `/mdls-preview`; `/1-pager`; `/landing`; `/you`; `/web3`; `/monetization`; `/sohn` |
| SY-1 | 1 | 0 | `/holomap` (auth) |
| SY-2 | 1 | 0 | `/dashboard` |
| SY-3 | 14 | 2 | `/admin/genius-offers` (auth); `/genius-admin` (auth); `/admin/mission-participants` (auth); `/admin/mission-sync` (auth); `/admin/content` (auth); `/admin/return-report` (auth); `/admin`; `/admin/dashboard` ↪ `/admin`; `/admin/grants` ↪ `/admin`; `/founders`; `/founders/:slug`; `/game/test-nav` (auth); `/modules` (admin); `/modules/:slug` (admin) |
| SY-4 | 1 | 0 | `/start` (auth) |
| SY-5 | 11 | 4 | `/auth`; `/auth/callback`; `/auth/reset-password`; `/.lovable/oauth/consent`; `/contact` (auth); `/feedback` (auth); `/tools` ↪ `ToolsRedirect`; `/profile` ↪ `/game/me`; `/settings` ↪ `/game/settings?tab=profile`; `/game/settings`; `/game/me/settings` ↪ `/game/settings?tab=profile` |
| SY-6 | 9 | 4 | `/profile/:userId`; `/u/:username` ↪ `/:username`; `/founder`; `/about/meet-the-founder`; `/sasha`; `/aleksandr` ↪ `/sasha`; `/alexander` ↪ `/sasha`; `/integralevolution` ↪ `/sasha`; `/:username` |
| TH-1 | 1 | 0 | `/game/coop` |
| TL-1 | 3 | 0 | `/data`; `/privacy`; `/terms` |
| UD-1 | 3 | 0 | `/intelligences` (auth); `/genius-layer-matching` (auth); `/m/:slug` (auth) |

**Check:** the *Paths* column sums to 294. Frame and legal routes are inside this count: sign-in and settings (SY-5), public profiles (SY-6), skin preview and 404 (FR-1), Trust and Legal (TL-1). The 6 index routes and the layout route have no path and are not counted as paths.

### What v3.3 said that was wrong at this SHA

1. `/zone-of-genius` is a redirect; the door is `/zone-of-genius/entry` (ME-1).
2. Daily Loop `/game/next-move` redirects to `/game/journey` (LN-4).
3. `/quality-of-life` does not exist; the route is `/quality-of-life-map` (ME-2).
4. Marketplace start `/game/marketplace/browse` is a redirect to `/game/marketplace` (BS-1).
5. Founders Showcase: `/game/marketplace/founders` redirects, and `/founders` is the admin founders index (BS-2, SY-3).
6. Business Incubator route `/game/build` is a redirect to `/ubb` (BD-4).
7. Unique Business Canvas `/game/build/canvas`, marked "planned", exists (BD-2).
8. `/holomap` needs login; `/game/holomap` has no route (SY-1).
9. `/art` needs login (ST-2); `/mens-circle` and `/the-originals` also need login (MT-2, BS-3).
10. `/equilibrium` forwards to `/build/equilibrium` (BD-5).
11. Quiz is shipped, not "no code" (ME-8).
12. Community Webinar is an offer to community hosts (MT-3).
13. The Version Statistics table (28 modules, 186 items) is stale; v4 counts rows instead: 62 rows, 294 paths.

---

## 🌳 NESTING — module → submodules

> **New in v4.** One line per node: what it does, in one plain sentence. IDs point to the v4 matrix. Where a sentence comes from a file name or a template rather than a screen I read, the node says *(from names)*. v3.1 submodule lists that v4 did not re-verify are named at the end of each branch, not repeated.

### How the whole nests (four levels)

```
Platform
 ├─ Frame            title screen, village map, sign-in, settings, legal   (not modules)
 ├─ Top-level modules   one per matrix row below, grouped by Space
 │    └─ Submodules      screens, steps and tools inside one module
 │         └─ Journey steps J1…J13 cut across modules: each step is one module (or one slice of one) in the module form
 └─ Products         built from modules, or services with no module  → see "Products × modules"
```

The **Village** places are not extra modules. Each place points at an existing module (`src/data/villagePlaces.ts`: "nothing here is a new module"), and the **Journey** is an ordered path through them.

### ME — know yourself

- **Unique Gift** (ME-1): finds the one thing you do best and says it in words that fit only you.
  - **Entry** (`/zone-of-genius/entry`): the one public door into the test; old Top Talent URLs forward here.
  - **ZoG assessment** (`/zone-of-genius/assessment`): four steps, pick ten talents, narrow to three, put them in order, generate the snapshot *(from names)*.
  - **Appleseed**: the reveal, your top talent named in words.
  - **Excalibur**: one sharp offer written from your Appleseed.
  - **Perspectives** (`/game/me/zone-of-genius/:perspectiveId`): one saved-profile view per perspective, behind the deeper-access check. The list of perspectives was not re-read.
  - **Top Talent Activation** (`/activate-top-talent`): the paid page that follows the reveal; buyers land on `/game/me/zone-of-genius/start-here` after paying (comment in `MeGate`).
  - **Genius quiz** (`/quiz2`): a quiz version of the test; found in code, undocumented.
  - **Art** (`/game/me/art`): a visual made from your profile. The issue lists it under Unique Gift; its link to standalone Art (ST-2) is **not confirmed in code**.
  - *v3.1 submodules not re-verified:* Bullseye Sentence, Vibrational Key, Three Lenses, Appreciated For, Mastery Stages, Professional Activities, Roles and Environments, Complementary Partner, Monetization, Life Scene, Visual Codes, Elevator Pitch.
- **Quality of Life** (ME-2): shows your real level and the one life domain that sets it.
  - **Assessment** (`/quality-of-life-map/assessment`): you rate each domain of your life.
  - **Results** (`/quality-of-life-map/results`): your level, private to you, and the weakest domain.
  - **Priorities and Growth recipe**: page files exist (`QualityOfLifePriorities.tsx`, `QualityOfLifeGrowthRecipe.tsx`) but no route points at them at this SHA.
- **Mission Discovery** (ME-3): helps you find what is yours to do in the world and commit to it.
  - **Mission match and commit** (`/mission-discovery`): suggests missions from a database and saves the one you commit to *(v3.1: "800+ Mission Database", AI matching; not re-verified)*.
  - **Closed door** (`/mission`, `/discover-mission`): shows why the module is closed until your top talent is saved.
- **Resource Mapping** (ME-4): lists what you already hold (skills, relationships, experience) as an inventory.
  - **Landing and Wizard** (`/asset-mapping`, `/asset-mapping/wizard`): the entry screen, then the guided entry of assets.
- **Character Sheet / Your House** (ME-5): gathers your saved results in one place.
  - **Overview** (`/game/me/overview`) and **Profile home** (`/game/me/profile`): the sheet and its rooms.
  - **Snapshot** (`/game/snapshot`): a compact view of your character.
- **Personality Tests** (ME-6): brings results from outside tests into your profile *(v3.1: MBTI, Enneagram, Human Design, Astrology imports; not re-verified)*.
- **Your AI** (ME-7): a chat with an AI that already knows your top talent, and that can only suggest moves from a fixed list of real places and practices.
  - **Four screens** (`src/modules/familiar/screens`): intro, ask, reveal, outro.
  - **Button catalog** (`src/data/yourAiCatalog.ts`): the fixed list of moves the AI may offer; an entry is added only after its route exists.
  - **Reveal from conversation**: runs the top talent reveal from what you have said so far.
- **Transition Quiz** (ME-8): places you on the hero's path in about three questions.
  - **Quiz** (`/quiz`): the questions and the score engine (`src/modules/transition-quiz/engine.ts`).
  - **Result** (`/quiz/r/:id`): the saved result page, opened by its id.
  - **Save my read**: keeps the result against an email (`SaveMyRead`, edge function `save-quiz-email`).
  - **Hero quiz** (`/hero`): a four-line quiz version; found in code, undocumented.

### LEARN — practices and paths

- **Academy** (LN-1): the LEARN landing; shows the courses and where to start.
  - **Course pages** (`/grow/activate-your-dormant-potential`, `/grow/consciousness-meets-science`, `/grow/activation-of-inner-vision`): one page per course.
  - **Course sales** (`/academy/:slug`): the sales page for a course by its slug.
  - **Activations** (`/activations`, `/activations/:slug`, `/activations/:slug/access`): an index, then a landing page and an access page for each. What an "activation" is as a product is not defined in this file.
- **Library** (LN-2): practices you can do, with guided audio *(v3.1: 28 items; not re-verified)*.
- **Growth Paths** (LN-3): five paths (Genius, Spirit, Mind, Emotions, Body), each a list of upgrades you take in order *(v3.1 counts; not re-verified)*.
- **Daily Loop** (LN-4): older "what to do today" pages, replaced on the main routes by the Journey.
  - **Today** (`/game/learn/today`, `/character`): up to three actions for the day (code header of `Today`).
  - **Next-move hubs** (`/next-move`, `/next-move-v2`): the older recommendation screens.
- **Playbook and Path** (LN-5): the method written out for anyone to read.
  - **Playbook** (`/playbook`, `/playbook/:slug`): the full methodology, step by step.
  - **Path** (`/path`): the whole seven-step path on one page, price ladder included, public.

### GAME — the frame that runs the modules

- **Journey and Quest Board** (GM-1): shows your one next move and keeps the record of what you have done.
  - **Journey page** (`/game/journey`, `/journey`): the path and the next step.
  - **Quest pages** (`/game/journey/quest/:questId`): one page per real-world quest; ids in `src/data/journeyModules.ts` are `webinar`, `mastermind`, `mastery-practice`, `first-price`, `first-sale`.
  - **Next step** (`/game/next`): sends you to your next move after sign-in.
  - **J1…J13**: the thirteen Journey steps, below.
- **The Digital Village** (GM-2): the main game screen, a map where each place opens or stays closed by what you have saved.
  - **Eleven places** (`VILLAGE_PLACES`; each is a pointer, not a module): Entry Portal → ME-1 · Home → ME-5 · Quest Board → GM-1 · Your AI → ME-7 · Café → MT-1 · Co-working → CB-1 · Mastermind → MT-4 · Academy → LN-1 · Workshop → BD-2 · Market → BS-1 · Town Hall → TH-1.
  - **Place state rules** (`src/lib/placeState.ts`, rules in `villagePlaces.ts`): each place is closed, open, next, done or live, read from real saved events. Open to everyone: Entry Portal, Your AI, Café, Mastermind, Academy. Home and Quest Board open when your top talent is saved; Workshop when your mission is saved; Co-working when talent, mission and assets are saved; Market when an offer is saved; Town Hall when your first sale is recorded. (Blueprint §14.3 says Café opens with the mission; the code leaves it open to guests, so the code is followed here.)
- **Title screen** (GM-3): the front door of the game.

**The Journey, J1…J13** (numbers from `game_of_being_you.md` §14.2 and §17; "where" is the matrix row):

| J | Step | Where | What it does |
|---|---|---|---|
| J1 | Zone of Genius (`find-top-talent`) | ME-1 | Names your top talent in one sentence and saves it to your account. |
| J2 | Mission Discovery (`discover-mission`) | ME-3 | Helps you see what is yours to do and commit to it in your own words. |
| J3 | Spectrum Reading (soul colours) | none | Not built: the blueprint marks it so and there is no route; the Home room stays faded. |
| J4 | QoL Map (`assess-qol`) | ME-2 | Shows your real level, private to you, and the domain that sets it. |
| J5 | Asset Mapping (`map-assets`) | ME-4 | Lays out what you already hold as an inventory. |
| J6 | UBB uniqueness slice (`uniqueness-phrase`) | BD-2 (`/ubb/uniqueness`) | Turns your uniqueness into one phrase you can use to introduce yourself. |
| J7 | UBB tagline slice (`tagline`) | BD-2, then BS-1 | Writes the tagline of your unique business, which opens your stall in the Market. |
| J8 | Webinar (`webinar`) | GM-1 quest | Records that you came to the webinar, live or recorded. Webinar content waits for Sasha's plan (blueprint §17). |
| J9 | Mastermind (`mastermind`) | MT-4, GM-1 quest | A two-session circle followed by a week to take one real step and report it. |
| J10 | 21-day mastery practice (`mastery-practice`) | GM-1 quest | Records 21 check-ins. The practice itself is not written down in the repo (blueprint §17). |
| J11 | First price (`first-price`) | GM-1 quest | You say your price to one real client and report it. |
| J12 | First sale (`first-sale`); also Market and your stall | GM-1 quest, BS-1 | You report your first payment for your own offer; that opens Town Hall. The stall is your published offer at `/p/:slug`. |
| J13 | Town Hall | TH-1 (`/game/coop`) | v0 page for residents' income and your voice (blueprint §14.5); the page exists at this SHA. |
| opt | Oracle Reading (deeper top-talent view, `deeper-access`) | ME-1 | Not a numbered step: the deeper reading behind the deeper-access check. |

### COLLABORATE and MEET — other people

- **Events** (MT-1): lists events and lets people create and join them.
  - **Events home** (`/game/meet`): the list of upcoming events; open to guests, the personal parts need sign-in.
  - **Create** (`/game/meet/create`) and **My RSVPs** (`/game/meet/my-rsvps`): make an event, see the ones you joined.
  - **Event detail** (`/events/:id`) and **Community events** (`/events/community/:communityId`): one event, and the events of one community.
- **Men's Circle** (MT-2): a registration page for a men's circle, with payment *(v3.1: landing, Stripe payment, registration flow)*.
- **Community Webinar** (MT-3): an offer page asking community leaders to host a workshop for their members.
- **Mastermind** (MT-4): the sales page for the live Founder-Market Fit Discovery Mastermind.
- **Matchmaking** (CB-1): finds people who match you and sends an introduction.
  - **Matches** (`/game/collaborate/matches`): your matches *(v3.1 kinds: genius match, complementary, resource, mission; not re-verified)*.
- **Connections and People** (CB-2): shows who you are connected to and who else is on the platform.
  - **Connections**, **People directory**, **Mission selection** (`/game/collaborate/connections|people|mission`): the three sub-pages.
- **Intros** (CB-3): a public list of people Sasha wants to be introduced to.

### BUILD — make something people can buy

- **Unique Business** (BD-1): describes the business that grows from your gift.
  - **Audience** (ICP), **Promise**, **Channels**, **Vision** (`/game/me/genius-business/…`): who it is for, what changes for them, where you reach them, where it is going *(from names)*.
- **Unique Business Builder (UBB) and Canvas** (BD-2): builds a founder's whole business, one artifact at a time, and publishes it.
  - **Canvas overview** (`/ubb`): the index of all steps.
  - **Eight artifacts** (`/ubb/uniqueness|myth|tribe|pain|promise|lead-magnet|value-ladder|specificity-matrix`): uniqueness, the founder's story, who it is for, what hurts for them, the before-and-after promise, a free first offer, the ladder of offers, a score of how specific each artifact is *(from names and `unique-business-canvas.md`; screens not re-read)*.
  - **Four compound steps** (`/ubb/session|marketing|distribution|communications`): the session script, how the offer is expressed, how it reaches buyers, the texts the business speaks through *(from names)*.
  - **Landing page** (`/ubb/landing-page`) and **Dossier** (`/ubb/dossier`): turn the artifacts into a page and a dossier.
  - **Public outputs** (`/dossier/:slug`, `/page/:slugWithVersion`): the published dossier and landing page anyone can open.
  - **Canvas pages** (`/game/build/canvas`, `/game/build/my-business`, `/game/build/refine`, `/game/me/canvas`) and **My artifacts** (`/my-artifacts`): the older canvas screens and the list of saved artifacts, read from `user_business_artifacts`.
- **Product Builder** (BD-3): takes an idea to a published product in seven steps.
  - **icp, pain, promise, landing, blueprint, cta, published** (`/game/build/product-builder/…`): who it is for, what hurts, the promise, the page, the product outline, the call to action, the live result *(from names)*.
- **Equilibrium** (BD-5): plans your work by natural cycles instead of the clock.
  - **Cycle plan** (`phasePlan.ts`, `cycleSegments.ts`): the day, week, month and quarter as nested cycles *(from names)*.
  - **Cycle journal** (`CycleJournalInput`, `PastCyclesSection`, `CyclePhaseStory`): you write what happened in each cycle, and read past cycles.
  - **PDF export** (`generateEquilibriumPdf.ts`): a printable version of your plan.
  - **Telegram bot** (ST-1): daily energy readings by message, outside the web app.
- **Founder Cockpit** (BD-6): shows the founder and the business as one operating screen.
  - **Landing**, **Dashboard** (auth), **Offers board** (admin): the entry, the four-button console, the offers list.
- **Evolution Portal** (BD-7): a client-facing page where a practitioner's clients can see how they move.
  - **Base page** and **Karime variant** (`/products/evolution-portal`, `…/karime`): the general offer, and a version written for one person.
- **Build Container / BUILT** (BD-8): the page for the three-week program that packages an offer and finds first clients.
- **Product pages** (BD-9 The Crossing, BD-10 The Vector, BD-11 The Founder Read, BD-12 PMF Core): one sales or explainer page per product; the work itself is done in sessions, not in the platform.
- **Ignite session** (BD-13): the purchase page for the two-hour one-to-one session.
- **FMF pages** (BD-14): the landing and booking pages for the founder-market-fit session (v3.3: landing, booking flow, session method).
- **Products index** (BD-15): the public list of product pages.
- **Commercial OS** (BD-16): opens another app inside the platform and hands it your sign-in.
- **Private client pages** (BD-17) and **White-label proposal** (BD-18): pages made for specific people or communities; not reusable modules.
- **Business Incubator** (BD-4): no route (concept/retired?).

### BUY & SELL and Town Hall

- **Marketplace** (BS-1): lets people list offers and lets visitors find them.
  - **Market home** (`/game/marketplace`, auth): browse offers; the Founders Showcase cards render here (BS-2).
  - **My products** (`/game/marketplace/my-products`): the offers you have listed.
  - **Creator page** (`/p/:slug`) and **Product page** (`/mp/:slug`): your public stall and one offer's page.
  - **Page editor** (`/my-page`, `/marketplace/create-page`): edit your public page.
- **Founders Showcase** (BS-2): shows founders' canvases as cards; now inside the Marketplace, no route of its own.
- **The Originals v1** (BS-3): a hardcoded list of three founders.
- **Town Hall** (TH-1): v0 page for the collective: residents' income and your voice.

### System, standalone, trust

- **AI OS** (AI-1): sells and explains a set of AI working systems (clarity, iteration, vibe-code, design) with a benchmark and a work-with-us page *(from route names and file layout; pages not read in full)*.
- **Holomap** (SY-1): shows the whole system as a map of perspectives and stages (`MorphogeneticHolomap`).
- **Dashboard** (SY-2): shows how the venture is building, for the person and for the whole.
- **Admin and operations** (SY-3): tools for the team, including the module list (`/modules`).
- **Onboarding** (SY-4): the first-run flow after sign-in. **Tour**: no route (concept/retired?).
- **Account, sign-in and settings** (SY-5) and **Public profiles** (SY-6): frame pages, no submodules.
- **Art** (ST-2): a gallery of art by category (`/art`, `/art/:category`).
- **Transcriber** (ST-3): turns a video into a text transcript (v3.3 master result).
- **Destiny** (ST-4): a public page; its purpose is "TBD" in v3.3 and v4 did not settle it.
- **Equilibrium Bot** (ST-1): see Equilibrium. **Clock** (ST-5): no route.
- **Public essays and thesis pages** (ST-6): standalone pages that state the thesis, the monetization model and the founder's note; no submodules.
- **Trust and Legal** (TL-1): a plain-language data promise, privacy policy and terms.

---

## 🧩 PRODUCTS × MODULES

> **Superseded by the Crosswalk below (brief v1, 2026-11-17); kept for history.** This table was built on brief §0 v0.
>
> **New in v4.** One row per product in `docs/04-products/product_brief.md` §0 (§0.1 has 12 rows, §0.2 has 9, §0.3 has 3: **24 rows**). Module IDs are from the v4 matrix. "Service, no platform module" means the product is delivered by a person, a call or an outside tool, and the platform has no module that carries it. Brief §0 is a v0 draft by Hark (2026-11-17); where the brief and this table disagree, the brief wins on product facts and this file wins on module facts. Prices are in the brief, not here.

| Brief § | Product (as in the brief) | Built from (platform modules) | Notes |
|---|---|---|---|
| 0.1 · 0 | Тест «Где я на пути героя» | ME-8 Transition Quiz | Landing `/quiz`. |
| 0.1 · 0 | Direction Call | Service, no platform module | A 45-minute call booked through an outside calendar link (brief). |
| 0.1 · 1 | Зона Гениальности | ME-1 Unique Gift | The free reveal and the assessment run in the platform. The paid online form maps to `/activate-top-talent` (a code header calls it the Top Talent Activation product; matching it to this brief row is **my inference**). The 1:1 and team workshop forms are services. The brief's landing is an outside page. |
| 0.1 · 2 | Founder-Market Fit (Private Session / Mastermind) | BD-13 Ignite session, MT-4 Mastermind, BD-14 FMF pages | The sessions themselves are live, not in the platform; the platform carries the pages that sell and schedule them. Code names the session "Productize Yourself Session". |
| 0.1 · 2b | Product-Market Fit Core | BD-12 PMF Core | One session; the page explains it. |
| 0.1 · 3 | Product-Market Fit | Service, no platform module | The brief lists no landing. |
| 0.1 · 3b | BUILT | BD-8 Build Container | Page `/products/built`. |
| 0.1 · 4 | Entrepreneur's Evolution / The Crossing | BD-9 The Crossing | The brief itself flags the two names (§0.6, item 4). |
| 0.1 · 4b | The Vector | BD-10 The Vector | Page `/products/vector`; sessions are live. |
| 0.1 · 5 | Sovereign Founder Collective | Service, no platform module | No landing. The nearest game place is Town Hall (TH-1, v0); that it is the same thing is **not stated** anywhere I read. |
| 0.1 · 6 | Провожу для твоих клиентов | Service, no platform module | A revenue-share arrangement. |
| 0.1 · 7 | Лицензия | Service, no platform module | A licence on revenue share. The code has white-label skins (`SkinProvider`); whether a licensee gets them is **not stated** in the brief. |
| 0.2 | Высокоточный Бизнес Профиль | ME-1 Unique Gift (uncertain) | The brief gives landing `/` (GM-3, the title screen) and a 5–10 minute online self-description. Which module produces it is **not stated**; ME-1 is the closest by the brief's wording. Sasha or Hark to confirm. |
| 0.2 | Мэтчмейкинг | CB-1 Matchmaking, CB-2 Connections and People | Landing `/game/collaborate/matches`. |
| 0.2 | White-label онбординг | BD-18 White-label proposal, ME-1 Unique Gift, CB-1 Matchmaking | The brief says each member gets a profile and matching inside the community. The proposal page lists the uniqueness-scanner modules among what is set up. |
| 0.2 | Deep AI training | Service, no platform module | A workshop. AI OS pages (AI-1) exist; a link to this product is **not stated**. |
| 0.2 | Equilibrium | BD-5 Equilibrium (web), ST-1 Equilibrium Bot | Landing `/build/equilibrium`. |
| 0.2 | Mystery School for Founders | Service, no platform module | A cohort sold on an outside site; the brief says it combines most products. |
| 0.2 | Founder Cockpit | BD-6 Founder Cockpit | Landing `/build/cockpit`. |
| 0.2 | Your AI | ME-7 Your AI | Landing `/game/your-ai`. |
| 0.2 | Spiritual Practice with Cannabis (не публикуем) | Service, no platform module | Hidden from `/products`. |
| 0.3 | Client Evolution Portal | BD-7 Evolution Portal | Landing `/products/evolution-portal`. |
| 0.3 | The Founder Read | BD-11 The Founder Read | Landing `/products/founder-read`. |
| 0.3 | Venture Studio | Service, no platform module | By invitation; no landing. |

**Count check:** 24 product rows in the brief, 24 rows here. 15 have a platform module (one of them, Высокоточный Бизнес Профиль, is uncertain); 9 are services with no platform module. Modules that no brief product names include the Journey and Village frame (GM-1, GM-2, TH-1), the LEARN modules (LN-1 to LN-5), Events and Men's Circle (MT-1, MT-2, MT-3), the UBB and Product Builder branch (BD-1 to BD-3), Marketplace (BS-1 to BS-3), Holomap and Dashboard (SY-1, SY-2), AI OS, Art, Transcriber and Destiny. They are the game and platform the products sit inside.

---

## 🔀 CROSSWALK — shift → product → module → game step

> **New in v4 (addition approved by Sasha, 2026-11-17).** One table that joins four views of the same thing: the **shift** a person gets, the **product** that sells it, the **platform module** that carries it, and the **game step** (J1…J13) that gives the same shift for free, in solo form. It reads `product_brief.md` §0 **v1** (Sasha's edits of 2026-11-17: product families are level-1 modules, sub-products are level 2) and `game_of_being_you.md` §17. It **supersedes** the v0 "Products × modules" table above, which was built on brief v0 (24 rows) and is kept for history. Prices are not here: they live in the brief, and the public list is `/products`.

**The join key.** Each product has one stable key, the `id` used in `src/data/productMap.ts` (issue #340). That file is **not on `main` at this SHA**; its keys were read from branch `claude/issue-340-20261117-1831` at commit `9745de4`, where it mirrors brief **v0**. Brief v1 changed the product list, so the Key column says which case each key is:
- **file** = the key already exists in `productMap.ts` and the product is unchanged in v1.
- **proposed** = the brief v1 has this product but `productMap.ts` has no matching key. The key is the product's brief name in lower-case with hyphens (the two examples Sasha gave, `build` and `fmf-session`, follow that rule). Sasha or Hark to confirm; the file will need re-keying to v1.
- **v0 keys that v1 retires:** `zog` (split into `top-talent`, `top-talent-course`, `zog-session`, `zog-teams`), `fmf` (split into `fmf-session`, `fmf-mastermind`), `pmf` and `built` (v1 has one container, `build`), `venture-studio` (v1 says "Sovereign Founder Collective (= Venture Studio)", key `collective`).

**How to read the columns.**
- **Module** = what the product is built from or sold through (IDs from the v4 matrix). "none (service)" = delivered by a person, a call or an outside tool.
- **Game step** = the Journey step (or village place) that carries the *same shift* in solo form, from §17. "none" = no step carries it. A step marked *nearest* is my reading; the docs do not say the two are the same thing.
- **Gap** = ⚠ marks a hole: a product with no module, a product with no game step, or a doubt about the match.

### The two entry lines

Two paths into the ladder; both start at the front door (`quiz` → `direction-call`).

| Line | For | Path (keys) | Modules | Game steps |
|---|---|---|---|---|
| **Business** | someone who wants a product that sells | `fmf-session` / `fmf-mastermind` → `build` → `collective` | BD-13, BD-14 / MT-4 → BD-8 → none (service) | J6, J9 → J6, J7, J11, J12 → J13 *(nearest)* |
| **Person** | someone in transition who wants to become themselves | `top-talent` → `crossing` → `vector` | ME-1 → BD-9 → BD-10 | J1 → none → none |

What the two lines show:
- The **business line** follows the Journey: J6 and J7 (uniqueness phrase, tagline), J9 (Mastermind), J11 and J12 (first price, first sale), and J13 (Town Hall) at the end. Its last stop, `collective`, has **no module**; Town Hall is the nearest game place, and no document says they are the same thing.
- The **person line** leaves the game after J1. `crossing` and `vector` have a sales page each (BD-9, BD-10) but **no game step**: the deeper work is live sessions.

### The crosswalk

Level 1 = a product family (a level-1 module in the brief's words); level 2 = a sub-product. Rows follow the brief's order.

| Shift (what changes for the person) | Key | Product (brief v1) | Module | Game step | Gap |
|---|---|---|---|---|---|
| Sees their stage on the hero's path, its obstacles and what leads next | `quiz` · file | Тест «Где я на пути героя» | ME-8 Transition Quiz (`/quiz`) | none; it is a door before the game | ⚠ no game step |
| Sees what they grow out of, what they grow into, and the direction | `direction-call` · file | Professional Direction Call | none (service; outside calendar link) | none | ⚠ no module, no game step |
| **Family 1: Top Talent** (level 1) · talent named in precise words | | | ME-1 Unique Gift | J1 Zone of Genius | |
| Talent named in words | `top-talent` · proposed | 1a · Top Talent (free) | ME-1 (`/zone-of-genius/entry`, assessment, Appleseed) | **J1** | none |
| Walks their own reveal step by step and learns to express the talent | `top-talent-course` · proposed | 1b · Deep Top Talent Reveal (course in the Academy) | ⚠ uncertain: the brief says a Notion programme (outside the platform). In code, `/activate-top-talent` (paid Top Talent Activation, ME-1) and the "Oracle Reading" (`deeper-access`) sit behind the same deeper-access check; which one this product is, is **not stated** | none numbered; the Oracle Reading is "opt" in §17 (*nearest*) | ⚠ module match unconfirmed |
| Uniqueness named and lived in a conversation with a master | `zog-session` · proposed | 1c · Zone of Genius Session (1:1) | none (service) | J1 (*nearest*: same talent, deeper path) | ⚠ no module |
| Each team member named, roles by gifts | `zog-teams` · proposed | 1d · Zone of Genius for Teams | none (service). MT-3 Community Webinar is an offer to community hosts for a free workshop; that it is this product is **not stated** | none | ⚠ no module, no game step |
| **Family 2: Founder-Market Fit** (level 1) · value, ideal client, pain, promise, product outline and USP in one sentence | | | BD-13, BD-14, MT-4 | J6, J9 | |
| Same, in a 2-hour 1:1 session | `fmf-session` · proposed | 2a · FMF Private Session | BD-13 Ignite session (`/ignite`; code name "Productize Yourself Session"), BD-14 FMF pages | J6 uniqueness phrase (*nearest*); `/ignite` is a Market item in §17.2, not a numbered step | ⚠ no numbered step of its own |
| Same, in a small group | `fmf-mastermind` · proposed | 2b · FMF Mastermind | MT-4 Mastermind (`/build/mastermind`) | **J9** Mastermind | none |
| For whom, what changes, why they will want it, one phrase (for a technology) | `pmf-core` · file | 3 · Product-Market Fit Discovery | BD-12 PMF Core (`/products/pmf-core`) | none | ⚠ no game step |
| Direction → offer → first clients → strategy → MVP → beta → first sale | `build` · proposed | 4 · Контейнер BUILD | BD-8 Build Container (`/products/built` now; the brief wants `/products/build`). Related, **not stated** in the brief as parts of it: BD-2 UBB, BD-3 Product Builder, BS-1 Marketplace | J6 uniqueness phrase, J7 tagline, J11 first price, J12 first sale (*nearest*: the solo form of the same shift) | ⚠ the container is delivered by calls; no step is "the container" |
| Their own brand (a unique business) in months, not years | `crossing` · file | 5 · The Crossing (earlier name: Entrepreneur's Evolution) | BD-9 The Crossing (`/products/crossing`) | none | ⚠ no game step |
| A shift on 3–5 parameters they name, measured three times | `vector` · file | 5b · The Vector | BD-10 The Vector (`/products/vector`) | none | ⚠ no game step |
| They build together and self-organize | `collective` · file | 6 · Sovereign Founder Collective (= Venture Studio) | none (service; no landing) | J13 Town Hall, TH-1 (*nearest*; same thing **not stated**) | ⚠ no module |
| The whole path for their own clients | `for-your-clients` · file | 7 · Провожу для твоих клиентов | none (service) | none | ⚠ no module, no game step |
| Leads the programme themselves | `license` · file | 8 · Лицензия | none (service) | none | ⚠ no module, no game step |
| A precise self-profile for AI, opportunities, co-founders | `profile` · file | Высокоточный Бизнес Профиль | ⚠ not stated; ME-1 is closest by wording; the brief's landing `/` is the title screen (GM-3) | J6 uniqueness phrase (*nearest*: the J6 technology is "self-description quality") | ⚠ module match unconfirmed |
| Meets a fitting co-founder | `matchmaking` · file | Мэтчмейкинг | CB-1 Matchmaking, CB-2 Connections and People | none numbered; the places Café (MT-1) and Co-working (CB-1) carry it (§17.2) | ⚠ no numbered step |
| Every member of a community revealed, with profile and matching inside | `white-label` · file | White-label онбординг | BD-18 White-label proposal, ME-1, CB-1 | none | ⚠ no game step |
| Understanding of AI for years ahead | `ai-training` · file | Deep AI training | none (service). AI-1 AI OS exists; a link is **not stated** | none | ⚠ no module, no game step |
| Planning by cycles, plus a simple task manager | `equilibrium` · file | Equilibrium | BD-5 Equilibrium (web, cycle journal), ST-1 Equilibrium Bot | none (not part of the game) | ⚠ no game step |
| Most of the line in one group | `mystery-school` · file | Mystery School for Founders | none (service; outside site) | none | ⚠ no module, no game step |
| The venture and the person seen as one system | `cockpit` · file | Founder Cockpit | BD-6 Founder Cockpit | none | ⚠ no game step |
| Deep readings by AI (the brief says "function to be clarified") | `your-ai` · file | Your AI | ME-7 Your AI | none numbered; place `oracle`, named "Your AI" (§17.2) | ⚠ no numbered step |
| Quality of life, vitality, mystical experience | — (not public, not in `productMap.ts`) | Spiritual Practice with Cannabis (not published) | none (service) | none | ⚠ no module, no game step; hidden from `/products` |
| Clients see how their lines move | `evolution-portal` · file | Client Evolution Portal | BD-7 Evolution Portal | none | ⚠ no game step |
| FMF and the hero's-journey chapter read before the cheque | `founder-read` · file | The Founder Read | BD-11 The Founder Read | none | ⚠ no game step |

**Count check against brief §0 v1:** §0.1 has 15 product rows (the two front-door products, 1a–1d, 2a–2b, and rows 3, 4, 5, 5b, 6, 7, 8) under two family headings (Top Talent, Founder-Market Fit); §0.2 has 9; §0.3 has 2. That is **26 products** and 28 table rows with the two family headings. Keys: 18 `file` (`quiz`, `direction-call`, `pmf-core`, `crossing`, `vector`, `collective`, `for-your-clients`, `license`, `profile`, `matchmaking`, `white-label`, `ai-training`, `equilibrium`, `mystery-school`, `cockpit`, `your-ai`, `evolution-portal`, `founder-read`), 7 `proposed` (`top-talent`, `top-talent-course`, `zog-session`, `zog-teams`, `fmf-session`, `fmf-mastermind`, `build`), and 1 product with no key (cannabis, not public). 18 + 7 + 1 = 26.

### Game step → product (the reverse view)

Every J-step, so a step with no product shows up too.

| J | Step | Product that sells the same shift | Gap |
|---|---|---|---|
| J1 | Zone of Genius | `top-talent` (free); `zog-session` (*nearest*) | none |
| J2 | Mission Discovery | none | ⚠ step with no product |
| J3 | Spectrum Reading | none (module not built) | ⚠ no module, no product |
| J4 | QoL Map | none | ⚠ step with no product |
| J5 | Asset Mapping | none | ⚠ step with no product |
| J6 | UBB uniqueness slice | `build` and `fmf-session` (*nearest*); `profile` (*nearest*) | the paid products are live; the step is the solo form |
| J7 | UBB tagline slice | `build` (*nearest*) | same |
| J8 | Webinar | none | ⚠ step with no product (copy waits for Sasha's plan, §17) |
| J9 | Mastermind | `fmf-mastermind` | none |
| J10 | 21-day mastery practice | none | ⚠ step with no product; the practice is not written down (§17) |
| J11 | First price | `build` (*nearest*) | same as J6 |
| J12 | First sale | `build` (*nearest*) | same as J6 |
| J13 | Town Hall | `collective` (*nearest*) | ⚠ the product has no module |

### Gaps in one place

- **Products with no module (services):** `direction-call`, `zog-session`, `zog-teams`, `collective`, `for-your-clients`, `license`, `ai-training`, `mystery-school`, and the unpublished cannabis product (9). Two more have a module match that is **not confirmed**: `top-talent-course`, `profile`.
- **Products with no game step:** `quiz`, `direction-call`, `zog-teams`, `pmf-core`, `crossing`, `vector`, `for-your-clients`, `license`, `white-label`, `ai-training`, `equilibrium`, `mystery-school`, `cockpit`, cannabis, `evolution-portal`, `founder-read`. Eight more have only a *nearest* step or a village place, not a numbered step of their own: `zog-session`, `fmf-session`, `build`, `collective`, `matchmaking`, `your-ai`, `top-talent-course`, `profile`.
- **Game steps with no product:** J2, J3, J4, J5, J8, J10. These are the free steps that fill Your House; the brief names no product for them.
- **Modules with no product in brief §0:** Mission Discovery (ME-3), Quality of Life (ME-2), Resource Mapping (ME-4), Character Sheet (ME-5), Personality Tests (ME-6); the whole LEARN Space (LN-1 to LN-5); Journey, Village and the title screen as products (GM-1, GM-2; GM-3 appears only as a landing); Events, Men's Circle and Community Webinar (MT-1, MT-2, MT-3); Intros (CB-3); Unique Business, UBB and Product Builder (BD-1 to BD-3); Commercial OS (BD-16); Marketplace and The Originals (BS-1 to BS-3); Town Hall (TH-1); AI OS (AI-1); Holomap, Dashboard and admin (SY-1 to SY-3); Art, Transcriber and Destiny (ST-2 to ST-4). Some are the game itself and need no product; **Men's Circle** (it has its own sale page), **AI OS** (it sells AI working systems) and **UBB** (a strong shift in §17.3 with no named product) are the three where a missing brief row is worth Sasha's look.
- **Mismatch to fix elsewhere (not in this file):** `src/data/productMap.ts` mirrors brief v0; brief v1 needs the re-keying above. The public `/products/map` page (#340) is on a branch, not on `main`.

---

## 🔌 MODULE INTERFACE

> **New in v4, short.** For each top-level module: what it takes in, what it hands out, and what it opens. *Inputs and outputs* are the saved records named in code or in the game blueprint; "—" means none that I could confirm. *Unlocks* comes from `src/data/villagePlaces.ts` and the blueprint's unlock table (§14.3). The last column marks a **plug-in candidate**:
> - **W** = could be white-labeled (our module under another project's name).
> - **X** = could be contributed by an external project (their module plugged into ours).
> - **—** = frame or core; not offered.
>
> These marks are **my read, for Sasha and Hark to confirm**; no terms are defined here ("on set terms" is still open). Test used: the module works without another module's saved result, has one clear input and one output, and has a route of its own. Evidence that the platform already does this: white-label skins and scoped deployments (`SkinProvider`, the `*ScopeLock` components in `App.tsx`), the white-label proposal page (BD-18), community events (`/events/community/:communityId`), per-creator pages (`/p/:slug`, `/mp/:slug`), and the Your AI button catalog, which accepts a new entry once its route exists.
>
> **What an external module would have to be:** one place in the module form (Intro → one button → result → Outro, `docs/templates/module-form.md`), one real result saved to the player, and a rule for when it opens (the place-state rule). That is the contract the rows below describe for our own modules.

| Module | Inputs | Outputs | Unlocks | Plug-in |
|---|---|---|---|---|
| ME-1 Unique Gift | Your answers (talent choices, or a conversation with Your AI) | Top talent snapshot (`zog_snapshots`), Appleseed reveal, Excalibur offer | Home and Quest Board (J1 done) | W: the white-label proposal sells the scanner |
| ME-2 Quality of Life | Your ratings by life domain | QoL snapshot (`qol_snapshots`), your level | — | W |
| ME-3 Mission Discovery | Top talent recommended, not required by the module | A committed mission | Workshop (J2 done) | W |
| ME-4 Resource Mapping | Your assets, entered or suggested | Asset list (`user_assets`) | With talent and mission, opens Co-working | W |
| ME-5 Character Sheet | Everything saved by ME-1 to ME-4 and the Journey | One page that gathers it, and the victories list | Next room of Home | — |
| ME-6 Personality Tests | Results from outside tests | Imported results on your profile | — | X: natural slot for an outside assessment |
| ME-7 Your AI | Your saved profile, your questions, a daily limit | A reply with buttons from the fixed catalog; a reveal from conversation | Routes and practices named in the catalog | X: a new catalog entry once its route exists |
| ME-8 Transition Quiz | Three answers, optionally an email | A shareable result page (`/quiz/r/:id`), a saved read | Entry to Direction Call and the rest of the ladder (brief §0.1) | W |
| LN-1 Academy | Your choice of course | Course progress | Course pages and access pages | X: courses from other projects |
| LN-2 Library | Your choice of practice | A completed practice | — | X |
| LN-3 Growth Paths | Onboarding, your picks | Step completions on five paths | Next upgrade on a path | X: upgrades can be of type "module" |
| LN-5 Playbook and Path | — (public) | A readable method | — | — |
| GM-1 Journey and Quest Board | Real saved events and your self-reports | Victories (`journey_victories`), the next move | Every place's open state | — |
| GM-2 Village | The save file | A map with each place's state | — | — |
| MT-1 Events | Event details; RSVP | Events, RSVPs | — | X: communities already have their own event list |
| MT-4 Mastermind | Registration | Attendance; a reported real step (J9) | — | — |
| CB-1 Matchmaking | Top talent and assets (v3.3 dependencies: ZoG, Resources) | Matches, introductions | — | W: the brief puts matching inside white-label onboarding |
| CB-2 Connections and People | A completed profile | Connection requests, a people directory | — | — |
| BD-1 Unique Business | Top talent complete | Audience, promise, channels, vision | — | W |
| BD-2 UBB and Canvas | Top talent (fills the uniqueness section, v3.3) | Eight artifacts, four compound steps, landing page, dossier (`user_business_artifacts`) | Market opens when an offer is saved | W |
| BD-3 Product Builder | A unique business recommended | A published product page | — | W |
| BD-5 Equilibrium | Your date of birth for the bot; your journal entries | Cycle plan, journal, PDF | — | W: standalone, no dependencies (v3.3) |
| BD-6 Founder Cockpit | Sign-in; live Equilibrium state; a CRM snapshot for the offers board | A one-screen operating view | — | — |
| BD-7 Evolution Portal | A practitioner and their clients | A client-facing portal page | — | W: it exists to be configured for someone else's clients |
| Product pages BD-8 to BD-13, BD-15 | A visitor | A booking or purchase conversation | — | — |
| BS-1 Marketplace | A saved offer (`/p/:slug`, `/mp/:slug`) | A public stall and product pages | Town Hall after a first sale (J12) | X: other projects' offers as stalls |
| BS-3 The Originals | — | A founder list | — | — |
| TH-1 Town Hall | First sale recorded | v0 page: residents' income, your voice | — | — |
| AI-1 AI OS | A visitor | Pages on four working systems, a benchmark, a work-with-us page | — | — |
| SY-1 Holomap | A signed-in user | A map of the whole | — | — |
| SY-2 Dashboard | Data from the spaces (v3.3) | Personal and system views | — | — |
| ST-2 Art, ST-3 Transcriber, ST-4 Destiny | — | A gallery, a transcript, a page | — | X for Transcriber only if its input and output stay one video → one text (my read) |

---

## 📊 MODULE VERSION MATRIX — v3.3 (SUPERSEDED by the v4 matrix above; kept for history)

> **Superseded in v4.** Routes, statuses and notes in the v4 matrix win over this table. Left unchanged so the v3.3 reading can still be compared. Corrections are listed under "What v3.3 said that was wrong at this SHA".

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

> **v4 note.** These per-module tables are as of v3.1 for submodules and v3.3 for top-level fields, and were **not** re-audited line by line in v4. Where a route here differs from the v4 matrix, the v4 matrix wins (known cases: `/zone-of-genius`, `/quality-of-life`, `/game/marketplace/browse`, `/game/build`, `/game/next-move`, `/holomap`, `/art`). Submodules of the modules added in v4 are in the Nesting section, not here.

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

### Seed: Quiz Module — **SUPERSEDED in v4: shipped (ME-8, `/quiz`)**

> v4 found `/quiz`, `/quiz/r/:id` and `src/modules/transition-quiz` at SHA `1524f2f`. The table below is the v3.3 state, kept for history. The spec files are still the spec.

| Field | Value |
|-------|-------|
| Status | ~~Specified, no code~~ (v3.3); shipped (v4) |
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

## 📈 VERSION STATISTICS — v3.1 counts (SUPERSEDED, stale)

> **Superseded in v4.** These counts predate the v3.3 and v4 additions. v4 counts rows and routes instead: **62 matrix rows, 294 paths** (see the v4 matrix and ledger). Submodule counts were not redone.

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

### v4.0 (2026-11-17)
- **Re-audit against code.** Every route in `src/App.tsx` (lines 547–1148, SHA `1524f2f`) read and mapped: 301 route elements = 294 with a path + 6 index + 1 layout; 76 of the 294 are redirects, 218 render pages. All 294 paths are assigned to a matrix row or to frame/legal rows; the ledger sums to 294.
- **New v4 Version Matrix** (62 rows) supersedes the v3.3 matrix, which is kept and marked superseded. Version column keeps v3.3 ratings; modules new to the file are **not rated** (v4 re-checks routes and presence, not maturity).
- **Shipped, not in v3.3, now rows:** Transition Quiz `/quiz` (was "specified, no code"), Your AI, Character Sheet, Journey and Quest Board, Village, Town Hall v0, Mastermind, Academy and activations, Playbook and Path, Unique Business Builder (UBB) and Canvas, Equilibrium web v2 with cycle journal, The Crossing, The Vector, The Founder Read, PMF Core, Ignite session, Products index, AI OS.
- **Found in code, undocumented (marked as such):** `/hero`, `/quiz2`, `/my-result`, `/home`, `/home2`, `/map-classic`, `/intros`, `/ai-upgrade`, `/built-by-you/commercial-os`, `/intelligences`, `/genius-layer-matching`, `/m/:slug`, private client pages, the public essay and thesis pages, the admin routes.
- **No route (concept/retired?):** Skill Trees (retirement confirmed), Business Incubator, Tour, Clock; Equilibrium Bot has no route because it is a Telegram bot.
- **Thirteen v3.3 claims corrected** (list under the matrix), among them: `/zone-of-genius` is a redirect; `/game/next-move` is a redirect to the Journey; `/holomap`, `/art`, `/mens-circle` and `/the-originals` need login; Founders Showcase now renders inside Marketplace and `/founders` is the admin index; Community Webinar is an offer to community hosts.
- **New sections:** Nesting (module → submodules, one sentence per node, Journey J1…J13, eleven Village places); Products × modules (24 rows, one per product in `product_brief.md` §0); Module interface (inputs, outputs, unlocks, white-label and external-contribution marks, for Sasha and Hark to confirm).
- **Crosswalk added (Sasha, 2026-11-17).** One table, shift → product → module → game step, joined by the stable product keys of `src/data/productMap.ts` (#340), on `product_brief.md` §0 v1 (26 products: 18 keys from the file, 7 proposed, 1 unkeyed). It shows the two entry lines (business: FMF → BUILD → Collective; person: Top Talent → Crossing → Vector), a reverse view J1…J13 → product, and the gaps (products with no module, products with no game step, game steps with no product, modules with no product). The v0 Products × modules table is marked superseded. Uncertain: seven keys are proposed, not yet in `productMap.ts`; module matches for `top-talent-course` and `profile`; every *nearest* game step.
- **Marked superseded, not deleted:** the v3.3 matrix, the Version Statistics table, the Quiz seed. The detailed per-module tables carry a v4 note: submodule detail is still as of v3.1.
- **Not done in v4 (open):** submodule re-verification line by line; maturity re-rating; whether the standalone `equilibrium/` app and the Telegram bot are still deployed; placing the three `UD-1` routes; reconciling UBB's 13 steps (blueprint) with its 14 child routes (code), and the Academy's two listed courses with three routed course pages.

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

## 🗺️ THE UNIQUENESS MAP — What It Actually Is (Day 138 finding, corrected Day 138)

> *Added 2026-07-28. A prior search for an artifact literally named "the uniqueness map" found nothing and concluded it doesn't exist (see `roadmap.md` Day 138 open thread Q5). That was a name-matching search, not a concept search — the thing existed, before this correction, under other names, distributed across several artifacts that were never consolidated under one label.*
>
> **Correction (same day):** the first pass of this finding concluded that "v2.0" meant the Quiz shipping and reaching Phase 3 retrodiction, not a new document. Sasha's read, verbatim: *"wrong conclusion. Definitely a document to write!!! This is hugely important as a holomap."* The instrument and its validation are two separate deliverables, not two names for one deliverable — see below.

**What "uniqueness map" means in the corpus.** Two distinct things share the name, and the earlier confusion came from conflating them:

1. **The Uniqueness developmental line** — a 5-stage maturity axis for a person's relationship to their own gift: Unawareness → Initial exploration → Initiation → Integration → Embodiment (`docs/08-content/training_analysis_complete.md` line 181, an early curriculum artifact, "Map of Uniqueness Development"). This is the older, narrower sense — one line among several in a person's development, not an instrument. **This is v1.**
2. **"The uniqueness map" as Sasha now uses it in conversation** — the *instrument* that places a person on that line and moves them along it. Before Day 138 this was not one file; it was distributed across:
   - **The Ripeness Vector** (Phase Shift Technology 123, `docs/01-vision/phase_shift_technology_library.md` line 7482) — nine axes describing a person's readiness for transformational work; **Uniqueness is one of the nine axes** ("development of their relationship to their own gift," target stage 3-4 of 5 in the old 5-stage terms).
   - **The Transition Holomap** (Phase Shift Technology 124, `docs/holomaps/transition_holomap.md`) — the *mechanism*: "a transition is the mechanism by which the uniqueness line advances: uniqueness is the ratchet, a completed transition is the click" (Technology 124, echoed verbatim in `alexanders_unique_business.md` §10 Method v4.0, line 3442).
   - **The Quiz** (`docs/specs/quiz/quiz_product_spec.md` + `quiz_tracker.md`) — the shipped product built on top of the mechanism, not the instrument itself.

   Distributed across three cross-referenced artifacts and never written up as its own instrument, this is why Sasha says the quiz is "based on the uniqueness map" — the quiz consumes an instrument that, until Day 138, existed only implicitly.

**Version state, concretely:**
- v1.0 (implicit): the 2026-01/02-era "Map of Uniqueness Development," 5 stages, curriculum-only, never shipped as a product.
- v1.5 (implicit, Day 136, Jul 26): Technology 123 (Ripeness Vector) formalizes Uniqueness as one of nine scored axes; Technology 124 (Transition Holomap) formalizes the mechanism that moves it. Still three separate documents, no consolidated label — the gap that made v2.0 necessary.
- **v2.0 (Day 138, Jul 28): `docs/holomaps/uniqueness_holomap.md`.** The instrument itself, written up as its own holomap — sibling to the Transition Holomap, extending the v1 five stages into a seven-stage octave (Unawareness → Transmission) plus a register shift to Symbiosis (10), a Pattern/Direction/Assets 3×3 taxonomy, the 63-cell grid, and the 54 shifts. This is what "v2.0" means: **the document, not the quiz.**
- **Validation, separately:** the Quiz reaching Phase 3 (retrodiction-tested against the 7 known clients — `roadmap.md` Q1, `quiz_tracker.md`) is how the instrument gets *proven against real cases*, not what the instrument *is*. Quiz Phase 3 validates the holomap; it does not replace it, and the holomap did not need to wait for Phase 3 to be written.

**Constituent files:**
- `docs/holomaps/uniqueness_holomap.md` — **the instrument itself (v2.0).**
- `docs/01-vision/phase_shift_technology_library.md` — Technologies 123, 124 (125, 126 are adjacent: Social Physics of the Mirror, Persuasion as a Perception Deficit — not part of the uniqueness map itself, but govern when/how it may be shown to someone).
- `docs/holomaps/transition_holomap.md` — the sibling instrument (the mechanism/ratchet-click).
- `docs/specs/quiz/quiz_product_spec.md`, `docs/specs/quiz/quiz_tracker.md` — the shipping product that operationalizes the instrument and, at Phase 3, validates it.
- `docs/02-strategy/unique-businesses/alexanders_unique_business.md` §10 Method v4.0 — names the ratchet/click relationship.
- `docs/08-content/training_analysis_complete.md` — origin of the 5-stage Uniqueness line itself (v1, superseded but preserved as genealogy).

*Note: `roadmap.md` Day 138 Q5 has been corrected to match this finding — the holomap shows as delivered, and Quiz Phase 3 remains tracked separately as validation.*

---

*Module Taxonomy v4.0 — re-audited against `src/App.tsx` at `1524f2f`; Nesting, Products × modules and Module interface added*
*Last updated: 2026-11-17*
*(Footer history: v3.2 added Knowledge Architecture, 2026-03-19.)*

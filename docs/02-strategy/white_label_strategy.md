# White-Label Strategy

> Invisible rails, visible storefronts

*The platform is infrastructure, not a brand. Communities are the brands.*

---

## Philosophy

**No emperor. No extractive tycoon. Thriving for all.**

The goal is a **black hole with gravity pull** — no visible brand, just magnetic value that draws communities in. Each community runs their own storefront on shared rails.

### Structural frame underneath this strategy

The white-label model is the operational expression of two perception shifts formally captured in [`docs/01-vision/phase_shift_technology_library.md`](../01-vision/phase_shift_technology_library.md):

- **Domain 86 — Substrate Positioning:** in coordination-infrastructure plays, the org stays small while the substrate compounds large. Trying to be both the substrate AND the biggest platform on it is exactly what kills coordination plays (Facebook ↔ Open Graph as the canonical failure mode; W3C, Linux Foundation, IETF as canonical successes). The white-label strategy is what makes substrate positioning operational: each community runs its own storefront, the steward org stays neutral, adoption compounds.
- **Domain 87 — Multi-Patron Architecture:** white-label deployment IS multi-patron Leonardo strategy at structural scale. Each skinned community is a patron-shaped relationship; the portfolio compounds; no single relationship is load-bearing. The 30-60 min throughput claim from the playbook is what makes this tractable: if skins are cheap, the portfolio scales; if skins are expensive, the model collapses to "find one big patron and pray."

These two domains are the strategic load-bearing claims underneath everything that follows in this doc.

---

## What Gets Customized Per Community

| Element | How | Priority |
|---------|-----|----------|
| **Colors** | CSS variables / theme config | P0 |
| **Fonts** | Google Fonts or self-hosted | P0 |
| **Logo** | Image swap | P0 |
| **Community name** | Config string | P0 |
| **Terminology** | Optional overrides (e.g., "quests" → "challenges") | P1 |
| **Language** | i18n translation layer | P2 |

---

## What Stays Shared (The Engine)

- Unique Gift assessment
- Quality of Life Map
- 5-vector transformation engine
- XP, levels, streaks, gamification
- Skill trees
- Library of practices
- Recommendation logic
- Matchmaking (cross-community)
- Mission discovery
- Asset mapping

**Principle**: Surface = customizable. Engine = shared.

---

## Technical Approach

### Phase 1: Build for ONE (Now)
- Build MVP for one community (Priroda / Network School)
- Hardcode nothing that should be configurable
- Use CSS variables for colors from day one

### Phase 2: Extract Theme Layer (After MVP)
- Create `theme.config.ts` with all customizable values
- All components reference theme variables
- Document the config file format

### Phase 3: Fork Model
- New community = fork repo + edit config
- Optionally: hosted dashboard for non-technical communities

---

## Language / i18n (P2)

**Goal**: One-click translation to other languages.

**Approach**:
- Extract all user-facing strings to JSON locale files
- Use i18n library (e.g., `react-i18next`)
- Community can provide translations or use AI translation

**Scope**: This is a separate body of work, potentially delegated.

---

## Cross-Community Features

Some features work ACROSS communities using the same engine:

| Feature | Cross-Community Value |
|---------|----------------------|
| **Matchmaking** | Find co-founders across all communities |
| **Mission discovery** | Projects span multiple communities |
| **Economy** | Genius marketplace across the network |
| **Content** | Shared library, community-specific additions |

This is the network effect: each new community adds value to all others.

---

## Brand Visibility

| Layer | Visibility |
|-------|------------|
| **Communities** | ✅ Fully visible (their brand, their members) |
| **Experts/Facilitators** | ✅ Visible (profiles, offerings) |
| **Transformational content** | ✅ Visible (attributed to creators) |
| **Platform infrastructure** | ❌ Invisible (no Evolver Grid branding required) |

---

## Monetization (Post-MVP)

To be designed after MVP is proven. Considerations:
- Per-community licensing fee?
- Transaction fee on marketplace?
- Premium features?
- Support tiers?

**Principle**: Value flows to all participants. No extraction.

---

## How a skin actually gets built — see the playbook

The operational manual for shipping a new skin lives at **[`docs/03-playbooks/skin_creation_playbook.md`](../03-playbooks/skin_creation_playbook.md)** (extracted from this doc 2026-05-25 to separate strategy from execution).

That playbook contains:

- **Required session artifacts** — SoW + 3 DoDs (planning / implementation / debugging) that open every skin session.
- **Operator pre-production pipeline** — 6 human-side steps to produce AI-ready inputs (source-site visit → ChatGPT bg extraction → Gemini Veo animation → Adobe Express logo bg removal → Mux hosting → hand to AI).
- **Inventory checklist** — 9 items to capture before any code lands.
- **CTA dialect catalog** — the 4 paradigms (Aurora glass + halo / NS solid black / Daouniverse yellow / Planetir white); pick ONE per skin.
- **15-step build procedure** — exact code surgery in `SkinContext.tsx`, `App.tsx`, `index.css`, `SpacesRail.tsx`, `GameShellV2.tsx`.
- **Cross-skin pattern catalog** — 13 recurring traps with pre-emptive fixes.
- **Lessons by skin** — NS V1-V8 + Daouniverse pass (14 lessons) + Planetir pass (6 lessons).
- **AI mega-prompt template** — drop-in first prompt for skin N+1.

Empirically validated throughput: **30-60 min build + QA wall-clock per new community skin** when the playbook is followed (N=3 production skins shipped).

---

## Skin tracker — live deployments

This table is the single source of truth for what's in production. **Update one row per skin shipped.** Detailed operational lineage (V1→V8 lessons, daouniverse pass, planetir pass) lives in [`docs/03-playbooks/skin_creation_playbook.md`](../03-playbooks/skin_creation_playbook.md). This table is the strategic snapshot — what's live, who it serves, how it reads.

| # | Skin | Slug | Route | Source brand | Display font | Body font | CTA dialect | Animated bg | Shipped | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Aurora** | `aurora` | `/` (default) | — (canonical platform aesthetic) | Cormorant Garamond | Montserrat | Dark navy glass + gold halo | Cosmic mountain (Mux) | 2026 launch | ✓ Production |
| 2 | **Navy + Gold** | `navy-gold` | `/preview` (internal) | — (premium alternate aesthetic) | Cormorant Garamond | Montserrat | (inherits Aurora primary dialect) | Inherits Aurora | Day 47 (2026-04-21) | 🔒 Internal preview only — Sasha's test ground for alt aesthetics |
| 3 | **Network School** | `network-school` | `/ns/*` | [ns.com](https://ns.com) | Newsreader | Inter | Solid black pill, white text | (none — editorial flat) | Day 75 (2026-05-18) | ✓ Production |
| 4 | **Karime** | `karime` | `/build/karime`, `/build/karime/intake` | (founder offering — Karime Kuri, one-off) | Cormorant Garamond | Inter | Warm-brown dark glass + copper halo | Moroccan-sunset interior (Mux) | Day 81 (2026-05-23) | ✓ Production |
| 5 | **Daouniverse** (LATAM Impact) | `daouniverse` | `/daouniverse/*` | [latamimpact.io](https://latamimpact.io) | Playfair Display | Inter | Solid LATAM yellow `#d4a83a`, dark text | LATAM mountainscape (Mux, darkened + desaturated) | Day 84 (2026-05-25) | ✓ Production |
| 6 | **Planetir** | `planetir` | `/planetir/*` | [planetir.org](https://planetir.org) | Lexend | Inter | Solid white pill, dark text | Sun-pierced pine grove (Mux, light filter) | Day 84 evening (2026-05-25) | ✓ Production |

### How to add a row

When shipping skin N+1:

1. After the skin is verified live in browser preview (DoD #3 from the [playbook](../03-playbooks/skin_creation_playbook.md) closed), add the row here.
2. **Source brand**: clickable URL to the canonical reference site. For one-offs without a source brand, note the deployment context.
3. **Display / Body font**: extracted from the source site (see playbook inventory #3 — `curl <site>/_next/static/chunks/*.css | grep font-family`). Verbatim match, never an approximation.
4. **CTA dialect**: one of the 4 paradigms catalogued in the [playbook → CTA dialect catalog](../03-playbooks/skin_creation_playbook.md#cta-dialect-catalog-pick-one-per-skin). If the new skin introduces a 5th, add a row to the catalog there too.
5. **Animated bg**: short scene description + "(Mux)" or "(none)". The full Mux URL lives in `GameShellV2.tsx` `MuxVideoBackground` constants — no need to duplicate here.
6. **Shipped**: project day-counter + ISO date. Useful for the throughput-monotonicity check (skin N+1 wall-clock should be ≤ skin N).
7. **Status**: ✓ Production / 🔒 Internal / ⏳ Parked / 🗄 Retired.

### Skin family at a glance

- **4 production white-label community skins**: NS, Daouniverse, Karime, Planetir
- **4 distinct primary-CTA dialects** in use: dark navy glass+halo (Aurora) / solid black (NS) / solid LATAM yellow (Daouniverse) / solid white (Planetir) — Karime uses a warm-brown variant of the Aurora dialect
- **3 production Mux video backgrounds**: cosmic mountain (Aurora), LATAM mountainscape (Daouniverse), Moroccan-sunset interior (Karime), Planetir pine grove. NS is the only video-less production skin (editorial flat by design).
- **2 internal-only skins**: Navy+Gold (preview), Aurora-default (canonical)

---


## Strategic Role in the Commercial Model (Day 77, May 20, 2026)

White-label is no longer "an option we may pursue Phase 2." It's the **primary commercial channel** for the matching product going forward.

### Why white-label became central

The Day 76–77 strategic crystallization (see [`monetization_strategies.md` → Strategic Crystallization](./monetization_strategies.md#strategic-crystallization-day-7677-may-1920-2026)) repositioned the product:

- **Matching is the product. Unique-business methodology is the engine underneath.**
- The market that buys matching is **community ecosystem leaders**, not individual cold-traffic founders.
- Each community wants their own brand on top of shared coordination infrastructure — white-label is the architectural fit.

### The commercial flow

1. Ecosystem leader (Balaji, Carolina, vnest, venture-studio operators) signs paid pilot
2. Sasha deploys a community-specific skin (process documented in [`docs/03-playbooks/skin_creation_playbook.md`](../03-playbooks/skin_creation_playbook.md))
3. Members onboard via JOURNEY: Top Talent → Mission → Assets → QoL → matching pool
4. Community pays per-active-member (~$5–8/mo) + onboarding fee per new member (~$30–50)
5. Cross-network commons compounds across all deployed skins (opt-in anonymized data, CC BY 4.0)

### Why no competitor has shipped this

- Mighty Networks, Circle, Skool, Heartbeat → no matching engine, no self-knowledge layer
- YC Co-Founder Matching, Lunchclub → matching without per-community white-label
- Vistage, EO, MasterMind → human-curated, doesn't scale
- LinkedIn → surface social-graph matching, not depth

The combination of **per-community white-label + AI-precision matching + self-knowledge depth + consent-bearing active intro** is currently unoccupied.

### Throughput target

Each new community skin lands in **30-60 min build + QA wall-clock** once the playbook is in production use. Validated empirically at N=3 skins (NS → Daouniverse → Planetir). Operator pre-production pipeline (per-skin asset prep) adds another 30-60 min for image-gen / video-gen / hosting steps.

This is the load-bearing claim that makes the planetary-coordination-infrastructure play tractable: if skins are cheap, the network of communities scales; if skins are expensive, it doesn't. **Cheap is now operationally proven.**

### Cross-references

- **Skin-creation operational manual**: [`docs/03-playbooks/skin_creation_playbook.md`](../03-playbooks/skin_creation_playbook.md) — required reading before shipping skin N+1
- Commercial framing + business model: [`monetization_strategies.md` → Strategic Crystallization](./monetization_strategies.md#strategic-crystallization-day-7677-may-1920-2026)
- New funnel architecture each skin inherits: [`alexanders_unique_business.md` → Funnel Architecture v2](./unique-businesses/alexanders_unique_business.md#funnel-architecture-v2--matching-as-hero-day-77-may-20-2026)
- Reply-ready content for the first commercial pilot (Balaji / NS): [`leonardo_strategy_instances/balaji_srinivasan.md` → Reply-Ready Arsenal](../03-playbooks/leonardo_strategy_instances/balaji_srinivasan.md#reply-ready-arsenal-day-77-may-20-2026)
- Superseded early thinking: `community_whitelabel_spec.md` (Priroda-era draft, kept as historical record)

---

*White-Label Strategy v2.0*
*Created: 2025-01-04 · v1.0-v1.10 history: built up the per-community skin spec inline as NS → Daouniverse → Planetir each shipped (lessons + cross-skin pattern catalog + operator pre-production pipeline + SoW+3DoD discipline). · v2.0 (2026-05-25 Day 84 evening, split): operational content extracted to [`docs/03-playbooks/skin_creation_playbook.md`](../03-playbooks/skin_creation_playbook.md) — this doc holds the strategy (philosophy, customization scope, network effects, brand visibility, monetization, commercial role); the playbook holds execution (SoW+DoD, operator pipeline, inventory, build procedure, lessons by skin, cross-skin pattern catalog, AI mega-prompt). Different readers, different cadences — strategy updates when business model evolves, playbook updates every new skin.*

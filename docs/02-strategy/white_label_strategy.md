# White-Label Strategy

> Invisible rails, visible storefronts

*The platform is infrastructure, not a brand. Communities are the brands.*

---

## Philosophy

**No emperor. No extractive tycoon. Thriving for all.**

The goal is a **black hole with gravity pull** — no visible brand, just magnetic value that draws communities in. Each community runs their own storefront on shared rails.

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

- Zone of Genius assessment
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

*White-Label Strategy v1.0*
*Created: 2025-01-04*

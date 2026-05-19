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

## Per-Community Skin Spec (added 2026-05-19)

*The first real skin shipped May 18, 2026: `network-school` at `/ns/*`. Process below extracted from that build so the second, third, Nth skin take hours, not days.*

### What you need to collect from the community before writing any code

A new skin is a **brand inventory** + a **token translation**. Don't start coding until the inventory is complete — half-known palettes mid-implementation are how skins drift.

#### 1. Brand identity (1 row)

| Field | Why it matters |
|---|---|
| **Community name** | Used in `data-skin` slug, route prefix, internal docs |
| **Slug** | `network-school`, `priroda`, etc. — kebab-case, no spaces. This becomes both the `data-skin` value AND the route prefix `/<slug>/*` |
| **One-line aesthetic** | "Editorial monochrome, NYT-adjacent," "Cosmic mystical," etc. Calibrates judgment calls when the brand book is silent |
| **Reference URL** | Their canonical site — the visual source-of-truth |

#### 2. Logo assets

| Asset | Required | Notes |
|---|---|---|
| **Primary logo (color or default)** | ✅ | PNG or SVG. SVG preferred for retina. |
| **Inverted variant** (dark-bg version if primary is light) | If applicable | NS only needed the dark-on-white version because the skin is white-on-white. |
| **Favicon** | ⚠️ Skip for first ship | Per-tenant favicon needs build-time config — defer until subdomain phase. |
| **OG / social-share image** | ⚠️ Skip for first ship | Same as favicon. |

For each logo asset: capture **the URL** (preferred) or **the file** (acceptable for first ship). Note its dimensions and whether it has padding/whitespace baked in.

#### 3. Typography

| Field | Example (NS) | How to capture |
|---|---|---|
| **Display font** | Source Serif Pro (free Google Fonts proxy for Tiempos) | Inspect their `<h1>` in DevTools → `font-family`. If licensed face, find a free near-match. |
| **Body / sans font** | Inter | Same — inspect their `<p>` and `<button>`. |
| **Font weights used** | 400, 600 display; 400, 500 body | Inspect a few elements. |
| **Letter-spacing rules** | Display: `-0.01em` slight tighten | Sample one headline + one button. |
| **Google Fonts URL OR self-host plan** | `https://fonts.googleapis.com/css2?family=Source+Serif+Pro:…&family=Inter:…` | Construct from Google Fonts picker. |

#### 4. Color palette

Capture each as a hex / hsl value. These map 1:1 to existing `--skin-*` tokens.

| Slot | NS example | Token consumer |
|---|---|---|
| Page background | `#ffffff` | `--background` (HSL) + `--skin-panel-wash` |
| Page foreground (text) | `#0a0a0a` | `--foreground` (HSL) + `--skin-text-primary` |
| Pane 1 bg | `#ffffff` (v2; v1 was near-black, see lessons learned below) | `--skin-panel-1-bg` |
| Pane 2 bg | `#ffffff` | `--skin-panel-2-bg` |
| Primary CTA bg | `#0a0a0a` | `--skin-cta-bg` |
| Primary CTA text | `#ffffff` | `--skin-cta-text` |
| Hairline divider | `rgba(0,0,0,0.07)` | `--skin-rule-hairline` |
| Selected state bg | `rgba(0,0,0,0.06)` | `--skin-selected-bg` |
| Selected state border | `rgba(0,0,0,0.25)` | `--skin-selected-border` |
| Form input bg | `#ffffff` | `--skin-input-bg` |
| Form input border | `rgba(0,0,0,0.18)` | `--skin-input-border` |
| Single accent (replaces gold) | `#0a0a0a` (NS uses no accent — solid black) | `--skin-accent-gold` |

When the brand has a real accent (Stripe purple, Linear blue), populate `--skin-accent-gold` with that color and the gradient accent tokens with that color's family.

#### 5. Component recipes

| Component | Capture | NS example |
|---|---|---|
| **Primary button** | shape (radius), padding, font-weight, letter-spacing, hover | Black tight-radius rectangle (`rounded-md`-ish), white text uppercase, no shadow, hover = slight opacity drop |
| **Secondary button** | Same fields | Often "Login" link-style only — capture as link styling |
| **Card** | radius, border, shadow | White, `1px solid rgba(0,0,0,0.08)`, minimal shadow |
| **Form input** | radius, border, focus state | White, hairline border, focus = thicker black border |
| **Active-state indicator** | What signals the active item in a nav? | NS: solid black underline OR small black square — NOT a gold/blue ring |

#### 6. Decorations to disable

Most communities have less decoration than the canonical Aurora skin. Document what to turn OFF:

| Decoration | Aurora has it | NS has it? |
|---|---|---|
| Animated Mux video background | ✅ | ❌ → hide |
| Paper-grain noise overlay | ✅ | ❌ → hide |
| Ornament star + spinner | ✅ | ❌ → hide or convert to flat black |
| Liquid-glass blur effects | ✅ | ❌ → flatten |
| Drop-shadow halos / glows | ✅ | ❌ → none |
| Gradient text on accent words | ✅ | ❌ → solid color |

For each row marked "off" — add an override under `[data-skin="<slug>"]` in `src/index.css`.

#### 7. Edge cases — known leak surfaces

Components that hardcode colors and need either patching or skin-scoped CSS overrides. This list grows as we discover them; current known leakage:

- `src/lib/landingDesign.tsx` → `GOLD_GRADIENT` constant (✅ tokenized May 18)
- `src/components/game/SpacesRail.tsx` → rail bg + selected-state inline styles (✅ tokenized May 18)
- `src/components/game/SectionsPanel.tsx` → selected-state inline style (✅ tokenized May 18)
- `src/components/game/GameShellV2.tsx` → header bg (✅ tokenized May 18)
- `src/modules/zone-of-genius/*` → multiple `#a06d08` literals + `bg-[#0a0a1a]` cosmic-bg pattern (handled via CSS override for `/ns`)
- **Pending:** Playbook rainbow step circles, Step accent purple text, Equilibrium ATTUNE/ACT toggle, QoL navy eyebrow + italic subtitle

---

### The build procedure (after inventory is complete)

1. **Add slug to `Skin` type** in `src/contexts/SkinContext.tsx` and update `VALID_SKINS`.
2. **Add font import** at the top of `src/index.css` (Google Fonts URL).
3. **Add token block** `[data-skin="<slug>"] { … }` in `src/index.css` after the previous skin's block. Populate from the palette table above. **Treat accent tokens as flat gradients** (e.g. `linear-gradient(135deg, #color 0%, #color 100%)`) — they're consumed via `background-image` in some places, and a solid hex isn't valid there.
4. **Add shadcn HSL palette** under `@layer base` mirroring the existing `[data-skin="navy-gold"]` block — required for shadcn Card/Input/Button to auto-adapt.
5. **Add decoration overrides** after the token block: hide animated video, ornament star, paper grain, liquid-glass — whatever decoration table #6 marks "off."
6. **Add logo conditional render.** Either swap `<img src>` based on `useSkin().skin === '<slug>'`, or add a CSS rule that replaces the asset under `[data-skin="<slug>"]`. Cover SpacesRail + global SiteLogo + any per-page hero logos.
7. **Create `<SlugScopeLock />` component** mirroring `src/components/skin/NSScopeLock.tsx` — force-mounts the skin via `pushTemporarySkin` while in `/slug/*` scope.
8. **Add routing** in `src/App.tsx`: extend the basename detection (currently `/ns`-specific) to a list of valid skin prefixes, OR generalize the pattern with a single helper. Conditionally mount `<SlugScopeLock />` inside the `BrowserRouter`.
9. **Visual QA** page-by-page against the source brand's site. Patch residual leaks.
10. **Ship + verify.**

---

### Lessons learned from `network-school` v1 → v2 (2026-05-18 → 2026-05-19)

- **Don't assume "dark rail = premium."** NS rejects the dark-rail convention — its register is white-on-white with hairline dividers. The first NS pass mapped Pane 1 to near-black on the assumption that a 3-pane shell needs visual depth via background contrast. Wrong: NS achieves pane separation via hairline borders + typographic hierarchy, not background tone. Confirm pane-bg color from the source brand FIRST, not from intuition.
- **Inline-styled inline-styles are the silent killer.** `style={{ backgroundColor: "rgba(212,175,55,0.08)" }}` scattered across 6 components is invisible to token swaps. Grep for hardcoded color literals at inventory time — don't discover them in QA.
- **The `bg-[#0a0a1a]` Tailwind arbitrary pattern is everywhere.** It's the project's cosmic-bg signature. Skin-scoped CSS override is the right answer (one rule kills all occurrences) — don't try to refactor every component.
- **The skin infrastructure (SkinProvider, CSS variables, data-skin attr) was production-ready before the first real skin needed it.** This is what made the first NS pass possible in one focused session. The 2-3 day budget I drafted assumed building the infrastructure. Reality: ~4 hours including investigation, because Sasha had already done the load-bearing work in January.

---

*White-Label Strategy v1.1*
*Created: 2025-01-04 · Updated: 2026-05-19 (Per-Community Skin Spec added after `network-school` v1 ship)*

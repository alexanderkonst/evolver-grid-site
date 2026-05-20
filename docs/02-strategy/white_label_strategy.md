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

### Lessons learned from `network-school` v1 → v2 → v3 (2026-05-18 → 2026-05-19)

#### From v1 → v2

- **Don't assume "dark rail = premium."** NS rejects the dark-rail convention — its register is white-on-white with hairline dividers. The first NS pass mapped Pane 1 to near-black on the assumption that a 3-pane shell needs visual depth via background contrast. Wrong: NS achieves pane separation via hairline borders + typographic hierarchy, not background tone. Confirm pane-bg color from the source brand FIRST, not from intuition.
- **Inline-styled inline-styles are the silent killer.** `style={{ backgroundColor: "rgba(212,175,55,0.08)" }}` scattered across 6 components is invisible to token swaps. Grep for hardcoded color literals at inventory time — don't discover them in QA.
- **The `bg-[#0a0a1a]` Tailwind arbitrary pattern is everywhere.** It's the project's cosmic-bg signature. Skin-scoped CSS override is the right answer (one rule kills all occurrences) — don't try to refactor every component.
- **The skin infrastructure (SkinProvider, CSS variables, data-skin attr) was production-ready before the first real skin needed it.** This is what made the first NS pass possible in one focused session. The 2-3 day budget I drafted assumed building the infrastructure. Reality: ~4 hours including investigation, because Sasha had already done the load-bearing work in January.

#### From v2 → v3

- **Body font matters as much as display font.** v2 used Source Serif Pro for headlines and Inter for body — that broke the editorial spell. NS uses serif for body too; sans-body reads as "modern SaaS app," not "editorial publication." When the source brand is editorial, body type must match.
- **Pure-white-on-white panes collapse the rail.** v2 had all three panes pure white with hairlines, and the rail visually merged into Pane 2. Fix: Pane 1 → barely-perceptible off-white (`#fafafa`) so it reads as a "nav surface" without going dark. Pane 2 + Pane 3 stay pure white. Hairlines bumped to 0.10 alpha (from 0.07) so all three boundaries register.
- **Pill buttons read "app," tight-radius rectangles read "publication."** NS's APPLY button is ~8px radius, not `rounded-full`. The single CSS override `[data-skin="<slug>"] .rounded-full { border-radius: 8px }` flips the register instantly.
- **Editorial buttons have no decorative ornaments inside them.** Our default CTA carries an ✦ ignite-logo prefix; NS strips it. Hide via `[data-skin="<slug>"] button img:first-of-type { display: none }`.
- **The brand asset's intrinsic dimensions matter.** First NS-logo render was tiny because the asset is wide and we inherited the wordmark's width math. Force explicit `width: 64%; max-height: 80px; object-fit: contain` for proper aspect handling. Mobile rail (72px column) needs an icon-scale clamp.
- **UI chrome and body content want different font families.** Rail/Pane 2 chips + form controls + buttons → clean grotesque sans (Inter). Headlines + body prose → editorial serif (Newsreader). Mixing them is correct; matching them is wrong.
- **Newsreader > Source Serif Pro for NS-style editorial.** Higher contrast, modern transitional voice. Both are free Google Fonts.

#### From v3 → v4

- **Brand wordmark is more than the flag.** v3 used just the NS flag PNG as the rail logo — read as a tiny black square. v4 composes the lockup in-source: flag PNG + "ns.com" text rendered in Newsreader serif side-by-side, matching the canonical NS header treatment. When the source brand's logo is a wordmark lockup, recreate the lockup rather than ship the icon alone.
- **The preview banner is debug chrome — strip it on demo surfaces.** The skin preview banner is useful internally but reads as "this is a test page" to an external evaluator. Add an explicit `if (skin === '<slug>') return null` to the banner component for any skin being shown to outsiders.
- **Icon color identity ≠ chrome identity.** Aurora gives each SPACES chip its own colored icon (JOURNEY gold star, AI OS rainbow merkaba, etc.). Under NS the icons should be grayscale — NS uses no color in UI chrome. Per-icon `filter: grayscale(1) brightness(0.55) contrast(0.95)` under `[data-skin="<slug>"]` does it.
- **Audit utility-row uniformity once per skin.** Log Out, music player, chat-with-us, settings all sit in the rail's bottom utility row. If any one has different padding/radius/icon-size/hover-color, the row reads as inconsistent. Lock them to the same chip shape with the same hover register. Pink/red hovers especially break the editorial calm.
- **The X-to-close in Pane 2 is invisible by default on inverted skins.** It uses `text-white/50` which assumed a dark Pane 2. Under NS (white Pane 2) it disappears. Skin-scoped color override is the right fix.
- **Tokenize music-player colors as part of the per-community spec.** The play-button bg/border/shadow + track-text + skip-icon colors all carry the brand register. v3 missed them entirely. Add `--skin-music-play-bg`, `--skin-music-icon`, `--skin-music-text`, `--skin-music-meta` to the spec so the next skin doesn't repeat this.
- **Platform-wide UI fixes vs skin-scoped overrides — know which is which.** v4 standardized rail-item widths, shrank the AI OS icon slightly, and tightened the logo top-padding ACROSS the platform (not just under NS) — Sasha called those out as canonical chrome bugs to fix everywhere. By contrast, the icon grayscale and pane-2-close visibility are NS-only. The rule: if a brand asks for the change, check whether the request describes the canonical surface or just their skin variant. Bake into the spec.

#### From v4 → v5

- **Inline SVG > CDN PNG for brand marks** — *but only if the simple-geometric SVG actually represents the brand mark.* v4 fetched the NS flag from `ns-assets.com` and it rendered as a featureless black rectangle — load issue + aspect mismatch. v5 reconstructed the flag as a 3-rect inline SVG. v6 reverted this: the NS canonical mark is a *wavy* flag, not a square + cross, and a simple SVG flattens that detail. **Lesson:** inline SVG works when the brand mark is geometric (Stripe's S, Linear's L, Notion's N). For branded marks with custom contours (NS wavy flag, Anthropic's color star), use the PNG/SVG asset from the source CDN at known-good dimensions.
- **Audit ALL the SPACE icon types — not just the image ones.** Our `<ImageIcon>` was caught by `img[alt="..."]` selectors in v4. But `<GlyphIcon>` (used by BUILD/LEARN/MEET/COLLABORATE/OFFER) is an inline-styled `<span>` with `color: hsl(...)` baked in — the image selector misses it entirely. Use attribute-substring CSS to catch the inline `hsl()` color and neutralize text-color + text-shadow under the skin. Pattern: `span[style*="hsl(45,"]` etc.
- **Strikethrough on lowercase needs `top: 62%`, not `55%`.** Browser strike-through positioning is calibrated for uppercase x-height. Our labels are mostly lowercase (Cormorant Garamond Title Case) — at `top: 55%` the line crosses the uppercase ascenders but completely misses the optical middle of lowercase letters. `top: 62%` lands on the x-height midline. This is a platform-wide fix, not skin-scoped.
- **Pane-2 header height should align with Pane 1 logo block.** Pane 2's default `h-16` (64px) was correct when Pane 1's FYTT wordmark was 56px+ tall. Under NS the logo lockup is only ~48px tall, so Pane 2 needs to shrink to match. CSS-scoped override: `[data-skin="<slug>"] [class*="w-[260px]"] > div.h-16:first-child { height: 48px }`. Verify per-skin.
- **Mobile menu glyph is a separate surface from the rail logo.** The mobile-collapsed shell uses a hamburger pill in `GameShellV2.tsx` with its own brand glyph (the FYTT torus). Under NS this needs to render the NS flag too, AND its inline button styling (background, border, glow) needs to flip to editorial neutral. `useSkin()` in `GameShellV2` + conditional render in the mobile-pill element. v4 missed this; v5 fixed it.
- **JSX expression comments vs JS line comments — `{ /* */ }` inside `return ( ... )` is an object literal.** v5 build broke briefly because I added `{/* skin comment */}` between two JSX siblings inside a `return (` that was using `//` line comments above. The `{ ... }` between two top-level expressions parses as an object literal, not as a comment. Match the existing comment style in each file: if the surrounding return uses `//`, use `//`; if it uses `{/* */}`, use `{/* */}`.
- **Always test mobile after any rail/shell change.** Our shell renders dramatically differently below the `md` breakpoint — full rail collapses to a hamburger pill. Skin overrides that work on the desktop rail don't automatically apply to the mobile pill (different DOM tree). After every skin pass, viewport-resize to 375px and walk the same 3 surfaces (landing, zog, playbook) you walked on desktop.

#### From v5 → v6

- **Reuse the chip-shape wrapper for the brand logo block.** v5 had the NS logo lockup in its own custom div with hand-tuned `pl-2` padding. The flag center landed at x=26 while chip icons centered at x=35–40 — visible 6–14px misalignment. v6 wrapped the logo in the SAME `flex items-center gap-3 px-3 py-2.5` shape used by every SPACES chip below. Flag center now auto-aligns with chip-icon column. **Lesson:** when adding a new rail item (logo, divider, utility row), match the existing chip's flex shape rather than rolling new padding.
- **`border-style: double` needs `border-width >= 3px`.** A `1px double` border renders as a single line (browser collapses). For the editorial dual-rule between Pane 1 and Pane 2, use `border-right: 3px double <color>` and pick a slightly darker alpha to compensate for the visual thinness of each individual line.
- **Hover shade has to be skin-tuned.** The default platform hover is `hover:bg-white/[0.04]` — invisible on white. Each skin needs its own hover-shade token (or override) calibrated to its base background. Under NS, `rgba(10, 10, 10, 0.05)` reads as a soft hover wash without overpowering the editorial calm.
- **Inline `hsl()` colors get normalized to `rgb()` by the browser CSSOM.** v5 tried to catch GlyphIcon's `hsl(45, 90%, 62%)` via `span[style*="hsl(45,"]` — the selector missed because the rendered DOM `style` attribute had been converted to `rgb(245, 202, 71)`. v6 switches to a layout-fingerprint selector: `span[style*="place-items: center"]` (GlyphIcon's unique inline grid layout) catches all 5 glyph variants regardless of color format. **Lesson:** when selecting inline-styled elements via CSS, prefer attributes set by your code (like the layout fingerprint) over color values that browsers may normalize.
- **Add a horizontal rule below the logo block to delineate "brand / spaces / utility."** Pane 1 now reads as three vertical sections: brand wordmark at top, SPACES nav in the middle, utility row (music/chat/settings/log-out) at the bottom. Two hairlines (above music and below logo) tell the user the rail has hierarchy.
- **Preview banner can come back if its copy turns into a disclaimer.** v4 hid the banner entirely on NS (read as "debug chip"). v6 brings it back with explicit "Demo · not affiliated with ns.com" copy — turns the banner from internal-tool chrome into a *legal* affordance that makes the demo honest. Keep editorial styling (no gold, hairline border, near-black text) so it doesn't break the register.

### Forms / inputs / segmented controls — captured for future surfaces (not yet built)

Most forms in the platform are auth-walled (UBB artifact entry, Settings, ZoG assessment). When we build form-skin coverage for NS, the recipe is:

| Element | NS pattern |
|---|---|
| **Text input** | White bg, 1px solid hairline border (`rgba(0,0,0,0.18)`), ~10px radius, generous height (44–56px), label above in small bold sans, faint serif placeholder |
| **Select dropdown** | Same as text input + chevron icon right-aligned |
| **Radio cards (side-by-side options)** | Rectangular cards with hairline border, circle radio inside left, label sans text right, active state = subtle gray fill (`#f5f5f5`) + dark border |
| **Segmented control (tab-style)** | Three pills inline, active = white bg + black text + 1px border, inactive = transparent bg + muted text |
| **Submit button** | Tight-radius rectangle, black bg, white sans text uppercase letter-spaced 0.08em, arrow optional |
| **Form sections** | Generous vertical padding (32–48px between groups), small-caps section headers in bold sans |

When V4 brings forms into the NS surface, scope the changes to `[data-skin="network-school"] input`, `[data-skin="network-school"] select`, `[data-skin="network-school"] [role="radiogroup"]` and pattern after this table.

#### From v7 → v8

- **Mobile/desktop shell class parity is non-obvious — and skin CSS depends on it.** GameShellV2 passes `className="h-dvh transform-gpu …"` to `<SpacesRail>` on desktop but NOT on mobile. My NS-skin CSS used `.liquid-glass.h-dvh` selectors, which silently missed on mobile. Result: mobile rail rendered with the old Aurora-colored icons. **Fix:** pass `className="h-dvh"` to the mobile SpacesRail too. **Lesson:** when adding skin CSS, eval the rail in mobile AND desktop to confirm the selectors match in both DOM trees. Don't trust that "rail is rail" — the shell wraps it differently per viewport.
- **Auth pages need explicit per-page CSS overrides under each skin.** Our `/auth` route renders inside `GameShellV2` (so the shell chrome is skin-aware) BUT the page-level component uses **inline-styled** Cormorant fontFamily + gold rgba values that no skin-token selector reaches. CSS `!important` *does* beat non-!important inline styles per the cascade — so a block of `[data-skin="<slug>"] article.liquid-glass-strong h1 { font-family: ... !important }` flips the page without editing every inline-styled span. **Lesson:** auth/marketing/landing pages with heavy inline styling are the highest-traffic, most-customized surfaces. Audit them per-skin and use `!important` overrides targeted by a unique container class on the page (e.g. `.liquid-glass-strong`, the page-specific outermost class).
- **Test the auth flow under each skin AT MINIMUM.** Auth is the doorway. If `/<slug>/auth` reverts to the canonical brand, an outsider clicking through your demo gets dropped out of the spell. Worth a 60-second walkthrough per skin: visit `/<slug>`, click any auth-requiring link, confirm `/auth` (or the resolved path) still reads in the skin's register.

---

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
2. Sasha deploys a community-specific skin (process documented in *Per-Community Skin Spec* above)
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

Each skin should take **hours, not days** by the second deployment. V1–V8 of the NS skin (May 18–20) demonstrated the patterns; once `theme.config.ts` is codified per Phase 2 plan, the marginal cost of skin N+1 drops sharply.

This is the load-bearing claim that makes the planetary-coordination-infrastructure play tractable: if skins are cheap, the network of communities scales; if skins are expensive, it doesn't.

### Cross-references

- Commercial framing + business model: [`monetization_strategies.md` → Strategic Crystallization](./monetization_strategies.md#strategic-crystallization-day-7677-may-1920-2026)
- New funnel architecture each skin inherits: [`alexanders_unique_business.md` → Funnel Architecture v2](./unique-businesses/alexanders_unique_business.md#funnel-architecture-v2--matching-as-hero-day-77-may-20-2026)
- Reply-ready content for the first commercial pilot (Balaji / NS): [`leonardo_strategy_instances/balaji_srinivasan.md` → Reply-Ready Arsenal](../03-playbooks/leonardo_strategy_instances/balaji_srinivasan.md#reply-ready-arsenal-day-77-may-20-2026)
- Superseded early thinking: `community_whitelabel_spec.md` (Priroda-era draft, kept as historical record)

---

*White-Label Strategy v1.7*
*Created: 2025-01-04 · Updated: 2026-05-20 (V7→V8 lessons — mobile/desktop shell class parity, auth-page CSS-!important override pattern, mandatory auth-flow audit per skin) · Strategic-role section added 2026-05-20 (Day 77 — white-label as primary commercial channel for the matching product, post-Day-77 crystallization)*

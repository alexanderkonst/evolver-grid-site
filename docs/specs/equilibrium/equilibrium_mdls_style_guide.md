# MDLS Style Guide v1.0 — Equilibrium Fragment

> *Multi-Dimensional Living Surface · Stage 8 of the digital surface arc · Created 2026-05-18*
>
> The canonical Style Guide for the Equilibrium MDLS recompile. Written in editorial-book-design format (per mood-board references Y2 + Y4). Compiles from the Direction Memo + 7 Principles + 3 Rules + 20-image mood-board synthesis captured in `equilibrium_mdls_tracker.md`.
>
> **Companion docs:** `equilibrium_mdls_tracker.md` (progress + scope + DoD) · `glassmorphism_blueprint.md` (Liquid Glass spec MDLS builds on top of) · `new_ui_paradigm_vision.md` §2026-05-16 (the framework MDLS implements).

---

## §0 · Direction Memo

> MDLS replaces the question *"how should this look?"* with *"what does this transmit?"* — compiling a software category that did not exist before: **contemplative operating surfaces** — environments that are not tools but formative spaces, where every choice carries a stance about consciousness, time, and human coordination.
>
> It enacts this by composing three co-equal poles — **luminosity** (aurora living within material), **physicality** (industrial-design weight, tactile commit), and **editorial refinement** (typography doing work, not decoration) — across eight primitives, producing surfaces that feel like designed objects, not painted screens.
>
> We start with Equilibrium because cycles, dedication, and energetic commitment cannot transmit through a SaaS register — and the corpus, the mood-boards, and the AI-rendered proofs have already converged on how.

---

## §1 · The 7 Principles

| # | Principle | When applied, it screens decisions toward… |
|---|---|---|
| 1 | **Color enters from within, not painted on.** | Radial gradients inside material; never solid-color fills as primary color carrier |
| 2 | **Restraint over decoration.** | Drop any element that doesn't earn its place; never add for ornament alone |
| 3 | **Sacred over neutral.** | Tone choices land in reverence-register, not casual-SaaS-register |
| 4 | **Coherence over consistency.** | A surface hangs together as a whole, not just by repeating tokens |
| 5 | **Every primitive earns its place.** | If you can't say *why* a primitive is here, remove it |
| 6 | **Surface is the form the transformation arrives in.** | Design and product fuse — what the surface IS = what the product DELIVERS |
| 7 | **Motion is meaning, not noise.** | Each animation must answer "what is this motion *for*?" |

---

## §2 · Goal-Primitive Vocabulary

Twelve archetypal action-verbs in MDLS register, replacing generic productivity language.

| # | Verb | When to use | Maps to current Equilibrium goals like… |
|---|---|---|---|
| 1 | **Transmit signal** | Public-facing work (essay · post · video) | "Ship one essay" · "Publish content" |
| 2 | **Compress to one sentence** | Articulate something messy into a clear line | "Name the offer" · "Write the tagline" |
| 3 | **Close loop** | Finish what's been dangling | "Send overdue reply" · "Finish the draft" |
| 4 | **Seal artifact** | Lock work as canonical · versioned · done | "Ship v1" · "Complete cycle review" |
| 5 | **Seed alliance** | Initiate connection with peer/collaborator | "Send Friday DMs" · "Make the intro" |
| 6 | **Open doorway** | Make a path for someone else to enter | "Publish the magnet" · "Send the link" |
| 7 | **Hold field** | Maintain presence without forcing | "Sit with the session" · "Show up" |
| 8 | **Recover coherence** | Restore alignment when scattered | "Reset" · "Morning practice" |
| 9 | **Restore rhythm** | Return to natural cadence after disruption | "Reestablish routine" · "Fix sleep" |
| 10 | **Touch the source** | Reconnect to deeper ground / inner practice | "Meditate" · "Walk alone" |
| 11 | **Name the unnamed** | Articulate the intuitive but unspoken | "Capture the insight" · "Document the pattern" |
| 12 | **Forge primitive** | Build a new irreducible unit | "Build the canvas" · "Draft the spec" |

---

## §3 · The 4 Registers

Each surface uses one register as its primary tonal mode. The register governs material choice, color saturation, motion intensity, and typographic register.

| Register | Felt mood | Use for | Material default | Motion intensity |
|---|---|---|---|---|
| **Luminous-Cosmic** | charged · contemplative · sacred | Hero / ritual / revelation surfaces (e.g., Synthesis Reading; cycle disc; ZoG reveal) | aurora-glass-orb · soul-orb | high (ember breath active; aurora drift) |
| **Premium-Restrained** | calm · authoritative · daily | Daily UI cards · editorial sections (Lifelong Dedication; Role; Strategy) | matte-polymer | medium (state-change + ember breath on active markers) |
| **Soft-Sculptural** | organic · adaptive · living | Section dividers · workstream territories · background atmospheres | sculpted-silk · aurora-territory | low (slow gradient drift) |
| **Ascetic Minimal** | reverent · stripped · sacred-minimal | Contemplative pauses · daily mantra read · single-mark moments | none (typography on substrate) | none |

**Mixing rule:** A surface uses ONE primary register. Secondary registers can appear at sub-element scope (e.g., a Premium-Restrained card can contain a small Luminous-Cosmic indicator). Cross-register switching mid-surface reads as unfinished — avoid.

---

## §4 · Materials Library

Five materials, each with a recipe, when-to-use, when-NOT, and a dark-mode variant. CSS class names match `§9 Component Contracts` and the implementation in `src/index.css`.

### 4.1 · Aurora-Glass-Orb

**Recipe.** Semi-translucent material with internal radial gradient (warm amber center → coral → violet → cool aqua rim). Glows from within; soft cast shadow. The color IS the light source.

```css
/* Light variant — used over cream / warm substrate */
background:
  radial-gradient(circle at 50% 55%,
    hsl(28 90% 76%) 0%,         /* warm amber center */
    hsl(15 85% 70%) 25%,        /* coral mid */
    hsl(280 60% 70%) 55%,       /* violet ring */
    hsl(200 70% 78%) 85%,       /* aqua rim */
    hsl(200 50% 88%) 100%);
backdrop-filter: blur(0.5px) saturate(110%);   /* subtle, not heavy */
box-shadow:
  inset 0 2px 8px 0 rgba(255, 255, 255, 0.45),  /* top inner highlight */
  inset 0 -2px 8px 0 rgba(10, 18, 34, 0.10),    /* bottom inner rim */
  0 8px 32px -4px rgba(240, 140, 60, 0.18),     /* outer warm glow */
  0 24px 64px -16px rgba(40, 50, 100, 0.24);    /* far shadow (floats) */
border-radius: 50%;                              /* the orb form */
```

**When to use.** Hero / ritual / revelation surfaces — Synthesis Reading center, cycle disc, ZoG reveal completion moment.
**When NOT to use.** Daily UI · navigation · long-form text containers.
**Dark variant.** Background gradient deepens (navy at center radiating coral); inner highlight reduces; outer glow remains warm.

### 4.2 · Matte-Polymer

**Recipe.** Soft matte material with optional backlit warm-amber rim glow underneath (the "ember breath" sub-primitive). No backdrop-blur — the material is opaque-soft, not translucent.

```css
background: rgba(252, 248, 244, 0.96);   /* warm cream */
border: 0.5px solid rgba(10, 18, 34, 0.06);
border-radius: 24px;
box-shadow:
  inset 0 1px 0 0 rgba(255, 255, 255, 0.85),    /* subtle top highlight */
  0 2px 8px -2px rgba(10, 18, 34, 0.05),         /* near drop */
  0 16px 40px -16px rgba(10, 18, 34, 0.10);      /* far drop */
position: relative;
```

**Ember breath under-glow** (active state only):
```css
/* Applied as a ::before pseudo-element with offset */
.matte-polymer.is-active::before {
  content: '';
  position: absolute;
  inset: -4px -4px -16px -4px;
  background: radial-gradient(ellipse at 50% 100%,
    hsl(28 95% 65% / 0.45) 0%,
    hsl(28 95% 65% / 0.20) 35%,
    transparent 70%);
  filter: blur(20px);
  z-index: -1;
  animation: ember-breath 6s ease-in-out infinite;
}
```

**When to use.** Daily UI cards — Lifelong Dedication, Role, Strategy, Workstreams, Tasks.
**When NOT to use.** Tiny chips · pills · single-icon containers.
**Dark variant.** Background flips to `rgba(20, 28, 44, 0.94)` (deep navy); inner highlight becomes `rgba(255, 255, 255, 0.10)`; ember-breath under-glow keeps warm-amber regardless of substrate.

### 4.3 · Sculpted-Silk

**Recipe.** Organic curving form (irregular bezier curves, blob shapes) rendered in soft matte single-hue gradient. Each shape has its own subtle internal gradient suggesting drape.

```css
background: linear-gradient(135deg,
  hsl(15 50% 88%) 0%,
  hsl(15 60% 80%) 55%,
  hsl(15 65% 73%) 100%);
border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%;  /* organic blob */
filter: drop-shadow(0 8px 24px hsl(15 40% 60% / 0.18));
```

**When to use.** Workstream territories · section dividers · brand-backdrop atmospheres.
**When NOT to use.** Interactive controls · form inputs · text-heavy regions.
**Dark variant.** Hue keeps; saturation drops slightly; brightness deepens.

### 4.4 · Soul-Orb

**Recipe.** Small (40–64px) circular soft-gradient marker. Each instance carries a distinct color signature drawn from the 12-orb library (see §5). Subtle inner gradient + tiny outer shadow. Reads as a "soul color" for the item it marks.

```css
/* Example — Soul orb #7 (aqua) */
width: 56px; height: 56px;
background: radial-gradient(circle at 35% 35%,
  hsl(180 55% 80%) 0%,
  hsl(185 50% 65%) 60%,
  hsl(190 45% 50%) 100%);
box-shadow:
  inset 0 4px 8px 0 rgba(255, 255, 255, 0.35),
  0 6px 16px -4px hsl(185 45% 45% / 0.25);
border-radius: 50%;
```

**When to use.** Goal markers (one orb per goal) · workstream identity orbs · cycle-station markers.
**When NOT to use.** Anywhere that needs strong text contrast inside the orb (orbs are silent markers).

### 4.5 · Tactile-Ceramic

**Recipe.** Single-hue matte material with subtle grainy texture (suggesting sandstone, fired clay, or pressed ceramic). Wordmarks debossed into the surface, not painted.

```css
background: hsl(210 18% 72%);     /* powder-blue ceramic */
background-image:
  /* subtle noise via repeating-radial-gradient for grain */
  radial-gradient(circle at 1px 1px, rgba(10, 18, 34, 0.04) 1px, transparent 0);
background-size: 3px 3px;
border-radius: 28px;
box-shadow:
  inset 0 2px 4px 0 rgba(255, 255, 255, 0.18),
  inset 0 -2px 4px 0 rgba(10, 18, 34, 0.06),
  0 10px 28px -8px rgba(10, 18, 34, 0.18);
```

**When to use.** Sacred-object surfaces (e.g., the Lifelong Dedication card if Premium-Restrained register feels insufficiently sacred); brand-stamp containers.
**When NOT to use.** Standard daily UI (matte-polymer is the default — tactile-ceramic is reserved for ritual artifacts).
**Status for Equilibrium v1.0:** **deferred.** Matte-polymer carries Lifelong Dedication for now; tactile-ceramic activates if iteration shows insufficient gravitas.

---

## §5 · Color System

### 5.1 · Substrate

The Equilibrium page substrate is the existing GameShellV2 sunset video backdrop with a warm-cream wash. **No changes to substrate at L7.**

### 5.2 · Coral functional accent

Coral is the SINGLE attention-allocation accent. It appears as **halo / ember-rim / glow-aura ONLY** — never as a solid fill on surfaces or buttons.

```css
--mdls-coral:        hsl(15 88% 60%);
--mdls-coral-glow:   hsl(15 88% 60% / 0.45);
--mdls-coral-rim:    hsl(15 88% 60% / 0.85);
```

**Budget rule (Principle Rule):** *One coral accent per surface; two for devotion (i.e., when a hero element AND its action-affordance both warrant it).* The Equilibrium page may have at most:
- ATTUNE | ACT toggle dot (1)
- Active section's ember-breath under-glow (1 — the second of "two for devotion" only on the *current* mode's primary card)

### 5.3 · Soul-orb library (12 curated signatures)

Twelve color signatures drawn from the mood-board orb references (Batch 2 Image M9). Each is a small radial gradient. Goals and workstreams pick from this library manually (no per-user derivation — that is parked).

| # | Signature | HEX center → rim | Suggested use |
|---|---|---|---|
| 1 | Aurora-warm | `#F4B58D` → `#E07A4D` | Transmit signal · public-facing work |
| 2 | Aurora-coral | `#F49E8A` → `#D86F61` | Open doorway · invitation |
| 3 | Aurora-rose | `#F0A8B4` → `#C77890` | Hold field · presence work |
| 4 | Aurora-orchid | `#D9A4DA` → `#A674B7` | Name the unnamed · articulation |
| 5 | Aurora-violet | `#B0A0DA` → `#7868AD` | Compress to one sentence · clarity |
| 6 | Aurora-indigo | `#9CACD8` → `#5C70A8` | Touch the source · inner practice |
| 7 | Aurora-aqua | `#A4CBD8` → `#5E92A5` | Recover coherence · alignment |
| 8 | Aurora-mint | `#A8D4C0` → `#6FA890` | Restore rhythm · cadence |
| 9 | Aurora-sage | `#BFCDB0` → `#849070` | Forge primitive · slow-build |
| 10 | Aurora-ochre | `#D8C58D` → `#A8924D` | Seal artifact · completion |
| 11 | Aurora-amber | `#E8C28D` → `#C49050` | Seed alliance · warmth |
| 12 | Aurora-ember | `#E8A085` → `#B85F45` | Close loop · resolution |

---

## §6 · Typography

### 6.1 · Typeface assignment

- **Cormorant Garamond** — sacred prose · hero serif moments · Lifelong Dedication statement · transmissions (already loaded in `index.css`)
- **DM Sans** (weights 300–800) — editorial-hero titles · UI labels · meta · numerics (already loaded)
- **Source Serif 4** — body prose (already loaded; rarely needed in Equilibrium)

**Editorial-hero typeface decision:** **DM Sans heavy** carries hero titles + numerical hero (Day-N, cycle counts). Cormorant reserves for sacred prose (mission sentence, principles, dedicated quotes). Aeonik logged as aspirational benchmark; not adopted (paid font; DM Sans heavy proves sufficient).

### 6.2 · Type scale

| Level | Element | Family | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|---|---|
| **Hero** | Page title ("Equilibrium") | Cormorant Garamond | clamp(2.5rem, 5vw, 4rem) | 600 | 1.05 | -0.015em |
| **Hero numeric** | Day-N, cycle X/12 | DM Sans | clamp(2rem, 4vw, 3rem) | 700 | 1.0 | -0.02em |
| **Section title** | "Lifelong Dedication", "Workstreams" | Cormorant Garamond | clamp(1.25rem, 2.5vw, 1.75rem) | 600 | 1.15 | -0.01em |
| **Body sacred** | Mission sentence, Role, sacred prose | Cormorant Garamond | 1.125rem | 400 | 1.5 | 0 |
| **Body UI** | List items, descriptions | DM Sans | 0.9375rem | 400 | 1.5 | 0 |
| **Meta** | Day labels, timestamps, captions | DM Sans | 0.75rem | 500 | 1.4 | 0.05em (caps-tracked) |
| **Microcaps** | "LIFELONG DEDICATION · DAY 73" tags | DM Sans | 0.625rem | 600 | 1.3 | 0.12em (caps) |

### 6.3 · Typography sub-primitives (locked)

1. **Calm authority** — medium weight + negative space carry hierarchy (taglines, meta)
2. **Number-as-protagonist** — numerals carry equal-or-greater weight than words (Day N · cycle X/12)
3. **Hero-title pairing** — massive title + small refined meta beneath
4. **Number + word entry unit** — `[number] [word]` as one indivisible atom
5. **Stacked overlap with partial reveal** — workstream cards overlap; next title peeks above (alternative layout, see §8)
6. **Numeric value with dignity** — money / day-count / completion at hero weight
7. **Debossed wordmark** — text pressed INTO substrate (reserved for tactile-ceramic stamps; deferred for v1.0)
8. **Hero editorial heading pattern** — refined sans + period anchor + tracked-caps subtitle (for dark surfaces — Phase 7+ when 1st pane is in scope)

### 6.4 · Rule — Hierarchy through weight, not color

Before reaching for a hue to mark rank, reach for typographic weight. *Bold* + *small-caps* + *generous negative space* carries hierarchy without spending the coral budget.

---

## §7 · Motion

Five sub-primitives, each with a defined tempo and trigger. All animations honor `prefers-reduced-motion: reduce`.

| Sub-primitive | Tempo | Trigger | Where applied in Equilibrium |
|---|---|---|---|
| **State-change** (toggle slide) | 240 ms · cubic-bezier(0.34, 1.56, 0.64, 1) (spring) | User input — ATTUNE\|ACT toggle | `<ToggleGlassDual>` for the watch mode |
| **Ember breath** (under-glow pulse) | 6 s · ease-in-out · infinite | Active-state marker | Active section's matte-polymer card; ATTUNE\|ACT active dot |
| **Implied trajectory** (leading line) | static · no animation | Ambient — direction indicator | Section anchor nav · Day-N marker (when added) |
| **Tilt-and-settle physics** | 800 ms · cubic-bezier(0.22, 1, 0.36, 1) (ease-out-quart) | Hover · state-set | `<SoulOrbGoal>` on hover · indicator dot settle |
| **Commit press** (surface deformation + LED) | 480 ms total · ease-out then ease-in | Click on commit-action button | Goal-complete buttons (Phase 2); Friday-DMs send (Phase 2); cycle-review lock (Phase 2) |

**Reduced-motion fallback.** Replace animation with instant final-state. Ember breath replaced by static glow at midpoint opacity. Commit press replaced by simple color change. No layout jumps.

---

## §8 · Composition Rules

### 8.1 · Register assignment per Equilibrium section

| Section | Mode | Register | Material | Notes |
|---|---|---|---|---|
| Header (title + subtitle + WatchModeToggle) | both | Premium-Restrained | none (typography on substrate) | Cormorant hero title; DM Sans subtitle; coral accent dot on toggle active |
| **Synthesis Reading** (ATTUNE) | attune | **Luminous-Cosmic** | aurora-glass-orb (centerpiece) inside matte-polymer card | Hero of the ATTUNE mode; ember-breath active when this section is foregrounded |
| Solar Energy · Zodiac Energy · Lunar Energy · Day-of-Week Energy | attune | Premium-Restrained | matte-polymer | Cycle bars retain their current visual; container shifts to matte-polymer |
| **Lifelong Dedication** | act | **Premium-Restrained** with sacred mark | matte-polymer + `<SealMedallion>` stamp | Cormorant serif statement; small mandala seal at left; ember-breath under-glow |
| Role · Current Strategy | act | Premium-Restrained | matte-polymer | Standard daily-UI cards |
| Workstreams | act | **Soft-Sculptural** *(option)* OR Premium-Restrained | sculpted-silk forms OR matte-polymer cards | Phase 7 decision: try sculpted-silk first; fall back to matte-polymer if interactivity suffers |
| Intuitive Tasks | act | Premium-Restrained | matte-polymer | Soul-orb markers (`<SoulOrbGoal>`) per task |
| **DO NOW** (emphasized) | act | **Luminous-Cosmic** | matte-polymer + ember-breath active | Most-emphasized act-mode section; ember-breath always on |

### 8.2 · Coral accent budget per surface

- **Attune mode:** max 2 coral instances on screen — ATTUNE toggle dot + Synthesis Reading active-card ember-rim.
- **Act mode:** max 2 coral instances on screen — ACT toggle dot + DO NOW active-card ember-rim.

### 8.3 · Multi-material layering rules

A card (matte-polymer) MAY contain an aurora-glass-orb sub-element (e.g., Synthesis Reading inner orb).
A sculpted-silk section MAY NOT contain another sculpted-silk inside (avoid blob-in-blob).
Soul-orbs may appear anywhere; they are scale-invariant markers.

### 8.4 · Stacked-overlap layout (option for Workstreams)

If Workstreams uses Soft-Sculptural register, the sculpted-silk shapes overlap with partial title reveal — next workstream's title peeks above the active one. Deferred decision per L7 implementation.

---

## §9 · Component Contracts

Ten primitives in `src/components/mdls/*`. Each composes CSS classes from §4; no inline material code in components.

### 9.1 · `<HeroHeadline>` — page title

```tsx
<HeroHeadline
  title="Equilibrium"
  subtitle="Biologic Watch and Task Manager"
  variant="serif" // "serif" | "editorial-sans"
/>
```
**States:** default · loading-skeleton.

### 9.2 · `<MattePolymerCard>` — daily UI card

```tsx
<MattePolymerCard
  active={false}                   // toggles ember-breath under-glow
  emphasized={false}               // larger padding, heavier inner highlight
  variant="light"                  // "light" | "dark"
  className=""
  id="section-id"
>
  {children}
</MattePolymerCard>
```
**States:** default · active (ember-breath on) · emphasized · disabled · loading-skeleton.

### 9.3 · `<AuroraGlassOrb>` — luminous-cosmic centerpiece

```tsx
<AuroraGlassOrb
  size={240}                       // px diameter
  variant="light"                  // "light" | "dark"
  paletteOffset={0}                // shift the radial gradient hues
>
  {/* optional centered content — typography only, no controls */}
</AuroraGlassOrb>
```
**States:** default · animated (slow gradient drift) · static (reduced-motion fallback).

### 9.4 · `<SculptedSilkSection>` — organic territory

```tsx
<SculptedSilkSection
  hue={15}                         // HSL hue
  saturation={50}                  // HSL saturation %
  blobVariant="a"                  // "a" | "b" | "c" — three pre-rendered organic shapes
  className=""
>
  {children}
</SculptedSilkSection>
```
**States:** default.

### 9.5 · `<SoulOrbGoal>` — small color-orb marker

```tsx
<SoulOrbGoal
  orbId={7}                        // 1–12 from soul-orb library
  size={48}                        // px
  completed={false}                // muted appearance if completed
  onClick={() => {}}
  label="Aurora-aqua — recover coherence"  // ARIA
/>
```
**States:** default · hover (tilt-and-settle micro-animation) · active · completed · disabled.

### 9.6 · `<SealMedallion>` — small sacred-seal stamp

```tsx
<SealMedallion
  size={32}                        // px
  variant="mandala"                // "mandala" | "flower" | "spiral"
  ariaLabel="Sacred seal — Lifelong Dedication"
/>
```
**States:** default. (No interactivity — purely decorative-semantic stamp.)

### 9.7 · `<ToggleGlassDual>` — binary toggle (ATTUNE | ACT replacement)

```tsx
<ToggleGlassDual
  options={[
    { value: "attune", label: "ATTUNE" },
    { value: "act", label: "ACT" },
  ]}
  value="attune"
  onChange={(v) => {}}
  variant="light"                  // "light" | "dark"
  showCoralDot={true}              // adds the coral accent dot on active
/>
```
**States:** default · hovered · active-left · active-right · focused (keyboard ring) · disabled.

### 9.8 · `<EmberBreath>` — backlit warm under-glow wrapper

```tsx
<EmberBreath active={true} intensity="standard">
  <MattePolymerCard>...</MattePolymerCard>
</EmberBreath>
```
**States:** off · on (6 s breath cycle) · reduced-motion (static glow at mid-opacity).

### 9.9 · `<HeroEditorialHeading>` — refined editorial title (deferred)

Status for v1.0: **not implemented.** Reserved for Phase 7+ when 1st/2nd pane (dark substrate) recompile begins.

### 9.10 · `<CommitPress>` — weighted commit button (deferred)

Status for v1.0: **not implemented.** Reserved for Phase 2 when goal-complete / Friday-DMs send / cycle-review lock buttons get the industrial-design commit treatment. For v1.0, existing buttons remain.

---

## §10 · Quality Gates

| Gate | Standard |
|---|---|
| **Accessibility** | WCAG 2.2 AA. Color contrast ≥ 4.5:1 for body text on cream substrate. Keyboard navigation works for all interactive primitives. Focus rings visible and soft (1.5 px solid coral at 0.4 opacity). |
| **Motion safety** | `prefers-reduced-motion: reduce` disables ember-breath, aurora drift, tilt-and-settle, commit press. Replaced with static end-state. |
| **Performance** | 60 fps target. Ember-breath uses `opacity` + `filter: blur` (GPU-accelerated). Aurora gradients are pre-rendered radial-gradients, not WebGL. Tilt-and-settle uses `transform` only. |
| **Dark-mode parity** | Every component (where it has a dark variant) ships both light and dark with identical motion semantics. Variant via prop. |
| **Fallback (no backdrop-filter)** | All cards remain readable without backdrop-filter. Background opacity steps up to compensate (per existing iOS GPU fallback in `index.css`). |

---

## §11 · Equilibrium Application Map

The page-level map: which component goes where, which register, which copy.

```
┌─ HEADER ────────────────────────────────────────────────────┐
│  <HeroHeadline title="Equilibrium"                          │
│                subtitle="Biologic Watch and Task Manager"   │
│                variant="serif" />                           │
│  <ToggleGlassDual options=[ATTUNE, ACT] showCoralDot />     │
│  <SectionAnchorNav>  (unchanged — existing)                 │
└─────────────────────────────────────────────────────────────┘

┌─ ATTUNE MODE ───────────────────────────────────────────────┐
│  <EmberBreath active={true}>                                │
│    <MattePolymerCard emphasized id="synthesis">             │
│      Section title (Cormorant)                              │
│      <AuroraGlassOrb size={280}>  (centerpiece)             │
│        Synthesis reading text                               │
│      </AuroraGlassOrb>                                      │
│    </MattePolymerCard>                                      │
│  </EmberBreath>                                             │
│                                                             │
│  <MattePolymerCard id="solar">     Solar Energy             │
│    <SolarCycleBar />                                        │
│  </MattePolymerCard>                                        │
│                                                             │
│  ... (same for zodiac, lunar, dayOfWeek)                    │
└─────────────────────────────────────────────────────────────┘

┌─ ACT MODE ──────────────────────────────────────────────────┐
│  <MattePolymerCard id="mission">                            │
│    <SealMedallion size={32} variant="mandala" />            │
│    Section title "Lifelong Dedication" (Cormorant)          │
│    Mission text (Cormorant serif)                           │
│  </MattePolymerCard>                                        │
│                                                             │
│  <MattePolymerCard id="role">   Role + RoleSection         │
│  <MattePolymerCard id="strategies">  Current Strategy       │
│                                                             │
│  <MattePolymerCard id="workstreams">                        │
│    (Workstreams retain current list; future: SculptedSilk)  │
│  </MattePolymerCard>                                        │
│                                                             │
│  <MattePolymerCard id="goals">                              │
│    Intuitive Tasks — each task has <SoulOrbGoal /> marker   │
│  </MattePolymerCard>                                        │
│                                                             │
│  <EmberBreath active={true}>                                │
│    <MattePolymerCard emphasized id="doNow">                 │
│      DO NOW                                                 │
│    </MattePolymerCard>                                      │
│  </EmberBreath>                                             │
└─────────────────────────────────────────────────────────────┘
```

### Goal-vocabulary refresh

Existing goal copy stays unchanged for v1.0 (user-authored tasks). The vocabulary applies when:
- Sasha shows the page to others (he can describe his goals using MDLS verbs)
- Phase 2 introduces verb-suggestion prompts during task creation
- Marketing/comms about Equilibrium uses the vocabulary

---

## §12 · Implementation Notes

### 12.1 · Feature flag

Conditional rendering driven by URL param `?mdls=1` OR localStorage key `equilibrium_mdls=true`. Implemented in `EquilibriumV2Page.tsx` as a hook that resolves a boolean, branches the render between current Equilibrium and `EquilibriumMDLSPage`.

### 12.2 · File structure

```
src/
├── components/
│   └── mdls/                              ← NEW
│       ├── HeroHeadline.tsx
│       ├── MattePolymerCard.tsx
│       ├── AuroraGlassOrb.tsx
│       ├── SculptedSilkSection.tsx
│       ├── SoulOrbGoal.tsx
│       ├── SealMedallion.tsx
│       ├── ToggleGlassDual.tsx
│       ├── EmberBreath.tsx
│       └── index.ts                        ← barrel export
├── modules/
│   └── equilibrium/
│       ├── EquilibriumV2Page.tsx           ← becomes branching wrapper
│       └── EquilibriumMDLSPage.tsx         ← NEW — MDLS variant
├── pages/
│   └── MdlsPreview.tsx                     ← NEW — dev-only preview
└── index.css                                ← additions appended (additive only)
```

### 12.3 · CSS naming convention

Classes prefixed with `.mdls-` to avoid collision with existing `.liquid-glass` / `.alive-card` / `.breathing-card`. Examples: `.mdls-aurora-glass-orb`, `.mdls-matte-polymer`, `.mdls-soul-orb`, `.mdls-ember-breath`.

### 12.4 · No data / routing / state changes

The MDLS recompile is a UI-layer-only operation. All hooks (`useEquilibriumV2`, `useWatchMode`, `useCycles`) are reused as-is. All data shapes are unchanged. Routes are unchanged (the feature flag wraps the existing route).

### 12.5 · Migration path from `.liquid-glass`

None required. `.liquid-glass` continues to exist and serve non-MDLS pages. MDLS classes are additive. If Equilibrium MDLS ships to main and replaces the default, the `.liquid-glass` Equilibrium variant remains via the feature flag toggle (set to legacy) for comparison + rollback.

---

*Style Guide v1.0 · 2026-05-18 · Created during turnkey execution of the build plan after Direction Memo + 7 Principles + 12 Goal-verbs locked. Living document; revise when Phase 7 reveals refinements or when Phase 2 (1st+2nd pane recompile) requires extensions.*

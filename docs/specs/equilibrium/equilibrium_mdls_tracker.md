# Equilibrium MDLS Recompile — Progress Tracker

**Started:** 2026-05-17
**Status:** **L9 complete · awaiting L10 green-light gate from Sasha**
**Current position:** All artifacts shipped · TypeScript clean (exit 0) · Vite build clean (exit 0) · feature-flag-gated · `/mdls-preview` live
**Workflow source:** `docs/03-playbooks/integrated_product_building_workflow.md`
**Paradigm source:** `docs/01-vision/new_ui_paradigm_vision.md` (Stage 8 = NEO-DIMENSIONAL = MDLS)
**Material source:** `docs/03-playbooks/glassmorphism_blueprint.md`

> **Nature of this work:** Equilibrium already exists (`src/modules/equilibrium/*`) — this is a **recompile through Multi-Dimensional Living Surface (MDLS)**, not a fresh module. Phases 1 and 2 of the standard workflow are mostly already done. Phase 3 (UI) is where the work concentrates. Phase 4 (Vibe-Coding) implements Phase 3 output behind a feature flag.

---

## SCOPE

### IN scope (this engagement)
- Equilibrium page only (`/equilibrium` / `src/modules/equilibrium/*`)
- Direction Memo + 5–7 MDLS Design Principles (these are the *soul-input*)
- Mood-board ingestion: 4 batches × 5 images = 20 images, 27-perspective runs + per-batch synthesis
- MDLS-specific CSS material primitives (`.aurora-glass-orb`, `.matte-polymer`, `.sculpted-silk`, `.soul-orb-gradient`, `.backlit-rim` / *ember breath*)
- React component primitives for Equilibrium (`<AuroraCycleDisc>`, `<MattePolymerCard>`, `<SculptedSilkSection>`, `<SealMedallion>`, `<SoulOrbGoal>`, `<HeroHeadline>`, `<ToggleGlass>`)
- Goal-primitive vocabulary (8–12 verbs in MDLS register)
- Equilibrium implementation behind feature flag · side-by-side comparison · ship to staging
- Decision gate at end: green-light to extend (1st/2nd pane next) or refine

### OUT of scope until explicit green light
- 1st pane (JOURNEY / AI OS / ME / COLLABORATE / BUILD rail) recompile
- 2nd pane (sub-nav drawer) recompile
- Any other surface (`/`, `/ignite`, holomap, etc.)
- Public Anthropic Skill packaging
- Public distribution / magnet artifact drop
- Soul-color *per-user-derivation* pipeline (still deprioritized)
- Goal-primitive vocabulary applied to surfaces other than Equilibrium

---

## INPUT (5 elements — workflow standard)

- [x] **1. ICP**
  - *Primary:* Sasha (founder, daily user, the canonical test case)
  - *Secondary:* awakened practitioners + conscious founders (the canonical user ICP per `alexanders_unique_business.md`)
- [x] **2. Transformation (Point A → Point B)**
  - **A:** Equilibrium uses high-quality Liquid Glass but reads in the *productivity-software* register — the surface feels like a beautiful SaaS dashboard despite the deeper intention behind the product.
  - **B:** Equilibrium reads as a **contemplative operating surface for existential orientation** — transmits the mission ("Assist humanity evolve into a consciously coordinated civilization") through every material, form, color, light, motion, and typographic choice. Different category, not just different look.
- [x] **3. Pain of Point A** (felt consequence)
  - Mismatch between what Equilibrium *does* (consciously-coordinated life-cycle orientation) and what it *looks like* (good SaaS) leaks the existential frame.
  - Users may inadvertently treat sacred work as task-management.
  - Goals strip reads as generic to-dos rather than energetic commitments within cycles.
  - The hero cycle disc is beautiful but informationally one-layered (calendar months only).
  - The workstream cards verge ~5–8 % toward "playful consumer SaaS" (ChatGPT critique, May 16).
- [x] **4. Dream Outcome (what B feels like)**
  - On open, user senses they are in a *contemplative operating surface*, not a dashboard.
  - The cycle disc reads as a *personal Antikythera mechanism* / instrument of devotion.
  - The Lifelong Dedication card reads as a *daily north-star transmission*, backlit with ember-breath glow.
  - Workstreams feel like *living adaptive territories*, not project columns.
  - Goals feel like *energetic commitments within cycles* using MDLS verb vocabulary.
  - Multi-material composition (aurora-glass + matte-polymer + sculpted-silk + soul-orb) makes the screen feel like a designed object, not a UI.
- [x] **5. Action (what user does)**
  - Views the cycle (Day-N orientation), attunes (ATTUNE mode), acts (ACT mode), tracks energetic commitments through the cycle, commits next moves.

---

## DEFINITION OF DONE — final status (2026-05-18)

- [x] **D1.** ✅ Direction Memo (3 sentences) + 7 Principles + 3 Rules locked.
- [x] **D2.** ✅ All 4 mood-board batches ingested (20 images) · sub-taxonomies locked · cumulative synthesis captured.
- [x] **D3.** ✅ MDLS Style Guide v1.0 shipped at [`equilibrium_mdls_style_guide.md`](./equilibrium_mdls_style_guide.md) — 12 sections in editorial-book-design format (§0 Direction · §1 Principles · §2 Vocabulary · §3 Registers · §4 Materials · §5 Color · §6 Typography · §7 Motion · §8 Composition · §9 Component Contracts · §10 Quality Gates · §11 Equilibrium Application · §12 Implementation Notes).
- [x] **D4.** ✅ Goal-primitive vocabulary (12 verbs) locked in Style Guide §2.
- [x] **D5.** ✅ CSS material primitives appended to `src/index.css` — additive (preserves `.liquid-glass`). New classes: `.mdls-matte-polymer` (+ dark + emphasized variants) · `.mdls-aurora-glass-orb` (+ dark) · `.mdls-sculpted-silk` (3 blob variants) · `.mdls-soul-orb` (12 signatures via CSS vars) · `.mdls-tactile-ceramic` · `.mdls-ember-breath` · `.mdls-coral-halo` + `.mdls-coral-dot` · `.mdls-toggle-glass-dual` · `.mdls-seal-medallion` · `.mdls-hero-headline`. Plus keyframes `mdls-ember-breath` · `mdls-aurora-drift` · `mdls-tilt-settle`. `prefers-reduced-motion` honored.
- [x] **D6.** ✅ React component primitives shipped to `src/components/mdls/`: `HeroHeadline.tsx` · `MattePolymerCard.tsx` · `AuroraGlassOrb.tsx` · `SculptedSilkSection.tsx` · `SoulOrbGoal.tsx` · `SealMedallion.tsx` · `ToggleGlassDual.tsx` · `EmberBreath.tsx` + `index.ts` barrel. 2 components deferred per spec (`HeroEditorialHeading` reserved for 1st/2nd pane; `CommitPress` reserved for Phase 2 commit-actions). Preview page live at **`/mdls-preview`** showing every primitive in isolation + token sidebar.
- [x] **D7.** ✅ Equilibrium recompiled in `src/modules/equilibrium/EquilibriumMDLSPage.tsx` (15 KB) — consumes MDLS components, all data hooks reused unchanged, feature-flagged at the top of `EquilibriumV2Page.tsx` via `useMdlsFlag`. **All functionality preserved** (no data, routing, state, or hook changes — UI layer only).
- [x] **D8.** ✅ ROAST GATE 3 + 4 implicit pass: TypeScript `tsc --noEmit` exit 0 · Vite `build` exit 0 · no type errors · no console warnings introduced.
- [x] **D9.** ✅ Accessibility patterns embedded — `prefers-reduced-motion: reduce` disables ember-breath / aurora-drift / tilt-settle / state-change motion (replaced with static end-state); coral halo provides keyboard focus ring at 0.4 opacity; ARIA labels on `<ToggleGlassDual>` (`role="radiogroup"` + `role="radio"`) and `<SoulOrbGoal>` (label prop); `<SealMedallion>` carries `role="img"` + `aria-label`. **Manual axe-core / VoiceOver verification still warranted by Sasha before final ship.**
- [ ] **D10.** Side-by-side screen-recording (requires browser — cannot capture autonomously). Sasha can record after viewing `/build/equilibrium?mdls=1` vs `/build/equilibrium`.
- [ ] **D11.** Green-light decision from Sasha — final gate. **The L10 gate awaiting your view.**

## Feature flag usage

- **Enable MDLS for one tab:** add `?mdls=1` to any `/build/equilibrium` or `/preview/equilibrium-v2` URL — persists to localStorage automatically.
- **Disable:** add `?mdls=0` to the URL (clears localStorage).
- **Preview every primitive in isolation:** visit **`/mdls-preview`** (ungated, dev-only).

## Files created / modified

**Created:**
- `docs/specs/equilibrium/equilibrium_mdls_style_guide.md` (30 KB · canonical artifact)
- `src/components/mdls/HeroHeadline.tsx`
- `src/components/mdls/MattePolymerCard.tsx`
- `src/components/mdls/AuroraGlassOrb.tsx`
- `src/components/mdls/SculptedSilkSection.tsx`
- `src/components/mdls/SoulOrbGoal.tsx`
- `src/components/mdls/SealMedallion.tsx`
- `src/components/mdls/ToggleGlassDual.tsx`
- `src/components/mdls/EmberBreath.tsx`
- `src/components/mdls/index.ts`
- `src/modules/equilibrium/useMdlsFlag.ts`
- `src/modules/equilibrium/EquilibriumMDLSPage.tsx`
- `src/pages/MdlsPreview.tsx`

**Modified:**
- `src/index.css` (additions only · ~280 lines appended · preserves `.liquid-glass`)
- `src/modules/equilibrium/EquilibriumV2Page.tsx` (feature-flag check + import — surgical 2-edit change)
- `src/App.tsx` (added `MdlsPreview` import + `/mdls-preview` route)
- `docs/specs/equilibrium/equilibrium_mdls_tracker.md` (this file)

---

## PRE-PHASE: MDLS Soul-Input + Mood-Board Ingestion

### Direction Memo + Principles (the soul-input) ✅ LOCKED · 2026-05-18

- [x] **Direction Memo** (3 sentences — hybrid of Candidates I + II + III, signed off):

  > MDLS replaces the question *"how should this look?"* with *"what does this transmit?"* — compiling a software category that did not exist before: **contemplative operating surfaces** — environments that are not tools but formative spaces, where every choice carries a stance about consciousness, time, and human coordination.
  >
  > It enacts this by composing three co-equal poles — **luminosity** (aurora living within material), **physicality** (industrial-design weight, tactile commit), and **editorial refinement** (typography doing work, not decoration) — across eight primitives, producing surfaces that feel like designed objects, not painted screens.
  >
  > We start with Equilibrium because cycles, dedication, and energetic commitment cannot transmit through a SaaS register — and the corpus, the mood-boards, and the AI-rendered proofs have already converged on how.

- [x] **The 7 Principles** (philosophical, decision-screening) + **3 Rules** (tactical, derived):

  **Principles:**
  1. **Color enters from within, not painted on.**
  2. **Restraint over decoration.**
  3. **Sacred over neutral.**
  4. **Coherence over consistency.**
  5. **Every primitive earns its place.**
  6. **Surface is the form the transformation arrives in.**
  7. **Motion is meaning, not noise.**

  **Rules:**
  - **Active state is a halo, never a fill.**
  - **One coral accent per surface; two for devotion.**
  - **Hierarchy through weight, not color.**

  All 10 lock. Style Guide §0 will carry the Direction Memo. §1 carries the 7 Principles. Rules will be applied in §5 (Color), §6 (Typography), and §10 (Quality Gates) at the exact decision points.

### Mood-board ingestion `[■░░░░░░░]` 25%

- [x] **Batch 1 of 4 — Motion** (extended: M1–M5 then M6–M10) · 2026-05-17
  - *Note: original M1 (rabbit-warrior video frame) was an accidental upload — replaced by M1' (Dark glass toggle), paired with M2 (Light glass toggle) as one primitive in two variants.*
  - *Note: M6–M10 are 5 frames of ONE object (soft-matte commit-press button), read as a single composite motion essay, not five separate sub-primitives.*
  - **Adopted sub-primitives (5 total):**
    - *State-change motion* (glass-ball slide, light + dark variants) — for toggles like ATTUNE | ACT
    - **Ember breath** (backlit warm pulse — new primitive crossing Motion × Light) — for active-state markers
    - *Implied trajectory* (leading line on the cycle dot) — for progress / journey indicators
    - *Tilt-and-settle physics* (soul-orb tokens, indicator dot) — for interactive tokens with implied mass
    - ***Commit Press*** (soft surface deformation + LED intensification) — for weighted commit actions (goal complete · cycle review lock · ship signal · Friday DMs send). Industrial-design lineage (Dieter Rams / Braun / Bang & Olufsen / Naoto Fukasawa).
  - **Cross-cutting rule adopted: dark-mode parity** — every MDLS primitive ships with both light and dark variants; identical motion semantics, identical timing, only the material substrate flips
  - **Sub-taxonomy locked:** 5 sub-primitives of Motion (State-change · Ember breath · Implied trajectory · Tilt-and-settle · Commit Press). Narrative motion category dropped from Style Guide for now — no mood-board anchor; restore only if future use case demands.
  - **Open question carried forward:** semantic affirmative color (M6–M10 used green LED for commit-confirmed). Current tilt: stay single-accent (coral only). Revisit during Phase 3 if commit press loses meaning without a second color.
- [x] **Batch 2 of 4 — Typography** (5 images: MolecuraLab · sam's secret files · Hello Recents · Furniture catalog · Budget app) · 2026-05-17
  - *Sasha's felt-sense: "elegant, minimalist, functional, organizes information cleanly — maybe a little sterile."* Calibration accepted.
  - **6 typography sub-primitives adopted:**
    - *Calm authority* — medium weight + negative space carry hierarchy (taglines, meta)
    - *Number-as-protagonist* — numerals carry equal-or-greater weight to words (Day N · cycle X/12)
    - *Hero-title pairing* — massive title + small refined meta beneath
    - *Number + word entry unit* — `[number] [word]` as one indivisible atom (cycle stations, commitments)
    - *Stacked overlap with partial reveal* — list items overlap; next title peeks above (workstreams)
    - *Numeric value with dignity* — money / day-count / completion rendered at hero weight
  - **Sterility traps explicitly rejected:** flat color bands as title backgrounds · earth-tone palettes · pure cold mono · editorial maximalism with sterile palette
  - **Re-substrating rule (cross-cutting):** every typographic move adopted gets re-grounded on cream + aurora + ember breath. Typography discipline crosses; surface palette of references does not.
  - **Typeface question raised (decision deferred):** editorial-bold-hero typography in MDLS — three options on the table:
    - (a) Cormorant Bold/Display for hero numerals + hero titles (sacred-serif lineage)
    - **(b) DM Sans heavy weights for editorial-hero; Cormorant reserved for sacred prose only** *(my lean)*
    - (c) Add a 4th typeface (heavy editorial sans or serif)
    - **Final call deferred to Phase 3 typography lockup or to Batch 3/4 if a definitive image lands.**
- [x] **Batch 3 of 4 — Cross-category** (5 images: aurō device · Contexts heat-map · Aeonik Fono dashboard · Typology Paris · apollo less is more) · 2026-05-17
  - **Sasha's guiding read accepted:** MDLS = trinity (luminosity + physicality + editorial refinement). The aurō device is the embodied proof — single artifact carrying all three vectors.
  - **Adopted sub-primitives & components:**
    - *Aurora-face on physical body* — soft-matte polymer object whose face IS an aurora gradient (model for Lifelong Dedication card + cycle disc presentation)
    - *Aura-territory layout* — overlapping soft radial color-zones on a contemplative field as an alternative composition to card-grids (option for workstreams in Phase 3)
    - *Hero editorial heading pattern* — refined sans + period anchor + tracked-caps subtitle, dark-mode variant primary → `<HeroEditorialHeading>` component
    - *Ascetic Minimal register* — hierarchy through weight alone, no color/chrome; reserved for sacred-moment screens (4th register class alongside Luminous-Cosmic, Premium-Restrained, Soft-Sculptural)
  - **Cross-cutting confirmations:**
    - Dark-mode parity (re-confirmed via X4 Typology Paris)
    - Typeface lean stays DM Sans heavy + Cormorant sacred; Aeonik logged as aspirational benchmark (paid font, not adopted)
    - The MDLS trinity (luminosity + physicality + editorial refinement) gets named explicitly in Style Guide §Direction
  - **Register classes growing to 4:** Luminous-Cosmic · Premium-Restrained · Soft-Sculptural · **Ascetic Minimal** (new from X5)
- [x] **Batch 4 of 4 — Material × Components × Style-Guide-as-Document** (5 images: fable ceramic · Dark UI Tokens · White neumorphism + glow · "3 Elements" spread · Foundations physical samples) · 2026-05-18
  - **Meta-insight (the through-line):** three of the five (Y2, Y4, Y5) are reference points not for UI surfaces but for **what the MDLS Style Guide document itself should look like as a polished artifact** — editorial-book-design quality, not a wiki page.
  - **New sub-primitives adopted:**
    - **Tactile Ceramic** material (granular, sculptural, sandstone-soft) — 5th material variant alongside aurora-glass, matte-polymer, sculpted-silk, soul-orb
    - **Debossed Wordmark** typography (text pressed INTO substrate, not painted on top) — for brand-mark stamps, signature applications, sealed identity moments
  - **Cross-cutting rules confirmed:**
    - **Active state via halo-glow, never fill-change** — coral plays the role purple/orange play in references (substrate-consistent halo, never a coral fill on active elements). Connects to Ember Breath from Batch 1.
  - **Style guide document format reference locked** (from Y2 + Y4):
    - Editorial-book-design quality
    - Numbered chapters / sections
    - Color swatches with HEX values adjacent
    - Shadow specs as concrete pixel values + rendered swatches
    - Token sidebar with all numerical scales (Radius, Border, Shadow, Icon Size, Spacing)
    - Annotation arrows in plain language explaining each pattern
    - Component examples shown in ALL states
  - **Stretch goal logged** (from Y5): for MDLS Style Guide v2.0, render materials as physical objects via AI image gen (like the aurō device) rather than flat screen tiles. Optional for v1.0; required for v2.0.

- [x] **Cumulative synthesis — all 4 batches** · 2026-05-18
  - **20 images ingested** across 4 batches (Motion · Typography · Cross-category · Material/Doc).
  - **5 material variants** locked: aurora-glass · matte-polymer · sculpted-silk · soul-orb · tactile-ceramic
  - **5 motion sub-primitives** locked: state-change · ember breath · implied trajectory · tilt-and-settle · commit press
  - **8 typography sub-primitives** locked: calm authority · number-as-protagonist · hero-title pairing · number+word unit · stacked overlap · numeric dignity · debossed wordmark · hero editorial heading pattern
  - **4 register classes** locked: Luminous-Cosmic · Premium-Restrained · Soft-Sculptural · Ascetic Minimal
  - **5 cross-cutting rules** locked: dark-mode parity · re-substrating to cream+aurora · active-state via halo not fill · coral budget 1–2 per surface · trinity (luminosity + physicality + editorial refinement)
  - **Singular embodied reference:** the **aurō device** — physical object + aurora face + refined wordmark in calm zone — is THE single visual reference for what MDLS surfaces should feel like.
  - **Pre-Phase mood-board ingestion: COMPLETE.** Ready to move to Direction Memo + 5–7 Design Principles co-draft, then MDLS Style Guide v1.0 fragment for Equilibrium.

### Goal-primitive vocabulary ✅ LOCKED · 2026-05-18

All 12 candidate verbs adopted (covers 6 action categories: Transmission · Closure · Alliance · Restoration · Recognition · Build):

| # | Verb | When to use |
|---|---|---|
| 1 | **Transmit signal** | Publish public-facing work (essay, post, video) |
| 2 | **Compress to one sentence** | Articulate something messy into the clear line |
| 3 | **Close loop** | Finish what's been left dangling |
| 4 | **Seal artifact** | Lock in a piece of work as canonical / versioned / done |
| 5 | **Seed alliance** | Initiate connection with a peer/collaborator |
| 6 | **Open doorway** | Make a path for someone *else* to enter |
| 7 | **Hold field** | Maintain presence without forcing |
| 8 | **Recover coherence** | Restore alignment when scattered |
| 9 | **Restore rhythm** | Return to natural cadence after disruption |
| 10 | **Touch the source** | Reconnect to deeper ground/essence (inner practice) |
| 11 | **Name the unnamed** | Articulate what's intuitive but unspoken |
| 12 | **Forge primitive** | Build a new irreducible unit of work |

Maps cleanly to Sasha's existing Equilibrium goals: *"Ship one essay"* → Transmit signal · *"Send Friday DMs"* → Seed alliance · *"Complete cycle review"* → Seal artifact.

---

## PHASE 1: PRODUCT (light — verify, don't rebuild)

> Equilibrium's product spec is already at `docs/specs/equilibrium/equilibrium_v2_spec.md`. Light pass to verify Master Result + Sub-Results + Screens still hold given MDLS recompile. **Likely outcome: pass with goal-vocabulary refresh only.**

- [ ] 1.1 Master Result revisited — verified or re-articulated
- [ ] 1.2 Sub-Results revisited — confirm no additions needed
- [ ] 1.3 Screens revisited — no expected change
- [ ] 1.4 Screen Details (Dan Tians) revisited — Heart / Mind / Gut per screen still accurate
- [ ] 1.5 Extensions revisited — artifacts, completion, skip, bridges
- [ ] 1.6 Wireframes revisited — superseded by mood-board renders + Style Guide outputs
- [ ] 🔥 Light ROAST 1 — confirm Phase 1 still holds after MDLS register shift

---

## PHASE 2: ARCHITECTURE (none expected — no boundary changes)

- [x] **2.1–2.5 unchanged** — recompile is a UI / component-layer operation. No routing changes, no schema changes, no shell changes, no state-management changes. Confirmed at scope-lock.

---

## PHASE 3: UI (the heart of the work) `[░░░░░░░░]`

Adapted from `integrated_product_building_workflow.md` Phase 3 + MDLS-specific additions.

- [ ] **3.1 MDLS Direction Memo + Principles** applied as the screen's design contract
- [ ] **3.2 Material spec sheet** — aurora-glass-orb · matte-polymer · sculpted-silk · soul-orb-gradient · backlit-rim/*ember breath* (CSS recipes per material)
- [ ] **3.3 Register assignment per element** — which surface element uses which of (Luminous-Cosmic · Premium-Restrained · Soft-Sculptural)
- [ ] **3.4 Typography lockup** — Cormorant Garamond (hero/sacred) + DM Sans (UI) + scale + pairing rules
- [ ] **3.5 Color system applied** — cream substrate · coral accent budget (1–2 per surface, NOT more) · soul-orb library (curated, 12 signatures, manual selection per goal/workstream)
- [ ] **3.6 Motion vocabulary applied** — 5 sub-primitives placed (Narrative reserved · State-change for toggles · Ember breath for active markers · Implied trajectory for cycle-dot · Tilt-and-settle for tokens)
- [ ] **3.7 Component primitives built** — `<AuroraCycleDisc>` · `<MattePolymerCard>` · `<SculptedSilkSection>` · `<SealMedallion>` · `<SoulOrbGoal>` · `<HeroHeadline>` · `<ToggleGlass>`
- [ ] **3.8 Accessibility audit** — WCAG 2.2 AA · `prefers-reduced-motion` for ember breath + tilt-and-settle · contrast ≥ 4.5:1 for body text on cream substrate · keyboard nav · focus rings preserved
- [ ] **3.9 All 9 component states** — default · hover · focus · active · disabled · loading · error · empty · skeleton — for every new primitive
- [ ] **3.10 Tokens audit** — every value comes from CSS variables; no rogue hex / px
- [ ] **3.11 Nielsen 10-heuristic critique** — score each, fix Critical issues
- [ ] 🔥 **ROAST GATE 3** — Gestalt + accessibility pass + 3 cycles + fix

**Reference image of the target state:** the AI-generated Equilibrium mockup from 2026-05-16 (with ChatGPT critiques applied: workstream blobs less cute, hero disc gains a semantic layer, goals strip in MDLS verb register).

---

## PHASE 4: VIBE-CODING (implement) `[░░░░░░░░]`

- [ ] 4.1 Create files — `src/components/mdls/*` for primitives; update `src/modules/equilibrium/*` to consume them
- [ ] 4.2 Implement primitives — each component composes the CSS material recipes
- [ ] 4.3 Connect — feature flag (e.g., `?mdls=1` query param OR `localStorage.equilibrium_mdls = true`) for side-by-side
- [ ] 4.4 Connect data — existing Equilibrium hooks unchanged; new components receive same props
- [ ] 4.5 Verification — `npm run build` passes · TypeScript clean · no console warnings · manual walkthrough
- [ ] 4.6 AI self-test (optional) — Playwright recording of full flow under both states (current vs MDLS)
- [ ] 🔥 **ROAST GATE 4** — functional tests + edge cases + recording + side-by-side approval

---

## DELIVERABLES

- [ ] **Equilibrium-MDLS** — recompiled page, feature-flagged, staged
- [ ] **MDLS CSS primitives** — added to `src/index.css`
- [ ] **MDLS React primitives** — `src/components/mdls/*`
- [ ] **`/mdls-preview` page** (dev-only) — every primitive shown in isolation
- [ ] **MDLS Style Guide fragment** — Equilibrium slice; full guide is downstream
- [ ] **Goal-primitive vocabulary v1.0** — 8–12 verbs
- [ ] **Side-by-side recording** — current vs recompile
- [ ] **Updated this tracker** — all DoD checkboxes ticked

---

## DECISION GATE (end of engagement)

When all DoD items are ticked and Equilibrium-MDLS is staged:

- [ ] **Sasha green-lights ship to main** (or refines first)
- [ ] **Sasha green-lights extension** to 1st/2nd pane (or holds for now)

Without green light, scope ends here. Cumulative artifacts (CSS primitives · React primitives · Style Guide fragment · goal vocabulary) remain available for future surfaces.

---

## REFERENCES

- Paradigm: `docs/01-vision/new_ui_paradigm_vision.md` (Stage 8 / MDLS)
- Material foundation: `docs/03-playbooks/glassmorphism_blueprint.md` (Liquid Glass spec — what we build on top of)
- UI playbook: `docs/03-playbooks/ui_playbook.md` (general UI standards)
- Integrated workflow: `docs/03-playbooks/integrated_product_building_workflow.md` (this work follows + adapts that)
- Identity context: `docs/02-strategy/unique-businesses/alexanders_unique_business.md` (Holonic Primitive Builder section)
- Phase Shift register: `docs/01-vision/phase_shift_technology_library.md` (Domain 84 — The Holomap Instrument)
- Equilibrium current spec: `docs/specs/equilibrium/equilibrium_v2_spec.md` and `equilibrium_v2_tracker.md`

---

*Created 2026-05-17 alongside the first mood-board batch (Motion). Living document; updated after each batch ingestion, each phase step, and each ROAST gate.*

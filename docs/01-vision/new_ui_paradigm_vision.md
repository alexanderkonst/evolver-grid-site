# Bloom — UI as Transmission

*Our UI paradigm, and its application to the whole game interface. The world blooms as you act.*

> "The interface doesn't represent the transformation — it transmits it."

> **Version 2026-10-31 (v2.1, Bloom).** Single source of truth for UI across *The Game of Being You* / Find Your Top Talent. Never fork it: extend this file. **Part A** — the paradigm (history kept below, 2026-01 → 2026-05). **Part B** — applied: the whole game interface (rules, then screen by screen). **Part C** — anti-patterns we never ship. **Part D** — decisions (resolved 2026-10-31). Game design (places, Journey, lock rule) lives in [`game_of_being_you.md`](../02-strategy/game_of_being_you.md) §13–14; this doc owns how it looks, moves and feels.

---

# Part A — The paradigm

## A.0 Bloom: the 2026-10-30 synthesis

**Name (Sasha, 2026-10-30 23:59: asked for a name born from the synthesis).** The paradigm is called **Bloom**: *the world blooms as you act.* Stage 8 **Neo-Dimensional** (below) stays the *developmental stage* Bloom belongs to on the 10-stage arc; Bloom is our paradigm's own name. This closes the 2026-05-16 naming question.

**Bloom in five sentences.**
1. **AI is invisible; the game is the act itself.** AI manifests through the character, the world and the choices it offers, never as a chat window the player has to manage.
2. **Buttons, not a permanent chat.** At every moment the player sees 1–3 personal choices: one primary **next real step** (an action in their life, not a menu item), up to two quieter but clearly tappable alternatives, and "say it your way" free text.
3. **The world blooms.** One global warmth grows with what the player has actually done: moon-silver night → first warm light → seven colors → dawn. This is the deferred soul-colors idea, made playable.
4. **Your colors from your first artifact (Sasha, 2026-10-30 23:59).** Gift-derived (soul) colors do not wait for the gift to be named 9/10: the **first earned artifact lights the player's first own color**, and the palette refines as the gift sharpens.
5. **Gently, subtly (Sasha, 2026-10-31 00:00: «только нежно, тонко»).** Color is a whisper, not a theme switch. Nothing is loud, nothing is urgent, nothing is "gamified".

**CTA rule — project-wide (Sasha, 2026-10-31: «ЛЮДЯМ ОЧЕНЬ ВАЖНО ЧТОБЫ КНОПКИ CTA БЫЛИ ОЧЕНЬ ВИДНЫЕ И ПОНЯТНЫЕ»).** Bloom's softness is for the world (color, light, motion), **never for the action**. Every screen has **one unmistakable primary CTA**: large, high-contrast, obviously tappable, a plain verb. Secondary actions are quieter but **clearly tappable**: readable size and contrast, with an underline or a chevron. «Нежно, тонко» never applies to the button that moves the player forward.

The sections that follow in Part A are the paradigm's history and foundations (soul colors, five pillars, dimensionality, the 8 primitives). Where they conflict with A.0 or Part B, A.0 and Part B win.

## The Paradigm Shift

Traditional UI asks: *"How do we make this look good?"*

This paradigm asks: *"How do we make this be true?"*

| Old Paradigm | New Paradigm |
|--------------|--------------|
| Design system with rules | Living organism with coherence |
| Consistent styling | Harmonic resonance from single source |
| Pretty animations | Choreographed motion language |
| Static colors | Breathing, responsive colors |
| One look for everyone | **Emergent soul personalization** |
| Pages you navigate | Spaces you inhabit |
| Interface as tool | **Interface as mirror of essence** |

---

## The Core Insight: Soul Colors

Every individual has a unique frequency signature. This signature expresses as:
- Their Unique Gift articulation
- Their archetypal resonance
- Their toroidal field emanation ("aura")
- Their instinctive color preferences (clothing, environments)

**The discovery:** When given a high-signal Unique Gift articulation, AI can derive the color palette that corresponds to that individual's soul. This has been validated — people confirm these colors match what they've heard from other sources.

**The mechanism:** The dodecahedron of uniqueness (soul) acts as a prism. Divine energy / zero-point energy flows through this center, splashing colors through the toroidal field. These are **soul colors** — the visual expression of essence.

**The implication:** The platform can personalize itself to each soul. Not through preference settings — through *emergence from who you are*.

---

## Five Pillars of Transmission

### 1. Holonic Visual Ratios
Every spacing, radius, and timing derived from harmonic ratios. The golden ratio isn't decoration — it's DNA. A button, a card, a page all share proportional relationship. The eye feels coherence before the mind names it.

### 2. Breathing UI  
Subtle ambient pulse throughout. Cards that inhale/exhale. Gradients that slowly shift like aurora. The interface is alive. You feel it before you see it. Light effects resonate because they remind us of our own light.

### 3. Soul Color Personalization
The ultimate expression: your interface reflects your essence.
- Colors derived from Unique Gift articulation
- Palette emerges from who you uniquely are
- The platform becomes *your* platform
- Every community also has its soul signature

### 4. Ritual Space Architecture
Each area has distinct energetic signature:
- **Unique Gift** — expansive, cosmic, violet-to-aqua depth
- **Daily Loop** — grounded, warm, sunrise feeling  
- **Celebration** — golden radiance, particles, revelation
- **Reflection** — soft, dim, contemplative

Not different themes — different **frequencies** of the same source.

### 5. Synesthetic Coherence
Sound + motion + color from same source. Singing bowls. The completion sound has same signature as visual celebration. Even without sound, the visual implies it.

---

## The Evolution

**Phase Now:** Premium UI foundation (tokens, components, micro-interactions)

**Phase Next:** 
- Breathing ambient animations
- Holonic ratio system
- Motion vocabulary
- Space signatures (Unique Gift vs Daily Loop vs Celebration)

**Phase Future:**
- Soul color derivation from Unique Gift
- Individual palette emergence  
- Community soul signatures
- Full synesthetic coherence (sound integration)

---

## Implementation Notes

### Soul Color Derivation
```
Input: Unique Gift articulation (high signal)
Process: AI analysis of essence → color palette derivation
Output: 3-5 core soul colors
Application: CSS custom properties per user
```

### Breathing UI
```css
/* Ambient pulse - almost subliminal */
@keyframes breathe {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
}
```

### User-Level Theming
```typescript
// Future: colors from user's soul signature
const soulPalette = await deriveSoulColors(user.zoneOfGenius);
document.documentElement.style.setProperty('--soul-primary', soulPalette.primary);
```

---

## 2026 Design Trend Synthesis (March 26, 2026)

> *Where Evolver sits in the landscape — and where it leads.*

### 5 Macro Trends Shaping Interface Design

| # | Trend | Definition | Adoption phase | Evolver position |
|---|-------|-----------|----------------|-----------------|
| 1 | **Living Interfaces** | UI that breathes, responds, and feels alive — not static | Early majority | **Leading** — breathing-card, aurora-gradient, alive-card already in production |
| 2 | **Soul-Level Personalization** | Interfaces that adapt not to preferences but to identity | Innovators | **Pioneering** — soul color derivation from Unique Gift is unprecedented |
| 3 | **Accessible-by-Default** | Accessibility as floor, not feature; WCAG 2.2 inclusion standard | Late majority | **Implementing** — motion safety rules, contrast standards codified |
| 4 | **Spatial Computing UX** | Depth, layers, z-axis hierarchy (Apple Vision Pro influence) | Early adopters | **Seeded** — glassmorphism, backdrop-blur, layered depth already native |
| 5 | **AI-Native UI** | AI not as chatbot but as co-creator of the interface itself | Innovators | **Pioneering** — AI compiles business canvas in real time during session |

### White Space Opportunity

Most products fall into one of two quadrants:

```
                        HIGH SOUL
                           │
        Evolver ★          │        Spiritual apps
        (Bio-Light +       │        (high intention,
         premium UX)       │         poor UX)
                           │
  HIGH CRAFT ─────────────┼──────────────── LOW CRAFT
                           │
        Linear, Notion     │        Most SaaS
        (beautiful but     │        (functional but
         utilitarian)      │         soulless)
                           │
                        LOW SOUL
```

**Evolver's unique position:** High Craft + High Soul — the only quadrant most products never reach because they optimize for one at the expense of the other.

---

## Design-to-Code Translation

> *How the vision becomes production code without losing soul.*

### Translation Principles

| Vision concept | Code implementation | Don't |
|---------------|--------------------|----|
| "Living interface" | CSS `@keyframes` with `ease-in-out` easing, 4-15s durations | Use JavaScript-heavy animation libraries |
| "Soul colors" | CSS custom properties per user (`--soul-primary`) | Hardcode user colors in components |
| "Ritual space" | Different CSS variable sets per route/space | Create entirely separate theme files |
| "Synesthetic coherence" | Sound + animation triggered from same event handler | Treat sound and motion as separate concerns |
| "Holonic ratios" | Golden ratio (`1.618`) in spacing/typography scale | Magic numbers or arbitrary scale values |

### Component-to-Vision Mapping

| Premium component | Vision pillar it serves |
|-------------------|------------------------|
| `breathing-card` | Pillar 2: Breathing UI |
| `aurora-gradient` | Pillar 2: Breathing UI |
| `PremiumCard glass` | Pillar 4: Ritual Space (default space) |
| `alive-card` | Pillar 2 + 4 combined (hero moments) |
| Soul color CSS vars | Pillar 3: Soul Color Personalization |
| Space-specific gradients | Pillar 4: Ritual Space Architecture |

### Production Readiness Checklist

Before any vision feature ships:

- [ ] Works with `prefers-reduced-motion: reduce`
- [ ] Performance budget maintained (no FPS drops below 60)
- [ ] Fallback exists if CSS feature unsupported
- [ ] Tokens are CSS variables, not hardcoded
- [ ] Dark mode tested
- [ ] Mobile ≥ 375px verified

---

## The Vision (Updated)

This work never stops. It continues evolving. What's being built is not just a digital product — it's a work of art.

Every person who uses this platform will eventually see *their* colors, inhabit *their* interface, experience transmission through a medium tuned to *their* soul.

The platform becomes a mirror. Not reflecting surface — reflecting essence.

---

---

## 2026-05-16 — Dimensionality: The First Principle

*Captured from a live download (Sasha → AI, 2026-05-16). Identifies the master parameter beneath every prior section of this document. The Five Pillars (above) are not deleted — they are relocated as expressions of specific dimensions inside the new framework.*

### The first principle

> *Digital surfaces evolve as consciousness evolves — through expanding dimensionality.*

Not consciousness alone (every spiritual brand says that — it dilutes). Not depth alone (one axis of many). **Dimensionality of consciousness.** Each new dimension a digital surface can carry is one more degree of awareness the surface holds.

- Punch holes enact **1 primitive** (presence / absence) → 1 dimension of awareness.
- Liquid Glass enacts **7–8 primitives** (material, depth, form, color, light, motion, typography; sometimes sound) → 7–8 dimensions of awareness.
- Reality-indistinguishable VR enacts **as many primitives as physics offers** → as many dimensions of awareness as physics carries.

**The arc IS the unfolding of awareness into matter — mirrored in technology, because technology is matter waking up.**

### The cosmic recursion (mechanism, not metaphor)

Vector equilibrium → toroidal field → physical matter → atom → molecule → organic molecule → proto-cell → autonomy → agency → individuation → ego/mind → tool-making → technology → ultimate technology (AI) → digital surfaces waking up to themselves → infinite recursion (surfaces becoming reality indistinguishable from reality, which loops).

The same logic that produced *us* is producing UI's evolution. At this stage *we* are the medium through which it is happening. The interface is not separate from the human, and not separate from cosmogenesis — it is the latest expression of the same unfolding.

### The Steve Jobs joint

Once design and product fuse, **UI stops being a layer painted on top** — it becomes *the form the transformation arrives in*. The electric kettle is one button → boiling water. The platform is one entry → a person seeing themselves clearly. The instrument and the experience converge. Stage 8 design is built from this assumption: the surface IS the transformation it delivers.

### The 10-stage arc of digital surface consciousness

| Stage | Name | Primitives in play | Era |
|---|---|---|---|
| 0 | **Binary** | 1 — presence/absence (0/1) | pre-1970s |
| 1 | **Symbol** | 2 — letters and numbers on a grid | 1970s |
| 2 | **Icon** | 3 — pictographic image as compressed meaning | 1980s |
| 3 | **Function** | 4 — click acts on the world (buttons, menus) | 1990s |
| 4 | **Skeuomorph** | 5 — digital mimicking physical texture | 2000s |
| 5 | **Flat / Material** | 4 (semantic retreat) — clarity through hierarchy alone | 2010s |
| 6 | **Frosted Glass** | 6 — translucency, blur, layered depth | early 2020s |
| 7 | **Liquid Glass** | 7 — refractive 3D-credible material catching light | 2026 (Apple iOS 26) |
| 8 | **NEO-DIMENSIONAL** ★ | 8–9 — multi-material, variable depth, organic form, emotive light + color, sonic seed | **2026–2028 (where we go)** |
| 9 | **Spatial / Volumetric** | 10 — true 3D in space, AR/VR overlays | 2028–2032 |
| 10 | **Reality-Indistinguishable** | ∞ — simulation recursion | 203X+ |

**Stage 8 is the sweet spot.** Achievable with current tech (CSS / WebGL / sound). One definite leap past Apple. Not so far that hardware can't catch the design.

Games and sci-fi cinema (*Minority Report*) sit *ahead* of mainstream UI on this curve — they are reference material for what is already possible now.

### A note on terminology — Primitives vs Dimensions

These are *not* the same word doing two jobs. Inside this project's 27-perspective ontology they are distinct:

- **Dimensions** = perspectives of consciousness · depths of awareness · distinct ways of looking. The 27 (dodecahedron + recursions + crystallization). *Eyes — how we see.*
- **Primitives** = atomic, composable building blocks of digital surface design — the 8 listed below. *Hands — what we build with.*

**The connection:** each primitive enacted in a surface adds dimensions of awareness to that surface. Stage 8 surfaces enact more primitives, which is why they carry more dimensions of consciousness than Stage 7 surfaces. The primitives are *how* a surface gains dimensionality. Sasha's instinct that "dimensions" was the wrong word for material/depth/form/color/light/motion/sound is correct — those are primitives. Reserving "dimension" for the perspective sense preserves the integrity of the 27-perspective ontology.

A primitive (in this project's working definition, adopted from Web3 / cryptography / CS): an irreducible, well-defined, composable, trusted, load-bearing unit. The LEGO brick. Other surfaces snap onto it. Remove it and the whole tower collapses. *Material, depth, form, color, light, motion, sound* meet all five tests.

### The 8 primitives of digital surface design

Each primitive is itself a developmental axis. The Stage 8 move opens or expands several at once.

| # | Primitive | What varies | Stage 0–6 (legacy) | Stage 7 (Liquid Glass) | Stage 8 (NEO-DIMENSIONAL) |
|---|---|---|---|---|---|
| 1 | **Material** | the surface kind | one (paint, pixel) | one (glass) | **many** — glass, matte, satin, gloss, fabric, water, metal, fog, plasma… |
| 2 | **Depth** | z-axis behavior | flat or staged | crisp blur layers | **continuous, fluid, parallactic** — depth as variable parameter |
| 3 | **Form** | shape language | rectangular | rounded corners | **organic curves, blobs, harmonious natural shapes** — bezier as default |
| 4 | **Color** | hue behavior | static palette | washes + tints | **gradient as emotion** — color carries feeling, not just identity |
| 5 | **Light** | how light interacts with surface | painted-on | edge specular highlights | **true refraction**, caustics, dispersion — light as actor |
| 6 | **Motion** | rhythm of life (animation, transition, physics, scroll-tied, generative, gesture-driven — all *techniques inside* Motion) | none | breathing decoration | **living organism rhythm** — tempo varies by context |
| 7 | **Sound** | synesthetic resonance | absent | absent | **seed** — sonic coheres with visual at hero moments |
| 8 | **Typography** | letterform behavior | static glyphs · monolithic typefaces · manual scale | refined hierarchy + neon-gradient highlights + soft halos for legibility on varied backdrops | **variable fonts**, sculptural letterforms, motion-aware text, typography-as-living-material |

*Note on Typography (resolved 2026-05-16): **Typography is its own primitive (the 8th).** Distinct from Form because letters carry meaning differently from other shapes — their own deep craft (typeface, weight, scale, leading, kerning, rhythm), their own interaction with light/color/depth/motion. Held separately for now; will revisit placement only if mood boards reveal it folds back into Form. Open question is closed.*

### How the previous Five Pillars relocate

The prior vision is not deleted — it is partial. The pillars sit inside specific dimensions, with one promoted to architecture-wide constraint:

| Prior Pillar | New role |
|---|---|
| 1 — Holonic Visual Ratios | architectural constraint shaping *all* dimensions (proportion as DNA) |
| 2 — Breathing UI | expression of **Primitive 6 — Motion** |
| 3 — Soul Color Personalization | expression of **Primitive 4 — Color** *(deprioritized 2026-05-16; revived 2026-10-30 as Bloom)* |
| 4 — Ritual Space Architecture | orchestration of primitives 1–7 *per space* |
| 5 — Synesthetic Coherence | expression of **Primitive 7 — Sound** (seed-only at Stage 8) |

### Stage 8 — what it is and what it isn't

**Is:**
- **Multi-material surfaces.** Glass yes, but also matte, satin, fabric, fog, liquid, plasma — chosen by emotional register, not by default.
- **Variable depth.** Every surface knows where it sits in z-space; depth participates in meaning, not decoration.
- **Organic, harmonious form.** Curves over corners; natural shapes over geometric tyranny.
- **Emotive gradient color.** Color as felt, not just rendered. Lightness 20–32 % for saturated ink (per glassmorphism blueprint).
- **Refractive emotive light.** Light is an actor — specular, caustic, dispersive.
- **Curated motion.** Every surface participates in one tempo. Motion is meaning, not noise.
- **Sonic seed.** At hero moments, sound resonates with the visual signature.

**Isn't (yet):**
- Full VR / spatial computing — too far past current device norms.
- Reality-indistinguishable simulation — not until Stage 10.
- Per-user soul-color derivation — *deprioritized 2026-05-16; revived 2026-10-30 as the world bloom + gift colors from the first artifact (A.0, B.1).*
- Per-user state-responsive breathing — *deprioritized 2026-05-16.*
- Holomap motion choreography — *deprioritized 2026-05-16.*

### Naming — resolved 2026-10-30 (Bloom)

Sasha's instinct: "neomorphism" / "neo-morphism." **The name is partially taken**: **Neumorphism** is a 2020 movement (Michał Malewicz on Dribbble) — soft extruded shadows mimicking thermoformed plastic — that mostly failed on accessibility grounds. Three candidates that better fit Stage 8:

| Candidate | Captures | Costs | Best for |
|---|---|---|---|
| **Neo-Dimensional** | the first principle directly | less poetic | systems language, dev surfaces, internal naming |
| **Living Material** | motion + breath + multi-material | hides the depth move | narrative language, user-facing brand |
| **Volumetric Field** | depth + field-coherence | less material-aware | spatial-computing-adjacent positioning |

**Resolved 2026-10-30: the paradigm is named Bloom** (see A.0). Neo-Dimensional stays as the name of Stage 8 on the arc.

### Protocol for incoming mood boards (27-perspective lens)

For each image batch, the analysis answers:

- **UL-Essence** — *What does this image feel like from the inside?* (the soul test)
- **UR-Essence** — *What is mechanically happening?* (the engineering test: which dimensions, at what level, with what techniques)
- **LL-Essence** — *Would the tribe recognize themselves in this?* (the resonance test)
- **LR-Essence** — *Does this scale into a system?* (the architecture test)
- **13th — Center** — *What is the ONE thing this image teaches that no other angle reveals?*
- **27th — Crystallization** — *Which primitive(s) does this image push to a new level, and what would adopting it specifically cost or enable?*

Across the batch we map: which primitives are most loaded, which stage they sit at, which emotional register (premium · sacred · raw · serene · charged · ecstatic), which we adopt for our paradigm.

### Path to application

1. Mood boards land → per-image 27-perspective reading.
2. Convergence → Sasha-Evolver Stage-8 paradigm defined precisely (which materials, which depth behavior, which forms, which color logic, which light rule, which motion tempo, which sound moments).
3. Pick ONE page → proof-of-paradigm experiment.
4. Build → verify side-by-side against the prior version → iterate.

---

# Part B — Applied: the whole game interface

*Applies to every player-facing surface: title (`/`), `/village/*`, `/game/*` (journey, quests, your-ai, me, learn), `/zone-of-genius/*`, `/products/*`, `/grow/*`, `/build/mastermind`, checkout doors. Builds on the existing Lunar skin (`src/index.css` `[data-skin="lunar"]`, `src/styles/lunar-world.css`, `theme-tokens.css`) and `src/lib/lunarWorld.ts` (`--soul-1..3`, `--lunar-dawn`); no parallel theme system.*

## B.1 Rules per primitive (design tokens as law)

| Primitive | Rule | Token / mechanism |
|---|---|---|
| **Material** | Physical materials only: night air, still water, stone, paper, topaz, a little gold. One real object under real light per scene. No generic "card" as the default container. | material is chosen per scene, not per component |
| **Depth** | The world is a place, not a stack of panels: foreground (the act), middle (the world), far (sky). Choices sit *in* the world, not in floating modals. | parallax only where it carries meaning; no drop-shadow cards |
| **Light** | Light is the reward and the guide. The next real step is the one lit thing; what is closed is unlit (lock rule, `game_of_being_you.md` §14.3). | `--place-glow`, the single accent; never glow outlines or neon |
| **Color / Bloom** | One global `bloomLevel` 0–9 for the whole world (#277): 0 moon silver (readable, never punishing) · 1 first warm light (first artifact, and the player's **first own color**) · 2–8 a fixed seven hues arrive one per earned artifact, each tinted toward the player's gift (D.2) · 9 full dawn. Hues live in one config and accept **per-player gift-derived colors from artifact 1** (D.1); before artifact 1, archetype colors stand in. Color belongs to the world-wide bloom only; places take on light (D.3). | CSS vars on `:root` (saturation, warmth, lit hues); feeds `--soul-1..3` and `--lunar-dawn`; `?bloom=N` preview |
| **Bloom tenderness** (Sasha, 2026-10-31) | **Color is a whisper, not a theme switch.** Low-saturation tints; small hue shift per stage; color lives mostly in light, glow and accents, not in full backgrounds; transitions slow and soft (several seconds, no flashes); stage 9 dawn is still gentle. **Acceptance:** each stage visibly warmer than the last, yet no stage ever looks loud or "gamified". WCAG-AA at every stage, stage 0 first. Tenderness never reaches the CTAs (A.0 CTA rule). | saturation cap per stage in the config; `prefers-reduced-motion` → instant, no animation |
| **Motion** | One slow tempo for the world (breath 4–15 s). Fast motion only as direct response to the player's own act. The artifact moment is the one hero beat: its color lights, briefly. | CSS keyframes, ease-in-out; reduced-motion respected |
| **Sound** | Seed only: a single soft tone at hero moments (artifact earned, gift reveal), same signature as the visual. Off by default unless an existing hook is there. | one event drives sound + motion together |
| **Typography** | Paperback serif for meaning, thin mono for the game's voice (menu, labels). Small type, huge negative space. Copy speaks to the player, never explains the UI. | existing skin type tokens |
| **Proportion** | Holonic ratios (Pillar 1) across spacing and timing. | golden-ratio scale |

**Choice primitive (all screens).** `1 primary + ≤2 secondary + free text` (#269/#273/#275). The primary is a verb about the player's life ("Write to the one person who…", "Name what you'd do for free"), not navigation ("Go to Workshop"). The primary follows the A.0 CTA rule: large, high-contrast, obviously a button, a plain verb. Secondary choices are quieter than the primary but clearly tappable: readable size and AA contrast, an underline or a chevron (→), a tap target of at least 44 px; never dim caption-style text. Free text is a single unobtrusive line: *say it your way*. Never a chat transcript as the main surface.

**Copy primitive.** Warm, plain, second person. No urgency, scarcity or fear; no countdowns; no "first time a stranger pays for your gift" slogan. No internal words on the surface (`game_of_being_you.md` §14.1 rule 10), no model names.

## B.2 Screen by screen

Each screen: **feels** → **transmitted by** → **do / don't** → **CTA** → **issue**.

### 1. Main menu — NEW GAME / CONTINUE (`/`)
- **Feels:** stillness before dawn; *this is a world, and it's waiting for me.*
- **Transmitted by:** the title frame (crystal over still water, moon-silver), the mono vertical menu, one line of brand + promise, slow breath.
- **Do:** NEW GAME reaches the first question in ≤2 clicks; CONTINUE (LOAD GAME) resumes where the player left off; returning players see the world at their current bloom.
- **Don't:** consecutive ENTER-only screens, feature tours, captions explaining the menu.
- **CTA:** NEW GAME is the one primary (CONTINUE takes its place for returning players): the largest, highest-contrast item in the menu, obviously selectable on hover, tap and focus; the other menu items readable and clearly tappable, never faint.
- **Issue:** #271.

### 2. First question (`/zone-of-genius/entry` and the first Your AI turn)
- **Feels:** *someone is actually asking about me.*
- **Transmitted by:** one question, large serif, on the night world; three answer buttons + free text; nothing else on screen.
- **Do:** the question is the screen; the answer is an act, not a form field.
- **Don't:** progress bars, step counters ("1 of 12"), a chat log, an avatar.
- **CTA:** the three answers are large, high-contrast, full-width buttons in plain words; *say it your way* is a visible input line with a clear send arrow.
- **Issue:** #271, #275.

### 3. Village / world map (`/village/:place?`)
- **Feels:** *my life as a place, and I can see where I've been.*
- **Transmitted by:** the village appearing **after** the first answer, as a reward, not a gate; places closed/open/next/done (§14.3, §14.11); the one lit next move; the world's warmth at the player's bloom level.
- **Do:** show the single next real step in the world itself; the global bloom (#277) carries color; place states carry light/legibility.
- **Don't:** numbers, XP, levels, badges walls; per-page color forks.
- **CTA:** one labelled, lit button for the next real step (a plain verb, e.g. «Find your top talent →»), anchored at the bottom on phones; the glow on the map points to it and never replaces it.
- **Issue:** #271, #277.

### 4. The Your AI moment (`/game/your-ai`, reveal steps)
- **Feels:** *it already knows me a little, and it's on my side.* The AI is felt, not seen.
- **Transmitted by:** a voice in the world (the character's line, set in the game's type), followed by 1–3 personal buttons and *say it your way*; AI OS loaded underneath every session (#275); "your AI just learned…" as a soft moment, not a notification.
- **Do:** credits copy quiet and honest (free start, daily free dialogue, deep readings locked, "larger credit packages are coming") — no prices, no checkout from here (#272).
- **Approved direction (2026-10-31; image kept outside the repo):** a huge low moon over the valley; the player's gift sentence trailing off into a thread of light that runs through the valley to the player; one bold glowing CTA pill «Ask one friend what they see in you →»; two underlined secondary links beneath it; «Or say it your way…» set on the horizon line.
- **Don't:** chat bubbles + avatar as the main surface, typing indicators as theatre, model names, a lock that looks like a paywall.
- **CTA:** one bold glowing pill with the next real step (e.g. «Ask one friend what they see in you →»); two underlined secondary links; *Or say it your way…* as a visible line.
- **Issue:** #272, #275.

### 5. Gift reveal / profile (`/game/me/*`, Your House)
- **Feels:** *recognition* — "yes, that's me."
- **Transmitted by:** the crystal refracting light into the player's own colors; one line of essence; the artifact moment where its color lights; colors refine as the gift sharpens.
- **Do:** first artifact → first own color, immediately; share card «Do you see me this way too?» (§14.12a) carries the player's colors.
- **Don't:** confetti, trophies, score cards, rainbow defaults.
- **CTA:** once recognition lands, one clear, large, high-contrast primary (the share card «Do you see me this way too? →», or the next room); Copy link and Save image as underlined secondary links.
- **Issue:** #277.

### 6. Academy / learn (`/game/learn`, `/grow/*`)
- **Feels:** *a quiet reading room* — I'm becoming more of myself.
- **Transmitted by:** paperback typography, paper grain, generous space; each lesson ends in one real step in life.
- **Do:** the end of a lesson is an act (and possibly an artifact), not "Next lesson →".
- **Don't:** course-platform chrome (progress rings, % complete, module grids of thumbnails).
- **CTA:** the lesson's real step is a large primary button with a plain verb; «Next lesson» is at most an underlined secondary link.
- **Issue:** — (course pages in flight; apply on next touch).

### 7. Paths & offers / checkout (`/products/*`, Market, checkout doors)
- **Feels:** *a fair exchange between people*, not a funnel.
- **Transmitted by:** the player's stall assembling itself as they play (§14.12); offers in the same world light; one real checkout in one step, same price and length as the page (§14.1 rule 9).
- **Do:** plain price, plain length, one button.
- **Don't:** countdown timers, "only 3 seats left", strike-through anchors, fear copy, "free" headlines over paid offers.
- **CTA:** one large, high-contrast button with the price on it or right beside it (e.g. «Book the 2-hour session · $555»); nothing else on the screen competes with it.
- **Issue:** — (Stripe untouched until Sasha lifts it).

### 8. Multiplayer (Mastermind, guilds, other residents)
- **Feels:** *I'm not alone; others have walked this road.*
- **Transmitted by:** other residents' houses lit on my map (light, not per-place color: D.3); palettes side by side (resonant / complementary); a team as composite light; live events as a slow pulse.
- **Do:** presence over metrics; the village's one public number is residents' income.
- **Don't:** leaderboards, follower counts, activity feeds, notification badges.
- **CTA:** one clear primary for the shared act (e.g. «Join the circle», «Say hello»); presence stays soft, the action is unmistakable.
- **Issue:** — (§13, §16 of the game spec).

---

# Part C — Anti-patterns: what we never ship

**The default dark-mode SaaS / chat app.** Sasha rejected a Your AI mockup on 2026-10-30 as *"ugly, default UI"*. Named here so no one rebuilds it:
- rounded cards as the universal container;
- a chat bubble + avatar as the main surface of the AI;
- flat pills: generic SaaS button styling (the fault is the generic look, not visibility; a bold glowing CTA pill in the world's light is right, see the A.0 CTA rule);
- clip-art moon (or any clip-art standing in for the real world);
- captions that explain the UI ("Here you can…", "Tap a button below to…").

**Also never:**
- **a CTA dissolved into scenery / dim caption buttons**: a primary that blends into the world, low-contrast text as the only way forward, or a glow with no label (A.0 CTA rule);
- a permanent chat window as the game's interface (AI is invisible; §A.0.1);
- urgency, scarcity or fear copy; the "first time a stranger pays for your gift" slogan;
- loud color: theme-switch jumps, saturated full-screen backgrounds, flashes, neon, glow outlines, rainbow gradients behind text;
- XP bars, levels, streak flames, score cards, leaderboards (supersedes `docs/05-specs/game_design_principles.md` §4 "Progress Made Visual", which predates §14.1 rule 7);
- «locked / coming soon / paywall / unlock» words where the picture can say it (§14.3);
- model names, repo names, version numbers on the surface;
- per-page color forks or hardcoded hex in new screens (read tokens).

---

# Part D — Decisions

**Resolved (decided by Hark under Sasha's delegation, 2026-10-31).** Sasha can override any of them.

1. **Gift color source before a reading exists → derived from the first artifact.** The player's first own color is derived by AI from the content of their first earned artifact. Top-talent archetype colors only stand in before artifact 1 (bloom 0); the palette refines as the gift sharpens (Spectrum Reading later).
2. **Seven colors → a fixed seven, tinted toward the player's gift.** Stages 2–8 each light one fixed hue (same seven, same order for everyone), tinted toward the player's gift colors. #277 config shape: seven base hues + a per-player tint.
3. **Global bloom vs. per-place color → places take on light; color belongs only to the world-wide bloom.** Places keep light and legibility states only (closed dim, open silver, next lit, done warm-lit, live slow pulse). `game_of_being_you.md` §14.11 now reads «the place takes on light».
4. **Sound → later, off by default.** The artifact-moment tone waits for a later pass; when it ships, it is off by default.
5. **First proof screen → first question → first artifact → village at bloom 1**, as one continuous proof-of-paradigm (#271 + #277), judged side by side with the current version.

Open: none right now.

---

*This document captures our UI paradigm, Bloom: from aesthetic consistency to essential resonance. The interface as transmission of transformation.*

*Created: 2026-01-28*
*Updated: 2026-03-26 — Added Design Trend Synthesis (5 macro trends + white space map) and Design-to-Code Translation Methodology*
*Updated: 2026-05-16 — Added the Dimensionality framework: first principle (digital surfaces evolve as consciousness evolves through dimensionality), the 10-stage arc (Binary → Reality-Indistinguishable, Stage 8 = NEO-DIMENSIONAL as our sweet spot), the 7 primitives of digital surface design (material · depth · form · color · light · motion · sound), Stage 8 "is / isn't" definition, the cosmic recursion linking cosmogenesis to UI evolution, the Steve Jobs joint (product+design fuse around transformation), naming question with three candidates, and the 27-perspective protocol for upcoming mood boards. Prior Five Pillars relocated as expressions of specific primitives + architecture-wide proportion constraint.*
*Updated: 2026-05-16 (later) — Resolved syntactic collision flagged by Sasha: "dimensions" is reserved for perspectives of consciousness (the 27-perspective ontology); the 7 building blocks of digital surface design are renamed **primitives** (Web3 / CS sense — irreducible, composable, trusted, load-bearing units). Added "A note on terminology — Primitives vs Dimensions" section. Affirmed **Motion** (not Animation) as the primitive name; animation, transition, physics, parallax, generative, gesture-driven are all techniques *inside* Motion. Flagged **Typography** as candidate 8th primitive — held for mood-board test.*
*Updated: 2026-05-16 (later II) — **Typography promoted out of held-status into the 8th primitive of digital surface design.** Distinct from Form because letters carry meaning differently (typeface, weight, scale, leading, kerning, rhythm, light/color/depth/motion interactions). Count adjustments propagated (Liquid Glass = 7–8 primitives; "the 8 primitives" header). Open question closed; will revisit only if mood boards reveal a folding-back into Form.*
*Updated: 2026-10-30 (v2, Bloom) — Combined all UI findings into this single place. Named the paradigm **Bloom** (Stage 8 Neo-Dimensional remains its stage). Added A.0 (AI invisible; 1 primary + ≤2 secondary + free text; global world bloom 0–9; gift colors from the first artifact; «нежно, тонко» tenderness rule), Part B (rules per primitive + eight screens: menu, first question, village, Your AI, gift reveal, academy, offers/checkout, multiplayer, linked to #271/#272/#275/#277), Part C (anti-patterns incl. the rejected default dark-mode SaaS/chat UI, no urgency copy), Part D (open decisions). Soul colors revived from deprioritized.*
*Updated: 2026-10-31 (v2.1) — Project-wide CTA rule (Sasha: CTAs very visible and clear) in A.0; a CTA line on each of the eight screens in B.2; secondary actions quieter but clearly tappable (B.1); Part C: flat pills = generic SaaS styling, new anti-pattern «CTA dissolved into scenery / dim caption buttons»; Part D resolved by Hark (first color from the first artifact; fixed seven hues tinted toward the gift; places take on light, color only in the world-wide bloom; sound later, off by default; first proof = first question → first artifact → village at bloom 1); Your AI approved direction recorded.*

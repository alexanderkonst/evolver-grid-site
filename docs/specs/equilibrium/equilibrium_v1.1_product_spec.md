# Equilibrium — Product Spec

> Running through the [Integrated Product Building Workflow](file:///Users/alexanderkonst/evolver-grid-site/docs/03-playbooks/integrated_product_building_workflow.md)

**Started:** 2026-02-10
**Source:** [Holonic Cycles Synthesis](file:///Users/alexanderkonst/evolver-grid-site/docs/01-vision/holonic_cycles.md)

---

## INPUT ✅ (5/5)

### 1. ICP (Who exactly?)

**Founders, creators, and knowledge workers** who:
- Do deep work daily (writing, coding, designing, strategizing)
- Know they're not performing at their potential
- Feel out of sync — either pushing too hard (burnout) or not enough (drift)
- Are interested in natural rhythms but lack a practical system
- Want to work WITH their biology, not against it

**Primary:** Alexander himself (founder, 25-45, builds Evolver Platform from Bali)
**Secondary:** Any founder or creator who does 3-6 hours of deep work daily

### 2. Transformation (Point A → Point B)

**Point A:** Working in arbitrary time blocks. Ignoring body signals. Pushing through troughs. Alternating between overwork and unfocused drift. No awareness of where they are in their natural cycles.

**Point B:** Working in harmony with natural cycles. Every work session has clear rhythm (4 work pulses × 24 min). Transitions between focus and rest are guided, not willpowered. The user feels the difference: sustained energy, less burnout, deeper flow, and the quiet confidence of knowing they're synchronized with something larger.

**One sentence:** *"Equilibrium takes founders from arbitrary, willpower-driven work into harmonious, cycle-aware deep work."*

### 3. Pain of Point A

- "I sit down to work and 4 hours later I look up, exhausted, not sure what I accomplished"
- "I know I should take breaks but I never do, and then I crash"
- "I start strong in the morning but by 2pm I'm useless"
- "I've tried Pomodoro but 25 minutes feels arbitrary — sometimes I'm in flow and it interrupts me"
- "I feel disconnected from any natural rhythm — just running on caffeine and deadlines"

### 4. Dream Outcome

- "I feel like my work flows naturally — I know exactly when to push and when to rest"
- "I accomplish more in 3 sprints than I used to in 8 hours of unfocused work"
- "The breathing circle calms me before each work pulse and I enter focus faster"
- "I can see where I am in the day, the week, the month — and it all makes sense"
- "My energy is consistent. No crashes. No guilt about rest."

### 5. Action (What user does)

Open Equilibrium on an iPad or second screen. The breathing circle guides them into coherent breathing. The clock shows their current position in all cycles. They begin their work sprint. The interface gently marks transitions between work pulses (4 min entry → 16 min focus → 4 min exit) without breaking flow. After 96 minutes, the clock indicates integration time.

---

## PHASE 1: PRODUCT

### 1.1 Master Result

> **Equilibrium takes founders from arbitrary, willpower-driven work into harmonious, cycle-aware deep work.**

- **Point A:** Unstructured deep work, willpower-based, burns energy, no awareness of natural rhythms
- **Point B:** Cycle-synchronized deep work, guided transitions, sustained energy, flow with natural rhythms

### 1.2 Sub-Results (5 intermediate wins)

| # | Sub-Result | User feels... | Start → End |
|---|-----------|--------------|-------------|
| 1 | **Coherent Breathing** | "My breath is calm, my heart rate synchronized" | Open app → breathing circle engaged |
| 2 | **Work Sprint Awareness** | "I see the whole 96-minute structure — 4 pulses, each with purpose" | Sprint begins → sprint map visible |
| 3 | **Guided Transitions** | "I don't have to decide when to pause — the clock gently shows me" | Work pulse entry/exit → smooth transition |
| 4 | **Day Awareness** | "I see where I am in my day, which sprint I'm on" | Day view → current position clear |
| 5 | **Cycle Awareness** | "I see the bigger picture — week, month, quarter, planetary energy" | Multi-cycle view → "I'm part of something larger" |

**Sequence:** 1 → 2 → 3 (these three are the core loop, experienced every sprint). 4 and 5 are ambient layers always visible.

### 1.3 Screens

| # | Screen | Sub-Result | Purpose |
|---|--------|-----------|---------|
| 1 | **Breathing Circle** | Coherent Breathing | Central animated circle expanding/contracting at 5.5s/5.5s. The anchor of the entire UI. |
| 2 | **Sprint View** | Work Sprint Awareness + Guided Transitions | Shows current work sprint (96 min). 4 work pulses visible as arcs. Current phase highlighted (entry/focus/exit). Gentle transition prompts. |
| 3 | **Day View** | Day Awareness | Shows the full day. Current sprint highlighted. Past sprints shown as completed. AM/PM energy arc. |
| 4 | **Cycle Rings** | Cycle Awareness | Concentric rings showing week, month, quarter, year, planetary hour, moon phase. Current position on each ring. |

**Note:** These are not separate pages — they are **layers** of the same clock face. The breathing circle is always center. Sprint view is Ring 1-2. Day view and Cycle rings are outer layers, always visible but less prominent.

### 1.4 Screen Details (Three Dan Tians)

#### Screen 1: Breathing Circle

| Dan Tian | Content |
|----------|---------|
| 🫀 Heart | "I feel my breath slowing down. I feel calm and present." |
| 🧠 Mind | "5.5 sec in, 5.5 sec out. This is coherent breathing. My HRV is optimizing." |
| 🔥 Gut | No CTA — the circle IS the interaction. User breathes with it. |

#### Screen 2: Sprint View

| Dan Tian | Content |
|----------|---------|
| 🫀 Heart | "I can see the whole sprint. I know where I am. I feel safe to focus." |
| 🧠 Mind | "4 work pulses × 24 min. Currently in Pulse 2 (EMANATION), focus phase. 8 min remaining." |
| 🔥 Gut | Transition prompts at phase boundaries: soft glow, tone, or text like *"Breathe. What worked? Where next?"* |

#### Screen 3: Day View

| Dan Tian | Content |
|----------|---------|
| 🫀 Heart | "I'm on track. Two sprints done, one to go." |
| 🧠 Mind | "Sprint 2 of 3. AM creation complete. PM polish beginning." |
| 🔥 Gut | No explicit CTA — ambient awareness. Tap to expand sprint details. |

#### Screen 4: Cycle Rings

| Dan Tian | Content |
|----------|---------|
| 🫀 Heart | "I'm part of something much bigger. Monday — Moon energy. Waxing moon." |
| 🧠 Mind | "Week 2 of month. Q1 of year. Saturn hour." |
| 🔥 Gut | No explicit CTA — ambient wisdom. Tap any ring for details. |

### 1.5 Extensions

**Artifacts produced:**
- Sprint log (completed sprints with timestamps)
- Daily rhythm data (how many sprints, adherence to transition prompts)

**Emotional states:**
| Screen | Emotion |
|--------|---------|
| Breathing Circle | Calm, centered, grounded |
| Sprint View | Purposeful, oriented, safe |
| Day View | Confident, on-track |
| Cycle Rings | Connected, humble, inspired |

**Completion criteria:**
- This is a **continuous tool**, not a one-time flow. There is no "done." 
- Success = user opens it daily and works with it

**Skip paths:**
- User can ignore transition prompts — the clock doesn't stop or nag
- User can hide outer rings and work with just breathing circle + sprint

**Bridges:**
- Standalone v1 — no connection to Evolver Platform initially
- Future: sprint logs could feed into Evolver's daily loop / QoL tracking

### 1.6 Wireframes

```
┌─────────────────────────────────────────────────┐
│                                                  │
│           ╭─── Quarter ──────────╮               │
│          ╭─── Month ──────────╮  │               │
│         ╭─── Week ──────────╮ │  │               │
│        ╭─── Day ──────────╮ │ │  │               │
│       ╭─── Sprint ──────╮ │ │ │  │               │
│      ╭── Work Pulse ──╮ │ │ │ │  │               │
│     │                  │ │ │ │ │  │               │
│     │   ╭──────────╮   │ │ │ │ │  │               │
│     │   │          │   │ │ │ │ │  │               │
│     │   │  ◉ ←→ ◉  │   │ │ │ │ │  │               │
│     │   │ BREATHE  │   │ │ │ │ │  │               │
│     │   │          │   │ │ │ │ │  │               │
│     │   ╰──────────╯   │ │ │ │ │  │               │
│     │  P1  P2  P3  P4  │ │ │ │ │  │               │
│     ╰──────────────────╯ │ │ │ │  │               │
│       ╰──────────────────╯ │ │ │  │               │
│        ╰───────────────────╯ │ │  │               │
│         ╰────────────────────╯ │  │               │
│          ╰─────────────────────╯  │               │
│           ╰───────────────────────╯               │
│                                                   │
│  🌙 Monday · Moon      🌓 Waxing · Day 11        │
│  ♄ Saturn Hour          Q1 · Spring               │
│                                                   │
│           "EMANATION — Focus Phase"               │
│               12 min remaining                    │
└───────────────────────────────────────────────────┘
```

**Mobile-first:** The same layout works on iPad (primary) and phone (secondary). On phone, outer rings collapse into a minimal status bar at top.

**Key design principles:**
1. **No buttons for the primary interaction** — the clock runs continuously, you breathe with it
2. **Layers, not pages** — everything on one screen, rings expand/contract
3. **Ambient, not demanding** — transition prompts are gentle (glow, not popup)
4. **Information density increases outward** — center = simple (breathe), outer = complex (cosmos)

---

## 🔥 ROAST GATE 1: PRODUCT

### Flow Walkthrough
- [ ] User opens Equilibrium → sees breathing circle, starts breathing with it
- [ ] Sprint begins → 4 work pulses visible as arcs around center
- [ ] Work Pulse 1 entry (4 min) → gentle text: "What's the ONE thing?"
- [ ] Work Pulse 1 focus (16 min) → timer ticks, no interruption
- [ ] Work Pulse 1 exit (4 min) → gentle text: "What emerged?"
- [ ] Work Pulse 2-4 → same pattern with phase-specific prompts
- [ ] Sprint ends → "Stand. Walk. 10-15 min, no screens."
- [ ] Day view shows completed sprint, next sprint position
- [ ] Cycle rings show ambient time context

### Navigation Edges
- No traditional navigation — single-screen clock
- Tap center → breathing circle focus (dismiss other layers)
- Tap any ring → expand that ring's detail
- Tap outside → return to full view

### Redundant/Missing Screens
- [ ] No redundant screens (it's all one screen)
- [ ] Potentially missing: Settings/preferences (sprint count, transition sound on/off)
- [ ] Potentially missing: First-run onboarding (explain what the rings mean)

### Roast Cycles
- [ ] Cycle 1: Usability, hierarchy, CTA clarity
- [ ] Cycle 2: Edge cases, copy, emotional flow
- [ ] Cycle 3: What did 1-2 miss?

---

## PHASE 2: ARCHITECTURE

### 2.1 Module Boundaries

**Standalone app.** Equilibrium v1 is NOT a module inside the Evolver Platform. It's a separate web app.

| Boundary | Decision |
|----------|----------|
| **Entry** | User opens URL in browser (iPad Safari, desktop Chrome) |
| **Exit** | User closes tab (no exit flow needed) |
| **Data in** | Current time (`Date.now()`), user preferences (localStorage) |
| **Data out** | Sprint logs (localStorage), no server/DB for v1 |
| **Auth** | None for v1 — no login, no accounts |

**Why standalone:** Fastest path to usable product. Alexander needs this NOW for his own work. No Supabase, no auth, no deployment pipeline to Evolver. Just a URL that works.

**Future bridge:** When ready, Equilibrium can be embedded as an iframe/component in the Evolver Platform's daily loop.

### 2.2 Routing

**Single route.** One page, one URL.

```
/                   → The Clock (everything)
/settings           → Preferences overlay (optional, can be a modal)
```

No route guards. No auth. No redirects.

**Tech stack:**
- Vite + TypeScript
- Vanilla CSS (no Tailwind)
- No React — pure DOM + Canvas/SVG for maximum animation performance
- Or: React if we want component structure for rings — decision at Phase 4

### 2.3 Data Schema

**No database.** Everything in localStorage for v1.

```typescript
// localStorage keys
interface EquilibriumState {
  // User preferences
  preferences: {
    breathDuration: number;       // default: 11 (seconds, full cycle)
    sprintDuration: number;       // default: 96 (minutes)
    workPulseDuration: number;    // default: 24 (minutes)
    entryDuration: number;        // default: 4 (minutes)
    focusDuration: number;        // default: 16 (minutes)
    exitDuration: number;         // default: 4 (minutes)
    transitionSound: boolean;     // default: true
    transitionPrompts: boolean;   // default: true
    showOuterRings: boolean;      // default: true
  };

  // Sprint log (persisted)
  sprintLog: Array<{
    date: string;           // ISO date
    sprintNumber: number;   // 1-based within day
    startTime: string;      // ISO timestamp
    endTime: string;        // ISO timestamp
    completed: boolean;     // did user finish all 4 pulses?
  }>;

  // Active sprint (ephemeral, survives refresh)
  activeSprint: {
    startTime: string;      // ISO timestamp
    currentPulse: number;   // 1-4
    currentPhase: 'entry' | 'focus' | 'exit';
    paused: boolean;
  } | null;
}
```

### 2.4 Shell & Layout

**Fullscreen clock. No navigation shell.**

| Rule | Value |
|------|-------|
| **Nav/sidebar** | None. Never. |
| **Header** | None. |
| **Footer** | None. |
| **Focus mode** | Always. This IS focus mode. |
| **Responsive** | iPad landscape (primary), iPad portrait, desktop, phone |
| **Scroll** | None. Everything fits in viewport. |

**Layout structure:**
```
┌─────────────────────────────────────┐
│                                     │
│         [Clock Face]                │
│     (centered, fills viewport)      │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Status bar (bottom)          │  │
│  │ Phase name · Time remaining  │  │
│  │ Planetary hour · Moon phase  │  │
│  └──────────────────────────────┘  │
│                                     │
│  [⚙] Settings (bottom-right, tiny) │
└─────────────────────────────────────┘
```

**CSS approach:**
- Dark background (`#0a0a0f` or similar deep navy/black)
- Centered flexbox/grid for clock
- CSS animations for breathing circle (11s `ease-in-out` loop)
- SVG or Canvas for ring arcs
- Minimal text — mostly visual

### 2.5 State Management

| State | Storage | Survives... |
|-------|---------|-------------|
| **Preferences** | localStorage | Tab close, device reboot |
| **Active sprint** | localStorage | Page refresh (resume mid-sprint) |
| **Sprint log** | localStorage | Indefinitely (until cleared) |
| **Current time** | `Date.now()` | N/A — always live |
| **Cycle positions** | Computed | N/A — derived from current time |

**Key principle:** Almost all state is **computed from current time.** The clock doesn't need to "track" cycles — it calculates where you are RIGHT NOW based on `Date.now()` and astronomical formulas.

**Computed state (no storage needed):**
- Current breath phase → `(Date.now() / 1000) % 11` → position in 11s cycle
- Current work pulse phase → derived from sprint start time
- Current day quarter → hour of day
- Current planetary hour → calculation from sunrise/sunset
- Current moon phase → standard lunar algorithm
- Current season → date math
- Current planetary day → day of week

**Resume logic:** If `activeSprint` exists in localStorage and `now - startTime < sprintDuration`, resume. Otherwise, clear it.

---

## 🔥 ROAST GATE 2: ARCHITECTURE

### Navigation Walkthrough
- [ ] User opens URL → clock loads, breathing circle starts immediately
- [ ] If `activeSprint` in localStorage → resume mid-sprint
- [ ] If no active sprint → clock shows ambient mode (breathing + cycle rings, no sprint timer)
- [ ] User taps "Begin Sprint" (or automatic based on time of day?) → sprint starts
- [ ] User refreshes mid-sprint → resumes at correct position
- [ ] User closes tab and returns 2 hours later → active sprint cleared, fresh start
- [ ] User taps ⚙ → settings overlay slides up
- [ ] User changes breath duration → takes effect immediately

### Data Flow
- [ ] All cycle positions computed from `Date.now()` — no API calls
- [ ] Sprint start/end writes to localStorage log
- [ ] No server dependency — works offline, works on airplane

### Edge Cases
- [ ] No internet → works perfectly (all computation is local)
- [ ] Multiple tabs → each runs independently (localStorage syncs on focus)
- [ ] Laptop sleep → on wake, recalculates position from current time
- [ ] Time zone change → recalculates (planetary hours need location for sunrise/sunset)

### Roast Cycles
- [ ] Cycle 1: Entry/exit routes, state persistence
- [ ] Cycle 2: Data flow, error states
- [ ] Cycle 3: What did 1-2 miss?

---

## PHASE 3: UI

> **Inspiration:** Apple Activity Rings (concentric simplicity), Cosmic Watch (celestial radial clock), Linear (minimal dark UI), neal.fun (one idea, absurd clarity), earth.nullschool.net (living data, hypnotic).

### 3.1 Visual Rules

#### Color Tokens

| Token | HEX | Usage |
|-------|-----|-------|
| `--bg-void` | `#0a0a0f` | Background. Near-black with slight warmth |
| `--bg-surface` | `#12121a` | Elevated surfaces (settings overlay, tooltips) |
| `--gold` | `#c9a84c` | Primary accent. Headlines, active ring segments, phase labels |
| `--gold-dim` | `#8a7335` | Secondary gold. Inactive labels, ring outlines |
| `--cream` | `#e8dcc8` | Body text, philosophical voice, phase prompts |
| `--cream-muted` | `#9a9080` | Tertiary text. Timestamps, status info |
| `--ring-breath` | `#c9a84c` | Breathing circle glow (gold, alive) |
| `--ring-pulse` | `#d4a853` | Work pulse arcs (warm gold) |
| `--ring-sprint` | `#a8853f` | Sprint ring (burnished gold) |
| `--ring-day` | `#7a6830` | Day ring (aged gold) |
| `--ring-week` | `#5c4e25` | Week ring (deep amber) |
| `--ring-month` | `#3e351c` | Month ring (dark amber) |
| `--ring-quarter` | `#2a2414` | Quarter ring (barely visible, deep) |
| `--phase-entry` | `#6b8cae` | Entry phase accent (cool blue, arriving) |
| `--phase-focus` | `#c9a84c` | Focus phase accent (gold, peak) |
| `--phase-exit` | `#8b6b8a` | Exit phase accent (soft violet, releasing) |
| `--glow` | `rgba(201, 168, 76, 0.15)` | Ambient glow behind active elements |

**Gradient:** Rings fade from gold (inner) → deep amber (outer), creating depth toward cosmos.

**Rule:** NO pure white. NO pure black. Everything has temperature.

#### Typography

| Typeface | Weight | Usage | Size |
|----------|--------|-------|------|
| **Cormorant Garamond** | 300, 400, 600 | Phase names, cycle labels, hero text | 14–32px |
| **Libre Baskerville** | 400 italic | Transition prompts, philosophical voice | 14–18px |
| **DM Sans** | 400, 500 | Time remaining, settings UI, utility text | 12–16px |

**Loading:** Google Fonts — `Cormorant+Garamond:wght@300;400;600&Libre+Baskerville:ital@1&DM+Sans:wght@400;500`

**Scale:**
```
--text-xs:   0.75rem   (12px) — timestamps
--text-sm:   0.875rem  (14px) — secondary info
--text-base: 1rem      (16px) — body
--text-lg:   1.125rem  (18px) — phase prompts
--text-xl:   1.5rem    (24px) — phase name
--text-2xl:  2rem      (32px) — hero / clock center
```

#### Spacing

```
--space-xs:  0.25rem  (4px)
--space-sm:  0.5rem   (8px)
--space-md:  1rem     (16px)
--space-lg:  1.5rem   (24px)
--space-xl:  2rem     (32px)
--space-2xl: 3rem     (48px)
```

#### Radius & Shadows

| Element | Value |
|---------|-------|
| **Border radius** | `50%` for rings/circles, `12px` for settings panel |
| **Shadows** | None on UI elements. Glow only. `box-shadow: 0 0 40px var(--glow)` for breathing circle |
| **Ring stroke** | `2px` default, `3px` active ring, `1px` outer ambient rings |

---

### 3.2 Building Blocks

#### Breathing Circle (Core Element)
```css
.breathing-circle {
  width: clamp(120px, 25vmin, 200px);
  height: clamp(120px, 25vmin, 200px);
  border-radius: 50%;
  border: 2px solid var(--gold);
  box-shadow: 0 0 40px var(--glow), inset 0 0 20px var(--glow);
  animation: breathe 11s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(0.85); opacity: 0.6; }
  50%      { transform: scale(1.0);  opacity: 1.0; }
}
```
- Inhale: 0% → 50% (5.5s, expand, brighten)
- Exhale: 50% → 100% (5.5s, contract, dim)
- Always running. Never stops.

#### Ring Arc (SVG)
Each cycle rendered as an SVG `<circle>` with `stroke-dasharray` + `stroke-dashoffset` for progress.

```html
<svg viewBox="0 0 200 200">
  <!-- Background ring (full track) -->
  <circle cx="100" cy="100" r="90" fill="none" 
    stroke="var(--ring-sprint)" stroke-width="2" opacity="0.2" />
  <!-- Progress arc (current position) -->
  <circle cx="100" cy="100" r="90" fill="none" 
    stroke="var(--ring-sprint)" stroke-width="3"
    stroke-dasharray="565.48" stroke-dashoffset="[computed]"
    stroke-linecap="round" transform="rotate(-90 100 100)" />
</svg>
```

**Ring Radii (from center outward):**
| Ring | Radius (vmin) | Stroke |
|------|---------------|--------|
| Breathing circle | 12–15 | CSS animated |
| Work Pulse (4 arcs) | 18 | 3px |
| Sprint | 22 | 2px |
| Day | 28 | 2px |
| Week | 34 | 1.5px |
| Month | 40 | 1px |
| Quarter | 45 | 1px |

#### Phase Label (floating text)
```css
.phase-label {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 300;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
  font-size: var(--text-xl);
}
```

#### Transition Prompt
```css
.transition-prompt {
  font-family: 'Libre Baskerville', serif;
  font-style: italic;
  color: var(--cream);
  font-size: var(--text-lg);
  opacity: 0;
  animation: fadeIn 2s ease-in forwards;
}
```

#### Status Bar (bottom)
```css
.status-bar {
  font-family: 'DM Sans', sans-serif;
  font-size: var(--text-sm);
  color: var(--cream-muted);
  letter-spacing: 0.05em;
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
}
```

#### Settings Gear (bottom-right)
- Icon: simple ⚙ or custom SVG
- Size: 20px
- Color: `var(--cream-muted)`
- Hover: `var(--gold-dim)`
- Opens slide-up overlay with preferences

---

### 3.3 Layout Templates

#### Primary Layout (iPad Landscape — 1024×768+)
```
┌──────────────────────────────────────────────┐
│                                              │
│              [Clock Face]                    │
│         centered, 80vh × 80vh               │
│         rings fill available space           │
│                                              │
│                                              │
│   ┌──────────────────────────────────────┐   │
│   │ EMANATION · Focus · 12:04 remaining  │   │
│   │ ♄ Saturn Hour · 🌓 Waxing · Monday   │   │
│   └──────────────────────────────────────┘   │
│                                          [⚙] │
└──────────────────────────────────────────────┘
```

#### Phone Portrait (375×812)
```
┌──────────────────────┐
│ 🌓 Mon · Saturn · Q1 │  ← compact status top
│                      │
│    [Clock Face]      │
│  centered, 85vw      │
│  outer rings hidden  │
│  show: breath +      │
│  pulse + sprint only │
│                      │
│  EMANATION · Focus   │
│    12:04 remaining   │
│                  [⚙] │
└──────────────────────┘
```

#### Breakpoints
| Breakpoint | Clock Size | Rings Visible | Status |
|------------|------------|---------------|--------|
| ≥1024px (iPad landscape) | `80vmin` | All rings | Bottom bar |
| ≥768px (iPad portrait) | `75vmin` | All rings | Bottom bar |
| ≥640px (phone landscape) | `60vmin` | Breath → Day | Bottom bar |
| <640px (phone portrait) | `85vw` | Breath → Sprint | Top + Bottom |

---

### 3.4 Brandbook Integration

**Equilibrium's emotional mode: Sacred Focus.**

| Brandbook Element | Equilibrium Application |
|-------------------|------------------------|
| **Bio-Light Aesthetic** | Dark mode variant — gold light on void. The rings ARE the bio-light — living, pulsing, iridescent-adjacent |
| **8s Anti-Anxiety Motion** | Breathing circle at 11s (close to 8s standard). All other transitions ≥2s. No fast animations. |
| **Pearl Mode** | Not used in Equilibrium. This is pure Dark immersion. |
| **Charcoal Indigo (#2c3150)** | Used for settings overlay background |
| **Electric Violet (#8460ea)** | Reserved for future "active sprint" highlight if gold isn't sufficient |
| **Serif (Cormorant Garamond)** | Phase names, labels — "etched, revealed" quality |
| **Sans (DM Sans)** | Utility: time remaining, settings |
| **Voice** | Direct, Warm, Precise, Sacred — matches transition prompts |

**The Sacred Spectrum Connection:**
The screenshot Alexander shared (gold Cormorant Garamond on near-black, gradient divider, Libre Baskerville italic cream) IS the Equilibrium aesthetic. We're making this screenshot come alive as a clock.

---

### 3.5 Micro-interactions

| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| **Breathing circle** | scale(0.85→1.0→0.85), opacity(0.6→1.0→0.6) | 11s loop | `ease-in-out` |
| **Phase transition** (entry→focus→exit) | Ring segment color shift + prompt fade-in | 2s | `ease` |
| **Sprint start** | All 4 pulse arcs fade in sequentially | 1.5s total | `ease-out` |
| **Sprint end** | Pulse arcs fill to 100%, brief gold pulse, then fade to dim | 3s | `ease-in-out` |
| **Ring hover/tap** | Ring glows brighter, detail tooltip appears | 0.3s | `ease` |
| **Transition prompt appear** | Fade in from 0→1 opacity | 2s | `ease-in` |
| **Transition prompt dismiss** | Fade out after 30s (or on any interaction) | 1.5s | `ease-out` |
| **Settings open** | Slide up from bottom, `backdrop-filter: blur(8px)` | 0.4s | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **Settings close** | Slide down + blur remove | 0.3s | `ease-in` |
| **Moon phase indicator** | Subtle glow pulse every 8s (brand motion standard) | 8s | `ease-in-out` |

**Anti-patterns (NEVER do):**
- No shake, bounce, or spring animations
- No animation faster than 200ms (except hover state changes)
- No sound without user opt-in
- No interrupting popups — prompts are passive, ambient

---

## 🔥 ROAST GATE 3: UI

### Gestalt Check
- [ ] First Impression: dark void, golden rings, breathing center — does it feel sacred?
- [ ] Premium Feel: "Is this the most beautiful clock I've ever seen?"
- [ ] Consistency: gold-on-black throughout, no rogue colors
- [ ] Breathing Room: rings have space between them, text doesn't crowd

### Roast Cycles
- [ ] Cycle 1: Color harmony? Readability of cream-on-dark? Gold not too loud?
- [ ] Cycle 2: Compare to Cosmic Watch, Apple Activity Rings. Where do we exceed? Where do we fall short?
- [ ] Cycle 3: What did 1-2 miss?

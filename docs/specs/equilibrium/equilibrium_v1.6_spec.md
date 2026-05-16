# Equilibrium v6 — The Intentional Clock

> **This is the THIRD cycle through the playbook.**
> v5 is live: thick rings, labels, sprint dominance, planetary guidance.
> **v6 makes it useful.** A clock you can't read is art. A clock you set intentions on is a companion.

**Started:** 2026-02-11
**Previous versions:** [v1.1 spec](./equilibrium_v1.1_product_spec.md) · [v1.2 spec](./equilibrium_v1.2_product_spec.md)

---

## The Essence

> *A clock that teaches you to feel time.*

v1–v5 answer **"What time is it?"** at every scale. v6 asks **"What are you doing with your time?"**

That's a category shift. This is not a timer (Pomodoro counts minutes), not a calendar (Google organizes events), not a tracker (Apple Watch measures movement). This is a **purpose clock** — the first tool that shows you WHERE you are in nested cycles AND WHY you're there. The "why" is your own words, reflected back.

The intention input is the product. Everything before it — rings, colors, fills, breathing circle — was infrastructure for the moment where you type *"Ship the pricing page"* and the clock holds it for you. The 5-second pause before a sprint starts creates a cognitive anchor (implementation intention) that filters distraction automatically. The clock doesn't make you productive. It makes you **intentional**. Productivity is the side effect.

The hierarchy of intentions (sprint → day → week → moon) IS the holonic model made personal. You're always inside nested purpose. The auto-prompt at cycle boundaries (Monday morning, new moon, start of day) turns the clock into a ritual container. Over months, this builds the habit of living intentionally at every timescale.

Fixed identity colors per ring turn the clock into body knowledge. Within a week: "my blue is almost full" = "almost the weekend" — no decoding needed. Phase-as-brightness deepens this: bright = peak energy, dim = gathering. One glance, zero thinking.

The week mapping (Mon=Plan, Tue=Build, Wed=Communicate, Thu–Sun=Integrate) makes the clock an external energy pacer. The rings subtly reinforce what kind of work today is for. Because the same 4-phase pattern appears at EVERY scale, the user eventually internalizes the rhythm. They start to feel when they're in Planning vs. Building without looking.

**End game: a clock that trains you to not need the clock.**

---

## Three Changes

### 1. Ring Identity: Fixed Color + Phase-as-Brightness

**Problem:** Currently every ring changes color based on holonic phase. Green one minute, orange the next. You can't tell rings apart by color — you need labels.

**Solution:** Each ring gets ONE permanent color. The holonic phase is shown as **brightness/opacity** of that color — 4 distinct levels.

| Ring | Identity Color | Rationale |
|------|---------------|-----------|
| Sprint | 🟠 Warm Orange `#e07040` | Fire, action, urgency |
| Day | 🟡 Gold `#c9a84c` | Solar, the anchor cycle |
| Week | 🔵 Deep Blue `#4080c0` | Mercury/planetary, mental clarity |
| Moon | 🟣 Silver-Violet `#a080c0` | Lunar, intuitive |
| Quarter | 🟢 Forest Green `#60a060` | Seasonal, growth |
| Year | 🔴 Deep Rose `#c06080` | Personal, birthday-based |

**Phase brightness within each ring's color:**

| Phase | Brightness | Visual Effect |
|-------|-----------|---------------|
| Planning (0-25%) | 40% opacity | Dim — gathering |
| Building (25-50%) | 70% opacity | Bright — peak energy |
| Communicating (50-75%) | 100% opacity | Full — at its brightest |
| Integrating (75-100%) | 55% opacity | Settling — winding down |

> [!NOTE]
> The fill arc always uses the ring's identity color. Only the **opacity/brightness** changes with the holonic phase. This means at a glance: "The blue ring = my week. It's bright = I'm in the building phase of my week."

**Time numbers on each ring:**

Each ring displays two numbers positioned at strategic points:

- **Elapsed**: shown near the fill endpoint (where the arc ends), small text
- **Remaining**: shown at the 6 o'clock position (bottom of ring), slightly larger

Format is contextual per ring:
| Ring | Elapsed example | Remaining example |
|------|----------------|-------------------|
| Sprint | `38m` | `58m left` |
| Day | `10h` | `6h left` |
| Week | `Wed` | `4 days left` |
| Moon | `Day 21` | `8 days left` |
| Quarter | `Week 7` | `6 weeks left` |
| Year | `Month 2` | `10 months` |

**Decision:** Sprint and Day show numbers always. Other rings show numbers on hover (desktop) or tap (mobile). Six rings with numbers is noise — two is signal.

---

### 2. Intention System — "What is this cycle FOR?"

**The big unlock.** Currently the clock shows WHERE you are in time. v6 adds WHY you're there.

#### How it works

The user sets an **intention** (1 sentence) for each active cycle:

| Cycle | When to set | Prompt | Example |
|-------|------------|--------|---------|
| Sprint | On "Enter Deep Focus" tap | "What's your focus?" | "Ship the pricing page" |
| Day | First visit of the day (or from settings) | "What's today about?" | "Close the partnership deal" |
| Week | Monday (auto-prompt) or settings | "What's this week about?" | "Launch MVP" |
| Moon | New moon (auto-prompt) or settings | "What's this lunar cycle about?" | "Build the foundation" |

#### Moon Ring: The Lunar Holon Cycle

> *February 22, 2026 — the Holon Cycle mapped to the 27-day lunar cycle*

The four weeks of the lunar cycle ARE the four quadrants of the Holon Cycle. The sidereal cycle is **27.3 days** — the Pattern of 27 (3³).

| Week | Moon Phase | Element | Energy | What the ring should feel like |
|------|-----------|---------|--------|-------------------------------|
| **1** | Full → Last Quarter | 🔥 Fire | Will / Impulse | Dim (40%) — seed igniting in the dark. Inner fire. |
| **2** | Last Quarter → New | 💧 Water | Emanation / Flow | Medium (70%) — creative flow building. |
| **3** | New → First Quarter | 🌍 Earth | Materialization | Full (100%) — results appearing. Growth visible. |
| **4** | First Quarter → Full | 🌬️ Air | Harvest | Settling (55%) — receiving. Next intention forming. |

The moon ring's **phase-brightness** should map to this cycle: dim during the fire/seed week, brightest during materialization, settling as harvest arrives.

**Intention prompt at Full Moon**: "What came to fruition? What's forming next?"
**Intention prompt at New Moon**: "What's this lunar cycle about?" (current behavior — keep)

> *See [alexanders_operating_system.md](../../02-strategy/alexanders_operating_system.md) — The Month: Lunar Holon Cycle*

**Quarter and Year: no intention prompt.** Too abstract. These rings are pure time context.

**Auto-prompting at cycle boundaries:** The intention prompt appears automatically at natural transitions — start of day, Monday morning, new moon. This is the feature. If it's opt-in, it's dead. The user can always skip (empty Enter), but the prompt appears because the whole point is making the clock a companion, not a display.

#### The One Profound Line

Below the clock, ONE line. Not guidance. Not jargon. YOUR words back to you:

**In sprint mode:**
```
"Ship the pricing page" · 14:22 left
```

**In ambient mode:**
```
"Close the partnership deal"
```
(Shows the day intention. If no day intention set, shows the week intention. Falls back through the hierarchy: sprint → day → week → moon → planetary energy.)

#### Intention Input UI

When the user taps "Enter Deep Focus":
1. ~~Immediately starts sprint~~ → Instead: a **clean input screen** appears
2. One text field: *"What's your focus for this sprint?"*
3. Optional — user can skip (press Enter with empty field → uses last sprint intention or none)
4. Sprint starts after input

For day/week/moon intentions:
- Set via the **Settings overlay** (new section: "Intentions")
- Auto-prompted at natural cycle boundaries (start of day, Monday, new moon)

#### Storage

```
eq-intentions: {
  sprint: { text: "Ship the pricing page", setAt: timestamp },
  day: { text: "Close the deal", setAt: timestamp },
  week: { text: "Launch MVP", setAt: timestamp },
  moon: { text: "Build the foundation", setAt: timestamp }
}
```

Intentions auto-clear when their cycle ends (sprint intention clears on sprint end, day intention clears at midnight, etc.)

---

### 3. Sprint Clarity — "96 Minutes. 4 Phases. Here's where you are."

**Problem:** The user sees "PLANNING · 3:38" but doesn't know:
- How long is a sprint? (96 min — never stated)
- How long is the Planning phase? (24 min — never stated)
- What comes next? (Building — but when?)
- How many phases are there? (4 — but where are they?)

**Solution:** Make the sprint structure visible at a glance.

#### Sprint Phase Bar

A thin **horizontal bar** below the phase label showing all 4 phases:

```
  ████████░░░░░░░░░░░░░░░░░░░░░░
  PLAN    BUILD    COMMUNICATE   INTEGRATE
  ← 24m →← 24m →← 24m ────→← 24m ──→
```

- Current phase is highlighted (filled), others are dimmed
- A small marker shows exact position within current phase
- Phase names abbreviated: **P · B · C · I**
- Total "96 min" shown once, somewhere unobtrusive

#### Sprint Entry Screen

When user taps "Enter Deep Focus", they see:

```
┌─────────────────────────────────────┐
│                                      │
│    What's your focus?                │
│    ________________________________  │
│    "Ship the pricing page"           │
│                                      │
│    96 minutes · 4 phases             │
│    Plan → Build → Communicate →      │
│    Integrate                         │
│                                      │
│         [ BEGIN ]                     │
│                                      │
│         skip →                       │
│                                      │
└──────────────────────────────────────┘
```

This solves:
- ✅ User knows it's 96 minutes before committing
- ✅ User knows the 4-phase structure
- ✅ User sets an intention (or skips)

---

## Week Ring: The 7-Day Problem

The holonic 4-phase pattern maps imperfectly onto 7 days. Current mapping (`cycles.ts`):

| Phase | Days (current code) | Days (Alexander's model) |
|-------|-------------------|--------------------------|
| Planning | Monday | Monday |
| Building | Tue–Wed | Tuesday |
| Communicating | Thu–Fri | Wednesday |
| Integrating | Sat–Sun | Thu–Sun |

> [!WARNING]
> **Alexander's model differs from the current code.** His lived experience: Mon = plan, Tue = build, Wed = communicate/ship, Thu–Sun = integrate/rest. This gives 4 days to integration — reflecting that most of life is integration, not production. The code currently gives 2 days each to Building and Communicating.

**Recommended:** Update to Alexander's model:
```typescript
// Mon = WILL (Planning), Tue = EMANATION (Building),
// Wed = DIGESTION (Communicating), Thu-Sun = ENRICHMENT (Integrating)
if (dayOfWeek === 1) return HOLONIC_PHASES[0]; // Mon
if (dayOfWeek === 2) return HOLONIC_PHASES[1]; // Tue
if (dayOfWeek === 3) return HOLONIC_PHASES[2]; // Wed
return HOLONIC_PHASES[3]; // Thu-Sun
```

**Status bar:** Show today's planetary energy as the ambient guidance line. "Mercury Day · Clarity & Communication" is already excellent. Keep it.

---

## Visual Hierarchy Summary

```
┌───────────────────────────────────────────────────────────────┐
│                                                                │
│         YEAR  ━━━━━━━━━━━━━━━━━  (rose, dim)                 │
│        QUARTER  ━━━━━━━━━━━━━━━  (green, bright)             │
│         MOON  ━━━━━━━━━━━━━━━    (violet, medium)            │
│         WEEK  ━━━━━━━━━━━━━      (blue, bright)              │
│          DAY  ━━━━━━━━━━━        (gold, full)                │
│       SPRINT  ━━━━━━━━━          (orange, THICK in sprint)   │
│                                                                │
│              ◉ ← → ◉  (breathing circle)                     │
│                                                                │
│     "Ship the pricing page" · 14:22 left                      │
│     ████░░░░░░░░░░░░░░░░░░░░  P · B · C · I                  │
│     Sprint 2                                                   │
│                                                                │
│     16:38  ·  🗣️ Mercury Day  ·  🌘 Waning Crescent          │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

## Design Decisions (Resolved)

1. **Ring numbers:** Sprint + Day always visible. Others on hover/tap. Six numbers is noise, two is signal.
2. **Intention auto-prompt:** Yes, at every natural cycle boundary. The intention system IS the feature — burying it in settings kills it.
3. **Week mapping:** Mon=Plan, Tue=Build, Wed=Communicate, Thu–Sun=Integrate. Confirmed.

---

## Implementation Plan

6 batches, ordered by dependency. Each batch produces a working build.

---

### Batch 1: Ring Identity Colors + Phase Brightness

**Goal:** Each ring has a permanent color. Phase shows as brightness.

#### [MODIFY] [clock.ts](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/clock.ts)
- Add `color` field to each `RING_CONFIG` entry (hex string)
- `updateRing()`: set fill stroke to `config.color` instead of `getPhaseColor(phase)`
- Compute brightness from holonic phase: `PHASE_BRIGHTNESS = { will: 0.4, emanation: 0.7, digestion: 1.0, enrichment: 0.55 }`
- Apply brightness as fill opacity
- Remove `getPhaseColor` dependency from ring rendering

#### [MODIFY] [cycles.ts](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/cycles.ts)
- Export `PHASE_BRIGHTNESS` map
- No structural changes to cycle computation

**Verify:** Build clean. Rings show fixed colors with varying brightness.

---

### Batch 2: Week Mapping Update

**Goal:** Mon=Plan, Tue=Build, Wed=Communicate, Thu–Sun=Integrate.

#### [MODIFY] [cycles.ts](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/cycles.ts)
- `getWeekHolonicPhase()`: Mon→WILL, Tue→EMANATION, Wed→DIGESTION, Thu-Sun→ENRICHMENT

**Verify:** Build clean. Wednesday shows Communicating phase.

---

### Batch 3: Sprint Entry Screen + Intention Input

**Goal:** Tapping "Enter Deep Focus" shows a clean input screen with focus question, sprint structure info, and BEGIN button.

#### [MODIFY] [index.html](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/index.html)
- Add `#sprint-entry` overlay: input field, "96 minutes · 4 phases" info, BEGIN button, skip link

#### [MODIFY] [style.css](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/style.css)
- Sprint entry overlay styles (centered, dark, minimal, premium)

#### [MODIFY] [main.ts](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/main.ts)
- Sprint CTA click → show `#sprint-entry` overlay instead of starting immediately
- BEGIN click → store sprint intention in state, start sprint, hide overlay
- Skip → start sprint without intention
- Add `intentions: { sprint, day, week, moon }` to `AppState`
- Auto-clear intentions when cycle ends (sprint end, midnight, Monday, new moon)

**Verify:** Tap "Enter Deep Focus" → see input screen → type goal → BEGIN → sprint starts.

---

### Batch 4: The One Profound Line + Phase Bar

**Goal:** Below the clock: intention text + time remaining. Plus a thin 4-phase progress bar during sprint.

#### [MODIFY] [clock.ts](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/clock.ts)
- Create `#phase-bar` element: 4 segments (P · B · C · I), current highlighted
- Show phase bar only during sprint
- `update()`: accept intentions, display sprint intention + time as the "one line"

#### [MODIFY] [guidance.ts](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/guidance.ts)
- Ambient mode: return intention hierarchy (sprint → day → week → moon → planetary energy)
- The first non-empty intention in the hierarchy wins
- Sprint mode: return sprint intention + formatted time remaining

#### [MODIFY] [style.css](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/style.css)
- Phase bar styles: thin horizontal bar, 4 colored segments, current highlighted
- Intention display: italic serif, cream color, centered

#### [MODIFY] [index.html](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/index.html)
- Add `#phase-bar` container with 4 segment divs

**Verify:** Sprint shows intention + time + phase bar. Ambient shows day/week intention.

---

### Batch 5: Ring Numbers (Sprint + Day)

**Goal:** Sprint and Day rings show elapsed/remaining as small text on the ring.

#### [MODIFY] [clock.ts](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/clock.ts)
- For sprint and day rings: create SVG text elements
- Elapsed: positioned near fill endpoint, small, matches ring color
- Remaining: positioned at 6 o'clock (bottom), slightly larger
- Update each frame with computed values
- Sprint: `"38m"` / `"58m left"`
- Day: `"10h"` / `"6h left"`

**Verify:** Sprint ring shows time numbers. Day ring shows hours.

---

### Batch 6: Cycle Intention Prompts (Day/Week/Moon)

**Goal:** Auto-prompt for day, week, and moon intentions at cycle boundaries.

#### [MODIFY] [main.ts](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/main.ts)
- Track `lastPromptedDay`, `lastPromptedWeek`, `lastPromptedMoon` in state
- On each frame: check if we crossed a boundary (new day, Monday, new moon)
- If crossed: show intention overlay with cycle-appropriate prompt
- Add intention fields to Settings overlay for manual editing

#### [MODIFY] [index.html](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/index.html)
- Generalize `#sprint-entry` overlay into `#intention-overlay` that works for any cycle
- Prompt text changes based on cycle: "What's today about?" / "What's this week about?" / etc.

#### [MODIFY] [style.css](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/style.css)
- Intention overlay styles (reuse sprint entry, with cycle-specific heading color matching ring identity)

**Verify:** Open on Monday → week prompt. Open on new day → day prompt. Set intentions → they show as the "one line."

---

## Verification Plan

### Automated
- `npx tsc --noEmit` — zero errors after each batch
- `npm run build` — clean production build

### Visual (browser subagent after each batch)
1. **Batch 1:** Rings have fixed identity colors, brightness varies by phase
2. **Batch 2:** Wednesday shows Communicating phase on week ring
3. **Batch 3:** Sprint entry screen appears with intention input
4. **Batch 4:** One profound line shows below clock, phase bar during sprint
5. **Batch 5:** Sprint + Day rings show elapsed/remaining numbers
6. **Batch 6:** Cycle boundary prompts appear at right times

### Manual
- User verifies: intention flow feels natural, colors feel right, the clock feels like a companion

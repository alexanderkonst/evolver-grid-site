# Equilibrium v6 — The Intentional Clock

> **This is the THIRD cycle through the playbook.**
> v5 is live: thick rings, labels, sprint dominance, planetary guidance.
> **v6 makes it useful.** A clock you can't read is art. A clock you set intentions on is a companion.

**Started:** 2026-02-11
**Previous versions:** [v1 spec](./equilibrium_product_spec.md) · [v2 spec](./equilibrium_v2_product_spec.md)

---

## The Core Insight

v5 is beautiful but passive. You look at it. It shows you colors. But:
- You don't know what each ring MEANS at a glance (colors change with phase)
- You don't know what YOU intended for this cycle
- You can't tell how much time is left without doing mental math
- Sprint is 96 minutes but that's never stated

**v6 turns the clock from a display into a companion.**
Each ring gets a fixed identity color. Each ring carries your intention. One glance = "I'm 14 min into Building, 3 sprints deep, my sprint goal is 'Ship the landing page'."

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

## Proposed Changes

### Ring System

#### [MODIFY] [cycles.ts](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/cycles.ts)
- Add `identityColor` to each cycle state (fixed color per ring)
- Add `phaseBrightness` computed from progress (4 brightness levels)
- Update `getWeekHolonicPhase()` to Alexander's model (Mon/Tue/Wed/Thu-Sun)

#### [MODIFY] [clock.ts](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/clock.ts)
- `RING_CONFIGS`: add `color` field (fixed identity color per ring)
- `updateRing()`: use identity color + phase brightness instead of holonic phase color
- Add elapsed/remaining text elements to each ring
- Sprint ring: add phase progress bar below phase label

---

### Intention System

#### [MODIFY] [main.ts](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/main.ts)
- Add `intentions` to `AppState` (sprint, day, week, moon)
- Sprint CTA click → show intention input overlay instead of immediately starting
- Auto-clear intentions when cycle ends
- Add intention fields to Settings overlay

#### [MODIFY] [index.html](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/index.html)
- Add sprint intention input overlay HTML
- Add intention fields to settings panel

#### [MODIFY] [style.css](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/style.css)
- Sprint intention input overlay styles
- Phase progress bar styles
- Intention display styles in info area

#### [MODIFY] [guidance.ts](file:///Users/alexanderkonst/evolver-grid-site/equilibrium/src/guidance.ts)
- Ambient fallback: show intention hierarchy (sprint → day → week → moon → planetary energy)
- Sprint mode: show sprint intention + time remaining

---

## Verification Plan

### Automated
- `npx tsc --noEmit` — zero errors
- `npm run build` — clean production build

### Visual (browser subagent)
1. **Ambient mode:** Each ring has its own fixed color. Brightness varies by phase. Numbers visible on sprint + day rings.
2. **Sprint entry:** Tapping "Enter Deep Focus" shows intention input. Typing a goal and pressing Begin starts the sprint with the intention shown below.
3. **Sprint mode:** Sprint ring thick + orange. Phase bar visible. Intention displayed. "Sprint 1" from real log.
4. **Cycle boundary:** When day changes, day intention clears. When sprint ends, sprint intention clears.

### Manual
- User verifies: ring colors feel right, brightness levels are distinct, intention flow is natural

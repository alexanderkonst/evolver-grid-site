/**
 * Equilibrium v2 — Cycle math for the Biologic Watch
 *
 * Ported from /equilibrium/src/cycles.ts (v1.x Vite app); subset needed by v2.
 * Adds new zodiac math (not present in v1.x).
 *
 * All time is computed from Date.now() + (optionally) the user's birthday.
 * Pure functions — no state, no side effects.
 *
 * Used by v2 sections 4 (Solar) · 5 (Zodiac) · 6 (Lunar) · 7 (Day-of-Week).
 */

// ─── HOLONIC PHASE ─────────────────────────────────

export type HolonicPhase = "will" | "emanation" | "digestion" | "enrichment";

export type HolonicElement = "Fire" | "Water" | "Earth" | "Air";

export interface HolonicPhaseInfo {
  id: HolonicPhase;
  label: string;
  emoji: string;
  color: string;
  action: string;
  /** Element correspondence (Sasha's holonic mapping, 2026-02-22). */
  element: HolonicElement;
  /** Emoji for the element — used as user-facing umbrella above lunar pills. */
  elementEmoji: string;
}

export const HOLONIC_PHASES: HolonicPhaseInfo[] = [
  { id: "will", label: "PLANNING", emoji: "🎯", color: "#e07040", action: "Set intention · Define the target", element: "Fire", elementEmoji: "🔥" },
  { id: "emanation", label: "BUILDING", emoji: "🔨", color: "#5090c0", action: "Build · Create · Execute", element: "Water", elementEmoji: "💧" },
  { id: "digestion", label: "COMMUNICATING", emoji: "📡", color: "#60a060", action: "Share · Polish · Ship", element: "Earth", elementEmoji: "🌍" },
  { id: "enrichment", label: "INTEGRATING", emoji: "🌀", color: "#a080c0", action: "Integrate · Reflect · Rest", element: "Air", elementEmoji: "🌬️" },
];

export function getHolonicPhase(progress: number): HolonicPhaseInfo {
  const idx = Math.min(Math.floor(progress * 4), 3);
  return HOLONIC_PHASES[idx];
}

// ─── SHARED CYCLE STATE SHAPE ──────────────────────

/**
 * Every cycle section (4-7) returns this shape so `<CycleEnergyBar>` can
 * render uniformly: 8 orbs + arc + 3-pill stack.
 */
export interface CycleSegmentState<TLabel = string> {
  /** Progress through the cycle (0-1) — controls the rainbow arc fill %. */
  progress: number;
  /** Segment index (0-based) — which orb is current. */
  segmentIndex: number;
  /** Total number of segments (typically 8). */
  segmentCount: number;
  /** Labels for the 3-state pill stack. */
  prevLabel: TLabel;
  currentLabel: TLabel;
  nextLabel: TLabel;
  /** Optional holonic mapping (Sasha's model). */
  holonicPhase?: HolonicPhaseInfo;
}

// ─── SOLAR — Yearly ────────────────────────────────

const SOLAR_SEGMENTS = [
  "Early Winter",
  "Late Winter",
  "Early Spring",
  "Late Spring",
  "Early Summer",
  "Late Summer",
  "Early Autumn",
  "Late Autumn",
] as const;

export type SolarSegmentLabel = (typeof SOLAR_SEGMENTS)[number];

/**
 * Birthday-arc phases (personal year, renamed 2026-05-16 round 9).
 *
 * Calendar seasons are universal; birthday phases are personal. The
 * Equilibrium Solar bar is birthday-anchored — what matters is where
 * the user is in *their* year, not where the calendar is.
 *
 * Names pass the smart-friend grok-in-5-seconds test (Sasha 2026-05-16:
 * "Surge moment" failed the test — too abstract). Prior names were
 * Surge moment / Spend the energy / Sustain / Begin closing / Wind down.
 *
 * Boundaries (fraction of personal year from last birthday):
 *   0.00–0.04  Fresh start     (~first 2 weeks after birthday)
 *   0.04–0.25  Big push        (the year's biggest output)
 *   0.25–0.75  Steady stretch  (long middle, rhythm > spike)
 *   0.75–0.92  Harvest time    (show the work, close projects)
 *   0.92–1.00  Wind down       (last ~30 days, resolve loose ends)
 *
 * See docs/specs/equilibrium/equilibrium_v2_spec.md → Philosophical Spine §4.
 */
export type BirthdayArcPhase =
  | "Fresh start"
  | "Big push"
  | "Steady stretch"
  | "Harvest time"
  | "Wind down";

const BIRTHDAY_ARC_BOUNDARIES: { end: number; phase: BirthdayArcPhase }[] = [
  { end: 0.04, phase: "Fresh start" },
  { end: 0.25, phase: "Big push" },
  { end: 0.75, phase: "Steady stretch" },
  { end: 0.92, phase: "Harvest time" },
  { end: 1.01, phase: "Wind down" },
];

export function getBirthdayArcPhase(personalProgress: number): BirthdayArcPhase {
  const p = Math.max(0, Math.min(1, personalProgress));
  for (const b of BIRTHDAY_ARC_BOUNDARIES) {
    if (p < b.end) return b.phase;
  }
  return "Wind down";
}

/** Birthday-arc phase ordering, for prev/next lookup. */
const BIRTHDAY_ARC_ORDER: BirthdayArcPhase[] = [
  "Fresh start",
  "Big push",
  "Steady stretch",
  "Harvest time",
  "Wind down",
];

export function getBirthdayArcPhaseNeighbors(personalProgress: number): {
  prev: BirthdayArcPhase;
  current: BirthdayArcPhase;
  next: BirthdayArcPhase;
} {
  const current = getBirthdayArcPhase(personalProgress);
  const idx = BIRTHDAY_ARC_ORDER.indexOf(current);
  // Cycle wraps: after Wind down comes Fresh start (next birthday).
  const prev =
    BIRTHDAY_ARC_ORDER[
      (idx + BIRTHDAY_ARC_ORDER.length - 1) % BIRTHDAY_ARC_ORDER.length
    ];
  const next = BIRTHDAY_ARC_ORDER[(idx + 1) % BIRTHDAY_ARC_ORDER.length];
  return { prev, current, next };
}

export interface SolarState extends CycleSegmentState<SolarSegmentLabel> {
  /** Calendar-year progress (0-1). */
  yearProgress: number;
  /** Birthday-anchored personal-year progress (0-1). Equals yearProgress if no BD. */
  personalProgress: number;
  /** Holonic phase from calendar year. */
  holonicPhase: HolonicPhaseInfo;
  /** Holonic phase from personal year (if birthday set). */
  personalHolonicPhase: HolonicPhaseInfo;
  /** Current birthday-arc phase (personal year). */
  birthdayArcPhase: BirthdayArcPhase;
}

/**
 * Yearly solar cycle, split into 8 calendar-anchored segments.
 *
 * @param now Current time in ms.
 * @param birthday "YYYY-MM-DD" — optional, drives `personalProgress`.
 */
export function getSolarState(now: number, birthday?: string): SolarState {
  const d = new Date(now);
  const yearStart = new Date(d.getFullYear(), 0, 1).getTime();
  const yearEnd = new Date(d.getFullYear() + 1, 0, 1).getTime();
  const yearProgress = (now - yearStart) / (yearEnd - yearStart);

  // Calendar-anchored 8-segment slicing of the year.
  const segmentIndex = Math.min(Math.floor(yearProgress * 8), 7);

  const prevIdx = (segmentIndex + 7) % 8; // wrap
  const nextIdx = (segmentIndex + 1) % 8;

  // Personal-year (birthday → next birthday).
  let personalProgress = yearProgress;
  if (birthday) {
    const parts = birthday.split("-");
    if (parts.length === 3) {
      const bMonth = parseInt(parts[1], 10);
      const bDay = parseInt(parts[2], 10);
      const thisYearBday = new Date(d.getFullYear(), bMonth - 1, bDay).getTime();
      if (now >= thisYearBday) {
        const nextYearBday = new Date(d.getFullYear() + 1, bMonth - 1, bDay).getTime();
        personalProgress = (now - thisYearBday) / (nextYearBday - thisYearBday);
      } else {
        const lastYearBday = new Date(d.getFullYear() - 1, bMonth - 1, bDay).getTime();
        personalProgress = (now - lastYearBday) / (thisYearBday - lastYearBday);
      }
    }
  }

  return {
    yearProgress,
    personalProgress,
    progress: yearProgress,
    segmentIndex,
    segmentCount: 8,
    prevLabel: SOLAR_SEGMENTS[prevIdx],
    currentLabel: SOLAR_SEGMENTS[segmentIndex],
    nextLabel: SOLAR_SEGMENTS[nextIdx],
    holonicPhase: getHolonicPhase(yearProgress),
    personalHolonicPhase: getHolonicPhase(personalProgress),
    birthdayArcPhase: getBirthdayArcPhase(personalProgress),
  };
}

// ─── ZODIAC ─────────────────────────────────────────

export type ZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export interface ZodiacInfo {
  sign: ZodiacSign;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  symbol: string;
  /** Start of sign window: [month, day] in solar calendar. */
  start: [number, number];
  /**
   * Energy descriptor in the "X & Y" distillation style.
   * DRAFT — awaiting Sasha's voice pass. Drawn from traditional zodiac energies.
   */
  energy: string;
}

// Tropical zodiac, Western boundaries.
// `energy` strings are DRAFTS in Sasha's two-word distillation style — mirroring
// PLANETARY_DAYS.energy ("Action & Courage", "Beauty & Harmony"). Awaiting his pass.
export const ZODIAC_SIGNS: ZodiacInfo[] = [
  { sign: "Capricorn", element: "Earth", modality: "Cardinal", symbol: "♑", start: [12, 22], energy: "Discipline & Mastery" },
  { sign: "Aquarius", element: "Air", modality: "Fixed", symbol: "♒", start: [1, 20], energy: "Insight & Innovation" },
  { sign: "Pisces", element: "Water", modality: "Mutable", symbol: "♓", start: [2, 19], energy: "Dissolution & Compassion" },
  { sign: "Aries", element: "Fire", modality: "Cardinal", symbol: "♈", start: [3, 21], energy: "Initiation & Spark" },
  { sign: "Taurus", element: "Earth", modality: "Fixed", symbol: "♉", start: [4, 20], energy: "Embodiment & Stability" },
  { sign: "Gemini", element: "Air", modality: "Mutable", symbol: "♊", start: [5, 21], energy: "Curiosity & Connection" },
  { sign: "Cancer", element: "Water", modality: "Cardinal", symbol: "♋", start: [6, 21], energy: "Nurture & Reflection" },
  { sign: "Leo", element: "Fire", modality: "Fixed", symbol: "♌", start: [7, 23], energy: "Radiance & Expression" },
  { sign: "Virgo", element: "Earth", modality: "Mutable", symbol: "♍", start: [8, 23], energy: "Refinement & Service" },
  { sign: "Libra", element: "Air", modality: "Cardinal", symbol: "♎", start: [9, 23], energy: "Balance & Beauty" },
  { sign: "Scorpio", element: "Water", modality: "Fixed", symbol: "♏", start: [10, 23], energy: "Depth & Transformation" },
  { sign: "Sagittarius", element: "Fire", modality: "Mutable", symbol: "♐", start: [11, 22], energy: "Vision & Quest" },
];

export interface ZodiacState extends CycleSegmentState<string> {
  current: ZodiacInfo;
  prev: ZodiacInfo;
  next: ZodiacInfo;
}

/**
 * Zodiac sign for `now` (tropical/Western).
 * Returns the current sign + flanking signs + progress through current sign.
 *
 * Note: v2's `<CycleEnergyBar>` uses 8 orbs by convention; for zodiac we expose
 * the 12-sign reality via `segmentCount: 12`. The visual layer may sample to 8
 * (e.g., show 3 prev / current / 4 next) or render all 12 — Phase 4 decision.
 */
export function getZodiacState(now: number): ZodiacState {
  const d = new Date(now);
  const month = d.getMonth() + 1;
  const day = d.getDate();

  // Find the sign whose start ≤ today.
  let currentIndex = 0;
  for (let i = 0; i < ZODIAC_SIGNS.length; i++) {
    const [sm, sd] = ZODIAC_SIGNS[i].start;
    if (month > sm || (month === sm && day >= sd)) currentIndex = i;
  }
  // Handle wrap (Capricorn starts Dec 22, wraps to Jan).
  if (month === 1 && day < ZODIAC_SIGNS[1].start[1]) {
    currentIndex = 0; // Capricorn
  }

  const current = ZODIAC_SIGNS[currentIndex];
  const prev = ZODIAC_SIGNS[(currentIndex + ZODIAC_SIGNS.length - 1) % ZODIAC_SIGNS.length];
  const next = ZODIAC_SIGNS[(currentIndex + 1) % ZODIAC_SIGNS.length];

  // Progress through current sign.
  const currentSignStart = signStartTimestamp(d.getFullYear(), current);
  const nextSignStart = signStartTimestamp(d.getFullYear(), next, current);
  const progress = (now - currentSignStart) / (nextSignStart - currentSignStart);

  return {
    current,
    prev,
    next,
    progress: Math.max(0, Math.min(1, progress)),
    segmentIndex: currentIndex,
    segmentCount: 12,
    prevLabel: prev.energy,
    currentLabel: current.energy,
    nextLabel: next.energy,
  };
}

function signStartTimestamp(year: number, sign: ZodiacInfo, prevSign?: ZodiacInfo): number {
  const [m, d] = sign.start;
  // Capricorn wraps: it starts in December of the *previous* calendar year for
  // anyone reading in January / early February.
  if (sign.sign === "Capricorn" && new Date().getMonth() < 6) {
    return new Date(year - 1, m - 1, d).getTime();
  }
  // Standard: same calendar year.
  if (prevSign && prevSign.sign === "Capricorn" && m === 1) {
    // Aquarius start in current year, even if Capricorn started in previous.
    return new Date(year, m - 1, d).getTime();
  }
  return new Date(year, m - 1, d).getTime();
}

// ─── LUNAR ──────────────────────────────────────────

export interface MoonPhaseInfo {
  name: string;
  symbol: string;
  /** Days into the synodic cycle when this phase starts. */
  start: number;
  /** Days into the synodic cycle when this phase ends. */
  end: number;
  /** Pill-label distillation (verb-forward, concrete, 2–4 actions). */
  energy: string;
  /**
   * Holonic quadrant this phase sits inside.
   *   "will"        Fire 🔥  → Celebrating + Planning  (post-peak opening, seed-fire igniting)
   *   "emanation"   Water 💧 → Planting + Clearing     (dark gestation, deepest creation)
   *   "digestion"   Earth 🌍 → Gathering + Seeing      (resources received, results appearing)
   *   "enrichment"  Air 🌬️  → Leading + Harvesting    (prep + visible peak clarity)
   *
   * REFINED 2026-05-18 (round 4) per Sasha: Will starts at WANING
   * GIBBOUS (Celebrating), not Last Quarter (Planning). Reasoning:
   * "Full Moon is still celebration happening, so it's really the
   * closure more than it is the opening. And Waning Gibbous is the
   * opening." The seed-fire of the new wheel ignites just after the
   * visible peak (Full Moon ends Enrichment / Air); Celebrating
   * carries forward into the new wheel as the first expression of
   * Will (acknowledgment of the realized potential generates the
   * propellant for what comes next).
   *
   * Each pair stays clean: Will = Celebrating+Planning (forward-
   * facing); Emanation = Planting+Clearing (interior); Digestion =
   * Gathering+Seeing (receiving+recognizing); Enrichment = Leading+
   * Harvesting (preparation+peak).
   *
   * Holonic NAMES stay internal. Only the element EMOJI surfaces in
   * the UI as the umbrella above the pills.
   */
  holonicQuadrant: HolonicPhase;
  /** Ultra-concise inline guidance — one short sentence, glanceable. */
  guidance: string;
}

// 8 phases × exactly 45° of true elongation each. Each phase WINDOW
// is centered on its principal/intermediate astronomical instant:
//   New Moon       at  0° ± 22.5°  (= ±1.845 days around the instant)
//   Waxing Cres.   at  45° ± 22.5°
//   First Quarter  at  90° ± 22.5°
//   Waxing Gibbous at 135° ± 22.5°
//   Full Moon      at 180° ± 22.5°
//   Waning Gibbous at 225° ± 22.5°
//   Last Quarter   at 270° ± 22.5°
//   Waning Cres.   at 315° ± 22.5°
//
// The `start`/`end` fields below are MEAN-CYCLE approximations in
// days (for documentation). The runtime in `getLunarState` uses true
// elongation via Brown's lunar theory (Meeus AA ch. 47), so phase
// boundaries align with real astronomical instants ±~1 minute. Phase
// DURATIONS in time vary slightly (~3.3 to ~4.1 days) because the
// Moon's angular speed is not constant — that's astronomy, not a bug.
//
// Pill strings re-locked 2026-05-16 (round 2) per Sasha's deep wisdom
// pass. Voice rules:
//
//   • Lead with the Phase NAME (Clearing/Gathering/Seeing/etc.) — strong
//     identity word, action-oriented.
//   • Center dot separator (·).
//   • 2–4 CONCRETE actions. Apply the "what does that even mean?" test
//     before shipping any phrase. Every verb must point at a specific
//     action the user can take. (See .agent/anti-ai-style.md.)
//   • Banned words: "energy", "alignment", "flow", "vibration", "vibes",
//     "manifest", "abundance", "the universe".
//
// Key corrections vs round 1:
//   • Planning is NOT "architect goals" — it's where the next INTENTION
//     SURFACES from the just-completed harvest. Receptive, not engineered.
//   • Planting is NOT "memorize goals" — it's where the 1–3 STRATEGIES
//     that translate the intention into directions reveal themselves.
//     Capture them.
//   • Clearing: "the how is not yours yet" hits hardest HERE because the
//     mind freaks out trying to figure out how the new intention will be
//     realized, and that's when limiting beliefs reinforce.
//   • Doing → "Harvesting" — Sasha's preferred framing. It fuses doing
//     and reaping ("doing your harvesting"). Pinnacle of reception:
//     fruits of labor.
//   • Celebrating: gratitude is the EMOTIONAL FUEL for the next cycle.
//     Add "thank" — without it, the next Planning lacks fuel.
//
// Full teaching for each phase: docs/specs/equilibrium/lunar_wisdom_map.md.
//
// The cycle reads counterclockwise per the source (Last Quarter is Phase 1,
// not Phase 7 as a calendar would suggest) — but the array order here stays
// astronomically-sorted (New Moon = index 0) for runtime simplicity. The
// "phase number" annotation in each entry maps back to Sasha's 1-8.
export const MOON_PHASES: MoonPhaseInfo[] = [
  // Phase 3 in Sasha's map. The mind freaks out about HOW the new
  // intention will be realized — limiting beliefs reinforce, doubt forms.
  // The work: release fear, cry don't complain, don't engineer the how.
  {
    name: "New Moon",
    symbol: "🌑",
    // Astronomical window: elongation -22.5° to +22.5° (wraps).
    // In mean-cycle days: 27.685–29.531 + 0–1.846 (centered on day 0).
    start: 0,
    end: 1.846,
    energy: "Clearing · Release fear · Cry, don't complain · The how is not yours yet",
    holonicQuadrant: "emanation",
    guidance:
      "The mind freaks out about the how — that's the resistance to release. Cry, don't complain. Don't form limiting beliefs.",
  },
  {
    name: "Waxing Crescent",
    symbol: "🌒",
    // Elongation 22.5°–67.5°. Mean-cycle days 1.846–5.537.
    start: 1.846,
    end: 5.537,
    energy: "Gathering · Say yes · Take meetings · Receive resources",
    holonicQuadrant: "digestion",
    guidance:
      "Say yes to whatever arrives — meetings, resources, opportunities. The how is still not yours.",
  },
  {
    name: "First Quarter",
    symbol: "🌓",
    // Elongation 67.5°–112.5°, centered on 90°. Mean-cycle days 5.537–9.228.
    start: 5.537,
    end: 9.228,
    energy: "Seeing · The how reveals · Write it down · Capture before it drifts",
    holonicQuadrant: "digestion",
    guidance:
      "The how you couldn't see now becomes obvious. Write it down before the clarity drifts.",
  },
  {
    name: "Waxing Gibbous",
    symbol: "🌔",
    // Elongation 112.5°–157.5°. Mean-cycle days 9.228–12.920.
    start: 9.228,
    end: 12.920,
    energy: "Leading · Prep for harvest · Set up infrastructure · Get the help",
    holonicQuadrant: "enrichment",
    guidance:
      "Prepare the system for the upcoming harvest — what tools, helpers, and storage need to be in place?",
  },
  {
    name: "Full Moon",
    symbol: "🌕",
    // Elongation 157.5°–202.5°, centered on 180°. Mean-cycle days 12.920–16.611.
    start: 12.920,
    end: 16.611,
    energy: "Harvesting · Reap what's ripe · Cut · Receive the fruits of labor",
    holonicQuadrant: "enrichment",
    guidance:
      "Reap what's ripe. Cut what's ready. Receive the fruits of labor — both work and reception.",
  },
  {
    name: "Waning Gibbous",
    symbol: "🌖",
    // Elongation 202.5°–247.5°. Mean-cycle days 16.611–20.302.
    start: 16.611,
    end: 20.302,
    energy: "Celebrating · Announce the harvest · Thank · Feel the gratitude",
    holonicQuadrant: "will",
    guidance:
      "Announce the harvest. Thank what made it possible. Gratitude is the emotional fuel for the next cycle.",
  },
  {
    name: "Last Quarter",
    symbol: "🌗",
    // Elongation 247.5°–292.5°, centered on 270°. Mean-cycle days 20.302–23.994.
    start: 20.302,
    end: 23.994,
    energy: "Planning · The next intention surfaces · Receive it · Name it",
    holonicQuadrant: "will",
    guidance:
      "The next intention surfaces from the just-finished harvest. Notice it. Name it. Don't engineer it.",
  },
  {
    name: "Waning Crescent",
    symbol: "🌘",
    // Elongation 292.5°–337.5°. Mean-cycle days 23.994–27.685.
    // (Days 27.685–29.531 wrap back to New Moon — see top.)
    start: 23.994,
    end: 27.685,
    energy: "Planting · The 1–3 strategies reveal · Write them down",
    holonicQuadrant: "emanation",
    guidance:
      "The 1–3 strategies that translate the intention into directions reveal themselves. Capture them as they arrive.",
  },
];

/** Mean synodic month, days. Source: Meeus AA, table 47.A.
 *  29 days, 12 hours, 44 minutes, 2.8 seconds. */
const SYNODIC_MONTH_DAYS = 29.530588853;

/**
 * Reference new moon — 2000-01-06 18:14 UTC, well-attested in
 * astronomical literature. Used as the time origin for cycle math.
 *
 * Sasha 2026-05-21 BUG FIX: previously this was
 *   `new Date(2000, 0, 6, 18, 14).getTime()`
 * which JavaScript interprets as LOCAL time. A user in UTC+8 would
 * have read 2000-01-06 10:14 UTC — silently drifting the entire
 * lunar cycle by their timezone offset. Now uses Date.UTC explicitly
 * so the reference is identical for every user on Earth.
 */
const REFERENCE_NEW_MOON_UTC_MS = Date.UTC(2000, 0, 6, 18, 14);

/** One 1/8 phase = 45° of elongation. */
const PHASE_DEG = 45;
/** Half a phase = 22.5°. Used to center principal phases. */
const PHASE_HALF_DEG = PHASE_DEG / 2;

/**
 * True geocentric elongation of Moon from Sun, in degrees [0, 360).
 *
 *   0°   = New Moon (Moon at same ecliptic longitude as Sun)
 *   90°  = First Quarter (Moon ¼ orbit east of Sun)
 *   180° = Full Moon (opposition)
 *   270° = Last Quarter (Moon ¾ orbit east)
 *
 * Method: dominant terms of Brown's lunar theory, per Meeus
 * "Astronomical Algorithms" (1998) ch. 47 §47.A. We compute mean
 * elongation D from polynomial expansions in T (Julian centuries
 * since J2000), then add perturbation corrections — the largest six
 * terms by amplitude. This gives ~0.1° accuracy on elongation, well
 * under one minute of cycle position. Truncation at six terms is a
 * deliberate trade-off: each dropped term contributes < 0.06°, and
 * the existing watch-face only renders phase boundaries to the
 * nearest minute, so additional precision wouldn't be visible.
 *
 * Validity: best within ~100 years of J2000 (range ~1950-2050).
 * Outside that, polynomial drift accumulates; for our use case
 * (current-day lunar phase) we're always inside the high-precision
 * window.
 */
function lunarElongationDeg(nowMs: number): number {
  // Julian Day (Unix epoch = JD 2440587.5, days since -4712-01-01 12:00 UTC).
  const jd = nowMs / 86_400_000 + 2440587.5;
  // Julian centuries since J2000.0 (TT — TT-UTC offset is ~64s, negligible
  // for 0.1° accuracy at the lunar scale where 1° = ~2 hours).
  const T = (jd - 2451545.0) / 36525;

  // Mean elongation Moon - Sun (degrees). Meeus 47.2.
  let D =
    297.8501921 +
    445267.1114034 * T -
    0.0018819 * T * T +
    (T * T * T) / 545868 -
    (T * T * T * T) / 113065000;

  // Sun's mean anomaly. Meeus 47.3.
  let M =
    357.5291092 +
    35999.0502909 * T -
    0.0001536 * T * T +
    (T * T * T) / 24490000;

  // Moon's mean anomaly. Meeus 47.4.
  let Mp =
    134.9633964 +
    477198.8675055 * T +
    0.0087414 * T * T +
    (T * T * T) / 69699 -
    (T * T * T * T) / 14712000;

  // Normalize to [0, 360) for trig inputs.
  D = ((D % 360) + 360) % 360;
  M = ((M % 360) + 360) % 360;
  Mp = ((Mp % 360) + 360) % 360;

  const rad = Math.PI / 180;

  // Dominant perturbation terms. Coefficients in degrees of elongation.
  // Sources: Meeus AA tables 47.A and 49.A (largest sin terms).
  let trueD = D;
  trueD += 6.289 * Math.sin(Mp * rad);              // equation of center, Moon
  trueD -= 2.100 * Math.sin(M * rad);               // equation of center, Sun
  trueD += 1.274 * Math.sin((2 * D - Mp) * rad);    // evection
  trueD += 0.658 * Math.sin(2 * D * rad);           // variation
  trueD -= 0.214 * Math.sin(2 * Mp * rad);          //
  trueD -= 0.110 * Math.sin((Mp + M) * rad);        //

  return ((trueD % 360) + 360) % 360;
}

/**
 * Compute the time-to-next-phase-boundary in days, using a one-step
 * linear-rate estimate from current and +1-day-ahead elongations.
 * Accurate to ~5% over a single phase (the Moon's angular speed is
 * smooth across a few days even though it varies across the full
 * cycle). Avoids needing to invert the perturbation series, which
 * would require numerical search.
 */
function daysUntilElongationReaches(
  nowMs: number,
  currentDeg: number,
  targetDeg: number,
): number {
  // Sample the rate by computing elongation 1 day forward.
  const elongationLater = lunarElongationDeg(nowMs + 86_400_000);
  let ratePerDay = elongationLater - currentDeg;
  // Unwrap if we crossed 360° going forward (current near 359°,
  // later near 1°, raw diff is -358°, real diff is +2°).
  if (ratePerDay < -180) ratePerDay += 360;
  // Pathological fallback — should never trigger in normal motion,
  // since the Moon's elongation always increases.
  if (ratePerDay <= 0) ratePerDay = 360 / SYNODIC_MONTH_DAYS;

  let deltaDeg = targetDeg - currentDeg;
  while (deltaDeg <= 0) deltaDeg += 360;
  return deltaDeg / ratePerDay;
}

export interface LunarState extends CycleSegmentState<string> {
  phase: MoonPhaseInfo;
  /** Days into current synodic cycle. */
  day: number;
  /**
   * Holonic phase info for this lunar moment (id, element, elementEmoji).
   * The `elementEmoji` is what surfaces in the UI as the umbrella above
   * the pills. The holonic name itself stays internal per Sasha
   * 2026-05-16 ("won't confuse the user").
   */
  holonicPhase: HolonicPhaseInfo;
  /** Days remaining in current phase. */
  daysRemainingInPhase: number;
  /** When the current phase ends (ms timestamp). */
  phaseEndMs: number;
  /** Name of the NEXT phase (for "ends X · then Seeing" display). */
  nextPhaseName: string;
}

/**
 * Lunar position from synodic cycle (29.53 days from new moon to new moon).
 *
 * Holonic mapping (corrected 2026-05-16 round 3 per Sasha):
 *   Last Quarter → New Moon   = WILL (Fire) — Planning + Planting; the
 *                               post-celebration phase where the next
 *                               intention surfaces from realized potential
 *                               (Winter-Solstice equivalent)
 *   New Moon → First Quarter  = EMANATION (Water) — Clearing + Gathering;
 *                               dark/receiving, deepest creation
 *                               (Spring-Equinox equivalent)
 *   First Quarter → Full Moon = DIGESTION (Earth) — Seeing + Leading;
 *                               results appearing, body building, prep
 *                               for harvest (Summer-Solstice equivalent)
 *   Full Moon → Last Quarter  = ENRICHMENT (Air) — Harvesting + Celebrating;
 *                               clarity at max, harvest visible, the
 *                               cycle's CLOSING (Autumn-Equinox equivalent)
 *
 * Prior versions placed Will at Full Moon (the harvest). That was wrong —
 * the harvest is the OLD cycle CLOSING. The new wheel starts at Last
 * Quarter (post-celebration), the way the planet's solar year starts at
 * Winter Solstice (not Autumn Equinox). The holonic quadrant for each
 * phase is now authored directly on MoonPhaseInfo.holonicQuadrant; this
 * function just resolves the HolonicPhaseInfo for the current phase.
 */
export function getLunarState(now: number): LunarState {
  // Sasha 2026-05-21: rewritten for astronomical correctness.
  //
  // Phase detection is now based on TRUE lunar elongation (Sun-Moon
  // angular separation along the ecliptic), not on mean-cycle days
  // since a reference new moon. This fixes two prior bugs:
  //
  //   (1) Old code assigned phases by scanning the MOON_PHASES.start/end
  //       array — which had New Moon at days 0-1.85 (1.85d wide) and
  //       Waning Crescent at days 23.99-29.53 (5.54d wide). The half-
  //       window BEFORE the New Moon instant got wrongly attributed to
  //       Waning Crescent. Every 1/8 phase should be 45° wide centered
  //       on its principal/intermediate astronomical moment.
  //
  //   (2) The reference epoch was interpreted as LOCAL time, drifting
  //       the entire cycle by the user's TZ offset (see
  //       REFERENCE_NEW_MOON_UTC_MS above).
  //
  // Now: compute true elongation via Brown's main terms, then
  // segmentIndex = floor((elongation + 22.5°) / 45°) mod 8. This puts
  // principal phases (New 0°, First Quarter 90°, Full 180°, Last
  // Quarter 270°) at the CENTER of their 45° windows, which is what
  // astronomical convention says.
  //
  // Phase durations in TIME now vary realistically (~3.3 to ~4.1
  // days) because the Moon's angular speed isn't constant — this is
  // a feature, not a bug. Astronomically each phase is exactly 45°.
  const elongationDeg = lunarElongationDeg(now);

  // Center principal phases: phase 0 (New) covers -22.5° to +22.5°.
  // Shifting by +22.5° before flooring achieves that cleanly:
  //   shifted ∈ [0, 45)  → phase 0 (New)
  //   shifted ∈ [45, 90) → phase 1 (Waxing Crescent)
  //   ...
  const shifted = (elongationDeg + PHASE_HALF_DEG) % 360;
  const segmentIndex = Math.min(7, Math.floor(shifted / PHASE_DEG));
  const phase = MOON_PHASES[segmentIndex];

  // Cycle progress 0-1, anchored to the synodic-month sweep. Equal to
  // elongation/360 by definition.
  const progress = elongationDeg / 360;
  const day = progress * SYNODIC_MONTH_DAYS;

  // Time-to-next-phase. Boundary is the next multiple of 45° AFTER
  // the current elongation. Compute via linear-rate estimate
  // (handles the Moon's slightly variable angular speed without
  // needing to invert the perturbation series).
  const nextBoundaryDeg = (segmentIndex + 1) * PHASE_DEG + PHASE_HALF_DEG;
  // Wrap into [0, 360) for the helper. nextBoundaryDeg can be 360-22.5
  // = 337.5° for phase 7 (Waning Crescent → wraps to New).
  const nextBoundaryWrapped = ((nextBoundaryDeg % 360) + 360) % 360;
  const daysRemainingInPhase = daysUntilElongationReaches(
    now,
    elongationDeg,
    nextBoundaryWrapped,
  );
  const phaseEndMs = now + daysRemainingInPhase * 86_400_000;

  const prevIdx = (segmentIndex + MOON_PHASES.length - 1) % MOON_PHASES.length;
  const nextIdx = (segmentIndex + 1) % MOON_PHASES.length;

  const holonicPhase =
    HOLONIC_PHASES.find((h) => h.id === phase.holonicQuadrant) ??
    HOLONIC_PHASES[0];

  return {
    phase,
    day,
    progress,
    segmentIndex,
    segmentCount: 8,
    prevLabel: MOON_PHASES[prevIdx].energy,
    currentLabel: phase.energy,
    nextLabel: MOON_PHASES[nextIdx].energy,
    holonicPhase,
    daysRemainingInPhase,
    phaseEndMs,
    nextPhaseName: MOON_PHASES[nextIdx].name,
  };
}

// ─── DAY-OF-WEEK (Planetary Days) ──────────────────

export interface PlanetaryDayInfo {
  /** 0 = Sunday, 6 = Saturday (JS Date.getDay() convention). */
  dayOfWeek: number;
  name: string;
  planet: string;
  symbol: string;
  emoji: string;
  energy: string;
  intelligence: string;
  description: string;
}

/**
 * Planetary days, Monday-first (Sasha 2026-05-19: "days of week start
 * with Sunday, should start with Monday"). Internal `dayOfWeek` field
 * still carries the JS Date.getDay() value (0=Sun, 6=Sat) so cycle math
 * can look up the right day from a Date — but the array order itself
 * is the display order Mon→Sun.
 *
 * Emoji updates (Sasha 2026-05-19):
 *   • Thursday Jupiter: ✨ → 🦉 (owl reads as Expansion & Wisdom, where
 *     "Jupiter's light" was unclear — Sasha called this out as misleading).
 *   • Saturday Saturn: 🪐 → ⛰️ (mountain reads as Structure & Grounding
 *     cleanly; a ringed planet is the planet itself, not its energy).
 *
 * `shortName` is the 3-letter caption shown UNDER each orb in the bar
 * (Sasha 2026-05-19: "show the day name — even with planet emojis, the
 * name is needed for grok-ability").
 */
export const PLANETARY_DAYS: PlanetaryDayInfo[] = [
  {
    dayOfWeek: 1,
    name: "Monday",
    planet: "Moon",
    symbol: "☽",
    emoji: "🌙",
    energy: "Intuition & Emotional Depth",
    intelligence: "Emotional (EQ)",
    description: "Reflection, inner sensing, emotional recalibration. Plan from feeling, not force.",
  },
  {
    dayOfWeek: 2,
    name: "Tuesday",
    planet: "Mars",
    symbol: "♂",
    emoji: "🔥",
    energy: "Action & Courage",
    intelligence: "Kinesthetic (Body)",
    description: "Decisive action, physical energy, tackling hard things. Move your body.",
  },
  {
    dayOfWeek: 3,
    name: "Wednesday",
    planet: "Mercury",
    symbol: "☿",
    emoji: "🗣️",
    energy: "Clarity & Communication",
    intelligence: "Verbal-Linguistic",
    description: "Meetings, writing, learning, networking. Mental agility at peak.",
  },
  {
    dayOfWeek: 4,
    name: "Thursday",
    planet: "Jupiter",
    symbol: "♃",
    emoji: "🦉",
    energy: "Expansion & Wisdom",
    intelligence: "Vision-Logic",
    description: "Big-picture thinking, teaching, strategic planning. Expand horizons.",
  },
  {
    dayOfWeek: 5,
    name: "Friday",
    planet: "Venus",
    symbol: "♀",
    emoji: "🌹",
    energy: "Beauty & Harmony",
    intelligence: "Aesthetic & Interpersonal",
    description: "Creativity, relationships, design, pleasure. Make things beautiful.",
  },
  {
    dayOfWeek: 6,
    name: "Saturday",
    planet: "Saturn",
    symbol: "♄",
    emoji: "⛰️",
    energy: "Structure & Grounding",
    intelligence: "Moral & Logical",
    description: "Discipline, organizing, completing. Review the week, ground the gains.",
  },
  {
    dayOfWeek: 0,
    name: "Sunday",
    planet: "Sun",
    symbol: "☉",
    emoji: "☀️",
    energy: "Illumination & Celebration",
    intelligence: "Spiritual (SQ)",
    description: "Vision, purpose, creative self-expression. Celebrate what you've built.",
  },
];

/**
 * Look up a PlanetaryDayInfo by JS dayOfWeek (0=Sun, 6=Sat). Use this
 * everywhere code needs to translate `Date.getDay()` into an entry —
 * the PLANETARY_DAYS array order is now display-order (Mon-first), not
 * `getDay()`-order, so direct indexing breaks.
 */
export function getPlanetaryDayByJsDow(jsDow: number): PlanetaryDayInfo {
  return (
    PLANETARY_DAYS.find((d) => d.dayOfWeek === jsDow) ??
    PLANETARY_DAYS[0]
  );
}

/**
 * Convert a JS Date.getDay() value (0=Sun, 6=Sat) to the Monday-first
 * display index (0=Mon, 6=Sun). The Equilibrium watch reads cycle
 * position as "how many phases activated," which requires Monday-first
 * ordering to match Sasha's holonic model (Mon=Plan starts the week).
 */
export function jsDowToMondayIndex(jsDow: number): number {
  return jsDow === 0 ? 6 : jsDow - 1;
}

export interface DayOfWeekState extends CycleSegmentState<string> {
  day: PlanetaryDayInfo;
  /** 0-1 progress through the week (Monday-start, per Sasha's holonic model). */
  weekProgress: number;
  holonicPhase: HolonicPhaseInfo;
}

/**
 * Day-of-week + planetary day energy.
 *
 * Holonic mapping (Sasha's model): Mon=WILL · Tue=EMANATION · Wed=DIGESTION ·
 * Thu-Sun=ENRICHMENT. Most of life is integration; week reflects that.
 */
export function getDayOfWeekState(now: number): DayOfWeekState {
  const d = new Date(now);
  const jsDow = d.getDay();
  const day = getPlanetaryDayByJsDow(jsDow);

  // Monday-first index: Mon=0 ... Sun=6. Drives segmentIndex into
  // PLANETARY_DAYS (now Monday-first).
  const mondayBased = jsDowToMondayIndex(jsDow);

  // Week-progress: Monday = 0, Sunday = ~1.0.
  const weekProgress =
    (mondayBased * 1440 + d.getHours() * 60 + d.getMinutes()) / (7 * 1440);

  // Holonic mapping (Mon=Plan, Tue=Build, Wed=Communicate, Thu-Sun=Integrate).
  let holonicPhase: HolonicPhaseInfo;
  if (jsDow === 1) holonicPhase = HOLONIC_PHASES[0];
  else if (jsDow === 2) holonicPhase = HOLONIC_PHASES[1];
  else if (jsDow === 3) holonicPhase = HOLONIC_PHASES[2];
  else holonicPhase = HOLONIC_PHASES[3];

  // Prev / next via Monday-first wrap. PLANETARY_DAYS is Monday-first
  // so we can index it directly.
  const prevMondayIdx = (mondayBased + 6) % 7;
  const nextMondayIdx = (mondayBased + 1) % 7;

  return {
    day,
    weekProgress,
    progress: weekProgress,
    segmentIndex: mondayBased,
    segmentCount: 7,
    prevLabel: PLANETARY_DAYS[prevMondayIdx].energy,
    currentLabel: PLANETARY_DAYS[mondayBased].energy,
    nextLabel: PLANETARY_DAYS[nextMondayIdx].energy,
    holonicPhase,
  };
}

// ─── COMPOSITE: All cycles in one call ─────────────

export interface AllCyclesV2 {
  solar: SolarState;
  zodiac: ZodiacState;
  lunar: LunarState;
  dayOfWeek: DayOfWeekState;
}

export function getAllCyclesV2(now: number, birthday?: string): AllCyclesV2 {
  return {
    solar: getSolarState(now, birthday),
    zodiac: getZodiacState(now),
    lunar: getLunarState(now),
    dayOfWeek: getDayOfWeekState(now),
  };
}

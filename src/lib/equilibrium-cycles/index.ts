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

export interface HolonicPhaseInfo {
  id: HolonicPhase;
  label: string;
  emoji: string;
  color: string;
  action: string;
}

export const HOLONIC_PHASES: HolonicPhaseInfo[] = [
  { id: "will", label: "PLANNING", emoji: "🎯", color: "#e07040", action: "Set intention · Define the target" },
  { id: "emanation", label: "BUILDING", emoji: "🔨", color: "#5090c0", action: "Build · Create · Execute" },
  { id: "digestion", label: "COMMUNICATING", emoji: "📡", color: "#60a060", action: "Share · Polish · Ship" },
  { id: "enrichment", label: "INTEGRATING", emoji: "🌀", color: "#a080c0", action: "Integrate · Reflect · Rest" },
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

export interface SolarState extends CycleSegmentState<SolarSegmentLabel> {
  /** Calendar-year progress (0-1). */
  yearProgress: number;
  /** Birthday-anchored personal-year progress (0-1). Equals yearProgress if no BD. */
  personalProgress: number;
  /** Holonic phase from calendar year. */
  holonicPhase: HolonicPhaseInfo;
  /** Holonic phase from personal year (if birthday set). */
  personalHolonicPhase: HolonicPhaseInfo;
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
  /** Energy descriptor (v1.x voice, preserved). */
  energy: string;
}

// 8 phases × ~3.69 days each = 29.53 day synodic cycle.
//
// Energy strings updated 2026-05-16 per Sasha's Lunar Cycle infographic
// (Tamyris Garcia map) — wisdom-preserving distillation. Full teaching for
// each phase preserved in docs/specs/equilibrium/lunar_wisdom_map.md.
// Voice rules:
//   • Lead with the Phase NAME (Planning/Planting/Clearing/etc.) — strong
//     identity word, action-oriented.
//   • Center dot separator.
//   • 2–4 word verb-forward distillation.
//   • No "energy/ethereal/vibration" language.
//
// The cycle reads counterclockwise per the source (Last Quarter is Phase 1,
// not Phase 7 as a calendar would suggest) — but the array order here stays
// astronomically-sorted (New Moon = index 0) for runtime simplicity. The
// "phase number" annotation in each entry maps back to Sasha's 1-8.
export const MOON_PHASES: MoonPhaseInfo[] = [
  // Phase 3 in Sasha's map. Dumping. Banishing ritual. Time to cry,
  // no complaining. Fear and drama surface to be cleared.
  { name: "New Moon", symbol: "🌑", start: 0, end: 1.85, energy: "Clearing · Dump, banish, cry it out" },
  // Phase 4. Receiving energy. "Yes" ritual. Talk sweet. Be open to
  // possibilities. Law of attraction in receiving mode. Raw resources arrive.
  // "The How is still none of your business."
  { name: "Waxing Crescent", symbol: "🌒", start: 1.85, end: 5.53, energy: "Gathering · Yes ritual · Receive resources" },
  // Phase 5. The "How" is revealed. Telescope vision. Ah-Ha moment.
  // The path you couldn't see during Planting/Gathering now appears.
  { name: "First Quarter", symbol: "🌓", start: 5.53, end: 9.22, energy: "Seeing · The How is revealed · Ah-Ha" },
  // Phase 6. Administration & organization phase. 90% admin, 10% work.
  // Orchestrate the sequence, prepare the field for Doing.
  { name: "Waxing Gibbous", symbol: "🌔", start: 9.22, end: 12.91, energy: "Leading · 90% admin, 10% work" },
  // Phase 7. Doing. 100% physical execution ("100% gangsta" in source).
  // High-energy GTD. Harvest and cut sweaty.
  { name: "Full Moon", symbol: "🌕", start: 12.91, end: 16.61, energy: "Doing · 100% physical · Harvest & cut" },
  // Phase 8. Celebrate. Party. Gratitude. Show off. Brag. Honor others' wins.
  // The "rinse" before the "repeat."
  { name: "Waning Gibbous", symbol: "🌖", start: 16.61, end: 20.30, energy: "Celebrating · Gratitude · Honor others' wins" },
  // Phase 1. The planning phase opens the next cycle. 2 goals. Engineer,
  // architect, decide, liberate. Fill the goals with emotion — felt, not
  // just thought.
  { name: "Last Quarter", symbol: "🌗", start: 20.30, end: 23.99, energy: "Planning · Engineer 2 goals · Fill with emotion" },
  // Phase 2. Planting. Impregnate the universe with the goals you just
  // architected. Memorize them. Daily meditate / visualize / movie them.
  // "The How is none of your business."
  { name: "Waning Crescent", symbol: "🌘", start: 23.99, end: 29.53, energy: "Planting · Memorize, visualize, surrender" },
];

const SYNODIC_MONTH_DAYS = 29.53058770576;
// 2000-01-06 18:14 UTC — known new moon reference.
const KNOWN_NEW_MOON_MS = new Date(2000, 0, 6, 18, 14).getTime();

export interface LunarState extends CycleSegmentState<string> {
  phase: MoonPhaseInfo;
  /** Days into current synodic cycle. */
  day: number;
  holonicPhase: HolonicPhaseInfo;
}

/**
 * Lunar position from synodic cycle (29.53 days from new moon to new moon).
 *
 * Holonic mapping (Sasha's Lunar Holon Cycle, 2026-02-22):
 *   Full Moon → Last Quarter = WILL (Fire) — inner fire, seed igniting
 *   Last Quarter → New Moon   = EMANATION (Water) — creative flow, deepest creation
 *   New Moon → First Quarter  = DIGESTION (Earth) — results appearing, growth
 *   First Quarter → Full Moon = ENRICHMENT (Air) — receiving abundance, new clarity
 *
 * Full Moon is at ~44% of synodic cycle; we shift progress so Full Moon = 0
 * for the holonic mapping.
 */
export function getLunarState(now: number): LunarState {
  const daysSince = (now - KNOWN_NEW_MOON_MS) / 86_400_000;
  const cyclesElapsed = daysSince / SYNODIC_MONTH_DAYS;
  const day = (cyclesElapsed % 1) * SYNODIC_MONTH_DAYS;
  const progress = day / SYNODIC_MONTH_DAYS;

  let phase = MOON_PHASES[0];
  let segmentIndex = 0;
  for (let i = 0; i < MOON_PHASES.length; i++) {
    if (day >= MOON_PHASES[i].start && day < MOON_PHASES[i].end) {
      phase = MOON_PHASES[i];
      segmentIndex = i;
      break;
    }
  }

  const prevIdx = (segmentIndex + MOON_PHASES.length - 1) % MOON_PHASES.length;
  const nextIdx = (segmentIndex + 1) % MOON_PHASES.length;

  // Lunar Holon Cycle: shift so Full Moon = start of WILL (Fire).
  const fullMoonOffset = 12.91 / SYNODIC_MONTH_DAYS; // ~0.437
  const lunarHolonProgress = (progress + (1 - fullMoonOffset)) % 1;

  return {
    phase,
    day,
    progress,
    segmentIndex,
    segmentCount: 8,
    prevLabel: MOON_PHASES[prevIdx].energy,
    currentLabel: phase.energy,
    nextLabel: MOON_PHASES[nextIdx].energy,
    holonicPhase: getHolonicPhase(lunarHolonProgress),
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

// Ported from v1.x. Voice in `energy`/`description` is Sasha's existing v1.x copy.
export const PLANETARY_DAYS: PlanetaryDayInfo[] = [
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
    emoji: "✨",
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
    emoji: "🪐",
    energy: "Structure & Grounding",
    intelligence: "Moral & Logical",
    description: "Discipline, organizing, completing. Review the week, ground the gains.",
  },
];

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
  const dow = d.getDay();
  const day = PLANETARY_DAYS[dow];

  // Week-progress: Monday = 0, Sunday = ~1.0.
  const mondayBased = dow === 0 ? 6 : dow - 1;
  const weekProgress =
    (mondayBased * 1440 + d.getHours() * 60 + d.getMinutes()) / (7 * 1440);

  // Holonic mapping (Mon=Plan, Tue=Build, Wed=Communicate, Thu-Sun=Integrate).
  let holonicPhase: HolonicPhaseInfo;
  if (dow === 1) holonicPhase = HOLONIC_PHASES[0];
  else if (dow === 2) holonicPhase = HOLONIC_PHASES[1];
  else if (dow === 3) holonicPhase = HOLONIC_PHASES[2];
  else holonicPhase = HOLONIC_PHASES[3];

  // Prev / next day-of-week (wrap Sun → Sat / Mon).
  const prevDow = (dow + 6) % 7;
  const nextDow = (dow + 1) % 7;

  return {
    day,
    weekProgress,
    progress: weekProgress,
    segmentIndex: dow,
    segmentCount: 7,
    prevLabel: PLANETARY_DAYS[prevDow].energy,
    currentLabel: PLANETARY_DAYS[dow].energy,
    nextLabel: PLANETARY_DAYS[nextDow].energy,
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

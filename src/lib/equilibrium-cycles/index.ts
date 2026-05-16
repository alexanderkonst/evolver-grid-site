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
 * Birthday-arc phases (personal year, locked 2026-05-16).
 *
 * Calendar seasons are universal; birthday phases are personal. The
 * Equilibrium Solar bar is birthday-anchored — what matters is where
 * the user is in *their* year, not where the calendar is.
 *
 * Boundaries (fraction of personal year from last birthday):
 *   0.00–0.04  Surge moment   (~first 2 weeks)
 *   0.04–0.25  Spend the energy
 *   0.25–0.75  Sustain
 *   0.75–0.92  Begin closing
 *   0.92–1.00  Wind down       (last ~30 days)
 *
 * See docs/specs/equilibrium/equilibrium_v2_philosophical_spine.md §4.
 */
export type BirthdayArcPhase =
  | "Surge moment"
  | "Spend the energy"
  | "Sustain"
  | "Begin closing"
  | "Wind down";

const BIRTHDAY_ARC_BOUNDARIES: { end: number; phase: BirthdayArcPhase }[] = [
  { end: 0.04, phase: "Surge moment" },
  { end: 0.25, phase: "Spend the energy" },
  { end: 0.75, phase: "Sustain" },
  { end: 0.92, phase: "Begin closing" },
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
  "Surge moment",
  "Spend the energy",
  "Sustain",
  "Begin closing",
  "Wind down",
];

export function getBirthdayArcPhaseNeighbors(personalProgress: number): {
  prev: BirthdayArcPhase;
  current: BirthdayArcPhase;
  next: BirthdayArcPhase;
} {
  const current = getBirthdayArcPhase(personalProgress);
  const idx = BIRTHDAY_ARC_ORDER.indexOf(current);
  // Cycle wraps: after Wind down comes Surge moment (next birthday).
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
   *   "will"        Fire 🔥  → Harvesting + Celebrating
   *   "emanation"   Water 💧 → Planning + Planting
   *   "digestion"   Earth 🌍 → Clearing + Gathering
   *   "enrichment"  Air 🌬️  → Seeing + Leading
   *
   * Per Sasha 2026-05-16: holonic NAMES stay internal (won't confuse the
   * user). Only the element EMOJI surfaces in the UI as a quiet umbrella
   * above the pills. The 8-phase pill stays primary; the holonic quadrant
   * is the umbrella for users moving from degree 2 → degree 3.
   */
  holonicQuadrant: HolonicPhase;
  /** Ultra-concise inline guidance — one short sentence, glanceable. */
  guidance: string;
}

// 8 phases × ~3.69 days each = 29.53 day synodic cycle.
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
    start: 0,
    end: 1.85,
    energy: "Clearing · Release fear · Cry, don't complain · The how is not yours yet",
    holonicQuadrant: "digestion",
    guidance:
      "The mind freaks out about the how — that's the resistance to release. Cry, don't complain. Don't form limiting beliefs.",
  },
  // Phase 4. Earth-element quadrant. Resources, meetings, opportunities
  // arrive. The work is to receive them, even when "receiving" requires
  // action. The how is still hidden.
  {
    name: "Waxing Crescent",
    symbol: "🌒",
    start: 1.85,
    end: 5.53,
    energy: "Gathering · Say yes · Take meetings · Receive resources",
    holonicQuadrant: "digestion",
    guidance:
      "Say yes to whatever arrives — meetings, resources, opportunities. The how is still not yours.",
  },
  // Phase 5. The how reveals — the path you couldn't see through Planting
  // and Gathering now becomes obvious. Capture it before it drifts.
  {
    name: "First Quarter",
    symbol: "🌓",
    start: 5.53,
    end: 9.22,
    energy: "Seeing · The how reveals · Write it down · Capture before it drifts",
    holonicQuadrant: "enrichment",
    guidance:
      "The how you couldn't see now becomes obvious. Write it down before the clarity drifts.",
  },
  // Phase 6. Prep the life-system for the upcoming harvest. Like a farmer
  // before harvest: storage, instruments, helpers. What infrastructure
  // does the harvest you're about to do require?
  {
    name: "Waxing Gibbous",
    symbol: "🌔",
    start: 9.22,
    end: 12.91,
    energy: "Leading · Prep for harvest · Set up infrastructure · Get the help",
    holonicQuadrant: "enrichment",
    guidance:
      "Prepare the system for the upcoming harvest — what tools, helpers, and storage need to be in place?",
  },
  // Phase 7. RENAMED Doing → Harvesting (Sasha 2026-05-16): fuses work
  // and reception. Pinnacle of the cycle. Reap what's ripe; receive the
  // fruits of labor. Both physical work AND collecting what's earned.
  {
    name: "Full Moon",
    symbol: "🌕",
    start: 12.91,
    end: 16.61,
    energy: "Harvesting · Reap what's ripe · Cut · Receive the fruits of labor",
    holonicQuadrant: "will",
    guidance:
      "Reap what's ripe. Cut what's ready. Receive the fruits of labor — both work and reception.",
  },
  // Phase 8. Announce the harvest. THANK what made it possible. Gratitude
  // is the emotional fuel for the next Planning — skip this phase and the
  // next cycle lacks propellant.
  {
    name: "Waning Gibbous",
    symbol: "🌖",
    start: 16.61,
    end: 20.30,
    energy: "Celebrating · Announce the harvest · Thank · Feel the gratitude",
    holonicQuadrant: "will",
    guidance:
      "Announce the harvest. Thank what made it possible. Gratitude is the emotional fuel for the next cycle.",
  },
  // Phase 1. The next intention SURFACES from the just-finished harvest.
  // Not engineered — received. The harvest realized potential; from that
  // realized potential, the next will emerges. Receptive, not designer.
  {
    name: "Last Quarter",
    symbol: "🌗",
    start: 20.30,
    end: 23.99,
    energy: "Planning · The next intention surfaces · Receive it · Name it",
    holonicQuadrant: "emanation",
    guidance:
      "The next intention surfaces from the just-finished harvest. Notice it. Name it. Don't engineer it.",
  },
  // Phase 2. The 1–3 STRATEGIES that translate the intention into
  // directions reveal themselves. This is strategy revelation, not
  // goal-memorization. Capture them as they arrive.
  {
    name: "Waning Crescent",
    symbol: "🌘",
    start: 23.99,
    end: 29.53,
    energy: "Planting · The 1–3 strategies reveal · Write them down",
    holonicQuadrant: "emanation",
    guidance:
      "The 1–3 strategies that translate the intention into directions reveal themselves. Capture them as they arrive.",
  },
];

const SYNODIC_MONTH_DAYS = 29.53058770576;
// 2000-01-06 18:14 UTC — known new moon reference.
const KNOWN_NEW_MOON_MS = new Date(2000, 0, 6, 18, 14).getTime();

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

  // Holonic phase resolved DIRECTLY from the phase's authored mapping
  // (more deterministic than progress-bucket math at phase boundaries).
  const holonicPhase =
    HOLONIC_PHASES.find((h) => h.id === phase.holonicQuadrant) ??
    HOLONIC_PHASES[0];

  // Time-to-next-phase. The current phase ends at `phase.end` days into
  // the cycle; convert that to a ms timestamp by walking forward from `now`.
  const daysRemainingInPhase = phase.end - day;
  const phaseEndMs = now + daysRemainingInPhase * 86_400_000;

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

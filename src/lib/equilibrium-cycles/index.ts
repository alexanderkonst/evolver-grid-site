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

// ─── SOLAR HOLONIC — the 4 cycles of the Sun ───────
//
// The solar year, cut by the two solstices and two equinoxes, carries
// the holon's 4-phase pattern. Each cardinal point opens one phase; the
// quarter that follows is that phase doing its work (Sasha, 2026-06-22):
//
//   Winter Solstice → WILL        🔥  the seed born in the dark
//   Spring Equinox  → EMANATION   💧  the seed breaks ground
//   Summer Solstice → DIGESTION   🌍  the fruit forms and fills
//   Autumn Equinox  → ENRICHMENT  🌬️  gather what grew, ripen the next seed
//
// BIRTHDAY-ANCHORED: a person's birthday is their personal Winter
// Solstice (their seed-point), so their year divides into these same 4
// quarters from the birthday forward. `cardinal` names the cosmic turn
// each phase corresponds to (literally true for the solstice-born, the
// archetypal lineage for everyone else). Surfaced via `personalHolonicPhase`
// on SolarState.
//
// Voice: Equilibrium rules apply (anti-ai-style.md) — concrete, charged,
// no banned words (energy/alignment/flow/manifest/abundance/the universe).
export interface SolarHolonicInfo {
  id: HolonicPhase;
  /** Life-cycle name shown to the user (grok-in-5s). */
  name: string;
  /** Cosmic cardinal point this phase corresponds to. */
  cardinal: string;
  /** Element emoji (matches HOLONIC_PHASES). */
  emoji: string;
  /** One-sentence essence in Sasha's solar voice. */
  essence: string;
}

export const SOLAR_HOLONIC: Record<HolonicPhase, SolarHolonicInfo> = {
  will: {
    id: "will",
    name: "Seeding",
    cardinal: "Winter Solstice",
    emoji: "🔥",
    essence:
      "The seed in the dark. Your year's reason forms before anything shows. Name the intention; don't force the how yet.",
  },
  emanation: {
    id: "emanation",
    name: "Sprouting",
    cardinal: "Spring Equinox",
    emoji: "💧",
    essence:
      "The seed breaks ground. What you named takes visible shape. Build it, give it, put the first work into the world.",
  },
  digestion: {
    id: "digestion",
    name: "Fruiting",
    cardinal: "Summer Solstice",
    emoji: "🌍",
    essence:
      "Full light. The fruit forms and fills. Ship the real thing, let the work be seen, bring it to ripeness.",
  },
  enrichment: {
    id: "enrichment",
    name: "Harvest",
    cardinal: "Autumn Equinox",
    emoji: "🌬️",
    essence:
      "Gather what grew. Reap it, thank it, let the field learn. The next seed is already ripening inside this one.",
  },
};

/** Display order: the wheel runs from the seed forward. */
export const SOLAR_HOLONIC_ORDER: HolonicPhase[] = [
  "will",
  "emanation",
  "digestion",
  "enrichment",
];

export function getSolarHolonic(phase: HolonicPhase): SolarHolonicInfo {
  return SOLAR_HOLONIC[phase];
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
  /**
   * Holonic phase of the ACTUAL solar year — anchored to the real
   * solstices & equinoxes (sun longitude), NOT the birthday. Same for
   * everyone: it's the sky's current season. Winter Solstice → Seeding,
   * Spring Equinox → Sprouting, Summer Solstice → Fruiting, Autumn
   * Equinox → Harvest. This is what the "4 cycles of the Sun" display
   * uses (Sasha 2026-06-22: the cycles are of the Sun, so they track the
   * Sun, not a personal anchor).
   */
  solarHolonicPhase: HolonicPhaseInfo;
  /** Current birthday-arc phase (personal year). */
  birthdayArcPhase: BirthdayArcPhase;
}

/**
 * Yearly solar cycle, BIRTHDAY-ANCHORED (Sasha 2026-05-24 round 2).
 *
 * The user's solar year runs **birthday → next birthday**, not from
 * Jan 1 (arbitrary Gregorian convention) and not from winter solstice
 * (an earlier misread of the spec). The birthday is the actual anchor:
 * each new year begins on YOUR day. The watch tracks where you are in
 * YOUR cycle.
 *
 *   yearProgress = 0   →  your birthday (the "Fresh start" phase)
 *   yearProgress ≈ 0.04 → ~2 weeks past birthday → "Big push" begins
 *   yearProgress ≈ 0.25 → ~3 months past → "Steady stretch"
 *   yearProgress ≈ 0.75 → ~9 months past → "Harvest time"
 *   yearProgress ≈ 0.92 → last ~30 days → "Wind down"
 *   yearProgress → 1   →  next birthday (cycle closes, new "Fresh start")
 *
 * The 5-phase birthday-arc mapping (Fresh start / Big push / Steady
 * stretch / Harvest time / Wind down) is computed from yearProgress
 * via `getBirthdayArcPhase`. The 8-segment wheel is also driven by
 * yearProgress so prev/current/next labels reflect birthday-anchored
 * position, not calendar season.
 *
 * Fallback when no birthday is set: solstice-anchored (sunLong=270°
 * → yearProgress=0). Astronomically grounded, never Gregorian Jan 1.
 *
 * @param now Current time in ms.
 * @param birthday "YYYY-MM-DD" — drives yearProgress. Strongly
 *   recommended; without it the cycle falls back to winter solstice
 *   anchor (still astronomical, but not personal).
 */
export function getSolarState(now: number, birthday?: string): SolarState {
  const d = new Date(now);

  // Personal year — birthday → next birthday. This is THE solar cycle
  // for the user; yearProgress and personalProgress are now the same
  // when a birthday is set.
  let personalProgress: number | null = null;
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

  // Fallback when no birthday set: solstice-anchored (still astronomical,
  // still not Jan 1). The user really should set their birthday — the
  // watch is meant to track THEIR cycle, not a planetary one.
  const solsticeYearProgress = deg360(sunTrueLongitudeDeg(now) - 270) / 360;
  const yearProgress = personalProgress ?? solsticeYearProgress;

  // 8-segment wheel driven by yearProgress (birthday-anchored when
  // available). Each segment = 1/8 of the cycle.
  const segmentIndex = Math.min(Math.floor(yearProgress * 8), 7);
  const prevIdx = (segmentIndex + 7) % 8;
  const nextIdx = (segmentIndex + 1) % 8;

  // Maintain backward compatibility: personalProgress always exposed,
  // equals yearProgress when birthday is set. When unset, personal
  // falls back to the solstice progress (same value as yearProgress).
  const effectivePersonal = personalProgress ?? solsticeYearProgress;

  return {
    yearProgress,
    personalProgress: effectivePersonal,
    progress: yearProgress,
    segmentIndex,
    segmentCount: 8,
    prevLabel: SOLAR_SEGMENTS[prevIdx],
    currentLabel: SOLAR_SEGMENTS[segmentIndex],
    nextLabel: SOLAR_SEGMENTS[nextIdx],
    holonicPhase: getHolonicPhase(yearProgress),
    personalHolonicPhase: getHolonicPhase(effectivePersonal),
    solarHolonicPhase: getHolonicPhase(solsticeYearProgress),
    birthdayArcPhase: getBirthdayArcPhase(effectivePersonal),
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
 * Tropical zodiac sign at `now`, computed from the Sun's TRUE
 * geocentric ecliptic longitude (not from fixed calendar dates).
 *
 * Sasha 2026-05-24 astronomical correction: previously this function
 * used fixed `start: [month, day]` boundaries (Aries Mar 21, etc.).
 * Real tropical zodiac transitions happen when the Sun crosses fixed
 * ecliptic longitudes (Aries = 0°, Taurus = 30°, …). These instants
 * drift by hours from year to year due to leap years + orbital
 * eccentricity — sometimes a sign change happens on Mar 19, sometimes
 * Mar 21. Now we compute the actual crossing instant via Meeus AA
 * ch. 25 (see `sunTrueLongitudeDeg` above). Accuracy ~0.005° ≈ 7
 * minutes of cycle position, well below per-minute display.
 *
 * Index mapping: ZODIAC_SIGNS[] is ordered Capricorn first (per
 * the legacy convention), so Capricorn (270°) is index 0. The
 * conversion below shifts longitude by −270° (mod 360) before
 * dividing by 30°.
 *
 * Phase WINDOW is exactly 30° of solar ecliptic motion. Duration in
 * TIME varies (~29–31 days) because the Sun's apparent speed isn't
 * constant — that's astronomy, not a bug.
 */
export function getZodiacState(now: number): ZodiacState {
  const sunLong = sunTrueLongitudeDeg(now);

  // Capricorn starts at 270°. Shift so Capricorn ingress is 0:
  //   sunLong=270 → shifted=0   → index 0 (Capricorn)
  //   sunLong=0   → shifted=90  → index 3 (Aries)
  //   sunLong=180 → shifted=270 → index 9 (Libra)
  const shifted = deg360(sunLong - 270);
  const currentIndex = Math.min(11, Math.floor(shifted / 30));

  const current = ZODIAC_SIGNS[currentIndex];
  const prev = ZODIAC_SIGNS[(currentIndex + ZODIAC_SIGNS.length - 1) % ZODIAC_SIGNS.length];
  const next = ZODIAC_SIGNS[(currentIndex + 1) % ZODIAC_SIGNS.length];

  // Progress through the current 30° window. `shifted % 30` gives
  // degrees into the sign; divide by 30 for [0, 1).
  const progress = (shifted % 30) / 30;

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

// 8 phases × exactly 45° of true elongation each. STARTS-AT-PRINCIPAL
// model (Sasha 2026-05-26): each phase WINDOW begins AT its principal/
// intermediate astronomical instant and runs 45° forward.
//
//   New Moon       starts at   0° (Clearing — release work begins)
//   Waxing Crescent starts at  45° (Gathering — yes to what arrives)
//   First Quarter  starts at  90° (Seeing — the how reveals)
//   Waxing Gibbous starts at 135° (Leading — prep for harvest)
//   Full Moon      starts at 180° (Harvesting — ship + receive)
//   Waning Gibbous starts at 225° (Celebrating — announce + thank)
//   Last Quarter   starts at 270° (Planning — intention surfaces)
//   Waning Crescent starts at 315° (Planting — strategies reveal)
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
    // Elongation 0°–45° (starts AT the New Moon instant).
    // Mean-cycle days 0.000–3.691.
    start: 0,
    end: 3.691,
    energy: "Clearing · Release fear · Cry, don't complain · The how is not yours yet",
    holonicQuadrant: "emanation",
    guidance:
      "Cry, don't complain. Release without forming beliefs. Don't discharge on others. Don't figure out the how.",
  },
  {
    name: "Waxing Crescent",
    symbol: "🌒",
    // Elongation 45°–90°. Mean-cycle days 3.691–7.383.
    start: 3.691,
    end: 7.383,
    energy: "Gathering · Say yes · Take meetings · Receive resources",
    holonicQuadrant: "digestion",
    guidance:
      "Say yes to whatever arrives — meetings, resources, opportunities. The how is still not yours.",
  },
  {
    name: "First Quarter",
    symbol: "🌓",
    // Elongation 90°–135° (starts AT the First Quarter instant).
    // Mean-cycle days 7.383–11.074.
    start: 7.383,
    end: 11.074,
    energy: "Seeing · The how reveals · Write it down · Capture before it drifts",
    holonicQuadrant: "digestion",
    guidance:
      "The how you couldn't see now becomes obvious. Write it down before the clarity drifts.",
  },
  {
    name: "Waxing Gibbous",
    symbol: "🌔",
    // Elongation 135°–180°. Mean-cycle days 11.074–14.765.
    start: 11.074,
    end: 14.765,
    energy: "Leading · Prep for harvest · Set up infrastructure · Get the help",
    holonicQuadrant: "enrichment",
    guidance:
      "Prepare the system for the upcoming harvest — what tools, helpers, and storage need to be in place?",
  },
  {
    name: "Full Moon",
    symbol: "🌕",
    // Elongation 180°–225° (starts AT the Full Moon instant).
    // Mean-cycle days 14.765–18.457.
    start: 14.765,
    end: 18.457,
    energy: "Harvesting · Reap what's ripe · Cut · Receive the fruits of labor",
    holonicQuadrant: "enrichment",
    guidance:
      "Reap what's ripe. Cut what's ready. Receive the fruits of labor — both work and reception.",
  },
  {
    name: "Waning Gibbous",
    symbol: "🌖",
    // Elongation 225°–270°. Mean-cycle days 18.457–22.148.
    start: 18.457,
    end: 22.148,
    energy: "Celebrating · Announce the harvest · Thank · Feel the gratitude",
    holonicQuadrant: "will",
    guidance:
      "Announce the harvest. Thank what made it possible. Gratitude is the emotional fuel for the next cycle.",
  },
  {
    name: "Last Quarter",
    symbol: "🌗",
    // Elongation 270°–315° (starts AT the Last Quarter instant).
    // Mean-cycle days 22.148–25.840.
    start: 22.148,
    end: 25.840,
    energy: "Planning · The next intention surfaces · Receive it · Name it",
    holonicQuadrant: "will",
    guidance:
      "The next intention surfaces from the just-finished harvest. Notice it. Name it. Don't engineer it.",
  },
  {
    name: "Waning Crescent",
    symbol: "🌘",
    // Elongation 315°–360° (= back to 0° = next New Moon).
    // Mean-cycle days 25.840–29.531.
    start: 25.840,
    end: 29.531,
    energy: "Planting · The 1–3 strategies reveal · Write them down",
    holonicQuadrant: "emanation",
    guidance:
      "The 1–3 strategies that translate the intention into directions reveal themselves. Capture them as they arrive.",
  },
];

// ═══════════════════════════════════════════════════════════════════
// ASTRONOMY — shared primitives used by lunar, zodiac, and solar.
//
// Source: Meeus, "Astronomical Algorithms" (1998), 2nd ed.
//   • Chapter 22: Nutation (skipped — not needed at our precision)
//   • Chapter 25: Solar Coordinates (used for Sun's true longitude)
//   • Chapter 47: Position of the Moon (used for Moon's elongation)
//
// Accuracy targets, after Sasha 2026-05-24 boost:
//   • Lunar elongation: ~0.02° (≈ 2 min of cycle position)
//   • Sun true longitude: ~0.005° (≈ 7 min of zodiac position)
// Both comfortably exceed the watch's display precision (minutes).
//
// Validity range: ~year 1750 to ~year 2250 with full precision.
// Outside that, the truncated polynomial expansions in T accumulate
// error, but we're never displaying historic or far-future phases.
// ═══════════════════════════════════════════════════════════════════

/** Mean synodic month, days. Meeus AA table 47.A. 29d 12h 44m 02.8s. */
const SYNODIC_MONTH_DAYS = 29.530588853;
const RAD = Math.PI / 180;
const J2000_JD = 2451545.0;
const UNIX_EPOCH_JD = 2440587.5;
const DAY_MS = 86_400_000;

/**
 * Reference new moon — 2000-01-06 18:14 UTC, well-attested in
 * astronomical literature. Kept as a documented anchor for tests.
 *
 * Historical note (Sasha 2026-05-21): the prior implementation used
 * this as the time origin via `new Date(2000, 0, 6, 18, 14)` which
 * JavaScript interprets as LOCAL time. A user in UTC+8 would have
 * read 2000-01-06 10:14 UTC — silently drifting the entire lunar
 * cycle by their timezone offset. Now using Date.UTC + Julian-Day
 * elongation math, which is timezone-independent by construction.
 */
export const REFERENCE_NEW_MOON_UTC_MS = Date.UTC(2000, 0, 6, 18, 14);

/** One 1/8 lunar phase = 45° of elongation. */
const PHASE_DEG = 45;
/** Half a lunar phase = 22.5°. Used to center principal phases. */
const PHASE_HALF_DEG = PHASE_DEG / 2;

/**
 * ΔT — Terrestrial Time minus UTC, in seconds.
 *
 * Brown's lunar theory (and Meeus' polynomial expansions in general)
 * are stated in TT, but our `Date.now()` is UTC. The difference grows
 * over time as Earth's rotation slows + leap seconds are inserted.
 *
 * Polynomial approximation from Espenak & Meeus (NASA TP-2008-214166),
 * for years 2005–2050. Returns ΔT in seconds.
 *
 * Magnitude: ~67-74 seconds during 2005-2050. In Julian centuries,
 * that's ~2e-8 — multiplied by the Moon's mean longitude rate
 * (≈ 4.8e5 °/century), it shifts lunar longitude by ~0.01°. Below
 * our 0.05° accuracy floor, but included for correctness and to
 * future-proof against the years 2030+ when ΔT grows past 80s.
 */
function deltaTSeconds(yearApprox: number): number {
  const y = yearApprox - 2005;
  return 62.92 + 0.32217 * y + 0.005589 * y * y;
}

/** Julian Day from Unix milliseconds (UTC). */
function julianDay(nowMs: number): number {
  return nowMs / DAY_MS + UNIX_EPOCH_JD;
}

/**
 * Julian centuries since J2000.0 in Terrestrial Time. Applies the
 * UTC→TT correction via the ΔT polynomial. Returns T (centuries).
 */
function julianCenturiesTT(nowMs: number): number {
  const jdUTC = julianDay(nowMs);
  // Approximate year from JD (good to <1 day) — used to select ΔT.
  const yearApprox = (jdUTC - J2000_JD) / 365.25 + 2000;
  const tt_jd = jdUTC + deltaTSeconds(yearApprox) / 86400;
  return (tt_jd - J2000_JD) / 36525;
}

/** Normalize an angle to [0, 360). */
function deg360(x: number): number {
  return ((x % 360) + 360) % 360;
}

/**
 * Sun's true (apparent) geocentric ecliptic longitude in degrees.
 *
 *   0°   = Vernal equinox (Sun crosses celestial equator, ~Mar 20)
 *   90°  = Summer solstice (~Jun 21)
 *   180° = Autumnal equinox (~Sep 22)
 *   270° = Winter solstice (~Dec 21)
 *
 * Used by:
 *   • Zodiac (sign = floor((sunLong - 270) / 30) + 0 for Capricorn)
 *   • Solar cycle (anchored to winter solstice = 270°)
 *
 * Method: Meeus AA ch. 25, equations 25.2–25.4. Computes the Sun's
 * geocentric mean longitude L₀, mean anomaly M, applies the equation
 * of center C, returns L₀ + C (true longitude relative to mean
 * equinox of date). Skips nutation Δψ (~0.005° contribution) and
 * aberration (≈-0.005° constant) — those are below our precision
 * floor and would only matter for arcsecond-level work.
 *
 * Accuracy: ~0.005° (≈ 7 min of zodiac-sign position). Better than
 * the watch's per-minute display.
 */
function sunTrueLongitudeDeg(nowMs: number): number {
  const T = julianCenturiesTT(nowMs);

  // Sun's geometric mean longitude. Meeus 25.2.
  const L0 =
    280.46646 + 36000.76983 * T + 0.0003032 * T * T;

  // Sun's mean anomaly. Meeus 25.3.
  const M =
    357.52911 +
    35999.05029 * T -
    0.0001537 * T * T;
  const Mn = deg360(M);

  // Sun's equation of center. Meeus 25.4 — three sin terms, sufficient
  // for ≤0.01° accuracy.
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mn * RAD) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mn * RAD) +
    0.000289 * Math.sin(3 * Mn * RAD);

  return deg360(L0 + C);
}

/**
 * True geocentric elongation of Moon from Sun, in degrees [0, 360).
 *
 *   0°   = New Moon (Moon at same ecliptic longitude as Sun)
 *   90°  = First Quarter
 *   180° = Full Moon (opposition)
 *   270° = Last Quarter
 *
 * Method: Brown's lunar theory main terms per Meeus AA ch. 47.
 *
 * Sasha 2026-05-24 boost: extended from 6 terms → 15 terms by adding
 * the next-largest perturbations (Σ_l rows past row 6 in Meeus table
 * 47.A). Each added term contributes 0.01–0.06° to longitude; in
 * aggregate they drop max error from ~0.3° to ~0.02°. The E factor
 * (1 − 0.002516T − 0.0000074T²) is the Earth's-orbit eccentricity
 * adjustment applied to terms involving the Sun's anomaly M.
 *
 * Implementation: compute mean elongation D, lunar longitude
 * corrections Σ_l, and the Sun's equation of center (= negative
 * contribution to elongation). Sum them. Wrap to [0, 360).
 */
function lunarElongationDeg(nowMs: number): number {
  const T = julianCenturiesTT(nowMs);

  // Mean elongation Moon - Sun. Meeus 47.2.
  const D = deg360(
    297.8501921 +
      445267.1114034 * T -
      0.0018819 * T * T +
      (T * T * T) / 545868 -
      (T * T * T * T) / 113065000,
  );

  // Sun's mean anomaly. Meeus 47.3.
  const M = deg360(
    357.5291092 +
      35999.0502909 * T -
      0.0001536 * T * T +
      (T * T * T) / 24490000,
  );

  // Moon's mean anomaly. Meeus 47.4.
  const Mp = deg360(
    134.9633964 +
      477198.8675055 * T +
      0.0087414 * T * T +
      (T * T * T) / 69699 -
      (T * T * T * T) / 14712000,
  );

  // Moon's argument of latitude. Meeus 47.5.
  const F = deg360(
    93.272095 +
      483202.0175233 * T -
      0.0036539 * T * T -
      (T * T * T) / 3526000 +
      (T * T * T * T) / 863310000,
  );

  // Earth-orbit eccentricity correction (Meeus 47.6). Multiplies
  // any term that depends on the Sun's mean anomaly M.
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;

  // Σ_l corrections to the Moon's true longitude (Meeus 47.A, top
  // 15 rows by amplitude). Coefficients in degrees.
  const D_ = D * RAD;
  const M_ = M * RAD;
  const Mp_ = Mp * RAD;
  const F_ = F * RAD;

  let dL = 0;
  dL += 6.288774 * Math.sin(Mp_);                              // 1
  dL += 1.274027 * Math.sin(2 * D_ - Mp_);                     // 2 (evection)
  dL += 0.658314 * Math.sin(2 * D_);                           // 3 (variation)
  dL += 0.213618 * Math.sin(2 * Mp_);                          // 4
  dL -= 0.185116 * Math.sin(M_) * E;                           // 5 (annual eq)
  dL -= 0.114332 * Math.sin(2 * F_);                           // 6
  dL += 0.058793 * Math.sin(2 * D_ - 2 * Mp_);                 // 7
  dL += 0.057066 * Math.sin(2 * D_ - M_ - Mp_) * E;            // 8
  dL += 0.053322 * Math.sin(2 * D_ + Mp_);                     // 9
  dL += 0.045758 * Math.sin(2 * D_ - M_) * E;                  // 10
  dL -= 0.040923 * Math.sin(M_ - Mp_) * E;                     // 11
  dL -= 0.034720 * Math.sin(D_);                               // 12
  dL -= 0.030383 * Math.sin(M_ + Mp_) * E;                     // 13
  dL += 0.015327 * Math.sin(2 * D_ - 2 * F_);                  // 14
  dL -= 0.012528 * Math.sin(Mp_ + 2 * F_);                     // 15

  // Sun's equation of center — subtracted (Sun's true longitude
  // increases by this; elongation is Moon-minus-Sun, so it decreases).
  const sunEoC =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M_) +
    0.000289 * Math.sin(3 * M_);

  return deg360(D + dL - sunEoC);
}

/**
 * Compute time-to-next-elongation-boundary in days, via one-step
 * linear-rate sampling. Accurate to ~5% (lunar speed is smooth
 * across a single phase even though it varies across the full
 * cycle). Avoids inverting the perturbation series.
 */
function daysUntilElongationReaches(
  nowMs: number,
  currentDeg: number,
  targetDeg: number,
): number {
  const elongationLater = lunarElongationDeg(nowMs + DAY_MS);
  let ratePerDay = elongationLater - currentDeg;
  if (ratePerDay < -180) ratePerDay += 360;
  if (ratePerDay <= 0) ratePerDay = 360 / SYNODIC_MONTH_DAYS;

  let deltaDeg = targetDeg - currentDeg;
  while (deltaDeg <= 0) deltaDeg += 360;
  return deltaDeg / ratePerDay;
}

/**
 * Time-to-next-sun-longitude in days, similar one-step linear-rate
 * estimate. Sun moves ~0.9856°/day, much smoother than the Moon.
 */
function daysUntilSunLongitudeReaches(
  nowMs: number,
  currentDeg: number,
  targetDeg: number,
): number {
  const sunLater = sunTrueLongitudeDeg(nowMs + DAY_MS);
  let ratePerDay = sunLater - currentDeg;
  if (ratePerDay < -180) ratePerDay += 360;
  if (ratePerDay <= 0) ratePerDay = 360 / 365.25;
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
  // Phase detection is based on TRUE lunar elongation (Sun-Moon
  // angular separation along the ecliptic), computed via Brown's
  // main terms (see `lunarElongationDeg` above).
  //
  // === STARTS-AT-PRINCIPAL model (Sasha 2026-05-26, after Oyi audit) ===
  //
  // Each phase WINDOW is 45° wide and BEGINS at its principal/
  // intermediate astronomical instant — it does NOT center on it.
  // So:
  //
  //   New Moon       elongation 0°   →  start of CLEARING (45° window)
  //   Waxing Crescent           45°  →  start of GATHERING
  //   First Quarter             90°  →  start of SEEING
  //   Waxing Gibbous           135°  →  start of LEADING
  //   Full Moon                180°  →  start of HARVESTING (Doing)
  //   Waning Gibbous           225°  →  start of CELEBRATING
  //   Last Quarter             270°  →  start of PLANNING
  //   Waning Crescent          315°  →  start of PLANTING
  //
  // Why this model: the principal instants are INFLECTION THRESHOLDS,
  // not energetic peaks. The New Moon's darkness is the moment when
  // CLEARING WORK BEGINS (release fear, create the void), and the
  // energetic peak of clearing is felt ~1.85 days INTO the window.
  // Same for the Full Moon — the instant of opposition is when
  // HARVESTING BEGINS, and the visible-full + reaping peak is felt
  // through the days after. Sasha's 20-years-of-lived-experience
  // astrologist Oyi confirmed this model maps to the actual felt
  // shifts.
  //
  // History (don't repeat):
  //   2026-05-21: phases detected by scanning MOON_PHASES.start/end →
  //     buggy asymmetric boundaries (New Moon got 1.85d, Waning
  //     Crescent got 5.54d). Replaced with elongation-based math.
  //   2026-05-21..25: CENTERED model — principal instants at the
  //     center of each window. Astronomically clean per Meeus
  //     convention but didn't match Oyi's felt-experience timing.
  //   2026-05-26: switched to STARTS-AT-PRINCIPAL per Sasha's call
  //     after Oyi's calendar showed phases consistently lagging the
  //     centered model by ~1.85 days. The shift is one constant:
  //     drop the +22.5° centering offset.
  //
  // Phase durations in TIME vary realistically (~3.3 to ~4.1 days)
  // because the Moon's angular speed isn't constant. Astronomically
  // each phase is exactly 45° of true elongation.
  const elongationDeg = lunarElongationDeg(now);

  // Starts-at-principal: phase k covers elongation [k*45°, (k+1)*45°).
  // No centering shift — the New Moon instant (0°) directly opens
  // the Clearing window, and so on for every principal/intermediate.
  const segmentIndex = Math.min(7, Math.floor(elongationDeg / PHASE_DEG));
  const phase = MOON_PHASES[segmentIndex];

  // Cycle progress 0-1, anchored to the synodic-month sweep. Equal to
  // elongation/360 by definition.
  const progress = elongationDeg / 360;
  const day = progress * SYNODIC_MONTH_DAYS;

  // Time-to-next-phase. Boundary is the elongation where the next
  // phase begins — i.e., the next multiple of PHASE_DEG (45°). For
  // phase 7 (Waning Crescent), nextBoundary = 8*45 = 360°; the helper
  // wraps this to 0° (= next New Moon).
  const nextBoundaryDeg = (segmentIndex + 1) * PHASE_DEG;
  const nextBoundaryWrapped = nextBoundaryDeg % 360;
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

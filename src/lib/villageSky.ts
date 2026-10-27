import { getLunarState } from "@/lib/equilibrium-cycles";

/**
 * Village sky — the Digital Village lives by the real moon.
 *
 * A thin reader over the existing lunar math (`getLunarState`, true Sun-Moon
 * elongation); there is no second moon calculation here. Pure function of the
 * date: no user input, no storage, and nothing in the result is meant to be shown
 * as a number. The same instant gives the same sky to every resident.
 * Design: docs/02-strategy/game_of_being_you.md §15.7 / §15.7a.
 *
 * Phase buckets follow the app's own eight-phase windows (`MOON_PHASES`, each
 * 45° of elongation starting AT its principal instant), so the village agrees
 * with the Equilibrium cycle: New Moon → `new`, the three waxing windows →
 * `waxing`, Full Moon → `full`, the three waning windows → `waning`.
 */

export type VillageMoonPhase = "new" | "waxing" | "full" | "waning";

export interface VillageSky {
  phase: VillageMoonPhase;
  /** Lit fraction of the disc, 0 (new) … 1 (full). Drives sky brightness only. */
  illumination: number;
  /** Position in the lunar cycle, 0 (new) … 1 (next new); waxing < 0.5 ≤ waning. Drives the disc shape. */
  cycle: number;
  /** The one quiet line for the map. Never a number or percentage. */
  mood: string;
}

export const VILLAGE_SKY_MOODS: Record<VillageMoonPhase, string> = {
  new: "New moon. A night for letting go.",
  waxing: "The moon is growing. Build.",
  full: "Full moon. Harvest.",
  waning: "The moon wanes. Digest.",
};

/** MOON_PHASES index (0 = New Moon … 7 = Waning Crescent) → village bucket. */
const PHASE_BY_SEGMENT: VillageMoonPhase[] = [
  "new",
  "waxing",
  "waxing",
  "waxing",
  "full",
  "waning",
  "waning",
  "waning",
];

export function getVillageSky(now: number | Date = Date.now()): VillageSky {
  const ms = typeof now === "number" ? now : now.getTime();
  const lunar = getLunarState(ms);
  const cycle = lunar.progress; // = elongation / 360
  const illumination = (1 - Math.cos(cycle * 2 * Math.PI)) / 2;
  const phase = PHASE_BY_SEGMENT[lunar.segmentIndex] ?? "new";
  return {
    phase,
    illumination: Math.min(1, Math.max(0, illumination)),
    cycle,
    mood: VILLAGE_SKY_MOODS[phase],
  };
}

/**
 * Natural Clock · clock 2 — Moon = real shape.
 *
 * The lit fraction comes from the repo's own lunar elongation
 * (`getLunarState().progress`, Meeus ch. 47 — the same number that drives the
 * 8-phase bar), so the silhouette and the phase name can never disagree.
 *
 * Orientation is northern-hemisphere: a waxing moon is lit on the right.
 */

import { nextPhase, phaseByLunarIndex, type EqPhaseName } from "../phasePlan";
import { NATURAL_CLOCK_COPY } from "../equilibriumCopy";

/** Lit share of the disc for a lunar cycle progress (0 = new, 0.5 = full). */
export function moonIlluminatedFraction(cycleProgress: number): number {
  return (1 - Math.cos(2 * Math.PI * cycleProgress)) / 2;
}

/** True while the moon grows (new → full). */
export function isWaxing(cycleProgress: number): boolean {
  return cycleProgress < 0.5;
}

/**
 * SVG path of the LIT part of the moon disc. Absolute coordinates (no
 * transform; Safari drops transforms on clip paths — see MoonOrb).
 *
 * Returns "" for a new moon (nothing lit). A full moon is the whole circle.
 */
export function moonLitPath(
  fraction: number,
  waxing: boolean,
  r = 50,
  cx = 50,
  cy = 50,
): string {
  const f = Math.min(1, Math.max(0, fraction));
  if (f < 0.004) return "";
  const top = cy - r;
  const bottom = cy + r;
  if (f > 0.996) {
    return `M ${cx} ${top} A ${r} ${r} 0 1 1 ${cx} ${bottom} A ${r} ${r} 0 1 1 ${cx} ${top} Z`;
  }
  // Terminator is a half-ellipse of horizontal radius r·|1 − 2f|.
  const rx = Number((r * Math.abs(1 - 2 * f)).toFixed(3));
  const gibbous = f > 0.5;
  // Outer limb on the lit side: clockwise (1) down the right when waxing.
  const limbSweep = waxing ? 1 : 0;
  // Crescent: terminator bulges toward the lit side; gibbous: away from it.
  const terminatorSweep = gibbous ? limbSweep : 1 - limbSweep;
  return (
    `M ${cx} ${top} A ${r} ${r} 0 0 ${limbSweep} ${cx} ${bottom} ` +
    `A ${rx} ${r} 0 0 ${terminatorSweep} ${cx} ${top} Z`
  );
}

export interface MoonView {
  /** Lit share of the disc, 0…1. */
  fraction: number;
  /** Lit share as a whole percent. */
  illuminationPercent: number;
  waxing: boolean;
  /** Astronomical phase index, 0 = New Moon … 7 = Waning Crescent. */
  astronomicalIndex: number;
  /** Equilibrium cycle position, 1 (Planning) … 8 (Celebrating). */
  position: number;
  /** Equilibrium phase, as the clock names it ("Prep for Harvest" for Leading). */
  phaseName: string;
  /** The name of the astronomical phase ("Waxing Gibbous"). */
  moonName: string;
  /** Whole days until the next Equilibrium phase begins, at least 1. */
  daysToNext: number;
  nextPhaseName: string;
}

/** Display name of an Equilibrium phase on the clock. */
export const clockPhaseName = (name: EqPhaseName): string =>
  NATURAL_CLOCK_COPY.phaseName[name];

/** The subset of `LunarState` this view needs. */
export interface LunarInput {
  progress: number;
  segmentIndex: number;
  daysRemainingInPhase: number;
}

export function moonView(lunar: LunarInput): MoonView {
  const fraction = moonIlluminatedFraction(lunar.progress);
  const phase = phaseByLunarIndex(lunar.segmentIndex);
  return {
    fraction,
    illuminationPercent: Math.round(fraction * 100),
    waxing: isWaxing(lunar.progress),
    astronomicalIndex: phase.astronomicalIndex,
    position: phase.position,
    phaseName: clockPhaseName(phase.name),
    moonName: phase.moonName,
    daysToNext: Math.max(1, Math.ceil(lunar.daysRemainingInPhase)),
    nextPhaseName: clockPhaseName(nextPhase(phase.position).name),
  };
}

import type { TFunction } from "i18next";
import { MOON_PHASES, getLunarState, type HolonicPhase } from "@/lib/equilibrium-cycles";
import { PHASE_PLAN, semanticPositionFromLunarIndex, type EqPhaseName } from "@/modules/equilibrium/phasePlan";
import { tr } from "@/lib/villageCopy";

/**
 * Moon dial — the village map's small Equilibrium watch (village-as-dashboard step 2).
 *
 * Eight sectors, the eight Equilibrium phases in Sasha's cycle order (PHASE_PLAN, Planning
 * first at the top, clockwise). The lit sector is tonight's, read from the same lunar math as
 * the Equilibrium page and the village sky (`getLunarState`, client-side, no API).
 *
 * BE / DO: each phase sits in one of the four holonic quadrants of the lunar wisdom map
 * (docs/specs/equilibrium/lunar_wisdom_map.md: Will = Fire, Emanation = Water,
 * Digestion = Earth, Enrichment = Air). Following Sasha's hexagon work cycle (feminine
 * triangle = BE, masculine = DO), the receptive elements Water and Earth are BE and the active
 * elements Fire and Air are DO. That gives BE for Planting · Clearing · Gathering · Seeing
 * and DO for Prep for Harvest · Harvesting · Celebrating · Planning.
 * (Hark's reading of the existing map; one table below if Sasha wants it otherwise.)
 */

export type BeDo = "be" | "do";

const BE_DO_BY_QUADRANT: Record<HolonicPhase, BeDo> = {
  will: "do", // Fire
  emanation: "be", // Water
  digestion: "be", // Earth
  enrichment: "do", // Air
};

/** Display names. «Leading» became «Prep for Harvest» (Sasha, 2026-10-21). */
const PHASE_LABEL: Record<EqPhaseName, string> = {
  Planning: "Planning",
  Planting: "Planting",
  Clearing: "Clearing",
  Gathering: "Gathering",
  Seeing: "Seeing",
  Leading: "Prep for Harvest",
  Harvesting: "Harvesting",
  Celebrating: "Celebrating",
};

export type DialSector = {
  /** 1–8, Sasha's cycle order. */
  position: number;
  name: EqPhaseName;
  label: string;
  moonName: string;
  beDo: BeDo;
};

export const DIAL_SECTORS: DialSector[] = PHASE_PLAN.map((p) => {
  const quadrant = MOON_PHASES[p.astronomicalIndex]?.holonicQuadrant ?? "will";
  return {
    position: p.position,
    name: p.name,
    label: PHASE_LABEL[p.name],
    moonName: p.moonName,
    beDo: BE_DO_BY_QUADRANT[quadrant],
  };
});

export type MoonDialNow = {
  /** The sector tonight (1–8). */
  position: number;
  sector: DialSector;
};

export const moonDialNow = (now: number | Date = Date.now()): MoonDialNow => {
  const ms = typeof now === "number" ? now : now.getTime();
  const lunar = getLunarState(ms);
  const position = semanticPositionFromLunarIndex(lunar.segmentIndex);
  return { position, sector: DIAL_SECTORS[position - 1] };
};

export const phaseLabel = (s: DialSector, t?: TFunction): string =>
  tr(t, `village.dial.phase.${s.name}`, s.label);

export const beDoWord = (b: BeDo, t?: TFunction): string =>
  tr(t, `village.dial.${b}`, b === "be" ? "BE" : "DO");

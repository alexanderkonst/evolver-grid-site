/**
 * Helpers mapping cycle state → CycleEnergyBar segments.
 *
 * Each cycle (solar / zodiac / lunar / day-of-week) defines its own:
 *   • per-segment icon (emoji / symbol)
 *   • per-segment identity color (used for the current-orb glow)
 *   • landmark flags (cycle anchors that stay subtly lit)
 *
 * Identity colors are inferred from natural-world associations + v1.6 ring
 * palette. Final color tuning may shift in Phase 4 polish if Sasha calls it.
 */

import {
  MOON_PHASES,
  PLANETARY_DAYS,
  ZODIAC_SIGNS,
} from "@/lib/equilibrium-cycles";
import type { CycleSegmentSpec } from "./components/CycleEnergyBar";

// ─── LUNAR (8 phases) ─────────────────────────────────────────

const LUNAR_ACCENT = "#a080c0"; // Lunar Violet (v1.6 palette)
const LUNAR_LANDMARK_PHASES = new Set(["New Moon", "Full Moon"]);

/**
 * Sasha's preferred visual order (2026-05-18 mockup): the bar starts at
 * FULL MOON (cycle apex / harvest) on the left, wanes through to New
 * Moon in the middle, then waxes back to Full on the right. This is the
 * natural night-to-night visual progression of how the moon shrinks and
 * grows.
 *
 * Internally MOON_PHASES is still ordered astronomically (New Moon = 0)
 * because cycle math uses `days from New Moon` as the origin. The
 * display rotation is purely visual — `lunarDisplayIndex()` below
 * converts the astronomical `segmentIndex` returned by `getLunarState()`
 * into the rotated display index used by the orb row.
 *
 * Mapping (astronomical → display):
 *   New Moon (0)         → 4
 *   Waxing Crescent (1)  → 5
 *   First Quarter (2)    → 6
 *   Waxing Gibbous (3)   → 7
 *   Full Moon (4)        → 0   ← display origin
 *   Waning Gibbous (5)   → 1
 *   Last Quarter (6)     → 2
 *   Waning Crescent (7)  → 3
 *
 * Closed form: `displayIdx = (astronomicalIdx + 4) % 8`
 */
const LUNAR_DISPLAY_TO_ASTRONOMICAL = [4, 5, 6, 7, 0, 1, 2, 3] as const;

export const LUNAR_SEGMENTS: CycleSegmentSpec[] = LUNAR_DISPLAY_TO_ASTRONOMICAL.map(
  (i) => {
    const phase = MOON_PHASES[i];
    return {
      icon: phase.symbol,
      label: phase.name,
      identityColor: LUNAR_ACCENT,
      isLandmark: LUNAR_LANDMARK_PHASES.has(phase.name),
    };
  },
);

/**
 * Convert a `getLunarState().segmentIndex` (astronomical, New Moon = 0)
 * into the display index used by LUNAR_SEGMENTS (Full Moon = 0).
 */
export function lunarDisplayIndex(astronomicalIdx: number): number {
  return (astronomicalIdx + 4) % 8;
}

// ─── DAY-OF-WEEK (7 planets) ──────────────────────────────────

const PLANET_COLORS: Record<string, string> = {
  Moon: "#a080c0", // silver-violet
  Mars: "#dc2626", // red
  Mercury: "#64748b", // slate
  Jupiter: "#f59e0b", // gold-banded
  Venus: "#f0b890", // peach
  Saturn: "#475569", // ringed blue-gray
  Sun: "#ea580c", // fiery gold
};

export const DAY_OF_WEEK_SEGMENTS: CycleSegmentSpec[] = PLANETARY_DAYS.map(
  (d) => ({
    icon: d.emoji,
    label: `${d.name} — ${d.planet}`,
    identityColor: PLANET_COLORS[d.planet] ?? "#94a3b8",
  }),
);

// ─── SOLAR (8 segments, season-anchored) ──────────────────────

// Locked in cycles.ts as SOLAR_SEGMENTS string array. Mapped here to icons +
// colors. Visual mock for solar is queued from Sasha — these defaults stand
// until the mock arrives.
const SEASON_ICONS: Record<string, string> = {
  "Early Winter": "❄️",
  "Late Winter": "🌨️",
  "Early Spring": "🌱",
  "Late Spring": "🌸",
  "Early Summer": "☀️",
  "Late Summer": "🌻",
  "Early Autumn": "🍂",
  "Late Autumn": "🍁",
};

const SEASON_COLORS: Record<string, string> = {
  "Early Winter": "#64748b",
  "Late Winter": "#94a3b8",
  "Early Spring": "#84cc16",
  "Late Spring": "#22c55e",
  "Early Summer": "#f59e0b",
  "Late Summer": "#ea580c",
  "Early Autumn": "#c2410c",
  "Late Autumn": "#7c2d12",
};

const SOLAR_LABELS = [
  "Early Winter",
  "Late Winter",
  "Early Spring",
  "Late Spring",
  "Early Summer",
  "Late Summer",
  "Early Autumn",
  "Late Autumn",
] as const;

export const SOLAR_SEGMENTS: CycleSegmentSpec[] = SOLAR_LABELS.map((label) => ({
  icon: SEASON_ICONS[label],
  label,
  identityColor: SEASON_COLORS[label],
}));

// ─── ZODIAC (12 signs) ────────────────────────────────────────

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "#ea580c",
  Earth: "#84cc16",
  Air: "#0ea5e9",
  Water: "#3b82f6",
};

export const ZODIAC_SEGMENTS: CycleSegmentSpec[] = ZODIAC_SIGNS.map((s) => ({
  icon: s.symbol,
  // Accessible label keeps name for screen readers; pill stack shows energy.
  label: `${s.sign} — ${s.energy}`,
  identityColor: ELEMENT_COLORS[s.element],
}));

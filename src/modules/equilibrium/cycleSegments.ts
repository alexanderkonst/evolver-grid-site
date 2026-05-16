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

export const LUNAR_SEGMENTS: CycleSegmentSpec[] = MOON_PHASES.map((phase) => ({
  icon: phase.symbol,
  label: phase.name,
  identityColor: LUNAR_ACCENT,
  isLandmark: LUNAR_LANDMARK_PHASES.has(phase.name),
}));

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

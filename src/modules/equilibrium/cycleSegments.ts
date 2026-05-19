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
 * Sasha's preferred visual order (2026-05-18 round 2): the bar starts
 * at WANING GIBBOUS — the phase immediately AFTER Full Moon. Reasoning
 * (Sasha 2026-05-18): "Full Moon is still celebration happening, so
 * it's really the closure more than it is the opening. And Waning
 * Gibbous is the opening." This matches the start of the Holonic Will
 * (Fire) quadrant — the seed-fire of the next intention igniting just
 * after the visible peak.
 *
 * Visual sequence (left → right):
 *   0: Waning Gibbous   (start of Will — opening)
 *   1: Last Quarter
 *   2: Waning Crescent
 *   3: New Moon
 *   4: Waxing Crescent
 *   5: First Quarter
 *   6: Waxing Gibbous
 *   7: Full Moon        (closure — loops back to Waning Gibbous)
 *
 * Internally MOON_PHASES stays astronomically ordered (New Moon = 0)
 * because cycle math uses `days from New Moon` as the origin. The
 * rotation is purely visual.
 *
 * Mapping (astronomical → display):
 *   Waning Gibbous (5)   → 0   ← display origin
 *   Last Quarter (6)     → 1
 *   Waning Crescent (7)  → 2
 *   New Moon (0)         → 3
 *   Waxing Crescent (1)  → 4
 *   First Quarter (2)    → 5
 *   Waxing Gibbous (3)   → 6
 *   Full Moon (4)        → 7
 *
 * Closed form: `displayIdx = (astronomicalIdx + 3) % 8`
 *
 * Round-1 version (2026-05-18 earlier) placed Full Moon at display 0;
 * Sasha caught this as wrong same-day. The full-moon-celebration is
 * closure of the OLD wheel, not the opening of the NEW one.
 */
const LUNAR_DISPLAY_TO_ASTRONOMICAL = [5, 6, 7, 0, 1, 2, 3, 4] as const;

/**
 * Per-position liquid-glass gradient (Sasha 2026-05-18 design brief).
 *
 * The 8 phases progress through a natural prism-refraction rainbow —
 * how light actually refracts in real life. Each gradient pair takes
 * the orb's surrounding liquid-glass and lights it with that band of
 * the spectrum, so the user reads cycle position by glance: where in
 * the rainbow am I?
 *
 * Index is DISPLAY position (0 = Waning Gibbous, ... 7 = Full Moon).
 *
 * Brief verbatim:
 *   1: dark ruby/terracotta → red
 *   2: red → orange
 *   3: orange → yellow
 *   4: yellow → green
 *   5: green → blue
 *   6: blue → purple
 *   7: purple → soft pink
 *   8: completing the loop (pink → ruby)
 */
const LUNAR_LIT_GRADIENTS: { from: string; to: string }[] = [
  { from: "#b91c4a", to: "#dc2626" }, // ruby → red
  { from: "#dc2626", to: "#ea580c" }, // red → orange
  { from: "#ea580c", to: "#facc15" }, // orange → yellow
  { from: "#facc15", to: "#4ade80" }, // yellow → green
  { from: "#4ade80", to: "#3b82f6" }, // green → blue
  { from: "#3b82f6", to: "#a855f7" }, // blue → purple
  { from: "#a855f7", to: "#ec4899" }, // purple → pink
  { from: "#ec4899", to: "#b91c4a" }, // pink → ruby (loop close)
];

export const LUNAR_SEGMENTS: CycleSegmentSpec[] = LUNAR_DISPLAY_TO_ASTRONOMICAL.map(
  (i, displayIdx) => {
    const phase = MOON_PHASES[i];
    return {
      icon: phase.symbol,
      label: phase.name,
      identityColor: LUNAR_ACCENT,
      litGradient: LUNAR_LIT_GRADIENTS[displayIdx],
      isLandmark: LUNAR_LANDMARK_PHASES.has(phase.name),
    };
  },
);

/**
 * Convert a `getLunarState().segmentIndex` (astronomical, New Moon = 0)
 * into the display index used by LUNAR_SEGMENTS (Waning Gibbous = 0).
 */
export function lunarDisplayIndex(astronomicalIdx: number): number {
  return (astronomicalIdx + 3) % 8;
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

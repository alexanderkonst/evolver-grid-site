import { useId } from "react";

/**
 * Real photographic moon at any phase, rendered as an SVG inside an
 * orb (suitable for use within the CycleEnergyBar's per-segment liquid
 * glass shell).
 *
 * Approach (Sasha 2026-05-18 brief):
 *   • ONE moon photo (the Galileo full-moon composite) stored at
 *     /public/assets/equilibrium/moon-full.jpg.
 *   • A geometric SVG `<clipPath>` carves out the LIT portion per phase.
 *   • Two `<image>` elements stacked:
 *       1. dim base — the full moon photo at ~18% brightness, clipped
 *          to the moon's full circle. This is "earthshine" — the moon's
 *          surface faintly visible in the shadow side.
 *       2. lit overlay — the same photo at full brightness, clipped to
 *          only the lit portion of the current phase.
 *
 * The terminator (boundary between lit and dark) is computed
 * geometrically per phase: an ellipse arc whose horizontal radius
 * = R · |cos(2π · phaseIndex / 8)|. Sweep flags determine whether the
 * arc bulges into or out of the disc.
 *
 * Phase index is ASTRONOMICAL (matches MOON_PHASES order):
 *   0 New Moon, 1 Waxing Crescent, 2 First Quarter, 3 Waxing Gibbous,
 *   4 Full Moon, 5 Waning Gibbous, 6 Last Quarter, 7 Waning Crescent.
 */

const MOON_PHOTO_URL = "/assets/equilibrium/moon-full.jpg";

interface MoonOrbProps {
  /** Astronomical phase index (0–7), from `getLunarState().segmentIndex`. */
  phaseIndex: number;
  /** Orb diameter in pixels. */
  size?: number;
}

/**
 * SVG path for the LIT region of the moon at the given phase, in a
 * coordinate system where the moon is centered at (0, 0) with radius r.
 *
 *   • New Moon (0): empty path (no lit area).
 *   • Full Moon (4): the full circle.
 *   • Other phases: two arcs — moon's outer edge on the lit side +
 *     terminator ellipse arc closing back.
 */
function getLitRegionPath(phaseIndex: number, r: number): string {
  if (phaseIndex === 0) return "";
  if (phaseIndex === 4) {
    return `M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r} Z`;
  }

  const phaseFraction = phaseIndex / 8;
  const terminatorRx = r * Math.abs(Math.cos(phaseFraction * 2 * Math.PI));

  const isWaxing = phaseIndex < 4; // 1, 2, 3
  const isCrescent = phaseIndex === 1 || phaseIndex === 7;

  // Outer arc sweep: 1 = right side (waxing); 0 = left side (waning).
  const outerSweep = isWaxing ? 1 : 0;

  // Terminator inner-arc sweep:
  //   waxing crescent (1) → 0 (bulges left, carves IN to a thin crescent)
  //   waxing gibbous  (3) → 1 (bulges right, extends OUT past half)
  //   waning gibbous  (5) → 0 (mirror of waxing gibbous)
  //   waning crescent (7) → 1 (mirror of waxing crescent)
  // First quarter (2) and Last quarter (6) collapse — rx = 0 makes the
  // terminator a vertical line; either sweep flag yields the same line.
  let innerSweep: number;
  if (isWaxing) {
    innerSweep = isCrescent ? 0 : 1;
  } else {
    innerSweep = isCrescent ? 1 : 0;
  }

  return `M 0 ${-r} A ${r} ${r} 0 0 ${outerSweep} 0 ${r} A ${terminatorRx} ${r} 0 0 ${innerSweep} 0 ${-r} Z`;
}

export const MoonOrb = ({ phaseIndex, size = 44 }: MoonOrbProps) => {
  const uid = useId().replace(/:/g, "");
  const moonClipId = `moon-circle-${uid}`;
  const litClipId = `moon-lit-${uid}-${phaseIndex}`;

  const r = (size * 0.46) / 1; // moon radius slightly smaller than the orb radius
  const cx = size / 2;
  const cy = size / 2;
  const litPath = getLitRegionPath(phaseIndex, r);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="block select-none"
      aria-hidden="true"
    >
      <defs>
        {/* Circular clip for the full moon disc (used by the dim base). */}
        <clipPath id={moonClipId}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        {/* Clip for the LIT portion of the current phase. */}
        {litPath && (
          <clipPath id={litClipId} transform={`translate(${cx} ${cy})`}>
            <path d={litPath} />
          </clipPath>
        )}
      </defs>

      {/* Dim base — earthshine effect on the unlit side. */}
      <image
        href={MOON_PHOTO_URL}
        x={cx - r}
        y={cy - r}
        width={r * 2}
        height={r * 2}
        clipPath={`url(#${moonClipId})`}
        style={{ filter: "brightness(0.16) contrast(0.85) saturate(0.6)" }}
        preserveAspectRatio="xMidYMid slice"
      />

      {/* Lit overlay — full-brightness photo clipped to the lit region. */}
      {litPath && (
        <image
          href={MOON_PHOTO_URL}
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          clipPath={`url(#${litClipId})`}
          style={{ filter: "brightness(1.05) contrast(1.05)" }}
          preserveAspectRatio="xMidYMid slice"
        />
      )}
    </svg>
  );
};

export default MoonOrb;

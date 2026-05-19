import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Canonical visual for v2 cycle sections (boxes 4-7):
 *   • Rainbow arc (red→violet) — fill % = cycle progress %
 *   • Row of orbs underneath (variable count: 8 lunar / 7 week / 12 zodiac / 8 solar)
 *   • Current orb glows in its own identity color (NOT arc-position color)
 *   • Three-pill stack below: prev / current / next, current elevated and rainbow-glowed
 *
 * See docs/specs/equilibrium/equilibrium_v2_spec.md §3.1 (visual reference + canonical behavior).
 */

export interface CycleSegmentSpec {
  /** Emoji or symbol rendered inside the orb. */
  icon: string;
  /** Hex color used for the orb's glow when current (fallback when no gradient). */
  identityColor: string;
  /** Accessible label for the orb (announced + tooltip). */
  label: string;
  /**
   * Optional per-position liquid-glass gradient (Sasha 2026-05-18 brief).
   * When provided, the orb's liquid-glass backdrop is painted with this
   * gradient instead of the flat identityColor. Lit-up orbs (this and
   * all prior in display order) render full saturation; orbs AFTER
   * `currentIndex` render in grayscale (the cycle hasn't reached them
   * yet). Glow stays contained inside the orb — no bloom.
   *
   * Lunar palette progresses through the natural prism-refraction
   * sequence: ruby → red → orange → yellow → green → blue → purple →
   * pink, closing the loop back to ruby.
   */
  litGradient?: { from: string; to: string };
  /**
   * Optional — when true, the orb remains subtly lit even when not current
   * (used for cycle landmarks like Full Moon).
   */
  isLandmark?: boolean;
}

export interface CycleEnergyBarProps {
  segments: CycleSegmentSpec[];
  /** Zero-based index of the segment currently active. */
  currentIndex: number;
  /** Progress through the full cycle, 0–1. Controls the rainbow arc fill. */
  progress: number;
  /** Pill labels — `current` is elevated and rainbow-glowed. */
  prevLabel: string;
  currentLabel: string;
  nextLabel: string;
  /**
   * Optional small umbrella eyebrow above the pill stack. For lunar
   * (Sasha 2026-05-16) this is the ELEMENT EMOJI only — the holonic
   * quadrant name (Will/Emanation/Digestion/Enrichment) stays internal.
   * Rendered larger than the other meta-labels since it's meant to read
   * as a signal, not a caption.
   */
  eyebrow?: string;
  /** Optional native tooltip text shown on hover/long-press of the eyebrow. */
  eyebrowTooltip?: string;
  /**
   * Optional small line directly UNDER the active pill, e.g.
   * "ends Tue May 19 · 2.3 days remaining". Turns a vibe into a window.
   */
  activePillSubLabel?: string;
  /**
   * Optional ultra-concise inline guidance below the pill stack — one
   * short sentence (10–18 words). Watches are glanced; this is the
   * middle path between abstract pills and a paragraph.
   */
  glanceableGuidance?: string;
  /** Override container className. */
  className?: string;
}

export const CycleEnergyBar = ({
  segments,
  currentIndex,
  progress,
  prevLabel,
  currentLabel,
  nextLabel,
  eyebrow,
  eyebrowTooltip,
  activePillSubLabel,
  glanceableGuidance,
  className,
}: CycleEnergyBarProps) => {
  const gradId = `eq-arc-grad-${useId().replace(/:/g, "")}`;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const dashLength = clampedProgress * 100;

  return (
    <div className={cn("flex flex-col items-center w-full", className)}>
      {/* Arc on top */}
      <div className="relative w-full max-w-md">
        <svg
          viewBox="0 0 200 50"
          preserveAspectRatio="none"
          className="block w-full h-12 sm:h-14"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={gradId}
              x1="0"
              y1="0"
              x2="200"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="14%" stopColor="#f59e0b" />
              <stop offset="28%" stopColor="#facc15" />
              <stop offset="42%" stopColor="#84cc16" />
              <stop offset="57%" stopColor="#22d3ee" />
              <stop offset="71%" stopColor="#3b82f6" />
              <stop offset="85%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>

          {/* Background arc (clear glass track) */}
          <path
            d="M 10 45 Q 100 -5 190 45"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Filled portion — rainbow gradient revealed by stroke-dasharray */}
          <path
            d="M 10 45 Q 100 -5 190 45"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="5"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${dashLength} 100`}
            style={{
              filter: "drop-shadow(0 0 6px rgba(255,255,255,0.4))",
            }}
          />
        </svg>

        {/* Orbs below arc.
            Sasha 2026-05-18 design brief — per-position liquid-glass:
            • Orbs at display index ≤ currentIndex are LIT with their
              `litGradient` (the prism-refraction palette for lunar; flat
              identityColor for cycles without a gradient).
            • Orbs AFTER currentIndex are grayed — the cycle hasn't
              reached them yet.
            • Glow is CONTAINED inside the orb shell (inset shadows +
              ring); no large bloom to background. */}
        <div className="-mt-3 flex w-full items-center justify-between px-1 sm:px-2">
          {segments.map((seg, i) => {
            const isCurrent = i === currentIndex;
            const isLit = i <= currentIndex;
            const isLandmark = seg.isLandmark;

            // Liquid-glass background:
            // • lit + has gradient  → render the gradient
            // • lit, no gradient    → glassy white (legacy look)
            // • unlit (after cur)   → cool gray (cycle not reached)
            const background = !isLit
              ? "linear-gradient(135deg, rgba(180,184,196,0.45), rgba(160,165,180,0.55))"
              : seg.litGradient
                ? `linear-gradient(135deg, ${seg.litGradient.from}, ${seg.litGradient.to})`
                : isCurrent
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.65)";

            // Glow contained INSIDE the orb (Sasha's brief: "light not
            // to come out of the liquid glass"). The current orb gets
            // an extra bright inset rim + ring; non-current lit orbs
            // glow softly inside; unlit orbs are flat.
            const boxShadow = isCurrent
              ? [
                  "inset 0 0 14px 2px rgba(255,255,255,0.55)",
                  "inset 0 1px 0 0 rgba(255,255,255,0.9)",
                  "0 0 0 2px rgba(255,255,255,0.85)",
                  "0 4px 14px rgba(0,0,0,0.10)",
                ].join(", ")
              : isLit
                ? [
                    "inset 0 0 8px 1px rgba(255,255,255,0.35)",
                    "inset 0 1px 0 0 rgba(255,255,255,0.7)",
                    "0 2px 6px rgba(0,0,0,0.06)",
                  ].join(", ")
                : isLandmark
                  ? "inset 0 1px 0 0 rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.04)"
                  : "inset 0 1px 0 0 rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.04)";

            return (
              <div
                key={i}
                role="img"
                aria-label={`${seg.label}${isCurrent ? " — current" : ""}`}
                className={cn(
                  "relative flex items-center justify-center rounded-full",
                  "overflow-hidden",  // glow contained
                  "transition-all duration-300",
                  "w-9 h-9 sm:w-11 sm:h-11",
                )}
                style={{
                  background,
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.55)",
                  boxShadow,
                }}
              >
                <span
                  className={cn(
                    "text-sm sm:text-base leading-none select-none",
                    !isLit && "opacity-60",
                  )}
                  style={{
                    // White text-shadow keeps the moon glyph legible on
                    // the colored liquid-glass background, especially the
                    // warmer (red/orange) and cooler (blue/purple) bands.
                    textShadow: isLit
                      ? "0 0 6px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.15)"
                      : "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {seg.icon}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Eyebrow — element-emoji umbrella (lunar: Will/Emanation/Digestion/
          Enrichment surface as 🔥/💧/🌍/🌬️). Holonic NAMES stay internal. */}
      {eyebrow && (
        <div
          className="mt-5 select-none text-2xl leading-none opacity-80"
          title={eyebrowTooltip}
          aria-label={eyebrowTooltip ?? eyebrow}
          role="img"
        >
          {eyebrow}
        </div>
      )}

      {/* Pill stack: prev (dim) / current (elevated) / next (dim) */}
      <div
        className={cn(
          "flex w-full max-w-xs flex-col items-stretch gap-2",
          eyebrow ? "mt-1" : "mt-6",
        )}
      >
        <DimPill>{prevLabel}</DimPill>
        <ActivePill>{currentLabel}</ActivePill>

        {/* Time-to-next-phase sub-label (sits flush under active pill) */}
        {activePillSubLabel && (
          <div className="-mt-1 px-3 text-center text-[11px] font-medium uppercase tracking-wider text-[#0a1628]/75 eq-text-halo">
            {activePillSubLabel}
          </div>
        )}

        <DimPill>{nextLabel}</DimPill>
      </div>

      {/* Glanceable inline guidance — one short sentence, plain voice */}
      {glanceableGuidance && (
        <p className="eq-text-halo mt-4 max-w-md px-3 text-center text-sm italic text-[#0a1628]/90">
          {glanceableGuidance}
        </p>
      )}
    </div>
  );
};

const DimPill = ({ children }: { children: ReactNode }) => (
  <div
    className="eq-text-halo rounded-full px-6 py-2 text-center text-sm font-medium text-[#0a1628]/95"
    style={{
      background: "rgba(255,255,255,0.65)",
      backdropFilter: "blur(6px)",
      border: "1px solid rgba(255,255,255,0.5)",
    }}
  >
    {children}
  </div>
);

const ActivePill = ({ children }: { children: ReactNode }) => (
  <div
    className="eq-text-halo rounded-full px-6 py-3 text-center text-base font-semibold text-[#0a1628]"
    style={{
      background:
        "linear-gradient(135deg, rgba(252,231,197,0.92) 0%, rgba(212,212,255,0.92) 50%, rgba(224,197,252,0.92) 100%)",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,0.7)",
      boxShadow:
        "0 0 20px rgba(212,180,255,0.45), inset 0 1px 0 0 rgba(255,255,255,0.85), 0 4px 14px rgba(0,0,0,0.06)",
    }}
  >
    {children}
  </div>
);

export default CycleEnergyBar;

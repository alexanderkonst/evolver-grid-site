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
  /** Hex color used for the orb's glow when current. */
  identityColor: string;
  /** Accessible label for the orb (announced + tooltip). */
  label: string;
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

        {/* Orbs below arc */}
        <div className="-mt-3 flex w-full items-center justify-between px-1 sm:px-2">
          {segments.map((seg, i) => {
            const isCurrent = i === currentIndex;
            const isLandmark = seg.isLandmark;
            return (
              <div
                key={i}
                role="img"
                aria-label={`${seg.label}${isCurrent ? " — current" : ""}`}
                className={cn(
                  "relative flex items-center justify-center rounded-full",
                  "transition-all duration-300",
                  "w-9 h-9 sm:w-11 sm:h-11",
                )}
                style={{
                  background: isCurrent
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  boxShadow: isCurrent
                    ? `0 0 24px 4px ${seg.identityColor}, inset 0 1px 0 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.08)`
                    : isLandmark
                      ? `0 0 12px 1px ${seg.identityColor}88, inset 0 1px 0 0 rgba(255,255,255,0.7), 0 2px 6px rgba(0,0,0,0.05)`
                      : "inset 0 1px 0 0 rgba(255,255,255,0.7), 0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <span className="text-sm sm:text-base leading-none select-none">
                  {seg.icon}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pill stack: prev (dim) / current (elevated) / next (dim) */}
      <div className="mt-6 flex w-full max-w-xs flex-col items-stretch gap-2">
        <DimPill>{prevLabel}</DimPill>
        <ActivePill>{currentLabel}</ActivePill>
        <DimPill>{nextLabel}</DimPill>
      </div>
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

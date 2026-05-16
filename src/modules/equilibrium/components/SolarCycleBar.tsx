import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Solar / Yearly cycle visual — distinct from `<CycleEnergyBar>`.
 *
 * Sasha-supplied mock 2026-05-15:
 *   • 4-segment curved tube with visible joint rings at 1/4, 1/2, 3/4
 *   • Golden plasma fill from LEFT representing REMAINING energy (1 - progress)
 *     — fill shrinks as the year elapses
 *   • Fractional "LEFT" checkpoints labeled above the curve at 1/8 / 1/4 / 1/2 / 3/4
 *   • Central golden orb suspended below the curve = current energy state
 *   • prev / current / next pill stack underneath
 *
 * Energy labels for the pill stack are still TBD by Sasha (no solar voice
 * supplied yet); for now passing through whatever cycles.ts produces.
 */

export interface SolarCycleBarProps {
  /** Year progress 0-1 (elapsed). Fill width = (1 - progress) of the arc. */
  progress: number;
  /**
   * Optional pill-stack labels. Sasha 2026-05-15: solar visual is
   * self-explanatory (the orb + filled tube + LEFT checkpoints already
   * communicate the position) — pills omitted by default. Pass any of these
   * to opt in.
   */
  prevLabel?: string;
  currentLabel?: string;
  nextLabel?: string;
  className?: string;
}

// Quadratic Bézier control points for the arc.
const ARC_X0 = 20;
const ARC_Y0 = 100;
const ARC_CX = 200;
const ARC_CY = 10;
const ARC_X1 = 380;
const ARC_Y1 = 100;

function pointOnArc(t: number): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * ARC_X0 + 2 * u * t * ARC_CX + t * t * ARC_X1,
    y: u * u * ARC_Y0 + 2 * u * t * ARC_CY + t * t * ARC_Y1,
  };
}

const JOINT_POSITIONS = [0.25, 0.5, 0.75] as const;
const FRACTIONAL_LABELS: { t: number; label: string }[] = [
  { t: 0.125, label: "1/8" },
  { t: 0.25, label: "1/4" },
  { t: 0.5, label: "1/2" },
  { t: 0.75, label: "3/4" },
];

export const SolarCycleBar = ({
  progress,
  prevLabel,
  currentLabel,
  nextLabel,
  className,
}: SolarCycleBarProps) => {
  const idBase = useId().replace(/:/g, "");
  const gradId = `solar-fill-${idBase}`;
  const glowId = `solar-glow-${idBase}`;

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const remaining = 1 - clampedProgress;
  const fillLen = remaining * 100;

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      {/* Curved tube with fractional labels + central orb */}
      <div className="relative w-full max-w-md">
        <svg
          viewBox="0 0 400 130"
          preserveAspectRatio="xMidYMid meet"
          className="block w-full h-32 sm:h-36"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={gradId}
              x1={ARC_X0}
              y1="0"
              x2={ARC_X1}
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <radialGradient id={glowId} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
            </radialGradient>
          </defs>

          {/* Background tube (clear glass) */}
          <path
            d={`M ${ARC_X0} ${ARC_Y0} Q ${ARC_CX} ${ARC_CY} ${ARC_X1} ${ARC_Y1}`}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Subtle inner shadow on the tube for glass feel */}
          <path
            d={`M ${ARC_X0} ${ARC_Y0} Q ${ARC_CX} ${ARC_CY} ${ARC_X1} ${ARC_Y1}`}
            fill="none"
            stroke="rgba(0,0,0,0.04)"
            strokeWidth="11"
            strokeLinecap="round"
          />

          {/* Filled portion — golden plasma from LEFT (= remaining) */}
          {fillLen > 0 && (
            <path
              d={`M ${ARC_X0} ${ARC_Y0} Q ${ARC_CX} ${ARC_CY} ${ARC_X1} ${ARC_Y1}`}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="11"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray={`${fillLen} 100`}
              style={{
                filter: "drop-shadow(0 0 10px rgba(251, 191, 36, 0.55))",
              }}
            />
          )}

          {/* Joint rings at 1/4, 1/2, 3/4 */}
          {JOINT_POSITIONS.map((t) => {
            const pos = pointOnArc(t);
            return (
              <g key={t}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="9"
                  fill="rgba(255,255,255,0.92)"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1"
                />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="6.5"
                  fill="none"
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth="0.5"
                />
              </g>
            );
          })}

          {/* Fractional "X LEFT" labels */}
          {FRACTIONAL_LABELS.map(({ t, label }) => {
            const pos = pointOnArc(t);
            return (
              <g key={t}>
                <line
                  x1={pos.x}
                  y1={pos.y - 11}
                  x2={pos.x}
                  y2={pos.y - 28}
                  stroke="rgba(180,140,80,0.45)"
                  strokeWidth="0.5"
                />
                <text
                  x={pos.x}
                  y={pos.y - 36}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="500"
                  fill="rgba(120,90,40,0.85)"
                  style={{ fontFamily: "ui-serif, Georgia, serif" }}
                >
                  {label}
                </text>
                <text
                  x={pos.x + 14}
                  y={pos.y - 36}
                  textAnchor="start"
                  fontSize="8"
                  letterSpacing="1"
                  fill="rgba(120,90,40,0.55)"
                  style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
                >
                  LEFT
                </text>
              </g>
            );
          })}
        </svg>

        {/* Central golden orb suspended below the curve */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{ top: "62%" }}
          aria-label="Current solar energy"
          role="img"
        >
          <div
            className="h-14 w-14 rounded-full sm:h-16 sm:w-16"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #fef9c3 0%, #fde68a 25%, #f59e0b 55%, #c2410c 100%)",
              boxShadow:
                "0 0 28px 6px rgba(251, 191, 36, 0.45), inset 0 -10px 18px rgba(154, 52, 18, 0.35), inset 0 5px 10px rgba(254, 243, 199, 0.6)",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          />
        </div>
      </div>

      {/* Pill stack — opt-in. Solar's visual is self-explanatory; only render
          if the caller explicitly passes labels. */}
      {(prevLabel || currentLabel || nextLabel) && (
        <div className="mt-8 flex w-full max-w-xs flex-col items-stretch gap-2">
          {prevLabel && <DimPill>{prevLabel}</DimPill>}
          {currentLabel && <ActivePill>{currentLabel}</ActivePill>}
          {nextLabel && <DimPill>{nextLabel}</DimPill>}
        </div>
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

export default SolarCycleBar;

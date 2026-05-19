import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * MDLS · Aurora Cycle Disc
 *
 * The hero cycle-clock instrument — large aurora-glass disc with twelve
 * labels around the perimeter, a coral indicator dot at the current
 * cycle position, and an optional inner label slot.
 *
 * §9.3-extended of Style Guide. Composes onto `.mdls-aurora-glass-orb`
 * material — the form is round; color enters from within (Principle 1).
 *
 * Anatomy:
 *
 *                       JAN
 *                  ┄┄┄┄┄┄┄┄┄┄
 *              DEC            FEB
 *           ╱   ┌─────────────┐   ╲
 *         NOV   │   AURORA    │   MAR  ← coral DAY-N dot
 *          │    │   ORB CORE  │    │     positioned on the
 *         OCT   │             │   APR    perimeter at the
 *           ╲   └─────────────┘   ╱     current day angle
 *              SEP            MAY
 *                  ┄┄┄┄┄┄┄┄┄┄
 *                       JUL
 *
 *  Inner label: "WINTER · WILL-BUILDING" (optional, centered)
 *
 * Default 12 month labels (JAN through DEC). Custom labels supported
 * (e.g., cycle stations rather than calendar months).
 *
 * Day position computed from `currentDay / totalDays * 360°` starting
 * from top (12 o'clock = day 0). Coral dot at that angle.
 */
interface AuroraCycleDiscProps {
  size?: number;
  variant?: "light" | "dark";
  /** 12 labels around the perimeter. Default: calendar month abbreviations. */
  labels?: string[];
  /** Current day in the cycle (defaults to 0). Used to position the coral dot. */
  currentDay?: number;
  /** Total days in the cycle (defaults to 365). */
  totalDays?: number;
  /** Optional Day-N label shown next to the coral dot (e.g., "DAY 73"). */
  currentDayLabel?: string;
  /** Optional inner label slot — centered inside the orb. */
  children?: ReactNode;
  className?: string;
}

const DEFAULT_MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

export const AuroraCycleDisc = ({
  size = 360,
  variant = "light",
  labels = DEFAULT_MONTHS,
  currentDay = 0,
  totalDays = 365,
  currentDayLabel,
  children,
  className,
}: AuroraCycleDiscProps) => {
  // Disc dimensions
  const orbSize = size;
  // Padding around the orb for labels: 14% of size, minimum 36px
  const labelRingPadding = Math.max(36, size * 0.14);
  const wrapperSize = orbSize + labelRingPadding * 2;

  // Label ring radius — from center to where labels sit
  const labelRadius = orbSize / 2 + labelRingPadding * 0.55;

  // Day-marker ring radius — slightly inside the label ring, on the orb edge
  const dotRadius = orbSize / 2;

  // Day angle in degrees, starting from top (12 o'clock), going clockwise.
  // currentDay = 0 → 0deg (top); currentDay = totalDays/4 → 90deg (right); etc.
  const dayAngleDeg = (currentDay / totalDays) * 360;

  return (
    <div
      className={cn("relative mx-auto", className)}
      style={{ width: wrapperSize, height: wrapperSize }}
    >
      {/* The orb itself, centered */}
      <div
        className={cn(
          "mdls-aurora-glass-orb absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          variant === "dark" && "mdls-aurora-glass-orb--dark",
        )}
        style={{ width: orbSize, height: orbSize }}
        aria-hidden={children ? undefined : true}
      >
        {/* Inner label slot — centered inside the orb, above the gradient */}
        {children && (
          <div
            className="absolute inset-0 flex items-center justify-center text-center px-6"
            style={{
              color:
                variant === "dark"
                  ? "rgba(255, 255, 255, 0.92)"
                  : "rgba(10, 18, 34, 0.85)",
              textShadow:
                variant === "dark"
                  ? "0 1px 2px rgba(0,0,0,0.30), 0 0 24px rgba(255,200,160,0.25)"
                  : "0 1px 2px rgba(255,255,255,0.60), 0 0 16px rgba(255,200,160,0.40)",
              letterSpacing: "0.18em",
              fontSize: Math.max(10, Math.round(orbSize * 0.038)),
              fontWeight: 500,
              textTransform: "uppercase",
              fontFamily: "DM Sans, Inter, sans-serif",
            }}
          >
            {children}
          </div>
        )}
      </div>

      {/* Twelve labels positioned around the perimeter */}
      {labels.slice(0, 12).map((label, i) => {
        const angle = (i * 30) - 90; // i=0 → -90deg (top); i=3 → 0deg (right)
        const rad = (angle * Math.PI) / 180;
        const x = wrapperSize / 2 + Math.cos(rad) * labelRadius;
        const y = wrapperSize / 2 + Math.sin(rad) * labelRadius;
        return (
          <span
            key={label + i}
            className="absolute select-none"
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
              fontFamily: "DM Sans, Inter, sans-serif",
              fontSize: Math.max(9, Math.round(size * 0.030)),
              fontWeight: 500,
              letterSpacing: "0.10em",
              color:
                variant === "dark"
                  ? "rgba(255, 255, 255, 0.55)"
                  : "rgba(10, 18, 34, 0.55)",
              pointerEvents: "none",
            }}
          >
            {label}
          </span>
        );
      })}

      {/* Subtle tick marks at each label position (just inside the label ring) */}
      {labels.slice(0, 12).map((_, i) => {
        const angle = (i * 30) - 90;
        const rad = (angle * Math.PI) / 180;
        const tickInner = orbSize / 2 + 4;
        const tickOuter = orbSize / 2 + 10;
        const x1 = wrapperSize / 2 + Math.cos(rad) * tickInner;
        const y1 = wrapperSize / 2 + Math.sin(rad) * tickInner;
        const x2 = wrapperSize / 2 + Math.cos(rad) * tickOuter;
        const y2 = wrapperSize / 2 + Math.sin(rad) * tickOuter;
        return (
          <svg
            key={`tick-${i}`}
            className="absolute inset-0 pointer-events-none"
            width={wrapperSize}
            height={wrapperSize}
            aria-hidden="true"
          >
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={
                variant === "dark"
                  ? "rgba(255, 255, 255, 0.30)"
                  : "rgba(10, 18, 34, 0.30)"
              }
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </svg>
        );
      })}

      {/* Coral DAY-N dot at the current cycle position */}
      <div
        className="absolute flex items-center pointer-events-none"
        style={{
          left: wrapperSize / 2,
          top: wrapperSize / 2,
          transform: `rotate(${dayAngleDeg}deg) translateY(-${dotRadius}px)`,
          transformOrigin: "0 0",
        }}
      >
        {/* Counter-rotate the dot+label so it doesn't tip */}
        <div
          style={{
            transform: `rotate(-${dayAngleDeg}deg) translate(-50%, -50%)`,
            transformOrigin: "center",
            display: "flex",
            alignItems: "center",
            gap: 8,
            position: "absolute",
            left: 0,
            top: 0,
          }}
        >
          <span
            className="mdls-coral-dot"
            style={{ width: 10, height: 10 }}
            aria-label={currentDayLabel ?? `Day ${currentDay}`}
          />
          {currentDayLabel && (
            <span
              style={{
                fontFamily: "DM Sans, Inter, sans-serif",
                fontSize: Math.max(9, Math.round(size * 0.030)),
                fontWeight: 600,
                letterSpacing: "0.10em",
                color:
                  variant === "dark"
                    ? "rgba(255, 255, 255, 0.85)"
                    : "rgba(10, 18, 34, 0.78)",
                whiteSpace: "nowrap",
              }}
            >
              {currentDayLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuroraCycleDisc;

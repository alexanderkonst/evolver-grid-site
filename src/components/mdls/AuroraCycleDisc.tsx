import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * MDLS · Aurora Cycle Disc
 *
 * The hero cycle-clock instrument — large aurora-glass disc with twelve
 * labels around the perimeter, a coral indicator dot at the current
 * cycle position, and an optional inner label slot.
 *
 * v1.3 (2026-05-18) — label positioning rewritten via absolute trig
 * (cos/sin) instead of rotate+translate. DAY-N label now sits OUTSIDE
 * the orb perimeter (no longer overlaps the inner WINTER·WILL-BUILDING
 * label). Label text-aligns toward the orb edge so it reads naturally.
 *
 * Default 12 month labels (JAN through DEC). Custom labels supported.
 * Day position computed from `currentDay / totalDays * 360°` starting
 * from top (12 o'clock = day 0). Coral dot on perimeter at that angle.
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
  /** Optional Day-N label shown beside the coral dot (e.g., "DAY 73"). */
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
  const cx = wrapperSize / 2;
  const cy = wrapperSize / 2;

  // Label ring radius — from center to where labels sit
  const labelRadius = orbSize / 2 + labelRingPadding * 0.55;

  // Day angle in degrees, starting from top (12 o'clock), going clockwise.
  // currentDay = 0 → 0deg (top); currentDay = totalDays/4 → 90deg (right); etc.
  const dayAngleDeg = (currentDay / totalDays) * 360;
  // Convert to standard math coordinates (0 = right, counter-clockwise),
  // adjusted so day-0 is at top (-90 deg in math coords):
  const dayRad = ((dayAngleDeg - 90) * Math.PI) / 180;

  // Coral dot position — on the orb perimeter
  const dotX = cx + Math.cos(dayRad) * (orbSize / 2);
  const dotY = cy + Math.sin(dayRad) * (orbSize / 2);

  // Day-label position — slightly outside the orb
  const labelOffsetFromOrb = Math.max(14, size * 0.05);
  const dayLabelRadius = orbSize / 2 + labelOffsetFromOrb;
  const dayLabelX = cx + Math.cos(dayRad) * dayLabelRadius;
  const dayLabelY = cy + Math.sin(dayRad) * dayLabelRadius;
  // If on the right half of the orb, label extends rightward (translate 0%, -50%);
  // if on the left half, label extends leftward (translate -100%, -50%);
  const onRightHalf = Math.cos(dayRad) > -0.15;
  const dayLabelTransform = onRightHalf
    ? "translate(0%, -50%)"
    : "translate(-100%, -50%)";

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
                  : "0 1px 2px rgba(255,255,255,0.65), 0 0 18px rgba(255,205,160,0.45)",
              letterSpacing: "0.20em",
              fontSize: Math.max(10, Math.round(orbSize * 0.038)),
              fontWeight: 500,
              textTransform: "uppercase",
              fontFamily: "DM Sans, Inter, sans-serif",
              lineHeight: 1.4,
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
        const x = cx + Math.cos(rad) * labelRadius;
        const y = cy + Math.sin(rad) * labelRadius;
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

      {/* Subtle tick marks at each label position (just outside the orb edge) */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={wrapperSize}
        height={wrapperSize}
        aria-hidden="true"
      >
        {labels.slice(0, 12).map((_, i) => {
          const angle = (i * 30) - 90;
          const rad = (angle * Math.PI) / 180;
          const tickInner = orbSize / 2 + 4;
          const tickOuter = orbSize / 2 + 10;
          return (
            <line
              key={`tick-${i}`}
              x1={cx + Math.cos(rad) * tickInner}
              y1={cy + Math.sin(rad) * tickInner}
              x2={cx + Math.cos(rad) * tickOuter}
              y2={cy + Math.sin(rad) * tickOuter}
              stroke={
                variant === "dark"
                  ? "rgba(255, 255, 255, 0.30)"
                  : "rgba(10, 18, 34, 0.30)"
              }
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Coral DAY-N dot — on the orb perimeter at the current cycle position */}
      <span
        className="mdls-coral-dot absolute pointer-events-none"
        style={{
          left: dotX,
          top: dotY,
          width: 11,
          height: 11,
          transform: "translate(-50%, -50%)",
          boxShadow:
            "0 0 10px hsl(15 88% 60% / 0.85), 0 0 22px hsl(15 88% 60% / 0.45)",
          zIndex: 2,
        }}
        aria-label={currentDayLabel ?? `Day ${currentDay}`}
      />

      {/* DAY-N label — placed outside the orb, on the side of the perimeter
          (right-half: text extends rightward; left-half: extends leftward). */}
      {currentDayLabel && (
        <span
          className="absolute pointer-events-none select-none"
          style={{
            left: dayLabelX,
            top: dayLabelY,
            transform: dayLabelTransform,
            fontFamily: "DM Sans, Inter, sans-serif",
            fontSize: Math.max(10, Math.round(size * 0.032)),
            fontWeight: 600,
            letterSpacing: "0.10em",
            color:
              variant === "dark"
                ? "rgba(255, 255, 255, 0.85)"
                : "rgba(10, 18, 34, 0.78)",
            whiteSpace: "nowrap",
            zIndex: 2,
          }}
        >
          {currentDayLabel}
        </span>
      )}
    </div>
  );
};

export default AuroraCycleDisc;

import type { CSSProperties, ReactNode } from "react";
import type { NaturalClockState } from "./naturalClock";
import { CLOCK_INK, CLOCK_MONO, CLOCK_TEAL, NaturalClockMoon } from "./NaturalClockMoon";
import { NATURAL_CLOCK_COPY } from "../equilibriumCopy";

interface NaturalClockStripProps {
  clock: NaturalClockState;
  /** Tap on any chip opens the full face. */
  onOpen: () => void;
  /** Called by the year chip when no birthday is known; falls back to onOpen. */
  onAskBirthday?: () => void;
  className?: string;
}

const chipStyle: CSSProperties = {
  fontFamily: CLOCK_MONO,
  color: CLOCK_INK,
  minHeight: 44,
};

const Chip = ({
  icon,
  children,
  onClick,
  label,
}: {
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
  label?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="flex min-w-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] leading-tight transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5ec8bd]"
    style={chipStyle}
  >
    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-sm leading-none" aria-hidden="true">
      {icon}
    </span>
    <span className="min-w-0">{children}</span>
  </button>
);

/** A tiny battery: outline, nub, and a fill for the share of the year left. */
const BatteryIcon = ({ share }: { share: number }) => (
  <svg viewBox="0 0 18 10" width="18" height="10" aria-hidden="true" focusable="false">
    <rect x="0.75" y="0.75" width="14.5" height="8.5" rx="2" fill="none" stroke={CLOCK_INK} strokeOpacity="0.6" strokeWidth="1.2" />
    <rect x="16" y="3" width="1.6" height="4" rx="0.6" fill={CLOCK_INK} fillOpacity="0.6" />
    <rect x="2" y="2" width={Math.max(0, Math.min(1, share)) * 12} height="6" rx="1" fill={CLOCK_TEAL} />
  </svg>
);

const SunIcon = ({ altitudeDeg }: { altitudeDeg: number }) => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
    <circle
      cx="8"
      cy="8"
      r="3.4"
      fill={altitudeDeg >= -0.833 ? CLOCK_INK : "none"}
      stroke={CLOCK_INK}
      strokeOpacity={altitudeDeg >= -0.833 ? 1 : 0.55}
      strokeWidth="1.2"
    />
    {altitudeDeg >= -0.833 &&
      [0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1="8"
          y1="1"
          x2="8"
          y2="2.6"
          stroke={CLOCK_INK}
          strokeWidth="1.1"
          strokeLinecap="round"
          transform={`rotate(${a} 8 8)`}
        />
      ))}
  </svg>
);

/**
 * Compact strip: `Golden hour · Prep for Harvest, 3d · ♃ Thursday, expand ·
 * 64 days to your new year`. A 2×2 grid at 390px, one row from `sm` up.
 * Each chip opens the full face.
 */
export const NaturalClockStrip = ({ clock, onOpen, onAskBirthday, className }: NaturalClockStripProps) => {
  const { light, moon, week, year, yearLine } = clock;
  return (
    <div
      role="group"
      aria-label={NATURAL_CLOCK_COPY.stripLabel}
      className={`grid grid-cols-2 gap-x-1 gap-y-0.5 rounded-2xl p-1 sm:grid-cols-4 ${className ?? ""}`}
      style={{
        background: "rgba(14, 20, 28, 0.62)",
        border: "1px solid rgba(230, 235, 242, 0.14)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <Chip icon={<SunIcon altitudeDeg={light.altitudeDeg} />} onClick={onOpen} label={`Sunlight: ${light.state}`}>
        {light.state}
      </Chip>
      <Chip
        icon={<NaturalClockMoon fraction={moon.fraction} waxing={moon.waxing} size={14} />}
        onClick={onOpen}
        label={`Moon: ${moon.phaseName}, ${moon.daysToNext} days to the next phase`}
      >
        {moon.phaseName}, {moon.daysToNext}d
      </Chip>
      <Chip icon={<span>{week.glyph}</span>} onClick={onOpen} label={`Week: ${week.dayName}, ${week.word}`}>
        {week.dayName}, {week.word.toLowerCase()}
      </Chip>
      {year ? (
        <Chip icon={<BatteryIcon share={year.battery} />} onClick={onOpen} label={`Year: ${yearLine}`}>
          {yearLine}
        </Chip>
      ) : (
        <Chip
          icon={<BatteryIcon share={0} />}
          onClick={onAskBirthday ?? onOpen}
          label={NATURAL_CLOCK_COPY.addBirthday}
        >
          <span style={{ color: CLOCK_TEAL }}>{NATURAL_CLOCK_COPY.addBirthday}</span>
        </Chip>
      )}
    </div>
  );
};

export default NaturalClockStrip;

import { cn } from "@/lib/utils";

export type WatchMode = "act" | "attune";

interface WatchModeToggleProps {
  mode: WatchMode;
  onChange: (next: WatchMode) => void;
}

/**
 * Two-pill binary toggle for the Equilibrium watch.
 *
 *   ATTUNE mode (feminine, reading)  — Synthesis · Solar · Zodiac ·
 *                                       Lunar + Moon Focus · Day-of-Week.
 *                                       The energetic reading. The user
 *                                       opens this to TUNE into the cycles
 *                                       before working.
 *   ACT mode    (masculine, working) — Mission · Role · Current Strategy ·
 *                                       Workstreams · Intuitive Tasks ·
 *                                       DO NOW. The working tool — used
 *                                       as Trello. Mission + Role sit on
 *                                       top as the North Stars.
 *
 * Per philosophical spine §11 (round 5 — clean binary, no "compressed
 * attune in act" framing). The sequence is in the user's hands: attune
 * first, then flip to act. The toggle IS the transition ritual.
 *
 * ATTUNE comes first in the pill order (left) because the natural sequence
 * is attune-then-act. Default state for first-ever load = ATTUNE.
 */
export const WatchModeToggle = ({ mode, onChange }: WatchModeToggleProps) => {
  return (
    <div
      role="radiogroup"
      aria-label="Watch viewing mode"
      className="liquid-glass inline-flex rounded-full p-1"
    >
      <ModePill
        active={mode === "attune"}
        label="ATTUNE"
        title="ATTUNE mode — feminine. The energetic reading. Synthesis, solar, zodiac, lunar, day-of-week."
        onClick={() => onChange("attune")}
      />
      <ModePill
        active={mode === "act"}
        label="ACT"
        title="ACT mode — masculine. The working tool. Mission and role on top as North Stars, then strategy, workstreams, tasks, DO NOW."
        onClick={() => onChange("act")}
      />
    </div>
  );
};

const ModePill = ({
  active,
  label,
  title,
  onClick,
}: {
  active: boolean;
  label: string;
  title: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={active}
    onClick={onClick}
    title={title}
    className={cn(
      "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition",
      active
        ? "bg-[#0a1628] text-white shadow-sm"
        : "text-[#0a1628]/70 hover:text-[#0a1628]",
    )}
  >
    {label}
  </button>
);

export default WatchModeToggle;

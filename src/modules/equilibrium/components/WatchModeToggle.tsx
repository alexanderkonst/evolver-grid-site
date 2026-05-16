import { cn } from "@/lib/utils";

export type WatchMode = "act" | "attune";

interface WatchModeToggleProps {
  mode: WatchMode;
  onChange: (next: WatchMode) => void;
}

/**
 * Two-pill toggle for the Equilibrium watch viewing mode.
 *
 *   ACT mode    — slim 6-section view (Synthesis · Lunar · Current Strategy ·
 *                 Workstreams · Intuitive Tasks · DO NOW). The functional watch
 *                 used for daily glance + action.
 *   ATTUNE mode — full 11-section view, adds Mission · Role · Solar · Zodiac ·
 *                 Day-of-Week. Used for weekly review + recalibration.
 *
 * Per philosophical spine §11. Names are verbs that communicate the function
 * the user opens the watch FOR (Sasha 2026-05-16: "something functional that
 * communicates the functionality" — rejected mechanical labels like
 * "full / partial").
 */
export const WatchModeToggle = ({ mode, onChange }: WatchModeToggleProps) => {
  return (
    <div
      role="radiogroup"
      aria-label="Watch viewing mode"
      className="liquid-glass inline-flex rounded-full p-1"
    >
      <ModePill
        active={mode === "act"}
        label="ACT MODE"
        title="ACT mode — slim. The watch you open to act on what the moment calls for."
        onClick={() => onChange("act")}
      />
      <ModePill
        active={mode === "attune"}
        label="ATTUNE MODE"
        title="ATTUNE mode — full. The watch you open to attune to all the cycles."
        onClick={() => onChange("attune")}
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

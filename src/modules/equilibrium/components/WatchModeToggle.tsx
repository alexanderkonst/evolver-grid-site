import { cn } from "@/lib/utils";

export type WatchMode = "act" | "attune";

interface WatchModeToggleProps {
  mode: WatchMode;
  onChange: (next: WatchMode) => void;
}

/**
 * Two-pill toggle for the Equilibrium watch viewing mode.
 *
 *   ACT mode          — slim 6-section view (Synthesis · Lunar · Current
 *                       Strategy · Workstreams · Intuitive Tasks · DO NOW).
 *                       The functional watch used for daily glance + action.
 *   ACT + ATTUNE mode — full 11-section view. EVERY ACT section is still
 *                       there + 5 attunement surfaces on top (Mission ·
 *                       Role · Solar · Zodiac · Day-of-Week). Act AND
 *                       attune at once. Used for weekly review + recalibration.
 *
 * Per philosophical spine §11. The depth toggle is ADDITIVE — it doesn't
 * replace the action surfaces, it adds the attunement surfaces. Internal
 * state names stay "act" / "attune" for brevity; display labels are
 * "ACT MODE" and "ACT + ATTUNE MODE" so users see the additive nature.
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
        label="ACT + ATTUNE MODE"
        title="ACT + ATTUNE mode — full. All action surfaces stay; mission, role, solar, zodiac, and day-of-week are added on top."
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

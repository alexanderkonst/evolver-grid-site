import { memo, useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { MOON_PHASES } from "@/lib/equilibrium-cycles";

interface PhaseTransitionEyebrowProps {
  /** Current lunar segment index (0-7). */
  currentSegmentIndex: number;
  /** Current phase name (used for last-seen comparison). */
  currentPhaseName: string;
}

/**
 * PhaseTransitionEyebrow — a quiet one-line acknowledgement when the
 * lunar phase has shifted since the user's last visit (Sasha
 * 2026-05-24).
 *
 * Why: the watch reveals cycle awareness, but only if the user
 * notices a phase transition. Most transitions happen overnight or
 * while the user is away from the page. This component remembers
 * the last phase the user SAW (in localStorage), compares it to
 * the current phase on mount/tick, and surfaces a one-liner when
 * they don't match:
 *
 *   "since you last visited, the moon moved into Gathering 🌒"
 *
 * Dismissible. Auto-hides once the user has seen this phase.
 *
 * Storage key: `eq_lastSeenLunarPhase` — the phase NAME (string).
 * We compare names, not indices, so renames don't break the gate.
 */
const STORAGE_KEY = "eq_lastSeenLunarPhase";

const SHORT_NAMES: Record<string, string> = {
  "New Moon": "Clearing",
  "Waxing Crescent": "Gathering",
  "First Quarter": "Seeing",
  "Waxing Gibbous": "Leading",
  "Full Moon": "Harvesting",
  "Waning Gibbous": "Celebrating",
  "Last Quarter": "Planning",
  "Waning Crescent": "Planting",
};

const PhaseTransitionEyebrowBase = ({
  currentSegmentIndex,
  currentPhaseName,
}: PhaseTransitionEyebrowProps) => {
  // `previouslySeen` reads from localStorage once on mount. After we
  // surface (or skip) the transition, mark the current phase as seen.
  const [previouslySeen, setPreviouslySeen] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      setPreviouslySeen(seen);
      // Update storage to current phase. We mark "seen" AFTER reading
      // so the next return visit accurately compares.
      window.localStorage.setItem(STORAGE_KEY, currentPhaseName);
    } catch {
      // localStorage unavailable — eyebrow simply won't show.
    }
  }, [currentPhaseName]);

  if (
    dismissed ||
    !previouslySeen ||
    previouslySeen === currentPhaseName
  ) {
    return null;
  }

  const fromPhase = MOON_PHASES.find((p) => p.name === previouslySeen);
  const toPhase = MOON_PHASES[currentSegmentIndex];
  if (!toPhase) return null;

  const fromShort = SHORT_NAMES[previouslySeen] ?? previouslySeen;
  const toShort = SHORT_NAMES[toPhase.name] ?? toPhase.name;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-amber-200/40 bg-amber-50/40 px-3 py-2 text-sm text-[#0a1628]/85"
    >
      <span className="select-none text-lg leading-none" aria-hidden="true">
        {toPhase.symbol}
      </span>
      <span className="italic font-serif">
        since you last visited, the moon moved
        {fromPhase && (
          <>
            {" "}
            from{" "}
            <span className="not-italic font-medium">{fromShort}</span>{" "}
            <ArrowRight className="inline" size={11} />
          </>
        )}{" "}
        into <span className="not-italic font-medium">{toShort}</span>
      </span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="ml-1 rounded-md p-1 text-[#0a1628]/45 transition hover:bg-[#0a1628]/5 hover:text-[#0a1628]/80"
        title="Dismiss"
      >
        <X size={12} />
      </button>
    </div>
  );
};

export const PhaseTransitionEyebrow = memo(PhaseTransitionEyebrowBase);
export default PhaseTransitionEyebrow;

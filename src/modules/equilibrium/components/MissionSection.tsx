import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { InlineEditableText } from "./InlineEditableText";
import { SectionSkeleton } from "./SectionSkeleton";

interface MissionSectionProps {
  missionDisplay: string | null;
  loading: boolean;
  onSetOverride: (text: string | null) => Promise<void> | void;
}

/**
 * "Lifelong Dedication" section in ACT mode (Sasha 2026-05-16 round 6:
 * surface renamed from "Mission" to "Lifelong Dedication"; engineering
 * names like `mission_id`, `mission_participants`, Mission Discovery
 * module stay as-is for cross-platform consistency).
 *
 * Per Sasha's mega-prompt + 1.5 sync behavior:
 *   • Auto-renders the upstream Mission Discovery statement (or override).
 *   • Inline-editable. Save on blur / Enter.
 *   • If no upstream + no override → redirect CTA to /mission-discovery.
 *
 * Sasha 2026-05-19: wrapped in React.memo so the section doesn't
 * re-render on EquilibriumV2Page's 60-second cycle tick (or any other
 * unrelated parent re-render). It only re-renders when missionDisplay,
 * loading, or onSetOverride change. The hook now keeps onSetOverride
 * stable across state changes via the stateRef pattern, so memo is
 * actually effective.
 */
const MissionSectionBase = ({
  missionDisplay,
  loading,
  onSetOverride,
}: MissionSectionProps) => {
  const navigate = useNavigate();

  if (loading) {
    return <SectionSkeleton lines={2} />;
  }

  if (!missionDisplay) {
    return (
      <button
        type="button"
        onClick={() =>
          navigate("/mission-discovery?returnTo=/build/equilibrium")
        }
        className="mt-2 w-full rounded-md border border-dashed border-[#0a1628]/15 px-4 py-6 text-left text-sm text-[#0a1628]/90 transition hover:bg-white/50"
      >
        Name your lifelong dedication →
      </button>
    );
  }

  return (
    <div className="mt-2">
      <InlineEditableText
        value={missionDisplay}
        size="display"
        disabled={loading}
        emptyPlaceholder="—"
        onSave={onSetOverride}
        // Centered body to match the centered section title.
        // Sasha 2026-05-20.
        align="center"
        // Advisory word-count hint. 2026-05-19: relaxed from "one
        // first-person sentence" → "one sentence at life scale". The
        // shape that resonates for Sasha is multi-clause: what / by
        // what means / toward what. 40 words gives enough room.
        wordLimit={40}
        wordLimitHint="one sentence at life scale — what · by what means · toward what"
      />
    </div>
  );
};

export const MissionSection = memo(MissionSectionBase);

export default MissionSection;

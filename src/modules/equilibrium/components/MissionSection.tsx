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
 */
export const MissionSection = ({
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
      />
    </div>
  );
};

export default MissionSection;

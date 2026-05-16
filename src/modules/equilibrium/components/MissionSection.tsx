import { useNavigate } from "react-router-dom";
import { InlineEditableText } from "./InlineEditableText";
import { SectionSkeleton } from "./SectionSkeleton";

interface MissionSectionProps {
  missionDisplay: string | null;
  loading: boolean;
  onSetOverride: (text: string | null) => Promise<void> | void;
}

/**
 * Box 2 — Mission.
 *
 * Per Sasha's mega-prompt + 1.5 sync behavior:
 *   • Auto-renders the upstream Mission Discovery statement (or override).
 *   • Inline-editable. Save on blur / Enter.
 *   • If no upstream + no override → redirect CTA to /mission-discovery.
 *
 * Voice-laden empty-state CTA copy is TBD by Sasha; using a mechanical
 * placeholder for now.
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
        {/* Empty-state copy: TBD — Sasha to supply */}
        Set your mission →
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

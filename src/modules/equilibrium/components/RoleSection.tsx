import { useNavigate } from "react-router-dom";
import { InlineEditableText } from "./InlineEditableText";
import { SectionSkeleton } from "./SectionSkeleton";

interface RoleSectionProps {
  roleDisplay: string | null;
  loading: boolean;
  onSetOverride: (text: string | null) => Promise<void> | void;
}

/**
 * Box 3 — Role (Top Talent).
 *
 * Per mega-prompt + 1.5 sync behavior:
 *   • Auto-renders zog_snapshots.appleseed_data.topTalentProfile.archetype_title.
 *   • Inline-editable. Save on blur / Enter.
 *   • If no upstream + no override → redirect CTA to ZoG entry.
 *
 * Voice-laden empty-state copy is TBD by Sasha.
 */
export const RoleSection = ({
  roleDisplay,
  loading,
  onSetOverride,
}: RoleSectionProps) => {
  const navigate = useNavigate();

  if (loading) {
    return <SectionSkeleton lines={1} />;
  }

  if (!roleDisplay) {
    return (
      <button
        type="button"
        onClick={() => navigate("/?returnTo=/build/equilibrium")}
        className="mt-2 w-full rounded-md border border-dashed border-[#0a1628]/15 px-4 py-6 text-left text-sm text-[#0a1628]/90 transition hover:bg-white/50"
      >
        {/* Empty-state copy: TBD — Sasha to supply */}
        Discover your Top Talent →
      </button>
    );
  }

  return (
    <div className="mt-2">
      <InlineEditableText
        value={roleDisplay}
        size="display"
        disabled={loading}
        emptyPlaceholder="—"
        onSave={onSetOverride}
      />
    </div>
  );
};

export default RoleSection;

import { InfoPopover } from "./InfoPopover";
import { InlineEditableText } from "./InlineEditableText";

interface MoonFocusInputProps {
  value: string | null;
  loading: boolean;
  onSave: (text: string | null) => Promise<void> | void;
}

/**
 * Box 6 subtitle — Moon Focus.
 *
 * Sasha-approved info-icon copy: "1–3 words for this moon cycle's intent."
 * Layout centered per dogfood feedback 2026-05-16.
 *
 * Neumorphic surround on the container (soft inset) so the input reads as
 * a recessed groove inside the lunar card — gentle visual differentiation
 * from the parent glass card.
 */
export const MoonFocusInput = ({
  value,
  loading,
  onSave,
}: MoonFocusInputProps) => {
  return (
    <div
      className="mt-6 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 mx-auto max-w-md"
      style={{
        background: "rgba(255,255,255,0.35)",
        boxShadow:
          "inset 0 2px 4px rgba(10,22,40,0.08), inset 0 -1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(10,22,40,0.04)",
      }}
    >
      <span className="eq-text-halo shrink-0 text-xs uppercase tracking-wider text-[#0a1628]/90">
        Focus:
      </span>
      <div className="flex-1 min-w-0 text-center">
        <InlineEditableText
          value={value}
          size="body"
          disabled={loading}
          emptyPlaceholder="set →"
          onSave={onSave}
        />
      </div>
      <InfoPopover content="1–3 words for this moon cycle's intent." />
    </div>
  );
};

export default MoonFocusInput;

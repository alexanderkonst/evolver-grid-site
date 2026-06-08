import { cn } from "@/lib/utils";
import { InfoPopover } from "./InfoPopover";
import { InlineEditableText } from "./InlineEditableText";

interface MoonFocusInputProps {
  value: string | null;
  loading: boolean;
  onSave: (text: string | null) => Promise<void> | void;
  /**
   * Layout variant. Default `compact` matches the original ATTUNE
   * presentation — sits inside the Lunar card as a sub-element,
   * constrained to `max-w-md` and centered.
   *
   * `wide` (Sasha 2026-06-08) is used when MoonFocusInput is the SOLE
   * content of its own ACT-mode section card. Removes the `max-w-md`
   * cap and the top margin so the pill stretches to match the width
   * of adjacent Dedication / Role / Strategy cards.
   */
  variant?: "compact" | "wide";
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
 *
 * Sasha 2026-06-08: also mirrored into ACT mode between Role and Strategy
 * via the `variant="wide"` prop. Same underlying `moon_focus_text` value;
 * editing from either surface persists to the same field.
 */
export const MoonFocusInput = ({
  value,
  loading,
  onSave,
  variant = "compact",
}: MoonFocusInputProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl px-4 py-3",
        variant === "compact"
          ? "mt-6 mx-auto max-w-md justify-center"
          : "w-full justify-center",
      )}
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

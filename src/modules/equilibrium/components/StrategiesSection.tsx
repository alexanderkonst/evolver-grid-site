import type { EquilibriumStrategy } from "../types";
import { InlineEditableText } from "./InlineEditableText";

interface StrategiesSectionProps {
  strategies: EquilibriumStrategy[];
  loading: boolean;
  onUpsert: (position: 1 | 2 | 3, text: string | null) => Promise<void> | void;
}

/**
 * Box 8 — 3 Current Strategies.
 *
 * Three fixed slots. Empty slot shows "—" with a hover-pencil → click to edit.
 * Info-icon copy (Sasha verbatim §13): "Set when you have clarity"
 * — owned by EquilibriumV2Page (passes via `<SectionHeader infoIcon>`).
 */
export const StrategiesSection = ({
  strategies,
  loading,
  onUpsert,
}: StrategiesSectionProps) => {
  const byPosition: Record<1 | 2 | 3, EquilibriumStrategy | undefined> = {
    1: strategies.find((s) => s.position === 1),
    2: strategies.find((s) => s.position === 2),
    3: strategies.find((s) => s.position === 3),
  };

  return (
    <ol className="mt-2 flex flex-col gap-2">
      {([1, 2, 3] as const).map((position) => (
        <li key={position} className="flex items-start gap-3">
          <span className="mt-3 select-none font-serif text-base text-[#0a1628]/85">
            {position}.
          </span>
          <div className="flex-1">
            <InlineEditableText
              value={byPosition[position]?.text ?? null}
              size="body"
              disabled={loading}
              emptyPlaceholder="—"
              onSave={(text) => onUpsert(position, text)}
            />
          </div>
        </li>
      ))}
    </ol>
  );
};

export default StrategiesSection;

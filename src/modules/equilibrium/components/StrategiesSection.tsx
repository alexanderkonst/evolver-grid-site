import { GripVertical } from "lucide-react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { EquilibriumStrategy } from "../types";
import { InlineEditableText } from "./InlineEditableText";

interface StrategiesSectionProps {
  strategies: EquilibriumStrategy[];
  loading: boolean;
  onUpsert: (position: 1 | 2 | 3, text: string | null) => Promise<void> | void;
  /**
   * Reorder strategies by prioritization. Receives the NEW state at
   * positions 1/2/3 as a 3-tuple. Sasha 2026-05-17.
   */
  onReorder: (orderedTexts: [string | null, string | null, string | null]) => Promise<void> | void;
}

/**
 * Box 8 — Current Strategy.
 *
 * Three slots. Empty slot shows "—" with a hover-pencil → click to edit.
 * **Filled slots are drag-reorderable** (Sasha 2026-05-17): grip handle
 * on the right, dnd-kit sortable, drop swaps texts between positions so
 * #1 is always the highest-priority direction.
 *
 * Info-icon copy: "Set when you have clarity" — owned by EquilibriumV2Page.
 */
export const StrategiesSection = ({
  strategies,
  loading,
  onUpsert,
  onReorder,
}: StrategiesSectionProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byPosition: Record<1 | 2 | 3, EquilibriumStrategy | undefined> = {
    1: strategies.find((s) => s.position === 1),
    2: strategies.find((s) => s.position === 2),
    3: strategies.find((s) => s.position === 3),
  };

  // Sortable item-ids = the current positions of FILLED strategies.
  // Empty slots aren't draggable (nothing to drag).
  const filledPositions = ([1, 2, 3] as const).filter((p) => byPosition[p]);
  const sortableIds = filledPositions.map((p) => `pos-${p}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sortableIds.indexOf(String(active.id));
    const newIdx = sortableIds.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;

    // Texts in current display order (only filled).
    const filledTexts = filledPositions.map((p) => byPosition[p]!.text);
    const reorderedTexts = arrayMove(filledTexts, oldIdx, newIdx);

    // Project back into the 3-slot model. Filled rows take positions
    // 1..N (auto-compact); remaining slots are null.
    const next: [string | null, string | null, string | null] = [null, null, null];
    reorderedTexts.forEach((t, i) => {
      next[i] = t;
    });
    void onReorder(next);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <ol className="mt-2 flex flex-col gap-2">
          {([1, 2, 3] as const).map((position) => {
            const strategy = byPosition[position];
            if (strategy) {
              return (
                <SortableStrategyRow
                  key={`pos-${position}`}
                  id={`pos-${position}`}
                  position={position}
                  strategy={strategy}
                  loading={loading}
                  onSave={(text) => onUpsert(position, text)}
                />
              );
            }
            return (
              <EmptyStrategyRow
                key={`pos-${position}`}
                position={position}
                loading={loading}
                onSave={(text) => onUpsert(position, text)}
              />
            );
          })}
        </ol>
      </SortableContext>
    </DndContext>
  );
};

// ─── Filled row (draggable) ──────────────────────────────────────

const SortableStrategyRow = ({
  id,
  position,
  strategy,
  loading,
  onSave,
}: {
  id: string;
  position: 1 | 2 | 3;
  strategy: EquilibriumStrategy;
  loading: boolean;
  onSave: (text: string | null) => Promise<void> | void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group flex items-start gap-3 rounded-xl border bg-white/55 px-2 py-1 backdrop-blur-sm transition",
        "border-white/40 hover:border-white/70 hover:bg-white/75",
        isDragging && "z-10 opacity-90 shadow-lg",
      )}
    >
      <span className="mt-3 select-none font-serif text-base text-[#0a1628]/90">
        {position}.
      </span>
      <div className="flex-1 min-w-0">
        <InlineEditableText
          value={strategy.text}
          size="body"
          disabled={loading}
          emptyPlaceholder="—"
          onSave={onSave}
        />
      </div>
      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab touch-none p-2 mr-1 text-[#0a1628]/40 hover:text-[#0a1628]/80 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
    </li>
  );
};

// ─── Empty row (not draggable) ────────────────────────────────────

const EmptyStrategyRow = ({
  position,
  loading,
  onSave,
}: {
  position: 1 | 2 | 3;
  loading: boolean;
  onSave: (text: string | null) => Promise<void> | void;
}) => (
  <li className="flex items-start gap-3 px-2 py-1">
    <span className="mt-3 select-none font-serif text-base text-[#0a1628]/85">
      {position}.
    </span>
    <div className="flex-1">
      <InlineEditableText
        value={null}
        size="body"
        disabled={loading}
        emptyPlaceholder="—"
        onSave={onSave}
      />
    </div>
  </li>
);

export default StrategiesSection;

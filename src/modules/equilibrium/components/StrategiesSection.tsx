import { useEffect, useState } from "react";
import { Check, GripVertical, Sparkles } from "lucide-react";
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
import type { EquilibriumStrategy, EquilibriumStrategyIteration } from "../types";
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
  /**
   * Mark a strategy COMPLETE (Sasha 2026-05-29). Archives it to the
   * Harvest section and frees the position slot for a new direction.
   */
  onComplete: (position: 1 | 2 | 3) => Promise<void> | void;
  onIterate: (
    position: 1 | 2 | 3,
  ) => Promise<EquilibriumStrategyIteration | null>;
  iteratingPosition: 1 | 2 | 3 | null;
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
  onComplete,
  onIterate,
  iteratingPosition,
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
                  onComplete={() => onComplete(position)}
                  onIterate={() => onIterate(position)}
                  isIterating={iteratingPosition === position}
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
  onComplete,
  onIterate,
  isIterating,
}: {
  id: string;
  position: 1 | 2 | 3;
  strategy: EquilibriumStrategy;
  loading: boolean;
  onSave: (text: string | null) => Promise<void> | void;
  onComplete: () => Promise<void> | void;
  onIterate: () => Promise<EquilibriumStrategyIteration | null>;
  isIterating: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const [iteration, setIteration] =
    useState<EquilibriumStrategyIteration | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setIteration(null);
    setDraft("");
  }, [strategy.text]);

  const handleIterate = async () => {
    const result = await onIterate();
    if (!result) return;
    setIteration(result);
    setDraft(result.proposedStrategy);
  };

  const handleAccept = async () => {
    const next = draft.trim();
    if (!next) return;
    await onSave(next);
    setIteration(null);
    setDraft("");
  };

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group rounded-xl border bg-white/55 px-2 py-1 backdrop-blur-sm",
        // Sasha 2026-05-25: scope to color/bg so Tailwind doesn't
        // transition `transform` and fight dnd-kit's drag updates.
        "transition-[border-color,background-color] duration-150",
        "border-white/40 hover:border-white/70 hover:bg-white/75",
        isDragging && "z-10 opacity-90 shadow-lg",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-3 select-none font-serif text-base text-[#0a1628]/90">
          {position}.
        </span>
        <div className="min-w-0 flex-1">
          <InlineEditableText
            value={strategy.text}
            size="body"
            disabled={loading}
            emptyPlaceholder="—"
            onSave={onSave}
            // Phase C: advisory hint — strategies are direction-choices,
            // not paragraphs. One sentence each, action-oriented.
            wordLimit={25}
            wordLimitHint="try one sentence, action verb first — direction, not detail"
            // Clamp long strategies to 4 lines with a show-more toggle
            // (Sasha 2026-05-29). The advisory word-limit nudges toward
            // brevity, but when a strategy is genuinely long the row
            // shouldn't become a wall of text.
            clampLines={4}
          />
        </div>

        {/*
          Alignment score badge — visible when strategy has been scored.
          Sasha 2026-05-17: "compare strategies on alignment with my highest
          expression so that I can myself see the score to then prioritize."
          Hover reveals the one-sentence reasoning via native title tooltip
          so it stays glanceable.
        */}
        {typeof strategy.alignment_score === "number" && (
          <ScoreBadge
            score={strategy.alignment_score}
            reasoning={strategy.alignment_reasoning ?? undefined}
          />
        )}

        <button
          type="button"
          aria-label="Iterate strategy"
          title="Iterate this strategy"
          onClick={() => void handleIterate()}
          disabled={loading || isIterating}
          className="mt-1.5 inline-flex shrink-0 items-center gap-1 rounded-full border border-[#0a1628]/10 bg-white/55 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#0a1628]/70 transition hover:bg-white/85 hover:text-[#0a1628] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Sparkles size={13} />
          {isIterating ? "Iterating…" : "Iterate"}
        </button>

        {/*
          Complete strategy — archives into Harvest (Sasha 2026-05-29).
          Moves the strategy from the live table to completions, freeing
          the slot for a new direction.

          Visibility: hover-revealed on desktop, ~60% opacity on mobile
          (max-sm) so it's discoverable without hover. Pattern matches
          DoNowSection / ActiveFocusBanner mobile fallbacks.
        */}
        <button
          type="button"
          aria-label="Complete strategy"
          title="Mark complete — moves to Harvest and frees this slot"
          onClick={() => void onComplete()}
          disabled={loading}
          className="mt-1.5 shrink-0 rounded-full p-1.5 text-emerald-600/70 opacity-0 transition hover:bg-emerald-50 hover:text-emerald-700 group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-60"
        >
          <Check size={16} />
        </button>

        <button
          type="button"
          aria-label="Drag to reorder"
          className="mr-1 cursor-grab touch-none p-2 text-[#0a1628]/40 hover:text-[#0a1628]/80 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      </div>

      {iteration && (
        <div className="ml-8 mt-2 rounded-lg border border-[#0a1628]/10 bg-white/70 p-3 shadow-sm">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0a1628]/70">
            {iteration.strategyTagline}
          </div>
          <p className="text-xs leading-relaxed text-[#0a1628]/80">
            {iteration.bottomLine}
          </p>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={loading}
            rows={2}
            className="mt-2 w-full resize-none rounded-lg border border-[#0a1628]/10 bg-white/80 px-3 py-2 text-sm leading-snug text-[#0a1628] outline-none transition focus:border-[#0a1628]/30 focus:bg-white"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIteration(null);
                setDraft("");
              }}
              className="rounded-full border border-[#0a1628]/10 bg-white/45 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#0a1628]/65 transition hover:bg-white/75 hover:text-[#0a1628]"
            >
              No
            </button>
            <button
              type="button"
              onClick={() => void handleAccept()}
              disabled={loading || draft.trim().length === 0}
              className="rounded-full border border-emerald-500/25 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Accept
            </button>
          </div>
        </div>
      )}
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

// ─── Score badge ──────────────────────────────────────────────────

/**
 * Compact alignment-score chip. Color steps with the band:
 *   80-100 = strong green   (high alignment with highest expression)
 *   50-79  = neutral amber  (medium alignment, has some translation distance)
 *   0-49   = soft red       (low alignment — strategy doesn't engage the gift)
 *
 * Hover (desktop) / long-press (mobile) shows the one-sentence reasoning
 * via the native title tooltip.
 */
const ScoreBadge = ({ score, reasoning }: { score: number; reasoning?: string }) => {
  const tone =
    score >= 80
      ? { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-800" }
      : score >= 50
        ? { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-800" }
        : { bg: "bg-rose-100", border: "border-rose-300", text: "text-rose-800" };
  return (
    <span
      role="img"
      aria-label={`Alignment score ${score}${reasoning ? ` — ${reasoning}` : ""}`}
      title={reasoning ?? `Alignment score: ${score}/100`}
      className={cn(
        "mt-2 inline-flex h-7 min-w-[2.25rem] select-none items-center justify-center rounded-full border px-2 text-xs font-semibold tabular-nums",
        tone.bg,
        tone.border,
        tone.text,
      )}
    >
      {score}
    </span>
  );
};

export default StrategiesSection;

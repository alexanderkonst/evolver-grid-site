import { useState } from "react";
import { Plus, GripVertical, Check, ArrowDown, RotateCcw } from "lucide-react";
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
import type { EquilibriumWorkstream } from "../types";
import { MAX_WORKSTREAMS } from "../hooks/useEquilibriumV2";
import { InlineEditableText } from "./InlineEditableText";

interface WorkstreamsSectionProps {
  workstreams: EquilibriumWorkstream[];
  archivedWorkstreams: EquilibriumWorkstream[];
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onAdd: (title: string) => Promise<void> | void;
  onRename: (id: string, title: string) => Promise<void> | void;
  /** Soft-archive ("complete") — preserves data, reversible via onRestore. */
  onDelete: (id: string) => Promise<void> | void;
  /** Restore a completed workstream back to active. */
  onRestore: (id: string) => Promise<void> | void;
  onReorder: (orderedIds: string[]) => Promise<void> | void;
}

/**
 * Box 9 — Workstreams.
 *
 * Drag-reorderable chips. Click to set ACTIVE — drives Box 10's task list +
 * smooth-scrolls Box 10 into view (Sasha 2026-05-16: selection UX was unclear).
 *
 * "Complete" action soft-archives a workstream — data preserved, restorable
 * from the completed pile below.
 */
export const WorkstreamsSection = ({
  workstreams,
  archivedWorkstreams,
  activeId,
  loading,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onRestore,
  onReorder,
}: WorkstreamsSectionProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [showCompleted, setShowCompleted] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = workstreams.findIndex((w) => w.id === active.id);
    const newIndex = workstreams.findIndex((w) => w.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(workstreams, oldIndex, newIndex);
    void onReorder(reordered.map((w) => w.id));
  };

  /** Selection handler: set active + smooth-scroll Goals into view. */
  const handleSelect = (id: string) => {
    onSelect(id);
    // Small delay so the SmartGoalsSection has time to re-render its title.
    setTimeout(() => {
      const goalsEl = document.getElementById("goals");
      if (!goalsEl) return;
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      goalsEl.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });
    }, 80);
  };

  const atCap = workstreams.length >= MAX_WORKSTREAMS;
  const hasNoActive = workstreams.length > 0 && !activeId;

  return (
    <div className="mt-2">
      {hasNoActive && (
        <p className="mb-2 px-2 text-xs italic text-[#0a1628]/70">
          Click a workstream to open its tasks below ↓
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={workstreams.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-2">
            {workstreams.map((w, idx) => (
              <SortableWorkstreamChip
                key={w.id}
                workstream={w}
                index={idx}
                isActive={w.id === activeId}
                loading={loading}
                onSelect={() => handleSelect(w.id)}
                onRename={(title) => onRename(w.id, title)}
                onDelete={() => onDelete(w.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {atCap ? (
        <p className="mt-3 px-2 text-xs italic text-[#0a1628]/90">
          group your workstreams to avoid very high context switching costs
        </p>
      ) : (
        <AddWorkstreamRow onAdd={onAdd} disabled={loading} />
      )}

      {archivedWorkstreams.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="flex w-full items-center gap-2 px-2 text-xs uppercase tracking-wider text-[#0a1628]/60 transition hover:text-[#0a1628]/90"
          >
            <span>completed</span>
            <span className="text-[#0a1628]/40">({archivedWorkstreams.length})</span>
            <span className="flex-1 border-t border-[#0a1628]/10" />
            <span aria-hidden="true">{showCompleted ? "−" : "+"}</span>
          </button>

          {showCompleted && (
            <ul className="mt-2 flex flex-col gap-1">
              {archivedWorkstreams.map((w) => (
                <li
                  key={w.id}
                  className="group/done flex items-center gap-3 rounded-lg bg-white/25 px-4 py-2 text-sm text-[#0a1628]/80 line-through transition hover:bg-white/45"
                >
                  <Check size={14} className="shrink-0 text-emerald-600/70" />
                  <span className="flex-1 truncate">{w.title}</span>
                  <button
                    type="button"
                    aria-label="Restore to active"
                    onClick={() => onRestore(w.id)}
                    className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] uppercase tracking-wider text-emerald-700/70 opacity-0 transition hover:bg-emerald-50 hover:text-emerald-700 group-hover/done:opacity-100"
                  >
                    <RotateCcw size={11} />
                    restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Sortable chip ──────────────────────────────────────────────

interface SortableWorkstreamChipProps {
  workstream: EquilibriumWorkstream;
  index: number;
  isActive: boolean;
  loading: boolean;
  onSelect: () => void;
  onRename: (title: string) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

const SortableWorkstreamChip = ({
  workstream,
  index,
  isActive,
  loading,
  onSelect,
  onRename,
  onDelete,
}: SortableWorkstreamChipProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: workstream.id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "group relative flex items-center gap-2 rounded-xl border-2 transition",
        isActive
          ? "border-emerald-400/60 bg-white/85 shadow-[0_0_20px_rgba(74,222,128,0.18)]"
          : "border-white/40 bg-white/55 hover:border-white/70 hover:bg-white/75",
        isDragging && "z-10 opacity-90 shadow-lg",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex-shrink-0 select-none pl-3 font-serif text-base",
          isActive ? "text-[#0a1628] font-semibold" : "text-[#0a1628]/90",
        )}
      >
        {index + 1}.
      </button>

      <div className="flex-1 min-w-0" onClick={onSelect} role="button" tabIndex={-1}>
        <InlineEditableText
          value={workstream.title}
          size="body"
          disabled={loading}
          emptyPlaceholder="—"
          onSave={(text) => onRename(text ?? "Untitled")}
        />
      </div>

      {/* Active indicator — visible breadcrumb to the SMART Goals section below. */}
      {isActive && (
        <button
          type="button"
          onClick={onSelect}
          aria-label="Jump to tasks"
          className="eq-text-halo flex items-center gap-1 rounded-full bg-emerald-50/80 px-2 py-1 text-[10px] uppercase tracking-wider text-emerald-700"
        >
          <ArrowDown size={12} />
          tasks
        </button>
      )}

      <button
        type="button"
        aria-label="Complete workstream"
        title="Mark complete (preserved in completed pile)"
        onClick={onDelete}
        className="rounded p-2 text-[#0a1628]/40 opacity-0 transition hover:text-emerald-600 group-hover:opacity-100"
      >
        <Check size={14} />
      </button>

      {/* Drag handle on the RIGHT to match SmartGoalsSection (Sasha 2026-05-16). */}
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

// ─── Add row ────────────────────────────────────────────────────

const AddWorkstreamRow = ({
  onAdd,
  disabled,
}: {
  onAdd: (title: string) => Promise<void> | void;
  disabled: boolean;
}) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = async () => {
    const text = draft.trim();
    if (text) await onAdd(text);
    setDraft("");
    setAdding(false);
  };

  if (!adding) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setAdding(true)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#0a1628]/15 bg-white/30 py-2.5 text-sm text-[#0a1628]/90 transition hover:bg-white/50"
      >
        <Plus size={14} />
        add workstream
      </button>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#0a1628]/20 bg-white/70 px-3 py-2">
      <Plus size={14} className="shrink-0 text-[#0a1628]/85" />
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void commit();
          } else if (e.key === "Escape") {
            setDraft("");
            setAdding(false);
          }
        }}
        onBlur={() => void commit()}
        placeholder="workstream name"
        className="flex-1 bg-transparent text-base text-[#0a1628] outline-none placeholder:text-[#0a1628]/95"
      />
    </div>
  );
};

export default WorkstreamsSection;

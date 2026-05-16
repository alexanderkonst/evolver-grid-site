import { useState } from "react";
import { Plus, GripVertical, Trash2 } from "lucide-react";
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
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onAdd: (title: string) => Promise<void> | void;
  onRename: (id: string, title: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onReorder: (orderedIds: string[]) => Promise<void> | void;
}

/**
 * Box 9 — Workstreams.
 *
 * Drag-reorderable chips. Click to set active (drives Box 10's task list).
 * Inline-editable titles. Cap at 7 with the verbatim mega-prompt warning copy.
 */
export const WorkstreamsSection = ({
  workstreams,
  activeId,
  loading,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onReorder,
}: WorkstreamsSectionProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = workstreams.findIndex((w) => w.id === active.id);
    const newIndex = workstreams.findIndex((w) => w.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(workstreams, oldIndex, newIndex);
    void onReorder(reordered.map((w) => w.id));
  };

  const atCap = workstreams.length >= MAX_WORKSTREAMS;

  return (
    <div className="mt-2">
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
                onSelect={() => onSelect(w.id)}
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
        "group relative flex items-center gap-2 rounded-xl border bg-white/60 backdrop-blur-sm transition",
        isActive
          ? "border-[#0a1628]/30 shadow-md"
          : "border-white/40 hover:bg-white/75",
        isDragging && "z-10 opacity-90 shadow-lg",
      )}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab touch-none p-2 text-[#0a1628]/95 hover:text-[#0a1628]/90 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex-shrink-0 select-none font-serif text-base text-[#0a1628]/90"
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

      <button
        type="button"
        aria-label="Archive workstream"
        onClick={onDelete}
        className="rounded p-2 text-[#0a1628]/95 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
      >
        <Trash2 size={14} />
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

import { useEffect, useRef, useState } from "react";
import { Plus, GripVertical, Check, ArrowDown, RotateCcw, Pencil, X } from "lucide-react";
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
// InlineEditableText retired here 2026-05-20 — chip now has its own
// inline editor (textarea + Check/X) so the activation surface (the
// whole row) doesn't collide with the title button.

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

      {/*
        Completed-pile section header + list. Sasha 2026-05-19: prior
        treatment was too faint to read against the glass backdrop —
        text /60, count /40, item bg white/25, item text /80. Bumped
        all of these so the section reads cleanly as "your archive".
        Restore affordance is now ALWAYS visible (subtle, low-contrast)
        instead of hover-only — the icon button still has the same
        click target, just no longer hidden behind hover state.
      */}
      {archivedWorkstreams.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="flex w-full items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-[#0a1628]/85 transition hover:text-[#0a1628]"
          >
            <span>completed</span>
            <span className="text-[#0a1628]/70">({archivedWorkstreams.length})</span>
            <span className="flex-1 border-t border-[#0a1628]/25" />
            <span aria-hidden="true" className="text-[#0a1628]/70">
              {showCompleted ? "−" : "+"}
            </span>
          </button>

          {showCompleted && (
            <ul className="mt-2 flex flex-col gap-1">
              {archivedWorkstreams.map((w) => (
                <li
                  key={w.id}
                  className="group/done flex items-center gap-3 rounded-lg bg-white/55 px-4 py-2 text-sm text-[#0a1628]/95 transition hover:bg-white/75"
                >
                  <Check size={14} className="shrink-0 text-emerald-600" />
                  <span className="flex-1 truncate line-through decoration-[#0a1628]/45">
                    {w.title}
                  </span>
                  <button
                    type="button"
                    aria-label="Restore to active"
                    onClick={() => onRestore(w.id)}
                    className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                    title="Restore to active"
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

/**
 * Workstream chip — activation + editing UX (Sasha 2026-05-20).
 *
 * Two intents, two distinct affordances, zero collision:
 *
 *   • ACTIVATION (set as current, scroll to its tasks)
 *     → The ENTIRE chip body is the click surface. Click anywhere on
 *       the row that isn't an explicit child control → activate.
 *       That's intuitive — the user reads "this row is a thing I
 *       can pick" and clicking it picks it.
 *
 *   • EDITING (rename the title)
 *     → Dedicated, always-visible pencil icon next to the title.
 *       Click the pencil → switch the row into edit mode (textarea +
 *       save/cancel). Editing is in-place, the row stops being
 *       clickable-to-activate while editing.
 *
 * Child controls (pencil, complete check, drag handle, TASKS pill)
 * each stop propagation so they don't trigger the row's onClick.
 *
 * Previous design used InlineEditableText, which was its own button
 * that absorbed clicks and prevented "click whole row" activation.
 * Replaced inline with a small textarea + check/cancel buttons.
 */
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

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(workstream.title);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep draft in sync if the title changes upstream (e.g., after save).
  useEffect(() => {
    if (!editing) setDraft(workstream.title);
  }, [workstream.title, editing]);

  // Focus + select-all when entering edit mode.
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setEditing(true);
  };

  const commitEdit = async () => {
    if (saving) return;
    const trimmed = draft.trim();
    const next = trimmed === "" ? "Untitled" : trimmed;
    if (next === workstream.title) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onRename(next);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const cancelEdit = () => {
    setDraft(workstream.title);
    setEditing(false);
  };

  // Row click → activate (only when NOT editing). Children with their
  // own onClick stopPropagation so they don't double-fire.
  const handleRowClick = () => {
    if (editing || loading) return;
    onSelect();
  };

  // Helper: any click on an inner button stops propagation. Use this
  // on every interactive child so it doesn't trigger the row activator.
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      onClick={handleRowClick}
      role={editing ? undefined : "button"}
      tabIndex={editing ? -1 : 0}
      aria-label={
        editing
          ? `Editing workstream ${index + 1}`
          : isActive
            ? `Workstream ${index + 1} (active) — click to scroll to its tasks`
            : `Activate workstream ${index + 1}: ${workstream.title}`
      }
      onKeyDown={(e) => {
        // Keyboard activation parity with the row click.
        if (editing) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group relative flex items-center gap-2 rounded-xl border-2 transition",
        editing
          ? "border-[#0a1628]/30 bg-white cursor-text"
          : isActive
            ? "border-emerald-400/60 bg-white/85 shadow-[0_0_20px_rgba(74,222,128,0.18)] cursor-pointer"
            : "border-white/40 bg-white/65 hover:border-emerald-300/60 hover:bg-white/85 cursor-pointer",
        isDragging && "z-10 opacity-90 shadow-lg",
      )}
    >
      {/* Chip number — visual only, the WHOLE row activates so we
          don't need an explicit number-button. Stays as a span. */}
      <span
        className={cn(
          "flex-shrink-0 select-none pl-4 pr-1 py-2 font-serif text-base",
          isActive ? "text-[#0a1628] font-semibold" : "text-[#0a1628]/90",
        )}
      >
        {index + 1}.
      </span>

      {/* Title — plain text in display mode, textarea in edit mode. */}
      {editing ? (
        <div className="flex-1 min-w-0 flex items-start gap-2 py-1.5 pr-1">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onClick={stop}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void commitEdit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            rows={1}
            disabled={saving}
            className="flex-1 resize-none rounded-md border border-[#0a1628]/15 bg-white/95 px-3 py-1.5 text-base font-medium text-[#0a1628] outline-none focus:border-[#0a1628]/40"
          />
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              void commitEdit();
            }}
            disabled={saving}
            aria-label="Save"
            className="rounded-md p-1.5 text-emerald-700 hover:bg-emerald-50"
            title="Save"
          >
            <Check size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              cancelEdit();
            }}
            disabled={saving}
            aria-label="Cancel"
            className="rounded-md p-1.5 text-[#0a1628]/70 hover:bg-[#0a1628]/5"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex-1 min-w-0 flex items-center gap-2 py-2">
          <span className="flex-1 truncate font-medium text-[#0a1628]">
            {workstream.title}
          </span>
          {/* Pencil — dedicated edit affordance. Always discoverable on
              the active row + visible on hover for inactive rows so it
              doesn't clutter the resting list. */}
          <button
            type="button"
            onClick={startEdit}
            disabled={loading}
            aria-label={`Rename workstream ${index + 1}`}
            title="Rename"
            className={cn(
              "shrink-0 rounded p-1.5 text-[#0a1628]/55 transition hover:bg-[#0a1628]/5 hover:text-[#0a1628]",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
            )}
          >
            <Pencil size={13} />
          </button>
        </div>
      )}

      {/* "↓ TASKS" pill — visible breadcrumb to Intuitive Tasks below.
          Only renders when this workstream is active. Click also fires
          onSelect (which scrolls). Sasha 2026-05-20: kept as an
          explicit affordance even though the whole row already
          activates — confirms the active state and gives an obvious
          "go to my tasks" target on the right side. */}
      {!editing && isActive && (
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            onSelect();
          }}
          aria-label="Jump to tasks"
          className="flex items-center gap-1 rounded-full bg-emerald-50/85 px-2 py-1 text-[10px] uppercase tracking-wider text-emerald-700 hover:bg-emerald-100"
        >
          <ArrowDown size={12} />
          tasks
        </button>
      )}

      {!editing && (
        <button
          type="button"
          aria-label="Complete workstream"
          title="Mark complete (preserved in completed pile)"
          onClick={(e) => {
            stop(e);
            void onDelete();
          }}
          className="rounded p-2 text-[#0a1628]/40 opacity-0 transition hover:text-emerald-600 group-hover:opacity-100"
        >
          <Check size={14} />
        </button>
      )}

      {/* Drag handle on the RIGHT. Hidden during edit (no reorder
          while typing — avoids accidental drags grabbing focus). */}
      {!editing && (
        <button
          type="button"
          aria-label="Drag to reorder"
          onClick={stop}
          className="cursor-grab touch-none p-2 mr-1 text-[#0a1628]/40 hover:text-[#0a1628]/80 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      )}
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

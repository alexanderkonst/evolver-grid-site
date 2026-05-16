import { useState } from "react";
import { Plus, GripVertical, Trash2, Check } from "lucide-react";
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
import type { EquilibriumTask } from "../types";
import { MAX_TASKS } from "../hooks/useEquilibriumV2";
import { InlineEditableText } from "./InlineEditableText";

interface SmartGoalsSectionProps {
  workstreamTitle: string | null;
  tasks: EquilibriumTask[]; // active + done (caller has already sorted + capped done)
  focusedTaskIds: string[];
  loading: boolean;
  onAddTask: (text: string) => Promise<void> | void;
  onRenameTask: (id: string, text: string) => Promise<void> | void;
  onDeleteTask: (id: string) => Promise<void> | void;
  onReorderTasks: (orderedIds: string[]) => Promise<void> | void;
  onPromoteToDoNow: (id: string) => Promise<void> | void;
  onCompleteTask: (id: string) => Promise<void> | void;
}

/**
 * Box 10 — Intuitive S.M.A.R.T. Goals (tasks under active workstream).
 *
 * Drag-reorderable active tasks. Inline-editable text. DO NOW button promotes
 * to Box 11. Checkbox marks complete via eq_complete_task RPC; done tasks
 * appear underneath separated by a divider (max 7 shown).
 *
 * Cap at 7 active tasks with verbatim cap copy (mirroring workstream wording
 * — "tasks" substituted per Sasha's approval).
 */
export const SmartGoalsSection = ({
  workstreamTitle,
  tasks,
  focusedTaskIds,
  loading,
  onAddTask,
  onRenameTask,
  onDeleteTask,
  onReorderTasks,
  onPromoteToDoNow,
  onCompleteTask,
}: SmartGoalsSectionProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const active = tasks.filter((t) => t.status === "active");
  const done = tasks.filter((t) => t.status === "done");
  const atCap = active.length >= MAX_TASKS;

  if (!workstreamTitle) {
    return (
      <p className="mt-3 rounded-md border border-dashed border-[#0a1628]/10 px-4 py-6 text-center text-sm text-[#0a1628]/85">
        {/* Empty-state copy: TBD — Sasha to supply */}
        Open a workstream above to see its tasks.
      </p>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active: a, over } = event;
    if (!over || a.id === over.id) return;
    const oldIndex = active.findIndex((t) => t.id === a.id);
    const newIndex = active.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(active, oldIndex, newIndex);
    void onReorderTasks(reordered.map((t) => t.id));
  };

  return (
    <div className="mt-2">
      <p className="mb-2 px-1 text-xs uppercase tracking-wider text-[#0a1628]/85">
        {workstreamTitle}
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={active.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-2">
            {active.map((t) => (
              <SortableTaskBar
                key={t.id}
                task={t}
                inFocus={focusedTaskIds.includes(t.id)}
                loading={loading}
                onRename={(text) => onRenameTask(t.id, text)}
                onDelete={() => onDeleteTask(t.id)}
                onPromote={() => onPromoteToDoNow(t.id)}
                onComplete={() => onCompleteTask(t.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {atCap ? (
        <p className="mt-3 px-2 text-xs italic text-[#0a1628]/90">
          group your tasks to avoid very high context switching costs
        </p>
      ) : (
        <AddTaskRow onAdd={onAddTask} disabled={loading} />
      )}

      {done.length > 0 && (
        <>
          <div className="mt-4 mb-2 flex items-center gap-2 px-2 text-xs uppercase tracking-wider text-[#0a1628]/95">
            <span>completed</span>
            <span className="flex-1 border-t border-[#0a1628]/10" />
          </div>
          <ul className="flex flex-col gap-1">
            {done.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-lg bg-white/30 px-4 py-2.5 text-[#0a1628]/85 line-through"
              >
                <Check size={14} className="text-emerald-500/70" />
                <span className="flex-1">{t.text}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

// ─── Sortable task bar ──────────────────────────────────────────

interface SortableTaskBarProps {
  task: EquilibriumTask;
  inFocus: boolean;
  loading: boolean;
  onRename: (text: string) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
  onPromote: () => Promise<void> | void;
  onComplete: () => Promise<void> | void;
}

const SortableTaskBar = ({
  task,
  inFocus,
  loading,
  onRename,
  onDelete,
  onPromote,
  onComplete,
}: SortableTaskBarProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "group flex items-center gap-2 rounded-xl border bg-white/65 backdrop-blur-sm transition",
        inFocus ? "border-emerald-300/60" : "border-white/40",
        isDragging && "z-10 opacity-90 shadow-lg",
      )}
    >
      <button
        type="button"
        aria-label="Complete task"
        onClick={onComplete}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0a1628]/20 bg-white/80 ml-2 transition hover:border-emerald-400 hover:bg-emerald-50"
      >
        <Check
          size={14}
          className="text-[#0a1628]/0 transition group-hover:text-[#0a1628]/85"
        />
      </button>

      <div className="flex-1 min-w-0">
        <InlineEditableText
          value={task.text}
          size="body"
          disabled={loading}
          emptyPlaceholder="—"
          onSave={(text) => onRename(text ?? "Untitled task")}
        />
      </div>

      <button
        type="button"
        aria-label="DO NOW"
        onClick={onPromote}
        disabled={inFocus}
        className={cn(
          "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition",
          inFocus
            ? "bg-emerald-100 text-emerald-700/70 cursor-default"
            : "bg-[#0a1628] text-white hover:bg-[#0a1628]/85",
        )}
      >
        {inFocus ? "in focus" : "do now"}
      </button>

      <button
        type="button"
        aria-label="Delete task"
        onClick={onDelete}
        className="rounded p-2 text-[#0a1628]/95 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>

      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab touch-none p-2 mr-1 text-[#0a1628]/95 hover:text-[#0a1628]/90 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
    </li>
  );
};

// ─── Add task row ───────────────────────────────────────────────

const AddTaskRow = ({
  onAdd,
  disabled,
}: {
  onAdd: (text: string) => Promise<void> | void;
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
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#0a1628]/15 bg-white/20 py-2.5 text-sm text-[#0a1628]/85 transition hover:bg-white/50"
      >
        <Plus size={14} />
        add task
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
        placeholder="task description"
        className="flex-1 bg-transparent text-base text-[#0a1628] outline-none placeholder:text-[#0a1628]/95"
      />
    </div>
  );
};

export default SmartGoalsSection;

import { Check, GripVertical, X } from "lucide-react";
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

interface DoNowSectionProps {
  focusedTaskIds: string[];
  /** Lookup: taskId → task (caller provides). */
  taskById: Record<string, EquilibriumTask | undefined>;
  loading: boolean;
  onCompleteTask: (id: string) => Promise<void> | void;
  /**
   * Demote a task OUT of DOING NOW without completing it (Sasha
   * 2026-05-19). Renders an X icon next to each focused task.
   */
  onDemoteFromDoNow: (id: string) => Promise<void> | void;
  /**
   * Reorder focused tasks via drag (Sasha 2026-05-27). Receives the
   * new ordering — first id becomes position 1 (the lead focus).
   */
  onReorder: (orderedTaskIds: string[]) => Promise<void> | void;
}

/**
 * Box 11 — DOING NOW (renamed 2026-05-19 from "DO NOW").
 *
 * Active focus slots (≤3 — recommended 1). Three exits from focus:
 *   • Checkbox       → completeTask() (cascades to done pile)
 *   • X icon         → demoteFromDoNow() (keeps task active, just drops focus)
 *   • Drag handle    → reorder within DOING NOW (Sasha 2026-05-27)
 *
 * The "gentle warning at 4th" rule is enforced by the hook's
 * promoteToDoNow (replaces oldest). Visible note when ≥2 active.
 */
export const DoNowSection = ({
  focusedTaskIds,
  taskById,
  loading,
  onCompleteTask,
  onDemoteFromDoNow,
  onReorder,
}: DoNowSectionProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (focusedTaskIds.length === 0) {
    return (
      <p className="mt-3 rounded-md border border-dashed border-[#0a1628]/10 px-4 py-6 text-center text-sm text-[#0a1628]/85">
        Promote a task from your goals — what's the one thing now?
      </p>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = focusedTaskIds.indexOf(String(active.id));
    const newIdx = focusedTaskIds.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(focusedTaskIds, oldIdx, newIdx);
    void onReorder(next);
  };

  return (
    <div className="mt-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={focusedTaskIds} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {focusedTaskIds.map((id, idx) => {
              const task = taskById[id];
              if (!task) return null;
              return (
                <SortableDoNowRow
                  key={id}
                  id={id}
                  task={task}
                  isPrimary={idx === 0}
                  loading={loading}
                  onComplete={() => onCompleteTask(id)}
                  onDemote={() => onDemoteFromDoNow(id)}
                />
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>

      {focusedTaskIds.length >= 2 && (
        <p className="mt-3 px-2 text-xs italic text-[#0a1628]/90">
          For optimal results, we recommend to have only ONE task in this section
          most of the time.
        </p>
      )}
    </div>
  );
};

// ─── Sortable row ────────────────────────────────────────────────

interface SortableDoNowRowProps {
  id: string;
  task: EquilibriumTask;
  /** Position 1 — the lead focus. Renders with emerald glow. */
  isPrimary: boolean;
  loading: boolean;
  onComplete: () => Promise<void> | void;
  onDemote: () => Promise<void> | void;
}

const SortableDoNowRow = ({
  id,
  task,
  isPrimary,
  loading,
  onComplete,
  onDemote,
}: SortableDoNowRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "group/doing flex items-center gap-3 rounded-xl border bg-white/80 px-3 py-3",
        // Scope transition to border + background only — keep
        // dnd-kit's transform updates uninterpolated (same fix as
        // SortableTaskBar / WorkstreamsSection).
        "transition-[border-color,background-color,box-shadow] duration-150",
        isPrimary
          ? "border-emerald-300/70 shadow-[0_0_24px_rgba(74,222,128,0.18)]"
          : "border-white/60",
        isDragging && "z-10 opacity-90 shadow-lg",
      )}
    >
      {/* Square checkbox. opacity-0 hides the Check until hover so
          tasks don't read as pre-completed (NS-skin color-inherit
          fix from 2026-05-20). */}
      <button
        type="button"
        aria-label="Complete task"
        onClick={() => onComplete()}
        disabled={loading}
        className="group/check flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-[#0a1628]/40 bg-white transition hover:border-emerald-500 hover:bg-emerald-50"
        title="Complete this task"
      >
        <Check
          size={16}
          className="text-emerald-600 opacity-0 transition group-hover/check:opacity-100"
        />
      </button>

      <span className="flex-1 font-serif text-lg text-[#0a1628]">
        {task.text}
      </span>

      {/* Demote affordance — pulls the task out of focus without
          completing it. Hover-revealed on desktop, partially visible
          on touch. */}
      <button
        type="button"
        aria-label="Remove from DOING NOW (keep task active)"
        onClick={() => onDemote()}
        disabled={loading}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#0a1628]/45 transition opacity-0 group-hover/doing:opacity-100 focus:opacity-100 hover:bg-[#0a1628]/5 hover:text-[#0a1628]/80 sm:opacity-0 max-sm:opacity-60"
        title="Remove from DOING NOW (keep task active)"
      >
        <X size={14} />
      </button>

      {/* Drag handle (Sasha 2026-05-27) — same pattern as the
          workstream/task drag handles. Always visible since the
          whole point of DOING NOW reorder is intentional priority
          choice — affordance shouldn't hide. */}
      <button
        type="button"
        aria-label="Drag to reorder"
        title="Drag to reorder priority"
        className="cursor-grab touch-none p-2 text-[#0a1628]/40 hover:text-[#0a1628]/80 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
    </li>
  );
};

export default DoNowSection;

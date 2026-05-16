import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EquilibriumTask } from "../types";

interface DoNowSectionProps {
  focusedTaskIds: string[];
  /** Lookup: taskId → task (caller provides). */
  taskById: Record<string, EquilibriumTask | undefined>;
  loading: boolean;
  onCompleteTask: (id: string) => Promise<void> | void;
}

/**
 * Box 11 — DO NOW.
 *
 * Active focus slots (≤3 — recommended 1). Visible warning when ≥3 used.
 * Checkbox click → completeTask() which marks done + removes from focus +
 * cascades to Box 10's done-pile via the eq_complete_task RPC.
 *
 * The "gentle warning at 4th" rule is enforced by the hook's promoteToDoNow
 * (replaces oldest). Visible note when ≥2 active appears here.
 */
export const DoNowSection = ({
  focusedTaskIds,
  taskById,
  loading,
  onCompleteTask,
}: DoNowSectionProps) => {
  if (focusedTaskIds.length === 0) {
    return (
      <p className="mt-3 rounded-md border border-dashed border-[#0a1628]/10 px-4 py-6 text-center text-sm text-[#0a1628]/85">
        {/* Empty-state copy: TBD — Sasha to supply */}
        Promote a task from your goals — what's the one thing now?
      </p>
    );
  }

  return (
    <div className="mt-2">
      <ul className="flex flex-col gap-2">
        {focusedTaskIds.map((id, idx) => {
          const task = taskById[id];
          if (!task) return null;
          return (
            <li
              key={id}
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-white/80 px-3 py-3 transition",
                idx === 0
                  ? "border-emerald-300/70 shadow-[0_0_24px_rgba(74,222,128,0.18)]"
                  : "border-white/60",
              )}
            >
              <button
                type="button"
                aria-label="Complete task"
                onClick={() => onCompleteTask(id)}
                disabled={loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0a1628]/30 bg-white transition hover:border-emerald-500 hover:bg-emerald-50"
              >
                <Check
                  size={16}
                  className="text-[#0a1628]/0 transition hover:text-emerald-600"
                />
              </button>
              <span className="flex-1 font-serif text-lg text-[#0a1628]">
                {task.text}
              </span>
            </li>
          );
        })}
      </ul>

      {focusedTaskIds.length >= 2 && (
        <p className="mt-3 px-2 text-xs italic text-[#0a1628]/90">
          For optimal results, we recommend to have only ONE task in this section
          most of the time.
        </p>
      )}
    </div>
  );
};

export default DoNowSection;

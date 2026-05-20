import { Check, X } from "lucide-react";
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
}

/**
 * Box 11 — DOING NOW (renamed 2026-05-19 from "DO NOW").
 *
 * Active focus slots (≤3 — recommended 1). Two exits from focus:
 *   • Checkbox → completeTask() (cascades to done pile)
 *   • X icon   → demoteFromDoNow() (keeps task active, just drops focus)
 *
 * The "gentle warning at 4th" rule is enforced by the hook's promoteToDoNow
 * (replaces oldest). Visible note when ≥2 active appears here.
 */
export const DoNowSection = ({
  focusedTaskIds,
  taskById,
  loading,
  onCompleteTask,
  onDemoteFromDoNow,
}: DoNowSectionProps) => {
  if (focusedTaskIds.length === 0) {
    return (
      <p className="mt-3 rounded-md border border-dashed border-[#0a1628]/10 px-4 py-6 text-center text-sm text-[#0a1628]/85">
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
                "group/doing flex items-center gap-3 rounded-xl border bg-white/80 px-3 py-3 transition",
                idx === 0
                  ? "border-emerald-300/70 shadow-[0_0_24px_rgba(74,222,128,0.18)]"
                  : "border-white/60",
              )}
            >
              {/*
                Square checkbox (Sasha 2026-05-19): "not round but
                square, because that's how I want it to look like a
                checkbox so that the person does not confuse it with
                anything else." `rounded-md` keeps a subtle 6px corner
                rounding — clearly a square, not a hard-edged box.
              */}
              <button
                type="button"
                aria-label="Complete task"
                onClick={() => onCompleteTask(id)}
                disabled={loading}
                className="group/check flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-[#0a1628]/40 bg-white transition hover:border-emerald-500 hover:bg-emerald-50"
                title="Complete this task"
              >
                {/*
                  Hide the Check via `opacity-0` (skin-invariant), not
                  `text-color/0` — on the NS skin, color tokens inherit
                  upstream and the icon was visible by default, making
                  every task look pre-checked. Sasha 2026-05-20.
                */}
                <Check
                  size={16}
                  className="text-emerald-600 opacity-0 transition group-hover/check:opacity-100"
                />
              </button>
              <span className="flex-1 font-serif text-lg text-[#0a1628]">
                {task.text}
              </span>
              {/* Demote affordance (Sasha 2026-05-19) — pulls the task
                  out of focus without marking it complete. Hidden until
                  the row is hovered/focused so it doesn't clutter the
                  primary action; always visible on touch (no hover
                  state). */}
              <button
                type="button"
                aria-label="Remove from DOING NOW (keep task active)"
                onClick={() => onDemoteFromDoNow(id)}
                disabled={loading}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#0a1628]/45 transition opacity-0 group-hover/doing:opacity-100 focus:opacity-100 hover:bg-[#0a1628]/5 hover:text-[#0a1628]/80 sm:opacity-0 max-sm:opacity-60"
                title="Remove from DOING NOW (keep task active)"
              >
                <X size={14} />
              </button>
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

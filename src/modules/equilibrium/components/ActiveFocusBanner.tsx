import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EquilibriumTask } from "../types";
import { SECTION_IDS } from "../types";

interface ActiveFocusBannerProps {
  focusedTaskIds: string[];
  taskById: Record<string, EquilibriumTask | undefined>;
  loading: boolean;
  onCompleteTask: (id: string) => Promise<void> | void;
}

/**
 * ActiveFocusBanner — slim mirror of the DO NOW section, pinned at the
 * TOP of ACT mode. Sasha 2026-05-18: "Do now is the last section. But
 * maybe do now when there is something actively in the do now — there
 * are one, two, or three tasks in the do now, they can get replicated
 * on top so that that's the first thing the user sees."
 *
 * Only renders when `focusedTaskIds.length > 0`. The full DO NOW
 * section at the bottom keeps all the controls; this banner is the
 * glance-surface — what the user sees on landing without scrolling.
 *
 * Behavior:
 *   • Compact glass pill (not a full section card — visually slimmer)
 *   • Each focused task: checkbox + text. Checkbox completes the task
 *     (same handler as DO NOW; cascades to Intuitive Tasks done pile).
 *   • Header label "DO NOW" + a "jump to" affordance scrolling to the
 *     full DO NOW section at the bottom (in case the user wants
 *     promote/demote controls).
 *   • If 0 focused tasks, the banner doesn't render at all (parent
 *     guards). Empty state lives only inside the full DO NOW section.
 */
export const ActiveFocusBanner = ({
  focusedTaskIds,
  taskById,
  loading,
  onCompleteTask,
}: ActiveFocusBannerProps) => {
  if (focusedTaskIds.length === 0) return null;

  const tasks = focusedTaskIds
    .map((id) => taskById[id])
    .filter((t): t is EquilibriumTask => !!t);

  if (tasks.length === 0) return null;

  const jumpToDoNow = () => {
    const el = document.getElementById(SECTION_IDS.doNow);
    if (!el) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section
      aria-labelledby="active-focus-banner-heading"
      className={cn(
        "liquid-glass-strong rounded-3xl px-5 py-4 scroll-mt-24",
        // Emerald glow ring — visual anchor; subtle enough to not
        // dominate the page but distinct enough to read as "this is
        // the now."
        "ring-1 ring-emerald-300/40",
        "shadow-[0_0_28px_rgba(74,222,128,0.14)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="active-focus-banner-heading"
          className="eq-text-halo flex items-center gap-2 font-serif text-base font-semibold text-[#0a1628] sm:text-lg"
        >
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
          />
          DO NOW
        </h2>
        <button
          type="button"
          onClick={jumpToDoNow}
          className="text-[10px] font-semibold uppercase tracking-wider text-[#0a1628]/55 transition hover:text-[#0a1628]"
          title="Jump to DO NOW section for promote / demote / complete controls"
        >
          edit ↓
        </button>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 rounded-xl border border-emerald-200/50 bg-white/75 px-3 py-2.5 backdrop-blur-sm transition hover:bg-white/90"
          >
            <button
              type="button"
              aria-label={`Complete: ${task.text}`}
              onClick={() => onCompleteTask(task.id)}
              disabled={loading}
              className="group/check flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0a1628]/30 bg-white transition hover:border-emerald-500 hover:bg-emerald-50"
            >
              <Check
                size={14}
                className="text-[#0a1628]/0 transition group-hover/check:text-emerald-600"
              />
            </button>
            <span className="flex-1 font-serif text-base text-[#0a1628]">
              {task.text}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ActiveFocusBanner;

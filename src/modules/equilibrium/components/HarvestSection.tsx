import { memo, useMemo } from "react";
import { Check, RotateCcw, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EquilibriumTask, EquilibriumWorkstream } from "../types";

interface HarvestSectionProps {
  /** All completed tasks across every workstream, newest first. */
  completedTasks: EquilibriumTask[];
  /** Active workstreams (for name attribution on each completed task). */
  workstreams: EquilibriumWorkstream[];
  /** Archived workstreams — completed tasks may belong to these. */
  archivedWorkstreams: EquilibriumWorkstream[];
  loading: boolean;
  /** Restore a completed task back to active (clears done_at). */
  onUncompleteTask: (id: string) => Promise<void> | void;
}

/**
 * Harvest — running celebration feed of completed tasks across ALL
 * workstreams (Sasha 2026-05-20).
 *
 * Why a dedicated section: previously, completions were siloed under
 * each workstream's done-pile (capped at 7 visible, with NO way to
 * see across streams). Sasha: "I would love to celebrate myself for
 * accomplishing the tasks and seeing that they were actually aligned
 * and the exact right one to deliver on to move the needle."
 *
 * Naming "Harvest" ties directly to the lunar Harvesting phase in
 * the spine (Full Moon = "reap what's ripe · receive the fruits of
 * labor"). It's not a "completed" list — it's what you've REAPED.
 *
 * What each entry shows:
 *   • ✓ Task title (full text, readable but de-emphasized via the
 *     line-through decoration only at /35 so the text stays bright)
 *   • Workstream pill — small chip in emerald with the stream name
 *   • Focus duration — time from do_now_at → done_at when promoted;
 *     fallback created_at → done_at when never promoted. Pretty-
 *     printed: "12 min" / "3h" / "2 days" / "1 week"
 *   • Relative timestamp — "just now" / "23 min ago" / "yesterday" /
 *     "May 18" — anchored to done_at
 *   • Hover-revealed Restore button (RotateCcw) — undoes the
 *     completion if it was a mistake. Same handler as the per-
 *     workstream done-pile.
 *
 * Layout: grouped by day, each group has a small eyebrow with the
 * date + tally ("Wednesday May 20 — 3 reaped"). Top of section, a
 * small celebration line tells you what you've done today (or
 * encourages you when there's nothing yet today). When the list is
 * entirely empty: a quiet placeholder, not motivational pressure.
 */
const HarvestSectionBase = ({
  completedTasks,
  workstreams,
  archivedWorkstreams,
  loading,
  onUncompleteTask,
}: HarvestSectionProps) => {
  // Workstream-id → title lookup. Includes archived workstreams so a
  // task whose workstream got deleted... wait, FK cascade deletes
  // tasks too, so this list only includes tasks whose workstream
  // still exists. But archived workstreams (soft-archived in the
  // legacy data) are still present in the DB — include them so their
  // tasks (if any survived) still attribute correctly.
  const workstreamTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const w of workstreams) map[w.id] = w.title;
    for (const w of archivedWorkstreams) map[w.id] = w.title;
    return map;
  }, [workstreams, archivedWorkstreams]);

  // Group completed tasks by day (local time of done_at). Order:
  // most-recent day first, tasks within a day already sorted newest
  // first by the parent hook.
  const grouped = useMemo(() => {
    const buckets = new Map<string, EquilibriumTask[]>();
    for (const t of completedTasks) {
      if (!t.done_at) continue;
      const dayKey = formatDayKey(new Date(t.done_at));
      if (!buckets.has(dayKey)) buckets.set(dayKey, []);
      buckets.get(dayKey)!.push(t);
    }
    // Map preserves insertion order, which is already newest-first
    // because completedTasks is pre-sorted.
    return Array.from(buckets.entries());
  }, [completedTasks]);

  const todayKey = formatDayKey(new Date());
  const todayCount = grouped.find(([k]) => k === todayKey)?.[1]?.length ?? 0;
  const totalCount = completedTasks.length;

  // Empty state — quiet, no motivational pressure. The watch is for
  // attunement, not gamification guilt.
  if (totalCount === 0) {
    return (
      <p className="mt-3 rounded-md border border-dashed border-[#0a1628]/10 px-4 py-6 text-center text-sm text-[#0a1628]/75">
        Nothing harvested yet. Complete a task and it'll show up here.
      </p>
    );
  }

  return (
    <div className="mt-2">
      {/*
        Celebration eyebrow — adapts to current activity.
        • Today has wins:   "✨ 3 tasks today — keep going."
        • Today empty, recent wins: "✨ N reaped across all time"
      */}
      <div className="mb-5 flex items-center justify-center gap-2 text-sm text-[#0a1628]/85">
        <Sparkles size={14} className="text-emerald-600" />
        <span className="font-serif italic">
          {todayCount > 0
            ? `${todayCount} ${todayCount === 1 ? "task" : "tasks"} reaped today`
            : `${totalCount} ${totalCount === 1 ? "task" : "tasks"} reaped so far`}
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {grouped.map(([dayKey, dayTasks]) => (
          <div key={dayKey}>
            {/* Day group eyebrow */}
            <div className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/85">
              <span>{formatDayLabel(dayKey)}</span>
              <span className="text-[#0a1628]/55">
                · {dayTasks.length} {dayTasks.length === 1 ? "reaped" : "reaped"}
              </span>
              <span className="flex-1 border-t border-emerald-700/15" />
            </div>

            <ul className="flex flex-col gap-1.5">
              {dayTasks.map((task) => (
                <li
                  key={task.id}
                  className="group/harvest flex items-center gap-3 rounded-xl border border-emerald-200/40 bg-white/75 px-3 py-2.5 transition hover:bg-white/95"
                >
                  {/*
                    Square check, pre-checked (the task IS done). Same
                    visual language as the active-task checkbox so the
                    user reads "this is just the checked state of the
                    thing above." Click → restore.
                  */}
                  <button
                    type="button"
                    aria-label={`Restore "${task.text}" to active`}
                    title="Restore to active"
                    disabled={loading}
                    onClick={() => onUncompleteTask(task.id)}
                    className="group/check relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-emerald-500/70 bg-emerald-50 transition hover:border-emerald-600 hover:bg-emerald-100"
                  >
                    {/* Default state: check visible (task complete).
                        Hover: swap to restore arrow so the affordance
                        is obvious without needing copy. */}
                    <Check
                      size={14}
                      className="absolute text-emerald-700 transition group-hover/check:opacity-0"
                    />
                    <RotateCcw
                      size={14}
                      className="absolute text-emerald-700 opacity-0 transition group-hover/check:opacity-100"
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-[15px] text-[#0a1628]">
                      <span className="line-through decoration-[#0a1628]/30">
                        {task.text}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#0a1628]/70">
                      {workstreamTitleById[task.workstream_id] && (
                        <span
                          className="inline-flex max-w-[200px] items-center truncate rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700"
                          title={workstreamTitleById[task.workstream_id]}
                        >
                          {workstreamTitleById[task.workstream_id]}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} className="text-[#0a1628]/55" />
                        {formatDuration(focusDurationMs(task))}
                      </span>
                      <span className="text-[#0a1628]/55">·</span>
                      <span>{formatRelativeTime(new Date(task.done_at!))}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Helpers ────────────────────────────────────────────────────

/** "2026-05-20" — local date key, stable across timezones for grouping. */
function formatDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "Today · Tuesday May 20" / "Yesterday · Monday May 19" / "Monday May 12". */
function formatDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * Time-in-focus duration. Preferred = do_now_at → done_at (time
 * actively prioritized). Fallback = created_at → done_at when the
 * task was completed without ever being promoted to DOING NOW.
 * Returns milliseconds.
 */
function focusDurationMs(task: EquilibriumTask): number {
  if (!task.done_at) return 0;
  const done = new Date(task.done_at).getTime();
  if (task.do_now_at) {
    return Math.max(0, done - new Date(task.do_now_at).getTime());
  }
  if (task.created_at) {
    return Math.max(0, done - new Date(task.created_at).getTime());
  }
  return 0;
}

/** Human-readable duration: "32s" / "12 min" / "3h" / "2 days" / "1 week". */
function formatDuration(ms: number): string {
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))}s`;
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days} ${days === 1 ? "day" : "days"}`;
  const weeks = Math.round(days / 7);
  return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
}

/** "just now" / "12 min ago" / "3h ago" / "yesterday" / "May 18". */
function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`;
  if (diff < 2 * 86_400_000) return "yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Memoize — Harvest re-renders only when its inputs change.
export const HarvestSection = memo(HarvestSectionBase);

export default HarvestSection;

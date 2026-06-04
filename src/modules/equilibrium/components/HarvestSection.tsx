import { memo, useMemo } from "react";
import { Check, RotateCcw, Clock, Sparkles, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLunarState, MOON_PHASES } from "@/lib/equilibrium-cycles";
import type {
  EquilibriumStrategyCompletion,
  EquilibriumTask,
  EquilibriumWorkstream,
} from "../types";

interface HarvestSectionProps {
  /** All completed tasks across every workstream, newest first. */
  completedTasks: EquilibriumTask[];
  /**
   * All completed strategies, newest first (Sasha 2026-05-29). Strategies
   * are unioned with tasks into a single time-ordered Harvest feed.
   */
  completedStrategies: EquilibriumStrategyCompletion[];
  /** Active workstreams (for name attribution on each completed task). */
  workstreams: EquilibriumWorkstream[];
  /** Archived workstreams — completed tasks may belong to these. */
  archivedWorkstreams: EquilibriumWorkstream[];
  loading: boolean;
  /** Restore a completed task back to active (clears done_at). */
  onUncompleteTask: (id: string) => Promise<void> | void;
}

/**
 * Unified Harvest entry — tasks and strategy completions share a
 * timeline. Discriminated by `kind` so the renderer can type-narrow
 * to each shape.
 */
type HarvestEntry =
  | { kind: "task"; task: EquilibriumTask; doneAt: string }
  | { kind: "strategy"; completion: EquilibriumStrategyCompletion; doneAt: string };

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
  completedStrategies,
  workstreams,
  archivedWorkstreams,
  loading,
  onUncompleteTask,
}: HarvestSectionProps) => {
  // Workstream-id → title lookup, used as FALLBACK only. Sasha
  // 2026-05-24: each task now carries workstream_title_snapshot,
  // populated by eq_complete_task at the moment of completion. That
  // snapshot is the canonical source for Harvest citations because
  // it survives a later hard-delete of the parent workstream (which
  // cascades and removes tasks otherwise). This lookup catches the
  // two backwards-compat cases: legacy tasks completed before the
  // snapshot column shipped, and any race where the snapshot didn't
  // populate.
  const workstreamTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const w of workstreams) map[w.id] = w.title;
    for (const w of archivedWorkstreams) map[w.id] = w.title;
    return map;
  }, [workstreams, archivedWorkstreams]);

  /**
   * Resolve a task's workstream title — snapshot wins, live-lookup
   * fallback. Returns undefined when neither source has a name (the
   * snapshot never populated AND the parent workstream is now gone).
   */
  const resolveWorkstreamTitle = (task: EquilibriumTask): string | undefined =>
    task.workstream_title_snapshot ?? workstreamTitleById[task.workstream_id];

  // Union tasks + strategy completions into a single timeline, sorted
  // newest-first by done_at, then bucket by day. Discriminated union
  // means the renderer can type-narrow safely.
  const grouped = useMemo(() => {
    const entries: HarvestEntry[] = [];
    for (const t of completedTasks) {
      if (!t.done_at) continue;
      entries.push({ kind: "task", task: t, doneAt: t.done_at });
    }
    for (const s of completedStrategies) {
      if (!s.done_at) continue;
      entries.push({ kind: "strategy", completion: s, doneAt: s.done_at });
    }
    entries.sort(
      (a, b) => new Date(b.doneAt).getTime() - new Date(a.doneAt).getTime(),
    );

    const buckets = new Map<string, HarvestEntry[]>();
    for (const e of entries) {
      const dayKey = formatDayKey(new Date(e.doneAt));
      if (!buckets.has(dayKey)) buckets.set(dayKey, []);
      buckets.get(dayKey)!.push(e);
    }
    return Array.from(buckets.entries());
  }, [completedTasks, completedStrategies]);

  const totalCount = completedTasks.length + completedStrategies.length;

  // Empty state — quiet, no motivational pressure. The watch is for
  // attunement, not gamification guilt.
  if (totalCount === 0) {
    return (
      <p className="mt-3 rounded-md border border-dashed border-[#0a1628]/10 px-4 py-6 text-center text-sm text-[#0a1628]/75">
        Nothing harvested yet. Complete a task and it'll show up here.
      </p>
    );
  }

  // Sasha 2026-05-20 UI refinement — what changed vs. the v1:
  //
  //   • Top stat is now an ALL-TIME aggregate, not a duplicate of
  //     the day eyebrow. When there's only "today" data, the day
  //     eyebrow already says "Today · 2"; an identical "2 reaped
  //     today" line above was pure redundancy. Now the top reads as
  //     a momentum-pulse ("3 reaped this week · 47 all time").
  //
  //   • Day eyebrow loses the redundant "REAPED" word — just the
  //     day name + count. Slimmer, less hectoring.
  //
  //   • Workstream attribution moves from a loud uppercase emerald
  //     PILL → inline italic citation ("from Balaji reachout"). No
  //     more ugly mid-word truncation; long names just wrap to the
  //     next line of the metadata row. Reads as a reference, not a
  //     system label.
  //
  //   • Row palette neutralized: white background + soft slate
  //     border instead of emerald-everything. The CHECK stays
  //     emerald — it's the symbol of accomplishment. Everything else
  //     gets out of its way.
  //
  //   • Task text muted to /65 + strikethrough /30. Previously the
  //     strikethrough fought full-strength dark text; now the line
  //     reads "completed" via opacity + strike together, calmer.
  //
  // Computed: tasks reaped in the trailing 7 days (window for the
  // "this week" stat). Today's count is already in the day eyebrow.
  const sevenDaysAgo = Date.now() - 7 * 86_400_000;
  const weekCount =
    completedTasks.filter(
      (t) => t.done_at && new Date(t.done_at).getTime() >= sevenDaysAgo,
    ).length +
    completedStrategies.filter(
      (s) => s.done_at && new Date(s.done_at).getTime() >= sevenDaysAgo,
    ).length;

  // Top aggregate line — context-sensitive copy. If there's history
  // beyond today, surface the wider window; otherwise stay on the
  // simpler all-time tally so it doesn't feel cargo-cult.
  const topLine = totalCount > weekCount
    ? `${weekCount} this week · ${totalCount} all time`
    : totalCount > 1
      ? `${totalCount} reaped`
      : `${totalCount} reaped — first of many`;

  return (
    <div className="mt-2">
      {/* Top aggregate — a calm pulse, not a duplicate of below. */}
      <div className="mb-6 flex items-center justify-center gap-2 text-sm italic text-[#0a1628]/75">
        <Sparkles size={14} className="text-emerald-600" />
        <span className="font-serif">{topLine}</span>
      </div>

      <div className="flex flex-col gap-5">
        {grouped.map(([dayKey, dayEntries]) => (
          <div key={dayKey}>
            <div className="mb-2 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0a1628]/65">
              <span>{formatDayLabel(dayKey)}</span>
              <span className="text-[#0a1628]/40">· {dayEntries.length}</span>
              <span className="flex-1 border-t border-[#0a1628]/10" />
            </div>

            <ul className="flex flex-col gap-1.5">
              {dayEntries.map((entry) =>
                entry.kind === "task" ? (
                  <TaskHarvestRow
                    key={`task-${entry.task.id}`}
                    task={entry.task}
                    workstreamTitle={resolveWorkstreamTitle(entry.task)}
                    loading={loading}
                    onUncompleteTask={onUncompleteTask}
                  />
                ) : (
                  <StrategyHarvestRow
                    key={`strat-${entry.completion.id}`}
                    completion={entry.completion}
                  />
                ),
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Row renderers ──────────────────────────────────────────────

interface TaskHarvestRowProps {
  task: EquilibriumTask;
  workstreamTitle: string | undefined;
  loading: boolean;
  onUncompleteTask: (id: string) => Promise<void> | void;
}

const TaskHarvestRow = ({
  task,
  workstreamTitle,
  loading,
  onUncompleteTask,
}: TaskHarvestRowProps) => {
  const phase = lunarPhaseAtDone(task.done_at);
  return (
    <li className="group/harvest flex items-start gap-3 rounded-xl border border-[#0a1628]/8 bg-white/80 px-3 py-2.5 transition hover:border-[#0a1628]/14 hover:bg-white/95">
      <button
        type="button"
        aria-label={`Restore "${task.text}" to active`}
        title="Restore to active"
        disabled={loading}
        onClick={() => onUncompleteTask(task.id)}
        className="group/check relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-emerald-500/70 bg-emerald-50 transition hover:border-emerald-600 hover:bg-emerald-100"
      >
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
        <div className="font-serif text-[15px] leading-snug text-[#0a1628]/65 line-through decoration-[#0a1628]/30">
          {task.text}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#0a1628]/55">
          {workstreamTitle && (
            <>
              <span className="italic">
                from{" "}
                <span className="font-medium not-italic text-[#0a1628]/75">
                  {workstreamTitle}
                </span>
              </span>
              <span className="text-[#0a1628]/30">·</span>
            </>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock size={10} className="text-[#0a1628]/45" />
            {formatDuration(focusDurationMs(task))}
          </span>
          <span className="text-[#0a1628]/30">·</span>
          <span>{formatRelativeTime(new Date(task.done_at!))}</span>
          {phase && (
            <>
              <span className="text-[#0a1628]/30">·</span>
              <span
                className="inline-flex items-center gap-1"
                title={`Completed during ${phase.name}`}
              >
                <span aria-hidden="true">{phase.symbol}</span>
                <span className="hidden sm:inline">{phase.shortName}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </li>
  );
};

interface StrategyHarvestRowProps {
  completion: EquilibriumStrategyCompletion;
}

/**
 * Strategy completion row — distinct visual cues from a task row so
 * the user reads "this is a strategy I completed, not a task":
 *   • Lavender accent on the check button border (vs emerald for tasks)
 *   • Compass icon as an inline glyph next to the strategy text
 *   • Citation reads "strategy" + position (not "from <workstream>")
 *   • Duration measures set_at → done_at ("in play 12 days")
 *
 * No restore handler yet — restoring a strategy requires picking an
 * open slot (positions 1/2/3), which the live strategies list may not
 * have. We can add a "restore to slot N" flow later if needed; for
 * now strategy completions are immutable celebration artifacts.
 */
const StrategyHarvestRow = ({ completion }: StrategyHarvestRowProps) => {
  const phase = lunarPhaseAtDone(completion.done_at);
  const inPlayMs =
    new Date(completion.done_at).getTime() -
    new Date(completion.set_at).getTime();
  return (
    <li className="group/harvest flex items-start gap-3 rounded-xl border border-[#0a1628]/8 bg-white/80 px-3 py-2.5 transition hover:border-[#0a1628]/14 hover:bg-white/95">
      <div
        aria-label="Completed strategy"
        title="Completed strategy"
        className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-violet-400/70 bg-violet-50"
      >
        <Check size={14} className="text-violet-700" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1.5">
          <Compass
            size={13}
            className="mt-1 shrink-0 text-violet-600/80"
            aria-hidden="true"
          />
          <div className="flex-1 font-serif text-[15px] leading-snug text-[#0a1628]/65 line-through decoration-[#0a1628]/30">
            {completion.text}
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#0a1628]/55">
          <span className="italic">
            <span className="font-medium not-italic text-violet-700/80">
              strategy
            </span>
            {completion.original_position
              ? ` #${completion.original_position}`
              : ""}
          </span>
          <span className="text-[#0a1628]/30">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={10} className="text-[#0a1628]/45" />
            in play {formatDuration(inPlayMs)}
          </span>
          <span className="text-[#0a1628]/30">·</span>
          <span>{formatRelativeTime(new Date(completion.done_at))}</span>
          {phase && (
            <>
              <span className="text-[#0a1628]/30">·</span>
              <span
                className="inline-flex items-center gap-1"
                title={`Completed during ${phase.name}`}
              >
                <span aria-hidden="true">{phase.symbol}</span>
                <span className="hidden sm:inline">{phase.shortName}</span>
              </span>
            </>
          )}
          {typeof completion.alignment_score === "number" && (
            <>
              <span className="text-[#0a1628]/30">·</span>
              <span
                className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
                title={completion.alignment_reasoning ?? undefined}
              >
                {completion.alignment_score}
              </span>
            </>
          )}
        </div>
      </div>
    </li>
  );
};

// ─── Helpers ────────────────────────────────────────────────────

/** Short display name for each lunar phase — used in Harvest tags. */
const LUNAR_SHORT_NAMES: Record<string, string> = {
  "New Moon": "Clearing",
  "Waxing Crescent": "Gathering",
  "First Quarter": "Seeing",
  "Waxing Gibbous": "Leading",
  "Full Moon": "Harvesting",
  "Waning Gibbous": "Celebrating",
  "Last Quarter": "Planning",
  "Waning Crescent": "Planting",
};

/**
 * Derive the lunar phase at the moment a task was completed.
 * Returns undefined if done_at isn't set. Pure function over the
 * timestamp — no schema dependency. Uses the astronomically-correct
 * getLunarState (Brown's theory, 15 terms + ΔT) so the tag matches
 * what the user would have seen on the watch face at that moment.
 */
function lunarPhaseAtDone(
  doneAt: string | null,
): { name: string; symbol: string; shortName: string } | null {
  if (!doneAt) return null;
  const ms = Date.parse(doneAt);
  if (!Number.isFinite(ms)) return null;
  const state = getLunarState(ms);
  const phase = MOON_PHASES[state.segmentIndex];
  if (!phase) return null;
  return {
    name: phase.name,
    symbol: phase.symbol,
    shortName: LUNAR_SHORT_NAMES[phase.name] ?? phase.name,
  };
}

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

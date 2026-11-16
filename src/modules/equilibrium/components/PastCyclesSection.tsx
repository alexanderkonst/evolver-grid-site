import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { cycleStartMs } from "../phasePlan";
import type { CycleEntry } from "../types";
import {
  buildCycleStory,
  entriesForCycle,
  formatEntryDate,
  groupByCycle,
  storyHasContent,
  type CycleStory,
} from "../lib/cycleJournal";
import { EntryLines } from "./CyclePhaseStory";

/**
 * PastCyclesSection — a collapsed "Past cycles" link at the bottom of ACT
 * (issue #331). Opens a read-only list, one card per finished cycle, newest
 * first: dates, Moon Focus, strategies, workstreams, and the clearing /
 * resources / celebration lists with counts.
 *
 * History for Moon Focus / strategies / workstreams comes from the
 * `*_snapshot` rows written on every save (latest snapshot per slot wins);
 * the current cycle is excluded — it lives in the This-Cycle strip.
 */

interface PastCyclesSectionProps {
  /** Every journal entry (all cycles). */
  entries: CycleEntry[];
  /** Start of the current cycle (ms) — excluded from the list. */
  currentCycleStart: number | null;
}

/** ~31 days after a cycle starts is always inside the NEXT cycle's Planning window or just after it. */
const NEXT_CYCLE_PROBE_MS = 31 * 86_400_000;

export const PastCyclesSection = ({ entries, currentCycleStart }: PastCyclesSectionProps) => {
  const [open, setOpen] = useState(false);

  const cards = useMemo(() => {
    if (!open) return [];
    return groupByCycle(entries)
      .filter((g) => g.cycleStartMs !== currentCycleStart)
      .map((g) => ({
        startMs: g.cycleStartMs,
        endMs: cycleStartMs(g.cycleStartMs + NEXT_CYCLE_PROBE_MS),
        story: buildCycleStory(entriesForCycle(entries, g.cycleStartMs)),
      }))
      .filter((c) => storyHasContent(c.story));
  }, [open, entries, currentCycleStart]);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="eq-past-cycles"
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-sm font-medium text-[#0a1628]/70 transition hover:bg-white/50 hover:text-[#0a1628] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a080c0]/60"
      >
        Past cycles
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div id="eq-past-cycles" className="flex w-full flex-col gap-3">
          {cards.length === 0 ? (
            <p className="text-center text-sm italic text-[#0a1628]/45">
              No past cycles yet. This one will be here when it closes.
            </p>
          ) : (
            cards.map((card) => (
              <PastCycleCard key={card.startMs} startMs={card.startMs} endMs={card.endMs} story={card.story} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── One finished cycle ─────────────────────────────────────────────────

const PastCycleCard = ({
  startMs,
  endMs,
  story,
}: {
  startMs: number;
  endMs: number;
  story: CycleStory;
}) => {
  const counts: [string, number][] = [
    ["Clearing", story.clearing.length],
    ["Resources", story.resources.length],
    ["Celebration", story.celebration.length],
  ];

  return (
    <details className="group rounded-2xl border border-[#0a1628]/8 bg-white/55 px-4 py-3 text-sm">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs tabular-nums text-[#0a1628]/55">
            {formatEntryDate(startMs)} → {formatEntryDate(endMs)}
          </span>
          <span className="font-serif text-base font-semibold text-[#0a1628]">
            {story.focus ?? "No Moon Focus noted"}
          </span>
          <span className="text-xs text-[#0a1628]/55">
            {counts.map(([label, n]) => `${label} ${n}`).join(" · ")}
          </span>
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="mt-1 shrink-0 text-[#0a1628]/50 transition-transform group-open:rotate-180"
        />
      </summary>

      <div className="mt-2 flex flex-col gap-4 border-t border-[#0a1628]/8 pt-3">
        {story.strategies.length > 0 && (
          <Block title="Strategies">
            <ol className="flex flex-col gap-1">
              {story.strategies.map((s) => (
                <li key={s.position} className="text-[15px] leading-snug text-[#0a1628]/90">
                  <span className="mr-2 text-xs tabular-nums text-[#0a1628]/45">{s.position}</span>
                  {s.text}
                </li>
              ))}
            </ol>
          </Block>
        )}
        {story.workstreams.length > 0 && (
          <Block title="Workstreams">
            <ul className="flex flex-col gap-1">
              {story.workstreams.map((w, i) => (
                <li key={`${i}-${w}`} className="text-[15px] leading-snug text-[#0a1628]/90">
                  {w}
                </li>
              ))}
            </ul>
          </Block>
        )}
        <Block title={`Clearing · ${story.clearing.length}`}>
          <EntryLines entries={story.clearing} />
        </Block>
        <Block title={`Resources · ${story.resources.length}`}>
          <EntryLines entries={story.resources} />
        </Block>
        <Block title={`Celebration · ${story.celebration.length}`}>
          <EntryLines entries={story.celebration} />
        </Block>
      </div>
    </details>
  );
};

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#0a1628]/55">{title}</h4>
    {children}
  </div>
);

export default PastCyclesSection;

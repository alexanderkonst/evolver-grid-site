import { X } from "lucide-react";
import { phaseByPosition } from "../phasePlan";
import type { CycleEntry } from "../types";
import { formatEntryDate, resourceTagLabel, type CycleStory } from "../lib/cycleJournal";

/**
 * CyclePhaseStory — the small panel under the cycle strip (issue #331):
 * tap a phase dot, read what was written in that phase this cycle. Read
 * only. Past phases read as a story of the month.
 *
 * What each phase shows:
 *   1 Planning → Moon Focus · 2 Planting → strategies · 3 Clearing → what
 *   cleared · 4 Gathering → resources · 5 Seeing → workstreams · 6 Prep for
 *   Harvest → (nothing is written) · 7 Harvesting → DO NOW · 8 Celebrating
 *   → what ripened.
 */

const CALM_EMPTY = "Nothing noted yet. That's fine.";

interface CyclePhaseStoryProps {
  id: string;
  position: number;
  story: CycleStory;
  doNow?: string[];
  onClose: () => void;
}

export const CyclePhaseStory = ({ id, position, story, doNow, onClose }: CyclePhaseStoryProps) => {
  const phase = phaseByPosition(position);

  return (
    <section
      id={id}
      aria-label={`${phase.name} this cycle`}
      className="mt-3 rounded-2xl border border-[#0a1628]/8 bg-white/55 px-4 py-3 text-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-serif text-[15px] font-semibold text-[#0a1628]">
          {phase.position}. {phase.name}
          <span className="ml-2 text-xs font-normal text-[#0a1628]/50">this cycle</span>
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#0a1628]/50 hover:bg-[#0a1628]/5 hover:text-[#0a1628]"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
      <div className="mt-1.5">
        <PhaseBody position={position} story={story} doNow={doNow} />
      </div>
    </section>
  );
};

const PhaseBody = ({
  position,
  story,
  doNow,
}: {
  position: number;
  story: CycleStory;
  doNow?: string[];
}) => {
  switch (position) {
    case 1:
      return story.focus ? <Plain text={story.focus} /> : <Empty />;
    case 2:
      return story.strategies.length ? (
        <ol className="flex flex-col gap-1">
          {story.strategies.map((s) => (
            <li key={s.position} className="text-[15px] leading-snug text-[#0a1628]/90">
              <span className="mr-2 text-xs tabular-nums text-[#0a1628]/45">{s.position}</span>
              {s.text}
            </li>
          ))}
        </ol>
      ) : (
        <Empty />
      );
    case 3:
      return <EntryLines entries={story.clearing} />;
    case 4:
      return <EntryLines entries={story.resources} />;
    case 5:
      return story.workstreams.length ? (
        <ul className="flex flex-col gap-1">
          {story.workstreams.map((w, i) => (
            <li key={`${i}-${w}`} className="text-[15px] leading-snug text-[#0a1628]/90">
              {w}
            </li>
          ))}
        </ul>
      ) : (
        <Empty />
      );
    case 6:
      return (
        <p className="text-sm italic text-[#0a1628]/50">
          Nothing to write here. This phase is for ordering and scheduling.
        </p>
      );
    case 7:
      return doNow && doNow.length ? (
        <ul className="flex flex-col gap-1">
          {doNow.map((t, i) => (
            <li key={`${i}-${t}`} className="text-[15px] leading-snug text-[#0a1628]/90">
              {t}
            </li>
          ))}
        </ul>
      ) : (
        <Empty />
      );
    default:
      return <EntryLines entries={story.celebration} />;
  }
};

const Plain = ({ text }: { text: string }) => (
  <p className="text-[15px] leading-snug text-[#0a1628]/90">{text}</p>
);

const Empty = () => <p className="text-sm italic text-[#0a1628]/45">{CALM_EMPTY}</p>;

/** Read-only dated lines (newest first), with the resource tag when present. */
export const EntryLines = ({ entries }: { entries: CycleEntry[] }) =>
  entries.length === 0 ? (
    <Empty />
  ) : (
    <ul className="flex flex-col gap-1">
      {entries.map((e) => {
        const tag = e.kind === "resource" ? resourceTagLabel(e.tag) : null;
        return (
          <li key={e.id} className="flex items-start gap-2 text-[15px] leading-snug text-[#0a1628]/90">
            <span className="mt-[3px] w-12 shrink-0 text-[11px] tabular-nums text-[#0a1628]/45">
              {formatEntryDate(e.created_at)}
            </span>
            <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">
              {e.text}
              {tag && (
                <span className="ml-2 inline-block rounded-full border border-[#0a1628]/10 bg-white/60 px-2 py-px align-middle text-[10px] font-medium uppercase tracking-wide text-[#0a1628]/60">
                  {tag}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );

export default CyclePhaseStory;

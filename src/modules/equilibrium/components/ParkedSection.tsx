import { memo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EquilibriumParkedItem, EquilibriumParkedKind } from "../types";

/** Items shown initially, and added per "Show more" click (issue #66). */
export const PARKED_PAGE_SIZE = 5;

interface ParkedSectionProps {
  /** Parked items, newest first. */
  parked: EquilibriumParkedItem[];
  loading: boolean;
}

const KIND_LABEL: Record<EquilibriumParkedKind, string> = {
  strategy: "Strategy",
  workstream: "Workstream",
  task: "Task",
  idea: "Idea",
};

const formatParkedDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/**
 * Parked — important things set aside but kept in sight (issue #66).
 * Last block of ACT. Newest first, 5 at a time; a row expands to its body.
 * Read-only: agents park and unpark via equilibrium-agent-write.
 */
const ParkedSectionBase = ({ parked, loading }: ParkedSectionProps) => {
  const [visibleCount, setVisibleCount] = useState(PARKED_PAGE_SIZE);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (parked.length === 0) {
    return (
      <p className="mt-3 rounded-md border border-dashed border-[#0a1628]/10 px-4 py-6 text-center text-sm text-[#0a1628]/75">
        {loading ? "Loading…" : "Nothing parked. Set something aside and it will wait here."}
      </p>
    );
  }

  const shown = parked.slice(0, visibleCount);
  const remaining = parked.length - shown.length;

  return (
    <div className="mt-2">
      <ul className="flex flex-col gap-1.5">
        {shown.map((item) => {
          const expanded = expandedId === item.id;
          const hasBody = Boolean(item.body?.trim());
          return (
            <li
              key={item.id}
              className="rounded-xl border border-[#0a1628]/8 bg-white/80 transition hover:border-[#0a1628]/14 hover:bg-white/95"
            >
              <button
                type="button"
                aria-expanded={expanded}
                disabled={!hasBody}
                onClick={() => setExpandedId(expanded ? null : item.id)}
                className="flex w-full items-start gap-3 px-3 py-2.5 text-left disabled:cursor-default"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-[15px] leading-snug text-[#0a1628]/85">
                    {item.title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#0a1628]/55">
                    <span className="rounded-full border border-[#0a1628]/15 px-2 py-px text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0a1628]/65">
                      {KIND_LABEL[item.kind] ?? item.kind}
                    </span>
                    <span>{formatParkedDate(item.parked_at)}</span>
                  </div>
                </div>
                {hasBody && (
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={cn(
                      "mt-1 shrink-0 text-[#0a1628]/45 transition-transform",
                      expanded && "rotate-180",
                    )}
                  />
                )}
              </button>
              {expanded && hasBody && (
                <p className="whitespace-pre-wrap border-t border-[#0a1628]/8 px-3 py-2.5 text-sm leading-relaxed text-[#0a1628]/75">
                  {item.body}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {remaining > 0 && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((n) => n + PARKED_PAGE_SIZE)}
            className="rounded-full border border-[#0a1628]/15 px-4 py-1.5 text-xs font-semibold text-[#0a1628]/70 transition hover:bg-[#0a1628]/5"
          >
            Show more ({remaining})
          </button>
        </div>
      )}
    </div>
  );
};

export const ParkedSection = memo(ParkedSectionBase);

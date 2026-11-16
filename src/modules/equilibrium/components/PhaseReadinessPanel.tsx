import { memo, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOON_PHASES } from "@/lib/equilibrium-cycles";
import {
  EQ_LAYER_KEYS,
  EQ_LAYERS,
  JOURNAL_KIND_COPY,
  PHASE_PLAN,
  isJournalLayer,
  nextPhase,
  phaseByPosition,
  phasePromptForPosition,
  type CycleJournalKind,
  type EqJumpTarget,
  type EqLayerKey,
  type LayerReadiness,
} from "../phasePlan";
import type { CycleEntry } from "../types";
import { phaseHasStory, type CycleStory } from "../lib/cycleJournal";
import { CycleJournalInput, type CycleJournalInputProps } from "./CycleJournalInput";
import { CyclePhaseStory } from "./CyclePhaseStory";

interface PhaseReadinessPanelProps {
  /** Current cycle position, 1-8. */
  currentPosition: number;
  /** Per-layer readiness for the five write surfaces. */
  readiness: Record<EqLayerKey, LayerReadiness>;
  /** When the current phase ends (= when the next phase begins), ms. */
  phaseEndMs: number;
  /** Days remaining in the current phase. */
  daysRemainingInPhase: number;
  /**
   * Cycle Journal wiring (issue #331). `available: false` (the table isn't
   * there yet) hides every journal input and chip — the panel then reads
   * exactly as before.
   */
  journal?: {
    available: boolean;
    /** Entries of the current cycle. */
    entries: CycleEntry[];
    onAdd: CycleJournalInputProps["onAdd"];
    onUpdate: CycleJournalInputProps["onUpdate"];
    onRemove: CycleJournalInputProps["onRemove"];
  };
  /** What was written this cycle (live layers + journal), for the clickable strip. */
  story?: CycleStory;
  /** Current DO NOW task texts, shown under the Harvesting dot. */
  doNow?: string[];
  /** "Write it →": scroll to and focus an existing editor. */
  onJump?: (target: EqJumpTarget) => void;
}

/**
 * PhaseReadinessPanel — the calm, phase-aware readiness header for ACT
 * mode (issue #63), and the home of the Cycle Journal prompt (issue #331).
 * Stacked pieces:
 *
 *   1. Cycle strip — 8 phase dots, current highlighted, with a one-line
 *      "ends <date> · N days left" below. Each dot is a button: tap it to
 *      read what was written in that phase this cycle.
 *   2. Phase card — what this phase asks, then exactly ONE prompt (a quick
 *      input for Clearing / Gathering / Celebrating, or a "Write it →" link
 *      to the existing editor), a quiet "Also note" row, the trap, and a
 *      "Next:" line.
 *   3. Readiness row — chips (Focus · Strategies · Clearing · Resources ·
 *      Workstreams · Tasks · DO NOW · Celebration): ✓ filled / · not due
 *      yet / ! due but empty. The three journal chips show a count or a
 *      calm dot and are never amber.
 *
 * Readiness itself is read-only. No guilt copy; `due_empty` is a soft
 * amber nudge, never red.
 */
const PhaseReadinessPanelBase = ({
  currentPosition,
  readiness,
  phaseEndMs,
  daysRemainingInPhase,
  journal,
  story,
  doNow,
  onJump,
}: PhaseReadinessPanelProps) => {
  const phase = phaseByPosition(currentPosition);
  const upcoming = nextPhase(currentPosition);
  const journalOn = Boolean(journal?.available);
  const [selectedPos, setSelectedPos] = useState<number | null>(null);
  const prompt = phasePromptForPosition(currentPosition);
  const journalCounts: Record<string, number> = {
    clearing: story?.clearing.length ?? 0,
    resources: story?.resources.length ?? 0,
    celebration: story?.celebration.length ?? 0,
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── 1. Cycle strip ────────────────────────────────────── */}
      <div>
        <ol className="flex items-center justify-between gap-1" aria-label="Lunar cycle phases">
          {PHASE_PLAN.map((p) => {
            const isCurrent = p.position === currentPosition;
            const isSelected = p.position === selectedPos;
            const hasStory = Boolean(story) && phaseHasStory(p.position, story!, doNow);
            return (
              <li key={p.position} className="flex min-w-0 flex-1 flex-col items-center">
                <button
                  type="button"
                  onClick={() => setSelectedPos(isSelected ? null : p.position)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-expanded={isSelected}
                  aria-controls="eq-cycle-story"
                  aria-label={`${p.position}. ${p.name}${isCurrent ? " (now)" : ""} — what was written`}
                  title={`${p.position}. ${p.name}`}
                  className="flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-xl transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a080c0]/60"
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-sm leading-none transition-all",
                      isCurrent
                        ? "scale-110 bg-[#a080c0]/20 shadow-[0_0_0_2px_rgba(160,128,192,0.55)]"
                        : "bg-white/40 opacity-55",
                      isSelected && !isCurrent && "opacity-100 shadow-[0_0_0_2px_rgba(10,22,40,0.25)]",
                    )}
                  >
                    <span aria-hidden="true" className="select-none">
                      {MOON_PHASES[p.astronomicalIndex].symbol}
                    </span>
                  </span>
                  {/* A quiet dot: something was written in this phase. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-1 w-1 rounded-full",
                      hasStory ? "bg-[#a080c0]" : "bg-transparent",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-center text-xs text-[#0a1628]/70">
          <span className="font-serif font-medium text-[#0a1628]">
            {phase.position}. {phase.name}
          </span>
          {" · "}
          {formatEndsIn(phaseEndMs, daysRemainingInPhase)}
        </p>
        {selectedPos !== null && story && (
          <CyclePhaseStory
            id="eq-cycle-story"
            position={selectedPos}
            story={story}
            doNow={doNow}
            onClose={() => setSelectedPos(null)}
          />
        )}
      </div>

      {/* ── 2. Phase card ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#0a1628]/8 bg-white/55 px-4 py-3 text-sm">
        <p className="text-[#0a1628]/90">{phase.asks}</p>
        <PhasePromptBlock
          prompt={prompt}
          journal={journalOn ? journal : undefined}
          onJump={onJump}
        />
        <p className="mt-3 text-[13px] text-[#0a1628]/60">
          <span className="font-medium text-[#0a1628]/70">Trap:</span> {phase.trap}
        </p>
        <p className="mt-2 border-t border-[#0a1628]/8 pt-2 text-[11px] uppercase tracking-wider text-[#0a1628]/55">
          Next: <span className="font-semibold text-[#0a1628]/75">{upcoming.name}</span>
          {" · "}
          {formatAbsolute(phaseEndMs)}
          {" → "}
          <span className="normal-case tracking-normal text-[#0a1628]/70">{upcoming.writeLabel}</span>
        </p>
      </div>

      {/* ── 3. Readiness row ──────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-2" role="list" aria-label="Layer readiness">
        {EQ_LAYER_KEYS.filter((key) => journalOn || !isJournalLayer(key)).map((key) => (
          <ReadinessChip
            key={key}
            label={EQ_LAYERS[key].label}
            state={readiness[key]}
            count={isJournalLayer(key) ? journalCounts[key] : undefined}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Readiness chip ──────────────────────────────────────────────

const ReadinessChip = ({
  label,
  state,
  count,
}: {
  label: string;
  state: LayerReadiness;
  /** Journal chips only: how many lines are written this cycle. */
  count?: number;
}) => {
  const styles: Record<LayerReadiness, string> = {
    filled: "border-[#0a1628]/15 bg-white/80 text-[#0a1628]",
    due_empty: "border-amber-300/55 bg-amber-50/70 text-amber-800",
    not_due: "border-[#0a1628]/8 bg-white/35 text-[#0a1628]/40",
  };
  const srLabel: Record<LayerReadiness, string> = {
    filled: "filled",
    due_empty: "due but empty",
    not_due: "not due yet",
  };
  return (
    <span
      role="listitem"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        styles[state],
      )}
    >
      <span aria-hidden="true" className="flex w-3 justify-center leading-none">
        {state === "filled" ? (
          <Check size={12} strokeWidth={2.75} />
        ) : state === "due_empty" ? (
          <span className="font-bold">!</span>
        ) : (
          <span className="text-base leading-none">·</span>
        )}
      </span>
      {label}
      {count !== undefined && count > 0 && <span className="tabular-nums">· {count}</span>}
      <span className="sr-only">
        {" — "}
        {count !== undefined ? (count > 0 ? `${count} noted` : "nothing noted yet") : srLabel[state]}
      </span>
    </span>
  );
};

// ─── Phase prompt (Cycle Journal) ────────────────────────────────

const JOURNAL_KINDS: CycleJournalKind[] = ["clearing", "resource", "celebration"];

/**
 * Exactly ONE prompt for the current phase, then a quiet "Also note" row so
 * any journal kind can be written at any time (real life doesn't respect
 * phase edges; the phase only decides what is prominent).
 */
const PhasePromptBlock = ({
  prompt,
  journal,
  onJump,
}: {
  prompt: ReturnType<typeof phasePromptForPosition>;
  journal?: NonNullable<PhaseReadinessPanelProps["journal"]>;
  onJump?: (target: EqJumpTarget) => void;
}) => {
  const [alsoKind, setAlsoKind] = useState<CycleJournalKind | null>(null);

  const primaryKind = prompt.type === "entry" ? prompt.kind : null;
  // "Also note" offers the kinds that are NOT already the main prompt.
  const alsoKinds = JOURNAL_KINDS.filter((k) => k !== primaryKind);
  // If the phase moved so the open extra input is now the main prompt, drop it.
  const openAlso = alsoKind && alsoKind !== primaryKind ? alsoKind : null;

  return (
    <div className="mt-3 flex flex-col gap-3">
      {prompt.type === "entry" && journal && (
        <CycleJournalInput
          kind={prompt.kind}
          entries={journal.entries}
          onAdd={journal.onAdd}
          onUpdate={journal.onUpdate}
          onRemove={journal.onRemove}
        />
      )}
      {prompt.type === "jump" && onJump && (
        <button
          type="button"
          onClick={() => onJump(prompt.target)}
          className="inline-flex min-h-[44px] w-full items-center justify-between gap-2 rounded-2xl px-4 text-left text-[15px] font-medium text-[#0a1628] transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a080c0]/60"
          style={{
            background: "rgba(255,255,255,0.35)",
            boxShadow:
              "inset 0 2px 4px rgba(10,22,40,0.08), inset 0 -1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(10,22,40,0.04)",
          }}
        >
          <span>{prompt.label}</span>
          <span aria-hidden="true">→</span>
        </button>
      )}

      {journal && (
        <div className="flex flex-col gap-2.5">
          <p className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-[#0a1628]/55">
            <span>Also note:</span>
            {alsoKinds.map((kind, i) => (
              <span key={kind} className="inline-flex items-center">
                {i > 0 && <span aria-hidden="true" className="mr-1 text-[#0a1628]/30">·</span>}
                <button
                  type="button"
                  aria-pressed={openAlso === kind}
                  onClick={() => setAlsoKind(openAlso === kind ? null : kind)}
                  className={cn(
                    "min-h-[32px] rounded-full px-2 font-medium underline-offset-2 transition hover:underline",
                    openAlso === kind ? "bg-white/70 text-[#0a1628]" : "text-[#0a1628]/70",
                  )}
                >
                  {JOURNAL_KIND_COPY[kind].noun}
                </button>
              </span>
            ))}
          </p>
          {openAlso && (
            <div className="rounded-2xl bg-white/40 p-3">
              <CycleJournalInput
                key={openAlso}
                kind={openAlso}
                entries={journal.entries}
                onAdd={journal.onAdd}
                onUpdate={journal.onUpdate}
                onRemove={journal.onRemove}
                autoFocus
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Formatting ──────────────────────────────────────────────────

/** "ends Sun Oct 18 · 2.3 days left" / "ends today · 5h left". */
function formatEndsIn(phaseEndMs: number, daysRemaining: number): string {
  const days =
    daysRemaining < 1
      ? `${Math.max(0, Math.round(daysRemaining * 24))}h left`
      : `${daysRemaining.toFixed(1)} days left`;
  return `ends ${formatAbsolute(phaseEndMs)} · ${days}`;
}

/** "Sun Oct 18" — user's locale + timezone. */
function formatAbsolute(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export const PhaseReadinessPanel = memo(PhaseReadinessPanelBase);
export default PhaseReadinessPanel;

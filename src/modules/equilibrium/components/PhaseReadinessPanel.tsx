import { memo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOON_PHASES } from "@/lib/equilibrium-cycles";
import {
  EQ_LAYER_KEYS,
  EQ_LAYERS,
  PHASE_PLAN,
  nextPhase,
  phaseByPosition,
  type EqLayerKey,
  type LayerReadiness,
} from "../phasePlan";

interface PhaseReadinessPanelProps {
  /** Current cycle position, 1-8. */
  currentPosition: number;
  /** Per-layer readiness for the five write surfaces. */
  readiness: Record<EqLayerKey, LayerReadiness>;
  /** When the current phase ends (= when the next phase begins), ms. */
  phaseEndMs: number;
  /** Days remaining in the current phase. */
  daysRemainingInPhase: number;
}

/**
 * PhaseReadinessPanel — the calm, phase-aware readiness header for ACT
 * mode (issue #63). Three stacked pieces:
 *
 *   1. Cycle strip — 8 phase dots, current highlighted, with a one-line
 *      "ends <date> · N days left" below.
 *   2. Phase card — what this phase asks + its trap + a "Next:" line.
 *   3. Readiness row — five chips (Focus · Strategies · Workstreams ·
 *      Tasks · DO NOW), each ✓ filled / · not due yet / ! due but empty.
 *
 * The whole thing is read-only: it tells the user where they are and what
 * is legitimately "not yet". No guilt copy; `due_empty` is a soft amber
 * nudge, never red.
 */
const PhaseReadinessPanelBase = ({
  currentPosition,
  readiness,
  phaseEndMs,
  daysRemainingInPhase,
}: PhaseReadinessPanelProps) => {
  const phase = phaseByPosition(currentPosition);
  const upcoming = nextPhase(currentPosition);

  return (
    <div className="flex flex-col gap-5">
      {/* ── 1. Cycle strip ────────────────────────────────────── */}
      <div>
        <ol className="flex items-center justify-between gap-1" aria-label="Lunar cycle phases">
          {PHASE_PLAN.map((p) => {
            const isCurrent = p.position === currentPosition;
            return (
              <li key={p.position} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  title={`${p.position}. ${p.name}`}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm leading-none transition-all",
                    isCurrent
                      ? "scale-110 bg-[#a080c0]/20 shadow-[0_0_0_2px_rgba(160,128,192,0.55)]"
                      : "bg-white/40 opacity-55",
                  )}
                >
                  <span aria-hidden="true" className="select-none">
                    {MOON_PHASES[p.astronomicalIndex].symbol}
                  </span>
                </span>
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
      </div>

      {/* ── 2. Phase card ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#0a1628]/8 bg-white/55 px-4 py-3 text-sm">
        <p className="text-[#0a1628]/90">{phase.asks}</p>
        <p className="mt-1.5 text-[13px] text-[#0a1628]/60">
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
        {EQ_LAYER_KEYS.map((key) => (
          <ReadinessChip key={key} label={EQ_LAYERS[key].label} state={readiness[key]} />
        ))}
      </div>
    </div>
  );
};

// ─── Readiness chip ──────────────────────────────────────────────

const ReadinessChip = ({ label, state }: { label: string; state: LayerReadiness }) => {
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
      <span className="sr-only"> — {srLabel[state]}</span>
    </span>
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

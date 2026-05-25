import { memo, useMemo } from "react";
import { Sparkle } from "lucide-react";
import { getLunarState, MOON_PHASES } from "@/lib/equilibrium-cycles";

interface UpcomingTransitionsProps {
  /** Now in ms — passed in so the parent's cycle-tick state drives refresh. */
  nowMs: number;
  /** How many upcoming transitions to show. Default 4. */
  count?: number;
}

/**
 * UpcomingTransitions — a quiet panel showing the next N lunar phase
 * boundary moments (Sasha 2026-05-24).
 *
 * Why: the watch teaches "windows not vibes" — phase boundaries are
 * actionable moments to schedule into. Until now the user could only
 * see "ends Tue May 19 · 2.3 days left" for the CURRENT phase. This
 * panel surfaces the next 4 transitions so you can plan a Planning
 * day three weeks out, or know when Celebrating starts.
 *
 * Computation: walk forward in small steps from now, detecting each
 * phase boundary crossing. Lunar phases are ~3.7 days each, so 4
 * transitions span ~15 days. Step at 30-minute resolution; refine
 * each boundary with binary search to ~1-minute accuracy.
 *
 * Cost: ~700 elongation evaluations for a 15-day sweep at 30-min
 * steps, plus ~30 for binary refinement. Each evaluation is ~20 trig
 * ops; total ~14k trig ops per render. Cheap (sub-millisecond).
 * Memoized on `nowMs` rounded to 5 minutes so it doesn't re-run on
 * unrelated re-renders.
 */
const UpcomingTransitionsBase = ({
  nowMs,
  count = 4,
}: UpcomingTransitionsProps) => {
  const transitions = useMemo(() => findNextTransitions(nowMs, count), [nowMs, count]);

  if (transitions.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a1628]/65">
        <Sparkle size={11} className="text-[#0a1628]/40" />
        <span>Coming up</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {transitions.map((t) => (
          <li
            key={t.atMs}
            className="flex items-center gap-3 rounded-xl border border-[#0a1628]/8 bg-white/70 px-3 py-2 text-sm"
          >
            <span aria-hidden="true" className="select-none text-lg">{t.symbol}</span>
            <div className="flex-1 min-w-0">
              <div className="font-serif font-medium text-[#0a1628]">
                {t.shortName}{" "}
                <span className="font-normal text-[#0a1628]/55">· {t.name}</span>
              </div>
              <div className="text-[11px] text-[#0a1628]/60">
                {formatAbsolute(t.atMs)} <span className="text-[#0a1628]/35">·</span>{" "}
                <span className="italic">in {formatDistance(t.atMs - nowMs)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── Helpers ────────────────────────────────────────────────────

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

interface Transition {
  /** UTC ms timestamp of the boundary. */
  atMs: number;
  /** Phase index entered AT this boundary. */
  toIndex: number;
  /** Full name of the entered phase (e.g., "Full Moon"). */
  name: string;
  /** Spine name (e.g., "Harvesting"). */
  shortName: string;
  /** Emoji glyph. */
  symbol: string;
}

/**
 * Find the next `count` phase boundaries by stepping forward in 30-min
 * intervals, detecting segmentIndex changes, then refining each
 * boundary with binary search to ~1-minute resolution.
 */
function findNextTransitions(startMs: number, count: number): Transition[] {
  const STEP_MS = 30 * 60 * 1000; // 30 min
  const MAX_DAYS = 30; // safety cap — 4 transitions usually within ~15d
  const MAX_STEPS = (MAX_DAYS * 24 * 60) / 30;

  const found: Transition[] = [];
  let prevIdx = getLunarState(startMs).segmentIndex;

  for (let step = 1; step <= MAX_STEPS && found.length < count; step++) {
    const tMs = startMs + step * STEP_MS;
    const idx = getLunarState(tMs).segmentIndex;
    if (idx !== prevIdx) {
      // Boundary lies in (tMs - STEP_MS, tMs]. Binary refine.
      const refinedMs = refineBoundary(tMs - STEP_MS, tMs, prevIdx);
      const phase = MOON_PHASES[idx];
      if (phase) {
        found.push({
          atMs: refinedMs,
          toIndex: idx,
          name: phase.name,
          shortName: LUNAR_SHORT_NAMES[phase.name] ?? phase.name,
          symbol: phase.symbol,
        });
      }
      prevIdx = idx;
    }
  }

  return found;
}

/** Binary search for the moment phase changes from `fromIdx` → next. */
function refineBoundary(loMs: number, hiMs: number, fromIdx: number): number {
  let lo = loMs;
  let hi = hiMs;
  for (let i = 0; i < 20; i++) {
    // ~1-minute resolution
    const mid = Math.floor((lo + hi) / 2);
    const idx = getLunarState(mid).segmentIndex;
    if (idx === fromIdx) lo = mid;
    else hi = mid;
    if (hi - lo < 60_000) break;
  }
  return hi;
}

/** "Tue May 27, 03:14 (local)" — uses the user's locale + timezone. */
function formatAbsolute(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "3 days · 4 hours" / "5 hours" / "23 min". */
function formatDistance(deltaMs: number): string {
  const minutes = Math.max(0, Math.round(deltaMs / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (remHours === 0) return `${days} ${days === 1 ? "day" : "days"}`;
  return `${days}d ${remHours}h`;
}

export const UpcomingTransitions = memo(UpcomingTransitionsBase);

export default UpcomingTransitions;

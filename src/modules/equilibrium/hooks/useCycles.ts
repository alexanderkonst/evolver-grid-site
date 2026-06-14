import { useEffect, useState } from "react";
import { getAllCyclesV2, type AllCyclesV2 } from "@/lib/equilibrium-cycles";

/**
 * Shared cycle-tick hook for the Equilibrium Biologic Watch.
 *
 * Extracted from EquilibriumV2Page so BOTH the legacy V2 page and the
 * MDLS page use ONE optimized implementation (Sasha 2026-06-13, MDLS
 * default SOW · resource rule R2). Previously the MDLS page shipped a
 * stale copy that ticked every 60s with no visibility pause and no
 * de-dupe — it re-rendered the whole section tree once a minute even on
 * a hidden tab. That is exactly the fan-spin pattern the resource
 * constraint forbids, so the MDLS page now imports this instead.
 *
 * Responsiveness pass (Sasha 2026-05-19):
 *
 *   • Tick every 5 minutes (was 60s). Cycles change so slowly — the
 *     fastest is day-of-week, which updates once per day — that
 *     per-minute updates were pure overhead. 5 minutes = enough
 *     resolution for "ends Tue · 2.3 days left" labels to feel live.
 *
 *   • Pause when the tab is hidden. `document.visibilityState` lets
 *     browsers throttle hidden tabs anyway, but explicit pausing
 *     prevents the queued-tick-fires-on-focus pattern.
 *
 *   • Recompute on visibility return. If the tab was hidden for hours,
 *     cycle state could be stale — refresh once on focus, then resume
 *     the 5-minute cadence.
 *
 *   • De-dupe identical states. If neither the orb position
 *     (`segmentIndex`) nor the half-day remaining changed across all
 *     four cycles, skip the setState. No state swap = no re-render
 *     cascade for downstream sections.
 */
function cyclesShallowEqual(a: AllCyclesV2, b: AllCyclesV2): boolean {
  const round = (n: number) => Math.floor(n * 10) / 10; // ~2.4h granularity
  return (
    a.solar.segmentIndex === b.solar.segmentIndex &&
    a.zodiac.segmentIndex === b.zodiac.segmentIndex &&
    a.lunar.segmentIndex === b.lunar.segmentIndex &&
    a.dayOfWeek.segmentIndex === b.dayOfWeek.segmentIndex &&
    round(a.lunar.daysRemainingInPhase) === round(b.lunar.daysRemainingInPhase) &&
    round(a.solar.personalProgress * 100) === round(b.solar.personalProgress * 100)
  );
}

export interface CyclesSnapshot {
  cycles: AllCyclesV2;
  /** Timestamp the cycles were computed at — stable across re-renders
   *  between ticks. Use this for components that need a "now" anchor
   *  (e.g. UpcomingTransitions) so they only recompute on the tick,
   *  not every render. Sasha 2026-05-24. */
  nowMs: number;
}

export function useCycles(birthday?: string): CyclesSnapshot {
  const [snapshot, setSnapshot] = useState<CyclesSnapshot>(() => {
    const nowMs = Date.now();
    return { cycles: getAllCyclesV2(nowMs, birthday), nowMs };
  });

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      if (cancelled) return;
      const nowMs = Date.now();
      const next = getAllCyclesV2(nowMs, birthday);
      setSnapshot((prev) =>
        cyclesShallowEqual(prev.cycles, next) ? prev : { cycles: next, nowMs },
      );
    };

    const tick = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      refresh();
    };

    const onVisible = () => {
      if (typeof document !== "undefined" && !document.hidden) refresh();
    };

    const intervalId = window.setInterval(tick, 5 * 60_000);
    document.addEventListener("visibilitychange", onVisible);

    refresh();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [birthday]);

  return snapshot;
}

/**
 * Format the time-to-next-phase sub-label for the lunar pill stack.
 * "ends Tue May 19 · 2.3 days left"
 *
 * Locked 2026-05-16 per philosophical spine §6 — turns "a vibe" into
 * "a window." Shared by both the V2 and MDLS pages.
 */
export function formatPhaseEndsAt(phaseEndMs: number, daysRemaining: number): string {
  const end = new Date(phaseEndMs);
  const day = end.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const days =
    daysRemaining < 1
      ? `${Math.max(0, Math.round(daysRemaining * 24))}h left`
      : `${daysRemaining.toFixed(1)} days left`;
  return `ends ${day} · ${days}`;
}

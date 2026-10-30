import { qolAverageLevel, type QolStageColumns } from "@/lib/qolLevel";

/**
 * Player metrics, measured month by month (Sasha, 2026-10-30, issue #241).
 *
 * One generic shape for every metric: (metric key, month, value). Level (the mean of the 8 QoL
 * domains) is the first metric; a new metric is one more entry in PLAYER_METRICS, with no change
 * to the history UI or the Quest Board.
 *
 * Private to the player: these values render only on the player's own screens. Other players see
 * nothing about them (no number, no lock, no badge), and nothing ranks, sorts or compares players
 * by them.
 *
 * Source today: `qol_snapshots` (each QoL assessment is one row; the newest row of a calendar month
 * is that month's measurement). Proposed generic table `player_metric_snapshots`
 * (docs/specs/player-metrics/player_metric_snapshots.proposed.sql) is NOT applied; when it is,
 * only `loadMetricRows` changes.
 */

export type PlayerMetricKey = "level";

export type PlayerMetricDef = {
  key: PlayerMetricKey;
  /** i18n key of the metric's name. */
  labelKey: string;
  /** Highest value, for «N / max». */
  max: number;
  /** Where the player measures it this month. */
  measureTo: string;
  /** Value from one QoL snapshot row; null when the row cannot give it. */
  fromQolSnapshot: (row: Partial<QolStageColumns>) => number | null;
};

export const PLAYER_METRICS: Record<PlayerMetricKey, PlayerMetricDef> = {
  level: {
    key: "level",
    labelKey: "playerMetrics.level.title",
    max: 10,
    measureTo: "/quality-of-life-map/assessment",
    fromQolSnapshot: (row) => qolAverageLevel(row),
  },
};

/** One measured month of one metric. `month` is «YYYY-MM» in the player's local calendar. */
export type MetricPoint = { metric: PlayerMetricKey; month: string; value: number; measuredAt: string };

export type QolSnapshotRow = Partial<QolStageColumns> & { created_at: string };

/** «YYYY-MM» of a date in local time (the player's calendar month). */
export function monthKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Month-by-month series of one metric, newest month first. The newest measurement inside a month
 * is that month's value; rows that cannot give the metric are skipped (no invented values).
 */
export function monthlySeries(metric: PlayerMetricKey, rows: QolSnapshotRow[]): MetricPoint[] {
  const def = PLAYER_METRICS[metric];
  const byMonth = new Map<string, MetricPoint>();
  for (const row of rows) {
    const value = def.fromQolSnapshot(row);
    if (value === null || !row.created_at) continue;
    const month = monthKey(row.created_at);
    const prev = byMonth.get(month);
    if (!prev || new Date(row.created_at) > new Date(prev.measuredAt)) {
      byMonth.set(month, { metric, month, value, measuredAt: row.created_at });
    }
  }
  return [...byMonth.values()].sort((a, b) => (a.month < b.month ? 1 : -1));
}

/** True when the series holds a measurement for the month of `now`. */
export function isMonthMeasured(series: MetricPoint[], now: Date = new Date()): boolean {
  const m = monthKey(now);
  return series.some((p) => p.month === m);
}

/** Change against the previous measured month, to one decimal; null when there is no earlier month. */
export function changeFromPrevious(series: MetricPoint[]): number | null {
  if (series.length < 2) return null;
  return Math.round((series[0].value - series[1].value) * 10) / 10;
}

/**
 * The «Measure your month» quest (#241): offered to a signed-in player whose current calendar
 * month has no measurement but who measured before (a first measurement is the Journey's own QoL
 * step). Never for a guest, while loading, or when the read failed (a failed read must not claim
 * the month is missing).
 */
export function measureMonthQuest(state: {
  signedIn: boolean;
  isLoading: boolean;
  failed: boolean;
  measuredThisMonth: boolean;
  series: Record<PlayerMetricKey, MetricPoint[]>;
}): { to: string } | null {
  if (!state.signedIn || state.isLoading || state.failed || state.measuredThisMonth) return null;
  if (state.series.level.length === 0) return null;
  return { to: PLAYER_METRICS.level.measureTo };
}

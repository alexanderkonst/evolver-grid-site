import { describe, expect, it } from "vitest";
import {
  PLAYER_METRICS,
  changeFromPrevious,
  isMonthMeasured,
  measureMonthQuest,
  monthKey,
  monthlySeries,
} from "../playerMetrics";

const stages = (n: number) => ({
  wealth_stage: n,
  health_stage: n,
  happiness_stage: n,
  love_relationships_stage: n,
  impact_stage: n,
  growth_stage: n,
  social_ties_stage: n,
  home_stage: n,
});

describe("player metrics month by month (#241)", () => {
  it("level is the first generic metric", () => {
    expect(Object.keys(PLAYER_METRICS)).toContain("level");
    expect(PLAYER_METRICS.level.fromQolSnapshot(stages(6))).toBe(6);
  });

  it("keeps the newest measurement of each month, newest month first", () => {
    const rows = [
      { ...stages(4), created_at: new Date(2026, 8, 3).toISOString() },
      { ...stages(5), created_at: new Date(2026, 8, 20).toISOString() },
      { ...stages(7), created_at: new Date(2026, 9, 2).toISOString() },
    ];
    const s = monthlySeries("level", rows);
    expect(s.map((p) => [p.month, p.value])).toEqual([
      ["2026-10", 7],
      ["2026-09", 5],
    ]);
    expect(changeFromPrevious(s)).toBe(2);
  });

  it("skips rows that cannot give the metric (no invented values)", () => {
    const rows = [{ ...stages(6), home_stage: null, created_at: new Date(2026, 9, 1).toISOString() }];
    expect(monthlySeries("level", rows)).toEqual([]);
  });

  it("knows whether this calendar month is measured", () => {
    const s = monthlySeries("level", [{ ...stages(6), created_at: new Date(2026, 8, 15).toISOString() }]);
    expect(isMonthMeasured(s, new Date(2026, 8, 30))).toBe(true);
    expect(isMonthMeasured(s, new Date(2026, 9, 1))).toBe(false);
    expect(monthKey(new Date(2026, 0, 5))).toBe("2026-01");
  });

  it("offers «Measure your month» only to a signed-in player who measured before and missed this month", () => {
    const past = monthlySeries("level", [{ ...stages(6), created_at: new Date(2026, 8, 15).toISOString() }]);
    const base = { signedIn: true, isLoading: false, failed: false, measuredThisMonth: false, series: { level: past } };
    expect(measureMonthQuest(base)).toEqual({ to: PLAYER_METRICS.level.measureTo });
    expect(measureMonthQuest({ ...base, measuredThisMonth: true })).toBeNull();
    expect(measureMonthQuest({ ...base, signedIn: false })).toBeNull();
    expect(measureMonthQuest({ ...base, isLoading: true })).toBeNull();
    expect(measureMonthQuest({ ...base, failed: true })).toBeNull();
    expect(measureMonthQuest({ ...base, series: { level: [] } })).toBeNull();
  });
});

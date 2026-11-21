import { describe, expect, it } from "vitest";
import {
  ACT_TEXT_MAX,
  MAX_FREEZES,
  cleanActText,
  computeStreak,
  daysBetween,
  localDateKey,
} from "../streak";

/** `n` consecutive days starting at `start` (YYYY-MM-DD, within one month for the tests). */
const run = (start: string, n: number) => {
  const [y, m, d] = start.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => localDateKey(new Date(y, m - 1, d + i)));
};

describe("computeStreak", () => {
  it("no acts: nothing to show", () => {
    expect(computeStreak([], "2026-11-21")).toEqual({
      count: 0,
      freezes: 0,
      best: 0,
      actedToday: false,
      lastActDate: null,
      status: "none",
    });
  });

  it("one act today starts a run of 1", () => {
    const s = computeStreak(["2026-11-21"], "2026-11-21");
    expect(s).toMatchObject({ count: 1, actedToday: true, status: "active", freezes: 0 });
  });

  it("consecutive real acts extend the streak", () => {
    const s = computeStreak(run("2026-11-17", 5), "2026-11-21");
    expect(s).toMatchObject({ count: 5, best: 5, actedToday: true, status: "active" });
  });

  it("two acts on one day count once", () => {
    const s = computeStreak(["2026-11-20", "2026-11-20", "2026-11-21"], "2026-11-21");
    expect(s.count).toBe(2);
  });

  it("an act yesterday keeps the run alive before today's act", () => {
    const s = computeStreak(run("2026-11-18", 3), "2026-11-21");
    expect(s).toMatchObject({ count: 3, actedToday: false, status: "active" });
  });

  it("a missed day with no freeze rests the run; the next act begins a new one", () => {
    const resting = computeStreak(run("2026-11-10", 3), "2026-11-15");
    expect(resting).toMatchObject({ count: 0, best: 3, status: "resting" });
    const restarted = computeStreak([...run("2026-11-10", 3), "2026-11-15"], "2026-11-15");
    expect(restarted).toMatchObject({ count: 1, best: 3, status: "active" });
  });

  it("the 7th day of a run earns a freeze", () => {
    expect(computeStreak(run("2026-11-01", 6), "2026-11-06").freezes).toBe(0);
    expect(computeStreak(run("2026-11-01", 7), "2026-11-07").freezes).toBe(1);
  });

  it("freezes are capped at two", () => {
    const s = computeStreak(run("2026-10-01", 28), "2026-10-28");
    expect(s.count).toBe(28);
    expect(s.freezes).toBe(MAX_FREEZES);
  });

  it("a freeze covers one missed day: the run continues, the freeze is spent", () => {
    // Days 1–7 earn a freeze; day 8 missed; act on day 9.
    const acts = [...run("2026-11-01", 7), "2026-11-09"];
    const s = computeStreak(acts, "2026-11-09");
    expect(s).toMatchObject({ count: 8, freezes: 0, status: "active" });
  });

  it("missed days are bridged, not counted", () => {
    const acts = [...run("2026-11-01", 7), "2026-11-09"];
    expect(computeStreak(acts, "2026-11-09").count).toBe(8);
  });

  it("two freezes cover two missed days, but not three", () => {
    const base = run("2026-10-01", 14); // two freezes earned by day 14
    expect(computeStreak([...base, "2026-10-17"], "2026-10-17")).toMatchObject({ count: 15, freezes: 0 });
    // three missed days (15, 16, 17), act on 18: gap is too long, a new run begins
    const broken = computeStreak([...base, "2026-10-18"], "2026-10-18");
    expect(broken).toMatchObject({ count: 1, best: 14, freezes: 2 });
  });

  it("a held freeze keeps an unacted gap alive until the next act", () => {
    // 7 days earn a freeze; today is two days after the last act (one missed day).
    const s = computeStreak(run("2026-11-01", 7), "2026-11-09");
    expect(s).toMatchObject({ count: 7, freezes: 1, status: "active" });
  });

  it("with the freeze not enough for the gap, the run rests", () => {
    const s = computeStreak(run("2026-11-01", 7), "2026-11-11");
    expect(s).toMatchObject({ count: 0, best: 7, status: "resting" });
  });

  it("held freezes survive a restart", () => {
    const acts = [...run("2026-11-01", 7), "2026-11-20"];
    expect(computeStreak(acts, "2026-11-20")).toMatchObject({ count: 1, freezes: 1, best: 7 });
  });

  it("ignores malformed dates and dates in the future", () => {
    const s = computeStreak(["nope", "2026-11-21", "2026-12-01", "2026-11-2"], "2026-11-21");
    expect(s.count).toBe(1);
    expect(s.lastActDate).toBe("2026-11-21");
  });

  it("does not depend on input order", () => {
    const acts = run("2026-11-17", 5);
    expect(computeStreak([...acts].reverse(), "2026-11-21")).toEqual(computeStreak(acts, "2026-11-21"));
  });

  it("works across a month and year boundary", () => {
    const s = computeStreak(["2026-12-30", "2026-12-31", "2027-01-01"], "2027-01-01");
    expect(s.count).toBe(3);
  });
});

describe("helpers", () => {
  it("daysBetween counts calendar days", () => {
    expect(daysBetween("2026-11-20", "2026-11-21")).toBe(1);
    expect(daysBetween("2026-02-28", "2026-03-01")).toBe(1);
    expect(daysBetween("2026-11-21", "2026-11-21")).toBe(0);
  });

  it("localDateKey is the local calendar day", () => {
    expect(localDateKey(new Date(2026, 10, 21, 23, 59))).toBe("2026-11-21");
    expect(localDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("cleanActText trims, collapses spaces, and rejects empty or too-long text", () => {
    expect(cleanActText("  wrote   to a client \n")).toBe("wrote to a client");
    expect(cleanActText("   ")).toBeNull();
    expect(cleanActText("x".repeat(ACT_TEXT_MAX))).not.toBeNull();
    expect(cleanActText("x".repeat(ACT_TEXT_MAX + 1))).toBeNull();
  });
});

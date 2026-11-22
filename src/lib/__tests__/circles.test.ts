import { describe, expect, it } from "vitest";
import {
  KIND_DEFAULTS,
  canMarkCame,
  canRun,
  dateRailLabel,
  defaultWhen,
  formatClock,
  formatTimeRange,
  groupByDay,
  hasEnded,
  isHost,
  joinState,
  kindOf,
  mondayOf,
  moonMark,
  nextWeekday,
  periodFromSearch,
  seriesDates,
  shouldAskKeepGoing,
  splitByPeriod,
  splitCircleLinks,
  stripCircleLinks,
  statusPill,
  validLine,
  validStep,
  visibilityFromColumn,
  visibilityToColumn,
  zonedInstant,
  zoneLongLabel,
  type CircleLike,
} from "@/lib/circles";

const circle = (over: Partial<CircleLike> = {}): CircleLike => ({
  id: "c1",
  event_date: "2026-11-24",
  event_time: "19:00:00",
  end_time: "20:30:00",
  timezone: "America/Mazatlan",
  capacity: null,
  requires_approval: false,
  cancelled_at: null,
  host_id: "host",
  created_by: "host",
  cohost_id: null,
  ...over,
});

describe("defaults by kind (S2, S7)", () => {
  it("matches the spec", () => {
    expect(KIND_DEFAULTS.mastermind).toEqual({ capacity: 8, requiresApproval: true, repeat: "weekly" });
    expect(KIND_DEFAULTS.practice).toEqual({ capacity: null, requiresApproval: false, repeat: "never" });
    expect(KIND_DEFAULTS.dinner).toEqual({ capacity: 10, requiresApproval: true, repeat: "never" });
    expect(KIND_DEFAULTS.gathering).toEqual({ capacity: null, requiresApproval: false, repeat: "never" });
    // Weekly circle: ask to join on, repeats weekly, "Best with 5 to 12" is not enforced
    expect(KIND_DEFAULTS.weekly_circle).toEqual({ capacity: null, requiresApproval: true, repeat: "weekly" });
  });

  it("treats events from before circles as gatherings", () => {
    expect(kindOf(undefined)).toBe("gathering");
    expect(kindOf(null)).toBe("gathering");
    expect(kindOf("workshop")).toBe("gathering");
    expect(kindOf("dinner")).toBe("dinner");
  });
});

describe("visibility maps onto the existing column", () => {
  it("Village is public, Link only is private", () => {
    expect(visibilityToColumn("village")).toBe("public");
    expect(visibilityToColumn("link")).toBe("private");
    expect(visibilityFromColumn("private")).toBe("link");
    expect(visibilityFromColumn("public")).toBe("village");
    expect(visibilityFromColumn(null)).toBe("village");
  });
});

describe("dates", () => {
  it("start time is the next full hour, end is +90 min", () => {
    const d = defaultWhen(new Date(2026, 10, 22, 14, 20));
    expect(d).toEqual({ date: "2026-11-22", start: "15:00", end: "16:30" });
    const late = defaultWhen(new Date(2026, 10, 22, 23, 10));
    expect(late.date).toBe("2026-11-23");
    expect(late.start).toBe("00:00");
  });

  it("finds the next Sunday and the Monday of a week", () => {
    expect(nextWeekday(new Date(2026, 10, 22, 9), 0)).toBe("2026-11-22"); // Sunday itself
    expect(nextWeekday(new Date(2026, 10, 23, 9), 0)).toBe("2026-11-29");
    expect(mondayOf("2026-11-22")).toBe("2026-11-16"); // Sunday belongs to the week that began Monday 16th
    expect(mondayOf("2026-11-23")).toBe("2026-11-23");
  });

  it("labels as the spec writes them", () => {
    expect(dateRailLabel("2026-11-24")).toBe("Nov 24 · Tuesday");
    expect(formatClock("19:00:00")).toBe("7:00 PM");
    expect(formatClock("00:30")).toBe("12:30 AM");
    expect(formatTimeRange("19:00:00", "20:30:00", "America/Mazatlan", "2026-11-24")).toBe("7:00 PM – 8:30 PM GMT-7");
  });

  it("converts a wall time in a zone to the right instant", () => {
    // 19:00 in Mazatlan (UTC-7, no DST in Nov) = 02:00 UTC next day
    expect(new Date(zonedInstant("2026-11-24", "19:00", "America/Mazatlan")).toISOString()).toBe("2026-11-25T02:00:00.000Z");
    expect(new Date(zonedInstant("2026-11-24", "19:00", "UTC")).toISOString()).toBe("2026-11-24T19:00:00.000Z");
    expect(zoneLongLabel("America/Mazatlan", Date.UTC(2026, 10, 24))).toBe("GMT-07:00 Mazatlan");
  });
});

describe("repeating (S2)", () => {
  it("never is one meeting; weekly puts 4 in the Café", () => {
    expect(seriesDates("2026-11-22", "never")).toEqual(["2026-11-22"]);
    expect(seriesDates("2026-11-22", "weekly")).toEqual(["2026-11-22", "2026-11-29", "2026-12-06", "2026-12-13"]);
    expect(seriesDates("2026-11-22", "biweekly")).toEqual(["2026-11-22", "2026-12-06", "2026-12-20", "2027-01-03"]);
  });

  it("monthly keeps the day, clamped to short months", () => {
    expect(seriesDates("2026-01-31", "monthly")).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30"]);
  });

  it("moon repeats land on days that carry the moon mark, about a cycle apart", () => {
    const dates = seriesDates("2026-11-24", "full_moon");
    expect(dates).toHaveLength(4);
    for (const d of dates.slice(1)) expect(moonMark(d)).toBe("full");
    const gap = (new Date(dates[1]).getTime() - new Date(dates[0]).getTime()) / 86400000;
    expect(gap).toBeGreaterThan(0);
    const news = seriesDates("2026-11-24", "new_moon");
    for (const d of news.slice(1)) expect(moonMark(d)).toBe("new");
  });

  it("marks a full-moon day on the calendar", () => {
    // the full moon of 2026-11-24 (UTC 14:53)
    expect(moonMark("2026-11-24")).toBe("full");
    expect(moonMark("2026-11-17")).not.toBe("full");
  });
});

describe("who is who", () => {
  it("host and co-host run the circle; the host starts as the creator", () => {
    const c = circle({ host_id: null, created_by: "creator", cohost_id: "co" });
    expect(isHost(c, "creator")).toBe(true);
    expect(isHost(c, "co")).toBe(false);
    expect(canRun(c, "co")).toBe(true);
    expect(canRun(c, "guest")).toBe(false);
    expect(canRun(c, null)).toBe(false);
  });
});

describe("the came window (S4, S5)", () => {
  const start = zonedInstant("2026-11-24", "19:00", "America/Mazatlan");
  it("opens at the start time and closes 7 days after", () => {
    expect(canMarkCame(circle(), start - 1000)).toBe(false);
    expect(canMarkCame(circle(), start)).toBe(true);
    expect(canMarkCame(circle(), start + 6 * 86400000)).toBe(true);
    expect(canMarkCame(circle(), start + 7 * 86400000 + 1000)).toBe(false);
  });
  it("is closed for a cancelled circle", () => {
    expect(canMarkCame(circle({ cancelled_at: "2026-11-23T00:00:00Z" }), start + 1000)).toBe(false);
  });
  it("knows when a circle has ended", () => {
    expect(hasEnded(circle(), start + 60 * 60000)).toBe(false);
    expect(hasEnded(circle(), start + 91 * 60000)).toBe(true);
  });
});

describe("join card (S3)", () => {
  const before = zonedInstant("2026-11-20", "10:00", "America/Mazatlan");
  const after = zonedInstant("2026-11-25", "10:00", "America/Mazatlan");
  it("open → Join; ask → Ask to join; full → write to the host", () => {
    expect(joinState({ circle: circle(), myStatus: null, goingCount: 2, now: before })).toBe("open");
    expect(joinState({ circle: circle({ requires_approval: true }), myStatus: null, goingCount: 2, now: before })).toBe("ask");
    expect(joinState({ circle: circle({ capacity: 3 }), myStatus: null, goingCount: 3, now: before })).toBe("full");
    expect(joinState({ circle: circle({ capacity: 3 }), myStatus: null, goingCount: 2, now: before })).toBe("open");
  });
  it("shows my own state before anything else", () => {
    expect(joinState({ circle: circle({ capacity: 1 }), myStatus: "going", goingCount: 1, now: before })).toBe("joined");
    expect(joinState({ circle: circle(), myStatus: "asked", goingCount: 0, now: before })).toBe("asked");
    expect(joinState({ circle: circle(), myStatus: "declined", goingCount: 0, now: before })).toBe("declined");
  });
  it("no joining after the end, none when cancelled", () => {
    expect(joinState({ circle: circle(), myStatus: null, goingCount: 0, now: after })).toBe("ended");
    expect(joinState({ circle: circle({ cancelled_at: "x" }), myStatus: "going", goingCount: 0, now: before })).toBe("cancelled");
  });
});

describe("pills and numbers", () => {
  it("only Going, Asked, Came: a plain maybe shows nothing", () => {
    expect(statusPill({ status: "going", came: false })).toBe("Going");
    expect(statusPill({ status: "asked", came: false })).toBe("Asked");
    expect(statusPill({ status: "going", came: true })).toBe("Came");
    expect(statusPill({ status: "maybe", came: false })).toBeNull();
    expect(statusPill(null)).toBeNull();
  });
});

describe("Upcoming / Past (S1)", () => {
  const now = zonedInstant("2026-11-24", "12:00", "America/Mazatlan");
  const list = [
    circle({ id: "past", event_date: "2026-11-20" }),
    circle({ id: "soon", event_date: "2026-11-25" }),
    circle({ id: "later", event_date: "2026-12-01" }),
    circle({ id: "earlier-past", event_date: "2026-11-10" }),
  ];
  it("splits and orders", () => {
    expect(splitByPeriod(list, "upcoming", now).map((c) => c.id)).toEqual(["soon", "later"]);
    expect(splitByPeriod(list, "past", now).map((c) => c.id)).toEqual(["past", "earlier-past"]);
  });
  it("reads the period from the URL", () => {
    expect(periodFromSearch("?period=past")).toBe("past");
    expect(periodFromSearch("")).toBe("upcoming");
    expect(periodFromSearch("?period=nonsense")).toBe("upcoming");
  });
  it("groups rows by day for the date rail", () => {
    const rows = [circle({ id: "a" }), circle({ id: "b" }), circle({ id: "c", event_date: "2026-11-25" })];
    const groups = groupByDay(rows);
    expect(groups.map((g) => [g.date, g.circles.map((c) => c.id)])).toEqual([
      ["2026-11-24", ["a", "b"]],
      ["2026-11-25", ["c"]],
    ]);
  });
});

describe("quality: Keep it going? (§6)", () => {
  it("asks only after 3 meetings with nobody marked came", () => {
    expect(shouldAskKeepGoing([0, 0])).toBe(false);
    expect(shouldAskKeepGoing([0, 0, 0])).toBe(true);
    expect(shouldAskKeepGoing([2, 0, 0, 0])).toBe(true);
    expect(shouldAskKeepGoing([0, 0, 1])).toBe(false);
  });
});

describe("one line and one step", () => {
  it("a line is 1 to 200 characters", () => {
    expect(validLine("  Quiet is a skill.  ")).toBe("Quiet is a skill.");
    expect(validLine("   ")).toBeNull();
    expect(validLine("x".repeat(200))).toHaveLength(200);
    expect(validLine("x".repeat(201))).toBeNull();
  });
  it("a step needs both lines, each one line", () => {
    expect(validStep("Walk 20 min", "Walked on 5 days")).toEqual({ step: "Walk 20 min", doneWhen: "Walked on 5 days" });
    expect(validStep("Walk", "")).toBeNull();
    expect(validStep("", "x")).toBeNull();
    expect(validStep("two\nlines", "x")).toBeNull();
    expect(validStep("x".repeat(201), "x")).toBeNull();
  });
});

describe("circle links in inbox notes", () => {
  const id = "0f8fad5b-d9cb-469f-a165-70867728950e";
  it("turns a circle path into a link and keeps the words", () => {
    const parts = splitCircleLinks(`Take the circle: /game/meet/${id}`);
    expect(parts).toEqual([{ text: "Take the circle: " }, { text: "Open the circle", to: `/game/meet/${id}` }]);
    expect(splitCircleLinks(`A step. /game/meet/${id}/manage`).at(-1)?.to).toBe(`/game/meet/${id}/manage`);
  });
  it("leaves ordinary messages alone", () => {
    expect(splitCircleLinks("See you at /game/meet soon")).toEqual([{ text: "See you at /game/meet soon" }]);
  });
  it("strips the path for a one-line preview", () => {
    expect(stripCircleLinks(`Dinner is tomorrow. /game/meet/${id}`)).toBe("Dinner is tomorrow.");
  });
});

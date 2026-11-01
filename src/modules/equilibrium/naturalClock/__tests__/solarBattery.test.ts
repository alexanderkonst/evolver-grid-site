import { describe, expect, it } from "vitest";
import { parseBirthdayParts, solarBattery } from "../solarBattery";

// Local noon, so the calendar day is the same in any timezone.
const on = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

describe("parseBirthdayParts", () => {
  it("reads a real date", () => {
    expect(parseBirthdayParts("1990-03-25")).toEqual({ month: 3, day: 25 });
    expect(parseBirthdayParts("1992-02-29")).toEqual({ month: 2, day: 29 });
  });
  it.each([null, undefined, "", "soon", "1990-02-30", "1991-02-29", "1990-13-01", "25.03.1990"])(
    "rejects %s",
    (bad) => {
      expect(parseBirthdayParts(bad)).toBeNull();
    },
  );
});

describe("solarBattery", () => {
  it("returns null without a usable birthday", () => {
    expect(solarBattery(on(2026, 11, 1), null)).toBeNull();
    expect(solarBattery(on(2026, 11, 1), "not-a-date")).toBeNull();
  });

  it("counts days and the remaining share of the year", () => {
    // 1 Nov 2026 → 25 Mar 2027 is 144 days; the year 25 Mar 2026 → 25 Mar 2027 is 365.
    const b = solarBattery(on(2026, 11, 1), "1990-03-25")!;
    expect(b.daysToNext).toBe(144);
    expect(b.yearLength).toBe(365);
    expect(b.battery).toBeCloseTo(144 / 365, 10);
    expect(b.percent).toBe(39);
    expect(b.elapsed).toBeCloseTo(1 - 144 / 365, 10);
    expect(b.isBirthdayToday).toBe(false);
  });

  describe("birthday today", () => {
    it("is a full battery at 0 days, flagged", () => {
      const b = solarBattery(on(2026, 11, 1), "1990-11-01")!;
      expect(b).toMatchObject({
        daysToNext: 0,
        battery: 1,
        percent: 100,
        elapsed: 0,
        yearLength: 365,
        isBirthdayToday: true,
      });
    });
    it("ignores the time of day", () => {
      expect(solarBattery(new Date(2026, 10, 1, 0, 0, 1), "1990-11-01")!.isBirthdayToday).toBe(true);
      expect(solarBattery(new Date(2026, 10, 1, 23, 59, 59), "1990-11-01")!.isBirthdayToday).toBe(true);
    });
  });

  it("is nearly full the day after, nearly empty the eve before", () => {
    const after = solarBattery(on(2026, 11, 2), "1990-11-01")!;
    expect(after.daysToNext).toBe(364);
    expect(after.battery).toBeCloseTo(364 / 365, 10);
    expect(after.isBirthdayToday).toBe(false);

    const eve = solarBattery(on(2026, 11, 1), "1990-11-02")!;
    expect(eve.daysToNext).toBe(1);
    expect(eve.battery).toBeCloseTo(1 / 365, 10);
    expect(eve.percent).toBe(0);
  });

  it("crosses the new-year boundary", () => {
    expect(solarBattery(on(2026, 12, 31), "1990-01-05")!.daysToNext).toBe(5);
    expect(solarBattery(on(2026, 1, 1), "1990-01-05")!.daysToNext).toBe(4);
  });

  describe("Feb 29 birthday", () => {
    const bd = "1992-02-29";
    it("falls on Mar 1 in a common year, matching the Solar bar", () => {
      const eve = solarBattery(on(2027, 2, 28), bd)!;
      expect(eve.daysToNext).toBe(1);
      expect(eve.yearLength).toBe(365);
      expect(solarBattery(on(2027, 3, 1), bd)!.isBirthdayToday).toBe(true);
    });
    it("falls on Feb 29 in a leap year", () => {
      expect(solarBattery(on(2028, 2, 28), bd)!.daysToNext).toBe(1);
      const today = solarBattery(on(2028, 2, 29), bd)!;
      expect(today.isBirthdayToday).toBe(true);
      // Feb 29 2028 → Mar 1 2029 (the common-year stand-in) is 366 days.
      expect(today.yearLength).toBe(366);
    });
    it("counts from the Mar 1 stand-in toward the leap day", () => {
      // Mar 1 2027 → Feb 29 2028 is 365 days; 100 days after Mar 1 2027 → 265 left.
      const b = solarBattery(on(2027, 6, 9), bd)!;
      expect(b.yearLength).toBe(365);
      expect(b.daysToNext).toBe(265);
    });
  });

  it("drains by a little every day for a full year, then refills", () => {
    let prev = 1;
    const start = new Date(2026, 10, 2, 12);
    for (let i = 0; i < 364; i++) {
      const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i, 12);
      const b = solarBattery(day, "1990-11-01")!;
      expect(b.battery).toBeLessThan(prev);
      prev = b.battery;
    }
    // 2 Nov 2026 + 364 days = 1 Nov 2027.
    const refill = solarBattery(new Date(2027, 10, 1, 12), "1990-11-01")!;
    expect(refill.isBirthdayToday).toBe(true);
    expect(refill.battery).toBe(1);
  });
});

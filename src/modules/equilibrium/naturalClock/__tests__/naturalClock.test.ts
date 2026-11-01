import { describe, expect, it } from "vitest";
import { computeNaturalClock, yearLine } from "../naturalClock";
import { solarBattery } from "../solarBattery";

const BERLIN = { lat: 52.5, lon: 13.4, source: "device" as const };

describe("yearLine", () => {
  const on = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);
  it("is null without a birthday", () => {
    expect(yearLine(null)).toBeNull();
  });
  it("counts days, singular on the eve", () => {
    expect(yearLine(solarBattery(on(2026, 11, 1), "1990-03-25"))).toBe("144 days to your new year");
    expect(yearLine(solarBattery(on(2026, 11, 1), "1990-11-02"))).toBe("1 day to your new year");
  });
  it("greets the birthday", () => {
    expect(yearLine(solarBattery(on(2026, 11, 1), "1990-11-01"))).toBe("Your new year begins today");
  });
});

describe("computeNaturalClock", () => {
  // Thursday 5 Nov 2026, local noon.
  const now = new Date(2026, 10, 5, 12);

  it("puts the four clocks in one sentence", () => {
    const clock = computeNaturalClock({ now, geo: BERLIN, birthday: "1990-03-25" });
    expect(clock.week.dayName).toBe("Thursday");
    expect(clock.year?.daysToNext).toBe(140);
    expect(clock.sentence.startsWith("You are here: ")).toBe(true);
    expect(clock.sentence).toContain(clock.light.state);
    expect(clock.sentence).toContain(`${clock.moon.phaseName}, ${clock.moon.daysToNext}d`);
    expect(clock.sentence).toContain("Thursday, expand");
    expect(clock.sentence).toContain("140 days to your new year");
  });

  it("drops the year when no birthday is known", () => {
    const clock = computeNaturalClock({ now, geo: BERLIN, birthday: null });
    expect(clock.year).toBeNull();
    expect(clock.yearLine).toBeNull();
    expect(clock.sentence).not.toContain("new year");
  });

  it("carries a sky palette that matches the light", () => {
    const clock = computeNaturalClock({ now, geo: BERLIN, birthday: null });
    expect(clock.sky.top).toMatch(/^#[0-9a-f]{6}$/);
    expect(clock.sky.bottom).toMatch(/^#[0-9a-f]{6}$/);
  });
});

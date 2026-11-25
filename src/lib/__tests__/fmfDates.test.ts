import { describe, expect, it } from "vitest";
import { FMF_DATES, fmfLiveWindows, formatFmfDates, nextFmfDates } from "@/data/fmfSession";
import { getLunarState } from "@/lib/equilibrium-cycles";

/** Weekday of a YYYY-MM-DD civil date (0 = Sunday), no timezone involved. */
const weekday = (ymd: string) => new Date(`${ymd}T12:00:00Z`).getUTCDay();
const civil = (iso: string) => iso.slice(0, 10);
const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

describe("FMF dates (Sasha 2026-11-24): first Monday on/after the new moon + the Wednesday after", () => {
  it("lists six lunar cycles, in order", () => {
    expect(FMF_DATES).toHaveLength(6);
    for (let i = 1; i < FMF_DATES.length; i++) expect(FMF_DATES[i].monday > FMF_DATES[i - 1].wednesday).toBe(true);
  });

  it.each(FMF_DATES.map((d) => [d.monday, d]))("%s is a Monday, its Wednesday two days later", (_m, d) => {
    expect(weekday(d.monday)).toBe(1);
    expect(weekday(d.wednesday)).toBe(3);
    expect(daysBetween(d.monday, d.wednesday)).toBe(2);
  });

  it.each(FMF_DATES.map((d) => [d.monday, d]))("%s is the first Monday on or after its new moon (Mexico City)", (_m, d) => {
    const gap = daysBetween(civil(d.newMoon), d.monday);
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThan(7);
  });

  it.each(FMF_DATES.map((d) => [d.newMoon, d]))("the app's own lunar math agrees: %s opens Clearing (new moon)", (_n, d) => {
    // A few hours after the stated new moon the app is in its first segment (New Moon → Clearing).
    expect(getLunarState(Date.parse(d.newMoon) + 3 * 3_600_000).segmentIndex).toBe(0);
    // A few hours before, it is still in the last segment of the previous cycle.
    expect(getLunarState(Date.parse(d.newMoon) - 3 * 3_600_000).segmentIndex).toBe(7);
  });

  it("formats and windows the dates", () => {
    expect(formatFmfDates(FMF_DATES[0])).toBe("Mon Dec 14 + Wed Dec 16, 2026");
    expect(fmfLiveWindows()[0]).toEqual({ from: "2026-12-14T00:00:00-06:00", until: "2026-12-17T00:00:00-06:00" });
    expect(nextFmfDates(new Date("2026-11-24T12:00:00-06:00")).monday).toBe("2026-12-14");
    expect(nextFmfDates(new Date("2026-12-17T00:00:01-06:00")).monday).toBe("2027-01-11");
  });
});

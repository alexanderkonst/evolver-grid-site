import { describe, expect, it } from "vitest";
import { FMF_DATES, fmfLiveWindows, formatFmfDates, nextFmfDates } from "@/data/fmfSession";
import { getLunarState } from "@/lib/equilibrium-cycles";

/** Weekday of a YYYY-MM-DD civil date (0 = Sunday), no timezone involved. */
const weekday = (ymd: string) => new Date(`${ymd}T12:00:00Z`).getUTCDay();
const civil = (iso: string) => iso.slice(0, 10);
const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

describe("FMF dates (Sasha 2026-11-24): first Monday on/after the Last Quarter (Planning, new Equilibrium cycle) + the Wednesday after", () => {
  it("lists six lunar cycles, in order", () => {
    expect(FMF_DATES).toHaveLength(6);
    for (let i = 1; i < FMF_DATES.length; i++) expect(FMF_DATES[i].monday > FMF_DATES[i - 1].wednesday).toBe(true);
  });

  it.each(FMF_DATES.map((d) => [d.monday, d]))("%s is a Monday, its Wednesday two days later", (_m, d) => {
    expect(weekday(d.monday)).toBe(1);
    expect(weekday(d.wednesday)).toBe(3);
    expect(daysBetween(d.monday, d.wednesday)).toBe(2);
  });

  it.each(FMF_DATES.map((d) => [d.monday, d]))("%s is the first Monday on or after its Last Quarter (Mexico City)", (_m, d) => {
    const gap = daysBetween(civil(d.lastQuarter), d.monday);
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThan(7);
  });

  it.each(FMF_DATES.map((d) => [d.lastQuarter, d]))("the app's own lunar math agrees: %s opens Planning (Last Quarter)", (_n, d) => {
    // Within 3 hours after the stated Last Quarter the app is in segment 6 (Last Quarter → Planning).
    expect(getLunarState(Date.parse(d.lastQuarter) + 3 * 3_600_000).segmentIndex).toBe(6);
    // Within 3 hours before, it is still in segment 5 (Waning Gibbous → Celebrating).
    expect(getLunarState(Date.parse(d.lastQuarter) - 3 * 3_600_000).segmentIndex).toBe(5);
  });

  it("lists the dates re-based on the Last Quarter (Sasha 2026-11-24)", () => {
    expect(FMF_DATES.map((d) => [d.monday, d.wednesday])).toEqual([
      ["2026-12-07", "2026-12-09"],
      ["2027-01-04", "2027-01-06"],
      ["2027-02-01", "2027-02-03"],
      ["2027-03-01", "2027-03-03"],
      ["2027-03-29", "2027-03-31"],
      ["2027-05-03", "2027-05-05"],
    ]);
  });

  it("formats and windows the dates", () => {
    expect(formatFmfDates(FMF_DATES[0])).toBe("Mon Dec 7 + Wed Dec 9, 2026");
    expect(fmfLiveWindows()[0]).toEqual({ from: "2026-12-07T00:00:00-06:00", until: "2026-12-10T00:00:00-06:00" });
    expect(nextFmfDates(new Date("2026-11-24T12:00:00-06:00")).monday).toBe("2026-12-07");
    expect(nextFmfDates(new Date("2026-12-09T23:59:00-06:00")).monday).toBe("2026-12-07");
    expect(nextFmfDates(new Date("2026-12-10T00:00:00-06:00")).monday).toBe("2027-01-04");
  });
});

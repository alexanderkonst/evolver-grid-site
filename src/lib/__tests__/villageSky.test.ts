import { describe, expect, it } from "vitest";
import { REFERENCE_NEW_MOON_UTC_MS } from "@/lib/equilibrium-cycles";
import { getVillageSky, VILLAGE_SKY_MOODS } from "../villageSky";

const HOUR = 3_600_000;
const utc = (iso: string) => Date.parse(iso);

describe("getVillageSky", () => {
  it("reads new moon at the attested reference instant (2000-01-06 18:14 UTC)", () => {
    const sky = getVillageSky(REFERENCE_NEW_MOON_UTC_MS + HOUR);
    expect(sky.phase).toBe("new");
    expect(sky.illumination).toBeLessThan(0.01);
    expect(sky.mood).toBe("New moon. A night for letting go.");
  });

  // Astronomical new moon 2026-01-18 ~19:52 UTC; sampled a day after, well inside the window.
  it("is new and nearly dark just after the January 2026 new moon", () => {
    const sky = getVillageSky(utc("2026-01-20T00:00:00Z"));
    expect(sky.phase).toBe("new");
    expect(sky.illumination).toBeLessThan(0.05);
    expect(sky.mood).toBe("New moon. A night for letting go.");
  });

  // Astronomical full moon 2026-01-03 ~10:03 UTC; sampled a day after.
  it("is full and nearly bright just after the January 2026 full moon", () => {
    const sky = getVillageSky(utc("2026-01-04T12:00:00Z"));
    expect(sky.phase).toBe("full");
    expect(sky.illumination).toBeGreaterThan(0.95);
    expect(sky.mood).toBe("Full moon. Harvest.");
  });

  it("is waxing between new and full", () => {
    // First quarter ~2026-01-26.
    const sky = getVillageSky(utc("2026-01-27T12:00:00Z"));
    expect(sky.phase).toBe("waxing");
    expect(sky.cycle).toBeLessThan(0.5);
    expect(sky.mood).toBe("The moon is growing. Build.");
  });

  it("is waning between full and new", () => {
    // Last quarter ~2026-01-10.
    const sky = getVillageSky(utc("2026-01-12T12:00:00Z"));
    expect(sky.phase).toBe("waning");
    expect(sky.cycle).toBeGreaterThan(0.5);
    expect(sky.mood).toBe("The moon wanes. Digest.");
  });

  it("brightens through the waxing half and dims through the waning half", () => {
    const start = utc("2026-01-20T00:00:00Z"); // just after new
    const lit = [0, 3, 6, 9, 12].map((d) => getVillageSky(start + d * 24 * HOUR).illumination);
    for (let i = 1; i < lit.length; i++) expect(lit[i]).toBeGreaterThan(lit[i - 1]);

    const full = utc("2026-01-04T12:00:00Z"); // just after full
    const dim = [0, 3, 6, 9, 12].map((d) => getVillageSky(full + d * 24 * HOUR).illumination);
    for (let i = 1; i < dim.length; i++) expect(dim[i]).toBeLessThan(dim[i - 1]);
  });

  it("keeps illumination within 0..1 and the cycle within 0..1 across a year", () => {
    const start = utc("2026-01-01T00:00:00Z");
    for (let h = 0; h < 365 * 24; h += 7) {
      const sky = getVillageSky(start + h * HOUR);
      expect(sky.illumination).toBeGreaterThanOrEqual(0);
      expect(sky.illumination).toBeLessThanOrEqual(1);
      expect(sky.cycle).toBeGreaterThanOrEqual(0);
      expect(sky.cycle).toBeLessThan(1);
    }
  });

  it("accepts a Date as well as a timestamp", () => {
    const at = utc("2026-01-04T12:00:00Z");
    expect(getVillageSky(new Date(at))).toEqual(getVillageSky(at));
  });

  it("never puts a digit in the line", () => {
    for (const line of Object.values(VILLAGE_SKY_MOODS)) {
      expect(line).not.toMatch(/[0-9%]/);
    }
  });
});

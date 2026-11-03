import { describe, expect, it } from "vitest";
import { getVillageSky } from "@/lib/villageSky";

/**
 * Village-as-dashboard step 4: the sky over the map follows the real moon, computed in the
 * browser (getLunarState, no API). Pinned to the published November 2026 lunar phases
 * (UTC): last quarter Nov 1 20:28, new moon Nov 9 07:02, first quarter Nov 17 11:48,
 * full moon Nov 24 14:53.
 */
const at = (iso: string) => getVillageSky(new Date(iso));

describe("village sky follows tonight's real moon (Nov 2026)", () => {
  it("last quarter: half lit, waning (lit limb on the left)", () => {
    const s = at("2026-11-01T20:28:00Z");
    expect(s.illumination).toBeCloseTo(0.5, 1);
    expect(s.cycle).toBeGreaterThan(0.5);
    expect(s.phase).toBe("waning");
  });
  it("the night of Nov 2–3: a waning crescent, about a third lit", () => {
    const s = at("2026-11-03T07:00:00Z");
    expect(s.illumination).toBeGreaterThan(0.25);
    expect(s.illumination).toBeLessThan(0.45);
    expect(s.phase).toBe("waning");
    // crescent: the terminator ellipse is narrower than the disc and dark over the lit half
    expect(Math.cos(s.cycle * 2 * Math.PI)).toBeGreaterThan(0);
  });
  it("new moon: dark sky, darkest veil", () => {
    const s = at("2026-11-09T08:00:00Z");
    expect(s.illumination).toBeLessThan(0.01);
    expect(s.phase).toBe("new");
  });
  it("first quarter: half lit, waxing", () => {
    const s = at("2026-11-17T11:48:00Z");
    expect(s.illumination).toBeCloseTo(0.5, 1);
    expect(s.cycle).toBeLessThan(0.5);
  });
  it("full moon: bright sky, no veil", () => {
    const s = at("2026-11-24T15:00:00Z");
    expect(s.illumination).toBeGreaterThan(0.99);
    expect(s.phase).toBe("full");
  });
});

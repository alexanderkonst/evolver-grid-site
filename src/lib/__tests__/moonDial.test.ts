import { describe, expect, it } from "vitest";
import { DIAL_SECTORS, moonDialNow } from "@/lib/moonDial";

describe("moon dial", () => {
  it("has the eight phases in Sasha's order, four BE and four DO", () => {
    expect(DIAL_SECTORS.map((s) => s.name)).toEqual([
      "Planning", "Planting", "Clearing", "Gathering", "Seeing", "Leading", "Harvesting", "Celebrating",
    ]);
    expect(DIAL_SECTORS.filter((s) => s.beDo === "be").map((s) => s.name)).toEqual([
      "Planting", "Clearing", "Gathering", "Seeing",
    ]);
  });
  it("reads tonight's sector from the real moon", () => {
    // 2026-11-03 00:00 UTC: past the last quarter of Nov 1 → Planning.
    expect(moonDialNow(Date.UTC(2026, 10, 3)).sector.name).toBe("Planning");
    // 2026-11-10 12:00 UTC: just after the new moon of Nov 9 → Clearing.
    expect(moonDialNow(Date.UTC(2026, 10, 10, 12)).sector.name).toBe("Clearing");
  });
});

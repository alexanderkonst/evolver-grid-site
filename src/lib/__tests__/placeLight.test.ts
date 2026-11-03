import { describe, expect, it } from "vitest";
import { placeLight, placeSignalKey } from "@/lib/placeLight";
import { emptyPlaceSave, type PlaceInput } from "@/lib/placeState";

const house: PlaceInput = { line: "", rule: { opens: "find-top-talent", steps: ["discover-mission", "assess-qol"] } };
const cafe: PlaceInput = { line: "", rule: {} };
const save = (met: Record<string, boolean>) => ({ ...emptyPlaceSave(new Date("2026-11-03T12:00:00Z")), met });

describe("window light", () => {
  it("closed places stay dark", () => {
    expect(placeLight(house, "closed", save({}))).toBe("dark");
  });
  it("next, live, new and the lit house glow brightest", () => {
    expect(placeLight(house, "next", save({}))).toBe("bright");
    expect(placeLight(cafe, "live", save({}))).toBe("bright");
    expect(placeLight(cafe, "open", save({}), { isNew: true })).toBe("bright");
    expect(placeLight(house, "done", save({}), { houseLit: true })).toBe("bright");
  });
  it("an open place with an unfinished step is lit, and says so", () => {
    const s = save({ "find-top-talent": true, "discover-mission": true });
    expect(placeLight(house, "open", s)).toBe("lit");
    expect(placeSignalKey("lit", "open")).toBe("unfinished");
  });
  it("open with nothing waiting, or done, is quiet", () => {
    expect(placeLight(cafe, "open", save({}))).toBe("quiet");
    expect(placeLight(house, "done", save({ "discover-mission": true, "assess-qol": true }))).toBe("quiet");
    expect(placeSignalKey("quiet", "open")).toBeNull();
  });
});

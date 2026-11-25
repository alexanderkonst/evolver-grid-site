import { describe, expect, it } from "vitest";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { groupByQuarter, litQuarters, quarterName } from "../quarters";
import { emptyPlaceSave, placeState, type PlaceSave } from "../placeState";
import { RAIL_PLACES, railState } from "../railPlaces";

const save = (met: PlaceSave["met"] = {}): PlaceSave => ({
  ...emptyPlaceSave(new Date("2026-11-25T12:00:00-07:00")),
  met,
});

describe("quarters (§25.14)", () => {
  it("groups the rail by quarter and keeps the order inside each quarter", () => {
    expect(RAIL_PLACES.map((p) => p.element)).toEqual([
      "ether", "ether", "ether", "air", "water", "water", "fire", "fire", "earth", "earth", "earth",
    ]);
    expect(RAIL_PLACES.map((p) => p.key)).toEqual([
      "reception", "house", "quest-board", "oracle", "cafe", "coworking", "fire-circle", "academy", "workshop", "market", "town-hall",
    ]);
    const shuffled = [...VILLAGE_PLACES].reverse();
    const grouped = groupByQuarter(shuffled);
    expect(grouped.map((p) => p.element)).toEqual(RAIL_PLACES.map((p) => p.element));
    expect(grouped.filter((p) => p.element === "earth").map((p) => p.key)).toEqual(["town-hall", "market", "workshop"]);
  });

  it("reads a place's state by key, whatever the rail order", () => {
    const states = VILLAGE_PLACES.map((p) => p.key);
    for (const p of RAIL_PLACES) expect(railState(states, p.key)).toBe(p.key);
    expect(railState(undefined, "oracle")).toBeUndefined();
  });

  it("lights a solid once the first place of its quarter is open; air is lit for everyone", () => {
    const states = VILLAGE_PLACES.map((p) => placeState(p, save()));
    expect(litQuarters(VILLAGE_PLACES, states).air).toBe(true);
    // the Workshop opens with the mission; before it, the earth quarter is only an outline
    expect(litQuarters(VILLAGE_PLACES, states).earth).toBe(false);
    const earned = VILLAGE_PLACES.map((p) => placeState(p, save({ "discover-mission": true, "find-top-talent": true })));
    expect(litQuarters(VILLAGE_PLACES, earned).earth).toBe(true);
  });

  it("lights nothing from an empty or all-closed read", () => {
    expect(Object.values(litQuarters(VILLAGE_PLACES, [])).some(Boolean)).toBe(false);
    expect(Object.values(litQuarters(VILLAGE_PLACES, VILLAGE_PLACES.map(() => "closed"))).some(Boolean)).toBe(false);
  });

  it("names a sign «<Element> quarter»", () => {
    expect(quarterName("ether")).toBe("Ether quarter");
    expect(quarterName("earth")).toBe("Earth quarter");
  });
});

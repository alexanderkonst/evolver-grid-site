import { describe, expect, it } from "vitest";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { activePlaceKey, PANE_BY_PLACE, RAIL_PLACES, tourIdFor } from "../railPlaces";

// WP-4 (issue #161, item 1): the rail is the 11 places of the village map.
describe("rail places", () => {
  it("is the village map: same places, same order, same names", () => {
    expect(RAIL_PLACES.map((p) => p.name)).toEqual([
      "Reception",
      "Your House",
      "Quest Board",
      "Oracle",
      "Café",
      "Co-working",
      "Fire Circle",
      "Academy",
      "Workshop",
      "Market",
      "Town Hall",
    ]);
    expect(RAIL_PLACES.map((p) => p.key)).toEqual(VILLAGE_PLACES.map((p) => p.key));
  });

  it("gives every place a pane to open", () => {
    for (const p of RAIL_PLACES) expect(PANE_BY_PLACE[p.key]).toBeTruthy();
  });

  it("lights the place whose pane the player is in", () => {
    expect(activePlaceKey("/game/journey", "journey")).toBe("quest-board");
    expect(activePlaceKey("/game/me/overview", "grow")).toBe("house");
    expect(activePlaceKey("/ai-os", "ai-os")).toBe("oracle");
    expect(activePlaceKey("/ubb", "build")).toBe("workshop");
    expect(activePlaceKey("/ignite", "build")).toBe("workshop");
    expect(activePlaceKey("/game/marketplace", "buysell")).toBe("market");
    expect(activePlaceKey("/auth", undefined)).toBeNull();
  });

  it("lets the path decide for places that share a pane", () => {
    expect(activePlaceKey("/zone-of-genius/entry", "journey")).toBe("reception");
    expect(activePlaceKey("/build/mastermind", "build")).toBe("fire-circle");
    expect(activePlaceKey("/game/coop", "build")).toBe("town-hall");
  });

  it("keeps the onboarding tour's old space ids pointing at exactly one chip each", () => {
    const ids = RAIL_PLACES.map((p) => tourIdFor(p.key));
    expect(new Set(ids).size).toBe(ids.length);
    for (const tourTarget of ["grow", "learn", "meet", "collaborate", "build", "buysell"]) {
      expect(ids).toContain(tourTarget);
    }
  });
});

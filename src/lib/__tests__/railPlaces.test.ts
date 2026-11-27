import { describe, expect, it } from "vitest";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { activePlaceKey, isHomePath, PANE_BY_PLACE, RAIL_PLACES, tourIdFor } from "../railPlaces";

// WP-4 (issue #161, item 1): the rail is the village map places that have rail panes.
describe("rail places", () => {
  it("lists the village places in map order, excluding My AI", () => {
    expect(RAIL_PLACES.map((p) => p.name)).toEqual([
      "Entry Portal",
      "Home",
      "Quest Board",
      "Café",
      "Co-working",
      "FMF",
      "Academy",
      "Collective",
      "Market",
      "Town Hall",
    ]);
    expect(RAIL_PLACES.map((p) => p.key)).toEqual(VILLAGE_PLACES.filter((p) => p.key !== "oracle").map((p) => p.key));
  });

  it("gives every place a pane to open", () => {
    for (const p of RAIL_PLACES) expect(PANE_BY_PLACE[p.key]).toBeTruthy();
  });

  it("lights the place whose pane the player is in", () => {
    expect(activePlaceKey("/game/journey", "journey")).toBe("quest-board");
    expect(activePlaceKey("/game/me/overview", "grow")).toBe("house");
    expect(activePlaceKey("/ai-os", "ai-os")).toBeNull();
    expect(activePlaceKey("/ubb", "build")).toBe("workshop");
    expect(activePlaceKey("/ignite", "build")).toBe("workshop");
    expect(activePlaceKey("/game/marketplace", "buysell")).toBe("market");
    expect(activePlaceKey("/auth", undefined)).toBeNull();
  });

  it("lets the path decide for places that share a pane", () => {
    expect(activePlaceKey("/zone-of-genius/entry", "journey")).toBe("reception");
    expect(activePlaceKey("/build/fmf", "build")).toBe("fire-circle");
    expect(activePlaceKey("/game/coop", "build")).toBe("town-hall");
  });

  it("puts Equilibrium, saved artifacts and Settings in Home, and the Cockpit in the Workshop (#443 A3)", () => {
    expect(activePlaceKey("/build/equilibrium", "build")).toBe("house");
    expect(activePlaceKey("/my-artifacts", "journey")).toBe("house");
    expect(activePlaceKey("/game/settings", "journey")).toBe("house");
    expect(activePlaceKey("/settings", undefined)).toBe("house");
    expect(activePlaceKey("/build/cockpit", "build")).toBe("workshop");
    expect(activePlaceKey("/build/cockpit/dashboard", "build")).toBe("workshop");
    expect(isHomePath("/build/equilibrium/anything")).toBe(true);
    expect(isHomePath("/build/equilibrium-x")).toBe(false);
    expect(isHomePath("/ubb")).toBe(false);
  });

  it("keeps the onboarding tour's old space ids pointing at exactly one chip each", () => {
    const ids = RAIL_PLACES.map((p) => tourIdFor(p.key));
    expect(new Set(ids).size).toBe(ids.length);
    for (const tourTarget of ["grow", "learn", "meet", "collaborate", "build", "buysell"]) {
      expect(ids).toContain(tourTarget);
    }
  });
});

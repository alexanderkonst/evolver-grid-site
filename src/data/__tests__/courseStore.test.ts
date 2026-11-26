import { describe, expect, it } from "vitest";
import { COURSE_SALES, courseSalesPath } from "@/data/courseSales";
import { filterTiles, getCourseTiles, tileCategories, tileLevels } from "@/data/courseStore";
import { ACTIVATE_YOUR_DORMANT_POTENTIAL, COURSE_PATH } from "@/data/courses/activateYourDormantPotential";

describe("educational app store data (#524)", () => {
  const tiles = getCourseTiles();

  it("has one tile per course in the course data, nothing else", () => {
    expect(tiles.map((t) => t.slug)).toEqual(COURSE_SALES.map((c) => c.slug));
  });

  it("every tile opens the course landing", () => {
    for (const t of tiles) expect(t.landingPath, t.slug).toBe(courseSalesPath(t.slug));
  });

  it("every tile carries a short name, a tagline, a level and a category", () => {
    for (const t of tiles) {
      expect(t.name.length, t.slug).toBeGreaterThan(0);
      expect(t.tagline.length, t.slug).toBeGreaterThan(0);
      expect(t.level, t.slug).toBeDefined();
      expect(t.category, t.slug).toBeDefined();
    }
  });

  it("ADP: Fundamental, v1.0, an icon, Start opens the course page", () => {
    const adp = tiles.find((t) => t.slug === ACTIVATE_YOUR_DORMANT_POTENTIAL.slug)!;
    expect(adp.level).toBe("Fundamental");
    expect(adp.version).toBe("1.0");
    expect(adp.icon).toBeTruthy();
    expect(adp.startPath).toBe(COURSE_PATH);
  });

  it("a course without a page of its own has no Start", () => {
    expect(tiles.find((t) => t.slug === "founder-academy")!.startPath).toBeUndefined();
  });

  it("filters by level and by category, and combines them", () => {
    const fundamental = filterTiles(tiles, "Fundamental", null);
    expect(fundamental.length).toBeGreaterThan(0);
    expect(fundamental.every((t) => t.level === "Fundamental")).toBe(true);
    expect(filterTiles(tiles, null, null)).toHaveLength(tiles.length);
    expect(filterTiles(tiles, "Advanced", "General").every((t) => t.level === "Advanced" && t.category === "General")).toBe(true);
    expect(filterTiles(tiles, null, "General")).toHaveLength(tiles.length);
  });

  it("filter chips list only the values present", () => {
    expect(tileLevels(tiles)).toContain("Fundamental");
    expect(tileCategories(tiles)).toEqual(["General"]);
  });
});

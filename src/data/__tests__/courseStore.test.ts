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

  it("every tile carries a short name and a tagline", () => {
    for (const t of tiles) {
      expect(t.name.length, t.slug).toBeGreaterThan(0);
      expect(t.tagline.length, t.slug).toBeGreaterThan(0);
    }
  });

  it("level, category and version are the course data's own (#535), one source", () => {
    const withData = COURSE_SALES.filter((c) => c.versioning);
    expect(withData.length).toBeGreaterThan(0);
    for (const c of withData) {
      const t = tiles.find((x) => x.slug === c.slug)!;
      expect(t.level, c.slug).toBe(c.versioning!.level);
      expect(t.category, c.slug).toBe(c.versioning!.category);
      expect(t.version, c.slug).toBe(c.versioning!.version);
    }
    for (const c of COURSE_SALES.filter((x) => !x.versioning)) {
      const t = tiles.find((x) => x.slug === c.slug)!;
      expect([t.level, t.category, t.version], c.slug).toEqual([undefined, undefined, undefined]);
    }
  });

  it("ADP: Fundamental, v1.0, an app icon, Start opens the course page", () => {
    const adp = tiles.find((t) => t.slug === ACTIVATE_YOUR_DORMANT_POTENTIAL.slug)!;
    expect(adp.level).toBe("Fundamental");
    expect(adp.version).toBe("1.0");
    expect(adp.app).toBe("potential");
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
    const combined = filterTiles(tiles, "Advanced", "Mind & Consciousness");
    expect(combined.length).toBeGreaterThan(0);
    expect(combined.every((t) => t.level === "Advanced" && t.category === "Mind & Consciousness")).toBe(true);
    expect(filterTiles(tiles, null, "General").every((t) => t.category === "General")).toBe(true);
  });

  it("filter chips list only the values present", () => {
    expect(tileLevels(tiles)).toContain("Fundamental");
    expect(tileCategories(tiles).sort()).toEqual(["General", "Mind & Consciousness"]);
  });
});

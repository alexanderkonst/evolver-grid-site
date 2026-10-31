import { describe, expect, it } from "vitest";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { getPublishedModules } from "@/lib/coursePlayer";
import {
  ACADEMY_COURSES,
  PLACE_OBJECTS,
  courseModuleObjectId,
  placeObjects,
  placeSoul,
  watchedCourseObjects,
} from "../placeColor";

describe("the colour returns to each village place (placeColor)", () => {
  it("every one of the eleven places has at least one object", () => {
    expect(VILLAGE_PLACES).toHaveLength(11);
    for (const p of VILLAGE_PLACES) expect(PLACE_OBJECTS[p.key].length, p.key).toBeGreaterThan(0);
  });

  it("a place starts grey: no objects earned, no colour", () => {
    expect(placeSoul(placeObjects("house", {}))).toBe(0);
  });

  it("each earned object gives a little more colour, all of them give it all back", () => {
    const one = placeSoul(placeObjects("house", { "discover-mission": true }));
    const two = placeSoul(placeObjects("house", { "discover-mission": true, "map-assets": true }));
    const all = placeSoul(placeObjects("house", { "discover-mission": true, "map-assets": true, "assess-qol": true }));
    expect(one).toBeGreaterThan(0);
    expect(two).toBeGreaterThan(one);
    expect(all).toBe(1);
  });

  it("the Academy's objects are the modules of its two courses, watched to the end", () => {
    const [first] = ACADEMY_COURSES;
    const mod = getPublishedModules(first.modules)[0];
    const watched = watchedCourseObjects((slug) => (slug === first.slug ? mod.episodes.map((e) => e.code) : []));
    expect(watched).toEqual({ [courseModuleObjectId(first.slug, mod.id)]: true });
    const objs = placeObjects("academy", watched);
    expect(objs.filter((o) => o.earned)).toHaveLength(1);
    expect(placeSoul(objs)).toBeGreaterThan(0);
    expect(placeSoul(objs)).toBeLessThan(1);
  });

  it("a half-watched module is not an object yet", () => {
    const [first] = ACADEMY_COURSES;
    const mod = getPublishedModules(first.modules).find((m) => m.episodes.length > 1)!;
    const watched = watchedCourseObjects((slug) => (slug === first.slug ? [mod.episodes[0].code] : []));
    expect(watched[courseModuleObjectId(first.slug, mod.id)]).toBeUndefined();
  });
});

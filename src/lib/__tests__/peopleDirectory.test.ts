import { describe, expect, it } from "vitest";
import { directoryProfilePath, matchesDirectoryQuery } from "../peopleDirectory";

const ann = { name: "Ann Lee", topTalent: "Catalyst", archetype: "The Weaver" };

describe("directoryProfilePath", () => {
  it("opens the root slug when the player has a username", () => {
    expect(directoryProfilePath("ann", "u1")).toBe("/ann");
  });
  it("falls back to the id route without a username", () => {
    expect(directoryProfilePath(null, "u1")).toBe("/profile/u1");
    expect(directoryProfilePath("", "u1")).toBe("/profile/u1");
  });
});

describe("matchesDirectoryQuery", () => {
  it("matches everything for an empty or blank query", () => {
    expect(matchesDirectoryQuery(ann, "")).toBe(true);
    expect(matchesDirectoryQuery(ann, "   ")).toBe(true);
  });
  it("matches name and talent, any case", () => {
    expect(matchesDirectoryQuery(ann, "ann")).toBe(true);
    expect(matchesDirectoryQuery(ann, "CATALYST")).toBe(true);
    expect(matchesDirectoryQuery(ann, "weaver")).toBe(true);
  });
  it("needs every word to match", () => {
    expect(matchesDirectoryQuery(ann, "ann catalyst")).toBe(true);
    expect(matchesDirectoryQuery(ann, "ann builder")).toBe(false);
  });
  it("handles a missing talent", () => {
    expect(matchesDirectoryQuery({ ...ann, topTalent: null }, "catalyst")).toBe(false);
    expect(matchesDirectoryQuery({ ...ann, topTalent: null }, "ann")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import {
  directoryProfilePath,
  FOUNDER_PUBLIC_NAME,
  matchesDirectoryQuery,
  residentDisplayName,
} from "../peopleDirectory";

const ann = { name: "Ann Lee", topTalent: "Catalyst", archetype: "The Weaver" };

describe("founder card (issue #417)", () => {
  it("opens the standard resident profile, not the static /sasha page", () => {
    expect(directoryProfilePath("sasha", "u1")).toBe("/profile/u/sasha");
    expect(directoryProfilePath("Sasha", "u1")).toBe("/profile/u/Sasha");
  });
  it("routes every username that App.tsx shadows with the founder page to the standard profile (#440)", () => {
    for (const u of ["aleksandr", "Alexander", "integralevolution"]) {
      expect(directoryProfilePath(u, "u1")).toBe(`/profile/u/${u}`);
    }
    expect(directoryProfilePath("ann", "u1")).toBe("/ann");
  });
  it("uses the public spelling for the founder only", () => {
    expect(residentDisplayName("sasha", "Sasha", "Konstantinov")).toBe(FOUNDER_PUBLIC_NAME);
    expect(FOUNDER_PUBLIC_NAME).toBe("Aleksandr Konstantinov");
    expect(residentDisplayName("ann", "Ann", "Lee")).toBe("Ann Lee");
    expect(residentDisplayName("ann", null, null)).toBe("");
  });
});

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

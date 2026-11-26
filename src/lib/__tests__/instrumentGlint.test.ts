import { describe, expect, it } from "vitest";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { emptyPlaceSave, type PlaceRequirement, type PlaceSave } from "@/lib/placeState";
import {
  GLINT_STORAGE_KEY,
  MAX_HOUSE_CHANGES,
  clearGlint,
  emptyGlints,
  glintStorageKey,
  glintsFromChanges,
  hasGlint,
  parseGlints,
  readGlints,
  setGlint,
  sinceYouWereHere,
  writeGlints,
} from "../instrument/glint";

const NOW = new Date("2026-11-25T19:00:00Z");
const saveWith = (met: PlaceRequirement[]): PlaceSave => ({ met: Object.fromEntries(met.map((r) => [r, true])), now: NOW });
const store = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), raw: m };
};

describe("DoD 1 · glint set and clear", () => {
  it("DoD 1 · set marks one body and clear removes it", () => {
    const g = setGlint(emptyGlints(), "fire");
    expect(hasGlint(g, "fire")).toBe(true);
    expect(hasGlint(clearGlint(g, "fire"), "fire")).toBe(false);
    expect(clearGlint(g, "fire")).toEqual({});
  });

  it("DoD 1 · pure: the input is never mutated, and a no-op returns the same object", () => {
    const empty = emptyGlints();
    const g = setGlint(empty, "water");
    expect(empty).toEqual({});
    expect(setGlint(g, "water")).toBe(g);
    expect(clearGlint(empty, "fire")).toBe(empty);
    expect(Object.isFrozen(g)).toBe(false);
  });

  it("DoD 1 · survives a round trip through storage, per owner", () => {
    const s = store();
    writeGlints("player-1", setGlint(emptyGlints(), "earth"), s);
    expect(readGlints("player-1", s)).toEqual({ earth: true });
    expect(readGlints("player-2", s)).toEqual({});
    expect(s.raw.has(`${GLINT_STORAGE_KEY}:player-1`)).toBe(true);
    expect(glintStorageKey(null)).toBe(`${GLINT_STORAGE_KEY}:guest`);
  });

  it("DoD 1 · broken storage reads as no glints", () => {
    expect(readGlints("p", { getItem: () => "{not json" })).toEqual({});
    expect(readGlints("p", { getItem: () => { throw new Error("denied"); } })).toEqual({});
    expect(readGlints("p", null)).toEqual({});
  });
});

describe("DoD 2 · glint only on the changed body", () => {
  const places = VILLAGE_PLACES;

  it("DoD 2 · only fire glints when only the Academy is new", () => {
    const save = saveWith(["find-top-talent", "take-playbook"]);
    const all = new Set<string>(places.map((p) => p.key));
    all.delete("academy");
    const changes = sinceYouWereHere(places, all, save);
    expect(changes.map((c) => c.key)).toEqual(["academy"]);
    expect(glintsFromChanges(changes)).toEqual({ fire: true });
  });

  it("DoD 2 · nothing new, no change line and no glint (no filler)", () => {
    const save = emptyPlaceSave(NOW);
    const seen = new Set<string>(places.map((p) => p.key));
    expect(sinceYouWereHere(places, seen, save)).toEqual([]);
    expect(glintsFromChanges([])).toEqual({});
  });

  it("DoD 2 · air never glints: its face is Your AI, which a place opening does not change", () => {
    const oracle = places.find((p) => p.element === "air")!;
    const seen = new Set<string>(places.filter((p) => p !== oracle).map((p) => p.key));
    const changes = sinceYouWereHere(places, seen, saveWith(["find-top-talent", "take-playbook", "discover-mission", "map-assets", "assess-qol", "build-business"]));
    expect(glintsFromChanges(changes).air).toBeUndefined();
  });

  it("DoD 2 · at most three changes, in map order, each with its place's route", () => {
    const save = saveWith(["find-top-talent", "take-playbook", "discover-mission", "map-assets", "offer-saved"]);
    const changes = sinceYouWereHere(places, new Set(), save);
    expect(changes.length).toBeLessThanOrEqual(MAX_HOUSE_CHANGES);
    expect(changes.length).toBe(MAX_HOUSE_CHANGES);
    for (const c of changes) {
      const p = places.find((x) => x.key === c.key)!;
      expect(c.to).toBe(p.to);
      expect(c.line.length).toBeGreaterThan(0);
    }
    // The glints still cover every body that changed, not only the three listed lines.
    const allChanged = sinceYouWereHere(places, new Set(), save, undefined, Infinity);
    expect(allChanged.length).toBeGreaterThan(changes.length);
  });
});

describe("DoD 5 · no feed inside the instrument", () => {
  it("DoD 5 · a glint is a flag per body: text, lists and objects are dropped on read", () => {
    expect(parseGlints({ fire: "The Academy is open.", earth: { line: "x" }, water: ["a"], ether: 1, air: true, nope: true })).toEqual({ air: true });
    expect(parseGlints({ fire: true })).toEqual({ fire: true });
    expect(parseGlints("fire")).toEqual({});
    expect(parseGlints(null)).toEqual({});
  });

  it("DoD 5 · what is stored holds no change text, only body flags", () => {
    const s = store();
    const changes = sinceYouWereHere(VILLAGE_PLACES, new Set(), saveWith(["find-top-talent", "take-playbook"]));
    writeGlints("p", glintsFromChanges(changes), s);
    const stored = JSON.parse(s.raw.get(glintStorageKey("p"))!) as Record<string, unknown>;
    for (const [k, v] of Object.entries(stored)) {
      expect(["ether", "water", "fire", "earth"]).toContain(k);
      expect(v).toBe(true);
    }
    for (const c of changes) expect(s.raw.get(glintStorageKey("p"))).not.toContain(c.line);
  });
});

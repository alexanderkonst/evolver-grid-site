import { describe, expect, it } from "vitest";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { MAX_LINES, buildHouseSince, seenLine, type SinceInput } from "../houseSince";

const place = (key: string) => {
  const p = VILLAGE_PLACES.find((v) => v.key === key);
  if (!p) throw new Error(`no place ${key}`);
  return p;
};

const none: SinceInput = { freshPlaces: [], artifacts: [], seers: [], circle: null, seenTo: "/game/journey" };

describe("buildHouseSince", () => {
  it("says nothing when nothing changed", () => {
    expect(buildHouseSince(none)).toEqual([]);
  });

  it("a player who completed a module sees the place that opened and the artifact, in that order", () => {
    const lines = buildHouseSince({
      ...none,
      freshPlaces: [place("quest-board")],
      artifacts: [{ kind: "talent", to: "/zone-of-genius/entry" }],
    });
    expect(lines.map((l) => l.id)).toEqual(["place", "artifact:talent"]);
    expect(lines[0]).toMatchObject({ to: place("quest-board").to });
    expect(lines[1]).toMatchObject({ text: "You found your top talent.", to: "/zone-of-genius/entry" });
  });

  it("never lists more than three lines, keeping the order places → artifacts → events", () => {
    const lines = buildHouseSince({
      freshPlaces: [place("quest-board")],
      artifacts: [
        { kind: "stall", to: "/ubb" },
        { kind: "mission", to: "/game/me/mission" },
        { kind: "talent", to: "/zone-of-genius/entry" },
      ],
      seers: ["Anna"],
      circle: { id: "c1", title: "Sunday circle", to: "/game/meet/c1" },
      seenTo: "/game/journey",
    });
    expect(MAX_LINES).toBe(3);
    expect(lines.map((l) => l.id)).toEqual(["place", "artifact:talent", "artifact:mission"]);
  });

  it("orders artifacts top talent, mission, uniqueness phrase, stall whatever order they arrive in", () => {
    const lines = buildHouseSince({
      ...none,
      artifacts: [
        { kind: "stall", to: "/ubb" },
        { kind: "uniqueness", to: "/ubb" },
        { kind: "mission", to: "/game/me/mission" },
      ],
    });
    expect(lines.map((l) => l.id)).toEqual(["artifact:mission", "artifact:uniqueness", "artifact:stall"]);
  });

  it("village events come last and each taps through to its place", () => {
    const lines = buildHouseSince({
      ...none,
      seers: ["Anna"],
      circle: { id: "c1", title: "Sunday circle", to: "/game/meet/c1" },
    });
    expect(lines).toEqual([
      { id: "seen", to: "/game/journey", text: "Anna sees you." },
      { id: "circle:c1", to: "/game/meet/c1", text: "You came to Sunday circle." },
    ]);
  });

  it("the house itself is not announced to someone standing in it", () => {
    expect(buildHouseSince({ ...none, freshPlaces: [place("house")] })).toEqual([]);
  });

  it("a circle with no title makes no line (no filler)", () => {
    expect(buildHouseSince({ ...none, circle: { id: "c1", title: "  ", to: "/game/meet/c1" } })).toEqual([]);
  });
});

describe("seenLine", () => {
  it("is empty with no taps", () => {
    expect(seenLine([])).toBeNull();
  });
  it("names one or two people, never a count", () => {
    expect(seenLine(["Anna"])).toBe("Anna sees you.");
    expect(seenLine(["Anna", "Ben"])).toBe("Anna and Ben see you.");
    expect(seenLine(["Anna", "Ben", "Cleo", "Dan"])).toBe("Anna, Ben and others see you.");
  });
  it("does not repeat a name, and falls back when nobody has a name", () => {
    expect(seenLine(["Anna", "Anna"])).toBe("Anna sees you.");
    expect(seenLine([null])).toBe("Someone sees you.");
  });
});

import { describe, expect, it } from "vitest";
import { weekPlanet, weekPlanets } from "../weekPlanet";

// 1 Nov 2026 is a Sunday. Local noon, so the weekday never shifts with timezone.
const day = (offset: number) => new Date(2026, 10, 1 + offset, 12);

describe("weekPlanet", () => {
  // Row index = days after Sunday 1 Nov 2026.
  const expected: Array<[string, string, string, string, number]> = [
    ["Sunday", "Sun", "☉", "Radiate", 6],
    ["Monday", "Moon", "☽", "Feel", 0],
    ["Tuesday", "Mars", "♂", "Act", 1],
    ["Wednesday", "Mercury", "☿", "Connect", 2],
    ["Thursday", "Jupiter", "♃", "Expand", 3],
    ["Friday", "Venus", "♀", "Harmonize", 4],
    ["Saturday", "Saturn", "♄", "Ground", 5],
  ];
  const rows: Array<[number, string, string, string, string, number]> = expected.map(
    ([dayName, planet, glyph, word, mondayIndex], i) => [i, dayName, planet, glyph, word, mondayIndex],
  );

  it.each(rows)(
    "1 Nov 2026 + %d is %s → %s",
    (offset, dayName, planet, glyph, word, mondayIndex) => {
      expect(weekPlanet(day(offset))).toEqual({
        dayName,
        planet,
        glyph: `${glyph}︎`,
        word,
        mondayIndex,
      });
    },
  );

  it("lists the seven planets Monday first", () => {
    expect(weekPlanets().map((p) => p.planet)).toEqual([
      "Moon",
      "Mars",
      "Mercury",
      "Jupiter",
      "Venus",
      "Saturn",
      "Sun",
    ]);
    expect(weekPlanets().map((p) => p.mondayIndex)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("asks for the text glyph so ♀ and ♂ never turn into colour emoji", () => {
    for (const p of weekPlanets()) expect(p.glyph.endsWith("︎")).toBe(true);
  });
});

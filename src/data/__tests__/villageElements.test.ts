import { describe, expect, it } from "vitest";
import { VILLAGE_ELEMENTS, VILLAGE_PLACES, getVillageElement, placeElement, type ElementKey } from "../villagePlaces";

// GoBY §25.14 «Five quarters»: one `element` per place, one solid and one colour per element.
describe("village elements (§25.14)", () => {
  it("lists the five elements with their solids, in rail order", () => {
    expect(VILLAGE_ELEMENTS.map((e) => [e.key, e.solid])).toEqual([
      ["ether", "dodecahedron"],
      ["air", "octahedron"],
      ["water", "icosahedron"],
      ["fire", "tetrahedron"],
      ["earth", "cube"],
    ]);
  });

  it("puts every place in exactly one quarter, as the spec says", () => {
    const byElement = (el: ElementKey) => VILLAGE_PLACES.filter((p) => p.element === el).map((p) => p.key);
    expect(byElement("ether")).toEqual(["reception", "house", "quest-board"]);
    expect(byElement("air")).toEqual(["oracle"]);
    expect(byElement("water")).toEqual(["cafe", "coworking"]);
    expect(byElement("fire").sort()).toEqual(["academy", "fire-circle"]);
    expect(byElement("earth")).toEqual(["workshop", "market", "town-hall"]);
    for (const p of VILLAGE_PLACES) expect(placeElement(p).key).toBe(p.element);
  });

  it("keeps the place names the spec says not to touch", () => {
    expect(VILLAGE_PLACES.find((p) => p.key === "cafe")!.name).toBe("Café");
    expect(VILLAGE_PLACES.find((p) => p.key === "coworking")!.name).toBe("Co-working");
  });

  it("gives each element one accent colour, none repeated", () => {
    const colors = VILLAGE_ELEMENTS.map((e) => e.color.toLowerCase());
    expect(new Set(colors).size).toBe(colors.length);
  });
});

// «one accent colour each that passes AA on both lunar states»: the Lunar night scene at deep
// night (--lunar-dawn 0: --scene-bg) and at first light (dawn 1: the pre-dawn glow of
// lunar-world.css laid over it), and the rail's navy.
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const blend = (fg: [number, number, number], alpha: number, bg: string) =>
  "#" + [0, 1, 2].map((i) => Math.round(fg[i] * alpha + parseInt(bg.slice(1 + i * 2, 3 + i * 2), 16) * (1 - alpha)).toString(16).padStart(2, "0")).join("");

const NIGHT = "#0a0e14"; // [data-skin="lunar"] --scene-bg
const FIRST_LIGHT = blend([150, 185, 225], 0.3, NIGHT); // lunar-world.css, .vl-frame::after at dawn 1
const RAIL = "#0a1632"; // the rail's navy

describe("quarter colours: AA on both lunar states", () => {
  for (const [name, bg] of [["deep night", NIGHT], ["first light", FIRST_LIGHT], ["rail navy", RAIL]] as const) {
    it(`reaches 4.5:1 on ${name}`, () => {
      for (const e of VILLAGE_ELEMENTS) expect(ratio(e.color, bg), `${e.key} on ${name}`).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("keeps the faint outline of an unlit solid at 3:1 (non-text) on deep night", () => {
    for (const e of VILLAGE_ELEMENTS) {
      const rgb = [1, 3, 5].map((i) => parseInt(e.color.slice(i, i + 2), 16)) as [number, number, number];
      expect(ratio(blend(rgb, 0.55, NIGHT), NIGHT), e.key).toBeGreaterThanOrEqual(3);
    }
  });

  it("reads the colour through getVillageElement", () => {
    expect(getVillageElement("fire").solid).toBe("tetrahedron");
  });
});

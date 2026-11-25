import { describe, expect, it } from "vitest";
import { VILLAGE_ELEMENTS, VILLAGE_PLACES } from "@/data/villagePlaces";
import { litQuarters } from "../quarters";
import type { PlaceStateName } from "../placeState";
import { GLYPH_PX, INNER_BODY_PX, MOON_RADIUS, RING_RADIUS, innerBodies, liftAbove, moonLitPolygon } from "../instrument/glyph";
import { FACES, getFace, hasFace, registerFace, type FaceProps } from "../instrument/faces";

/** Place states in `VILLAGE_PLACES` order, with the given places open and the rest closed. */
const states = (open: string[]): PlaceStateName[] => VILLAGE_PLACES.map((p) => (open.includes(p.key) ? "open" : "closed"));

describe("glyph inner bodies", () => {
  it("DoD 2 · glyph shows lit quarters from litQuarters", () => {
    const lit = litQuarters(VILLAGE_PLACES, states(["oracle", "academy"]));
    expect(lit).toMatchObject({ air: true, fire: true, ether: false, water: false, earth: false });
    // Air is the crystal itself; fire is lit, so exactly one inner body, drawn as the fire tetrahedron.
    const bodies = innerBodies(lit);
    expect(bodies.map((b) => b.element)).toEqual(["fire"]);
    expect(bodies[0]).toMatchObject({ solid: "tetrahedron", color: "#ff9d78" });
  });

  it("DoD 2 · glyph shows nothing inside before any earthly quarter is lit", () => {
    expect(innerBodies(litQuarters(VILLAGE_PLACES, states(["oracle"])))).toEqual([]);
    expect(innerBodies(litQuarters(VILLAGE_PLACES, []))).toEqual([]);
  });

  it("DoD 2 · glyph grows as quarters light, in village order, one nested slot each", () => {
    const lit = litQuarters(VILLAGE_PLACES, states(["reception", "cafe", "academy", "market"]));
    const bodies = innerBodies(lit);
    expect(bodies.map((b) => b.element)).toEqual(["ether", "water", "fire", "earth"]);
    expect(bodies.map((b) => b.solid)).toEqual(["dodecahedron", "icosahedron", "tetrahedron", "cube"]);
    // Each solid is the quarter's own (one symbol, one meaning), in the quarter's own colour.
    for (const b of bodies) {
      const e = VILLAGE_ELEMENTS.find((x) => x.key === b.element)!;
      expect([b.solid, b.color]).toEqual([e.solid, e.color]);
    }
    // No two bodies share a slot, and every body stays inside the ring and the box.
    expect(new Set(bodies.map((b) => `${b.x},${b.y}`)).size).toBe(bodies.length);
    for (const b of bodies) {
      expect(Math.hypot(b.x, b.y) + INNER_BODY_PX / 2).toBeLessThan(RING_RADIUS);
      expect(b.size).toBe(INNER_BODY_PX);
    }
  });

  it("DoD 2 · the ring and moon fit in the canvas box", () => {
    expect(RING_RADIUS + 1.5).toBeLessThanOrEqual(GLYPH_PX / 2);
    expect(MOON_RADIUS * 2).toBeLessThan(RING_RADIUS);
  });
});

describe("moon on the ring", () => {
  const maxX = (pts: [number, number][]) => Math.max(...pts.map((p) => p[0]));
  const minX = (pts: [number, number][]) => Math.min(...pts.map((p) => p[0]));

  it("draws nothing at the new moon and a full disc at the full moon", () => {
    expect(moonLitPolygon(0, 5)).toEqual([]);
    const full = moonLitPolygon(0.5, 5);
    expect(maxX(full)).toBeCloseTo(5, 5);
    expect(minX(full)).toBeCloseTo(-5, 5);
  });

  it("lights the right limb while waxing and the left while waning", () => {
    const waxing = moonLitPolygon(0.12, 5);
    const waning = moonLitPolygon(0.88, 5);
    expect(minX(waxing)).toBeGreaterThanOrEqual(-1e-9);
    expect(maxX(waning)).toBeLessThanOrEqual(1e-9);
  });

  it("is a crescent before the quarter and a gibbous after it", () => {
    const area = (pts: [number, number][]) => Math.abs(pts.reduce((a, p, i) => a + (p[0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * p[1]), 0) / 2);
    const disc = Math.PI * 25;
    expect(area(moonLitPolygon(0.12, 5))).toBeLessThan(disc / 2);
    expect(area(moonLitPolygon(0.38, 5))).toBeGreaterThan(disc / 2);
    expect(area(moonLitPolygon(0.25, 5))).toBeCloseTo(disc / 2, 0);
  });
});

describe("faces registry", () => {
  const Dummy = (() => null) as unknown as (p: FaceProps) => null;

  it("has one slot per element, in village order, and the slots without a face are empty until one registers", () => {
    expect(Object.keys(FACES)).toEqual(VILLAGE_ELEMENTS.map((e) => e.key));
    expect(Object.keys(FACES)).toEqual(["ether", "air", "water", "fire", "earth"]);
    // Water is filled by WP3 (`faces.ts` registers WaterFace); fire, earth and ether wait for their own work packages.
    for (const k of ["ether", "fire", "earth"] as const) {
      expect(hasFace(k)).toBe(false);
      expect(getFace(k)).toBeNull();
    }
    expect(hasFace("water")).toBe(true);
  });

  it("registering a face fills only that slot", () => {
    const registered = FACES.water.component;
    registerFace("water", Dummy);
    expect(getFace("water")).toBe(Dummy);
    expect(hasFace("water")).toBe(true);
    expect(hasFace("fire")).toBe(false);
    FACES.water.component = registered;
  });
});

describe("glyph keeps clear of content", () => {
  // The glyph at home on a 390x844 phone: bottom right, above the chat pill.
  const home = { left: 278, right: 382, top: 664, bottom: 768 };

  it("DoD 4 · stays home when nothing is in its corner", () => {
    expect(liftAbove(home, [])).toBe(0);
    // The village's next-move card sits lower on a tall screen: it ends above the glyph.
    expect(liftAbove(home, [{ left: 24, right: 366, top: 100, bottom: 400 }])).toBe(0);
    // A card in another column never moves it.
    expect(liftAbove(home, [{ left: 0, right: 200, top: 600, bottom: 840 }])).toBe(0);
  });

  it("DoD 4 · rises until its bottom edge is clear of the next-move card", () => {
    const card = { left: 24, right: 366, top: 602, bottom: 836 };
    const lift = liftAbove(home, [card]);
    expect(lift).toBeGreaterThan(0);
    expect(home.bottom - lift).toBeLessThanOrEqual(card.top);
    // And no further than needed: 8 px of air.
    expect(home.bottom - lift).toBe(card.top - 8);
  });

  it("DoD 4 · clears several elements, and never leaves the viewport", () => {
    const a = { left: 24, right: 366, top: 602, bottom: 836 };
    const b = { left: 300, right: 380, top: 480, bottom: 590 };
    const lift = liftAbove(home, [a, b]);
    expect(home.bottom - lift).toBeLessThanOrEqual(b.top);
    // A card that fills the screen cannot push the glyph past the top edge.
    const tall = { left: 0, right: 390, top: 0, bottom: 844 };
    expect(home.top - liftAbove(home, [tall])).toBeGreaterThanOrEqual(0);
  });
});

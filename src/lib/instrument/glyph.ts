/**
 * The closed glyph, as data: where each lit body sits inside the crystal and how the moon sits on
 * the ring (architecture §4). Pure, so the drawing rules are testable without a canvas;
 * `src/components/game/InstrumentGlyph.tsx` only paints what this returns.
 */
import { VILLAGE_ELEMENTS, type ElementKey, type SolidKey } from "@/data/villagePlaces";

/** Canvas box, CSS px. The octahedron span is about 84 px (#458 drew 90 in a 96 box); the ring sits just outside it. */
export const GLYPH_PX = 104;
export const RING_RADIUS = 50;
export const OCTAHEDRON_SCALE = 41;
/** Radius of the small moon on the ring. */
export const MOON_RADIUS = 5;

/** Where each earthly body nests inside the air (offsets from the centre, px). Air is the crystal itself. */
const SLOTS: Record<Exclude<ElementKey, "air">, { x: number; y: number }> = {
  ether: { x: 0, y: -15 },
  water: { x: -15, y: 8 },
  fire: { x: 15, y: 8 },
  earth: { x: 0, y: 17 },
};

/** Size of an inner body, px (a 24-unit QuarterSign board scaled to this). */
export const INNER_BODY_PX = 22;

export type InnerBody = { element: ElementKey; solid: SolidKey; color: string; x: number; y: number; size: number };

/**
 * The bodies drawn inside the crystal: the lit quarters from `litQuarters`, except air (the crystal
 * itself), in village order. A quarter that is not lit is not drawn at all (§2 rule 2: the glyph holds
 * only what the player earned; the outlines belong to the open state).
 */
export const innerBodies = (lit: Record<ElementKey, boolean>): InnerBody[] =>
  VILLAGE_ELEMENTS.filter((e) => e.key !== "air" && lit[e.key]).map((e) => ({
    element: e.key,
    solid: e.solid,
    color: e.color,
    ...SLOTS[e.key as Exclude<ElementKey, "air">],
    size: INNER_BODY_PX,
  }));

/** The moon's lit part as a polygon around (0, 0), `cycle` 0 (new) … 1 (next new), from `getVillageSky`. */
export const moonLitPolygon = (cycle: number, r: number, steps = 24): [number, number][] => {
  const c = ((cycle % 1) + 1) % 1;
  const illumination = (1 - Math.cos(c * 2 * Math.PI)) / 2;
  if (illumination < 0.02) return [];
  // Waxing (cycle < 0.5): the right limb is lit (northern sky); waning: the left.
  const side = c < 0.5 ? 1 : -1;
  // k: 1 at new, -1 at full. The terminator bulges toward the lit side for a crescent (k > 0), away for a gibbous.
  const k = Math.cos(c * 2 * Math.PI);
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (Math.PI * i) / steps;
    pts.push([side * r * Math.sin(t), -r * Math.cos(t)]);
  }
  for (let i = steps; i >= 0; i--) {
    const t = (Math.PI * i) / steps;
    pts.push([side * k * r * Math.sin(t), -r * Math.cos(t)]);
  }
  return pts;
};

export type Rect = { left: number; right: number; top: number; bottom: number };

/**
 * How far (px, up) the glyph must lift from its home corner so it covers none of `avoid` (the next-move
 * card, a primary button at the foot of a screen): it rises until its bottom edge sits `gap` above the
 * highest element it would cover. `base` is the glyph's rect at home (lift 0). Stays inside the viewport.
 * Elements that do not share the glyph's column and rows never move it.
 */
export const liftAbove = (base: Rect, avoid: readonly Rect[], gap = 8): number => {
  let lift = 0;
  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (const a of avoid) {
      const top = base.top - lift;
      const bottom = base.bottom - lift;
      if (base.left < a.right && base.right > a.left && top < a.bottom && bottom > a.top) {
        lift = base.bottom - (a.top - gap);
        moved = true;
      }
    }
    if (!moved) break;
  }
  return Math.max(0, Math.round(Math.min(lift, base.top - gap)));
};

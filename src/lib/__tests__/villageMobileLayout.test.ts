import { describe, expect, it } from "vitest";
import { VILLAGE_PLACES } from "@/data/villagePlaces";

/**
 * Mobile village (≤767px): the map is the viewport wide and square, the moon sits in its top
 * right corner, and the pins must not reach it. The numbers mirror the mobile block of
 * src/pages/Village.css (.vl-moon, .vl-moon__glow) and the Lunar pin aura in
 * src/styles/lunar-world.css (--vl-aura: 20vw, so a radius of 10vw). Change one, change both.
 */
const MOON = { top: 12, size: 30, haloOutset: 0.5 }; // px; the halo reaches size × 0.5 past the disc
const moonBottom = MOON.top + MOON.size * (1 + MOON.haloOutset); // 57px
const AURA_RADIUS = 0.1; // × map width
const WIDTHS = [320, 360, 390, 430, 767];

describe("mobile village layout: pins stay clear of the moon", () => {
  it.each(WIDTHS)("at %ipx no pin, with its Lunar aura, reaches the moon's halo", (w) => {
    for (const p of VILLAGE_PLACES) {
      const topOfPin = (p.y / 100) * w - AURA_RADIUS * w;
      expect(topOfPin, `${p.key} at ${w}px`).toBeGreaterThanOrEqual(moonBottom);
    }
  });
});

/**
 * bloom config — the one place that says which colors the world blooms into, in which order.
 * Owner decision (Sasha, 2026-10-30, issue #277): the whole world blooms, not separate places.
 *
 * Every object a player earns (see src/lib/placeColor.ts) lights one of seven colors. The
 * world's colorfulness is ONE global value, `bloomLevel` 0…9, derived from how many objects
 * are earned (src/lib/bloom.ts):
 *
 *   0      moon silver, desaturated
 *   1      first warm light (after the first object)
 *   2…8    the seven colors appear one by one
 *   9      dawn: every object earned, the full palette
 *
 * Swap-point for later: the soul colors derived from the player's gift
 * (docs/01-vision/new_ui_paradigm_vision.md, "Soul Color Derivation"). Replace `BLOOM_COLORS`
 * hexes (or pass a different palette to `bloomVars`) and nothing else changes: order and hues
 * live here and nowhere else.
 */

export type BloomColor = {
  /** Stable id of the color; also the CSS suffix (`--bloom-c1`…`--bloom-c7`) by position. */
  id: string;
  hex: string;
};

/** The seven colors, in the order they light. Antique, not neon: they sit on a near-black night. */
export const BLOOM_COLORS: readonly BloomColor[] = [
  { id: "ember", hex: "#e8765f" },
  { id: "amber", hex: "#eba94a" },
  { id: "gold", hex: "#e6d067" },
  { id: "moss", hex: "#7fc98a" },
  { id: "lagoon", hex: "#5ec8bd" },
  { id: "indigo", hex: "#7a93e8" },
  { id: "violet", hex: "#b68ae6" },
];

export const BLOOM_MIN = 0;
/** Dawn: every object earned. */
export const BLOOM_MAX = 9;
/** Highest stage reachable while any object is still unearned. */
export const BLOOM_LAST_COLOR_STAGE = 8;

/** The warm light of stage 1 (and the horizon glow of every later stage). */
export const BLOOM_WARM_HEX = "#f2c98a";
/** Unlit colors stay this silver. Used by the dev chip and as the fallback. */
export const BLOOM_SILVER_HEX = "#8793a2";

export type BloomStage = {
  /** 0 = silver … 1 = full color. Drives grayscale on every scene image. */
  saturation: number;
  /** 0 … 1 warm tint over the scenes and the horizon glow. */
  warmth: number;
};

/**
 * Per stage, index = bloomLevel. Saturation rises with every color; stage 9 is the full palette.
 * Warmth steps up at the first object, then eases toward dawn.
 */
export const BLOOM_STAGES: readonly BloomStage[] = [
  { saturation: 0, warmth: 0 }, // 0 moon silver
  { saturation: 0.16, warmth: 0.45 }, // 1 first warm light
  { saturation: 0.26, warmth: 0.5 }, // 2 ember
  { saturation: 0.36, warmth: 0.55 }, // 3 amber
  { saturation: 0.46, warmth: 0.6 }, // 4 gold
  { saturation: 0.56, warmth: 0.65 }, // 5 moss
  { saturation: 0.68, warmth: 0.7 }, // 6 lagoon
  { saturation: 0.8, warmth: 0.78 }, // 7 indigo
  { saturation: 0.9, warmth: 0.86 }, // 8 violet
  { saturation: 1, warmth: 1 }, // 9 dawn
];

/**
 * The sky layer behind the page (the horizon glow and the band of lit colors). It is dimmed so
 * its brightest pixel is never lighter than Lunar's lightest night (`LUNAR_LIGHTEST_NIGHT`):
 * blending it in can tint the sky but never raises the background luminance the text sits on,
 * which is what keeps WCAG-AA at every stage (checked in src/lib/__tests__/bloom.test.ts).
 */
export const BLOOM_SKY = {
  /** Multiplies the sRGB channels of every sky color (CSS `brightness()`). */
  dim: 0.3,
  warmAlpha: 0.5,
  bandAlpha: 0.6,
};

/** The lightest background Lunar paints under text: the dawn end of the body gradient (index.css). */
export const LUNAR_LIGHTEST_NIGHT = "#2c4560";

/** Seconds a stage change takes to settle (CSS reads it as `--bloom-seconds`). */
export const BLOOM_TRANSITION_SECONDS = 4;
/** Milliseconds the brief glow of a newly earned object lasts. */
export const BLOOM_GLOW_MS = 2600;

/** localStorage key of the cache of earned objects; sessionStorage key of the ?bloom=N preview. */
export const BLOOM_CACHE_KEY = "bloom-world";
export const BLOOM_PREVIEW_KEY = "bloom-preview";

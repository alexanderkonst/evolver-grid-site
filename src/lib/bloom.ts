/**
 * bloom — the world's one global colorfulness (issue #277, Sasha 2026-10-30).
 *
 * `bloomLevel` (0…9) is the single source of truth. It is derived from how many objects the
 * player has earned (src/lib/bloomEarned.ts reads them from the save the client already holds),
 * then written once as CSS custom properties on <html>, so every scene (village, rooms, rail,
 * splash after login) inherits it and no page forks. Colors and their order: src/config/bloom.ts.
 *
 * Kept light on purpose: this file is imported at the app root and must not pull in the course
 * data that `placeColor` brings.
 *
 * Variables written on <html> (consumed by src/styles/bloom.css):
 *   --bloom-level    0…9 (a plain number, for debugging; nothing shows it)
 *   --bloom-sat      0…1, how much color the scenes have back (silver → full)
 *   --bloom-warm     0…1, the warm tint and horizon glow
 *   --bloom-c1…c7    the seven colors; transparent until lit
 *   --bloom-seconds  how long a change takes to settle
 */

import {
  BLOOM_CACHE_KEY,
  BLOOM_COLORS,
  BLOOM_LAST_COLOR_STAGE,
  BLOOM_MAX,
  BLOOM_MIN,
  BLOOM_PREVIEW_KEY,
  BLOOM_SKY,
  BLOOM_STAGES,
  BLOOM_TRANSITION_SECONDS,
  BLOOM_WARM_HEX,
  type BloomColor,
} from "@/config/bloom";

/** Fired on window when the cached bloom changed. `detail.celebrate` = a new object was earned. */
export const BLOOM_CHANGED_EVENT = "bloom-changed";
export type BloomChangedDetail = { celebrate: boolean };

const clampLevel = (n: number): number => Math.min(BLOOM_MAX, Math.max(BLOOM_MIN, Math.round(n)));

/**
 * 0 earned → 0 (silver). 1 → 1 (first warm light). 2…8 → one color per object, up to the
 * seventh. Dawn (9) only when every object there is has been earned.
 */
export const bloomLevelFor = (earned: number, total: number): number => {
  if (earned <= 0) return BLOOM_MIN;
  if (total > 0 && earned >= total) return BLOOM_MAX;
  return Math.min(earned, BLOOM_LAST_COLOR_STAGE);
};

/** How many of the seven colors are lit at a level (stage 1 is warm light only). */
export const litColors = (level: number): number => {
  const l = clampLevel(level);
  if (l >= BLOOM_MAX) return BLOOM_COLORS.length;
  return Math.max(0, Math.min(BLOOM_COLORS.length, l - 1));
};

/** The color a stage lights when it is reached: the newest lit color, or the warm light at 1. */
export const stageColor = (level: number, palette: readonly BloomColor[] = BLOOM_COLORS): string => {
  const l = clampLevel(level);
  if (l >= BLOOM_MAX) return palette[palette.length - 1]?.hex ?? BLOOM_WARM_HEX;
  const lit = litColors(l);
  return lit === 0 ? BLOOM_WARM_HEX : (palette[lit - 1]?.hex ?? BLOOM_WARM_HEX);
};

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [135, 147, 162];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** The CSS custom properties for one level. Pure, so it can be tested and previewed. */
export const bloomVars = (level: number, palette: readonly BloomColor[] = BLOOM_COLORS): Record<string, string> => {
  const l = clampLevel(level);
  const stage = BLOOM_STAGES[l];
  const lit = litColors(l);
  const vars: Record<string, string> = {
    "--bloom-level": String(l),
    "--bloom-sat": stage.saturation.toFixed(3),
    "--bloom-warm": stage.warmth.toFixed(3),
    "--bloom-seconds": `${BLOOM_TRANSITION_SECONDS}s`,
    "--bloom-warm-color": BLOOM_WARM_HEX,
    "--bloom-sky-dim": String(BLOOM_SKY.dim),
    "--bloom-sky-warm": String(BLOOM_SKY.warmAlpha),
    "--bloom-sky-band": String(BLOOM_SKY.bandAlpha),
  };
  palette.forEach((c, i) => {
    const [r, g, b] = hexToRgb(c.hex);
    // An unlit color keeps its hue and loses only its alpha, so it fades in instead of flashing.
    vars[`--bloom-c${i + 1}`] = `rgb(${r} ${g} ${b} / ${i < lit ? 1 : 0})`;
  });
  return vars;
};

/** Writes the level onto <html>. Safe to call repeatedly. */
export const applyBloom = (level: number, palette: readonly BloomColor[] = BLOOM_COLORS) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const [name, value] of Object.entries(bloomVars(level, palette))) root.style.setProperty(name, value);
  root.dataset.bloom = String(clampLevel(level));
};

/**
 * Called once before React renders: paint the cached level without animating from silver, then
 * let later changes transition (bloom.css holds transitions back until `data-bloom-ready`).
 */
export const initBloom = () => {
  if (typeof document === "undefined") return;
  applyBloom(effectiveBloomLevel());
  const ready = () => {
    document.documentElement.dataset.bloomReady = "true";
  };
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => window.requestAnimationFrame(ready));
  } else {
    ready();
  }
};

/* ---------- cache: what the player has earned, so every screen paints at once ---------- */

export type BloomCache = { earned: string[]; level: number };

export const readBloomCache = (): BloomCache | null => {
  try {
    const raw = window.localStorage.getItem(BLOOM_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BloomCache>;
    const earned = Array.isArray(parsed.earned) ? parsed.earned.filter((x): x is string => typeof x === "string") : [];
    const level = typeof parsed.level === "number" ? clampLevel(parsed.level) : BLOOM_MIN;
    return { earned, level };
  } catch {
    return null;
  }
};

export const writeBloomCache = (cache: BloomCache) => {
  try {
    window.localStorage.setItem(BLOOM_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Private mode / quota: the cache only saves a round trip, ignore.
  }
};

/**
 * Records the earned objects, writes the cache and tells the root. `celebrate` is true only when
 * an object that was not in the cache before has appeared: a first visit with no cache, or a
 * returning player whose save simply loaded, never glows.
 */
export const commitEarned = (earned: readonly string[], total: number): number => {
  const level = bloomLevelFor(earned.length, total);
  const previous = readBloomCache();
  const known = new Set(previous?.earned ?? []);
  const celebrate = previous !== null && earned.some((id) => !known.has(id)) && level > previous.level;
  const unchanged =
    previous !== null && previous.level === level && previous.earned.length === earned.length && !celebrate;
  if (!unchanged) {
    writeBloomCache({ earned: [...earned], level });
    window.dispatchEvent(new CustomEvent<BloomChangedDetail>(BLOOM_CHANGED_EVENT, { detail: { celebrate } }));
  }
  return level;
};

/* ---------- preview: ?bloom=N shows any stage without touching the save ---------- */

/** `?bloom=3` → 3, `?bloom=off` → "off" (clears the preview), anything else → null. */
export const parseBloomPreview = (search: string): number | "off" | null => {
  const raw = new URLSearchParams(search).get("bloom");
  if (raw === null) return null;
  const v = raw.trim().toLowerCase();
  if (v === "off" || v === "clear" || v === "") return "off";
  if (!/^\d+$/.test(v)) return null;
  return clampLevel(Number(v));
};

export const readBloomPreview = (): number | null => {
  try {
    const raw = window.sessionStorage.getItem(BLOOM_PREVIEW_KEY);
    return raw !== null && /^\d+$/.test(raw) ? clampLevel(Number(raw)) : null;
  } catch {
    return null;
  }
};

/** Stores or clears the preview (session only, so a closed tab forgets it). Returns the active one. */
export const syncBloomPreview = (search: string): number | null => {
  const parsed = parseBloomPreview(search);
  try {
    if (parsed === "off") window.sessionStorage.removeItem(BLOOM_PREVIEW_KEY);
    else if (typeof parsed === "number") window.sessionStorage.setItem(BLOOM_PREVIEW_KEY, String(parsed));
  } catch {
    // sessionStorage unavailable: the preview then lasts only while the query is in the URL.
    return typeof parsed === "number" ? parsed : null;
  }
  return readBloomPreview();
};

/** The level the world shows now: the preview when one is active, else the player's own. */
export const effectiveBloomLevel = (): number => {
  if (typeof window === "undefined") return BLOOM_MIN;
  const fromUrl = parseBloomPreview(window.location.search);
  const preview = typeof fromUrl === "number" ? fromUrl : fromUrl === "off" ? null : readBloomPreview();
  return preview ?? readBloomCache()?.level ?? BLOOM_MIN;
};

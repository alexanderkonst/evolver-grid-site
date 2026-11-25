/**
 * The ink line and the signs of being lost (docs/specs/navigation-instrument/architecture.md §6, phase 3;
 * GoBY §25: "Where next?"). Pure functions only: no React, no DOM.
 *
 * The line is a bearing, never a route: one stroke from where the player is to the glowing place. It
 * never shows by default. It is drawn when the player chooses the next move on the ether face, and it is
 * offered (never drawn on its own) on clear signs of being lost:
 *   - LOST_ENTRIES places entered in a row without the next move changing, or
 *   - LOST_IDLE_MS of no input.
 * Both numbers are Hark's defaults and unconfirmed (sow.md WP5); they are the only two constants to change.
 */
import { VILLAGE_PLACES } from "@/data/villagePlaces";

export const LOST_ENTRIES = 3;
export const LOST_IDLE_MS = 60_000;

/** The line's life, ms: drawn, held, then faded. Reduced motion: a static dotted line held for INK_STATIC_MS. */
export const INK_DRAW_MS = 900;
export const INK_HOLD_MS = 1400;
export const INK_FADE_MS = 700;
export const INK_STATIC_MS = 4000;

export type Point = { x: number; y: number };

// ---------------------------------------------------------------------------------------------
// Lost signs
// ---------------------------------------------------------------------------------------------

/**
 * `sig` is the current next move's signature (null: nothing to point to). `entries` counts places entered
 * since the next move last changed. `offered`: the quiet "show me the way" is on offer. `settled`: the
 * player took or refused the offer for this move, so it is not offered again until the move changes.
 */
export type LostState = { sig: string | null; entries: number; offered: boolean; settled: boolean };

export type LostEvent =
  /** The next move as it is now (any render may send it; only a change counts as an advance). */
  | { type: "move"; sig: string | null }
  /** A place was entered that is not the next move's own place. */
  | { type: "entry" }
  | { type: "idle" }
  /** The line was drawn or the offer was dismissed. */
  | { type: "settle" };

export const lostInitial: LostState = { sig: null, entries: 0, offered: false, settled: false };

export const lostReduce = (state: LostState, event: LostEvent): LostState => {
  switch (event.type) {
    case "move":
      return event.sig === state.sig ? state : { sig: event.sig, entries: 0, offered: false, settled: false };
    case "entry": {
      if (state.sig === null || state.settled) return state;
      const entries = state.entries + 1;
      return { ...state, entries, offered: state.offered || entries >= LOST_ENTRIES };
    }
    case "idle":
      return state.sig === null || state.settled || state.offered ? state : { ...state, offered: true };
    case "settle":
      return state.offered || !state.settled ? { ...state, entries: 0, offered: false, settled: true } : state;
  }
};

/** What identifies a next move: moving on to another step or place is an advance. */
export const moveSignature = (move: { kind: string; step: string | null; place: { key: string } } | null): string | null =>
  move ? `${move.kind}:${move.step ?? ""}@${move.place.key}` : null;

/** The village place a route belongs to (`/village/<key>` or the place's own route), or null. */
export const placeKeyForPath = (pathname: string): string | null => {
  const path = pathname.replace(/\/+$/, "") || "/";
  for (const p of VILLAGE_PLACES) {
    const village = `/village/${p.key}`;
    if (path === village || path.startsWith(`${village}/`)) return p.key;
  }
  for (const p of VILLAGE_PLACES) {
    const own = p.to.split("?")[0].replace(/\/+$/, "");
    if (own && own !== "/" && (path === own || path.startsWith(`${own}/`))) return p.key;
  }
  return null;
};

// ---------------------------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------------------------

/** The line stops this far short of the glowing place, so the glow stays visible. */
const STOP_SHORT = 14;
/** How far the stroke bows, as a share of its length: a brush stroke, not a ruler. */
const BOW = 0.12;

/**
 * Where the line aims. A glowing place that is on screen is the target itself; one that is off screen (a
 * map wider than the window) is aimed at along the same line of sight, stopping `margin` px inside the
 * screen edge: a bearing, not a route. `from` is expected to be on screen.
 */
export const clampToScreen = (from: Point, to: Point, width: number, height: number, margin = 24): Point => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const reach = (start: number, delta: number, max: number): number =>
    delta > 0 ? (max - margin - start) / delta : delta < 0 ? (margin - start) / delta : Infinity;
  const t = Math.min(1, reach(from.x, dx, width), reach(from.y, dy, height));
  if (!(t >= 0)) return { x: Math.min(Math.max(to.x, margin), width - margin), y: Math.min(Math.max(to.y, margin), height - margin) };
  return { x: from.x + dx * t, y: from.y + dy * t };
};

/** One quadratic stroke `from` → just short of `to`, and where it ends (for the small ink dot). */
export const inkPath = (from: Point, to: Point): { d: string; end: Point } => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return { d: `M${r(from.x)} ${r(from.y)} Q${r(from.x)} ${r(from.y)} ${r(from.x)} ${r(from.y)}`, end: { x: from.x, y: from.y } };
  const short = Math.min(STOP_SHORT, len / 2);
  const end = { x: to.x - (dx / len) * short, y: to.y - (dy / len) * short };
  const cx = (from.x + end.x) / 2 - (dy / len) * len * BOW;
  const cy = (from.y + end.y) / 2 + (dx / len) * len * BOW;
  return { d: `M${r(from.x)} ${r(from.y)} Q${r(cx)} ${r(cy)} ${r(end.x)} ${r(end.y)}`, end };
};

const r = (n: number): number => Math.round(n * 10) / 10;

import {
  INTRO_ELEMENTS,
  INTRO_ELEMENT_Y,
  INTRO_FRAME_RATIO,
  type IntroClip,
  type IntroFrame,
  type IntroOverlay,
  type IntroPos,
} from "@/data/introSequence";

/**
 * Pure timeline math for the cinematic intro (src/components/game/IntroSequence.tsx).
 * No DOM, so it is unit-tested (src/lib/__tests__/introTimeline.test.ts).
 */

export const comparePos = (a: IntroPos, b: IntroPos): number => (a.clip !== b.clip ? a.clip - b.clip : a.t - b.t);

export type OverlayPhase = "before" | "in" | "out" | "gone";

/** Where an overlay is at `pos`: not yet, ignited/holding, fading out, gone. */
export const overlayPhase = (o: IntroOverlay, pos: IntroPos): OverlayPhase => {
  if (comparePos(pos, o.at) < 0) return "before";
  if (!o.until) return "in";
  if (comparePos(pos, o.until) >= 0) return "gone";
  const fadeStart: IntroPos = { clip: o.until.clip, t: Math.max(0, o.until.t - (o.fade ?? 0.7)) };
  return comparePos(pos, fadeStart) >= 0 ? "out" : "in";
};

/** Slot seconds at file time `fileTime`: (fileTime − start) ÷ rate. */
export const slotTime = (c: IntroClip, fileTime: number): number => Math.max(0, (fileTime - (c.start ?? 0)) / (c.rate ?? 1));

/** Seconds a clip occupies on screen: its cap, or the file's own length after `start` at its rate. */
export const playLength = (c: IntroClip, fileDuration?: number): number => {
  const natural = fileDuration && Number.isFinite(fileDuration) ? slotTime(c, fileDuration) : c.length;
  return c.duration ? Math.min(c.duration, natural) : natural;
};

const smooth = (x: number) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};

/** Still fallback: the frames showing at `t` seconds into clip `c`, bottom first. */
export const stillLayers = (c: IntroClip, t: number): { frame: IntroFrame; opacity: number }[] => {
  if (c.from === c.to || !c.dissolve) return [{ frame: c.from, opacity: 1 }];
  const [a, b] = c.dissolve;
  return [
    { frame: c.from, opacity: 1 },
    { frame: c.to, opacity: smooth((t - a) / Math.max(0.001, b - a)) },
  ];
};

export type CaptionLayout = {
  /** "frame": each caption under its element; "stack": one column under the crystal (portrait). */
  mode: "frame" | "stack";
  items: { key: string; x: number; y: number }[];
  /** Caption column width, px. */
  width: number;
};

/**
 * Where the five captions go on a vw×vh screen. The video fills the screen with object-fit:
 * cover, so the 16:9 frame is scaled to cover and centred; a caption sits under its element
 * when that element is on screen inside the safe zone (5 % in from each side). On a tall
 * screen the outer elements are cropped away, so the captions stack in one column instead.
 */
export const captionLayout = (vw: number, vh: number): CaptionLayout => {
  const boxW = Math.max(vw, vh * INTRO_FRAME_RATIO);
  const boxH = boxW / INTRO_FRAME_RATIO;
  const left = (vw - boxW) / 2;
  const top = (vh - boxH) / 2;
  const safeL = vw * 0.05;
  const safeR = vw * 0.95;
  // Gems are ~15 % of the frame height; the caption starts just below the gem.
  const below = top + boxH * (INTRO_ELEMENT_Y / 100) + boxH * 0.1;
  const colW = Math.min(boxW * 0.15, 260);
  const xs = INTRO_ELEMENTS.map((e) => left + (boxW * e.x) / 100);
  // Every element centre on screen inside the safe zone; a caption near the edge is nudged in.
  const fits = xs.every((x) => x >= safeL && x <= safeR);
  if (fits) {
    return {
      mode: "frame",
      width: colW,
      items: INTRO_ELEMENTS.map((e, i) => ({
        key: e.key,
        x: Math.min(safeR - colW / 2, Math.max(safeL + colW / 2, xs[i])),
        y: below,
      })),
    };
  }
  // Tall screen: the outer elements are cropped away, so the captions stack in the lower
  // part of the screen, under the central crystal, in the same order (left to right → top down).
  return {
    mode: "stack",
    width: (safeR - safeL),
    items: INTRO_ELEMENTS.map((e) => ({ key: e.key, x: vw / 2, y: Math.max(below, vh * 0.56) })),
  };
};

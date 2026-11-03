/**
 * The cinematic intro (intro v2): NEW GAME on the title → nine clips (~44 s) → the Entry Portal.
 *
 * Script: Sasha's backbone, 2026-11-02. Text is overlaid in code, never baked into video.
 *
 * DROPPING IN CLIPS: put the files in `public/game/intro/` named exactly after the clip
 * (`V1.mp4`, `V2a.mp4`, … `V4c.mp4`; a `V1.webm` next to it is used first where the browser
 * plays WebM). A missing clip is not an error: that stretch plays its still frames
 * (`public/game/intro/frames/*.webp`) with a slow Ken Burns move and dissolves instead.
 *
 * FITTING A LONGER CLIP (e.g. an 8 s file for a 4 s slot), per clip below:
 *   - `duration`: cap, in seconds of the slot. The clip is cut there (trim). Leave it out to
 *     play the clip to its end.
 *   - `start`: seconds to skip at the head of the file.
 *   - `rate`: playback speed. `rate: 2` plays an 8 s file in a 4 s slot, keeping its first and
 *     last frames (so the cut to the next clip stays seamless, unlike a trim).
 * Overlay times below are seconds of the slot: (file time − start) ÷ rate.
 */

export const INTRO_BASE = "/game/intro";
export const INTRO_FRAMES = `${INTRO_BASE}/frames`;

export type IntroFrame =
  | "f1-title"
  | "f2-fifth"
  | "f3-village-wide"
  | "f4-close-lunar"
  | "f5-close-lit"
  | "f6-close-golden"
  | "f7-pavilion"
  | "f8-entry-portal";

export type IntroClip = {
  /** File name without extension, in public/game/intro/. */
  name: string;
  /** Slot length in the script, seconds. The still fallback runs this long. */
  length: number;
  /** Cap, seconds of the slot: cut the clip here. Omit to play to the end. */
  duration?: number;
  /** Skip this many seconds at the head of the file. Default 0. */
  start?: number;
  /** Playback speed (1 = as shot). Default 1. */
  rate?: number;
  /** Still fallback: first and last frame of the clip, dissolving between `dissolve[0]`…`[1]` s. */
  from: IntroFrame;
  to: IntroFrame;
  dissolve?: [number, number];
  /**
   * The clip ends on the Entry Portal's own picture (the last clip). `gate` is where the
   * portal's scene image sits inside the clip's 16:9 frame, as fractions [x, y, w, h]. While
   * the clip plays, the video eases from covering the screen (`k` 0, the cut from the clip
   * before) to lying exactly on the live portal scene (`k` 1 by `settle` s), so its last frame
   * and the portal match pixel for pixel on every screen and the dissolve shows one picture.
   */
  portal?: { gate: [number, number, number, number]; settle: number };
};

// Clips (2026-11-03): V1, V2a, V2b, V3a Veo 3.1 Lite; V3b, V3c, V4a, V4b, V4c Veo 3.1 Fast.
// Every file is 8 s as shot; V2b is cut to its first 4 s at transcode, the others reach their
// slot with `rate`. V4c is edited to 4 s (glow, a ~1.6 s colour drain to moonlight grey, then
// the Entry Portal end frame, graded and framed from the live moon-theme portal scene).
export const INTRO_CLIPS: IntroClip[] = [
  { name: "V1", length: 8, duration: 8, rate: 1, from: "f1-title", to: "f2-fifth", dissolve: [0.5, 3.0] },
  { name: "V2a", length: 6, duration: 6, rate: 4 / 3, from: "f2-fifth", to: "f3-village-wide", dissolve: [1.0, 5.0] },
  { name: "V2b", length: 4, duration: 4, rate: 1, from: "f3-village-wide", to: "f3-village-wide" },
  { name: "V3a", length: 6, duration: 6, rate: 4 / 3, from: "f3-village-wide", to: "f4-close-lunar", dissolve: [0.8, 5.2] },
  { name: "V3b", length: 4, duration: 4, rate: 2, from: "f4-close-lunar", to: "f5-close-lit", dissolve: [0.3, 2.8] },
  { name: "V3c", length: 4, duration: 4, rate: 2, from: "f5-close-lit", to: "f6-close-golden", dissolve: [0.3, 3.4] },
  { name: "V4a", length: 4, duration: 4, rate: 2, from: "f6-close-golden", to: "f7-pavilion", dissolve: [0.5, 3.4] },
  { name: "V4b", length: 4, duration: 4, rate: 2, from: "f7-pavilion", to: "f8-entry-portal", dissolve: [0.4, 3.4] },
  // V4c: the crystal glows, the colour drains to moonlight grey, and the clip ends on the live
  // Entry Portal's picture (gate = the 1619×1080 scene inside the 1920×1080 frame) while START
  // GAME ignites and the layer dissolves.
  {
    name: "V4c",
    length: 4,
    duration: 4,
    rate: 1,
    from: "f8-entry-portal",
    to: "f8-entry-portal",
    portal: { gate: [150 / 1920, 0, 1619 / 1920, 1], settle: 2.6 },
  },
];

/** A moment in the sequence: clip index + seconds into that clip. */
export type IntroPos = { clip: number; t: number };

export type IntroOverlay = {
  id: "fifth" | "elements" | "village" | "start";
  /** Ignite starts here. */
  at: IntroPos;
  /** Fully gone here (the fade ends here). Omit to stay. */
  until?: IntroPos;
  /** Fade-out length, seconds. */
  fade?: number;
  /** Ignite length, seconds (opacity 0→1, blur 6px→0). */
  ignite?: number;
};

const clip = (name: string) => INTRO_CLIPS.findIndex((c) => c.name === name);

export const INTRO_OVERLAYS: IntroOverlay[] = [
  // V1 0.4–3.2 s: «You are the fifth element.»
  { id: "fifth", at: { clip: clip("V1"), t: 0.4 }, until: { clip: clip("V1"), t: 3.2 }, fade: 0.7 },
  // V1 3.4 s → V2a 0.8 s: the five captions under the five elements.
  { id: "elements", at: { clip: clip("V1"), t: 3.4 }, until: { clip: clip("V2a"), t: 0.8 }, fade: 0.8 },
  // V3a 1–4.4 s: «You land in a village.»
  { id: "village", at: { clip: clip("V3a"), t: 1.0 }, until: { clip: clip("V3a"), t: 4.4 }, fade: 0.7 },
  // V4c 3.3 s: START GAME ignites over 0.5 s and stays.
  { id: "start", at: { clip: clip("V4c"), t: 3.3 }, ignite: 0.5 },
];

/**
 * The five elements on frame f2-fifth (1920×1080): centres on one line at 42.5 % of the
 * height, left to right. Captions sit under them. Copy keys live under `intro.elements.*`.
 */
export const INTRO_ELEMENTS = [
  { key: "body", x: 14, name: "Body", element: "Earth", line: "Vitality and foundation" },
  { key: "emotions", x: 32, name: "Emotions", element: "Water", line: "Mastery of inner weather" },
  { key: "uniqueness", x: 50, name: "Uniqueness", element: "Aether", line: "Your unique gift, refracted into the world" },
  { key: "mind", x: 68.5, name: "Mind", element: "Air", line: "Clarity and perception" },
  { key: "spirit", x: 87, name: "Spirit", element: "Fire", line: "The fire that moves you" },
] as const;
export const INTRO_ELEMENT_Y = 42.5;
/** The frame every clip is cut for. */
export const INTRO_FRAME_RATIO = 16 / 9;

/** The Skip control shows after this long. */
export const INTRO_SKIP_AFTER_MS = 1500;
/** Cross-cut from the last frame to the live Entry Portal. */
export const INTRO_OUTRO_MS = 900;

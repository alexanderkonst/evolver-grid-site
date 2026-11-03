import { describe, expect, it } from "vitest";
import { INTRO_CLIPS, INTRO_OVERLAYS } from "@/data/introSequence";
import { captionLayout, coverRect, overlayPhase, playLength, portalEase, portalFrame, stillLayers } from "@/lib/introTimeline";

const ov = (id: string) => INTRO_OVERLAYS.find((o) => o.id === id)!;
const at = (name: string, t: number) => ({ clip: INTRO_CLIPS.findIndex((c) => c.name === name), t });

describe("intro v2 timeline", () => {
  it("has the eight clips of the script, ~40 s, ending on the V4b vortex", () => {
    expect(INTRO_CLIPS.map((c) => c.name)).toEqual(["V1", "V2a", "V2b", "V3a", "V3b", "V3c", "V4a", "V4b"]);
    expect(INTRO_CLIPS.reduce((s, c) => s + c.length, 0)).toBe(40);
    expect(INTRO_CLIPS[INTRO_CLIPS.length - 1].name).toBe("V4b");
  });

  it("never shows the Entry Portal's picture: no clip or still uses f8-entry-portal (#307)", () => {
    for (const c of INTRO_CLIPS) {
      expect(c.from).not.toBe("f8-entry-portal");
      expect(c.to).not.toBe("f8-entry-portal");
      for (const t of [0, 1, 2, 3, 3.9]) for (const l of stillLayers(c, t)) expect(l.frame).not.toBe("f8-entry-portal");
    }
    // V4b's still fallback holds the pavilion to the end.
    expect(stillLayers(INTRO_CLIPS[INTRO_CLIPS.length - 1], 3.99)).toEqual([{ frame: "f7-pavilion", opacity: 1 }]);
  });

  it("chains still frames: each clip starts on the frame the previous one ends on", () => {
    for (let i = 1; i < INTRO_CLIPS.length; i++) expect(INTRO_CLIPS[i].from).toBe(INTRO_CLIPS[i - 1].to);
  });

  it("«You are the fifth element.» lives V1 0.4–3.2 s", () => {
    expect(overlayPhase(ov("fifth"), at("V1", 0.3))).toBe("before");
    expect(overlayPhase(ov("fifth"), at("V1", 1))).toBe("in");
    expect(overlayPhase(ov("fifth"), at("V1", 3.0))).toBe("out");
    expect(overlayPhase(ov("fifth"), at("V1", 3.3))).toBe("gone");
  });

  it("the five captions span V1 3.4 s → V2a 0.8 s, fading over V2a 0–0.8 s", () => {
    expect(overlayPhase(ov("elements"), at("V1", 3.3))).toBe("before");
    expect(overlayPhase(ov("elements"), at("V1", 7.9))).toBe("in");
    expect(overlayPhase(ov("elements"), at("V2a", 0.1))).toBe("out");
    expect(overlayPhase(ov("elements"), at("V2a", 0.9))).toBe("gone");
  });

  it("START GAME ignites at V4b 3.4 s, on the last clip's tail, and stays", () => {
    expect(overlayPhase(ov("start"), at("V4b", 3.3))).toBe("before");
    expect(overlayPhase(ov("start"), at("V4b", 3.41))).toBe("in");
    expect(overlayPhase(ov("start"), at("V4b", 99))).toBe("in");
    // The clock stops at the last clip's end, so the ignite must start and finish inside it.
    const start = ov("start");
    const last = INTRO_CLIPS[INTRO_CLIPS.length - 1];
    expect(start.at.clip).toBe(INTRO_CLIPS.length - 1);
    expect(start.at.t + (start.ignite ?? 0)).toBeLessThanOrEqual(last.length);
    expect(last.length - start.at.t).toBeGreaterThanOrEqual(0.5);
    expect(last.length - start.at.t).toBeLessThanOrEqual(0.7);
  });

  it("caps a long clip at its duration and plays a short one to its end", () => {
    const c = { name: "X", length: 6, duration: 6, from: "f1-title", to: "f1-title" } as const;
    expect(playLength(c, 8)).toBe(6);
    expect(playLength(c, 5)).toBe(5);
    expect(playLength({ ...c, duration: undefined }, 8)).toBe(8);
    expect(playLength({ ...c, start: 1 }, 8)).toBe(6);
    // rate 2: an 8 s file fills a 4 s slot whole
    expect(playLength({ ...c, length: 4, duration: undefined, rate: 2 }, 8)).toBe(4);
  });

  it("dissolves from the first to the last frame", () => {
    const v1 = INTRO_CLIPS[0];
    expect(stillLayers(v1, 0)[1].opacity).toBe(0);
    expect(stillLayers(v1, 3.1)[1].opacity).toBe(1);
  });

  it("puts captions under the elements on wide screens and stacked on phones", () => {
    const wide = captionLayout(1920, 1080);
    expect(wide.mode).toBe("frame");
    expect(Math.round(wide.items[2].x)).toBe(960);
    expect(captionLayout(1440, 900).mode).toBe("frame"); // 16:10 trims ~5 % each side
    const phone = captionLayout(390, 844);
    expect(phone.mode).toBe("stack");
    for (const i of phone.items) expect(i.x).toBeGreaterThan(0);
  });
});

describe("intro v2: portal-landing math (kept, no clip uses it since #307)", () => {
  const gate = [150 / 1920, 0, 1619 / 1920, 1] as const;

  it("draws a cover image where CSS does (object-position 50% 10%)", () => {
    // 1264×843 scene in a 1440×900 box: scaled to 1440×960, 6 px above the top.
    const r = coverRect({ x: 0, y: 0, w: 1440, h: 900 }, 1264, 843, 0.5, 0.1);
    expect(r.w).toBeCloseTo(1440, 3);
    expect(r.h).toBeCloseTo(960.3, 0);
    expect(r.y).toBeCloseTo(-6, 0);
  });

  it("starts covering the screen, as every clip plays", () => {
    const scene = coverRect({ x: 0, y: 0, w: 1440, h: 900 }, 1264, 843, 0.5, 0.1);
    const f = portalFrame(1440, 900, gate, scene, 0);
    expect(f).toEqual({ x: -80, y: 0, w: 1600, h: 900 });
  });

  it("ends with the gate region exactly on the portal's picture", () => {
    for (const [vw, vh] of [
      [1440, 900],
      [390, 844],
      [1920, 1080],
    ]) {
      const scene = coverRect({ x: 0, y: 0, w: vw, h: vh }, 1264, 843, 0.5, 0.1);
      const f = portalFrame(vw, vh, gate, scene, 1);
      expect(f.x + gate[0] * f.w).toBeCloseTo(scene.x, 6);
      expect(f.y).toBeCloseTo(scene.y, 6);
      expect(gate[2] * f.w).toBeCloseTo(scene.w, 6);
      expect(f.h).toBeCloseTo(scene.h, 6);
      // Still 16:9 (no visible stretch).
      expect(f.w / f.h).toBeCloseTo(16 / 9, 2);
    }
  });

  it("eases in over the settle time", () => {
    expect(portalEase(0, 2.6)).toBe(0);
    expect(portalEase(1.3, 2.6)).toBeCloseTo(0.5, 6);
    expect(portalEase(4, 2.6)).toBe(1);
  });

  it("no clip lands on the portal's picture any more (V4c dropped, #307)", () => {
    expect(INTRO_CLIPS.filter((c) => c.portal).map((c) => c.name)).toEqual([]);
  });
});

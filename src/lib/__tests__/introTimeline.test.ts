import { describe, expect, it } from "vitest";
import { INTRO_CLIPS, INTRO_OVERLAYS } from "@/data/introSequence";
import { captionLayout, overlayPhase, playLength, stillLayers } from "@/lib/introTimeline";

const ov = (id: string) => INTRO_OVERLAYS.find((o) => o.id === id)!;
const at = (name: string, t: number) => ({ clip: INTRO_CLIPS.findIndex((c) => c.name === name), t });

describe("intro v2 timeline", () => {
  it("has the nine clips of the script, ~44 s", () => {
    expect(INTRO_CLIPS.map((c) => c.name)).toEqual(["V1", "V2a", "V2b", "V3a", "V3b", "V3c", "V4a", "V4b", "V4c"]);
    expect(INTRO_CLIPS.reduce((s, c) => s + c.length, 0)).toBe(44);
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

  it("START GAME ignites at V4c 3.3 s and stays", () => {
    expect(overlayPhase(ov("start"), at("V4c", 3.2))).toBe("before");
    expect(overlayPhase(ov("start"), at("V4c", 3.31))).toBe("in");
    expect(overlayPhase(ov("start"), at("V4c", 99))).toBe("in");
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

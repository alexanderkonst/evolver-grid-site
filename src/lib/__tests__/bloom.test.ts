// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  BLOOM_CACHE_KEY,
  BLOOM_COLORS,
  BLOOM_MAX,
  BLOOM_PREVIEW_KEY,
  BLOOM_SKY,
  BLOOM_STAGES,
  BLOOM_WARM_HEX,
  LUNAR_LIGHTEST_NIGHT,
} from "@/config/bloom";
import {
  BLOOM_CHANGED_EVENT,
  bloomLevelFor,
  bloomVars,
  commitEarned,
  litColors,
  parseBloomPreview,
  readBloomCache,
  stageColor,
  syncBloomPreview,
} from "@/lib/bloom";
import { bloomUniverse, earnedBloomObjects } from "@/lib/bloomEarned";
import { PLACE_OBJECTS } from "@/lib/placeColor";

const rgb = (hex: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const over = (top: number[], alpha: number, under: number[]) => top.map((v, i) => v * alpha + under[i] * (1 - alpha));

describe("bloomLevel: one global colorfulness, 0…9", () => {
  const total = 12;

  it("a guest with nothing earned is moon silver", () => {
    expect(bloomLevelFor(0, total)).toBe(0);
  });

  it("the first object gives the first warm light, then one color per object", () => {
    expect(bloomLevelFor(1, total)).toBe(1);
    for (let n = 2; n <= 8; n++) expect(bloomLevelFor(n, total)).toBe(n);
  });

  it("dawn (9) only when every object is earned", () => {
    expect(bloomLevelFor(total - 1, total)).toBe(8);
    expect(bloomLevelFor(total, total)).toBe(BLOOM_MAX);
  });

  it("the seven colors light one by one, stage 1 lights none", () => {
    expect(litColors(0)).toBe(0);
    expect(litColors(1)).toBe(0);
    expect(litColors(2)).toBe(1);
    expect(litColors(8)).toBe(7);
    expect(litColors(9)).toBe(7);
    expect(BLOOM_COLORS).toHaveLength(7);
  });

  it("a new stage lights its own color: warm at 1, then the palette in order", () => {
    expect(stageColor(1)).toBe(BLOOM_WARM_HEX);
    BLOOM_COLORS.forEach((c, i) => expect(stageColor(i + 2)).toBe(c.hex));
  });

  it("saturation and warmth only ever rise from silver to the full palette", () => {
    expect(BLOOM_STAGES).toHaveLength(BLOOM_MAX + 1);
    expect(BLOOM_STAGES[0]).toEqual({ saturation: 0, warmth: 0 });
    expect(BLOOM_STAGES[BLOOM_MAX]).toEqual({ saturation: 1, warmth: 1 });
    for (let i = 1; i < BLOOM_STAGES.length; i++) {
      expect(BLOOM_STAGES[i].saturation).toBeGreaterThan(BLOOM_STAGES[i - 1].saturation);
      expect(BLOOM_STAGES[i].warmth).toBeGreaterThanOrEqual(BLOOM_STAGES[i - 1].warmth);
    }
  });
});

describe("the objects the world counts", () => {
  it("counts an object once even when it lives in two places", () => {
    const all = Object.values(PLACE_OBJECTS).flat();
    expect(bloomUniverse().length).toBeLessThan(all.length);
    expect(new Set(bloomUniverse()).size).toBe(bloomUniverse().length);
  });

  it("reads earned objects from the save's `met`, nothing else", () => {
    expect(earnedBloomObjects({})).toEqual([]);
    expect(earnedBloomObjects({ "find-top-talent": true, "not-an-object": true, "map-assets": false })).toEqual([
      "find-top-talent",
    ]);
  });

  it("the first Journey step is enough for the first light", () => {
    const earned = earnedBloomObjects({ "find-top-talent": true });
    expect(bloomLevelFor(earned.length, bloomUniverse().length)).toBe(1);
  });
});

describe("bloomVars: what lands on <html>", () => {
  it("stage 0 is fully silver: no saturation, no warmth, every color transparent", () => {
    const v = bloomVars(0);
    expect(v["--bloom-sat"]).toBe("0.000");
    expect(v["--bloom-warm"]).toBe("0.000");
    for (let i = 1; i <= 7; i++) expect(v[`--bloom-c${i}`]).toMatch(/ \/ 0\)$/);
  });

  it("each stage lights exactly the colors it should", () => {
    const v = bloomVars(4);
    expect([1, 2, 3, 4, 5, 6, 7].map((i) => v[`--bloom-c${i}`].endsWith("/ 1)"))).toEqual([
      true, true, true, false, false, false, false,
    ]);
  });

  it("dawn lights all seven at full saturation", () => {
    const v = bloomVars(9);
    expect(v["--bloom-sat"]).toBe("1.000");
    for (let i = 1; i <= 7; i++) expect(v[`--bloom-c${i}`].endsWith("/ 1)")).toBe(true);
  });

  it("clamps a level outside 0…9", () => {
    expect(bloomVars(-3)["--bloom-level"]).toBe("0");
    expect(bloomVars(42)["--bloom-level"]).toBe("9");
  });
});

describe("?bloom=N preview", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("parses a stage, clamps it, and understands off", () => {
    expect(parseBloomPreview("?bloom=3")).toBe(3);
    expect(parseBloomPreview("?bloom=99")).toBe(9);
    expect(parseBloomPreview("?bloom=off")).toBe("off");
    expect(parseBloomPreview("?bloom=banana")).toBeNull();
    expect(parseBloomPreview("?other=1")).toBeNull();
  });

  it("is remembered for the session, so it survives navigation, until switched off", () => {
    expect(syncBloomPreview("?bloom=5")).toBe(5);
    expect(syncBloomPreview("")).toBe(5);
    expect(window.sessionStorage.getItem(BLOOM_PREVIEW_KEY)).toBe("5");
    expect(syncBloomPreview("?bloom=off")).toBeNull();
    expect(syncBloomPreview("")).toBeNull();
  });
});

describe("commitEarned: the cache and the moment of earning", () => {
  beforeEach(() => window.localStorage.clear());

  const listen = () => {
    const seen: boolean[] = [];
    const fn = (e: Event) => seen.push((e as CustomEvent<{ celebrate: boolean }>).detail.celebrate);
    window.addEventListener(BLOOM_CHANGED_EVENT, fn);
    return { seen, stop: () => window.removeEventListener(BLOOM_CHANGED_EVENT, fn) };
  };

  it("the first read on a device sets the level quietly: nothing glows", () => {
    const { seen, stop } = listen();
    expect(commitEarned(["find-top-talent", "discover-mission"], 12)).toBe(2);
    expect(seen).toEqual([false]);
    expect(readBloomCache()?.level).toBe(2);
    stop();
  });

  it("a newly earned object glows once, and re-reading the same save does not", () => {
    commitEarned(["find-top-talent"], 12);
    const { seen, stop } = listen();
    commitEarned(["find-top-talent", "discover-mission"], 12);
    commitEarned(["find-top-talent", "discover-mission"], 12);
    expect(seen).toEqual([true]);
    stop();
  });

  it("a signed-out reset to silver does not glow", () => {
    commitEarned(["find-top-talent"], 12);
    const { seen, stop } = listen();
    commitEarned([], 12);
    expect(seen).toEqual([false]);
    expect(readBloomCache()?.level).toBe(0);
    stop();
  });

  it("survives a cache it cannot read", () => {
    window.localStorage.setItem(BLOOM_CACHE_KEY, "{not json");
    expect(readBloomCache()).toBeNull();
    expect(() => commitEarned(["find-top-talent"], 12)).not.toThrow();
  });

  it("does not throw when storage is unavailable", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => commitEarned(["find-top-talent"], 12)).not.toThrow();
    spy.mockRestore();
  });
});

describe("WCAG-AA at every stage (Lunar)", () => {
  const night = rgb(LUNAR_LIGHTEST_NIGHT);
  // Lunar's text tokens (src/index.css): body .92, muted .74, over a night background.
  const ink = [230, 235, 242];

  it("the sky never lifts the background under text above Lunar's lightest night", () => {
    // The sky is drawn as sRGB channels × dim (CSS brightness()), so its brightest pixel is
    // its brightest color at full opacity. If it is no lighter than the lightest night,
    // blending it in cannot raise background luminance past what Lunar already ships.
    const sky = [BLOOM_WARM_HEX, ...BLOOM_COLORS.map((c) => c.hex)];
    for (const hex of sky) {
      const dimmed = rgb(hex).map((v) => v * BLOOM_SKY.dim);
      expect(luminance(dimmed), hex).toBeLessThanOrEqual(luminance(night));
    }
  });

  it("body and muted text stay ≥ 4.5:1 on the worst sky at every stage", () => {
    for (let level = 0; level <= BLOOM_MAX; level++) {
      // The warm horizon over the night, then each lit color's band on top of that: the
      // brightest the page behind the text gets at this stage.
      const warmBg = over(
        rgb(BLOOM_WARM_HEX).map((v) => v * BLOOM_SKY.dim),
        BLOOM_STAGES[level].warmth * BLOOM_SKY.warmAlpha,
        night,
      );
      const backgrounds = [warmBg];
      for (let i = 0; i < litColors(level); i++) {
        backgrounds.push(over(rgb(BLOOM_COLORS[i].hex).map((v) => v * BLOOM_SKY.dim), BLOOM_SKY.bandAlpha, warmBg));
      }
      for (const bg of backgrounds) {
        for (const alpha of [0.92, 0.74]) {
          expect(contrast(over(ink, alpha, bg), bg), `stage ${level} alpha ${alpha}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("stage 0 adds nothing at all: the Lunar original", () => {
    expect(BLOOM_STAGES[0]).toEqual({ saturation: 0, warmth: 0 });
    expect(litColors(0)).toBe(0);
  });

  it("the preview chip is legible: #eef2f7 on #0e141c", () => {
    expect(contrast(rgb("#eef2f7"), rgb("#0e141c"))).toBeGreaterThan(7);
  });
});

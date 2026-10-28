// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MOTION, motionMs, prefersReducedMotion, unseenKeys } from "@/lib/motion";

const css = readFileSync(resolve(__dirname, "../../index.css"), "utf8");
const rootTokens = css.slice(css.indexOf("--motion-fast: 200ms"));

const stubMatchMedia = (reduce: boolean) =>
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("motion tokens", () => {
  it("MOTION mirrors the --motion-* durations in src/index.css", () => {
    for (const [step, ms] of Object.entries(MOTION)) {
      expect(css, `--motion-${step}`).toContain(`--motion-${step}: ${ms}ms;`);
    }
  });

  it("collapses every duration and scale under prefers-reduced-motion", () => {
    const reduced = rootTokens.slice(rootTokens.indexOf("@media (prefers-reduced-motion: reduce)"));
    for (const step of Object.keys(MOTION)) expect(reduced).toContain(`--motion-${step}: 0ms;`);
    expect(reduced).toContain("--motion-zoom: 1;");
    expect(reduced).toContain("--motion-settle: 1;");
  });
});

describe("motionMs", () => {
  it("is the token in milliseconds when motion is allowed", () => {
    stubMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
    expect(motionMs("fast")).toBe(MOTION.fast);
    expect(motionMs("slow")).toBe(MOTION.slow);
  });

  it("is 0 under reduced motion", () => {
    stubMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
    expect(motionMs("base")).toBe(0);
  });

  it("is 0 where motion cannot be asked about (nothing waits)", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(motionMs("slow")).toBe(0);
  });
});

describe("unseenKeys", () => {
  it("with no memory, everything is new", () => {
    expect(unseenKeys(null, ["house", "workshop"])).toEqual(["house", "workshop"]);
  });

  it("returns only what the player has not seen, in order", () => {
    expect(unseenKeys(["house"], ["house", "workshop", "market"])).toEqual(["workshop", "market"]);
  });

  it("is empty when nothing is new", () => {
    expect(unseenKeys(["house", "market"], ["house"])).toEqual([]);
  });
});

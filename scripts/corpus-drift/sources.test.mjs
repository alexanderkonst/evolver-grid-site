// Fast sanity tests for the drift-check readers and core checks.
// Run with: npm test -- scripts/corpus-drift
import { describe, it, expect } from "vitest";
import { readPlaybookSteps, readCanvasV3Table } from "./sources.mjs";
import * as pricesCheck from "./checks/prices.mjs";
import * as subtitlesCheck from "./checks/subtitles.mjs";
import * as bundlesCheck from "./checks/bundles.mjs";

describe("readPlaybookSteps", () => {
  it("extracts 7 steps with number + subtitle", () => {
    const steps = readPlaybookSteps();
    expect(steps).toHaveLength(7);
    expect(steps.map((s) => s.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(steps[0].subtitle).toBe("Name Your Top Talent");
  });

  it("captures bundleWith for Steps 2–5", () => {
    const steps = readPlaybookSteps();
    expect(steps[1].bundleWith).toEqual([3]);
    expect(steps[2].bundleWith).toEqual([2]);
    expect(steps[3].bundleWith).toEqual([5]);
    expect(steps[4].bundleWith).toEqual([4]);
  });
});

describe("readCanvasV3Table", () => {
  it("parses 7 rows from the v3.0 table", () => {
    const rows = readCanvasV3Table();
    expect(rows).toHaveLength(7);
    expect(rows[0].number).toBe(1);
    expect(rows[0].subtitle).toBe("Name Your Top Talent");
  });
});

describe("current corpus is green", () => {
  it("passes all three checks", () => {
    const code = readPlaybookSteps();
    const canvas = readCanvasV3Table();
    const ctx = { code, canvas };

    expect(pricesCheck.run(ctx).passed).toBe(true);
    expect(subtitlesCheck.run(ctx).passed).toBe(true);
    expect(bundlesCheck.run(ctx).passed).toBe(true);
  });
});

describe("bundle symmetry check fails on asymmetric input", () => {
  it("detects one-sided bundleWith", () => {
    const code = [
      { number: 2, subtitle: "A", price: "$555", bundleWith: [3] },
      { number: 3, subtitle: "B", price: "$555", bundleWith: [] },
    ];
    const canvas = [
      { number: 2, subtitle: "A", container: "Ignition", price: "$555" },
      { number: 3, subtitle: "B", container: "Ignition", price: "$555" },
    ];
    const result = bundlesCheck.run({ code, canvas });
    expect(result.passed).toBe(false);
    expect(result.issues.some((i) => /Asymmetric/.test(i.message))).toBe(true);
  });
});

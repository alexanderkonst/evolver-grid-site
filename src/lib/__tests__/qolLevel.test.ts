import { describe, expect, it } from "vitest";
import { computeQolLevel } from "../qolLevel";

const base = {
  wealth_stage: 6,
  health_stage: 7,
  happiness_stage: 8,
  love_relationships_stage: 7,
  impact_stage: 9,
  growth_stage: 8,
  social_ties_stage: 6,
  home_stage: 7,
};

describe("computeQolLevel", () => {
  it("returns null with no snapshot", () => {
    expect(computeQolLevel(null)).toBeNull();
    expect(computeQolLevel(undefined)).toBeNull();
  });

  it("returns null when a stage is missing instead of inventing a default", () => {
    expect(computeQolLevel({ ...base, home_stage: null })).toBeNull();
  });

  it("level is the weakest domain, first in QoL order on ties", () => {
    const result = computeQolLevel(base);
    expect(result?.level).toBe(6);
    expect(result?.weakest).toBe("wealth");
    expect(result?.domains).toHaveLength(8);
  });

  it("follows the weakest domain down", () => {
    const result = computeQolLevel({ ...base, love_relationships_stage: 2 });
    expect(result).toMatchObject({ level: 2, weakest: "love" });
  });
});

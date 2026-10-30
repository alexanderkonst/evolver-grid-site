import { describe, expect, it } from "vitest";
import { computeQolLevel, qolAverageLevel } from "../qolLevel";

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

  it("level is the mean of the 8 domains, not the weakest", () => {
    const result = computeQolLevel(base);
    expect(result?.level).toBe(7.3);
    expect(result?.weakest).toBe("wealth");
    expect(result?.domains).toHaveLength(8);
  });

  it("the weakest domain still names the growth edge but no longer sets the level", () => {
    const result = computeQolLevel({ ...base, love_relationships_stage: 2 });
    expect(result).toMatchObject({ level: 6.6, weakest: "love" });
  });
});

describe("qolAverageLevel", () => {
  it("is the mean of the 8 domains to one decimal", () => {
    expect(qolAverageLevel(base)).toBe(7.3);
  });

  it("is a whole number when the mean is whole", () => {
    const flat = Object.fromEntries(Object.keys(base).map((k) => [k, 5]));
    expect(qolAverageLevel(flat)).toBe(5);
  });

  it("is null without a snapshot or with a missing stage", () => {
    expect(qolAverageLevel(null)).toBeNull();
    expect(qolAverageLevel({ ...base, health_stage: null })).toBeNull();
  });
});

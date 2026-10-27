import { describe, expect, it } from "vitest";
import { getQolLevel } from "@/lib/characterSheet";

const snapshot = {
  wealth_stage: 7,
  health_stage: 8,
  happiness_stage: 6,
  love_relationships_stage: 9,
  impact_stage: 5,
  growth_stage: 8,
  social_ties_stage: 7,
  home_stage: 6,
};

describe("getQolLevel", () => {
  it("returns null without a snapshot", () => {
    expect(getQolLevel(null)).toBeNull();
    expect(getQolLevel(undefined)).toBeNull();
    expect(getQolLevel({})).toBeNull();
  });

  it("uses the weakest of the 8 domains as the level", () => {
    const result = getQolLevel(snapshot);
    expect(result?.level).toBe(5);
    expect(result?.weakest).toBe("impact");
    expect(result?.domains).toHaveLength(8);
  });

  it("maps love to love_relationships_stage and socialTies to social_ties_stage", () => {
    const result = getQolLevel({ ...snapshot, love_relationships_stage: 2, social_ties_stage: 3 });
    expect(result?.level).toBe(2);
    expect(result?.weakest).toBe("love");
  });

  it("ignores unscored domains instead of treating them as zero", () => {
    const result = getQolLevel({ ...snapshot, home_stage: 0, impact_stage: null });
    expect(result?.level).toBe(6);
    expect(result?.domains).toHaveLength(6);
  });
});

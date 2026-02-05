import { describe, expect, it } from "vitest";
import { buildQolResultsPath, shouldUnlockAfterQol, getPostZogRedirect } from "@/lib/onboardingRouting";

describe("onboardingRouting", () => {
  it("builds QoL results path without return param", () => {
    expect(buildQolResultsPath(null)).toBe("/quality-of-life-map/results");
  });

  it("builds QoL results path with return param", () => {
    expect(buildQolResultsPath("/start")).toBe("/quality-of-life-map/results?return=%2Fstart");
  });

  it("unlocks after QoL when returning to start", () => {
    expect(shouldUnlockAfterQol("/start")).toBe(true);
    expect(shouldUnlockAfterQol("/something-else")).toBe(false);
  });

  it("returns post-ZoG redirect only for onboarding", () => {
    expect(getPostZogRedirect("/start")).toBe("/start");
    expect(getPostZogRedirect("/game/profile")).toBe(null);
  });
});

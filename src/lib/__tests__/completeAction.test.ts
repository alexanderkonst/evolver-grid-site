import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/xpSystem", () => ({
  awardXp: vi.fn(async () => ({ success: true, newXp: 100, newLevel: 2 })),
}));

vi.mock("@/lib/upgradeSystem", () => ({
  completeUpgrade: vi.fn(async () => ({ success: true })),
}));

vi.mock("@/lib/practiceSystem", () => ({
  markPracticeDone: vi.fn(async () => ({ success: true })),
}));

vi.mock("@/lib/questCompletion", () => ({
  completeLegacyQuest: vi.fn(async () => ({ success: true, xpAwarded: 10 })),
}));

const logActionEvent = vi.fn(async () => ({ success: true }));
vi.mock("@/lib/actionEvents", () => ({
  logActionEvent: (...args: any[]) => logActionEvent(...args),
}));

const updateGrowthPathProgress = vi.fn(async () => ({ success: true }));
vi.mock("@/lib/growthPathProgress", () => ({
  updateGrowthPathProgress: (...args: any[]) => updateGrowthPathProgress(...args),
}));

describe("completeAction", () => {
  it("awards XP for growth path steps via generic completion", async () => {
    const { completeAction } = await import("@/lib/completeAction");
    const result = await completeAction(
      {
        id: "sequence:genius:step-1",
        type: "growth_path_step",
        space: "transformation",
        title: "Name your genius edge",
        growthPath: "genius",
        source: "fixtures",
        completionPayload: { xp: 50, metadata: { stepIndex: 0, version: "v1" } },
      },
      { profileId: "profile-1" }
    );

    expect(result.success).toBe(true);
    expect(result.xpAwarded).toBe(50);
    expect(updateGrowthPathProgress).toHaveBeenCalledWith({
      profileId: "profile-1",
      growthPath: "genius",
      stepIndex: 1,
      version: "v1",
    });
    expect(logActionEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        actionId: "sequence:genius:step-1",
        profileId: "profile-1",
        growthPath: "genius",
      })
    );
  });
});

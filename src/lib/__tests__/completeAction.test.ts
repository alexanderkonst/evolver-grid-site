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

describe("completeAction", () => {
  it("awards XP for growth path steps via generic completion", async () => {
    const { completeAction } = await import("@/lib/completeAction");
    const result = await completeAction(
      {
        id: "sequence:genius:step-1",
        type: "growth_path_step",
        loop: "transformation",
        title: "Name your genius edge",
        growthPath: "genius",
        source: "fixtures",
        completionPayload: { xp: 50 },
      },
      { profileId: "profile-1" }
    );

    expect(result.success).toBe(true);
    expect(result.xpAwarded).toBe(50);
  });
});

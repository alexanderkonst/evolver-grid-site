import { describe, expect, it, vi, beforeEach } from "vitest";

const awardXpMock = vi.fn(async () => ({ success: true, newXp: 100, newLevel: 2 }));
const updateMock = vi.fn(async () => ({ error: null }));
const maybeSingleMock = vi.fn(async () => ({ data: { first_time_actions: {} }, error: null }));

vi.mock("@/lib/xpSystem", () => ({
  awardXp: awardXpMock,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: maybeSingleMock,
        }),
      }),
      update: () => ({
        eq: updateMock,
      }),
    }),
  },
}));

describe("xpService", () => {
  beforeEach(() => {
    awardXpMock.mockClear();
    updateMock.mockClear();
    maybeSingleMock.mockClear();
  });

  it("returns no bonus when action already completed", async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: { first_time_actions: { first_event_rsvp: true } },
      error: null,
    });

    const { awardFirstTimeBonus } = await import("@/lib/xpService");
    const result = await awardFirstTimeBonus("profile-1", "first_event_rsvp", 25, 2, "spirit");

    expect(result).toEqual({ awarded: false, xp: 0 });
    expect(awardXpMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("awards bonus and marks action completed", async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: { first_time_actions: {} },
      error: null,
    });

    const { awardFirstTimeBonus } = await import("@/lib/xpService");
    const result = await awardFirstTimeBonus("profile-2", "first_event_rsvp", 25, 2, "spirit");

    expect(result).toEqual({ awarded: true, xp: 50 });
    expect(awardXpMock).toHaveBeenCalledWith("profile-2", 50, "spirit");
    expect(updateMock).toHaveBeenCalled();
  });
});

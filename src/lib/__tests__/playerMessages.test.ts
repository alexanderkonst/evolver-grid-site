import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import { buildThreads, otherParty, partnerFromRow, threadPath, type PlayerMessage } from "../playerMessages";

const ME = "me";
const msg = (id: string, from: string, to: string, at: string, read: string | null = null): PlayerMessage => ({
  id,
  sender_id: from,
  recipient_id: to,
  body: id,
  created_at: at,
  read_at: read,
});

describe("playerMessages", () => {
  it("names the other person from either side", () => {
    expect(otherParty(msg("a", ME, "ann", "2026-11-21T10:00:00Z"), ME)).toBe("ann");
    expect(otherParty(msg("b", "ann", ME, "2026-11-21T10:01:00Z"), ME)).toBe("ann");
  });

  it("groups messages into threads, newest thread first, whatever the input order", () => {
    const threads = buildThreads(
      [
        msg("old-ann", "ann", ME, "2026-11-20T09:00:00Z", "2026-11-20T09:05:00Z"),
        msg("bob-1", "bob", ME, "2026-11-21T08:00:00Z"),
        msg("reply-ann", ME, "ann", "2026-11-21T12:00:00Z"),
      ],
      ME,
    );
    expect(threads.map((t) => t.otherUserId)).toEqual(["ann", "bob"]);
    expect(threads[0].last.id).toBe("reply-ann");
  });

  it("counts only unread messages addressed to me", () => {
    const threads = buildThreads(
      [
        msg("1", "ann", ME, "2026-11-21T08:00:00Z"),
        msg("2", "ann", ME, "2026-11-21T09:00:00Z"),
        msg("3", "ann", ME, "2026-11-21T10:00:00Z", "2026-11-21T10:30:00Z"),
        msg("4", ME, "ann", "2026-11-21T11:00:00Z"), // mine, never counts
      ],
      ME,
    );
    expect(threads).toHaveLength(1);
    expect(threads[0].unread).toBe(2);
  });

  it("points a thread at the in-game messages route", () => {
    expect(threadPath("ann")).toBe("/game/collaborate/messages/ann");
  });

  it("builds a partner's display name and avatar from an RPC row", () => {
    expect(
      partnerFromRow({ user_id: "ada", first_name: "Ada", last_name: "QA-A test", avatar_url: null }),
    ).toEqual({ userId: "ada", name: "Ada QA-A test", avatarUrl: null });
    expect(partnerFromRow({ user_id: "bo", first_name: "Bo", last_name: null, avatar_url: "u.png" })).toEqual({
      userId: "bo",
      name: "Bo",
      avatarUrl: "u.png",
    });
  });

  it("returns an empty name (so the caller falls back) when the profile has none, and skips rows without an id", () => {
    expect(partnerFromRow({ user_id: "x", first_name: null, last_name: " ", avatar_url: null })?.name).toBe("");
    expect(partnerFromRow({ user_id: null, first_name: "Z", last_name: null, avatar_url: null })).toBeNull();
  });
});

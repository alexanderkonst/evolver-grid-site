import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Collective WP2, the client side of the invite link. The rules themselves (single use, expiry,
 * role + member row) are in SQL and are exercised against a real Postgres in
 * supabase/tests/collective_invites.test.sql. Here: what the page does with each answer,
 * the code generator, the profile fields, and the entry-guard path test.
 * Test people are «member 1» / «member 2»; no real names.
 */

const rpc = vi.hoisted(() => ({
  results: {} as Record<string, { data: unknown; error: unknown }>,
  calls: [] as { fn: string; args: unknown }[],
}));
const inserted = vi.hoisted(() => ({ rows: [] as unknown[] }));
const session = vi.hoisted(() => ({ userId: "member-1" as string | null }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: async (fn: string, args: unknown) => {
      rpc.calls.push({ fn, args });
      return rpc.results[fn] ?? { data: null, error: null };
    },
    auth: {
      getSession: async () => ({ data: { session: session.userId ? { user: { id: session.userId } } : null } }),
    },
    from: () => ({
      insert: async (row: unknown) => {
        inserted.rows.push(row);
        return { error: null };
      },
    }),
  },
}));

import {
  authPathForInvite,
  buildProfileRow,
  checkCollectiveInvite,
  COLLECTIVE_SPACE_LIVE,
  collectiveLandingPath,
  createCollectiveInvite,
  daysLeft,
  generateInviteCode,
  inviteFailure,
  invitePath,
  isCollectiveEntryPath,
  looksLikeInviteCode,
  normalizeInviteStatus,
  normalizeSiteUrl,
  redeemCollectiveInvite,
} from "../collectiveInvites";

beforeEach(() => {
  rpc.results = {};
  rpc.calls = [];
  inserted.rows = [];
  session.userId = "member-1";
});

describe("invite status", () => {
  it("passes the five known words through and turns anything else into invalid", () => {
    for (const s of ["ok", "used", "expired", "invalid", "already_member"]) expect(normalizeInviteStatus(s)).toBe(s);
    expect(normalizeInviteStatus(null)).toBe("invalid");
    expect(normalizeInviteStatus(undefined)).toBe("invalid");
    expect(normalizeInviteStatus("OK")).toBe("invalid");
    expect(normalizeInviteStatus({ status: "ok" })).toBe("invalid");
  });

  it("ok and already_member carry on; used, expired and invalid are a dead link", () => {
    expect(inviteFailure("ok")).toBeNull();
    expect(inviteFailure("already_member")).toBeNull();
    expect(inviteFailure("used")).toBe("used");
    expect(inviteFailure("expired")).toBe("expired");
    expect(inviteFailure("invalid")).toBe("invalid");
  });
});

describe("redeemCollectiveInvite / checkCollectiveInvite", () => {
  it("asks the database for the code and returns its word", async () => {
    rpc.results.redeem_collective_invite = { data: "ok", error: null };
    expect(await redeemCollectiveInvite("abcdefghijkl")).toBe("ok");
    expect(rpc.calls).toEqual([{ fn: "redeem_collective_invite", args: { p_code: "abcdefghijkl" } }]);
  });

  it("second use, expired and unknown codes come back as the database says", async () => {
    for (const word of ["used", "expired", "invalid"] as const) {
      rpc.results.redeem_collective_invite = { data: word, error: null };
      expect(await redeemCollectiveInvite("abcdefghijkl")).toBe(word);
    }
  });

  it("a transport error throws on redeem (the page says «try again», never «expired»)", async () => {
    rpc.results.redeem_collective_invite = { data: null, error: { message: "network" } };
    await expect(redeemCollectiveInvite("abcdefghijkl")).rejects.toBeTruthy();
  });

  it("check reads the anon function and never reports already_member", async () => {
    rpc.results.check_collective_invite = { data: "expired", error: null };
    expect(await checkCollectiveInvite("abcdefghijkl")).toBe("expired");
    rpc.results.check_collective_invite = { data: "already_member", error: null };
    expect(await checkCollectiveInvite("abcdefghijkl")).toBe("invalid");
    rpc.results.check_collective_invite = { data: null, error: { message: "boom" } };
    expect(await checkCollectiveInvite("abcdefghijkl")).toBe("invalid");
  });
});

describe("invite code", () => {
  it("is at least 12 URL-safe characters and differs each time", () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateInviteCode()));
    expect(codes.size).toBe(200);
    for (const c of codes) {
      expect(c.length).toBeGreaterThanOrEqual(12);
      expect(c).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(looksLikeInviteCode(c)).toBe(true);
    }
  });

  it("route params that cannot be a code never reach the database", () => {
    expect(looksLikeInviteCode(undefined)).toBe(false);
    expect(looksLikeInviteCode("short")).toBe(false);
    expect(looksLikeInviteCode("has space in it!!")).toBe(false);
    expect(looksLikeInviteCode("a".repeat(65))).toBe(false);
  });

  it("the admin insert records the signed-in admin as created_by", async () => {
    session.userId = "member-1";
    const code = await createCollectiveInvite();
    expect(inserted.rows).toEqual([{ code, created_by: "member-1" }]);
  });

  it("creating without a session fails and writes nothing", async () => {
    session.userId = null;
    await expect(createCollectiveInvite()).rejects.toThrow();
    expect(inserted.rows).toEqual([]);
  });
});

describe("routes", () => {
  it("a signed-out visitor returns to the same invite route after sign-in", () => {
    expect(invitePath("abcdefghijkl")).toBe("/join/collective/abcdefghijkl");
    expect(authPathForInvite("abcdefghijkl")).toBe("/auth?redirect=%2Fjoin%2Fcollective%2Fabcdefghijkl");
  });

  it("lands on /game until the members' space exists, then on /game/collective", () => {
    expect(collectiveLandingPath()).toBe(COLLECTIVE_SPACE_LIVE ? "/game/collective" : "/game");
  });
});

describe("entry-guard exception path test", () => {
  it("matches only /game/collective and what sits under it", () => {
    expect(isCollectiveEntryPath("/game/collective")).toBe(true);
    expect(isCollectiveEntryPath("/game/collective/members")).toBe(true);
    expect(isCollectiveEntryPath("/game/collectivefoo")).toBe(false);
    expect(isCollectiveEntryPath("/game/collaborate")).toBe(false);
    expect(isCollectiveEntryPath("/game/journey")).toBe(false);
    expect(isCollectiveEntryPath("/game/me")).toBe(false);
    expect(isCollectiveEntryPath("/join/collective/abcdefghijkl")).toBe(false);
    expect(isCollectiveEntryPath("/")).toBe(false);
  });
});

describe("profile", () => {
  const base = { uniquenessLine: "member 1 builds quiet tools", offers: "", seeks: "", siteUrl: "" };

  it("needs only the uniqueness line", () => {
    expect(buildProfileRow({ ...base, uniquenessLine: "   " })).toEqual({ error: "uniquenessRequired" });
    expect(buildProfileRow(base)).toEqual({
      row: { uniqueness_line: "member 1 builds quiet tools", offers: null, seeks: null, site_url: null },
    });
  });

  it("trims and keeps the optional fields", () => {
    const built = buildProfileRow({ ...base, offers: " design ", seeks: " a partner ", siteUrl: "member1.example.com" });
    expect(built).toEqual({
      row: {
        uniqueness_line: "member 1 builds quiet tools",
        offers: "design",
        seeks: "a partner",
        site_url: "https://member1.example.com/",
      },
    });
  });

  it("accepts web addresses only", () => {
    expect(normalizeSiteUrl("")).toBeNull();
    expect(normalizeSiteUrl("https://member2.example.org/path")).toBe("https://member2.example.org/path");
    expect(normalizeSiteUrl("javascript:alert(1)")).toBeUndefined();
    expect(normalizeSiteUrl("ftp://member2.example.org")).toBeUndefined();
    expect(normalizeSiteUrl("not a url")).toBeUndefined();
    expect(normalizeSiteUrl("localhost")).toBeUndefined();
    expect(buildProfileRow({ ...base, siteUrl: "javascript:alert(1)" })).toEqual({ error: "siteInvalid" });
  });
});

describe("daysLeft", () => {
  const now = new Date("2026-11-25T12:00:00Z");
  it("rounds up and floors at zero", () => {
    expect(daysLeft("2026-12-25T12:00:00Z", now)).toBe(30);
    expect(daysLeft("2026-11-26T11:00:00Z", now)).toBe(1);
    expect(daysLeft("2026-11-25T11:00:00Z", now)).toBe(0);
  });
});

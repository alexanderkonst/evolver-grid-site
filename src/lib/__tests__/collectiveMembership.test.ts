import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FounderState } from "@/pages/admin/useFounderStates";

/**
 * In-memory stand-in for the two tables the admin writes to. It records what was written
 * and answers the hook's read, so grant → flag true → revoke → flag false is checked end to end
 * (minus RLS, which lives in the SQL and is exercised in the PR's SQL evidence).
 */
const db = vi.hoisted(() => ({
  roles: [] as { user_id: string; role: string }[],
  members: [] as { user_id: string }[],
  failOn: null as null | "user_roles" | "collective_members",
}));

type Table = "user_roles" | "collective_members";

vi.mock("@/integrations/supabase/client", () => {
  const rows = (t: Table) => (t === "user_roles" ? db.roles : db.members) as Record<string, string>[];
  const setRows = (t: Table, next: Record<string, string>[]) => {
    if (t === "user_roles") db.roles = next as typeof db.roles;
    else db.members = next as typeof db.members;
  };
  const from = (table: Table) => {
    const err = () => (db.failOn === table ? { message: "boom" } : null);
    return {
      upsert: async (row: Record<string, string>, opts: { onConflict: string }) => {
        if (err()) return { error: err() };
        const keys = opts.onConflict.split(",");
        const exists = rows(table).some((r) => keys.every((k) => r[k] === row[k]));
        if (!exists) rows(table).push(row);
        return { error: null };
      },
      delete: () => {
        const filters: [string, string][] = [];
        const chain = {
          eq: (k: string, v: string) => {
            filters.push([k, v]);
            return chain;
          },
          then: (resolve: (v: { error: unknown }) => void) => {
            if (err()) return resolve({ error: err() });
            setRows(
              table,
              rows(table).filter((r) => !filters.every(([k, v]) => r[k] === v)),
            );
            return resolve({ error: null });
          },
        };
        return chain;
      },
      select: () => {
        const filters: [string, string][] = [];
        const matches = () => rows(table).filter((r) => filters.every(([k, v]) => r[k] === v));
        const chain = {
          eq: (k: string, v: string) => {
            filters.push([k, v]);
            return chain;
          },
          maybeSingle: async () => ({ data: matches()[0] ?? null, error: err() }),
          then: (resolve: (v: { data: unknown; error: unknown }) => void) =>
            resolve({ data: matches(), error: err() }),
        };
        return chain;
      },
    };
  };
  return { supabase: { from } };
});

import {
  grantCollectiveMembership,
  listCollectiveMemberIds,
  revokeCollectiveMembership,
  searchPlayers,
} from "../collectiveMembership";
import { fetchIsCollectiveMember } from "@/hooks/useCollectiveMembership";

const MEMBER_1 = "member-1-id";
const MEMBER_2 = "member-2-id";

beforeEach(() => {
  db.roles = [];
  db.members = [];
  db.failOn = null;
});

describe("grant and revoke «member 1»", () => {
  it("grant writes the role and the row, and the membership flag flips to true", async () => {
    expect(await fetchIsCollectiveMember(MEMBER_1)).toBe(false);

    await grantCollectiveMembership(MEMBER_1);

    expect(db.roles).toEqual([{ user_id: MEMBER_1, role: "collective_member" }]);
    expect(db.members).toEqual([{ user_id: MEMBER_1 }]);
    expect(await fetchIsCollectiveMember(MEMBER_1)).toBe(true);
    expect(await listCollectiveMemberIds()).toEqual([MEMBER_1]);
  });

  it("revoke removes both and the flag flips back to false", async () => {
    await grantCollectiveMembership(MEMBER_1);
    await revokeCollectiveMembership(MEMBER_1);

    expect(db.roles).toEqual([]);
    expect(db.members).toEqual([]);
    expect(await fetchIsCollectiveMember(MEMBER_1)).toBe(false);
  });

  it("granting «member 1» leaves «member 2» a non-member", async () => {
    await grantCollectiveMembership(MEMBER_1);
    expect(await fetchIsCollectiveMember(MEMBER_2)).toBe(false);
  });

  it("grant twice is harmless (one role row, one member row)", async () => {
    await grantCollectiveMembership(MEMBER_1);
    await grantCollectiveMembership(MEMBER_1);
    expect(db.roles).toHaveLength(1);
    expect(db.members).toHaveLength(1);
  });

  it("revoke only removes the collective_member role, not another role", async () => {
    db.roles.push({ user_id: MEMBER_1, role: "admin" });
    await grantCollectiveMembership(MEMBER_1);
    await revokeCollectiveMembership(MEMBER_1);
    expect(db.roles).toEqual([{ user_id: MEMBER_1, role: "admin" }]);
  });

  it("a failed role write throws and writes no member row", async () => {
    db.failOn = "user_roles";
    await expect(grantCollectiveMembership(MEMBER_1)).rejects.toMatchObject({ message: "boom" });
    expect(db.members).toEqual([]);
  });

  it("a failed member-row write on revoke throws, after the role is already gone", async () => {
    await grantCollectiveMembership(MEMBER_1);
    db.failOn = "collective_members";
    await expect(revokeCollectiveMembership(MEMBER_1)).rejects.toMatchObject({ message: "boom" });
    expect(db.roles).toEqual([]);
  });
});

describe("fetchIsCollectiveMember", () => {
  it("treats a read error as «not a member»", async () => {
    db.roles.push({ user_id: MEMBER_1, role: "collective_member" });
    db.failOn = "user_roles";
    expect(await fetchIsCollectiveMember(MEMBER_1)).toBe(false);
  });
});

describe("searchPlayers", () => {
  const player = (id: string, name: string, email: string) =>
    ({ user_id: id, display_name: name, email }) as FounderState;
  const players = [
    player(MEMBER_1, "member 1", "member1@example.com"),
    player(MEMBER_2, "member 2", "member2@example.com"),
  ];

  it("matches by name or email, case-insensitively", () => {
    expect(searchPlayers(players, "MEMBER 1").map((p) => p.user_id)).toEqual([MEMBER_1]);
    expect(searchPlayers(players, "member2@").map((p) => p.user_id)).toEqual([MEMBER_2]);
  });

  it("returns nothing for a query shorter than 2 characters", () => {
    expect(searchPlayers(players, "m")).toEqual([]);
    expect(searchPlayers(players, "  ")).toEqual([]);
  });

  it("caps the result list at 8", () => {
    const many = Array.from({ length: 20 }, (_, i) => player(`id-${i}`, `member ${i}`, `m${i}@example.com`));
    expect(searchPlayers(many, "member")).toHaveLength(8);
  });
});

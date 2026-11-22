import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: mocks.rpc, from: mocks.from } }));

import {
  DEED_KINDS,
  checkDeedLine,
  cleanFeed,
  fetchFeed,
  groupTaps,
  isDeedKind,
  isMissingDeedsBackend,
  resetDeedsProbe,
  sendSeen,
  type DeedTap,
} from "../villageFeed";

const ev = (key: string, kind: string, at: string, extra: Record<string, unknown> = {}) => ({
  event_key: key,
  kind,
  doer_id: "ana-id",
  doer_name: "Ana",
  occurred_at: at,
  detail: null,
  is_own: false,
  ...extra,
});

const tap = (id: string, key: string, seer: string, doer: string, at: string, line: string | null = null): DeedTap => ({
  id,
  event_key: key,
  doer_id: doer,
  seer_id: seer,
  seer_name: seer,
  line,
  created_at: at,
});

beforeEach(() => {
  resetDeedsProbe();
  mocks.rpc.mockReset();
  mocks.from.mockReset();
});

describe("cleanFeed", () => {
  it("is newest first whatever order it arrives in", () => {
    const out = cleanFeed([
      ev("a", "resident", "2026-11-20T10:00:00Z"),
      ev("b", "top_talent", "2026-11-22T10:00:00Z"),
      ev("c", "stall", "2026-11-21T10:00:00Z"),
    ]);
    expect(out.map((e) => e.event_key)).toEqual(["b", "c", "a"]);
  });

  it("drops unknown kinds, nameless rows and duplicates (no filler)", () => {
    const out = cleanFeed([
      ev("a", "resident", "2026-11-20T10:00:00Z"),
      ev("a", "resident", "2026-11-20T10:00:00Z"),
      ev("x", "weekly_digest", "2026-11-20T11:00:00Z"),
      ev("n", "resident", "2026-11-20T12:00:00Z", { doer_name: "" }),
    ]);
    expect(out.map((e) => e.event_key)).toEqual(["a"]);
  });

  it("keeps content only when the server sent it, and trims it", () => {
    const [withDetail, without] = cleanFeed([
      ev("a", "top_talent", "2026-11-22T10:00:00Z", { detail: "  The Weaver " }),
      ev("b", "mission", "2026-11-21T10:00:00Z", { detail: "   " }),
    ]);
    expect(withDetail.detail).toBe("The Weaver");
    expect(without.detail).toBeNull();
  });

  it("returns an empty list for anything that is not a list", () => {
    expect(cleanFeed(null)).toEqual([]);
    expect(cleanFeed({})).toEqual([]);
  });
});

describe("event kinds", () => {
  it("covers the v1 victories and none of the later ones (extension points stay open)", () => {
    expect([...DEED_KINDS]).toEqual(["resident", "top_talent", "mission", "uniqueness", "stall", "first_price", "first_sale"]);
    expect(isDeedKind("quest_closed")).toBe(false);
    expect(isDeedKind("circle_happened")).toBe(false);
  });
});

describe("groupTaps", () => {
  it("shows the doer who tapped, oldest first, and my own tap on others' deeds", () => {
    const grouped = groupTaps(
      [
        tap("2", "victory:me:tagline", "bob", "me", "2026-11-22T12:00:00Z", "yes!"),
        tap("1", "victory:me:tagline", "cy", "me", "2026-11-22T11:00:00Z"),
        tap("3", "resident:ana", "me", "ana", "2026-11-22T09:00:00Z"),
      ],
      "me",
    );
    expect(grouped.get("victory:me:tagline")?.from.map((t) => t.id)).toEqual(["1", "2"]);
    expect(grouped.get("victory:me:tagline")?.mine).toBeNull();
    expect(grouped.get("resident:ana")?.mine?.id).toBe("3");
    expect(grouped.get("resident:ana")?.from).toEqual([]);
  });

  it("ignores a tap that is neither mine nor on my deed, and does nothing for a guest", () => {
    expect(groupTaps([tap("1", "k", "bob", "cy", "2026-11-22T11:00:00Z")], "me").size).toBe(0);
    expect(groupTaps([tap("1", "k", "bob", "me", "2026-11-22T11:00:00Z")], null).size).toBe(0);
  });
});

describe("checkDeedLine", () => {
  it("lets the line be empty: the tap alone is enough", () => {
    expect(checkDeedLine("   ")).toEqual({ ok: true, line: null });
  });

  it("accepts a kind line, rejects a long one", () => {
    expect(checkDeedLine("Proud of you")).toEqual({ ok: true, line: "Proud of you" });
    const tooLong = checkDeedLine("x".repeat(141));
    expect(tooLong.ok).toBe(false);
  });

  it("strips contact details and turns away abuse", () => {
    const stripped = checkDeedLine("Lovely, write me at a@b.com");
    expect(stripped.ok && stripped.line).toBe("Lovely, write me at");
    expect(checkDeedLine("you are a fucking idiot").ok).toBe(false);
  });
});

describe("fetchFeed", () => {
  it("is unavailable, not an error, while the migration is not deployed", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "PGRST202", message: "Could not find the function" } });
    expect(await fetchFeed()).toEqual({ available: false });
    // probed once: a second visit does not hit the network again
    await fetchFeed();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it("returns events from the RPC and only the taps RLS lets this viewer read", async () => {
    mocks.rpc.mockResolvedValue({ data: [ev("a", "resident", "2026-11-22T10:00:00Z")], error: null });
    const limit = vi.fn().mockResolvedValue({ data: [], error: null });
    mocks.from.mockReturnValue({ select: () => ({ order: () => ({ limit }) }) });
    const result = await fetchFeed();
    expect(mocks.rpc).toHaveBeenCalledWith("get_village_feed", { p_limit: 40 });
    expect(mocks.from).toHaveBeenCalledWith("deed_seen");
    expect(result.available && result.events.map((e) => e.event_key)).toEqual(["a"]);
  });
});

describe("sendSeen", () => {
  it("sends only the event key: the doer, the tapper and the name are set by the database", async () => {
    const insert = vi.fn().mockReturnValue({
      select: () => ({ single: () => Promise.resolve({ data: tap("1", "resident:ana", "me", "ana", "2026-11-22T09:00:00Z"), error: null }) }),
    });
    mocks.from.mockReturnValue({ insert });
    const result = await sendSeen("resident:ana", "me");
    expect(insert).toHaveBeenCalledWith({ event_key: "resident:ana" });
    expect(result.ok).toBe(true);
  });

  it("returns the first tap when the same tap arrives twice", async () => {
    const existing = tap("1", "resident:ana", "me", "ana", "2026-11-22T09:00:00Z");
    mocks.from
      .mockReturnValueOnce({
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { code: "23505" } }) }) }),
      })
      .mockReturnValueOnce({
        select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: existing, error: null }) }) }) }),
      });
    expect(await sendSeen("resident:ana", "me")).toEqual({ ok: true, tap: existing });
  });
});

describe("isMissingDeedsBackend", () => {
  it("recognises a missing function or table, not an ordinary failure", () => {
    expect(isMissingDeedsBackend({ code: "42883" })).toBe(true);
    expect(isMissingDeedsBackend({ code: "PGRST205" })).toBe(true);
    expect(isMissingDeedsBackend({ code: "57014", message: "timeout" })).toBe(false);
    expect(isMissingDeedsBackend(null)).toBe(false);
  });
});

describe("migration 20261122230000_village_deeds_feed.sql (the privacy contract, read as text)", () => {
  const sql = readFileSync(join(__dirname, "../../../supabase/migrations/20261122230000_village_deeds_feed.sql"), "utf8");

  it("never lets a hidden profile appear", () => {
    expect(sql).toMatch(/coalesce\(gp\.visibility, 'full'\) <> 'hidden'/);
  });

  it("exposes no count: no aggregate over deed_seen, and no public read policy", () => {
    expect(sql).not.toMatch(/count\s*\(/i);
    expect(sql).not.toMatch(/FOR SELECT TO (anon|public)/i);
    expect(sql).toMatch(/USING \(auth\.uid\(\) = doer_id OR auth\.uid\(\) = seer_id\)/);
  });

  it("lets a client write only the key and the line", () => {
    expect(sql).toMatch(/GRANT INSERT \(event_key, line\) ON public\.deed_seen TO authenticated/);
    expect(sql).toMatch(/GRANT UPDATE \(line\) ON public\.deed_seen TO authenticated/);
  });
});

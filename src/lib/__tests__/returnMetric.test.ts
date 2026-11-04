// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  from: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mocks.from, auth: { getSession: mocks.getSession } },
}));

import { PLAYER_ID_KEY, getPlayerId, trackFunnelEvent } from "@/lib/funnelAnalytics";
import {
  GAME_OPEN_KEY,
  REVEAL_SEEN_KEY,
  isGameRoute,
  localDateKey,
  trackGameOpen,
  trackRevealSeen,
} from "@/lib/returnMetric";

const QUEUE_KEY = "funnel_event_queue";

/** Let the fire-and-forget trackFunnelEvent calls settle. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 20));

const sentRows = () => mocks.insert.mock.calls.map((call) => call[0]);
const sentSteps = () => sentRows().map((row) => row.step);

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  mocks.insert.mockReset().mockResolvedValue({ error: null });
  mocks.from.mockReset().mockImplementation(() => ({ insert: mocks.insert }));
  mocks.getSession.mockReset().mockResolvedValue({ data: { session: null } });
});

describe("player_id (DoD 1)", () => {
  it("is created once per device and kept in localStorage", () => {
    const first = getPlayerId();
    expect(first).toMatch(/^[0-9a-f-]{36}$/);
    expect(window.localStorage.getItem(PLAYER_ID_KEY)).toBe(first);
    expect(getPlayerId()).toBe(first);
  });

  it("survives a new tab (sessionStorage gone) and a reload", () => {
    const first = getPlayerId();
    window.sessionStorage.clear(); // a new tab starts with empty sessionStorage
    expect(getPlayerId()).toBe(first);
  });

  it("reuses an id that is already stored", () => {
    window.localStorage.setItem(PLAYER_ID_KEY, "11111111-1111-4111-8111-111111111111");
    expect(getPlayerId()).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("rides on every event, next to the old session_id", async () => {
    await trackFunnelEvent({ step: "zog_entry" });
    const [row] = sentRows();
    expect(row.metadata.player_id).toBe(getPlayerId());
    expect(typeof row.session_id).toBe("string");
    expect(row.metadata.user_id).toBeUndefined();
  });

  it("cannot be overwritten by a caller's metadata", async () => {
    await trackFunnelEvent({ step: "zog_entry", metadata: { player_id: "spoofed", cta_id: "x" } });
    const [row] = sentRows();
    expect(row.metadata.player_id).toBe(getPlayerId());
    expect(row.metadata.cta_id).toBe("x");
  });

  it("adds user_id when signed in", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: "user-uuid-1", email: "a@b.co" } } },
    });
    await trackFunnelEvent({ step: "zog_entry" });
    const [row] = sentRows();
    expect(row.metadata.user_id).toBe("user-uuid-1");
    expect(row.metadata.player_id).toBe(getPlayerId());
  });
});

describe("reveal_seen (DoD 2, 4)", () => {
  const NOW = new Date(2026, 10, 2, 9, 0, 0);

  it("fires once per reveal for a guest", async () => {
    expect(trackRevealSeen("Signal-to-Form Forging", NOW)).toBe(true);
    expect(trackRevealSeen("Signal-to-Form Forging", NOW)).toBe(false); // re-render / revisit
    await flush();
    expect(sentSteps()).toEqual(["reveal_seen"]);
    expect(sentRows()[0].metadata.talent).toBe("Signal-to-Form Forging");
  });

  it("fires for a signed-in player too, with user_id", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "user-uuid-2" } } } });
    trackRevealSeen("Blessing the Threshold", NOW);
    await flush();
    expect(sentRows()[0].metadata.user_id).toBe("user-uuid-2");
  });

  it("a redo that lands on a different talent is a new reveal", async () => {
    trackRevealSeen("Forging", NOW);
    trackRevealSeen("Weaving", NOW);
    await flush();
    expect(sentSteps()).toEqual(["reveal_seen", "reveal_seen"]);
  });

  it("ignores an empty title (card still loading)", async () => {
    expect(trackRevealSeen("   ", NOW)).toBe(false);
    await flush();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("sends only talent, local_date and the identity keys: no email, no name", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: "user-uuid-3", email: "private@example.com", user_metadata: { full_name: "Ada" } } } },
    });
    window.localStorage.setItem("guest_appleseed_data", JSON.stringify({ vibrationalKey: { name: "Forging" } }));
    trackRevealSeen("Forging", NOW);
    await flush();
    const [row] = sentRows();
    expect(Object.keys(row.metadata).sort()).toEqual(["local_date", "player_id", "talent", "user_id"]);
    expect(JSON.stringify(row)).not.toMatch(/private@example\.com|Ada|@/);
  });
});

describe("game_open (DoD 3, 4)", () => {
  const day = (d: number, h = 12) => new Date(2026, 10, d, h, 0, 0); // November, local time

  it("fires at most once per local calendar day", async () => {
    expect(trackGameOpen("en", day(2, 8))).toBe(true);
    expect(trackGameOpen("en", day(2, 23))).toBe(false); // same local day, later
    expect(window.localStorage.getItem(GAME_OPEN_KEY)).toBe("2026-11-02");
    expect(trackGameOpen("en", day(3, 0))).toBe(true); // next local day, just after midnight
    expect(trackGameOpen("en", day(3, 9))).toBe(false);
    await flush();
    expect(sentSteps()).toEqual(["game_open", "game_open"]);
    expect(sentRows().map((r) => r.metadata.local_date)).toEqual(["2026-11-02", "2026-11-03"]);
  });

  it("uses the local date key, not UTC", () => {
    expect(localDateKey(new Date(2026, 0, 5, 0, 30))).toBe("2026-01-05");
    expect(localDateKey(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
  });

  it("records has_result and locale, nothing personal", async () => {
    trackGameOpen("es", day(2));
    await flush();
    expect(sentRows()[0].metadata).toMatchObject({ has_result: false, locale: "es" });
    expect(Object.keys(sentRows()[0].metadata).sort()).toEqual(["has_result", "local_date", "locale", "player_id"]);
  });

  it("has_result is true with a guest reading on the device, or a signed-in session", async () => {
    window.localStorage.setItem("guest_appleseed_data", JSON.stringify({ vibrationalKey: { name: "Forging" } }));
    trackGameOpen("en", day(2));
    window.localStorage.removeItem("guest_appleseed_data");
    window.localStorage.setItem("evolver-auth-token", "{}");
    trackGameOpen("en", day(3));
    await flush();
    expect(sentRows().map((r) => r.metadata.has_result)).toEqual([true, true]);
  });

  it("stays silent when storage is blocked rather than sending on every mount", async () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(trackGameOpen("en", day(2))).toBe(false);
    spy.mockRestore();
    await flush();
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});

describe("isGameRoute: every game route, locale prefixes included (DoD 3)", () => {
  it.each([
    "/",
    "/village",
    "/game",
    "/game/me",
    "/game/me/zone-of-genius",
    "/game/learn",
    "/es",
    "/ru",
    "/es/village",
    "/ru/village",
    "/es/game/me",
    "/ru/game/next-move",
  ])("%s is a game route", (path) => {
    expect(isGameRoute(path)).toBe(true);
  });

  it.each(["/journey", "/ignite", "/quiz", "/auth", "/privacy", "/es/privacy", "/gamer", "/villagers"])(
    "%s is not",
    (path) => {
      expect(isGameRoute(path)).toBe(false);
    },
  );

  it("/?path=match is the outreach landing (JourneyPage), not the game", () => {
    expect(isGameRoute("/", "?path=match")).toBe(false);
    expect(isGameRoute("/", "?utm_source=x")).toBe(true);
  });
});

describe("a failed insert never reaches the player (DoD 6)", () => {
  it("queues the event when the insert returns an error", async () => {
    mocks.insert.mockResolvedValue({ error: { message: "boom" } });
    await expect(trackFunnelEvent({ step: "game_open" })).resolves.toBeUndefined();
    const queue = JSON.parse(window.localStorage.getItem(QUEUE_KEY) ?? "[]");
    expect(queue).toHaveLength(1);
    expect(queue[0].metadata.player_id).toBe(getPlayerId());
  });

  it("queues the event when the insert throws", async () => {
    mocks.insert.mockRejectedValue(new Error("offline"));
    await expect(trackFunnelEvent({ step: "game_open" })).resolves.toBeUndefined();
    expect(JSON.parse(window.localStorage.getItem(QUEUE_KEY) ?? "[]")).toHaveLength(1);
  });

  it("survives supabase itself throwing, and a broken session lookup", async () => {
    mocks.from.mockImplementation(() => {
      throw new Error("client exploded");
    });
    mocks.getSession.mockRejectedValue(new Error("no session"));
    await expect(trackFunnelEvent({ step: "game_open" })).resolves.toBeUndefined();
    expect(trackGameOpen("en", new Date(2026, 10, 2))).toBe(true);
    expect(trackRevealSeen("Forging")).toBe(true);
    await flush();
  });

  it("the helpers never throw even when storage is blocked", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => trackGameOpen("en")).not.toThrow();
    expect(() => trackRevealSeen("Forging")).not.toThrow();
    expect(() => getPlayerId()).not.toThrow();
    spy.mockRestore();
    expect(window.localStorage.getItem(REVEAL_SEEN_KEY)).toBeNull();
  });
});

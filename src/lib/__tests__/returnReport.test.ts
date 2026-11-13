import { describe, expect, it } from "vitest";
import { computeReturnReport, eventDay, ratePct, type ReportEvent } from "@/lib/returnReport";

const ev = (
  step: string,
  metadata: Record<string, unknown>,
  timestamp: string | null = "2026-11-01T12:00:00Z",
): ReportEvent => ({ step, metadata, timestamp });

describe("returnReport", () => {
  it("is empty without events", () => {
    const r = computeReturnReport([]);
    expect(r.total).toEqual({ revealed: 0, returned: 0, ratePct: null });
    expect(r.days).toEqual([]);
  });

  it("counts a player who opens the game on a later day", () => {
    const r = computeReturnReport([
      ev("reveal_seen", { player_id: "a", local_date: "2026-11-01" }),
      ev("game_open", { player_id: "a", local_date: "2026-11-02" }),
      ev("reveal_seen", { player_id: "b", local_date: "2026-11-01" }),
    ]);
    expect(r.total).toEqual({ revealed: 2, returned: 1, ratePct: 50 });
    expect(r.days).toEqual([{ day: "2026-11-01", revealed: 2, returned: 1, ratePct: 50 }]);
  });

  it("does not count a game_open on the reveal day itself", () => {
    const r = computeReturnReport([
      ev("reveal_seen", { player_id: "a", local_date: "2026-11-01" }),
      ev("game_open", { player_id: "a", local_date: "2026-11-01" }),
    ]);
    expect(r.total.returned).toBe(0);
  });

  it("anchors on the first reveal and counts each player once", () => {
    const r = computeReturnReport([
      ev("reveal_seen", { player_id: "a", local_date: "2026-11-03" }),
      ev("reveal_seen", { player_id: "a", local_date: "2026-11-01" }),
      ev("game_open", { player_id: "a", local_date: "2026-11-02" }),
      ev("game_open", { player_id: "a", local_date: "2026-11-04" }),
    ]);
    expect(r.total).toEqual({ revealed: 1, returned: 1, ratePct: 100 });
    expect(r.days.map((d) => d.day)).toEqual(["2026-11-01"]);
  });

  it("ignores a game_open before the first reveal", () => {
    const r = computeReturnReport([
      ev("game_open", { player_id: "a", local_date: "2026-10-30" }),
      ev("reveal_seen", { player_id: "a", local_date: "2026-11-01" }),
    ]);
    expect(r.total.returned).toBe(0);
  });

  it("joins a guest reveal and a signed-in return through an event that carries both ids", () => {
    const r = computeReturnReport(
      [
        ev("reveal_seen", { player_id: "dev1", local_date: "2026-11-01" }),
        ev("game_open", { user_id: "acc", player_id: "dev1", local_date: "2026-11-02" }),
      ],
      [],
    );
    expect(r.total).toEqual({ revealed: 1, returned: 1, ratePct: 100 });
  });

  it("joins through a linking event of another step, and across devices", () => {
    const r = computeReturnReport(
      [
        ev("reveal_seen", { player_id: "phone", local_date: "2026-11-01" }),
        ev("game_open", { user_id: "acc", local_date: "2026-11-03" }),
      ],
      [
        { player_id: "phone", user_id: "acc" },
        { player_id: "laptop", user_id: "acc" },
      ],
    );
    expect(r.total).toEqual({ revealed: 1, returned: 1, ratePct: 100 });
  });

  it("keeps unlinked players apart", () => {
    const r = computeReturnReport([
      ev("reveal_seen", { player_id: "a", local_date: "2026-11-01" }),
      ev("game_open", { player_id: "b", local_date: "2026-11-02" }),
    ]);
    expect(r.total).toEqual({ revealed: 1, returned: 0, ratePct: 0 });
  });

  it("skips rows with no id, other steps, and unusable days", () => {
    const r = computeReturnReport([
      ev("reveal_seen", {}),
      ev("quiz_start", { player_id: "a" }),
      ev("reveal_seen", { player_id: "a" }, null),
    ]);
    expect(r.total.revealed).toBe(0);
  });

  it("splits cohorts by first-reveal day, oldest first", () => {
    const r = computeReturnReport([
      ev("reveal_seen", { player_id: "b", local_date: "2026-11-02" }),
      ev("reveal_seen", { player_id: "a", local_date: "2026-11-01" }),
      ev("game_open", { player_id: "a", local_date: "2026-11-05" }),
    ]);
    expect(r.days).toEqual([
      { day: "2026-11-01", revealed: 1, returned: 1, ratePct: 100 },
      { day: "2026-11-02", revealed: 1, returned: 0, ratePct: 0 },
    ]);
  });
});

describe("eventDay", () => {
  it("prefers local_date, falls back to the UTC date, rejects junk", () => {
    expect(eventDay(ev("x", { local_date: "2026-11-09" }, "2026-11-01T00:00:00Z"))).toBe("2026-11-09");
    expect(eventDay(ev("x", {}, "2026-11-01T23:59:00Z"))).toBe("2026-11-01");
    expect(eventDay(ev("x", { local_date: "nope" }, "2026-11-01T10:00:00Z"))).toBe("2026-11-01");
    expect(eventDay(ev("x", {}, "garbage"))).toBeNull();
  });
});

describe("ratePct", () => {
  it("rounds to one decimal and guards zero", () => {
    expect(ratePct(1, 3)).toBe(33.3);
    expect(ratePct(0, 0)).toBeNull();
  });
});

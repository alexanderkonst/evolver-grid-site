import { describe, expect, it, vi } from "vitest";
// The pure logic under test never touches the client; keep it out of the node test environment.
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import { buildHouseStats, formatOwnIncome, quarterLabel, type HouseStatsInput } from "../houseStats";

const NOW = new Date("2026-11-21T12:00:00Z");
const none: HouseStatsInput = { qolLevel: null, qolPrevious: null, resonance: [], income: null };

describe("buildHouseStats", () => {
  it("a player with nothing sees no stats block", () => {
    expect(buildHouseStats(none, NOW)).toEqual([]);
  });

  it("a player with QoL and a resonance rating sees exactly those two cards", () => {
    const stats = buildHouseStats(
      { ...none, qolLevel: 6.3, resonance: [{ value: 9, at: "2026-11-01T10:00:00Z" }] },
      NOW,
    );
    expect(stats.map((s) => s.id)).toEqual(["qol", "uniqueness"]);
    expect(stats[0]).toMatchObject({ value: "6.3", max: "/ 10", change: undefined });
    expect(stats[1]).toMatchObject({ value: "9", max: "/ 10", change: undefined });
  });

  it("QoL shows the change against the previous measurement", () => {
    const [qol] = buildHouseStats(
      { ...none, qolLevel: 6.3, qolPrevious: { value: 6.2, at: "2026-05-10T10:00:00Z" } },
      NOW,
    );
    expect(qol.change).toEqual({ delta: 0.1, since: "Q2" });
  });

  it("U shows the change when the player re-rates", () => {
    const [u] = buildHouseStats(
      {
        ...none,
        resonance: [
          { value: 9, at: "2026-11-01T10:00:00Z" },
          { value: 6, at: "2025-12-01T10:00:00Z" },
        ],
      },
      NOW,
    );
    expect(u.change).toEqual({ delta: 3, since: "Q4 2025" });
  });

  it("never makes a card from a missing, zero or out-of-range value", () => {
    const stats = buildHouseStats(
      { ...none, qolLevel: 0, resonance: [{ value: 0, at: "2026-11-01T10:00:00Z" }], income: null },
      NOW,
    );
    expect(stats).toEqual([]);
  });

  it("income appears only when there is an amount", () => {
    expect(buildHouseStats({ ...none, income: "$1,250" }, NOW)).toEqual([{ id: "income", value: "$1,250" }]);
  });
});

describe("formatOwnIncome", () => {
  it("is null with no rows, no amounts or a zero total", () => {
    expect(formatOwnIncome([])).toBeNull();
    expect(formatOwnIncome([{ amount_cents: null, currency: "USD" }])).toBeNull();
    expect(formatOwnIncome([{ amount_cents: 0, currency: "USD" }])).toBeNull();
  });

  it("sums one currency and lists several side by side", () => {
    expect(
      formatOwnIncome([
        { amount_cents: 50000, currency: "usd" },
        { amount_cents: 75000, currency: "USD" },
      ]),
    ).toBe("$1,250");
    expect(
      formatOwnIncome([
        { amount_cents: 10000, currency: "USD" },
        { amount_cents: 20000, currency: "EUR" },
      ]),
    ).toBe("$100 · €200");
  });
});

describe("quarterLabel", () => {
  it("adds the year only outside the current year", () => {
    expect(quarterLabel("2026-05-10T10:00:00Z", NOW)).toBe("Q2");
    expect(quarterLabel("2025-12-10T10:00:00Z", NOW)).toBe("Q4 2025");
  });
});

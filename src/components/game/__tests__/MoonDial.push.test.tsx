import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { clockPush, PHONE_QUERY } from "../MoonDial";

// MoonDial pulls in the connected clock, which reads Supabase (needs a browser); only the pure helper is tested here.
vi.mock("@/modules/equilibrium/hooks/useEquilibriumV2", () => ({
  useEquilibriumV2: () => ({ birthday: null, loading: false, user: null, refresh: async () => {} }),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/modules/equilibrium/components/BirthdayPrompt", () => ({ default: () => null, BirthdayPrompt: () => null }));

// Fixes v6.3 item 1 (#448): on a phone the open clock card pushes «Your next move» down instead of covering it.
describe("clockPush", () => {
  it("0 while the watch fits inside the map frame (view 1: the dial alone)", () => {
    expect(clockPush(8, 232, 390)).toBe(0);
  });

  it("the part of the watch that runs below the frame, plus air, once the card is open", () => {
    // 390 px frame, watch from y = 8, 200 px dial + 8 gap + 420 px card
    const over = 8 + 628 - 390;
    expect(clockPush(8, 628, 390)).toBe(over + 12);
    expect(clockPush(8, 628.4, 390)).toBe(Math.ceil(over + 0.4 + 12));
  });

  it("is never negative, and grows with the card", () => {
    expect(clockPush(8, 100, 390)).toBe(0);
    expect(clockPush(8, 800, 390)).toBeGreaterThan(clockPush(8, 700, 390));
  });

  it("uses the village's phone breakpoint", () => {
    expect(PHONE_QUERY).toBe("(max-width: 767px)");
    expect(readFileSync(new URL("../../../pages/Village.css", import.meta.url), "utf8")).toContain("@media (max-width: 767px)");
  });

  it("the Village gives the map frame that much room under it", () => {
    const src = readFileSync(new URL("../../../pages/Village.tsx", import.meta.url), "utf8");
    expect(src).toContain("<MoonDial className=\"vl-watch\" onPush={setClockPush} />");
    expect(src).toContain("marginBottom: clockPush");
  });
});

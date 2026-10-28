import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import {
  VILLAGE_INCOME_EMPTY,
  formatVillageIncome,
  summarizeVillageIncome,
  villageIncomeText,
} from "@/lib/villageIncome";

const sale = (seller: string, cents: number | null, currency: string | null = "USD") => ({
  seller_user_id: seller,
  amount_cents: cents,
  currency,
});

describe("villageIncome (WP-12): the one public number", () => {
  it("is empty when nothing is readable", () => {
    expect(summarizeVillageIncome([])).toBeNull();
    expect(villageIncomeText(null)).toBe("No sales recorded yet");
    expect(VILLAGE_INCOME_EMPTY).toBe("No sales recorded yet");
  });

  it("does not call one player's own rows the village's income (RLS shows a seller only their own)", () => {
    expect(summarizeVillageIncome([sale("a", 5000), sale("a", 2500)])).toBeNull();
  });

  it("sums the sales of more than one resident", () => {
    const income = summarizeVillageIncome([sale("a", 5000), sale("b", 2500), sale("a", 100)]);
    expect(income).toEqual({ total: 76, currency: "USD" });
    expect(villageIncomeText(income)).toBe("$76");
  });

  it("shows cents only when there are some", () => {
    expect(formatVillageIncome({ total: 76.5, currency: "USD" })).toBe("$76.50");
  });

  it("invents nothing from sales without an amount", () => {
    expect(summarizeVillageIncome([sale("a", null), sale("b", null, null)])).toBeNull();
  });

  it("does not add up different currencies", () => {
    expect(summarizeVillageIncome([sale("a", 5000, "USD"), sale("b", 5000, "MXN")])).toBeNull();
  });

  it("does not show a truncated total", () => {
    const rows = Array.from({ length: 1000 }, (_, i) => sale(`s${i}`, 100));
    expect(summarizeVillageIncome(rows)).toBeNull();
  });
});

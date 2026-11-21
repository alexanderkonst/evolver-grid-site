import { beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/locales/en/common.json";
import ru from "@/locales/ru/common.json";
import es from "@/locales/es/common.json";
import { loadMyClients, saleAmountText, toClients, type SaleRow } from "../myClients";

const mocks = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getUser: vi.fn() }, from: mocks.from },
}));

/** A query builder whose chain ends in `limit`, which resolves to `result`. */
const query = (result: { data: unknown; error: unknown }) => {
  const q = {
    select: vi.fn(() => q),
    eq: vi.fn(() => q),
    order: vi.fn(() => q),
    limit: vi.fn(async () => result),
  };
  return q;
};

const row = (over: Partial<SaleRow> = {}): SaleRow => ({
  id: "s1",
  buyer_first_name: "Maria",
  offer_ref: "Clarity session",
  amount_cents: 25000,
  currency: "usd",
  occurred_at: "2026-11-10T12:00:00Z",
  ...over,
});

describe("saleAmountText", () => {
  it("formats cents with the currency", () => {
    expect(saleAmountText(25000, "usd")).toBe("$250");
    expect(saleAmountText(25050, "USD")).toBe("$250.50");
  });

  it("shows the amount alone when there is no currency", () => {
    expect(saleAmountText(25000, null)).toBe("250");
  });

  it("is null when the sale has no amount", () => {
    expect(saleAmountText(null, "USD")).toBeNull();
  });

  it("keeps a zero amount", () => {
    expect(saleAmountText(0, "USD")).toBe("$0");
  });
});

describe("toClients", () => {
  it("no rows, no clients", () => {
    expect(toClients([])).toEqual([]);
  });

  it("maps buyer, offer, amount and date", () => {
    const [client] = toClients([row()]);
    expect(client.buyer).toBe("Maria");
    expect(client.offer).toBe("Clarity session");
    expect(client.amount).toBe("$250");
    expect(client.date).not.toBe("");
  });

  it("a null or blank buyer name is null, so the screen says «A client»", () => {
    const clients = toClients([
      row({ id: "a", buyer_first_name: null }),
      row({ id: "b", buyer_first_name: "   " }),
    ]);
    expect(clients.map((c) => c.buyer)).toEqual([null, null]);
  });

  it("keeps only the first word of the buyer's name", () => {
    expect(toClients([row({ buyer_first_name: "Maria Lopez" })])[0].buyer).toBe("Maria");
  });

  it("missing offer and amount stay null", () => {
    const [client] = toClients([row({ offer_ref: null, amount_cents: null, currency: null })]);
    expect(client.offer).toBeNull();
    expect(client.amount).toBeNull();
  });

  it("sorts newest first", () => {
    const clients = toClients([
      row({ id: "old", occurred_at: "2026-01-01T00:00:00Z" }),
      row({ id: "new", occurred_at: "2026-11-01T00:00:00Z" }),
      row({ id: "mid", occurred_at: "2026-06-01T00:00:00Z" }),
    ]);
    expect(clients.map((c) => c.id)).toEqual(["new", "mid", "old"]);
  });

  it("an unreadable date does not break the list", () => {
    const clients = toClients([row({ id: "bad", occurred_at: "not a date" }), row({ id: "ok" })]);
    expect(clients.map((c) => c.id)).toEqual(["ok", "bad"]);
    expect(clients[1].date).toBe("");
  });
});

describe("loadMyClients", () => {
  beforeEach(() => mocks.from.mockReset());

  it("reads sales_events for this seller only, newest first, and never writes", async () => {
    const q = query({ data: [row({ id: "a" })], error: null });
    mocks.from.mockReturnValue(q);
    const clients = await loadMyClients("seller-1");
    expect(mocks.from).toHaveBeenCalledWith("sales_events");
    expect(q.eq).toHaveBeenCalledWith("seller_user_id", "seller-1");
    expect(q.order).toHaveBeenCalledWith("occurred_at", { ascending: false });
    expect(clients.map((c) => c.id)).toEqual(["a"]);
    expect(Object.keys(q)).toEqual(["select", "eq", "order", "limit"]);
  });

  it("a seller without sales gets an empty list", async () => {
    mocks.from.mockReturnValue(query({ data: [], error: null }));
    expect(await loadMyClients("seller-1")).toEqual([]);
  });

  it("a failed read throws, so «could not load» is not shown as «no clients»", async () => {
    mocks.from.mockReturnValue(query({ data: null, error: new Error("boom") }));
    await expect(loadMyClients("seller-1")).rejects.toThrow("boom");
  });
});

describe("Clients copy", () => {
  it("has the same keys in en, ru and es, and the empty line carries no number", () => {
    const keys = ["title", "empty", "anonymous", "error"] as const;
    for (const catalog of [en, ru, es]) {
      for (const key of keys) {
        expect(catalog.myProducts.clients[key]).toBeTruthy();
      }
      expect(catalog.myProducts.clients.empty).not.toMatch(/\d/);
    }
    expect(en.myProducts.clients.empty).toBe("Your first client will appear here.");
  });
});

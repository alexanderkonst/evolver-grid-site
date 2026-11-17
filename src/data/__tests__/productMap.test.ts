import { describe, expect, it } from "vitest";
import {
  PRODUCTS,
  getOffer,
  getProduct,
  priceLine,
  productPrice,
  productVars,
  summaryLines,
  visibleProducts,
} from "../productMap";

describe("productMap", () => {
  it("has unique ids", () => {
    const ids = PRODUCTS.map(row => row.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never renders the hidden Cannabis row", () => {
    expect(getProduct("cannabis").hidden).toBe(true);
    expect(visibleProducts().some(row => row.id === "cannabis")).toBe(false);
    expect(visibleProducts()).toHaveLength(PRODUCTS.length - 1);
  });

  it("groups every row in one of the three groups", () => {
    expect(visibleProducts("client-path")).toHaveLength(15);
    expect(visibleProducts("other")).toHaveLength(8);
    expect(visibleProducts("rd")).toHaveLength(2);
  });

  it("reads unassigned prices as On request", () => {
    expect(productPrice("pmf-discovery")).toBe("On request");
    expect(productPrice("founder-read")).toBe("On request");
  });

  it("gives landings the values the brief sets", () => {
    expect(productVars("crossing", "1:1")).toMatchObject({ price: "$2,222", minutes: 75, sessions: 8 });
    expect(productVars("build", "group")).toMatchObject({ price: "$1,111", weeks: 4 });
    expect(productPrice("zog-teams")).toBe("$1,000");
    expect(getOffer("fmf-session").amountUsd).toBe(555);
  });

  it("joins offers on one line", () => {
    expect(priceLine(getProduct("build"))).toBe("$1,111 group · $5,555 1:1");
    expect(summaryLines(getProduct("evolution-portal"))).toEqual([
      "$555 launch + $55/month (free until the 5th subscriber)",
    ]);
  });

  it("keeps unassigned prices readable on a card", () => {
    expect(summaryLines(getProduct("pmf-discovery"))).toEqual(["On request · 1:1 online · 2–2.5 hours"]);
    expect(summaryLines(getProduct("zog-session"))).toEqual(["$333 1:1 online"]);
  });

  it("gives a landing only to rows that have a page", () => {
    for (const id of ["zog-teams", "collective", "for-clients", "license", "ai-training"]) {
      expect(getProduct(id).landing).toBeUndefined();
    }
    expect(getProduct("direction-call").landing?.external).toBe(true);
    expect(getProduct("crossing").landing).toEqual({ href: "/products/crossing", external: false });
  });
});

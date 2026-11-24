import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { blueprintToText, parseBlueprint, parseCta, safeCtaUrl } from "../marketplaceProductData";

describe("marketplace product data (#416: /mp/<slug> shows the stored product)", () => {
  it("parses a stored blueprint and drops non-string steps", () => {
    expect(parseBlueprint({ title: "T", steps: ["a", 2, "b"], ctaSection: "go" })).toEqual({
      title: "T",
      steps: ["a", "b"],
      ctaSection: "go",
    });
  });

  it("returns null for a missing or malformed blueprint instead of crashing the page", () => {
    expect(parseBlueprint(null)).toBeNull();
    expect(parseBlueprint({ title: "T" })).toBeNull();
    expect(parseBlueprint("nope")).toBeNull();
  });

  it("parses the CTA config and keeps the optional url", () => {
    expect(parseCta({ type: "software", buttonText: "Go", description: "d", url: "https://x.io" })).toEqual({
      type: "software",
      buttonText: "Go",
      description: "d",
      url: "https://x.io",
    });
    expect(parseCta(null)).toBeNull();
  });

  it("follows only https, http and mailto targets; no target means no button", () => {
    expect(safeCtaUrl("https://cal.com/me")).toBe("https://cal.com/me");
    expect(safeCtaUrl("mailto:me@x.io")).toBe("mailto:me@x.io");
    expect(safeCtaUrl("javascript:alert(1)")).toBeNull();
    expect(safeCtaUrl("not a url")).toBeNull();
    expect(safeCtaUrl(undefined)).toBeNull();
  });

  it("builds the downloadable blueprint from the stored steps", () => {
    expect(blueprintToText({ title: "T", steps: ["a", "b"], ctaSection: "" })).toBe("T\n\n1. a\n2. b\n");
  });

  it("page loads by slug and has no hard-coded mock; publish does not swallow insert errors", () => {
    const page = readFileSync(join(__dirname, "../MarketplaceProductPage.tsx"), "utf8");
    expect(page).toContain('.eq("slug", slug)');
    expect(page).not.toContain("Transform Your Genius");
    expect(page).not.toContain("console.log");
    const publish = readFileSync(join(__dirname, "../../../modules/product-builder/steps/PublishedScreen.tsx"), "utf8");
    expect(publish).toContain("if (dbError) throw dbError;");
    expect(publish).not.toContain("continuing with demo");
    expect(publish).not.toContain("genius-demo-");
  });
});

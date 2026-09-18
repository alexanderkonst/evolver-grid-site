import { describe, expect, it } from "vitest";
import { isProductLandingRoute, pathHidesLogo, pathUsesLayoutShell } from "../shellRoutes";

describe("public product shell routes", () => {
  it.each(["/products", "/products/crossing", "/products/built"])("supplies the persistent shell without duplicate branding on %s", path => {
    expect(isProductLandingRoute(path)).toBe(true);
    expect(pathUsesLayoutShell(path)).toBe(true);
    expect(pathHidesLogo(path)).toBe(true);
  });

  it.each(["/products/evolution-portal", "/products/founder-read", "/products/build", "/products/crossing/other"])("keeps other product routes outside this change: %s", path => {
    expect(isProductLandingRoute(path)).toBe(false);
    expect(pathUsesLayoutShell(path)).toBe(false);
    expect(pathHidesLogo(path)).toBe(false);
  });

  it("preserves Ignite and the quiz holdout", () => {
    expect(pathUsesLayoutShell("/ignite")).toBe(true);
    expect(pathUsesLayoutShell("/quiz")).toBe(false);
  });
});

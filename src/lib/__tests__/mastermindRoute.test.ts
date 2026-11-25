import { beforeAll, describe, expect, it, vi } from "vitest";
import { pathUsesLayoutShell } from "@/lib/shellRoutes";
import { getPageTitle } from "@/lib/pageTitles";

describe("FMF (formerly Mastermind) route regression tests", () => {
  let SPACE_SECTIONS: typeof import("@/components/game/SectionsPanel").SPACE_SECTIONS;

  beforeAll(async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    });
    const module = await import("@/components/game/SectionsPanel");
    SPACE_SECTIONS = module.SPACE_SECTIONS;
  });

  it("lists /build/fmf in shell routes", () => {
    expect(pathUsesLayoutShell("/build/fmf")).toBe(true);
  });

  it("gives /build/fmf the place name 'FMF' as its tab title (WP-15)", () => {
    expect(getPageTitle("/build/fmf")).toBe("FMF");
  });

  it("contains a section in BUILD space with path /build/fmf labeled 'FMF'", () => {
    const buildSections = SPACE_SECTIONS.build.sections;
    const mastermindSection = buildSections.find((section) => section.path === "/build/fmf");

    expect(mastermindSection).toBeDefined();
    expect(mastermindSection?.label).toBe("FMF");
  });
});

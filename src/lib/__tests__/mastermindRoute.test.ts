import { beforeAll, describe, expect, it, vi } from "vitest";
import { pathUsesLayoutShell } from "@/lib/shellRoutes";
import { getPageTitle } from "@/lib/pageTitles";

describe("Mastermind route regression tests", () => {
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

  it("lists /build/mastermind in shell routes", () => {
    expect(pathUsesLayoutShell("/build/mastermind")).toBe(true);
  });

  it("gives /build/mastermind the title 'Founder-Market Fit Discovery Mastermind'", () => {
    expect(getPageTitle("/build/mastermind")).toBe("Founder-Market Fit Discovery Mastermind");
  });

  it("contains a section in BUILD space with path /build/mastermind labeled 'Founder Mastermind'", () => {
    const buildSections = SPACE_SECTIONS.build.sections;
    const mastermindSection = buildSections.find((section) => section.path === "/build/mastermind");

    expect(mastermindSection).toBeDefined();
    expect(mastermindSection?.label).toBe("Founder Mastermind");
  });
});

import { describe, expect, it } from "vitest";
import { getPageTitle } from "@/lib/pageTitles";

describe("getPageTitle", () => {
  it("returns Home for root", () => {
    expect(getPageTitle("/")).toBe("Home");
  });

  it("returns Zone of Genius for ZoG routes", () => {
    expect(getPageTitle("/zone-of-genius/entry")).toBe("Zone of Genius");
  });

  it("returns Library for library subpaths", () => {
    expect(getPageTitle("/library/breathwork")).toBe("Library");
  });

  it("returns ME for profile routes", () => {
    expect(getPageTitle("/game/me")).toBe("ME");
  });

  it("falls back to Explore for unknown routes", () => {
    expect(getPageTitle("/something-else")).toBe("Explore");
  });
});

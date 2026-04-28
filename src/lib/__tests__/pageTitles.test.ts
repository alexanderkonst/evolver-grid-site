import { describe, expect, it } from "vitest";
import { getPageTitle } from "@/lib/pageTitles";

describe("getPageTitle", () => {
  it("returns empty string for root (caller drops the suffix)", () => {
    expect(getPageTitle("/")).toBe("");
  });

  it("returns Top Talent for ZoG routes", () => {
    expect(getPageTitle("/zone-of-genius/entry")).toBe("Top Talent");
  });

  it("returns Library for library subpaths", () => {
    expect(getPageTitle("/library/breathwork")).toBe("Library");
  });

  it("returns Top Talent for ME profile routes (Day 47 single-focus)", () => {
    expect(getPageTitle("/game/me")).toBe("Top Talent");
  });

  it("returns Playbook for /playbook", () => {
    expect(getPageTitle("/playbook")).toBe("Playbook");
  });

  it("returns AI OS for /ai-os subpaths", () => {
    expect(getPageTitle("/ai-os/benchmark")).toBe("AI OS");
  });

  it("returns empty string for unknown routes (caller drops the suffix)", () => {
    expect(getPageTitle("/something-else")).toBe("");
  });
});

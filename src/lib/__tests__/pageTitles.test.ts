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

  it("returns Character for the ME space routes (game vocabulary, issue #129)", () => {
    expect(getPageTitle("/game/me")).toBe("Character");
  });

  it("uses game vocabulary for the renamed spaces (issue #129)", () => {
    expect(getPageTitle("/game/journey")).toBe("Main Quest");
    expect(getPageTitle("/game/learn/genius-assessment/step-1")).toBe("Character Creation");
    expect(getPageTitle("/game/learn/qol-results")).toBe("Save Point / Level");
    expect(getPageTitle("/game/learn/today")).toBe("Daily Quests");
    expect(getPageTitle("/game/learn/paths")).toBe("Skill Tree");
    expect(getPageTitle("/game/learn")).toBe("Training");
    expect(getPageTitle("/game/marketplace")).toBe("Market");
    expect(getPageTitle("/game/collaborate/matches")).toBe("Party & Guild");
    expect(getPageTitle("/game/meet")).toBe("Meet");
    expect(getPageTitle("/ubb")).toBe("Workshop");
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

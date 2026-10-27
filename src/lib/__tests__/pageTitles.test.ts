import { describe, expect, it } from "vitest";
import { getPageTitle } from "@/lib/pageTitles";

describe("getPageTitle", () => {
  it("returns empty string for root (caller drops the suffix)", () => {
    expect(getPageTitle("/")).toBe("");
  });

  it("returns Character Creation for the ZoG assessment routes", () => {
    expect(getPageTitle("/zone-of-genius/entry")).toBe("Character Creation");
  });

  it("returns Library for library subpaths", () => {
    expect(getPageTitle("/library/breathwork")).toBe("Library");
  });

  it("returns Character for ME profile routes and keeps Top Talent for the saved result", () => {
    expect(getPageTitle("/game/me")).toBe("Character");
    expect(getPageTitle("/game/me/profile")).toBe("Character");
    expect(getPageTitle("/game/me/zone-of-genius")).toBe("Top Talent");
  });

  it("uses game vocabulary for /game/* spaces (issue #128)", () => {
    expect(getPageTitle("/game/journey")).toBe("Main Quest");
    expect(getPageTitle("/game/me/quality-of-life")).toBe("Level");
    expect(getPageTitle("/game/learn/today")).toBe("Daily Quests");
    expect(getPageTitle("/game/learn/paths")).toBe("Skill Tree");
    expect(getPageTitle("/game/learn/qol-assessment")).toBe("Save Point");
    expect(getPageTitle("/game/learn/library")).toBe("Training");
    expect(getPageTitle("/ubb/marketing")).toBe("The Forge");
    expect(getPageTitle("/game/marketplace")).toBe("Trading Post");
    expect(getPageTitle("/game/collaborate/matches")).toBe("Party & Guild");
    expect(getPageTitle("/game/meet")).toBe("Raids");
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

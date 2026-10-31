import { describe, expect, it } from "vitest";
import { isGameScreenPath } from "@/components/ChatLauncher";

describe("WP-15: the chat launcher tucks into the corner on the Journey screens", () => {
  it("covers the title, the village and every place of the list", () => {
    for (const path of [
      "/",
      "/village",
      "/village/market",
      "/game/me/overview",
      "/game/journey",
      "/game/your-ai",
      "/game/meet",
      "/game/collaborate/matches",
      "/game/marketplace",
      "/ubb",
      "/ubb/offer",
      "/build/mastermind",
    ]) {
      expect(isGameScreenPath(path), path).toBe(true);
    }
  });

  it("leaves the rest of the platform as it was", () => {
    for (const path of ["/journey", "/ai-os", "/library/breathwork", "/contact", "/build/cockpit", "/gamer"]) {
      expect(isGameScreenPath(path), path).toBe(false);
    }
  });
});

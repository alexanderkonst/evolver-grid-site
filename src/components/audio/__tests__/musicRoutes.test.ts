import { describe, expect, it } from "vitest";
import { isShellRoute } from "../SoundCloudPlayerProvider";

// WP-4 (issue #161, item 5): music is off on auth and checkout, on everywhere else in the shell.
describe("music routes", () => {
  it("is silent on auth", () => {
    expect(isShellRoute("/auth")).toBe(false);
    expect(isShellRoute("/auth/callback")).toBe(false);
  });

  it("is silent on checkout and sales surfaces", () => {
    expect(isShellRoute("/ignite")).toBe(false);
    expect(isShellRoute("/activate-top-talent")).toBe(false);
    expect(isShellRoute("/activations")).toBe(false);
    expect(isShellRoute("/activations/some-workshop")).toBe(false);
  });

  it("plays in the village and its places", () => {
    for (const path of ["/village", "/game/me/overview", "/game/journey", "/ai-os", "/ubb", "/authors"]) {
      expect(isShellRoute(path)).toBe(true);
    }
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import PlayerLevel from "../PlayerLevel";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, vars?: { level?: number }) =>
      key === "playerLevel.value" ? `Level ${vars?.level} / 10` : key === "playerLevel.empty" ? "Level not measured yet" : key,
  }),
}));

describe("PlayerLevel (#241: the player's own level, nothing for others)", () => {
  it("shows the QoL average to the player", () => {
    expect(renderToStaticMarkup(<PlayerLevel level={6.9} />)).toContain("Level 6.9 / 10");
  });

  it("says «not measured» instead of inventing a number", () => {
    expect(renderToStaticMarkup(<PlayerLevel level={null} />)).toContain("Level not measured yet");
  });

  it("has no lock, no «Private» badge: others see nothing about a level", () => {
    const html = renderToStaticMarkup(<PlayerLevel level={6.9} />);
    expect(html).not.toContain("<svg");
    expect(html).not.toMatch(/private/i);
  });

  it("is never rendered on the public profile", () => {
    const src = readFileSync(join(__dirname, "../../../pages/PublicProfile.tsx"), "utf8");
    expect(src).not.toMatch(/PlayerLevel|usePlayerLevel|qolAverageLevel|PrivateLevel/);
  });
});

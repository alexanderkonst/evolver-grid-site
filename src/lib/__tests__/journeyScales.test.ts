import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * WP-15 part 2: the Journey screens read one type scale and one palette, never a literal px
 * font size or a literal colour (design: docs/02-strategy/game_of_being_you.md §14.8 WP-15).
 */
const css = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const SCREENS = [
  "pages/GameTitle.css",
  "pages/Village.css",
  "components/game/QuestBoard.css",
  "components/game/ModuleForm.css",
  "components/game/MyStall.css",
  "components/game/PlaceState.css",
  "components/game/WordlessIntro.css",
  "pages/spaces/sections/CharacterSheet.css",
];

describe("WP-15: the Journey stylesheets use the scale tokens", () => {
  for (const file of SCREENS) {
    it(`${file} has no literal px font size`, () => {
      expect(css(file)).not.toMatch(/font-size:\s*\d+(\.\d+)?px/);
    });
  }

  it("the title, the village, the quest board and the stall have no literal colour", () => {
    for (const file of SCREENS.filter((f) => !f.includes("WordlessIntro"))) {
      const text = css(file);
      expect(text, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(text, file).not.toMatch(/\brgba?\(\s*\d/);
      expect(text, file).not.toMatch(/\bhsla?\(\s*\d/);
    }
  });

  it("theme-tokens.css defines every step the stylesheets read", () => {
    const tokens = css("styles/theme-tokens.css");
    const used = new Set<string>();
    for (const file of SCREENS) {
      for (const m of css(file).matchAll(/var\((--vl-(?:text|space)-[a-z0-9]+)\)/g)) used.add(m[1]);
    }
    expect(used.size).toBeGreaterThan(0);
    for (const name of used) expect(tokens, name).toContain(`${name}:`);
    expect(tokens).toContain("--chat-clearance:");
  });
});

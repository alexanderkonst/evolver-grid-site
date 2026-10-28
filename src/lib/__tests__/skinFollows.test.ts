import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// WP-1b: the Journey screens follow the skin. These are source-level guards so a
// hardcoded navy / gold literal cannot slip back into the files that were moved
// onto tokens (no browser needed).
const source = (rel: string) => readFileSync(new URL(rel, import.meta.url), "utf8");

/** The text of the last `[data-skin="..."] { ... }` block in theme-tokens.css
 *  (The Dao also appears in a shared Network School block earlier in the file). */
const skinBlock = (css: string, selector: string) => {
  const start = css.lastIndexOf(`${selector} {`);
  expect(start, `${selector} block`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("\n}", start));
};

describe("WP-1b: the chat launcher reads tokens", () => {
  const chat = source("../../components/ChatLauncher.tsx");

  it("hardcodes no navy / gold / cream", () => {
    for (const literal of ["#08172f", "#d9b85f", "#fff8e7", "#efcf77", "#f0cf72", "#0b2041"]) {
      expect(chat.toLowerCase()).not.toContain(literal);
    }
  });

  it("uses the --chat-* tokens", () => {
    expect(chat).toContain("var(--chat-bg)");
    expect(chat).toContain("var(--chat-panel-bg)");
  });
});

describe("WP-1b: the active nav fill is a token", () => {
  it("the rail and the sections panel no longer hardcode the navy gradient", () => {
    expect(source("../../components/game/SpacesRail.tsx")).not.toContain("76, 105, 164");
    expect(source("../../components/game/SectionsPanel.tsx")).not.toContain("102, 128, 181");
  });

  it("Aurum and The Dao define the fill with no navy and no image", () => {
    const css = source("../../styles/theme-tokens.css");
    for (const selector of ['[data-skin="aurum"]', '[data-skin="dao"]']) {
      const block = skinBlock(css, selector);
      expect(block).toContain("--nav-rail-active-color");
      expect(block).toContain("--nav-pane-active-color");
      expect(block).toContain("--nav-rail-active-image: none");
      expect(block).toContain("--nav-pane-active-image: none");
    }
  });
});

describe("WP-1b: the rail toggle names the next skin", () => {
  const rail = source("../../components/game/SpacesRail.tsx");

  it("click, label and tooltip all come from one table", () => {
    expect(rail).toContain("TOGGLE_NEXT_SKIN");
    expect(rail).toContain("setSkin(nextToggleSkin)");
    expect(rail).toContain("aria-label={toggleLabel}");
  });

  it("every skin the toggle can step to has its own label", () => {
    expect(rail).toMatch(/lapis: "spacesRail\.themeToggleToLapisTitle"/);
    expect(rail).toMatch(/aurum: "spacesRail\.themeToggleToAurumTitle"/);
    expect(rail).toMatch(/dao: "spacesRail\.themeToggleToDaoTitle"/);
  });
});

describe("WP-1b: the skin layer is loaded", () => {
  it("main.tsx imports skin-journey.css after lunar-world.css", () => {
    const main = source("../../main.tsx");
    expect(main.indexOf("skin-journey.css")).toBeGreaterThan(main.indexOf("lunar-world.css"));
  });
});

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

describe("WP-1b: Mastermind and the Appearance tab follow the skin", () => {
  it("Mastermind paints its accent labels from the label-ink tokens, not the shared gold style", () => {
    const page = source("../../pages/Mastermind.tsx");
    expect(page).not.toContain("GOLD_TEXT_STYLE");
    expect(page).toContain("var(--label-ink-bg)");
  });

  it("the Appearance tab hardcodes no gold and The Dao sets the tokens it reads", () => {
    const all = source("../../pages/Settings.tsx");
    const settings = all.slice(all.indexOf("const AppearanceTab"), all.indexOf("const NotificationsTab"));
    expect(settings.length).toBeGreaterThan(0);
    expect(settings).not.toContain("#d4af37");
    expect(settings).not.toContain("hsla(40, 70%, 55%, 0.55)");
    expect(settings).not.toContain("hsl(40 70% 45%)");
    const dao = skinBlock(source("../../styles/theme-tokens.css"), '[data-skin="dao"]');
    for (const token of ["--skin-tab-active-ink", "--select-accent", "--select-border", "--select-ring-rgb"]) {
      expect(dao).toContain(token);
    }
  });
});

describe("§14.3: a closed pin says so on the map", () => {
  it("the closed word is shown on pins (not screen-reader only) and the dot is an empty ring", () => {
    const css = source("../../pages/Village.css");
    expect(css).toMatch(/\.vl-pin \.ps-tag--closed\s*\{[^}]*position: static/);
    expect(css).toMatch(/\.vl-pin\[data-place-state="closed"\] \.vl-dot::before\s*\{[^}]*background: transparent/);
  });
});

describe("WP-1b: the skin layer is loaded", () => {
  it("main.tsx imports skin-journey.css after lunar-world.css", () => {
    const main = source("../../main.tsx");
    expect(main.indexOf("skin-journey.css")).toBeGreaterThan(main.indexOf("lunar-world.css"));
  });
});

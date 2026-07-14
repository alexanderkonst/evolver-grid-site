import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const skinCss = readFileSync(
  new URL("../../../index.css", import.meta.url),
  "utf8",
);

describe("shell skin tokens", () => {
  it("keeps the rail toggle strips in pane 2's color plane", () => {
    expect(skinCss).toContain(
      "--skin-rail-toggle-bg: rgba(14, 32, 68, 0.72);",
    );
    expect(skinCss).toContain(
      "--skin-rail-toggle-bg-deep: rgba(6, 12, 28, 0.94);",
    );
  });
});

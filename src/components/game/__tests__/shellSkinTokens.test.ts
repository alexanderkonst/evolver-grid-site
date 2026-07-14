import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const skinCss = readFileSync(
  new URL("../../../index.css", import.meta.url),
  "utf8",
);

describe("shell skin tokens", () => {
  it("keeps the rail toggle strips in pane 2's color plane", () => {
    expect(skinCss).toContain("--skin-rail-toggle-bg: rgb(35, 76, 157);");
    expect(skinCss).toContain("--skin-rail-toggle-bg-deep: rgb(20, 52, 122);");
    expect(skinCss).toContain(
      "--skin-rail-toggle-hairline: rgba(116, 163, 255, 0.72);",
    );
  });
});

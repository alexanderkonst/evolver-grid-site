import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const skinCss = readFileSync(
  new URL("../../../index.css", import.meta.url),
  "utf8",
);

describe("shell skin tokens", () => {
  it("gives the two toggle strips distinct left-to-right Lapis gradients", () => {
    expect(skinCss).toContain(
      "--skin-rail-toggle-bg: linear-gradient(90deg, rgb(16, 42, 96) 0%, rgb(26, 58, 128) 100%);",
    );
    expect(skinCss).toContain(
      "--skin-sections-toggle-bg: linear-gradient(90deg, rgb(26, 58, 128) 0%, rgb(43, 86, 170) 100%);",
    );
    expect(skinCss).toContain(
      "--skin-sections-toggle-bg-deep: linear-gradient(90deg, rgb(20, 52, 122) 0%, rgb(35, 76, 157) 100%);",
    );
    expect(skinCss).toContain(
      "--skin-rail-toggle-hairline: rgba(116, 163, 255, 0.72);",
    );
  });
});

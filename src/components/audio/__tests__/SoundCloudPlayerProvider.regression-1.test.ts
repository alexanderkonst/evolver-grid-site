import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const providerSource = readFileSync(
  new URL("../SoundCloudPlayerProvider.tsx", import.meta.url),
  "utf8",
);

// Regression: ISSUE-003 — the hidden SoundCloud engine emitted feature-policy errors
// Found by /qa on 2026-07-22
// Report: .gstack/qa-reports/qa-report-findyourtoptalent-com-2026-07-22.md
describe("SoundCloud iframe permissions", () => {
  it("grants the media features used by the widget", () => {
    expect(providerSource).toContain('allow="autoplay; encrypted-media"');
  });
});

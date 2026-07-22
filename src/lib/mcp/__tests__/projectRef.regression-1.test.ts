import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../index.ts", import.meta.url), "utf8");
const generated = readFileSync(
  new URL("../../../../supabase/functions/mcp/index.ts", import.meta.url),
  "utf8",
);

// Regression: ISSUE-004 — production builds emitted an empty OAuth project ref
// Found by /qa on 2026-07-22
// Report: .gstack/qa-reports/qa-report-findyourtoptalent-com-2026-07-22.md
describe("MCP Supabase issuer", () => {
  it("retains a non-empty production project reference in source and bundle", () => {
    expect(source).toContain(
      'import.meta.env.VITE_SUPABASE_PROJECT_ID || "jypjttotvastdhanwvrx"',
    );
    expect(generated).toContain(
      'var projectRef = "jypjttotvastdhanwvrx";',
    );
    expect(generated).not.toContain('var projectRef = "";');
  });
});

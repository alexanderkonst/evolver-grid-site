import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const publicProfileSource = readFileSync(
  new URL("../PublicProfile.tsx", import.meta.url),
  "utf8",
);

// Regression: ISSUE-002 — unused usernames produced duplicate HTTP 406 errors
// Found by /qa on 2026-07-22
// Report: .gstack/qa-reports/qa-report-findyourtoptalent-com-2026-07-22.md
describe("public username lookup", () => {
  it("does not coerce the zero-row RPC result with maybeSingle", () => {
    const lookupStart = publicProfileSource.indexOf(
      '.rpc("get_public_profile_by_username"',
    );
    const lookupEnd = publicProfileSource.indexOf(
      "const publicRow",
      lookupStart,
    );

    expect(lookupStart).toBeGreaterThan(-1);
    expect(lookupEnd).toBeGreaterThan(lookupStart);
    expect(publicProfileSource.slice(lookupStart, lookupEnd)).not.toContain(
      ".maybeSingle()",
    );
  });
});

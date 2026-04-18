// Smoke test — runs the dashboard renderer in --stdout mode and checks basic shape.
// Not a full unit test; the parsers underneath have their own coverage.

import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");

describe("dashboard-update renderer", () => {
  it("produces a non-empty snapshot via --stdout", () => {
    const out = execSync("node scripts/dashboard-update/index.mjs --stdout", {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    expect(out).toMatch(/^# Dashboard —/);
    expect(out).toMatch(/## 1. Headline Numbers/);
    expect(out).toMatch(/## 2. Pipeline — Stage Distribution/);
    expect(out).toMatch(/## 3. Energy Leaks/);
    expect(out).toMatch(/## 5. Upcoming Events/);
  });

  it("includes CRM-derived cash total", () => {
    const out = execSync("node scripts/dashboard-update/index.mjs --stdout", {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    // The broadcast tracker shows Cash received $1,377 — renderer strips comma → $1377.
    expect(out).toMatch(/\$1377/);
  });
});

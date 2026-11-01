// Tests for the swarm upgrade (#285): second-key gate, weekly metrics, and workflow drift guards.
// Run with: npm test -- scripts/swarm
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { GATE_LINE, isGatedFile, isGatedPr } from "./gate.mjs";
import {
  appendRow, countNeedsHarkLabeled, fmtDuration, formatRow, linkedIssue, median, reviewRounds, windowFor,
} from "./weekly.mjs";

describe("second-key gate", () => {
  it("gates supabase/ and non-test src/", () => {
    for (const f of ["supabase/functions/x/index.ts", "supabase/migrations/1.sql", "src/App.tsx", "src/pages/GameHome.tsx", "src/modules/a/b.ts"]) {
      expect(isGatedFile(f), f).toBe(true);
    }
  });
  it("does not gate docs, scripts, workflows, tests", () => {
    for (const f of ["docs/x.md", "scripts/a.mjs", ".agent/RULES.md", ".github/workflows/a.yml", "AGENTS.md",
      "src/lib/__tests__/a.ts", "src/lib/a.test.ts", "src/lib/a.test.tsx", "srcx/a.ts", "public/src/a.ts"]) {
      expect(isGatedFile(f), f).toBe(false);
    }
  });
  it("gates a rename out of a gated path", () => {
    expect(isGatedPr([{ filename: "docs/a.md", previous_filename: "src/pages/A.tsx" }])).toBe(true);
    expect(isGatedPr([{ filename: "docs/a.md" }])).toBe(false);
  });
  it("workflow copies of the regex have not drifted", () => {
    for (const f of [".agent/pending/second-key.yml", ".agent/pending/agent-automerge.yml"]) {
      expect(readFileSync(f, "utf8"), f).toContain(GATE_LINE);
    }
  });
});

describe("weekly window", () => {
  it("ends at the latest Monday 15:00 UTC", () => {
    const w = windowFor(new Date("2026-11-02T15:30:00Z")); // Monday
    expect(w.end.toISOString()).toBe("2026-11-02T15:00:00.000Z");
    expect(w.start.toISOString()).toBe("2026-10-26T15:00:00.000Z");
  });
  it("before 15:00 on Monday it still closes the previous week", () => {
    expect(windowFor(new Date("2026-11-02T14:59:00Z")).end.toISOString()).toBe("2026-10-26T15:00:00.000Z");
  });
  it("mid-week points back to the last Monday", () => {
    expect(windowFor(new Date("2026-11-05T09:00:00Z")).end.toISOString()).toBe("2026-11-02T15:00:00.000Z");
  });
});

describe("metrics helpers", () => {
  it("median", () => {
    expect(median([])).toBeNull();
    expect(median([5])).toBe(5);
    expect(median([1, 9, 3])).toBe(3);
    expect(median([1, 2, 3, 10])).toBe(2.5);
  });
  it("linked issue from body or branch", () => {
    expect(linkedIssue({ body: "stuff\nCloses #285", head: { ref: "x" } })).toBe(285);
    expect(linkedIssue({ body: "", head: { ref: "claude/issue-42-20261101-0757" } })).toBe(42);
    expect(linkedIssue({ body: "no link", head: { ref: "feature/x" } })).toBeNull();
  });
  it("review rounds: only github-actions[bot] second-key comments count", () => {
    const sk = (sha, verdict, login = "github-actions[bot]") => ({ user: { login }, body: `<!-- second-key -->\n<!-- second-key-sha: ${sha} -->\nSECOND-KEY: ${verdict}\n` });
    expect(reviewRounds({ comments: [sk("a", "CHANGES"), sk("b", "APPROVE")] })).toEqual({ rounds: 2, negative: 1, needsRework: true });
    expect(reviewRounds({ comments: [sk("a", "APPROVE")] }).needsRework).toBe(false);
    expect(reviewRounds({ comments: [sk("a", "APPROVE"), sk("b", "APPROVE")] }).needsRework).toBe(false);
    expect(reviewRounds({ comments: [sk("a", "CHANGES", "mallory")] }).rounds).toBe(0);
    expect(reviewRounds({ reviews: [{ state: "CHANGES_REQUESTED" }, { state: "APPROVED" }, { state: "COMMENTED" }] }))
      .toEqual({ rounds: 2, negative: 1, needsRework: true });
  });
  it("counts needs-hark label events inside the window only", () => {
    const start = new Date("2026-10-26T15:00:00Z");
    const end = new Date("2026-11-02T15:00:00Z");
    const ev = (event, name, at) => ({ event, label: { name }, created_at: at });
    expect(countNeedsHarkLabeled([
      ev("labeled", "needs-hark", "2026-10-30T00:00:00Z"),
      ev("labeled", "needs-hark", "2026-11-02T15:00:00Z"), // end is exclusive
      ev("labeled", "needs-hark", "2026-10-20T00:00:00Z"),
      ev("labeled", "hold", "2026-10-30T00:00:00Z"),
      ev("unlabeled", "needs-hark", "2026-10-30T00:00:00Z"),
    ], start, end)).toBe(1);
  });
  it("formats durations", () => {
    expect(fmtDuration(null)).toBe("n/a");
    expect(fmtDuration(3.24)).toBe("3.2h");
    expect(fmtDuration(72)).toBe("3.0d");
  });
});

describe("row output", () => {
  const m = {
    start: new Date("2026-10-26T15:00:00Z"), end: new Date("2026-11-02T15:00:00Z"),
    merged: 7, medianHours: 5.5, medianN: 6, rework: 2, needsHarkAdded: 1, needsHarkOpen: 1, minutes: 123.456, runs: 88,
  };
  it("formats one row with a week marker", () => {
    expect(formatRow(m)).toBe("| 2026-10-26 → 2026-11-02 | 7 | 5.5h (n=6) | 2 | 1 | 1 | 123.5 | 88 | <!-- week:2026-11-02 -->");
  });
  it("shows n/a when no merged PR links an issue", () => {
    expect(formatRow({ ...m, medianHours: null, medianN: 0 })).toContain("| n/a |");
  });
  it("appends once per week", () => {
    const doc = "# t\n\n| h |\n|---|\n";
    const first = appendRow(doc, formatRow(m), "2026-11-02");
    expect(first.added).toBe(true);
    expect(first.markdown.endsWith("<!-- week:2026-11-02 -->\n")).toBe(true);
    expect(appendRow(first.markdown, formatRow(m), "2026-11-02")).toEqual({ markdown: first.markdown, added: false });
  });
  it("the real doc ends with the table so appends land inside it", () => {
    const p = "docs/ops/swarm_weekly.md";
    if (!existsSync(p)) return;
    const lines = readFileSync(p, "utf8").trimEnd().split("\n");
    expect(lines.at(-1).startsWith("|")).toBe(true);
  });
});

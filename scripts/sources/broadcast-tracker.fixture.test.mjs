import { describe, it, expect } from "vitest";
import { mkdtempSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readBroadcastTracker } from "./broadcast-tracker.mjs";

// Synthetic v6.0 layout (core + crm/*.md + metrics-history.csv). No private
// CRM content lives here — names and numbers are invented.
const FIXTURE_DIR = join(import.meta.dirname, "__fixtures__", "crm-v6");

describe("readBroadcastTracker — v6.0 layout fixture", () => {
  const tracker = readBroadcastTracker({ strategyDir: FIXTURE_DIR });

  it("keeps core-file sections working", () => {
    expect(tracker.contacts.map((c) => c.name)).toEqual(["Test Person One", "Test Person Two"]);
    expect(tracker.segmentDistribution).toEqual({ CLIENT: 1, BRIDGE: 1 });
    expect(tracker.cashReceivedUsd).toBe(1066);
    expect(tracker.revShareContractsUsd).toBe(277);
    expect(tracker.openItems).toEqual([
      { done: false, text: "Follow up with fixture person" },
      { done: true, text: "Ship v6.0 parser" },
    ]);
    expect(tracker.offers).toHaveLength(1);
    expect(tracker.version).toBe("v6.0");
  });

  it("finds brand-and-content sections in crm/brand-and-content.md", () => {
    expect(tracker.intuitiveLaunch).toHaveLength(1);
    expect(tracker.intuitiveLaunch[0].items.map((i) => [i.name, i.done])).toEqual([
      ["Alpha", true],
      ["Beta", false],
    ]);
    expect(tracker.surfacePosts.map((p) => [p.surface, p.posted])).toEqual([
      ["Facebook", true],
      ["LinkedIn", false],
    ]);
    expect(tracker.contentPillars).toHaveLength(2);
    expect(tracker.contentPillars[0]).toMatch(/^Talents/);
  });

  it("finds Energy Leak Audit and Upcoming Events in crm/archive.md", () => {
    expect(tracker.energyLeaks.map((l) => l.name)).toEqual(["Leak One", "Leak Two"]);
    expect(tracker.energyLeakCount).toBe(2);
    expect(tracker.upcomingEvents).toHaveLength(1);
    expect(tracker.upcomingEvents[0].event).toBe("Fixture workshop");
  });

  it("no longer exposes the retired weekly Metrics / Pipeline Analytics", () => {
    expect(tracker).not.toHaveProperty("metrics");
    expect(tracker).not.toHaveProperty("pipelineAnalytics");
  });

  it("parses the funnel by cohort from the METRICS block", () => {
    expect(tracker.funnel).toEqual([
      { cohort: "Warm base", metrics: { Sent: 24, Replied: 6, Booked: 2, Paid: 1 } },
      { cohort: "Cold LinkedIn", metrics: { Sent: 1200, Replied: 37.5, Booked: 3, Paid: 0 } },
    ]);
  });

  it("parses the history series from metrics-history.csv", () => {
    expect(tracker.metricsHistory).toEqual([
      { date: "2026-10-09", cohort: "Warm base", sent: 20, replied: 4, note: "first, partial week" },
      { date: "2026-10-16", cohort: "Warm base", sent: 24, replied: 6, note: "" },
    ]);
  });
});

describe("readBroadcastTracker — missing files are non-fatal", () => {
  it("returns empty sections when crm/ siblings and the CSV are absent", () => {
    const dir = mkdtempSync(join(tmpdir(), "crm-core-only-"));
    try {
      copyFileSync(
        join(FIXTURE_DIR, "strategic_crm_outreach_tracker.md"),
        join(dir, "strategic_crm_outreach_tracker.md"),
      );
      const tracker = readBroadcastTracker({ strategyDir: dir });
      expect(tracker.contacts).toHaveLength(2);
      expect(tracker.funnel).toHaveLength(2);
      expect(tracker.metricsHistory).toEqual([]);
      expect(tracker.energyLeaks).toEqual([]);
      expect(tracker.upcomingEvents).toEqual([]);
      expect(tracker.intuitiveLaunch).toEqual([]);
      expect(tracker.surfacePosts).toEqual([]);
      expect(tracker.contentPillars).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("returns an empty funnel when the METRICS block is absent", () => {
    const dir = mkdtempSync(join(tmpdir(), "crm-no-metrics-"));
    try {
      copyFileSync(
        join(FIXTURE_DIR, "crm", "archive.md"),
        join(dir, "strategic_crm_outreach_tracker.md"),
      );
      expect(readBroadcastTracker({ strategyDir: dir }).funnel).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

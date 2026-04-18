import { describe, it, expect } from "vitest";
import {
  readBroadcastTracker,
  groupContactsByStage,
  filterBySegment,
} from "./broadcast-tracker.mjs";

describe("readBroadcastTracker", () => {
  const tracker = readBroadcastTracker();

  it("parses the Master Table with all contacts", () => {
    expect(tracker.contacts.length).toBeGreaterThan(20);
    // The first contact is Oyi — documented in the fixture.
    const oyi = tracker.contacts.find((c) => c.name === "Oyi");
    expect(oyi).toBeTruthy();
    expect(oyi.segments).toContain("CLIENT");
    expect(oyi.stage).toBe("Build");
  });

  it("derives stage distribution", () => {
    expect(tracker.stageDistribution).toBeTruthy();
    // Sum of distribution equals contact count.
    const total = Object.values(tracker.stageDistribution).reduce((a, b) => a + b, 0);
    expect(total).toBe(tracker.contacts.length);
  });

  it("derives segment distribution with CLIENT + BULLSEYE presence", () => {
    expect(tracker.segmentDistribution.CLIENT).toBeGreaterThan(0);
  });

  it("extracts revenue totals", () => {
    expect(tracker.cashReceivedUsd).toBeGreaterThan(0);
    expect(tracker.revShareContractsUsd).toBeGreaterThan(0);
  });

  it("parses Open Items as checklist", () => {
    expect(tracker.openItems.length).toBeGreaterThan(0);
    expect(tracker.openItems[0]).toHaveProperty("done");
    expect(tracker.openItems[0]).toHaveProperty("text");
  });

  it("parses Energy Leak Audit — 5 flagged relationships", () => {
    expect(tracker.energyLeaks.length).toBe(5);
    const names = tracker.energyLeaks.map((l) => l.name);
    expect(names).toContain("José");
    expect(names).toContain("Terrina");
  });

  it("parses Upcoming Events", () => {
    expect(tracker.upcomingEvents.length).toBeGreaterThan(0);
  });

  it("parses Intuitive Launch Log batches", () => {
    expect(tracker.intuitiveLaunch.length).toBeGreaterThan(0);
    expect(tracker.intuitiveLaunch[0]).toHaveProperty("items");
  });

  it("parses Surface Posts with posted flag", () => {
    expect(tracker.surfacePosts.length).toBeGreaterThan(0);
    const facebook = tracker.surfacePosts.find((p) =>
      p.surface.toLowerCase().includes("facebook")
    );
    expect(facebook).toBeTruthy();
  });

  it("parses Pipeline Analytics rows", () => {
    expect(tracker.pipelineAnalytics.length).toBeGreaterThan(0);
  });

  it("parses Content Pillars", () => {
    expect(tracker.contentPillars.length).toBe(2);
    expect(tracker.contentPillars[0]).toMatch(/Talents/i);
  });

  it("parses footer meta", () => {
    expect(tracker.version).toMatch(/^v/);
    expect(tracker.updatedNote).toBeTruthy();
  });

  it("helper: groupContactsByStage('Build') returns active Build clients", () => {
    const build = groupContactsByStage(tracker.contacts, "Build");
    const names = build.map((c) => c.name);
    expect(names).toContain("Oyi");
    expect(names).toContain("Sergey");
  });

  it("helper: filterBySegment('CLIENT') surfaces active clients", () => {
    const clients = filterBySegment(tracker.contacts, "CLIENT");
    expect(clients.length).toBeGreaterThan(0);
  });
});

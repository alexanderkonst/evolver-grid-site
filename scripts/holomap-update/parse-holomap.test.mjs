import { describe, it, expect } from "vitest";
import { readHolomap } from "./parse-holomap.mjs";
import { readRoadmap, readSessionLogSince } from "./parse-inputs.mjs";

describe("readHolomap", () => {
  it("extracts updated date, center reading, holon", () => {
    const m = readHolomap();
    expect(m.updated).toMatch(/\d{4}/);
    expect(m.centerReading).toBeTruthy();
    expect(m.holon).toBeTruthy();
  });

  it("finds all 12 perspectives", () => {
    const m = readHolomap();
    expect(m.perspectives).toHaveLength(12);
    expect(m.perspectives[0].number).toBe(1);
    expect(m.perspectives[11].number).toBe(12);
  });
});

describe("readRoadmap", () => {
  it("extracts last updated + current status", () => {
    const r = readRoadmap();
    expect(r.lastUpdated).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(r.currentStatus).toBeTruthy();
  });
});

describe("readSessionLogSince", () => {
  it("returns entries with day number + date", () => {
    const entries = readSessionLogSince("2026-04-01");
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) {
      expect(typeof e.dayNumber).toBe("number");
      expect(e.date).toMatch(/\d{4}/);
      expect(e.excerpt.length).toBeGreaterThan(10);
    }
  });
});

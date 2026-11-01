import { describe, expect, it } from "vitest";
import {
  classifyLight,
  daylightHalfArc,
  getLight,
  getLightState,
  skyPalette,
  sunPosition,
  timezoneGeo,
} from "../sunLight";

// Greenwich, 51.5°N. Hand-checked: on the June solstice the sun's noon
// altitude is 90 − 51.5 + 23.44 ≈ 61.9°, and at hour angle h the altitude
// follows sin(alt) = sin φ sin δ + cos φ cos δ cos h.
const LON = { lat: 51.5, lon: 0 };
const at = (month: number, day: number, hour: number) => Date.UTC(2026, month - 1, day, hour);

describe("sunPosition", () => {
  it("puts the June-solstice noon sun near 62° over Greenwich", () => {
    const sun = sunPosition(at(6, 21, 12), LON.lat, LON.lon);
    expect(sun.altitudeDeg).toBeCloseTo(61.9, 0);
    expect(sun.declinationDeg).toBeCloseTo(23.44, 1);
  });

  it("is before solar noon (negative hour angle) in the morning, after it in the evening", () => {
    expect(sunPosition(at(6, 21, 8), LON.lat, LON.lon).hourAngle).toBeLessThan(0);
    expect(sunPosition(at(6, 21, 16), LON.lat, LON.lon).hourAngle).toBeGreaterThan(0);
  });
});

describe("getLightState — Greenwich, June solstice", () => {
  const cases: Array<[string, number, string]> = [
    ["midnight is Night", 0, "Night"],
    ["04:00 UTC, sun rising just above the horizon, is Dawn", 4, "Dawn"],
    ["06:00 UTC, climbing, is Morning", 6, "Morning"],
    ["noon is Zenith", 12, "Zenith"],
    ["18:00 UTC, past noon and still high, is Afternoon", 18, "Afternoon"],
    ["20:00 UTC, sun about 1° up and falling, is Golden hour", 20, "Golden hour"],
    ["21:00 UTC, sun about 5° below the horizon, is Dusk", 21, "Dusk"],
  ];
  it.each(cases)("%s", (_label, hour, expected) => {
    expect(getLightState(at(6, 21, hour), LON.lat, LON.lon)).toBe(expected);
  });
});

describe("getLightState — other places", () => {
  it("reads Zenith at the Sydney summer-solstice noon (southern hemisphere)", () => {
    // Solar noon over 151.2°E is ~01:55 UTC.
    expect(getLightState(Date.UTC(2026, 11, 21, 2, 0), -33.87, 151.2)).toBe("Zenith");
  });

  it("stays Night all day in the polar night", () => {
    const light = getLight(Date.UTC(2026, 11, 21, 12), 78, 15);
    expect(light.altitudeDeg).toBeLessThan(-6);
    expect(light.state).toBe("Night");
    expect(light.daylightHalfArc).toBe(0);
  });

  it("never reads Night in the midnight sun", () => {
    const light = getLight(Date.UTC(2026, 5, 21, 0), 78, 15);
    expect(light.altitudeDeg).toBeGreaterThan(6);
    expect(["Morning", "Afternoon"]).toContain(light.state);
    expect(light.daylightHalfArc).toBe(Math.PI);
  });
});

describe("classifyLight", () => {
  const cases: Array<[number, boolean, number, string]> = [
    [-10, true, 60, "Night"],
    [-10, false, 60, "Night"],
    [-3, true, 60, "Dawn"],
    [-3, false, 60, "Dusk"],
    [3, true, 60, "Dawn"],
    [3, false, 60, "Golden hour"],
    [6, true, 60, "Morning"],
    [10, false, 60, "Afternoon"],
    [48, true, 60, "Zenith"],
    [60, false, 60, "Zenith"],
    // A low-sun winter day never reaches the Zenith share of 6°+.
    [7, true, 8, "Zenith"],
  ];
  it.each(cases)("alt %d° rising=%s noon=%d° → %s", (alt, rising, noon, expected) => {
    expect(classifyLight(alt, rising, noon)).toBe(expected);
  });
});

describe("daylightHalfArc", () => {
  it("is a little over a quarter turn at the equator on the equinox", () => {
    expect(daylightHalfArc(0, 0)).toBeCloseTo((90.83 * Math.PI) / 180, 2);
  });
  it("is 0 in polar night and π in the midnight sun", () => {
    expect(daylightHalfArc(78, -23.44)).toBe(0);
    expect(daylightHalfArc(78, 23.44)).toBe(Math.PI);
  });
});

describe("timezoneGeo (no location shared)", () => {
  it("takes longitude from the UTC offset and marks itself approximate", () => {
    expect(timezoneGeo("Europe/Berlin", -60)).toEqual({ lat: 40, lon: 15, source: "timezone" });
    expect(timezoneGeo("America/New_York", 300)).toEqual({ lat: 40, lon: -75, source: "timezone" });
  });
  it("guesses the southern hemisphere for known southern zones", () => {
    expect(timezoneGeo("Australia/Sydney", -660)).toEqual({ lat: -30, lon: 165, source: "timezone" });
  });
  it("copes with an unknown zone", () => {
    expect(timezoneGeo(undefined, 0)).toEqual({ lat: 40, lon: 0, source: "timezone" });
  });
});

describe("skyPalette", () => {
  it("clamps to the deepest night and the brightest day", () => {
    expect(skyPalette(-40)).toEqual({ top: "#070a10", bottom: "#0c121a" });
    expect(skyPalette(90)).toEqual({ top: "#4a7399", bottom: "#b4cadd" });
  });
  it("hits a stop exactly and interpolates between stops", () => {
    expect(skyPalette(0).top).toBe("#1c2d47");
    const mid = skyPalette(3);
    expect(mid.top).toMatch(/^#[0-9a-f]{6}$/);
    expect(mid.top).not.toBe(skyPalette(0).top);
    expect(mid.top).not.toBe(skyPalette(6).top);
  });
});

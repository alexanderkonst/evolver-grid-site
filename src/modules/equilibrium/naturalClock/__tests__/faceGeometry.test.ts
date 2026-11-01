import { describe, expect, it } from "vitest";
import { phaseByLunarIndex } from "../../phasePlan";
import { arcPath, lunarIndexOfPosition, polar, sunDialDeg } from "../faceGeometry";

describe("polar", () => {
  it("reads like a clock: 0° is the top, 90° the right, 180° the bottom", () => {
    expect(polar(100, 0, 160, 160)).toEqual([160, 60]);
    expect(polar(100, 90, 160, 160)).toEqual([260, 160]);
    expect(polar(100, 180, 160, 160)).toEqual([160, 260]);
    expect(polar(100, 270, 160, 160)).toEqual([60, 160]);
  });
});

describe("arcPath", () => {
  it("is empty for no sweep", () => {
    expect(arcPath(50, 90, 90)).toBe("");
    expect(arcPath(50, 90, 80)).toBe("");
  });
  it("draws a quarter turn with the small-arc flag", () => {
    expect(arcPath(100, 0, 90, 160, 160)).toBe("M 160 60 A 100 100 0 0 1 260 160");
  });
  it("uses the large-arc flag past a half turn", () => {
    expect(arcPath(100, 0, 270, 160, 160)).toBe("M 160 60 A 100 100 0 1 1 60 160");
  });
  it("draws a full turn as two half arcs", () => {
    expect(arcPath(100, 0, 360, 160, 160)).toBe(
      "M 160 60 A 100 100 0 1 1 160 260 A 100 100 0 1 1 160 60",
    );
  });
});

describe("lunarIndexOfPosition", () => {
  it("inverts phasePlan's astronomical → cycle-position mapping", () => {
    for (let position = 1; position <= 8; position++) {
      expect(phaseByLunarIndex(lunarIndexOfPosition(position)).position).toBe(position);
    }
  });
});

describe("sunDialDeg", () => {
  it("converts hour angle radians to dial degrees", () => {
    expect(sunDialDeg(0)).toBe(0);
    expect(sunDialDeg(Math.PI / 2)).toBeCloseTo(90, 10);
    expect(sunDialDeg(-Math.PI / 2)).toBeCloseTo(-90, 10);
  });
});

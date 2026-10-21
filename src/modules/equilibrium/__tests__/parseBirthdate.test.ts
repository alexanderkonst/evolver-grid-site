import { describe, expect, it } from "vitest";
import { parseBirthdate } from "../lib/parseBirthdate";

const NOW = new Date("2026-10-21T12:00:00Z");

describe("parseBirthdate", () => {
  it("accepts ISO dates", () => {
    expect(parseBirthdate("1990-03-25", NOW)).toBe("1990-03-25");
    expect(parseBirthdate(" 1990/3/5 ", NOW)).toBe("1990-03-05");
  });

  it("accepts day-first dotted dates", () => {
    expect(parseBirthdate("25.03.1990", NOW)).toBe("1990-03-25");
    expect(parseBirthdate("03.04.1990", NOW)).toBe("1990-04-03");
  });

  it("disambiguates slash dates when only one reading is valid", () => {
    expect(parseBirthdate("25/03/1990", NOW)).toBe("1990-03-25");
    expect(parseBirthdate("03/25/1990", NOW)).toBe("1990-03-25");
  });

  it("rejects ambiguous slash dates", () => {
    expect(parseBirthdate("03/04/1990", NOW)).toBeNull();
  });

  it("rejects bad, impossible, old, and future dates", () => {
    expect(parseBirthdate("", NOW)).toBeNull();
    expect(parseBirthdate("hello", NOW)).toBeNull();
    expect(parseBirthdate("1990-02-30", NOW)).toBeNull();
    expect(parseBirthdate("1899-12-31", NOW)).toBeNull();
    expect(parseBirthdate("2027-01-01", NOW)).toBeNull();
  });
});

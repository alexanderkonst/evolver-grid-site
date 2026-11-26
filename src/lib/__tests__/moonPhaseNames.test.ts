import { describe, expect, it } from "vitest";
import en from "@/locales/en/common.json";
import es from "@/locales/es/common.json";
import ru from "@/locales/ru/common.json";
import { MOON_PHASES } from "@/lib/equilibrium-cycles";
import { MOON_PHASE_DISPLAY_EN, moonPhaseIndexOf, moonPhaseName } from "../moonPhaseNames";

/** Rings v7 item 7 (docs/specs/equilibrium/biologic_clock_rings_spec.md): the neutral names, one table. */
const TABLE = {
  en: ["New Moon", "Growing Crescent", "Growing Half", "Almost Full", "Full Moon", "Past Full", "Fading Half", "Fading Crescent"],
  ru: ["Новолуние", "Растущий серп", "Растущая половина", "Почти полная", "Полнолуние", "После полнолуния", "Убывающая половина", "Убывающий серп"],
  es: ["Luna nueva", "Creciente fina", "Media creciente", "Casi llena", "Luna llena", "Recién llena", "Media menguante", "Menguante fina"],
} as const;

const catalogs = { en, ru, es } as const;
const OLD_NAMES = /Gibbous|Waxing|Waning|First Quarter|Last Quarter|Gibosa|Cuarto (creciente|menguante)|Luna (creciente|menguante)|Первая четверть|Последняя четверть|Растущая луна|Убывающая луна/;

describe("neutral moon-phase display names", () => {
  it.each(["en", "ru", "es"] as const)("%s catalog: moonPhase.0–7 and waterFace.phase.0–7 are the spec table", (lng) => {
    const c = catalogs[lng];
    const moon = Object.values(c.moonPhase);
    expect(moon).toEqual([...TABLE[lng]]);
    expect(Object.values(c.waterFace.phase)).toEqual([...TABLE[lng]]);
  });

  it("the English default table is the en catalog", () => {
    expect([...MOON_PHASE_DISPLAY_EN]).toEqual([...TABLE.en]);
  });

  it("no old astronomical name is left in the three moon-phase catalogs", () => {
    for (const lng of ["en", "ru", "es"] as const) {
      const c = catalogs[lng];
      for (const name of [...Object.values(c.moonPhase), ...Object.values(c.waterFace.phase)]) expect(name).not.toMatch(OLD_NAMES);
    }
  });

  it("from an index or from the engine's astronomical name (the internal key)", () => {
    MOON_PHASES.forEach((p, i) => {
      expect(moonPhaseIndexOf(p.name)).toBe(i);
      expect(moonPhaseName(i)).toBe(TABLE.en[i]);
      expect(moonPhaseName(p.name)).toBe(TABLE.en[i]);
      expect(moonPhaseName(p.name)).not.toMatch(OLD_NAMES);
    });
    // the engine keeps its astronomical keys: they are not renamed
    expect(MOON_PHASES.map((p) => p.name)).toEqual([
      "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
    ]);
  });

  it("uses the given translator, with the English name as the default value", () => {
    const t = ((key: string, opts?: { defaultValue?: string }) => (key === "moonPhase.3" ? "Casi llena" : opts?.defaultValue)) as never;
    expect(moonPhaseName(3, t)).toBe("Casi llena");
    expect(moonPhaseName("Waxing Gibbous", t)).toBe("Casi llena");
    expect(moonPhaseName(5, t)).toBe("Past Full");
  });

  it("wraps an out-of-range index and leaves an unknown name as it is", () => {
    expect(moonPhaseName(8)).toBe("New Moon");
    expect(moonPhaseName(-1)).toBe("Fading Crescent");
    expect(moonPhaseName("Blue Moon")).toBe("Blue Moon");
  });
});

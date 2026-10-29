import { describe, expect, it } from "vitest";
import en from "@/locales/en/common.json";
import es from "@/locales/es/common.json";
import ru from "@/locales/ru/common.json";
import { STAGE_STARTS_S, stageIndexAt } from "../AppleseedRitualLoading";

describe("ZoG reveal wait: the waiting line follows elapsed time", () => {
  it("reading your answers, then finding the pattern, then writing your talent", () => {
    expect(stageIndexAt(0, 3)).toBe(0);
    expect(stageIndexAt(STAGE_STARTS_S[1] - 1, 3)).toBe(0);
    expect(stageIndexAt(STAGE_STARTS_S[1], 3)).toBe(1);
    expect(stageIndexAt(STAGE_STARTS_S[2] - 1, 3)).toBe(1);
    expect(stageIndexAt(STAGE_STARTS_S[2], 3)).toBe(2);
    // A wait past the usual four minutes stays on the last line.
    expect(stageIndexAt(600, 3)).toBe(2);
  });

  it("never points past the lines it was given", () => {
    expect(stageIndexAt(600, 2)).toBe(1);
    expect(stageIndexAt(600, 0)).toBe(0);
  });

  it("the three lines exist in EN, ES and RU, and the hint says 2–4 minutes", () => {
    for (const [lng, catalog] of Object.entries({ en, es, ru })) {
      const zog = catalog.zogEntry as Record<string, string>;
      for (const key of ["revealStageReading", "revealStagePattern", "revealStageWriting", "revealWaitHint"]) {
        expect(zog[key], `${lng}.zogEntry.${key}`).toBeTruthy();
      }
    }
    expect(en.zogEntry.revealWaitHint).toContain("2–4 minutes");
    expect(en.zogEntry.revealWaitHint).not.toMatch(/one to three/i);
  });
});

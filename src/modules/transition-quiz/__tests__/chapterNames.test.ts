import { describe, expect, it } from "vitest";
import en from "@/locales/en/common.json";
import es from "@/locales/es/common.json";
import ru from "@/locales/ru/common.json";

const ENGLISH_CANON = [
  "Career-Building",
  "Dormant Potential",
  "The Stuckness",
  "The Breakdown",
  "The Free Fall",
  "Metamorphosis",
  "The New You & The New Chapter",
] as const;

const locales = { en, es, ru };

describe("entrepreneur's hero's journey chapter names", () => {
  it("uses the carousel canon throughout the English quiz", () => {
    expect(Object.values(en.quiz.stageNames)).toEqual(ENGLISH_CANON);
  });

  it.each(Object.entries(locales))(
    "keeps the %s quiz arc and expanded homepage map aligned",
    (_locale, content) => {
      const quizNames = Object.values(content.quiz.stageNames);
      const mapNames = Array.from({ length: 7 }, (_, index) =>
        content.homeLanding.map[`stage${index + 1}Name` as keyof typeof content.homeLanding.map],
      );

      expect(mapNames).toEqual(quizNames);
    },
  );
});

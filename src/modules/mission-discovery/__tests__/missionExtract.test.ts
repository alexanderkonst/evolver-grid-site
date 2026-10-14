import { describe, it, expect } from "vitest";
import {
  extractOneSentence,
  normalizeWhitespaceEscapes,
} from "../missionExtract";

describe("Mission one-sentence extraction (issue #45)", () => {
  describe("normalizeWhitespaceEscapes", () => {
    it("collapses literal backslash-n escapes to a single space", () => {
      expect(normalizeWhitespaceEscapes("I build\\nbridges")).toBe("I build bridges");
    });

    it("collapses literal \\r\\n and \\t escapes", () => {
      expect(normalizeWhitespaceEscapes("a\\r\\nb\\tc")).toBe("a b c");
    });

    it("collapses real newlines/tabs too", () => {
      expect(normalizeWhitespaceEscapes("a\n\nb\tc")).toBe("a b c");
    });

    it("leaves a clean single sentence untouched", () => {
      expect(normalizeWhitespaceEscapes("I help people see themselves.")).toBe(
        "I help people see themselves.",
      );
    });
  });

  describe("extractOneSentence — JSON path", () => {
    it("pulls mission_one_sentence from a JSON paste", () => {
      const raw = `Here you go:\n{"mission_analysis":"...","mission_one_sentence":"I turn tangled ideas into clear systems."}`;
      expect(extractOneSentence(raw)).toBe(
        "I turn tangled ideas into clear systems.",
      );
    });

    it("strips literal \\n that survived a double-escaped JSON value", () => {
      // Regression for the reported "literal \\n shows as escaped text" bug.
      const raw = `{"mission_one_sentence":"I connect people\\nto their purpose."}`;
      expect(extractOneSentence(raw)).toBe("I connect people to their purpose.");
    });

    it("parses the JSON block that follows a prose preamble", () => {
      const raw = `Here is my analysis of your answers.

{"mission_analysis":"long analysis text","mission_one_sentence":"My real mission sentence."}`;
      expect(extractOneSentence(raw)).toBe("My real mission sentence.");
    });
  });

  describe("extractOneSentence — legacy marker fallback", () => {
    it("extracts from the '1 sentence synthesis:' marker", () => {
      const raw = `blah blah\n\n**1 sentence synthesis:** I help founders find their edge.`;
      expect(extractOneSentence(raw)).toBe("I help founders find their edge.");
    });

    it("returns null when nothing matches", () => {
      expect(extractOneSentence("no marker, no json here")).toBeNull();
    });

    it("returns null for empty input", () => {
      expect(extractOneSentence("")).toBeNull();
    });
  });
});

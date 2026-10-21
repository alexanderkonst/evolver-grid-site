import { describe, it, expect } from "vitest";
import { formatBullseye, formatBullseyeLine } from "../bullseye";

/**
 * Issue #93: the reveal card read "Iturn a founder's unfinished thoughts…".
 * The prefix + sentence must always come out as one string with exactly one
 * space between "I" and the verb.
 */
describe("formatBullseyeLine", () => {
  it("joins the I prefix and a lowercase verb with a single space", () => {
    expect(formatBullseyeLine("turn a founder's unfinished thoughts into a plan")).toBe(
      "I turn a founder's unfinished thoughts into a plan",
    );
  });

  it("sentence-cases and drops the trailing period", () => {
    expect(formatBullseyeLine("Turn foggy power into a clear path.")).toBe(
      "I turn foggy power into a clear path",
    );
  });

  it("tolerates leading/trailing whitespace in the generated sentence", () => {
    expect(formatBullseyeLine("   turn noise into signal \n")).toBe("I turn noise into signal");
  });

  it("does not double the prefix when the sentence already starts with 'I '", () => {
    expect(formatBullseyeLine("I turn noise into signal")).toBe("I turn noise into signal");
  });

  it("uses a custom (localized) prefix", () => {
    expect(formatBullseyeLine("turn noise into signal", "Yo")).toBe("Yo turn noise into signal");
  });
});

describe("formatBullseye", () => {
  it("keeps verbs that merely begin with the letter i", () => {
    expect(formatBullseye("ignite quiet courage")).toBe("ignite quiet courage");
  });
});

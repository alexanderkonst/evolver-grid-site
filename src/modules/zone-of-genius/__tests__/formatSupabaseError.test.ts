import { describe, it, expect } from "vitest";
import { formatSupabaseError } from "../formatSupabaseError";

/**
 * Issue #45 (Sasha 2026-10-14): the real cause of a ZoG save failure was
 * masked because PostgrestError is a plain object, not an Error instance.
 * formatSupabaseError must dig the diagnostic fields out of that object.
 */
describe("formatSupabaseError", () => {
  it("surfaces a PostgrestError's code + message (the masked RLS case)", () => {
    const pgError = {
      code: "42501",
      message: "new row violates row-level security policy for table \"zog_snapshots\"",
      details: null,
      hint: null,
    };
    const out = formatSupabaseError(pgError, "Failed to save Appleseed");
    expect(out).toContain("42501");
    expect(out).toContain("row-level security");
    expect(out).not.toBe("Failed to save Appleseed");
  });

  it("includes details and hint when present", () => {
    const pgError = {
      code: "42703",
      message: 'column "output_language" does not exist',
      details: "some detail",
      hint: "add the column",
    };
    const out = formatSupabaseError(pgError, "fallback");
    expect(out).toContain("42703");
    expect(out).toContain("output_language");
    expect(out).toContain("some detail");
    expect(out).toContain("hint: add the column");
  });

  it("uses a real Error's message", () => {
    expect(formatSupabaseError(new Error("boom"), "fallback")).toBe("boom");
  });

  it("falls back for null / empty input", () => {
    expect(formatSupabaseError(null, "fallback")).toBe("fallback");
    expect(formatSupabaseError(undefined, "fallback")).toBe("fallback");
    expect(formatSupabaseError({}, "fallback")).toBe("fallback");
  });

  it("passes a plain string through", () => {
    expect(formatSupabaseError("something", "fallback")).toBe("something");
  });
});

import { describe, it, expect } from "vitest";
import { formatSupabaseError, isSchemaDriftError } from "../formatSupabaseError";

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

/**
 * Issue #50 (Sasha 2026-10-14) item 1: the toast layer picks a friendly line
 * based on whether a failure is schema drift (a missing column/table, i.e. an
 * unapplied migration) vs a generic/transient failure.
 */
describe("isSchemaDriftError", () => {
  it("flags the drift codes on a PostgrestError object", () => {
    expect(isSchemaDriftError({ code: "PGRST204", message: "missing col" })).toBe(true);
    expect(isSchemaDriftError({ code: "42703", message: "undefined column" })).toBe(true);
    expect(isSchemaDriftError({ code: "42P01", message: "undefined table" })).toBe(true);
    expect(isSchemaDriftError({ code: "PGRST205", message: "missing table" })).toBe(true);
  });

  it("does NOT flag an RLS denial or a generic failure", () => {
    expect(isSchemaDriftError({ code: "42501", message: "rls" })).toBe(false);
    expect(isSchemaDriftError(new Error("network blip"))).toBe(false);
    expect(isSchemaDriftError(null)).toBe(false);
    expect(isSchemaDriftError(undefined)).toBe(false);
  });

  it("detects drift from an already-formatted string (the result.error path)", () => {
    expect(
      isSchemaDriftError("[PGRST204] Could not find the 'output_language' column"),
    ).toBe(true);
    expect(isSchemaDriftError("Profile not found — your data is buffered locally")).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import {
  describeDbError,
  isSchemaDriftError,
  formatDbErrorForUser,
} from "../dbError";

describe("ZoG save-path DB error describer (issue #45)", () => {
  describe("describeDbError", () => {
    it("reads the message off a real Error instance", () => {
      const d = describeDbError(new Error("network down"));
      expect(d.message).toBe("network down");
      expect(d.isSchemaDrift).toBe(false);
      expect(d.code).toBeUndefined();
    });

    it("extracts message/code/details/hint from a Postgrest-shaped object", () => {
      // The whole point of the fix: a Supabase error is a plain object, NOT
      // an Error instance, so the old `err instanceof Error` check discarded
      // all of this.
      const pgError = {
        message: "new row violates row-level security policy",
        code: "42501",
        details: "Failing row contains (...)",
        hint: null,
      };
      const d = describeDbError(pgError);
      expect(d.message).toBe("new row violates row-level security policy");
      expect(d.code).toBe("42501");
      expect(d.details).toBe("Failing row contains (...)");
      expect(d.isSchemaDrift).toBe(false);
    });

    it("flags missing-column schema drift (prod migration not applied)", () => {
      const d = describeDbError({
        message: "column zog_snapshots.output_language does not exist",
        code: "42703",
      });
      expect(d.isSchemaDrift).toBe(true);
    });

    it("flags the PostgREST schema-cache miss code", () => {
      expect(describeDbError({ message: "x", code: "PGRST204" }).isSchemaDrift).toBe(true);
    });

    it("falls back cleanly for strings and unknown shapes", () => {
      expect(describeDbError("boom").message).toBe("boom");
      expect(describeDbError(null).message).toBe("Unknown database error");
      expect(describeDbError(undefined).message).toBe("Unknown database error");
      expect(describeDbError({}).message).toBe("Unknown database error");
    });
  });

  describe("isSchemaDriftError", () => {
    it("recognizes undefined_column / undefined_table / schema-cache codes", () => {
      expect(isSchemaDriftError("42703")).toBe(true);
      expect(isSchemaDriftError("42P01")).toBe(true);
      expect(isSchemaDriftError("PGRST204")).toBe(true);
    });

    it("does not flag RLS / other codes or undefined", () => {
      expect(isSchemaDriftError("42501")).toBe(false);
      expect(isSchemaDriftError("23505")).toBe(false);
      expect(isSchemaDriftError(undefined)).toBe(false);
    });
  });

  describe("formatDbErrorForUser", () => {
    it("appends the code when present", () => {
      expect(
        formatDbErrorForUser({ message: "permission denied", code: "42501" }),
      ).toBe("permission denied (42501)");
    });

    it("gives an actionable, no-retry hint for schema drift", () => {
      const msg = formatDbErrorForUser({
        message: "column does not exist",
        code: "42703",
      });
      expect(msg).toContain("42703");
      expect(msg.toLowerCase()).toContain("migration");
    });

    it("returns the bare message when there is no code", () => {
      expect(formatDbErrorForUser(new Error("offline"))).toBe("offline");
    });
  });
});

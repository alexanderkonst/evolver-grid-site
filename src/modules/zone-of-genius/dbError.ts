/**
 * Shared Supabase/Postgrest error describer for the Zone-of-Genius save path.
 *
 * Day 212 (2026-10-14, issue #45): the ZoG snapshot save was failing on a
 * full retake ("Failed to save your snapshot…" / "Save Failed — Failed to
 * save Appleseed") but the REAL cause was invisible. Both call sites did
 *
 *     err instanceof Error ? err.message : "Failed to save Appleseed"
 *
 * and a Supabase/Postgrest error is a plain object — NOT an `Error`
 * instance — so the actual message/code (RLS denial `42501`, missing-column
 * schema drift `42703` / `PGRST204`, etc.) was discarded in favour of the
 * generic fallback. That is the same masking bug the Mission-Discovery save
 * hit on Day 80 (see MissionDiscoveryLanding.tsx), fixed there the same way.
 *
 * This helper pulls a human-readable message out of whichever shape the
 * error has, and `isSchemaDriftError` flags the "a migration isn't applied
 * in production" class so callers can tell the user something actionable
 * instead of asking them to retry a write that will never succeed.
 */

export interface DescribedDbError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  /** True when the error looks like a missing column/table (prod schema drift). */
  isSchemaDrift: boolean;
}

// Postgres: 42703 = undefined_column, 42P01 = undefined_table.
// PostgREST: PGRST204 = column not found in the schema cache (the symptom
// when a migration adding a column hasn't been applied to the live DB).
const SCHEMA_DRIFT_CODES = new Set(["42703", "42P01", "PGRST204"]);

export const isSchemaDriftError = (code?: string): boolean =>
  !!code && SCHEMA_DRIFT_CODES.has(code);

export const describeDbError = (err: unknown): DescribedDbError => {
  // Error instance (network throw, our own `throw new Error(...)`).
  if (err instanceof Error) {
    return { message: err.message, isSchemaDrift: false };
  }

  // Postgrest-shaped plain object: { message, code, details, hint }.
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    const code = typeof e.code === "string" ? e.code : undefined;
    const message =
      (typeof e.message === "string" && e.message) ||
      (typeof e.error === "string" && e.error) ||
      "Unknown database error";
    return {
      message,
      code,
      details: typeof e.details === "string" ? e.details : undefined,
      hint: typeof e.hint === "string" ? e.hint : undefined,
      isSchemaDrift: isSchemaDriftError(code),
    };
  }

  if (typeof err === "string") {
    return { message: err, isSchemaDrift: false };
  }

  return { message: "Unknown database error", isSchemaDrift: false };
};

/**
 * One-line, user-facing summary — "<message> (<code>)" when a code exists,
 * with a clear hint when the failure is schema drift the user can't fix by
 * retrying.
 */
export const formatDbErrorForUser = (err: unknown): string => {
  const described = describeDbError(err);
  if (described.isSchemaDrift) {
    return `${described.message} (${described.code}) — this looks like a database migration that hasn't been applied yet, not something a retry will fix.`;
  }
  return described.code
    ? `${described.message} (${described.code})`
    : described.message;
};

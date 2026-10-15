/**
 * formatSupabaseError — surface the REAL cause of a Supabase write failure.
 *
 * Issue #45 (Sasha 2026-10-14, "The real error is masked"): every ZoG save
 * path caught failures with `err instanceof Error ? err.message : "<generic>"`.
 * But the PostgREST client resolves (and the `.update()/.insert()` helpers
 * throw, once we `throw error`) a **PostgrestError** — a PLAIN OBJECT shaped
 * `{ code, message, details, hint }`, NOT an `Error` instance. So
 * `err instanceof Error` was false for every DB failure and the actual cause
 * (RLS denial `42501`, missing column `42703`, constraint `23xxx`, …)
 * collapsed into the useless "Failed to save Appleseed" toast.
 *
 * This extracts whatever diagnostic fields are present and builds one
 * human-readable string so both the toast and the console carry the actual
 * `code` / `message` / `details` / `hint`.
 */
export const formatSupabaseError = (err: unknown, fallback: string): string => {
  if (err == null) return fallback;
  if (typeof err === "string") return err || fallback;

  const e = err as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };

  const parts: string[] = [];
  if (e.message) parts.push(e.message);
  if (e.details && e.details !== e.message) parts.push(e.details);
  if (e.hint) parts.push(`hint: ${e.hint}`);

  const body = parts.join(" — ");

  if (e.code) return body ? `[${e.code}] ${body}` : `[${e.code}] ${fallback}`;
  if (body) return body;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

/**
 * Postgres / PostgREST error codes that mean "the schema the code expects
 * isn't the schema the live DB has" — i.e. a migration exists in the repo
 * but was never applied to prod (exactly the Issue #49 root cause: prod was
 * missing `zog_snapshots.output_language` for months).
 *
 *   42703    = undefined_column
 *   42P01    = undefined_table
 *   PGRST204 = PostgREST: column not found in schema cache (write path)
 *   PGRST205 = PostgREST: table not found in schema cache
 */
const SCHEMA_DRIFT_CODES = new Set(["42703", "42P01", "PGRST204", "PGRST205"]);

/**
 * Issue #50 (Sasha 2026-10-14): the UI must NEVER show a raw PostgREST line
 * like `[PGRST204] Could not find the 'output_language' column…` to a user.
 * But the save layer still needs to KNOW whether a failure is schema drift
 * (so it can pick the right friendly line) vs a generic/transient failure.
 *
 * Accepts either a PostgrestError-shaped object OR an already-formatted
 * string (the save helpers return `error: string` from `formatSupabaseError`,
 * so the caller often only has the string by the time it toasts).
 */
export const isSchemaDriftError = (err: unknown): boolean => {
  const code = (err as { code?: string } | null | undefined)?.code;
  if (code && SCHEMA_DRIFT_CODES.has(code)) return true;
  const text = typeof err === "string" ? err : formatSupabaseError(err, "");
  return /\b(PGRST20[45]|42703|42P01)\b/.test(text);
};

/**
 * Structured console payload for a Supabase failure. Keeps `code` / `details`
 * / `hint` visible in the console (they're swallowed by a bare
 * `console.error(err.message)`), so prod debugging has the full picture.
 */
export const supabaseErrorFields = (err: unknown): Record<string, unknown> => {
  const e = (err ?? {}) as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
    status?: number;
  };
  return {
    code: e.code,
    message: e.message,
    details: e.details,
    hint: e.hint,
    status: e.status,
  };
};

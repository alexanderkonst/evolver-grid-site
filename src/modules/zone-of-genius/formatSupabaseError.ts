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

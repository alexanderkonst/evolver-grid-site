/**
 * Schema-tolerant insert for user_business_artifacts.
 *
 * Several columns on this table were added by later migrations
 * (prompt_version_at_lock, input_version_at_lock, output_language). When the
 * DB hasn't picked those up yet, PostgREST answers with
 * "Could not find the '<col>' column of 'user_business_artifacts' in the
 * schema cache" — and it reports ONE missing column per request. So a single
 * retry is not enough when two columns are missing: this helper strips each
 * unknown optional column and retries until the insert goes through.
 *
 * Unknown columns are remembered for the session (module-level) so later
 * inserts don't pay the failed round-trip again. The latch resets on reload.
 */

export const OPTIONAL_ARTIFACT_COLUMNS = [
  "prompt_version_at_lock",
  "input_version_at_lock",
  "output_language",
] as const;

const unavailableColumns = new Set<string>();

/** Test hook. */
export const __resetUnavailableArtifactColumns = () => unavailableColumns.clear();

/** Returns the optional column named in a PostgREST schema-cache miss, if any. */
export function findMissingOptionalColumn(err: unknown): string | null {
  if (!err || typeof err !== "object") return null;
  const msg = String((err as { message?: string }).message ?? "");
  if (!/schema cache/i.test(msg)) return null;
  return OPTIONAL_ARTIFACT_COLUMNS.find((col) => msg.includes(col)) ?? null;
}

function stripUnavailable<T extends Record<string, unknown>>(payload: T): Record<string, unknown> {
  const out: Record<string, unknown> = { ...payload };
  for (const col of unavailableColumns) delete out[col];
  return out;
}

type InsertResult<R> = { data: R | null; error: any };

export async function insertWithOptionalColumns<R>(
  payload: Record<string, unknown>,
  insert: (payload: Record<string, unknown>) => PromiseLike<InsertResult<R>>
): Promise<InsertResult<R>> {
  // At most one retry per optional column.
  for (let attempt = 0; attempt <= OPTIONAL_ARTIFACT_COLUMNS.length; attempt++) {
    const res = await insert(stripUnavailable(payload));
    const missing = res.error ? findMissingOptionalColumn(res.error) : null;
    if (!missing || unavailableColumns.has(missing)) return res;
    console.warn(`user_business_artifacts.${missing} not in schema cache — retrying without it.`);
    unavailableColumns.add(missing);
  }
  return insert(stripUnavailable(payload));
}

/**
 * Turns anything thrown by a save/generate flow into a message safe to show
 * a user. Raw DB / PostgREST text (schema cache, constraint names, SQL state)
 * is never surfaced — callers get the friendly fallback instead.
 */
export function friendlyArtifactError(err: unknown, fallback: string): string {
  const e = err as { message?: string; code?: string } | null;
  const msg = String(e?.message ?? "");
  if (!msg) return fallback;
  const looksLikeDbError =
    /schema cache|column|relation|violates|constraint|duplicate key|syntax error|PGRST|row-level security|permission denied|\bpg_|\bpostgres/i.test(
      msg
    ) || (typeof e?.code === "string" && /^(PGRST\d+|\d{5})$/.test(e.code));
  return looksLikeDbError ? fallback : msg;
}

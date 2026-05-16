/**
 * withRetry — retry a Supabase write up to N times with exponential
 * backoff, but ONLY for transient failures (network, timeout, 5xx).
 *
 * Day 66 wave C2 (Sasha 2026-05-16): the audit found multiple save
 * paths where transient network blips caused user-visible failures
 * even though the same call would have succeeded on the next try.
 * A small retry layer catches these without the user knowing.
 *
 * Design choices:
 *
 *   1. Wraps the resolved `{ data, error }` style Supabase responses,
 *      not throws. Many of the bugs we fixed in wave A were because
 *      `supabase.update().eq()` resolves with an error field — never
 *      throws — and callers didn't check. withRetry expects the same
 *      contract: pass a function that returns `{ data, error }`, and
 *      it retries when `error` is present AND retryable.
 *
 *   2. Retryable = network/timeout/5xx. NOT retryable: 4xx errors
 *      (RLS denial, validation, schema mismatch). Retrying those
 *      just wastes time and surfaces the same error later. Detected
 *      by inspecting the error.code / error.status / error.message
 *      pattern. When ambiguous, default to retryable (errs on the
 *      side of more retries — worst case is a slightly delayed
 *      failure).
 *
 *   3. Backoff: 200ms, 600ms, 1500ms. Three attempts total (so
 *      max 2.3s wall time before final failure). Tuned for human-
 *      perceptible latency — under 1s usually feels instant, 2–3s
 *      is the "is this stuck?" threshold; we give up before then.
 *
 *   4. No side effects between retries. The wrapped fn must be
 *      pure-write or idempotent. If the call has DB side effects
 *      (insert + pointer write across two calls), wrap each in
 *      its own retry, not the whole compound. Save flows already
 *      use this shape post-wave A.
 *
 *   5. Doesn't catch thrown errors by default — those propagate
 *      to the caller's try/catch. Pass `retryOnThrow: true` to
 *      also retry on thrown exceptions (useful when calling
 *      `await supabase.functions.invoke()` which CAN throw on
 *      network failure).
 *
 * Usage:
 *
 *   const result = await withRetry(() =>
 *     supabase.from("game_profiles").update({...}).eq("id", id)
 *   );
 *   if (result.error) throw result.error;
 *
 *   // Or for edge functions:
 *   const result = await withRetry(
 *     () => supabase.functions.invoke("save-zog-result", { body }),
 *     { retryOnThrow: true },
 *   );
 */

type SupabaseResult<T> = { data: T | null; error: unknown };

type RetryOptions = {
  /** Max attempts including the first call. Default 3. */
  attempts?: number;
  /** Whether to retry when the function throws (vs. resolves with error). Default false. */
  retryOnThrow?: boolean;
  /** Optional callback fired before each retry (for logging/telemetry). */
  onRetry?: (attempt: number, error: unknown) => void;
};

const DEFAULT_BACKOFF_MS = [200, 600, 1500];

/**
 * Decide whether an error from Supabase is worth retrying.
 *
 * Retryable:
 *   - network failures (`fetch failed`, `network`, `connection`)
 *   - timeouts (`timeout`, `aborted`)
 *   - 5xx HTTP status codes
 *   - missing code/status (ambiguous → default to retry)
 *
 * NOT retryable:
 *   - 4xx HTTP status codes (RLS, validation, not found, conflict)
 *   - Postgres error codes starting with "23" (integrity violations)
 *   - Postgres error codes "42" (syntax/schema)
 */
function isRetryable(err: unknown): boolean {
  if (!err) return false;
  const e = err as {
    code?: string;
    status?: number;
    statusCode?: number;
    message?: string;
    name?: string;
  };

  // Postgres SQLSTATE codes: 23xxx (integrity), 42xxx (syntax/schema)
  // are user/programmer errors, not transient — don't retry.
  if (e.code && /^(23|42)/.test(e.code)) return false;

  // HTTP status: 4xx not retryable, 5xx retryable.
  const status = e.status ?? e.statusCode;
  if (typeof status === "number") {
    if (status >= 400 && status < 500) return false;
    if (status >= 500) return true;
  }

  // Message-based heuristics for fetch / abort failures.
  const msg = (e.message || "").toLowerCase();
  if (/(network|fetch|timeout|abort|connection|disconnect|econnreset)/.test(msg)) {
    return true;
  }

  // Default: retry. Worst case is a small delay; safer than giving
  // up on a transient blip and surfacing failure to the user.
  return true;
}

export async function withRetry<T>(
  fn: () => Promise<SupabaseResult<T>>,
  options: RetryOptions = {},
): Promise<SupabaseResult<T>> {
  const attempts = Math.max(1, options.attempts ?? 3);
  const backoff = DEFAULT_BACKOFF_MS;

  let lastError: unknown = null;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const result = await fn();
      if (!result.error) return result;
      lastError = result.error;
      if (!isRetryable(result.error) || attempt === attempts - 1) {
        return result;
      }
      options.onRetry?.(attempt + 1, result.error);
    } catch (err) {
      lastError = err;
      if (!options.retryOnThrow || attempt === attempts - 1) {
        throw err;
      }
      if (!isRetryable(err)) throw err;
      options.onRetry?.(attempt + 1, err);
    }

    const waitMs = backoff[Math.min(attempt, backoff.length - 1)];
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  // Should be unreachable given the loop's early returns, but keeps
  // the type checker honest.
  return { data: null, error: lastError };
}

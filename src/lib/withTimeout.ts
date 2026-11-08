/**
 * withTimeout — bound a request that may never settle.
 *
 * A supabase call can hang for good (a token refresh holding the auth lock, a stalled
 * socket). A loading flag that waits on such a call keeps the page on a loading line
 * forever (issue #263). Wrap the call and the wait ends with a TimeoutError instead.
 *
 * The underlying promise is not cancelled (fetch has no handle here); its late result
 * is simply ignored, which is why callers must also guard with their `cancelled` flag.
 */

/**
 * One request that takes longer than this is treated as hung. A normal Home load is slow
 * today (10–15 s seen live, 2026-11-03), so this stays above that: a slow but working
 * request must not end as «failed» (#263).
 */
export const REQUEST_TIMEOUT_MS = 12000;

/** A whole load that takes longer than this is shown as failed, with «Try again» (#263). */
export const LOAD_TIMEOUT_MS = 20000;

export class TimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label} timed out after ${ms} ms`);
    this.name = "TimeoutError";
  }
}

export function withTimeout<T>(
  work: PromiseLike<T>,
  ms: number = REQUEST_TIMEOUT_MS,
  label = "request",
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(label, ms)), ms);
    Promise.resolve(work).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

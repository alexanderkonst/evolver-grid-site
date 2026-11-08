/**
 * deferAuthCallback — make an `onAuthStateChange` handler safe to await Supabase in.
 *
 * supabase-js runs auth callbacks while it holds its auth lock and awaits what they
 * return. A callback that awaits a Supabase call (a query needs the session, the session
 * needs the lock) deadlocks: every later `getSession()` and query waits for good. That
 * is the endless «Loading profile...» of issue #263.
 *
 * Wrap the handler: the callback returns at once, the real work runs on the next tick,
 * after the lock is released.
 */
export function deferAuthCallback<A extends unknown[]>(
  handler: (...args: A) => void | Promise<void>,
): (...args: A) => void {
  return (...args: A) => {
    setTimeout(() => {
      Promise.resolve()
        .then(() => handler(...args))
        .catch((error) => console.warn("auth callback failed", error));
    }, 0);
  };
}

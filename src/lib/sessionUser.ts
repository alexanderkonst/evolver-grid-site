import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * The signed-in user, read from the stored session (local), never from the network.
 *
 * Issue #438: `supabase.auth.getUser()` makes a network call to /auth/v1/user and, in the
 * pinned supabase-js (auth-js 2.81.1), holds the one auth lock for the whole request. Every
 * `getSession()` and every PostgREST call (it fetches its token through `getSession()`) queues
 * behind it. Home mounted about eight of these at once (rail, clock, entitlement, metric
 * history), so each read of the save waited for all of them in turn.
 *
 * Use this wherever the id or email is only needed to key an own-row read. RLS still checks
 * the token on every request, so a stale local session cannot read anyone else's rows.
 * Use `getUser()` only when the server must confirm the account (a write that changes it).
 */
export async function getSessionUser(): Promise<User | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}

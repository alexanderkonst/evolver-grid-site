import { supabase } from "@/integrations/supabase/client";
import type { FounderState } from "@/pages/admin/useFounderStates";

/**
 * Admin-side writes for Collective membership (WP1). Membership is two facts that move
 * together: the `collective_member` role in `user_roles` and a row in `collective_members`.
 * RLS decides who may do this (admin only); these helpers throw the first error they meet.
 *
 * Both steps are idempotent, so a half-finished grant or revoke is fixed by running it again.
 * Order matters for that: grant writes the role first, revoke removes the role first, so a
 * failure in between never leaves a row without its role.
 */

export async function grantCollectiveMembership(userId: string): Promise<void> {
  const role = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role: "collective_member" }, { onConflict: "user_id,role", ignoreDuplicates: true });
  if (role.error) throw role.error;

  // ignoreDuplicates: an existing row (and the profile its owner wrote) is never overwritten.
  const row = await supabase
    .from("collective_members")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
  if (row.error) throw row.error;
}

export async function revokeCollectiveMembership(userId: string): Promise<void> {
  const role = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", "collective_member");
  if (role.error) throw role.error;

  const row = await supabase.from("collective_members").delete().eq("user_id", userId);
  if (row.error) throw row.error;
}

/** user_ids of everyone currently in `collective_members` (admin or member read). */
export async function listCollectiveMemberIds(): Promise<string[]> {
  const { data, error } = await supabase.from("collective_members").select("user_id");
  if (error) throw error;
  return (data ?? []).map((r) => r.user_id);
}

export const COLLECTIVE_SEARCH_MIN_QUERY = 2;
const MAX_RESULTS = 8;

/** Case-insensitive match on name or email; short queries match nothing. Pure, for tests. */
export function searchPlayers(players: FounderState[], query: string): FounderState[] {
  const q = query.trim().toLowerCase();
  if (q.length < COLLECTIVE_SEARCH_MIN_QUERY) return [];
  return players
    .filter((p) => `${p.display_name ?? ""} ${p.email ?? ""}`.toLowerCase().includes(q))
    .slice(0, MAX_RESULTS);
}

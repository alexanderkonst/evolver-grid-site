import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionUserId } from "@/hooks/useSessionUserId";

export interface CollectiveMembership {
  isMember: boolean;
  loading: boolean;
}

/** The query itself, apart from React so it can be tested: does this user hold the role? */
export async function fetchIsCollectiveMember(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "collective_member")
    .maybeSingle();
  if (error) return false;
  return data !== null;
}

/**
 * Is the signed-in player a Collective member? Reads the player's own `collective_member`
 * row in `user_roles` (RLS lets a user read their own roles). A guest, or any read error,
 * is «not a member»: the closed sign is the safe default. For WP3 (the members-only space).
 */
export function useCollectiveMembership(): CollectiveMembership {
  const userId = useSessionUserId();
  const [state, setState] = useState<CollectiveMembership>({ isMember: false, loading: true });

  useEffect(() => {
    if (userId === undefined) {
      setState({ isMember: false, loading: true });
      return;
    }
    if (userId === null) {
      setState({ isMember: false, loading: false });
      return;
    }
    let live = true;
    setState((prev) => ({ ...prev, loading: true }));
    fetchIsCollectiveMember(userId)
      .then((isMember) => {
        if (live) setState({ isMember, loading: false });
      })
      .catch(() => {
        if (live) setState({ isMember: false, loading: false });
      });
    return () => {
      live = false;
    };
  }, [userId]);

  return state;
}

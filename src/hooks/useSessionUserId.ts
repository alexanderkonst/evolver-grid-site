import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Who is playing, without ever sending a guest anywhere. `undefined` until the session has
 * been read, then the user id, or `null` for a guest. (RequireAuth redirects; this only looks.)
 */
export function useSessionUserId(): string | null | undefined {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let live = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (live) setUserId(data.session?.user.id ?? null);
      })
      .catch(() => {
        if (live) setUserId(null);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (live) setUserId(session?.user.id ?? null);
    });
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return userId;
}

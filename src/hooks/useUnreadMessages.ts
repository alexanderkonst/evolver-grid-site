import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchUnreadCount, MESSAGES_CHANGED_EVENT } from "@/lib/playerMessages";

const POLL_MS = 60_000;

/**
 * Unread player-message count for the signed-in player; 0 for guests or while the
 * `player_messages` table is not deployed. Refreshes when a message is sent/read in this
 * tab and once a minute (no realtime channel: email/push are out of scope for A6).
 */
export function useUnreadMessages(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let live = true;
    let userId: string | null = null;

    const refresh = async () => {
      if (!userId) {
        if (live) setCount(0);
        return;
      }
      const next = await fetchUnreadCount(userId);
      if (live) setCount(next);
    };

    supabase.auth
      .getSession()
      .then(({ data }) => {
        userId = data.session?.user.id ?? null;
        void refresh();
      })
      .catch(() => undefined);
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      userId = session?.user.id ?? null;
      void refresh();
    });
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    window.addEventListener(MESSAGES_CHANGED_EVENT, refresh);

    return () => {
      live = false;
      sub.subscription.unsubscribe();
      window.clearInterval(timer);
      window.removeEventListener(MESSAGES_CHANGED_EVENT, refresh);
    };
  }, []);

  return count;
}

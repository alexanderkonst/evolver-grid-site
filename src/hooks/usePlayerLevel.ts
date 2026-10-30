import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { computeQolLevel, type QolLevel } from "@/lib/qolLevel";

/**
 * The signed-in player's one level: the mean of the 8 QoL domains from the newest snapshot,
 * the same read the Character Sheet makes (loadSheet), so every screen agrees with Home.
 * `qol` is null until measured, for a guest, or when the read fails; `isLoading` is true
 * until the first read ends. Owner-only: never call this for another player.
 */
export function usePlayerLevel(): { qol: QolLevel | null; level: number | null; isLoading: boolean } {
  const [qol, setQol] = useState<QolLevel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from("game_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!profile) return;
        const { data: snapshot } = await supabase
          .from("qol_snapshots")
          .select("*")
          .eq("profile_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (live) setQol(computeQolLevel(snapshot));
      } catch {
        // An unreadable level shows as «not measured», never as a made-up number.
      } finally {
        if (live) setIsLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  return { qol, level: qol?.level ?? null, isLoading };
}

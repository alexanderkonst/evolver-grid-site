import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LIBRARY_ITEMS, type LibraryItem, type QolDomain } from "@/modules/library/libraryContent";
import { getSuggestedPractices, getLowestQolDomain } from "@/lib/practiceSystem";

export type SuggestedPracticesStatus = "loading" | "signed-out" | "no-snapshot" | "ready";

export interface SuggestedPracticesState {
  status: SuggestedPracticesStatus;
  practices: LibraryItem[];
  lowestDomain: QolDomain | null;
}

/**
 * Reads the signed-in user's latest QoL snapshot (via game_profiles →
 * qol_snapshots, the same pattern used in GameHome/CharacterHub) and
 * surfaces the practice-picker recommendation engine
 * (getSuggestedPractices in src/lib/practiceSystem.ts).
 *
 * Graceful states, by design (Sasha's spec, Day 128):
 * - no session → "signed-out" (caller hides the recommendation block entirely)
 * - session but no QoL snapshot yet → "no-snapshot" (caller shows a quiet invite)
 * - snapshot present → "ready" with up to 3 suggested practices
 */
export function useSuggestedPractices(): SuggestedPracticesState {
  const [state, setState] = useState<SuggestedPracticesState>({
    status: "loading",
    practices: [],
    lowestDomain: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setState({ status: "signed-out", practices: [], lowestDomain: null });
        return;
      }

      const { data: profile } = await supabase
        .from("game_profiles")
        .select("last_qol_snapshot_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.last_qol_snapshot_id) {
        if (!cancelled) setState({ status: "no-snapshot", practices: [], lowestDomain: null });
        return;
      }

      const { data: qolSnapshot } = await supabase
        .from("qol_snapshots")
        .select("*")
        .eq("id", profile.last_qol_snapshot_id)
        .maybeSingle();

      if (!qolSnapshot) {
        if (!cancelled) setState({ status: "no-snapshot", practices: [], lowestDomain: null });
        return;
      }

      const practices = getSuggestedPractices(LIBRARY_ITEMS, qolSnapshot);
      const lowestDomain = getLowestQolDomain(qolSnapshot);

      if (!cancelled) setState({ status: "ready", practices, lowestDomain });
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

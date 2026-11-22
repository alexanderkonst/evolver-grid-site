import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import { fetchTopTalentSnapshot } from "@/lib/topTalentSnapshot";
import { displayName } from "@/lib/displayName";
import {
  cleanValue,
  priorityAreaOf,
  talentNames,
  weakestAreaOf,
  type MirrorProfile,
} from "@/lib/miniTraining/mirrorPrompts";

/**
 * The signed-in player's profile for the mini-training prompts (issue #392). READ-ONLY:
 * game_profiles, zog_snapshots (the current Top Talent, via the one read path) and
 * qol_snapshots. It never creates a profile, so a visitor who only opens the page leaves no row.
 *
 *  - `guest`      not signed in: no profile to read
 *  - `no-talent`  signed in, but no Top Talent reveal yet: the page invites them to do it first
 *  - `ready`      the profile, plus the user id the local progress is kept under
 */
export type MirrorProfileState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "no-talent" }
  | { status: "error" }
  | { status: "ready"; userId: string; profile: MirrorProfile };

type ZogRow = { id: string; top_three_talents: unknown; archetype_title: string | null; mastery_action: string | null };

export function useMirrorProfile(): MirrorProfileState {
  const userId = useSessionUserId();
  const [state, setState] = useState<MirrorProfileState>({ status: "loading" });

  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null) {
      setState({ status: "guest" });
      return;
    }
    let live = true;
    (async () => {
      try {
        const { data: game, error } = await supabase
          .from("game_profiles")
          .select("id, first_name, mission_statement, qol_priorities, last_zog_snapshot_id, last_qol_snapshot_id")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) throw error;
        if (!game) {
          if (live) setState({ status: "no-talent" });
          return;
        }

        const [zog, qol] = await Promise.all([
          fetchTopTalentSnapshot<ZogRow>(
            game.id,
            "id, top_three_talents, archetype_title, mastery_action",
            game.last_zog_snapshot_id ?? null,
          ),
          (async () => {
            const query = supabase.from("qol_snapshots").select("*");
            const { data } = game.last_qol_snapshot_id
              ? await query.eq("id", game.last_qol_snapshot_id).eq("profile_id", game.id).maybeSingle()
              : await query.eq("profile_id", game.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
            return data ?? null;
          })(),
        ]);

        const topTalents = talentNames(zog?.top_three_talents);
        if (topTalents.length === 0) {
          if (live) setState({ status: "no-talent" });
          return;
        }

        const profile: MirrorProfile = {
          firstName: displayName({ signedIn: true, firstName: game.first_name }),
          topTalents,
          archetype: cleanValue(zog?.archetype_title),
          masteryAction: cleanValue(zog?.mastery_action),
          mission: cleanValue(game.mission_statement),
          priorityArea: priorityAreaOf(game.qol_priorities),
          weakestArea: weakestAreaOf(qol),
        };
        if (live) setState({ status: "ready", userId, profile });
      } catch {
        if (live) setState({ status: "error" });
      }
    })();
    return () => {
      live = false;
    };
  }, [userId]);

  return state;
}

/**
 * useMirrorProfile: the signed-in player's profile fields for the Mirror prompts.
 * READ-ONLY, through the player's own session (RLS-scoped); no schema changes.
 *
 *   game_profiles   → first_name, mission_statement, qol_priorities (+ the two snapshot pointers)
 *   zog_snapshots   → top_three_talents, archetype_title, mastery_action (current Top Talent)
 *   qol_snapshots   → the 8 stages (current snapshot; weakest area)
 *
 * A failed read leaves that part out (its label drops) rather than blocking the page.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchTopTalentSnapshot } from "@/lib/topTalentSnapshot";
import { QOL_DOMAIN_COLUMNS, type QolStageColumns } from "@/lib/qolLevel";
import { buildMirrorProfile, type MirrorProfile, type MirrorSources } from "./mirrorProfile";

const QOL_COLUMNS = Object.values(QOL_DOMAIN_COLUMNS).join(", ");

type GameProfileRow = {
  id: string;
  first_name: string | null;
  mission_statement: string | null;
  qol_priorities: unknown;
  last_zog_snapshot_id: string | null;
  last_qol_snapshot_id: string | null;
};

async function loadQolSnapshot(profile: GameProfileRow): Promise<Partial<QolStageColumns> | null> {
  if (profile.last_qol_snapshot_id) {
    const { data } = await supabase
      .from("qol_snapshots")
      .select(QOL_COLUMNS)
      .eq("id", profile.last_qol_snapshot_id)
      .maybeSingle();
    if (data) return data as unknown as Partial<QolStageColumns>;
  }
  const { data } = await supabase
    .from("qol_snapshots")
    .select(QOL_COLUMNS)
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as unknown as Partial<QolStageColumns> | null) ?? null;
}

export async function loadMirrorSources(userId: string): Promise<MirrorSources> {
  const { data: profile } = await supabase
    .from("game_profiles")
    .select("id, first_name, mission_statement, qol_priorities, last_zog_snapshot_id, last_qol_snapshot_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!profile) return {};
  const row = profile as unknown as GameProfileRow;

  const [zog, qol] = await Promise.all([
    fetchTopTalentSnapshot<{ id: string; top_three_talents: unknown; archetype_title: string | null; mastery_action: string | null }>(
      row.id,
      "id, top_three_talents, archetype_title, mastery_action",
      row.last_zog_snapshot_id,
    ).catch(() => null),
    loadQolSnapshot(row).catch(() => null),
  ]);

  return { game_profile: row, zog_snapshot: zog, qol_snapshot: qol };
}

export type MirrorProfileState = { loading: boolean; profile: MirrorProfile };

/** `userId`: undefined while the session is read, null for a guest (no profile, no read). */
export function useMirrorProfile(userId: string | null | undefined): MirrorProfileState {
  const [state, setState] = useState<MirrorProfileState>({ loading: true, profile: {} });

  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null) {
      setState({ loading: false, profile: {} });
      return;
    }
    let live = true;
    setState({ loading: true, profile: {} });
    loadMirrorSources(userId)
      .catch(() => ({}) as MirrorSources)
      .then((sources) => {
        if (live) setState({ loading: false, profile: buildMirrorProfile(sources) });
      });
    return () => {
      live = false;
    };
  }, [userId]);

  return state;
}

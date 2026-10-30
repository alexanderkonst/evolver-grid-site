/**
 * useFamiliar — the player's AI as state: three gifts, the personal prompt, its version.
 * Reads existing tables through the player's own session (RLS-scoped); writes nothing.
 *
 *   zog_snapshots (via game_profiles pointer) → top talent
 *   mission_participants                      → mission
 *   user_business_artifacts (locked)          → Workshop pieces
 *
 * A guest has none of these: gift 2 is lit, the prompt is AI OS alone, and the state is ready
 * at once. A failed read leaves that part out rather than blocking the screen.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchTopTalentSnapshot } from "@/lib/topTalentSnapshot";
import { ALL_ARTIFACT_KEYS } from "@/modules/unique-business-builder/types";
import { ARTIFACT_LABELS } from "@/modules/unique-business-builder/constants";
import { AI_OS_PROMPT, AI_OS_VERSION } from "./aiOsSource";
import { artifactText, type FamiliarArtifactInput, type FamiliarTalentInput } from "./buildFamiliarPrompt";
import { buildFamiliarState, type FamiliarSources } from "./familiarState";
import type { FamiliarState } from "./types";

type SnapshotRow = {
  id: string;
  archetype_title: string | null;
  core_pattern: string | null;
  top_three_talents: unknown;
};

type ArtifactRow = {
  artifact_key: string;
  content: string | null;
  content_json: unknown;
  created_at: string;
};

const guestSources = (): FamiliarSources => ({ aiOs: AI_OS_PROMPT, aiOsVersion: AI_OS_VERSION });

const toTalent = (row: SnapshotRow | null): FamiliarTalentInput | null =>
  row
    ? {
        archetypeTitle: row.archetype_title,
        corePattern: row.core_pattern,
        topThreeTalents: Array.isArray(row.top_three_talents)
          ? row.top_three_talents.filter((t): t is string => typeof t === "string")
          : null,
      }
    : null;

/** Newest locked version of each piece, in Workshop order. */
const toArtifacts = (rows: ArtifactRow[]): FamiliarArtifactInput[] => {
  const newest = new Map<string, ArtifactRow>();
  for (const row of rows) {
    const seen = newest.get(row.artifact_key);
    if (!seen || row.created_at > seen.created_at) newest.set(row.artifact_key, row);
  }
  return ALL_ARTIFACT_KEYS.flatMap((key) => {
    const row = newest.get(key);
    const text = row ? artifactText(row) : "";
    return text ? [{ key, label: ARTIFACT_LABELS[key] ?? key, text }] : [];
  });
};

async function loadSources(): Promise<FamiliarSources> {
  const base = guestSources();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return base;

  const { data: profile } = await supabase.from("game_profiles").select("id").eq("user_id", userId).maybeSingle();
  const profileId = profile?.id ?? null;

  const [snapshot, mission, artifacts] = await Promise.all([
    profileId
      ? fetchTopTalentSnapshot<SnapshotRow>(profileId, "id, archetype_title, core_pattern, top_three_talents").catch(
          () => null,
        )
      : null,
    supabase
      .from("mission_participants")
      .select("mission_title")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("user_business_artifacts")
      .select("artifact_key, content, content_json, created_at")
      .eq("user_id", userId)
      .eq("is_locked", true)
      .order("created_at", { ascending: false }),
  ]);

  return {
    ...base,
    talent: toTalent(snapshot),
    mission: mission.error ? null : (mission.data?.mission_title ?? null),
    artifacts: artifacts.error ? [] : toArtifacts((artifacts.data ?? []) as ArtifactRow[]),
  };
}

const GUEST_STATE: FamiliarState = { ...buildFamiliarState(guestSources()), loading: true };

export function useFamiliar(): FamiliarState {
  const [state, setState] = useState<FamiliarState>(GUEST_STATE);

  useEffect(() => {
    let live = true;
    loadSources()
      .catch(() => guestSources())
      .then((sources) => {
        if (live) setState({ ...buildFamiliarState(sources), loading: false });
      });
    return () => {
      live = false;
    };
  }, []);

  return state;
}

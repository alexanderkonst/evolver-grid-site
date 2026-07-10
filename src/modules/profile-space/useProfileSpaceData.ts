/**
 * Profile Space — data layer hook (Day 119 spec: docs/specs/profile-space/sow_and_dods.md).
 *
 * Loads everything ProfileSpaceHome needs in one pass: identity,
 * ZoG history, mission, assets, QoL history, and sent collaboration
 * requests. Follows the fetch pattern established by
 * generateProfilePdf.ts's loadProfileBundle — every section is fetched
 * defensively (try/catch + console.warn), so one table having an issue
 * (RLS, missing row, transient network blip) degrades that section to
 * empty instead of failing the whole page. `error` is reserved for
 * total auth failure only.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import type {
  AssetLite,
  CollabRequestLite,
  MissionInfo,
  ProfileIdentity,
  ProfileSpaceData,
  QolSnapshotLite,
  ZogSnapshotLite,
} from "./types";

// ─────────────────────────────────────────────────────────────────────
// Defensive JSON talent mapping — top_three_talents / top_ten_talents
// are stored as Json on zog_snapshots. In practice this platform has
// stored them as string[] (talent phrases, current writer in
// saveToDatabase.ts) — but older/legacy rows and other write paths in
// the codebase have used number[] (talent ids into TALENTS) or arrays
// of objects. Map every shape down to a display string, never throw.
// ─────────────────────────────────────────────────────────────────────

function talentEntryToString(entry: unknown): string | null {
  if (typeof entry === "string") {
    const trimmed = entry.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof entry === "number") {
    return String(entry);
  }
  if (entry && typeof entry === "object") {
    const obj = entry as Record<string, unknown>;
    const candidate = obj.name ?? obj.title ?? obj.label;
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return null;
}

/**
 * Exported so other data consumers (e.g. generateProfilePdf.ts's
 * loadProfileBundle) can map the same Json talent columns the same
 * defensive way instead of re-implementing the shape-guessing logic.
 */
export function mapTalentsJson(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(talentEntryToString)
    .filter((v): v is string => v != null);
}

function mapZogRow(row: {
  id: string;
  archetype_title: string | null;
  core_pattern: string | null;
  top_three_talents: unknown;
  top_ten_talents: unknown;
  created_at: string;
}): ZogSnapshotLite {
  return {
    id: row.id,
    archetypeTitle: row.archetype_title ?? null,
    corePattern: row.core_pattern ?? null,
    topThreeTalents: mapTalentsJson(row.top_three_talents),
    topTenTalents: mapTalentsJson(row.top_ten_talents),
    createdAt: row.created_at,
  };
}

function mapQolRow(row: {
  id: string;
  created_at: string;
  wealth_stage: number;
  health_stage: number;
  happiness_stage: number;
  love_relationships_stage: number;
  impact_stage: number;
  growth_stage: number;
  social_ties_stage: number;
  home_stage: number;
}): QolSnapshotLite {
  return {
    id: row.id,
    createdAt: row.created_at,
    stages: {
      wealth: row.wealth_stage,
      health: row.health_stage,
      happiness: row.happiness_stage,
      loveRelationships: row.love_relationships_stage,
      impact: row.impact_stage,
      growth: row.growth_stage,
      socialTies: row.social_ties_stage,
      home: row.home_stage,
    },
  };
}

function mapAssetRow(row: {
  id: string;
  title: string;
  type_id: string | null;
  description: string | null;
  created_at: string | null;
}): AssetLite {
  return {
    id: row.id,
    title: row.title,
    typeId: row.type_id ?? null,
    description: row.description ?? null,
    createdAt: row.created_at ?? new Date(0).toISOString(),
  };
}

/** Map match_interests.consent_response to the CollabRequestLite status.
 *  Real values in use (see supabase/functions/match-consent/index.ts +
 *  migration 20260520051310): null → treated as pending (row seeded
 *  before the column existed), "pending", "consented", "declined",
 *  "expired". "expired" reads as declined to the sender — the window
 *  closed without a yes. */
function mapConsentStatus(consentResponse: string | null): CollabRequestLite["status"] {
  if (!consentResponse || consentResponse === "pending") return "pending";
  if (consentResponse === "consented") return "accepted";
  return "declined";
}

const emptyMission: MissionInfo = {
  statement: null,
  categories: [],
  discoveredAt: null,
};

interface LoadedState {
  identity: ProfileIdentity | null;
  zogLatest: ZogSnapshotLite | null;
  zogHistory: ZogSnapshotLite[];
  mission: MissionInfo;
  assets: AssetLite[];
  qolLatest: QolSnapshotLite | null;
  qolHistory: QolSnapshotLite[];
  requests: CollabRequestLite[];
}

const emptyState: LoadedState = {
  identity: null,
  zogLatest: null,
  zogHistory: [],
  mission: emptyMission,
  assets: [],
  qolLatest: null,
  qolHistory: [],
  requests: [],
};

async function loadAll(): Promise<{ state: LoadedState; error: string | null }> {
  const state: LoadedState = {
    identity: null,
    zogLatest: null,
    zogHistory: [],
    mission: { ...emptyMission },
    assets: [],
    qolLatest: null,
    qolHistory: [],
    requests: [],
  };

  // Auth — total failure here is the only thing that surfaces `error`.
  let authUserId: string | null = null;
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) {
      return { state, error: "Not signed in." };
    }
    authUserId = user.id;
  } catch (err) {
    console.warn("[useProfileSpaceData] auth failed:", err);
    return { state, error: err instanceof Error ? err.message : "Auth failed" };
  }

  // Profile id — required for every section below. If this fails we
  // still return the (empty) state rather than erroring the page; the
  // identity card will just show an empty state.
  let profileId: string | null = null;
  try {
    profileId = await getOrCreateGameProfileId();
  } catch (err) {
    console.warn("[useProfileSpaceData] getOrCreateGameProfileId failed:", err);
  }

  if (!profileId) {
    return { state, error: null };
  }

  // Identity — game_profiles row
  let lastZogSnapshotId: string | null = null;
  try {
    const { data: profile, error } = await supabase
      .from("game_profiles")
      .select(
        "id, user_id, first_name, last_name, avatar_url, created_at, linkedin_pdf_url, mission_statement, mission_discovered_at, last_zog_snapshot_id"
      )
      .eq("id", profileId)
      .maybeSingle();
    if (error) throw error;
    if (profile) {
      state.identity = {
        userId: authUserId,
        profileId: profile.id,
        firstName: profile.first_name ?? null,
        lastName: profile.last_name ?? null,
        avatarUrl: profile.avatar_url ?? null,
        memberSince: profile.created_at ?? null,
        linkedinPdfUrl: profile.linkedin_pdf_url ?? null,
      };
      state.mission.statement = profile.mission_statement ?? null;
      state.mission.discoveredAt = profile.mission_discovered_at ?? null;
      lastZogSnapshotId = profile.last_zog_snapshot_id ?? null;
    }
  } catch (err) {
    console.warn("[useProfileSpaceData] identity/mission fetch failed:", err);
  }

  // ZoG history — all snapshots for this profile, newest first
  try {
    const { data: rows, error } = await supabase
      .from("zog_snapshots")
      .select("id, archetype_title, core_pattern, top_three_talents, top_ten_talents, created_at")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const history = (rows ?? []).map(mapZogRow);
    state.zogHistory = history;
    state.zogLatest =
      (lastZogSnapshotId && history.find((s) => s.id === lastZogSnapshotId)) ||
      history[0] ||
      null;
  } catch (err) {
    console.warn("[useProfileSpaceData] zog_snapshots fetch failed:", err);
  }

  // Mission categories — newest `missions` row, if present
  try {
    const { data: missionRow, error } = await supabase
      .from("missions")
      .select("categories")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (missionRow?.categories) {
      state.mission.categories = missionRow.categories;
    }
  } catch (err) {
    console.warn("[useProfileSpaceData] missions fetch failed:", err);
  }

  // Assets — all user_assets for this user, newest first
  try {
    const { data: rows, error } = await supabase
      .from("user_assets")
      .select("id, title, type_id, description, created_at")
      .eq("user_id", authUserId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    state.assets = (rows ?? []).map(mapAssetRow);
  } catch (err) {
    console.warn("[useProfileSpaceData] user_assets fetch failed:", err);
  }

  // QoL history — all qol_snapshots for this profile, newest first
  try {
    const { data: rows, error } = await supabase
      .from("qol_snapshots")
      .select(
        "id, created_at, wealth_stage, health_stage, happiness_stage, love_relationships_stage, impact_stage, growth_stage, social_ties_stage, home_stage"
      )
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const history = (rows ?? []).map(mapQolRow);
    state.qolHistory = history;
    state.qolLatest = history[0] ?? null;
  } catch (err) {
    console.warn("[useProfileSpaceData] qol_snapshots fetch failed:", err);
  }

  // Requests — match_interests sent by this user, newest first
  try {
    const { data: rows, error } = await (supabase as any)
      .from("match_interests")
      .select("id, to_user_id, consent_response, created_at")
      .eq("from_user_id", authUserId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const requestRows = (rows ?? []) as Array<{
      id: string;
      to_user_id: string;
      consent_response: string | null;
      created_at: string;
    }>;

    // Batched name resolution — one game_profiles select for every
    // to_user_id. RLS may block reading other users' profiles from
    // this surface; if it does, toName stays null (never throw).
    let namesByUserId: Record<string, string | null> = {};
    const toUserIds = Array.from(new Set(requestRows.map((r) => r.to_user_id)));
    if (toUserIds.length > 0) {
      try {
        const { data: nameRows, error: nameError } = await supabase
          .from("game_profiles")
          .select("user_id, first_name")
          .in("user_id", toUserIds);
        if (nameError) throw nameError;
        namesByUserId = Object.fromEntries(
          (nameRows ?? [])
            .filter((r) => r.user_id)
            .map((r) => [r.user_id as string, r.first_name ?? null])
        );
      } catch (nameErr) {
        console.warn("[useProfileSpaceData] request name resolution failed:", nameErr);
      }
    }

    state.requests = requestRows.map((r) => ({
      id: r.id,
      toUserId: r.to_user_id,
      toName: namesByUserId[r.to_user_id] ?? null,
      status: mapConsentStatus(r.consent_response),
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.warn("[useProfileSpaceData] match_interests fetch failed:", err);
  }

  return { state, error: null };
}

export function useProfileSpaceData(): ProfileSpaceData {
  const [state, setState] = useState<LoadedState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { state: nextState, error: nextError } = await loadAll();
    setState(nextState);
    setError(nextError);
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { state: nextState, error: nextError } = await loadAll();
      if (!isMounted) return;
      setState(nextState);
      setError(nextError);
      setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    identity: state.identity,
    zogLatest: state.zogLatest,
    zogHistory: state.zogHistory,
    mission: state.mission,
    assets: state.assets,
    qolLatest: state.qolLatest,
    qolHistory: state.qolHistory,
    requests: state.requests,
    loading,
    error,
    reload,
  };
}

export default useProfileSpaceData;

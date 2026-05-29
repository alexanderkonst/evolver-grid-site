/**
 * UniqueBusinessContext — v2.0 module state.
 *
 * Supabase-driven. Every accepted Improve creates a NEW row in user_business_artifacts.
 * Never updates content in place. The version chain is the founder's memory of the work.
 *
 * Error handling strategy: show toast, keep local state consistent. Let user retry.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import type {
  ArtifactKey,
  ArtifactState,
  BulkImproveProgress,
  BulkImproveSkipReason,
  DossierSnapshot,
  GenerateResult,
  ImproveResult,
  LandingPagePublication,
  UniqueBusinessActions,
  UniqueBusinessState,
  VersionRow,
} from "./types";
import { ALL_ARTIFACT_KEYS } from "./types";
import { ARTIFACT_LABELS, ERROR_MESSAGES, nextVersionString } from "./constants";
import { PARENTS, getDownstream } from "./dependencyTree";
import { PROMPT_VERSION } from "./promptVersions";
import { inputVersionHash, type RootContextShape } from "./inputHash";

// ============================================================================
// Helpers
// ============================================================================

type DbRow = {
  id: string;
  user_id: string;
  artifact_key: string;
  version: string;
  content: string | null;
  content_json: unknown;
  specificity_score: number | null;
  parent_version_id: string | null;
  roast_findings: unknown;
  what_changed: string | null;
  is_locked: boolean;
  step_number: number | null;
  created_at: string;
  updated_at: string;
  /**
   * Day 74 Phase 2 (Sasha 2026-05-22): content-hash of the prompt that
   * produced this row, stamped at insert time. NULL on legacy rows from
   * before the migration — treated as "unknown" (no prompt-stale flag).
   */
  prompt_version_at_lock?: string | null;
  /**
   * Day 78 (Sasha 2026-05-21), Phase 4 of UBB staleness UX. NULL on rows
   * from before the migration — treated as "unknown" (no input-stale flag).
   */
  input_version_at_lock?: string | null;
};

// Day 80 Wave 2.20 (Sasha 2026-05-22): defensive bridge for the
// prompt_version_at_lock column. The Day 74 migration
// (20260522222511_ubb_prompt_version_at_lock.sql) adds this column to
// user_business_artifacts, but until Lovable's Supabase pipeline picks
// it up + PostgREST refreshes its schema cache, fresh inserts hit
// "Could not find the 'prompt_version_at_lock' column ... in the schema
// cache" and the whole Generate Uniqueness / Improve / Restore flows
// fail. This module-level latch trips on the first such error in a
// session and strips the field from all subsequent inserts — so the
// staleness Phase 2 feature degrades gracefully (rows get NULL prompt
// versions, treated as "unknown" / no flag) instead of blocking the
// canvas entirely. The latch resets per page-load, so once Supabase
// catches up the next session resumes stamping prompt versions.
let promptVersionColumnAvailable = true;
const isPromptVersionSchemaCacheMiss = (err: unknown): boolean => {
  if (!err || typeof err !== "object") return false;
  const msg = ((err as { message?: string }).message ?? "") + "";
  return /prompt_version_at_lock/.test(msg) && /schema cache/i.test(msg);
};
const stripPromptVersion = <T extends Record<string, unknown>>(payload: T): Omit<T, "prompt_version_at_lock"> => {
  const { prompt_version_at_lock: _drop, ...rest } = payload;
  return rest;
};

// Day 78 Phase 4 (Sasha 2026-05-21): parallel defensive bridge for the
// input_version_at_lock column. Same pattern, same shape, same lifetime as
// promptVersionColumnAvailable above. When the column hasn't propagated yet,
// strip it from the insert and let the row write with NULL — staleness Phase
// 4b (frontend mirror + compute) reads NULL as "unknown" / no flag.
let inputVersionColumnAvailable = true;
const isInputVersionSchemaCacheMiss = (err: unknown): boolean => {
  if (!err || typeof err !== "object") return false;
  const msg = ((err as { message?: string }).message ?? "") + "";
  return /input_version_at_lock/.test(msg) && /schema cache/i.test(msg);
};
const stripInputVersion = <T extends Record<string, unknown>>(payload: T): Omit<T, "input_version_at_lock"> => {
  const { input_version_at_lock: _drop, ...rest } = payload;
  return rest;
};

function rowToVersion(row: DbRow): VersionRow {
  return {
    id: row.id,
    user_id: row.user_id,
    artifact_key: row.artifact_key as ArtifactKey,
    version: parseInt(row.version?.replace(/\D/g, "") || "1", 10),
    content: row.content_json ?? row.content ?? null,
    specificity_score: Number(row.specificity_score ?? 0),
    parent_version_id: row.parent_version_id,
    roast_findings: row.roast_findings as VersionRow["roast_findings"],
    what_changed: row.what_changed,
    is_locked: !!row.is_locked,
    created_at: row.created_at,
    // Day 74 Phase 2: defaults to null on legacy rows from before the migration.
    prompt_version_at_lock: row.prompt_version_at_lock ?? null,
    // Day 78 Phase 4: defaults to null on legacy rows; staleness compute
    // (Phase 4b — frontend mirror) treats NULL as "unknown — do not flag."
    input_version_at_lock: row.input_version_at_lock ?? null,
  };
}

// Group raw rows by artifact_key and compute latest/latestLocked
function buildArtifactStates(rows: DbRow[]): Partial<Record<ArtifactKey, ArtifactState>> {
  const versions = rows.map(rowToVersion);
  const byKey: Partial<Record<ArtifactKey, VersionRow[]>> = {};
  for (const v of versions) {
    const bucket = byKey[v.artifact_key] || [];
    bucket.push(v);
    byKey[v.artifact_key] = bucket;
  }
  // Sort each bucket by created_at desc
  for (const k of Object.keys(byKey) as ArtifactKey[]) {
    byKey[k]!.sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
  }

  const states: Partial<Record<ArtifactKey, ArtifactState>> = {};
  for (const key of ALL_ARTIFACT_KEYS) {
    const bucket = byKey[key] || [];
    const latest = bucket[0] || null;
    const latestLocked = bucket.find((v) => v.is_locked) || null;
    states[key] = {
      key,
      latest,
      latestLocked,
      versionCount: bucket.length,
      isStale: false, // computed separately
      staleReason: undefined,
    };
  }
  // Two-axis staleness compute (Day 74 — Sasha 2026-05-22).
  //
  // PHASE 1 — parent_relocked: one of this artifact's DIRECT PARENTS (per
  //   dependencyTree.ts) was last-locked AFTER this artifact's own
  //   latestLocked.created_at. The user re-derived something upstream, so
  //   what was generated against the older parent context is now stale.
  //
  // PHASE 2 — prompt_changed: the prompt CODE (generationGuidance +
  //   outputSchema + specificityCriteria) has been edited since this row was
  //   locked. Detected by comparing the row's stamped `prompt_version_at_lock`
  //   against the current PROMPT_VERSION[key]. Legacy rows with NULL stamps
  //   are silent (treated as "unknown" — no false positives during the
  //   migration window).
  //
  // PRIORITY when both fire: prompt_changed wins. Re-Improving against the
  // newer prompt produces a fresh ceiling, and any pending parent-cascade
  // can be folded into the same improve call. Treating both as the same
  // banner would conflate two separate signals; the founder reads the copy
  // to decide which.
  //
  // Why we removed the old flat sibling check: it compared every artifact
  // against the global `latestSiblingLock`, so locking `landing_page`
  // (downstream of nearly everything) would falsely flash `uniqueness`
  // stale. The 60s buffer was a hack around that. Both unnecessary now.
  for (const s of Object.values(states)) {
    if (!s?.latestLocked) continue; // not yet locked → not stale on either axis

    // Phase 2 — prompt-stale check (higher priority).
    const lockedPromptVer = s.latestLocked.prompt_version_at_lock;
    const currentPromptVer = PROMPT_VERSION[s.key];
    if (lockedPromptVer != null && currentPromptVer && lockedPromptVer !== currentPromptVer) {
      s.isStale = true;
      s.staleReason = "Prompt updated — re-Improve for a higher ceiling.";
      s.stalenessSource = {
        type: "prompt_changed",
        lockedVersion: lockedPromptVer,
        currentVersion: currentPromptVer,
      };
      continue; // prompt_changed wins; don't overwrite with parent_relocked below
    }

    // Phase 1 — parent-stale check.
    const myLockMs = new Date(s.latestLocked.created_at).getTime();
    let newestParent: { key: ArtifactKey; lockedAt: string; lockedAtMs: number } | null = null;
    for (const parentKey of PARENTS[s.key]) {
      const parentLock = states[parentKey]?.latestLocked;
      if (!parentLock) continue;
      const parentLockMs = new Date(parentLock.created_at).getTime();
      if (parentLockMs > myLockMs) {
        if (!newestParent || parentLockMs > newestParent.lockedAtMs) {
          newestParent = {
            key: parentKey,
            lockedAt: parentLock.created_at,
            lockedAtMs: parentLockMs,
          };
        }
      }
    }
    if (newestParent) {
      s.isStale = true;
      s.staleReason = `${ARTIFACT_LABELS[newestParent.key]} was updated — re-Improve to refresh.`;
      s.stalenessSource = {
        type: "parent_relocked",
        parent: newestParent.key,
        parentLockedAt: newestParent.lockedAt,
      };
    }
  }
  return states;
}

function computeDerived(states: Partial<Record<ArtifactKey, ArtifactState>>) {
  let locked = 0;
  let total = 0;
  let sumSpec = 0;
  let specCount = 0;
  for (const key of ALL_ARTIFACT_KEYS) {
    total += 1;
    const s = states[key];
    if (s?.latestLocked) {
      locked += 1;
      sumSpec += s.latestLocked.specificity_score;
      specCount += 1;
    }
  }
  return {
    lockedCount: locked,
    unlockedCount: total - locked,
    avgSpecificity: specCount > 0 ? Number((sumSpec / specCount).toFixed(2)) : 0,
  };
}

// ============================================================================
// Context
// ============================================================================

type UniqueBusinessContextType = UniqueBusinessState & UniqueBusinessActions;

const UniqueBusinessContext = createContext<UniqueBusinessContextType | undefined>(undefined);

export function UniqueBusinessProvider({ children }: { children: ReactNode }) {
  const [artifacts, setArtifacts] = useState<Partial<Record<ArtifactKey, ArtifactState>>>({});
  const [versionHistory, setVersionHistory] = useState<Partial<Record<ArtifactKey, VersionRow[]>>>({});
  const [pendingImprovement, setPendingImprovement] = useState<
    { artifact_key: ArtifactKey; result: ImproveResult } | null
  >(null);
  const [isImproving, setIsImproving] = useState<ArtifactKey | null>(null);
  const [isGenerating, setIsGenerating] = useState<ArtifactKey | null>(null);
  const [dossier, setDossier] = useState<DossierSnapshot | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [zogSnapshot, setZogSnapshot] = useState<Record<string, unknown> | null>(null);
  const [excaliburData, setExcaliburData] = useState<Record<string, unknown> | null>(null);
  // Day 78 Phase 1 (Sasha 2026-05-21): mission_statement + mission_discovered_at
  // loaded from game_profiles, forwarded into root_context.mission for the
  // edge functions. Previously the AI prompts saw nothing about the founder's
  // mission. See docs/specs/ubb-deep-context/.
  const [mission, setMission] = useState<{ sentence: string; discovered_at: string | null } | null>(null);
  // Day 78 Phase 2 (Sasha 2026-05-21): user_assets inventory loaded from DB,
  // forwarded into root_context.assets. Distribution + value-ladder artifacts
  // were operating blind without this; with it, reach / frictionless_purchase /
  // surface_inventory / delivery / value_ladder ground in real inventory.
  // Each row mapped from DB shape (snake_case) to SavedAsset (camelCase).
  type AssetRow = { typeId: string; subTypeId: string | null; categoryId: string | null; title: string; description: string | null };
  const [assets, setAssets] = useState<AssetRow[] | null>(null);
  // Day 78 Phase 1 amendment: when generating with input-thin context (no
  // mission or no assets), surface a single non-blocking toast per session
  // so the user knows the ceiling will lift once they save those. Replaced
  // by the persistent banner in Phase 4 (input-staleness axis).
  const inputThinNoticeShownRef = useRef(false);
  // Day 53 night iter 3 (Sasha 2026-04-27): tracks whether the initial
  // artifacts fetch has completed. Without this, surfaces can't tell
  // "loading" apart from "fresh user with zero artifacts" — both states
  // have artifacts === {}. Flips to false in the finally-block of the
  // initial fetch effect.
  const [isInitializing, setIsInitializing] = useState(true);

  // Day 74 (Sasha 2026-05-22): Bulk Improve cascade state.
  //
  // We keep both a state value (for React re-renders) and a ref (for reading
  // current bulk progress from inside callbacks without dragging the latest
  // closure through deps arrays). Always write through `updateBulkImprove` so
  // the two stay in sync.
  const [bulkImprove, _setBulkImprove] = useState<BulkImproveProgress | null>(null);
  const bulkImproveRef = useRef<BulkImproveProgress | null>(null);
  const updateBulkImprove = useCallback(
    (
      next:
        | BulkImproveProgress
        | null
        | ((prev: BulkImproveProgress | null) => BulkImproveProgress | null)
    ) => {
      _setBulkImprove((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        bulkImproveRef.current = value;
        return value;
      });
    },
    []
  );
  /**
   * Ref pointer used during a bulk cascade to record WHY improveArtifact
   * returned without producing a pending review (early-return cases: max
   * specificity reached, diminishing returns, missing v1, model error). The
   * existing improveArtifact body writes here when bulk is active so the
   * advancement loop can record an outcome without changing the public action
   * signature. Null when not bulk-active.
   */
  const bulkSkipReporterRef = useRef<((reason: BulkImproveSkipReason | { failed: string }) => void) | null>(null);

  // Day 74 (Sasha 2026-05-22): "Re-derive downstream?" confirmation slice.
  // Populated when a user successfully locks an upstream artifact whose
  // transitive descendants are also locked. The LockedCascadeDialog reads
  // this and renders a one-tap confirm/dismiss.
  const [lockedCascadePrompt, setLockedCascadePrompt] = useState<
    { lockedKey: ArtifactKey; candidates: ArtifactKey[] } | null
  >(null);

  // Load user + ZoG + artifacts on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes.user?.id ?? null;
        if (cancelled) return;
        setUserId(uid);
        if (!uid) return;

        // Load latest ZoG snapshot — Day 51 (Sasha 2026-04-25): the schema
        // uses profile_id (FK to game_profiles), not user_id. Resolve the
        // game_profile first, then query zog_snapshots by profile_id.
        // Was: .eq("user_id", uid) → 400 Bad Request, root context empty.
        try {
          const profileId = await getOrCreateGameProfileId();
          if (cancelled) return;
          const { data: zogRows } = await (supabase as any)
            .from("zog_snapshots")
            .select("*")
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false })
            .limit(1);
          if (cancelled) return;
          if (zogRows && zogRows[0]) {
            setZogSnapshot(zogRows[0]);
            setExcaliburData(zogRows[0].excalibur_data ?? null);
          }
        } catch (e) {
          console.warn("[UBB] zog_snapshot load failed (non-fatal):", e);
        }

        // Day 78 Phase 1 (Sasha 2026-05-21): load mission_statement +
        // mission_discovered_at from game_profiles. Non-fatal if missing;
        // the rootContext memo will simply omit the mission field.
        try {
          const { data: profileRows } = await (supabase as any)
            .from("game_profiles")
            .select("mission_statement, mission_discovered_at")
            .eq("user_id", uid)
            .limit(1);
          if (cancelled) return;
          const row = profileRows?.[0];
          if (row?.mission_statement) {
            setMission({
              sentence: row.mission_statement,
              discovered_at: row.mission_discovered_at ?? null,
            });
          }
        } catch (e) {
          console.warn("[UBB] mission load failed (non-fatal):", e);
        }

        // Day 78 Phase 2 (Sasha 2026-05-21): load user_assets inventory.
        // Non-fatal if missing; rootContext memo omits assets when null.
        // Maps DB snake_case fields to the SavedAsset-shaped camelCase the
        // edge function expects via assetsSummary.
        try {
          const { data: assetRows } = await (supabase as any)
            .from("user_assets")
            .select("type_id, sub_type_id, category_id, title, description")
            .eq("user_id", uid);
          if (cancelled) return;
          if (Array.isArray(assetRows) && assetRows.length) {
            setAssets(assetRows.map((r: any) => ({
              typeId: r.type_id,
              subTypeId: r.sub_type_id,
              categoryId: r.category_id,
              title: r.title,
              description: r.description,
            })));
          }
        } catch (e) {
          console.warn("[UBB] assets load failed (non-fatal):", e);
        }

        // Load all artifact rows for this user (v2.0 keys only)
        const { data: rows, error } = await (supabase as any)
          .from("user_business_artifacts")
          .select("*")
          .eq("user_id", uid)
          .in("artifact_key", ALL_ARTIFACT_KEYS as unknown as string[]);
        if (cancelled) return;
        if (error) {
          console.error("Failed to load artifacts:", error);
          toast.error("Couldn't load your canvas — please refresh.");
          return;
        }
        setArtifacts(buildArtifactStates((rows || []) as DbRow[]));
      } finally {
        // Day 53 night iter 3: flip isInitializing false whether the
        // fetch succeeded, errored, or returned no auth — surfaces stop
        // showing skeleton placeholders and render their resolved state.
        if (!cancelled) setIsInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Realtime: when a new row arrives for this user, refresh that artifact's state.
  // Day 66 (Sasha 2026-05-16) — Wave B2: ALSO refetch on tab focus +
  // visibility change. The realtime channel is best-effort — if the
  // websocket drops mid-edit (network blip, sleeping laptop, etc.)
  // and the client misses a postgres_changes event, local state
  // diverges from the DB until the user manually reloads. Refetching
  // on focus/visibility makes the canvas self-heal: any time the tab
  // becomes visible, we re-sync with the source of truth.
  useEffect(() => {
    if (!userId) return;

    const refetch = async () => {
      const { data: rows, error } = await (supabase as any)
        .from("user_business_artifacts")
        .select("*")
        .eq("user_id", userId)
        .in("artifact_key", ALL_ARTIFACT_KEYS as unknown as string[]);
      if (!error) {
        setArtifacts(buildArtifactStates((rows || []) as DbRow[]));
      }
    };

    const channel = (supabase as any)
      .channel(`uba:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_business_artifacts",
          filter: `user_id=eq.${userId}`,
        },
        refetch,
      )
      .subscribe();

    // Focus / visibility refetch. Two listeners for full coverage:
    //  - `focus` fires when the window regains focus (mac cmd-tab, etc.)
    //  - `visibilitychange` fires when the tab is hidden→visible
    //    (browser tab switches, mobile background→foreground)
    const onFocus = () => { void refetch(); };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refetch();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      (supabase as any).removeChannel(channel);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [userId]);

  // Build sibling context for AI calls — only locked artifacts, their content + specificity
  const getSiblingContext = useCallback(
    (excludeKey: ArtifactKey) => {
      const out: Record<string, { content: unknown; specificity: number }> = {};
      for (const key of ALL_ARTIFACT_KEYS) {
        if (key === excludeKey) continue;
        const s = artifacts[key];
        if (s?.latestLocked) {
          out[key] = {
            content: s.latestLocked.content,
            specificity: s.latestLocked.specificity_score,
          };
        }
      }
      return out;
    },
    [artifacts]
  );

  const rootContext = useMemo(() => {
    return {
      zog_snapshot: zogSnapshot ?? {},
      ...(excaliburData ? { excalibur_data: excaliburData } : {}),
      ...(mission ? { mission } : {}),
      ...(assets && assets.length ? { assets } : {}),
    };
  }, [zogSnapshot, excaliburData, mission, assets]);

  // --- Actions ---

  const generateArtifact = useCallback(
    async (key: ArtifactKey) => {
      if (!userId) {
        toast.error("Please sign in first.");
        return;
      }
      // Day 78 Phases 1+2 amendment: input-thin notice (one-per-session).
      // When mission or assets are missing, the prompts run with weaker
      // context. We generate anyway (per planning SoW decision 3, graceful
      // degradation), but tell the user once.
      if ((!mission || !assets || assets.length === 0) && !inputThinNoticeShownRef.current) {
        const missingParts: string[] = [];
        if (!mission) missingParts.push("mission");
        if (!assets || assets.length === 0) missingParts.push("assets");
        toast.message(
          `Tip: save your ${missingParts.join(" + ")} first for sharper artifacts. Continuing with what we have.`
        );
        inputThinNoticeShownRef.current = true;
      }
      setIsGenerating(key);
      try {
        const { data, error } = await supabase.functions.invoke("generate-artifact", {
          body: {
            artifact_key: key,
            sibling_artifacts: getSiblingContext(key),
            root_context: rootContext,
          },
        });
        if (error) throw error;
        const result = data as GenerateResult & { error?: string };
        if ((result as any)?.error) {
          toast.error(ERROR_MESSAGES[(result as any).error as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.model_error);
          return;
        }

        // Insert v1 row — return inserted row so we can update local state
        // optimistically (don't rely on realtime channel).
        // Day 80 Wave 2.20: schema-cache fallback. If the
        // prompt_version_at_lock column isn't visible to PostgREST yet
        // (migration ahead of cache refresh), retry once without it.
        const basePayload = {
          user_id: userId,
          artifact_key: key,
          version: "v1",
          content_json: result.content,
          specificity_score: result.initial_specificity,
          step_number: 1,
          is_locked: false,
          // Day 74 Phase 2 (Sasha 2026-05-22): stamp the prompt version
          // alive at v1-generation time so future prompt edits can flag
          // this row as "prompt-stale — re-Improve for the new ceiling."
          prompt_version_at_lock: PROMPT_VERSION[key],
          // Day 78 Phase 4 (Sasha 2026-05-21): stamp the input-version hash
          // (founder context as seen by THIS artifact) so future mission/
          // assets/ZoG edits can flag this row as "input-stale" once the
          // frontend mirror lands (Phase 4b).
          input_version_at_lock: result.input_version_at_lock,
        };
        let inserted: DbRow | null = null;
        let insertError: any = null;
        {
          let firstPayload: any = basePayload;
          if (!promptVersionColumnAvailable) firstPayload = stripPromptVersion(firstPayload);
          if (!inputVersionColumnAvailable) firstPayload = stripInputVersion(firstPayload);
          const r1 = await (supabase as any)
            .from("user_business_artifacts")
            .insert(firstPayload)
            .select("*")
            .single();
          const promptMiss = r1.error && isPromptVersionSchemaCacheMiss(r1.error);
          const inputMiss = r1.error && isInputVersionSchemaCacheMiss(r1.error);
          if (promptMiss || inputMiss) {
            if (promptMiss) promptVersionColumnAvailable = false;
            if (inputMiss) inputVersionColumnAvailable = false;
            let retryPayload: any = basePayload;
            if (!promptVersionColumnAvailable) retryPayload = stripPromptVersion(retryPayload);
            if (!inputVersionColumnAvailable) retryPayload = stripInputVersion(retryPayload);
            const r2 = await (supabase as any)
              .from("user_business_artifacts")
              .insert(retryPayload)
              .select("*")
              .single();
            inserted = r2.data as DbRow | null;
            insertError = r2.error;
          } else {
            inserted = r1.data as DbRow | null;
            insertError = r1.error;
          }
        }

        if (insertError) {
          // 23505 = Postgres unique_violation. Row already exists for
          // (user_id, artifact_key, version) — local state was out-of-sync
          // with DB (previous session, realtime missed an event, or
          // double-click race). Reload to sync, then nudge toward Improve.
          // Day 51 (Sasha 2026-04-25): Supabase JS may return error.code
          // OR error.message containing the SQL state — check both.
          const isUnique =
            insertError.code === '23505' ||
            /23505|duplicate key/i.test(insertError.message || '');
          if (isUnique) {
            const { data: rows } = await (supabase as any)
              .from("user_business_artifacts")
              .select("*")
              .eq("user_id", userId)
              .in("artifact_key", ALL_ARTIFACT_KEYS as unknown as string[]);
            setArtifacts(buildArtifactStates((rows || []) as DbRow[]));
            toast.message(`${key}: a version already exists — synced your canvas. Use Improve to evolve it.`);
            return;
          }
          throw insertError;
        }

        // Optimistic local state update — don't rely on realtime channel.
        // Day 51 (Sasha 2026-04-25): without this, generate succeeded in DB
        // but UI stayed on "Nothing here yet" until manual reload. Now state
        // syncs immediately after insert.
        if (inserted) {
          setArtifacts((prev) => {
            const next = { ...prev };
            const newRow = rowToVersion(inserted as DbRow);
            const existing = next[key];
            const bucket = existing?.latest ? [newRow, existing.latest] : [newRow];
            next[key] = {
              key,
              latest: newRow,
              latestLocked: existing?.latestLocked ?? null,
              versionCount: bucket.length,
              isStale: false,
              staleReason: undefined,
            };
            return next;
          });
        }
        toast.success(`${key}: first draft ready.`);
      } catch (e: any) {
        console.error("generateArtifact failed:", e);
        toast.error(e?.message || ERROR_MESSAGES.model_error);
      } finally {
        setIsGenerating(null);
      }
    },
    [userId, mission, assets, getSiblingContext, rootContext]
  );

  const improveArtifact = useCallback(
    async (key: ArtifactKey) => {
      if (!userId) return;
      const current = artifacts[key]?.latest;
       if (!current) {
        toast.error("Generate a first version before improving.");
        return;
      }
      // Specificity is hard-capped at 10 (DB CHECK constraint). Once an
      // artifact reaches the ceiling, further improvement is meaningless —
      // skip the AI round-trip entirely and tell the founder cleanly.
      if ((current.specificity_score ?? 0) >= 10) {
        toast.message("This artifact is already at maximum specificity (10/10). Sharpen a sibling artifact, then revisit.");
        return;
      }
      setIsImproving(key);
      try {
        const prevVersions = (versionHistory[key] || []).slice(0, 3).map((v) => v.content);
        const { data, error } = await supabase.functions.invoke("improve-artifact", {
          body: {
            artifact_key: key,
            current_content: current.content,
            current_specificity: current.specificity_score,
            sibling_artifacts: getSiblingContext(key),
            root_context: rootContext,
            previous_versions: prevVersions,
          },
        });
        if (error) throw error;
        const result = data as ImproveResult & { error?: string };
        if ((result as any)?.error) {
          toast.error(ERROR_MESSAGES[(result as any).error as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.model_error);
          return;
        }

        if (result.diminishing_returns) {
          toast.message("This version may be at its current ceiling. Try again after surrounding artifacts sharpen.");
          return;
        }

        setPendingImprovement({ artifact_key: key, result });
      } catch (e: any) {
        console.error("improveArtifact failed:", e);
        toast.error(e?.message || ERROR_MESSAGES.model_error);
      } finally {
        setIsImproving(null);
      }
    },
    [userId, artifacts, versionHistory, getSiblingContext, rootContext]
  );

  const acceptImprovement = useCallback(async () => {
    if (!pendingImprovement || !userId) return;
    const { artifact_key, result } = pendingImprovement;
    const current = artifacts[artifact_key]?.latest;
    if (!current) return;

    const newVersion = nextVersionString(String(current.version ? `v${current.version}` : "v1"));
    // DB CHECK constraint caps specificity_score at 10. Clamp to avoid 23514 violations
    // when the model returns e.g. 10.2 on top of an already-10.0 artifact.
    const clampedScore = Math.min(10, Math.max(0, Number(result.specificity_score) || 0));
    const clampedDelta = Number((clampedScore - (current.specificity_score ?? 0)).toFixed(1));
    try {
      // Day 80 Wave 2.20: same schema-cache fallback as generateArtifact.
      const improvePayload = {
        user_id: userId,
        artifact_key,
        version: newVersion,
        content_json: result.improved_content,
        specificity_score: clampedScore,
        parent_version_id: current.id,
        roast_findings: result.roast_findings,
        what_changed: result.what_changed,
        step_number: current.version ? current.version + 1 : 1,
        is_locked: false,
        // Day 74 Phase 2 (Sasha 2026-05-22): stamp the prompt version this
        // improvement was produced under. Re-Improving against a later
        // prompt version flips the stamp; staleness compute uses the
        // delta to flag "prompt-stale" rows.
        prompt_version_at_lock: PROMPT_VERSION[artifact_key],
        // Day 78 Phase 4 (Sasha 2026-05-21): stamp the input-version hash
        // for this improve. See generateArtifact for full context.
        input_version_at_lock: result.input_version_at_lock,
      };
      let inserted: DbRow | null = null;
      {
        let firstPayload: any = improvePayload;
        if (!promptVersionColumnAvailable) firstPayload = stripPromptVersion(firstPayload);
        if (!inputVersionColumnAvailable) firstPayload = stripInputVersion(firstPayload);
        const r1 = await (supabase as any)
          .from("user_business_artifacts")
          .insert(firstPayload)
          .select("*")
          .single();
        const promptMiss = r1.error && isPromptVersionSchemaCacheMiss(r1.error);
        const inputMiss = r1.error && isInputVersionSchemaCacheMiss(r1.error);
        if (promptMiss || inputMiss) {
          if (promptMiss) promptVersionColumnAvailable = false;
          if (inputMiss) inputVersionColumnAvailable = false;
          let retryPayload: any = improvePayload;
          if (!promptVersionColumnAvailable) retryPayload = stripPromptVersion(retryPayload);
          if (!inputVersionColumnAvailable) retryPayload = stripInputVersion(retryPayload);
          const r2 = await (supabase as any)
            .from("user_business_artifacts")
            .insert(retryPayload)
            .select("*")
            .single();
          if (r2.error) throw r2.error;
          inserted = r2.data as DbRow | null;
        } else if (r1.error) {
          throw r1.error;
        } else {
          inserted = r1.data as DbRow | null;
        }
      }

      // Optimistic local state update — Day 51 (Sasha 2026-04-25): same
      // pattern as generateArtifact. Don't rely on realtime to flip state.
      if (inserted) {
        setArtifacts((prev) => {
          const next = { ...prev };
          const newRow = rowToVersion(inserted as DbRow);
          const existing = next[artifact_key];
          next[artifact_key] = {
            key: artifact_key,
            latest: newRow,
            latestLocked: existing?.latestLocked ?? null,
            versionCount: (existing?.versionCount ?? 0) + 1,
            isStale: false,
            staleReason: undefined,
          };
          return next;
        });
      }

      // Log the improvement event
      await (supabase as any).from("artifact_improvements").insert({
        user_id: userId,
        artifact_key,
        artifact_before_id: current.id,
        artifact_after_id: (inserted as DbRow)?.id,
        roast_findings: result.roast_findings,
        what_changed: result.what_changed,
        crystallized_action: result.crystallized_action,
        specificity_before: current.specificity_score,
        specificity_after: clampedScore,
        specificity_delta: clampedDelta,
        accepted: true,
        diminishing_returns: false,
      });

      toast.success(`${artifact_key}: specificity +${clampedDelta.toFixed(1)}`);

      // Day 74 (Sasha 2026-05-22): bulk cascade outcome — record acceptance.
      // The advancement effect (watching `bulkImprove`) will dequeue the next
      // item once current goes back to null.
      if (bulkImproveRef.current?.current === artifact_key) {
        updateBulkImprove((prev) =>
          prev
            ? { ...prev, current: null, accepted: [...prev.accepted, artifact_key] }
            : null
        );
      }
    } catch (e: any) {
      console.error("acceptImprovement failed:", e);
      toast.error("Couldn't save the improvement. Please retry.");
      // Day 74: classify as failed in bulk context so we don't lose the slot.
      if (bulkImproveRef.current?.current === artifact_key) {
        updateBulkImprove((prev) =>
          prev
            ? {
                ...prev,
                current: null,
                failed: [...prev.failed, { key: artifact_key, message: e?.message || "save failed" }],
              }
            : null
        );
      }
    } finally {
      setPendingImprovement(null);
    }
  }, [pendingImprovement, userId, artifacts, updateBulkImprove]);

  const rejectImprovement = useCallback(async () => {
    if (!pendingImprovement || !userId) return;
    const { artifact_key, result } = pendingImprovement;
    const current = artifacts[artifact_key]?.latest;
    try {
      await (supabase as any).from("artifact_improvements").insert({
        user_id: userId,
        artifact_key,
        artifact_before_id: current?.id ?? null,
        artifact_after_id: null,
        roast_findings: result.roast_findings,
        what_changed: result.what_changed,
        crystallized_action: result.crystallized_action,
        specificity_before: current?.specificity_score ?? null,
        specificity_after: null,
        specificity_delta: null,
        accepted: false,
        diminishing_returns: false,
      });
    } catch (e) {
      console.error("rejectImprovement log failed:", e);
    } finally {
      // Day 74 (Sasha 2026-05-22): bulk cascade outcome — record rejection.
      if (bulkImproveRef.current?.current === artifact_key) {
        updateBulkImprove((prev) =>
          prev
            ? { ...prev, current: null, rejected: [...prev.rejected, artifact_key] }
            : null
        );
      }
      setPendingImprovement(null);
    }
  }, [pendingImprovement, userId, artifacts, updateBulkImprove]);

  // Day 62 (Sasha 2026-05-05): restore an artifact to its v1 content.
  // Append-only — fetches v1 from DB and inserts a new row whose
  // content/score copies v1, with parent_version_id pointing at the
  // current latest. Preserves the full version chain (per the paramount
  // append-only invariant). No-op if already at v1.
  const restoreToV1 = useCallback(
    async (key: ArtifactKey) => {
      if (!userId) {
        toast.error("Please sign in first.");
        return;
      }
      const current = artifacts[key]?.latest;
      if (!current) {
        toast.error("Generate this artifact first.");
        return;
      }
      if (current.version === 1) {
        toast.message("Already at v1 — nothing to restore.");
        return;
      }

      try {
        // Fetch v1 directly from DB — don't depend on lazy versionHistory.
        const { data: v1Row, error: v1Error } = await (supabase as any)
          .from("user_business_artifacts")
          .select("*")
          .eq("user_id", userId)
          .eq("artifact_key", key)
          .eq("version", "v1")
          .maybeSingle();

        if (v1Error) {
          console.error("restoreToV1: v1 lookup failed", v1Error);
          toast.error("Couldn't find v1 — please retry.");
          return;
        }
        if (!v1Row) {
          toast.error("No v1 exists for this artifact.");
          return;
        }

        const v1 = rowToVersion(v1Row as DbRow);
        const newVersion = nextVersionString(`v${current.version}`);

        // Day 80 Wave 2.20: same schema-cache fallback as the other two
        // insert sites in this file.
        const restorePayload = {
          user_id: userId,
          artifact_key: key,
          version: newVersion,
          content_json: v1.content,
          specificity_score: v1.specificity_score,
          parent_version_id: current.id,
          what_changed: "Restored from v1",
          step_number: current.version + 1,
          is_locked: false,
          // Day 74 Phase 2 (Sasha 2026-05-22): stamp the CURRENT prompt
          // version (not v1's original). The row was born now; staleness
          // semantics are "is the content's prompt-of-record current?" —
          // copying v1 content under today's prompt is, by definition,
          // current. If the user wants a higher ceiling they can re-Improve.
          prompt_version_at_lock: PROMPT_VERSION[key],
          // Day 78 Phase 4b (Sasha 2026-05-29): stamp the CURRENT input
          // hash for the same reason — the row is born now under today's
          // rootContext, so it carries today's input-version-of-record.
          // Without this, restored rows landed with NULL ("unknown") and
          // immediately read as not-input-stale-because-legacy, defeating
          // the axis. Phase 4a stamped this on generate + improve only;
          // 4b closes the third insert site.
          input_version_at_lock: inputVersionHash(rootContext, key),
        };
        let inserted: DbRow | null = null;
        {
          let firstPayload: any = restorePayload;
          if (!promptVersionColumnAvailable) firstPayload = stripPromptVersion(firstPayload);
          if (!inputVersionColumnAvailable) firstPayload = stripInputVersion(firstPayload);
          const r1 = await (supabase as any)
            .from("user_business_artifacts")
            .insert(firstPayload)
            .select("*")
            .single();
          const promptMiss = r1.error && isPromptVersionSchemaCacheMiss(r1.error);
          const inputMiss = r1.error && isInputVersionSchemaCacheMiss(r1.error);
          if (promptMiss || inputMiss) {
            if (promptMiss) promptVersionColumnAvailable = false;
            if (inputMiss) inputVersionColumnAvailable = false;
            let retryPayload: any = restorePayload;
            if (!promptVersionColumnAvailable) retryPayload = stripPromptVersion(retryPayload);
            if (!inputVersionColumnAvailable) retryPayload = stripInputVersion(retryPayload);
            const r2 = await (supabase as any)
              .from("user_business_artifacts")
              .insert(retryPayload)
              .select("*")
              .single();
            if (r2.error) throw r2.error;
            inserted = r2.data as DbRow | null;
          } else if (r1.error) {
            throw r1.error;
          } else {
            inserted = r1.data as DbRow | null;
          }
        }

        // Optimistic local update — same pattern as acceptImprovement.
        if (inserted) {
          setArtifacts((prev) => {
            const next = { ...prev };
            const newRow = rowToVersion(inserted as DbRow);
            const existing = next[key];
            next[key] = {
              key,
              latest: newRow,
              latestLocked: existing?.latestLocked ?? null,
              versionCount: (existing?.versionCount ?? 0) + 1,
              isStale: false,
              staleReason: undefined,
            };
            return next;
          });
        }

        toast.success(`${key}: restored to v1 content (now v${current.version + 1}).`);
      } catch (e: any) {
        console.error("restoreToV1 failed:", e);
        toast.error(e?.message || "Couldn't restore to v1 — please retry.");
      }
    },
    [userId, artifacts, rootContext]
  );

  // ──────────────────────────────────────────────────────────────────────
  // Day 74 (Sasha 2026-05-22): Bulk Improve cascade.
  //
  // Sorts the requested keys topologically (parents first), then walks the
  // queue. The advancement effect below drives forward whenever we hit a
  // settled state (no AI call in flight, no pending review). Per-item review
  // happens via the existing ImproveReviewDrawer — accept/reject paths above
  // record outcomes on `bulkImprove` when the cascade is active.
  // ──────────────────────────────────────────────────────────────────────

  const startBulkImprove = useCallback(
    (keys: ArtifactKey[]) => {
      if (!keys || keys.length === 0) return;
      // Idempotent — refuse if a cascade is already in progress, to avoid
      // tangled queue states. Caller should cancelBulkImprove first.
      if (bulkImproveRef.current) {
        toast.message("A Bulk Improve is already in progress.");
        return;
      }
      // Dedupe + filter to valid known keys
      const seen = new Set<ArtifactKey>();
      const valid: ArtifactKey[] = [];
      for (const k of keys) {
        if (seen.has(k)) continue;
        if (!ALL_ARTIFACT_KEYS.includes(k)) continue;
        seen.add(k);
        valid.push(k);
      }
      if (valid.length === 0) return;
      // Topological sort — parents before children so each improve sees the
      // freshly accepted upstream content. DFS over PARENTS restricted to the
      // requested key set.
      const validSet = new Set(valid);
      const visited = new Set<ArtifactKey>();
      const ordered: ArtifactKey[] = [];
      const visit = (k: ArtifactKey) => {
        if (visited.has(k) || !validSet.has(k)) return;
        visited.add(k);
        for (const p of PARENTS[k]) visit(p);
        ordered.push(k);
      };
      for (const k of valid) visit(k);

      updateBulkImprove({
        total: ordered.length,
        current: null,
        remaining: ordered,
        accepted: [],
        rejected: [],
        skipped: [],
        failed: [],
      });
    },
    [updateBulkImprove]
  );

  const cancelBulkImprove = useCallback(() => {
    if (!bulkImproveRef.current) return;
    updateBulkImprove(null);
    toast.message("Bulk Improve cancelled.");
  }, [updateBulkImprove]);

  // Advancement effect — drives the cascade forward whenever the app is at
  // a "settled" state (no improve in flight, no pending review). Each tick
  // either: dequeues the next artifact and calls improveArtifact on it, or
  // classifies a current item that finished without a pending review as a
  // skip (improveArtifact toasted the actual reason), or summarizes and
  // clears when the queue is empty.
  useEffect(() => {
    const bulk = bulkImprove;
    if (!bulk) return;
    if (isImproving) return; // wait for AI call to settle
    if (pendingImprovement) return; // wait for user to accept/reject

    // Case A — `current` is set but pendingImprovement is null and isImproving
    // is null. improveArtifact returned without producing a review (max
    // specificity, diminishing returns, missing v1, or model error). The toast
    // already told the user. Record as skipped and let the next tick dequeue.
    if (bulk.current) {
      const skippedKey = bulk.current;
      updateBulkImprove((prev) =>
        prev
          ? {
              ...prev,
              current: null,
              skipped: [
                ...prev.skipped,
                { key: skippedKey, reason: "diminishing_returns" as BulkImproveSkipReason },
              ],
            }
          : null
      );
      return;
    }

    // Case B — queue is empty. Summarize and clear.
    if (bulk.remaining.length === 0) {
      const parts = [
        `${bulk.accepted.length} improved`,
        bulk.rejected.length ? `${bulk.rejected.length} rejected` : null,
        bulk.skipped.length ? `${bulk.skipped.length} skipped` : null,
        bulk.failed.length ? `${bulk.failed.length} failed` : null,
      ].filter(Boolean);
      toast.success(`Bulk Improve complete — ${parts.join(" · ")}`);
      updateBulkImprove(null);
      return;
    }

    // Case C — dequeue the next artifact and improve it.
    const [next, ...rest] = bulk.remaining;
    updateBulkImprove((prev) =>
      prev ? { ...prev, remaining: rest, current: next } : null
    );
    void improveArtifact(next);
  }, [bulkImprove, isImproving, pendingImprovement, improveArtifact, updateBulkImprove]);

  // Day 51 (Sasha 2026-04-25): human-override for AI-suggested specificity
  // score. AI suggests, human can adjust via the badge in the UI. Stores
  // the human-chosen value back in `specificity_score` (single source of
  // truth — the AI's original is preserved in version history if needed).
  const updateArtifactScore = useCallback(
    async (key: ArtifactKey, newScore: number) => {
      const latest = artifacts[key]?.latest;
      if (!latest) return;
      const clamped = Math.max(0, Math.min(10, Number(newScore.toFixed(1))));
      const { error } = await (supabase as any)
        .from("user_business_artifacts")
        .update({ specificity_score: clamped })
        .eq("id", latest.id);
      if (error) {
        toast.error("Couldn't update score — please retry.");
        return;
      }
      // Optimistic local state update.
      setArtifacts((prev) => {
        const s = prev[key];
        if (!s || !s.latest) return prev;
        const updatedLatest = { ...s.latest, specificity_score: clamped };
        const wasLockedSame = s.latestLocked && s.latestLocked.id === s.latest.id;
        return {
          ...prev,
          [key]: {
            ...s,
            latest: updatedLatest,
            latestLocked: wasLockedSame ? updatedLatest : s.latestLocked,
          },
        };
      });
    },
    [artifacts]
  );

  const lockArtifact = useCallback(
    async (key: ArtifactKey) => {
      const latest = artifacts[key]?.latest;
      if (!latest) return;
      const { error } = await (supabase as any)
        .from("user_business_artifacts")
        .update({ is_locked: true })
        .eq("id", latest.id);
      if (error) {
        toast.error("Couldn't lock — please retry.");
        return;
      }
      // Optimistic local update — don't rely on realtime to flip the UI.
      // (Realtime can be flaky; without this, toast fires but button stays
      // on "Lock & Continue" instead of swapping to "Continue to →".)
      setArtifacts((prev) => {
        const s = prev[key];
        if (!s || !s.latest) return prev;
        const updated = { ...s.latest, is_locked: true };
        return { ...prev, [key]: { ...s, latest: updated, latestLocked: updated } };
      });
      toast.success(`${key}: locked.`);

      // Day 74 (Sasha 2026-05-22): if this lock has already-locked descendants,
      // surface a "Re-derive N downstream?" prompt. Only locked descendants
      // are candidates — drafted-but-unlocked ones are the founder's
      // in-progress work, not auto-suggest material. Skip the prompt entirely
      // when a Bulk Improve cascade is already running (one queue at a time).
      if (bulkImproveRef.current) return;
      const candidates = getDownstream(key).filter((descendant) => {
        // Read latest artifact snapshot directly — `artifacts` closure here
        // doesn't yet include the lock we just applied, but the optimistic
        // update above will land on the next render. Either way we only care
        // about the descendants' lock state, which this dep already captures.
        return !!artifacts[descendant]?.latestLocked;
      });
      if (candidates.length > 0) {
        setLockedCascadePrompt({ lockedKey: key, candidates });
      }
    },
    [artifacts]
  );

  const dismissLockedCascadePrompt = useCallback(() => {
    setLockedCascadePrompt(null);
  }, []);

  const unlockArtifact = useCallback(
    async (key: ArtifactKey) => {
      const locked = artifacts[key]?.latestLocked;
      if (!locked) return;
      const { error } = await (supabase as any)
        .from("user_business_artifacts")
        .update({ is_locked: false })
        .eq("id", locked.id);
      if (error) {
        toast.error("Couldn't unlock — please retry.");
        return;
      }
      // Same optimistic-update pattern as lockArtifact.
      setArtifacts((prev) => {
        const s = prev[key];
        if (!s) return prev;
        const updatedLatest = s.latest && s.latest.id === locked.id
          ? { ...s.latest, is_locked: false }
          : s.latest;
        return { ...prev, [key]: { ...s, latest: updatedLatest, latestLocked: null } };
      });
    },
    [artifacts]
  );

  const loadVersionHistory = useCallback(
    async (key: ArtifactKey) => {
      if (!userId) return;
      const { data, error } = await (supabase as any)
        .from("user_business_artifacts")
        .select("*")
        .eq("user_id", userId)
        .eq("artifact_key", key)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setVersionHistory((prev) => ({
          ...prev,
          [key]: (data as DbRow[]).map(rowToVersion),
        }));
      }
    },
    [userId]
  );

  // Build frozen snapshot of all 18 artifacts at their latest-locked (or latest) version
  // Derived values (must be declared before callbacks that read them)
  const derived = useMemo(() => computeDerived(artifacts), [artifacts]);

  const buildArtifactSnapshot = useCallback(() => {
    const snapshot: Record<string, { version: number; content: unknown; specificity_score: number }> = {};
    for (const key of ALL_ARTIFACT_KEYS) {
      const s = artifacts[key];
      const row = s?.latestLocked ?? s?.latest;
      if (row) {
        snapshot[key] = {
          version: row.version,
          content: row.content,
          specificity_score: row.specificity_score,
        };
      }
    }
    return snapshot;
  }, [artifacts]);

  const publishLandingPage = useCallback(async (): Promise<LandingPagePublication> => {
    if (!userId) throw new Error("Please sign in first.");
    // Day 62 (Sasha 2026-05-05) BUG FIX — source-of-truth mismatch with the
    // button label. The button on LandingPageScreen reads
    // `landing.latest.version` ("Publish v7"); the OLD code here read
    // `latestLocked ?? latest`, so once a user had ANY locked version, every
    // subsequent publish silently republished THAT locked version at a new
    // random URL — even after they'd improved 4 times beyond it. Sasha hit
    // this on his own canvas: button promised v7, function shipped v3, URL
    // looked "stuck at v3" because every click really WAS v3.
    //
    // The lock is editorial-only (the on-screen tip says "lock first if you
    // want this version to feel final" — i.e., locking is OPTIONAL). Publish
    // = "ship what you see" = the current working version = `latest`. If a
    // user wants to publish a stable older version, they can roll back via
    // the version history first; the publish action itself should always
    // mirror the visible button promise.
    const landing = artifacts.landing_page?.latest;
    if (!landing) throw new Error("Generate a Landing Page first.");

    const random = Math.random().toString(36).slice(2, 8);
    const slug = `l-${random}-v${landing.version}`;
    const snapshot = buildArtifactSnapshot();
    // Day 62 (Sasha 2026-05-05) BUG FIX — second source-of-truth mismatch.
    // `buildArtifactSnapshot()` uses `latestLocked ?? latest` for every key
    // (correct for sibling artifacts, which are CONTEXT for this publish).
    // But the `landing_page` row inside the snapshot IS what
    // PublicLandingPage actually renders — so it must mirror what we
    // promised in the URL slug, not the older locked version. Without this
    // override, the slug correctly said "v7" but PublicLandingPage kept
    // showing the locked v3 content because the snapshot still pulled v3.
    // Override only the landing_page row with the same `landing` we used
    // for the slug — sibling artifacts retain their locked-preferred
    // semantics for the dossier context.
    snapshot.landing_page = {
      version: landing.version,
      content: landing.content,
      specificity_score: landing.specificity_score,
    };

    const { data, error } = await (supabase as any)
      .from("unique_business_dossiers")
      .insert({
        user_id: userId,
        slug,
        title: "Landing Page",
        artifact_snapshot: snapshot,
        specificity_avg: derived.avgSpecificity,
        landing_page_version: `v${landing.version}`,
        landing_page_rendered_html: null,
        is_live: true,
      })
      .select("*")
      .single();

    if (error) throw error;
    toast.success(`Landing page v${landing.version} published.`);
    return {
      slug: data.slug,
      version: landing.version,
      rendered_html: "",
      published_at: data.published_at,
      is_live: true,
    };
  }, [userId, artifacts, buildArtifactSnapshot, derived.avgSpecificity]);

  const publishDossier = useCallback(async () => {
    if (!userId) throw new Error("Please sign in first.");
    const snapshot = buildArtifactSnapshot();
    if (Object.keys(snapshot).length === 0) throw new Error("Nothing to publish yet.");

    const random = Math.random().toString(36).slice(2, 8);
    const slug = `d-${random}`;

    const { data, error } = await (supabase as any)
      .from("unique_business_dossiers")
      .insert({
        user_id: userId,
        slug,
        title: "Unique Business Dossier",
        artifact_snapshot: snapshot,
        specificity_avg: derived.avgSpecificity,
        is_live: true,
      })
      .select("*")
      .single();

    if (error) throw error;
    toast.success(`Dossier published at /dossier/${data.slug}`);
    return { slug: data.slug };
  }, [userId, buildArtifactSnapshot, derived.avgSpecificity]);

  // ──────────────────────────────────────────────────────────────────────
  // Day 78 Phase 4b (Sasha 2026-05-29) — input-staleness overlay.
  //
  // `buildArtifactStates(rows)` computes prompt_changed + parent_relocked
  // from row data only. The third axis — input_changed — needs the current
  // rootContext (mission, assets, ZoG) which lives in component state, so
  // it can't live inside that pure function. This useMemo overlays it on
  // top, with priority slotting between prompt_changed (1) and
  // parent_relocked (3).
  //
  // Per-artifact rules:
  //   • prompt_changed already set on s → leave alone (priority 1 wins).
  //   • lockedInputVer is NULL → legacy row, treat as "unknown", no flag
  //     (same convention as Phase 2 used for prompt_version_at_lock).
  //   • currentInputVer differs from lockedInputVer → set input_changed,
  //     overriding any parent_relocked the base pass set (priority 2 > 3).
  //   • Otherwise → leave whatever base set (parent_relocked or nothing).
  //
  // Gated on isInitializing: while the four async fetches (zog, mission,
  // assets, artifacts) are still in flight, rootContext is transiently
  // empty, which would produce false input_changed flags on every locked
  // artifact. Phase 4b waits for initialization to complete before
  // applying the axis.
  // ──────────────────────────────────────────────────────────────────────
  const artifactsWithStaleness = useMemo(() => {
    if (isInitializing) return artifacts;
    const next: Partial<Record<ArtifactKey, ArtifactState>> = {};
    const rc = rootContext as RootContextShape;
    for (const key of ALL_ARTIFACT_KEYS) {
      const s = artifacts[key];
      if (!s) continue;
      // Skip artifacts that aren't locked (no input_version_at_lock to compare)
      // or that prompt_changed has already claimed (priority 1 wins).
      if (!s.latestLocked || s.stalenessSource?.type === "prompt_changed") {
        next[key] = s;
        continue;
      }
      const lockedInputVer = s.latestLocked.input_version_at_lock;
      const currentInputVer = inputVersionHash(rc, key);
      if (lockedInputVer != null && currentInputVer && lockedInputVer !== currentInputVer) {
        next[key] = {
          ...s,
          isStale: true,
          staleReason: "Mission/assets updated since you locked this — re-Improve to refresh.",
          stalenessSource: {
            type: "input_changed",
            lockedVersion: lockedInputVer,
            currentVersion: currentInputVer,
          },
        };
        continue;
      }
      next[key] = s;
    }
    return next;
  }, [artifacts, rootContext, isInitializing]);

  const stalenessWarnings = useMemo(() => {
    return Object.values(artifactsWithStaleness)
      .filter((s): s is ArtifactState => !!s && s.isStale)
      .map((s) => ({ artifact: s.key, reason: s.staleReason || "stale" }));
  }, [artifactsWithStaleness]);

  const value: UniqueBusinessContextType = {
    artifacts: artifactsWithStaleness,
    versionHistory,
    pendingImprovement,
    isImproving,
    isGenerating,
    isInitializing,
    bulkImprove,
    lockedCascadePrompt,
    lockedCount: derived.lockedCount,
    unlockedCount: derived.unlockedCount,
    avgSpecificity: derived.avgSpecificity,
    stalenessWarnings,
    dossier,
    generateArtifact,
    improveArtifact,
    acceptImprovement,
    rejectImprovement,
    lockArtifact,
    unlockArtifact,
    loadVersionHistory,
    publishLandingPage,
    publishDossier,
    updateArtifactScore,
    restoreToV1,
    startBulkImprove,
    cancelBulkImprove,
    dismissLockedCascadePrompt,
  };

  return (
    <UniqueBusinessContext.Provider value={value}>
      {children}
    </UniqueBusinessContext.Provider>
  );
}

export function useUniqueBusiness(): UniqueBusinessContextType {
  const ctx = useContext(UniqueBusinessContext);
  if (!ctx) {
    throw new Error("useUniqueBusiness must be used within UniqueBusinessProvider");
  }
  return ctx;
}

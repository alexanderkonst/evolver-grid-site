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
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import type {
  ArtifactKey,
  ArtifactState,
  DossierSnapshot,
  GenerateResult,
  ImproveResult,
  LandingPagePublication,
  UniqueBusinessActions,
  UniqueBusinessState,
  VersionRow,
} from "./types";
import { ALL_ARTIFACT_KEYS } from "./types";
import { ERROR_MESSAGES, nextVersionString } from "./constants";

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
  // Compute staleness: an artifact is stale if any sibling was locked AFTER its latestLocked.created_at
  const lockTimes = Object.values(states)
    .map((s) => s?.latestLocked)
    .filter((x): x is VersionRow => !!x)
    .map((v) => new Date(v.created_at).getTime());
  const latestSiblingLock = lockTimes.length ? Math.max(...lockTimes) : 0;
  for (const s of Object.values(states)) {
    if (s?.latestLocked) {
      const myLock = new Date(s.latestLocked.created_at).getTime();
      if (myLock < latestSiblingLock - 60_000) {
        // 1-minute buffer to avoid false positives on fast sequential locks
        s.isStale = true;
        s.staleReason = "A sibling was locked more recently — consider Improving again.";
      }
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

  // Load user + ZoG + artifacts on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
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
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Realtime: when a new row arrives for this user, refresh that artifact's state
  useEffect(() => {
    if (!userId) return;
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
        async () => {
          // Reload on any change (simple + correct)
          const { data: rows } = await (supabase as any)
            .from("user_business_artifacts")
            .select("*")
            .eq("user_id", userId)
            .in("artifact_key", ALL_ARTIFACT_KEYS as unknown as string[]);
          setArtifacts(buildArtifactStates((rows || []) as DbRow[]));
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
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
    };
  }, [zogSnapshot, excaliburData]);

  // --- Actions ---

  const generateArtifact = useCallback(
    async (key: ArtifactKey) => {
      if (!userId) {
        toast.error("Please sign in first.");
        return;
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
        const { data: inserted, error: insertError } = await (supabase as any)
          .from("user_business_artifacts")
          .insert({
            user_id: userId,
            artifact_key: key,
            version: "v1",
            content_json: result.content,
            specificity_score: result.initial_specificity,
            step_number: 1,
            is_locked: false,
          })
          .select("*")
          .single();

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
    [userId, getSiblingContext, rootContext]
  );

  const improveArtifact = useCallback(
    async (key: ArtifactKey) => {
      if (!userId) return;
      const current = artifacts[key]?.latest;
      if (!current) {
        toast.error("Generate a first version before improving.");
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
    try {
      const { data: inserted, error: insertError } = await (supabase as any)
        .from("user_business_artifacts")
        .insert({
          user_id: userId,
          artifact_key,
          version: newVersion,
          content_json: result.improved_content,
          specificity_score: result.specificity_score,
          parent_version_id: current.id,
          roast_findings: result.roast_findings,
          what_changed: result.what_changed,
          step_number: current.version ? current.version + 1 : 1,
          is_locked: false,
        })
        .select("*")
        .single();
      if (insertError) throw insertError;

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
        specificity_after: result.specificity_score,
        specificity_delta: result.specificity_delta,
        accepted: true,
        diminishing_returns: false,
      });

      toast.success(`${artifact_key}: specificity +${result.specificity_delta.toFixed(1)}`);
    } catch (e: any) {
      console.error("acceptImprovement failed:", e);
      toast.error("Couldn't save the improvement. Please retry.");
    } finally {
      setPendingImprovement(null);
    }
  }, [pendingImprovement, userId, artifacts]);

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
      setPendingImprovement(null);
    }
  }, [pendingImprovement, userId, artifacts]);

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
    },
    [artifacts]
  );

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
    const landing = artifacts.landing_page?.latestLocked ?? artifacts.landing_page?.latest;
    if (!landing) throw new Error("Generate and lock a Landing Page first.");

    const random = Math.random().toString(36).slice(2, 8);
    const slug = `l-${random}-v${landing.version}`;
    const snapshot = buildArtifactSnapshot();

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

  const stalenessWarnings = useMemo(() => {
    return Object.values(artifacts)
      .filter((s): s is ArtifactState => !!s && s.isStale)
      .map((s) => ({ artifact: s.key, reason: s.staleReason || "stale" }));
  }, [artifacts]);

  const value: UniqueBusinessContextType = {
    artifacts,
    versionHistory,
    pendingImprovement,
    isImproving,
    isGenerating,
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

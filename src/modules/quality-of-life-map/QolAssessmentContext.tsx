import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DOMAINS, DomainId } from "./qolConfig";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";

export type Answers = Record<DomainId, number | null>;

/**
 * Issue #52 (Sasha 2026-10-15), item 11: a single prior QoL snapshot, used
 * to render the "earlier results" history on the Results page. `score` is the
 * average of the eight stage values (the same 0–10 figure the hero shows).
 */
export interface QolHistoryEntry {
  id: string;
  createdAt: string;
  score: number;
  answers: Answers;
}

interface QolAssessmentContextValue {
  answers: Answers;
  /** True when no one is signed in: answers live in this browser, nothing is written to the DB. */
  isGuest: boolean;
  setAnswer: (domainId: DomainId, stageId: number) => void;
  reset: () => void;
  isComplete: boolean;
  isLoading: boolean;
  /**
   * Issue #52 item 10: the `created_at` of the snapshot the current answers
   * were loaded from, so the PDF stamps the result's own date (not the export
   * date). Null while in-progress / unsaved.
   */
  snapshotCreatedAt: string | null;
  /**
   * Issue #52 item 11: all saved snapshots for this profile, newest first.
   * `[0]` is the one the current answers were loaded from; the rest are
   * earlier results shown as history.
   */
  history: QolHistoryEntry[];
}

interface QolSnapshotRow {
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
}

const rowToAnswers = (row: QolSnapshotRow): Answers => ({
  wealth: row.wealth_stage,
  health: row.health_stage,
  happiness: row.happiness_stage,
  love: row.love_relationships_stage,
  impact: row.impact_stage,
  growth: row.growth_stage,
  socialTies: row.social_ties_stage,
  home: row.home_stage,
});

const rowToScore = (row: QolSnapshotRow): number => {
  const stages = [
    row.wealth_stage,
    row.health_stage,
    row.happiness_stage,
    row.love_relationships_stage,
    row.impact_stage,
    row.growth_stage,
    row.social_ties_stage,
    row.home_stage,
  ];
  return stages.reduce((sum, v) => sum + (v ?? 0), 0) / stages.length;
};

/**
 * Guest QoL (Sasha 2026-10-29: the test is shared with coaches' clients, so it must be
 * non-gated and invite to save). A guest's answers live in this browser; after sign-in
 * they are adopted once (newer than any DB snapshot) and the Results page saves them.
 */
export const GUEST_QOL_KEY = "evolver:guest-qol:v1";
const readGuestAnswers = (): Partial<Answers> | null => {
  try {
    const raw = window.localStorage.getItem(GUEST_QOL_KEY);
    return raw ? (JSON.parse(raw) as Partial<Answers>) : null;
  } catch {
    return null;
  }
};

const QolAssessmentContext = createContext<QolAssessmentContextValue | undefined>(undefined);

const createInitialAnswers = (): Answers => {
  const initial: Partial<Answers> = {};
  DOMAINS.forEach((domain) => {
    initial[domain.id] = null;
  });
  return initial as Answers;
};

export const QolAssessmentProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<Answers>(createInitialAnswers());
  const [isLoading, setIsLoading] = useState(true);
  const [snapshotCreatedAt, setSnapshotCreatedAt] = useState<string | null>(null);
  const [history, setHistory] = useState<QolHistoryEntry[]>([]);
  const [isGuest, setIsGuest] = useState(false);

  // Guest: keep answers in this browser so a refresh or the magic-link return keeps them.
  useEffect(() => {
    if (!isGuest || isLoading) return;
    try {
      window.localStorage.setItem(GUEST_QOL_KEY, JSON.stringify(answers));
    } catch {
      /* private mode */
    }
  }, [answers, isGuest, isLoading]);
  const location = useLocation();

  // Load saved QoL data from database on mount.
  //
  // Day 63 (Sasha 2026-05-06): two changes to the original.
  //
  // (1) `?fresh=true` URL param skips the DB load. Without this, the
  // "Retake" button on the Results page silently reverted: reset()
  // cleared local answers, navigation moved to /assessment, but on
  // any provider remount (refresh, navigation back from outside
  // QolLayout) the load effect re-fired and re-populated the answers
  // from the most recent saved snapshot — making "Retake" a lie.
  // Now: handleRetake navigates with `?fresh=true`, the load is
  // skipped, the user genuinely retakes.
  //
  // (2) The previously silent catch now console.warns. Returning users
  // whose saved data fails to load (network, RLS, etc.) silently
  // started fresh with zero observability. Logging surfaces the
  // failure without changing user-visible behavior (still falls
  // through to empty answers — the existing graceful-degradation
  // contract is preserved).
  //
  // Deps array intentionally empty: we want the load to fire once per
  // provider mount with the URL captured at mount time. Subsequent
  // URL changes within the same mount don't re-trigger (which would
  // clobber in-progress answers).
  useEffect(() => {
    const isFresh = new URLSearchParams(location.search).get("fresh") === "true";
    if (isFresh) {
      try {
        window.localStorage.removeItem(GUEST_QOL_KEY);
      } catch {
        /* ignore */
      }
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          if (!session?.user?.id) setIsGuest(true);
        })
        .finally(() => setIsLoading(false));
      return;
    }

    const loadFromDatabase = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const guestAnswers = readGuestAnswers();
        const guestComplete =
          !!guestAnswers && DOMAINS.every((d) => typeof guestAnswers[d.id] === "number");
        if (!session?.user?.id) {
          setIsGuest(true);
          if (guestAnswers) setAnswers({ ...createInitialAnswers(), ...guestAnswers });
          return;
        }
        if (guestComplete) {
          // Just signed in from the guest save card: the guest result is the newest.
          setAnswers({ ...createInitialAnswers(), ...guestAnswers });
          try {
            window.localStorage.removeItem(GUEST_QOL_KEY);
          } catch {
            /* ignore */
          }
        }
        const profileId = await getOrCreateGameProfileId();

        // Issue #52 (Sasha 2026-10-15), item 11: select the MOST RECENT
        // snapshot by created_at, not whatever `last_qol_snapshot_id` points
        // at. A stale pointer (e.g. a pre-fix row, or a save whose pointer
        // update didn't land) made this page show an OLDER result than the
        // one the user just took. Ordering by created_at is authoritative; we
        // then heal the pointer to the newest so every pointer-based surface
        // (CharacterHub, GameHome, etc.) self-corrects too.
        //
        // This supersedes the Day 64 pointer-first / heal-on-read pattern:
        // reading all rows for the profile directly also recovers orphaned
        // snapshots (pointer null) without a separate fallback query.
        const { data: rows } = await supabase
          .from("qol_snapshots")
          .select(
            "id, created_at, wealth_stage, health_stage, happiness_stage, love_relationships_stage, impact_stage, growth_stage, social_ties_stage, home_stage"
          )
          .eq("profile_id", profileId)
          .order("created_at", { ascending: false });

        const snapshots = (rows ?? []) as QolSnapshotRow[];

        if (snapshots.length > 0) {
          const latest = snapshots[0];
          if (!guestComplete) setAnswers(rowToAnswers(latest));
          setSnapshotCreatedAt(latest.created_at);
          setHistory(
            snapshots.map((row) => ({
              id: row.id,
              createdAt: row.created_at,
              score: rowToScore(row),
              answers: rowToAnswers(row),
            }))
          );

          // Best-effort heal — point game_profiles at the newest snapshot so
          // every pointer-based reader shows the latest. Only write when it's
          // actually stale, to avoid a needless update on every load.
          try {
            const { data: profile } = await supabase
              .from("game_profiles")
              .select("last_qol_snapshot_id")
              .eq("id", profileId)
              .maybeSingle();
            if (profile && profile.last_qol_snapshot_id !== latest.id) {
              await supabase
                .from("game_profiles")
                .update({ last_qol_snapshot_id: latest.id, updated_at: new Date().toISOString() })
                .eq("id", profileId);
              console.info("[QoL] Healed last_qol_snapshot_id → newest snapshot for profile", profileId);
            }
          } catch (healErr) {
            console.warn("[QoL] Snapshot loaded but pointer heal failed:", healErr);
          }
        }
      } catch (err) {
        console.warn("[QoL] Failed to load saved data:", err);
        // Falls through to empty answers — graceful degradation preserved.
      } finally {
        setIsLoading(false);
      }
    };
    loadFromDatabase();
  }, []);

  const setAnswer = (domainId: DomainId, stageId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [domainId]: stageId,
    }));
  };

  const reset = () => {
    setAnswers(createInitialAnswers());
  };

  const isComplete = useMemo(() => {
    return Object.values(answers).every((value) => value !== null);
  }, [answers]);

  const value = {
    answers,
    setAnswer,
    reset,
    isComplete,
    isLoading,
    snapshotCreatedAt,
    history,
    isGuest,
  };

  return (
    <QolAssessmentContext.Provider value={value}>
      {children}
    </QolAssessmentContext.Provider>
  );
};

export function useQolAssessment() {
  const context = useContext(QolAssessmentContext);
  if (context === undefined) {
    throw new Error("useQolAssessment must be used within a QolAssessmentProvider");
  }
  return context;
}


import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DOMAINS, DomainId } from "./qolConfig";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";

export type Answers = Record<DomainId, number | null>;

interface QolAssessmentContextValue {
  answers: Answers;
  setAnswer: (domainId: DomainId, stageId: number) => void;
  reset: () => void;
  isComplete: boolean;
  isLoading: boolean;
}

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
      setIsLoading(false);
      return;
    }

    const loadFromDatabase = async () => {
      try {
        const profileId = await getOrCreateGameProfileId();

        // Day 64 evening (Sasha 2026-05-07): heal-on-read pattern per
        // decision_log D-2026-05-06 (the same pattern applied to
        // last_zog_snapshot_id Day 61-62). Two-step:
        //   (a) Read game_profiles.last_qol_snapshot_id (the canonical
        //       pointer). If set, load that specific snapshot.
        //   (b) FALLBACK: if pointer is null but a snapshot exists for
        //       this profile_id (orphaned data), load the most recent
        //       one AND heal the pointer (write back to game_profiles)
        //       so future visits skip the fallback.
        //
        // Why: today's bug — the pointer-update was gated inside
        // `if (xpResult.success)` in saveSnapshotToDatabase. Any XP
        // failure orphaned the user's snapshot. Sasha hit this:
        // completed the assessment, came back to /results, saw the
        // empty state. Snapshot was in qol_snapshots but the pointer
        // was null. Fix above (in saveSnapshotToDatabase) ungates the
        // pointer update for new saves. This heal-on-read recovers
        // existing orphaned data without forcing a retake.
        const { data: profile } = await supabase
          .from("game_profiles")
          .select("last_qol_snapshot_id")
          .eq("id", profileId)
          .maybeSingle();

        let snapshotData: {
          wealth_stage: number;
          health_stage: number;
          happiness_stage: number;
          love_relationships_stage: number;
          impact_stage: number;
          growth_stage: number;
          social_ties_stage: number;
          home_stage: number;
        } | null = null;

        if (profile?.last_qol_snapshot_id) {
          const { data: snapshot } = await supabase
            .from("qol_snapshots")
            .select("wealth_stage, health_stage, happiness_stage, love_relationships_stage, impact_stage, growth_stage, social_ties_stage, home_stage")
            .eq("id", profile.last_qol_snapshot_id)
            .maybeSingle();
          snapshotData = snapshot;
        }

        // Heal-on-read fallback. If the pointer was null OR the
        // pointed-to row didn't load, look up the most recent snapshot
        // for this profile_id directly. If found, also heal the
        // pointer so the next read takes the fast path.
        if (!snapshotData) {
          const { data: orphaned } = await supabase
            .from("qol_snapshots")
            .select("id, wealth_stage, health_stage, happiness_stage, love_relationships_stage, impact_stage, growth_stage, social_ties_stage, home_stage")
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (orphaned) {
            snapshotData = orphaned;
            // Best-effort heal — write the pointer back. If this fails,
            // the user still gets their data; next visit just runs the
            // fallback again.
            try {
              await supabase
                .from("game_profiles")
                .update({ last_qol_snapshot_id: orphaned.id, updated_at: new Date().toISOString() })
                .eq("id", profileId);
              console.info("[QoL] Healed orphaned snapshot pointer for profile", profileId);
            } catch (healErr) {
              console.warn("[QoL] Snapshot recovered but pointer heal failed:", healErr);
            }
          }
        }

        if (snapshotData) {
          setAnswers({
            wealth: snapshotData.wealth_stage,
            health: snapshotData.health_stage,
            happiness: snapshotData.happiness_stage,
            love: snapshotData.love_relationships_stage,
            impact: snapshotData.impact_stage,
            growth: snapshotData.growth_stage,
            socialTies: snapshotData.social_ties_stage,
            home: snapshotData.home_stage,
          });
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


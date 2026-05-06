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

        // Get the profile's last QoL snapshot
        const { data: profile } = await supabase
          .from("game_profiles")
          .select("last_qol_snapshot_id")
          .eq("id", profileId)
          .maybeSingle();

        if (profile?.last_qol_snapshot_id) {
          const { data: snapshot } = await supabase
            .from("qol_snapshots")
            .select("wealth_stage, health_stage, happiness_stage, love_relationships_stage, impact_stage, growth_stage, social_ties_stage, home_stage")
            .eq("id", profile.last_qol_snapshot_id)
            .maybeSingle();

          if (snapshot) {
            setAnswers({
              wealth: snapshot.wealth_stage,
              health: snapshot.health_stage,
              happiness: snapshot.happiness_stage,
              love: snapshot.love_relationships_stage,
              impact: snapshot.impact_stage,
              growth: snapshot.growth_stage,
              socialTies: snapshot.social_ties_stage,
              home: snapshot.home_stage,
            });
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


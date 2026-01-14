import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
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

  // Load saved QoL data from database on mount
  useEffect(() => {
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
      } catch {
        // Silently fail - will use empty answers
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


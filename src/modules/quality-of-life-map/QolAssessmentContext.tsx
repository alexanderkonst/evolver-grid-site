import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { DOMAINS, DomainId } from "./qolConfig";

export type Answers = Record<DomainId, number | null>;

interface QolAssessmentContextValue {
  answers: Answers;
  setAnswer: (domainId: DomainId, stageId: number) => void;
  reset: () => void;
  isComplete: boolean;
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

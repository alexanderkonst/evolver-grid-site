import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ZoneOfGeniusContextType {
  yesTalentIds: number[];
  setYesTalentIds: (ids: number[]) => void;
  selectedTop10TalentIds: number[];
  setSelectedTop10TalentIds: (ids: number[]) => void;
  top3CoreTalentIds: number[];
  setTop3CoreTalentIds: (ids: number[]) => void;
  orderedTalentIds: number[];
  setOrderedTalentIds: (ids: number[]) => void;
  llmResult: string | null;
  setLlmResult: (result: string | null) => void;
  snapshotMarkdown: string | null;
  setSnapshotMarkdown: (markdown: string | null) => void;
  resetAssessment: () => void;
}

const ZoneOfGeniusContext = createContext<ZoneOfGeniusContextType | undefined>(undefined);

export const ZoneOfGeniusProvider = ({ children }: { children: ReactNode }) => {
  const [yesTalentIds, setYesTalentIds] = useState<number[]>([]);
  const [selectedTop10TalentIds, setSelectedTop10TalentIds] = useState<number[]>([]);
  const [top3CoreTalentIds, setTop3CoreTalentIds] = useState<number[]>([]);
  const [orderedTalentIds, setOrderedTalentIds] = useState<number[]>([]);
  const [llmResult, setLlmResult] = useState<string | null>(null);
  const [snapshotMarkdown, setSnapshotMarkdown] = useState<string | null>(null);

  const resetAssessment = () => {
    setYesTalentIds([]);
    setSelectedTop10TalentIds([]);
    setTop3CoreTalentIds([]);
    setOrderedTalentIds([]);
    setLlmResult(null);
    setSnapshotMarkdown(null);
  };

  return (
    <ZoneOfGeniusContext.Provider
      value={{
        yesTalentIds,
        setYesTalentIds,
        selectedTop10TalentIds,
        setSelectedTop10TalentIds,
        top3CoreTalentIds,
        setTop3CoreTalentIds,
        orderedTalentIds,
        setOrderedTalentIds,
        llmResult,
        setLlmResult,
        snapshotMarkdown,
        setSnapshotMarkdown,
        resetAssessment,
      }}
    >
      {children}
    </ZoneOfGeniusContext.Provider>
  );
};

export const useZoneOfGenius = () => {
  const context = useContext(ZoneOfGeniusContext);
  if (context === undefined) {
    throw new Error('useZoneOfGenius must be used within a ZoneOfGeniusProvider');
  }
  return context;
};

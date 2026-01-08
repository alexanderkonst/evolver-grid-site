import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PILLARS } from "@/modules/mission-discovery/data/pillars";
import { FOCUS_AREAS } from "@/modules/mission-discovery/data/focusAreas";
import { KEY_CHALLENGES } from "@/modules/mission-discovery/data/challenges";
import { DESIRED_OUTCOMES } from "@/modules/mission-discovery/data/outcomes";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";
import type { MissionPillar, MissionFocusArea, MissionKeyChallenge, MissionDesiredOutcome, Mission } from "@/modules/mission-discovery/types";

interface SelectionColumnProps {
    title: string;
    description: string;
    items: { id: string; title: string; description?: string }[];
    selectedId?: string;
    onSelect: (id: string) => void;
    disabled?: boolean;
}

const SelectionColumn = ({ title, description, items, selectedId, onSelect, disabled }: SelectionColumnProps) => (
    <div className={`bg-slate-50 rounded-xl p-3 sm:p-4 ${disabled ? "opacity-50" : ""}`}>
        <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">{title}</h3>
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{description}</p>
        <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
            {items.length === 0 && (
                <p className="text-sm text-slate-400 italic">Select from previous column first</p>
            )}
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => !disabled && onSelect(item.id)}
                    disabled={disabled}
                    className={`
              w-full text-left px-3 py-3 rounded-lg text-sm transition-colors min-h-[44px]
              ${selectedId === item.id
                            ? "bg-blue-500 text-white"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                        }
              ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
            `}
                >
                    {item.title}
                </button>
            ))}
        </div>
    </div>
);

const MissionDiscoveryWizard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnPath = searchParams.get("return") || "/game/profile";

    // Selection state
    const [selectedPillarId, setSelectedPillarId] = useState<string | undefined>();
    const [selectedFocusAreaId, setSelectedFocusAreaId] = useState<string | undefined>();
    const [selectedChallengeId, setSelectedChallengeId] = useState<string | undefined>();
    const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | undefined>();
    const [selectedMissionId, setSelectedMissionId] = useState<string | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    // Filtered data based on selections
    const focusAreas = useMemo(() =>
        selectedPillarId ? FOCUS_AREAS.filter(fa => fa.pillarId === selectedPillarId) : [],
        [selectedPillarId]
    );

    const challenges = useMemo(() =>
        selectedFocusAreaId ? KEY_CHALLENGES.filter(c => c.focusAreaId === selectedFocusAreaId) : [],
        [selectedFocusAreaId]
    );

    const outcomes = useMemo(() =>
        selectedChallengeId ? DESIRED_OUTCOMES.filter(o => o.challengeId === selectedChallengeId) : [],
        [selectedChallengeId]
    );

    const missions = useMemo(() =>
        selectedOutcomeId ? MISSIONS.filter(m => m.outcomeId === selectedOutcomeId) : [],
        [selectedOutcomeId]
    );

    const selectedMission = useMemo(() =>
        selectedMissionId ? MISSIONS.find(m => m.id === selectedMissionId) : undefined,
        [selectedMissionId]
    );

    // Handle selection changes - clear downstream selections
    const handlePillarSelect = (id: string) => {
        setSelectedPillarId(id);
        setSelectedFocusAreaId(undefined);
        setSelectedChallengeId(undefined);
        setSelectedOutcomeId(undefined);
        setSelectedMissionId(undefined);
    };

    const handleFocusAreaSelect = (id: string) => {
        setSelectedFocusAreaId(id);
        setSelectedChallengeId(undefined);
        setSelectedOutcomeId(undefined);
        setSelectedMissionId(undefined);
    };

    const handleChallengeSelect = (id: string) => {
        setSelectedChallengeId(id);
        setSelectedOutcomeId(undefined);
        setSelectedMissionId(undefined);
    };

    const handleOutcomeSelect = (id: string) => {
        setSelectedOutcomeId(id);
        setSelectedMissionId(undefined);
    };

    const handleMissionSelect = (id: string) => {
        setSelectedMissionId(id);
    };

    const { toast } = useToast();

    const handleSaveMission = async () => {
        if (!selectedMission || !selectedPillarId || !selectedFocusAreaId || !selectedChallengeId || !selectedOutcomeId) return;
        setIsSaving(true);

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({
                    title: "Please sign in",
                    description: "You need to be signed in to commit to a mission.",
                    variant: "destructive",
                });
                setIsSaving(false);
                return;
            }

            // Build mission context for clear articulation
            const pillar = PILLARS.find(p => p.id === selectedPillarId);
            const focusArea = FOCUS_AREAS.find(fa => fa.id === selectedFocusAreaId);
            const challenge = KEY_CHALLENGES.find(c => c.id === selectedChallengeId);
            const outcome = DESIRED_OUTCOMES.find(o => o.id === selectedOutcomeId);

            const missionCommitment = {
                mission_id: selectedMission.id,
                pillar: pillar?.title,
                focus_area: focusArea?.title,
                challenge: challenge?.title,
                outcome: outcome?.title,
                mission_title: selectedMission.title,
                mission_statement: selectedMission.statement,
                committed_at: new Date().toISOString(),
            };

            // Save to localStorage until DB migration is added
            // Key format: mission_commitment_{userId}
            localStorage.setItem(
                `mission_commitment_${user.id}`,
                JSON.stringify(missionCommitment)
            );

            // Show success toast with clear articulation
            toast({
                title: "🎯 Mission Committed!",
                description: `You're now committed to: ${selectedMission.title}`,
            });

            setIsSaving(false);
            navigate(returnPath);
        } catch (err) {
            console.error("Error:", err);
            toast({
                title: "Something went wrong",
                description: "Please try again.",
                variant: "destructive",
            });
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Button variant="ghost" size="sm" onClick={() => navigate(returnPath)} className="shrink-0">
                                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Back</span>
                            </Button>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900">Mission Discovery</h1>
                                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Find your contribution to the planet</p>
                            </div>
                        </div>
                        {selectedMission && (
                            <Button onClick={handleSaveMission} disabled={isSaving} className="w-full sm:w-auto">
                                {isSaving ? "Committing..." : "Commit to this Mission"}
                                <Check className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Top Row: 4 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <SelectionColumn
                        title="Select a Pillar"
                        description="Choose one of the pillars to explore"
                        items={PILLARS.map(p => ({ id: p.id, title: p.title }))}
                        selectedId={selectedPillarId}
                        onSelect={handlePillarSelect}
                    />
                    <SelectionColumn
                        title="Select a Focus Area"
                        description={selectedPillarId ? `Choose a focus area within the ${PILLARS.find(p => p.id === selectedPillarId)?.title}` : "First select a pillar"}
                        items={focusAreas.map(fa => ({ id: fa.id, title: fa.title }))}
                        selectedId={selectedFocusAreaId}
                        onSelect={handleFocusAreaSelect}
                        disabled={!selectedPillarId}
                    />
                    <SelectionColumn
                        title="Select a Challenge"
                        description="Choose a key challenge within the selected focus area"
                        items={challenges.map(c => ({ id: c.id, title: c.title }))}
                        selectedId={selectedChallengeId}
                        onSelect={handleChallengeSelect}
                        disabled={!selectedFocusAreaId}
                    />
                    <SelectionColumn
                        title="Select a Desired Outcome"
                        description="Choose an Integral Development Goal (IDG)"
                        items={outcomes.map(o => ({ id: o.id, title: o.title }))}
                        selectedId={selectedOutcomeId}
                        onSelect={handleOutcomeSelect}
                        disabled={!selectedChallengeId}
                    />
                </div>

                {/* Bottom Row: Mission Selection + Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Mission List */}
                    <div className="bg-slate-50 rounded-xl p-4">
                        <h3 className="font-semibold text-slate-900 mb-1">Select a Mission</h3>
                        <p className="text-xs text-slate-500 mb-3">Choose a mission associated with the selected outcome</p>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {missions.length === 0 && (
                                <p className="text-sm text-slate-400 italic">Complete selections above first</p>
                            )}
                            {missions.map((mission) => (
                                <button
                                    key={mission.id}
                                    onClick={() => handleMissionSelect(mission.id)}
                                    className={`
                    w-full text-left px-3 py-3 rounded-lg text-sm transition-colors
                    ${selectedMissionId === mission.id
                                            ? "bg-blue-500 text-white"
                                            : "bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                                        }
                  `}
                                >
                                    {mission.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mission Details */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Mission Details</h3>
                        {selectedMission ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-slate-700 leading-relaxed">{selectedMission.statement}</p>
                                </div>

                                {selectedMission.existingProjects && selectedMission.existingProjects.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-2">Existing Projects</h4>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                            {selectedMission.existingProjects.map((project, idx) => (
                                                <li key={idx}>{project}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2">Mission Chat</h4>
                                    {selectedMission.chatLink ? (
                                        <a
                                            href={selectedMission.chatLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            Join the conversation →
                                        </a>
                                    ) : (
                                        <p className="text-sm text-slate-400">No chat link available</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-48 text-slate-400">
                                <div className="text-center">
                                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>Select a mission to see details</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MissionDiscoveryWizard;

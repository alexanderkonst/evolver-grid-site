import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PILLARS } from "@/modules/mission-discovery/data/pillars";
import { FOCUS_AREAS } from "@/modules/mission-discovery/data/focusAreas";
import { KEY_CHALLENGES } from "@/modules/mission-discovery/data/challenges";
import { DESIRED_OUTCOMES } from "@/modules/mission-discovery/data/outcomes";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";
import CommitFlow from "@/modules/mission-discovery/components/CommitFlow";

interface SelectionColumnProps {
    title: string;
    description: string;
    items: { id: string; title: string; description?: string }[];
    selectedId?: string;
    onSelect: (id: string) => void;
    disabled?: boolean;
    readOnly?: boolean;
}

const SelectionColumn = ({ title, description, items, selectedId, onSelect, disabled, readOnly }: SelectionColumnProps) => (
    <div className={`bg-slate-50 rounded-xl p-3 sm:p-4 ${disabled ? "opacity-50" : ""} ${readOnly ? "pointer-events-none" : ""}`}>
        <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">{title}</h3>
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{description}</p>
        <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
            {items.length === 0 && (
                <p className="text-sm text-slate-400 italic">Select from previous column first</p>
            )}
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => !disabled && !readOnly && onSelect(item.id)}
                    disabled={disabled || readOnly}
                    className={`
              w-full text-left px-3 py-3 rounded-lg text-sm transition-colors min-h-[44px]
              ${selectedId === item.id
                            ? "bg-blue-500 text-white"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                        }
              ${(disabled || readOnly) ? "cursor-not-allowed" : "cursor-pointer"}
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
    const missionIdParam = searchParams.get("missionId");
    const readOnlyParam = searchParams.get("readOnly") === "true";
    const directCommitParam = searchParams.get("directCommit") === "true";

    // Selection state
    const [selectedPillarId, setSelectedPillarId] = useState<string | undefined>();
    const [selectedFocusAreaId, setSelectedFocusAreaId] = useState<string | undefined>();
    const [selectedChallengeId, setSelectedChallengeId] = useState<string | undefined>();
    const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | undefined>();
    const [selectedMissionId, setSelectedMissionId] = useState<string | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    // Mode state
    const [isReadOnly, setIsReadOnly] = useState(readOnlyParam);
    const [hasCommitted, setHasCommitted] = useState(false);
    const preselectAppliedRef = useRef(false);

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

    // Build mission context for CommitFlow
    const missionContext = useMemo(() => {
        const pillar = selectedPillarId ? PILLARS.find(p => p.id === selectedPillarId) : undefined;
        const focusArea = selectedFocusAreaId ? FOCUS_AREAS.find(fa => fa.id === selectedFocusAreaId) : undefined;
        const challenge = selectedChallengeId ? KEY_CHALLENGES.find(c => c.id === selectedChallengeId) : undefined;
        const outcome = selectedOutcomeId ? DESIRED_OUTCOMES.find(o => o.id === selectedOutcomeId) : undefined;

        return {
            pillarId: selectedPillarId,
            focusAreaId: selectedFocusAreaId,
            challengeId: selectedChallengeId,
            outcomeId: selectedOutcomeId,
            pillar: pillar?.title,
            focusArea: focusArea?.title,
            challenge: challenge?.title,
            outcome: outcome?.title,
        };
    }, [selectedPillarId, selectedFocusAreaId, selectedChallengeId, selectedOutcomeId]);

    useEffect(() => {
        if (!missionIdParam || preselectAppliedRef.current) return;
        const mission = MISSIONS.find(m => m.id === missionIdParam);
        if (!mission) return;
        const outcome = DESIRED_OUTCOMES.find(o => o.id === mission.outcomeId);
        const challenge = outcome ? KEY_CHALLENGES.find(c => c.id === outcome.challengeId) : undefined;
        const focusArea = challenge ? FOCUS_AREAS.find(f => f.id === challenge.focusAreaId) : undefined;
        const pillar = focusArea ? PILLARS.find(p => p.id === focusArea.pillarId) : undefined;

        if (pillar?.id) setSelectedPillarId(pillar.id);
        if (focusArea?.id) setSelectedFocusAreaId(focusArea.id);
        if (challenge?.id) setSelectedChallengeId(challenge.id);
        if (outcome?.id) setSelectedOutcomeId(outcome.id);
        setSelectedMissionId(mission.id);
        preselectAppliedRef.current = true;

        // If directCommit, immediately commit the mission
        if (directCommitParam) {
            // Delay to allow state to settle
            setTimeout(() => handleSaveMission(), 100);
        }
    }, [missionIdParam, directCommitParam]);

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
            if (!user.email) {
                toast({
                    title: "Missing email",
                    description: "Please add an email address to save your mission.",
                    variant: "destructive",
                });
                setIsSaving(false);
                return;
            }

            // Build mission commitment
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

            const baseParticipant = {
                user_id: user.id,
                email: user.email,
                first_name: user.user_metadata?.first_name || null,
                mission_id: selectedMission.id,
                mission_title: selectedMission.title,
                outcome_id: selectedOutcomeId,
                challenge_id: selectedChallengeId,
                focus_area_id: selectedFocusAreaId,
                pillar_id: selectedPillarId,
            };

            const { data: existingParticipant } = await supabase
                .from("mission_participants")
                .select("id")
                .eq("user_id", user.id)
                .eq("mission_id", selectedMission.id)
                .maybeSingle();

            if (existingParticipant?.id) {
                const { error: updateError } = await supabase
                    .from("mission_participants")
                    .update(baseParticipant)
                    .eq("id", existingParticipant.id);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("mission_participants")
                    .insert(baseParticipant);
                if (insertError) throw insertError;
            }

            localStorage.setItem(
                `mission_commitment_${user.id}`,
                JSON.stringify(missionCommitment)
            );

            setIsSaving(false);
            setHasCommitted(true);
        } catch (err) {
            toast({
                title: "Something went wrong",
                description: "Please try again.",
                variant: "destructive",
            });
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        // Go back to mission list, not to game
        navigate(`/mission-discovery?return=${encodeURIComponent(returnPath)}`);
    };

    const handleAddSubMissions = () => {
        navigate(`/mission-discovery/wizard?from=game&return=${encodeURIComponent(returnPath)}&addSubMission=true`);
    };

    // Show CommitFlow after successful commit
    if (hasCommitted && selectedMission) {
        return (
            <div className="min-h-dvh bg-white">
                <CommitFlow
                    mission={selectedMission}
                    missionContext={missionContext}
                    returnPath={returnPath}
                    onAddSubMissions={handleAddSubMissions}
                />
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-white">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBack}
                                className="shrink-0 ring-2 ring-slate-300/50 ring-offset-1"
                            >
                                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Back to mission list</span>
                            </Button>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                                    {isReadOnly ? "Mission Details" : "Mission Discovery"}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
                                    {isReadOnly ? "Review mission before committing" : "Find your contribution to the planet"}
                                </p>
                            </div>
                        </div>
                        {selectedMission && (
                            <Button
                                onClick={handleSaveMission}
                                disabled={isSaving}
                                className="w-full sm:w-auto ring-2 ring-emerald-400/50 ring-offset-2 bg-emerald-600 hover:bg-emerald-700"
                            >
                                {isSaving ? "Committing..." : "Commit and Add to my profile"}
                                <Check className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Wizard Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Read-only overlay info */}
                {isReadOnly && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                        You are viewing this mission in read-only mode. Use the buttons above to commit or go back.
                    </div>
                )}

                {/* Top Row: 4 Columns */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${isReadOnly ? "opacity-75" : ""}`}>
                    <SelectionColumn
                        title="Select a Pillar"
                        description="Choose one of the pillars to explore"
                        items={PILLARS.map(p => ({ id: p.id, title: p.title }))}
                        selectedId={selectedPillarId}
                        onSelect={handlePillarSelect}
                        readOnly={isReadOnly}
                    />
                    <SelectionColumn
                        title="Select a Focus Area"
                        description={selectedPillarId ? `Choose a focus area within the ${PILLARS.find(p => p.id === selectedPillarId)?.title}` : "First select a pillar"}
                        items={focusAreas.map(fa => ({ id: fa.id, title: fa.title }))}
                        selectedId={selectedFocusAreaId}
                        onSelect={handleFocusAreaSelect}
                        disabled={!selectedPillarId}
                        readOnly={isReadOnly}
                    />
                    <SelectionColumn
                        title="Select a Challenge"
                        description="Choose a key challenge within the selected focus area"
                        items={challenges.map(c => ({ id: c.id, title: c.title }))}
                        selectedId={selectedChallengeId}
                        onSelect={handleChallengeSelect}
                        disabled={!selectedFocusAreaId}
                        readOnly={isReadOnly}
                    />
                    <SelectionColumn
                        title="Select a Desired Outcome"
                        description="Choose an Integral Development Goal (IDG)"
                        items={outcomes.map(o => ({ id: o.id, title: o.title }))}
                        selectedId={selectedOutcomeId}
                        onSelect={handleOutcomeSelect}
                        disabled={!selectedChallengeId}
                        readOnly={isReadOnly}
                    />
                </div>

                {/* Bottom Row: Mission Selection + Details */}
                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${isReadOnly ? "opacity-75" : ""}`}>
                    {/* Mission List */}
                    <div className={`bg-slate-50 rounded-xl p-4 ${isReadOnly ? "pointer-events-none" : ""}`}>
                        <h3 className="font-semibold text-slate-900 mb-1">Select a Mission</h3>
                        <p className="text-xs text-slate-500 mb-3">Choose a mission associated with the selected outcome</p>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {missions.length === 0 && (
                                <p className="text-sm text-slate-400 italic">Complete selections above first</p>
                            )}
                            {missions.map((mission) => (
                                <button
                                    key={mission.id}
                                    onClick={() => !isReadOnly && handleMissionSelect(mission.id)}
                                    disabled={isReadOnly}
                                    className={`
                    w-full text-left px-3 py-3 rounded-lg text-sm transition-colors
                    ${selectedMissionId === mission.id
                                            ? "bg-blue-500 text-white"
                                            : "bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                                        }
                    ${isReadOnly ? "cursor-not-allowed" : "cursor-pointer"}
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

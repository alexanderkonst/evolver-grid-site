import { useEffect, useMemo, useRef, useState } from "react";
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
    const missionIdParam = searchParams.get("missionId");

    // Selection state
    const [selectedPillarId, setSelectedPillarId] = useState<string | undefined>();
    const [selectedFocusAreaId, setSelectedFocusAreaId] = useState<string | undefined>();
    const [selectedChallengeId, setSelectedChallengeId] = useState<string | undefined>();
    const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | undefined>();
    const [selectedMissionId, setSelectedMissionId] = useState<string | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    // Post-commit state
    const [hasCommitted, setHasCommitted] = useState(false);
    const [shareConsent, setShareConsent] = useState(false);
    const [wantsToLead, setWantsToLead] = useState(false);
    const [wantsToIntegrate, setWantsToIntegrate] = useState(false);
    const preselectAppliedRef = useRef(false);
    const [notifyLevel, setNotifyLevel] = useState<'mission' | 'outcome' | 'challenge' | 'focus'>('mission');
    const [emailFrequency, setEmailFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

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
    }, [missionIdParam]);

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
            setHasCommitted(true); // Show connection options instead of navigating
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

            {/* Success Screen with Connection Options */}
            {hasCommitted && selectedMission ? (
                <div className="max-w-2xl mx-auto px-4 py-12">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                            <Check className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Mission Committed!</h2>
                        <p className="text-slate-600 mb-4">{selectedMission.title}</p>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            {selectedMission.statement}
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 mb-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Connect with others on this mission</h3>

                        <div className="space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={shareConsent}
                                    onChange={(e) => setShareConsent(e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">
                                    Share my details with others on this mission so we can connect
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={wantsToLead}
                                    onChange={(e) => setWantsToLead(e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">
                                    I'd like to help lead this mission
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={wantsToIntegrate}
                                    onChange={(e) => setWantsToIntegrate(e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">
                                    I feel my role is to integrate everyone working on this mission
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Notification Preferences */}
                    <div className="bg-slate-50 rounded-xl p-6 mb-6">
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                            Notify me when someone new commits to...
                        </label>
                        <select
                            value={notifyLevel}
                            onChange={(e) => setNotifyLevel(e.target.value as typeof notifyLevel)}
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-4"
                        >
                            <option value="mission">This exact mission only</option>
                            <option value="outcome">Same desired outcome</option>
                            <option value="challenge">Same key challenge</option>
                            <option value="focus">Same focus area (most emails)</option>
                        </select>

                        <label className="block text-sm font-medium text-slate-900 mb-2">
                            How often?
                        </label>
                        <select
                            value={emailFrequency}
                            onChange={(e) => setEmailFrequency(e.target.value as typeof emailFrequency)}
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-2">
                            You'll be notified about new people who commit to the same mission.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            className="w-full"
                            onClick={() => {
                                // Save preferences to localStorage
                                const userId = localStorage.getItem('sb-user-id') || 'anonymous';
                                localStorage.setItem(`mission_connection_${userId}`, JSON.stringify({
                                    missionId: selectedMission.id,
                                    missionTitle: selectedMission.title,
                                    outcomeId: selectedOutcomeId,
                                    challengeId: selectedChallengeId,
                                    focusAreaId: selectedFocusAreaId,
                                    pillarId: selectedPillarId,
                                    shareConsent,
                                    wantsToLead,
                                    wantsToIntegrate,
                                    notifyLevel,
                                    emailFrequency,
                                    savedAt: new Date().toISOString(),
                                }));
                                toast({
                                    title: "Preferences saved!",
                                    description: shareConsent ? "We'll connect you with others soon." : "You can update these anytime.",
                                });
                                navigate(returnPath);
                            }}
                        >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Continue
                        </Button>

                        <p className="text-xs text-center text-slate-400">
                            You can always come back and change your mission or update these preferences.
                        </p>
                    </div>
                </div>
            ) : (
                /* Main Wizard Content */
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
            )}
        </div>
    );
};

export default MissionDiscoveryWizard;

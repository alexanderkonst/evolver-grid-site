import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Users, Bell, Layers, ArrowRight, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Mission } from "@/modules/mission-discovery/types";

type CommitStep = "celebration" | "connect" | "notifications" | "submissions";

interface CommitFlowProps {
    mission: Mission;
    missionContext: {
        pillarId?: string;
        focusAreaId?: string;
        challengeId?: string;
        outcomeId?: string;
        pillar?: string;
        focusArea?: string;
        challenge?: string;
        outcome?: string;
    };
    returnPath: string;
    onAddSubMissions: () => void;
}

const CommitFlow = ({ mission, missionContext, returnPath, onAddSubMissions }: CommitFlowProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [currentStep, setCurrentStep] = useState<CommitStep>("celebration");
    const [shareConsent, setShareConsent] = useState(false);
    const [wantsToLead, setWantsToLead] = useState(false);
    const [wantsToIntegrate, setWantsToIntegrate] = useState(false);
    const [wantsNotifications, setWantsNotifications] = useState(true);
    const [notifyLevel, setNotifyLevel] = useState<'mission' | 'outcome' | 'challenge' | 'focus'>('mission');
    const [isSaving, setIsSaving] = useState(false);

    const handleNextStep = () => {
        if (currentStep === "celebration") {
            setCurrentStep("connect");
        } else if (currentStep === "connect") {
            setCurrentStep("notifications");
        } else if (currentStep === "notifications") {
            setCurrentStep("submissions");
        }
    };

    const handleComplete = async (addSubMissions: boolean) => {
        setIsSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({
                    title: "Please sign in",
                    description: "You need to be signed in to save mission preferences.",
                    variant: "destructive",
                });
                setIsSaving(false);
                return;
            }

            const { error: updateError } = await supabase
                .from("mission_participants")
                .update({
                    share_consent: shareConsent,
                    wants_to_lead: wantsToLead,
                    wants_to_integrate: wantsToIntegrate,
                    notify_level: wantsNotifications ? notifyLevel : null,
                    email_frequency: wantsNotifications ? 'weekly' : null,
                })
                .eq("user_id", user.id)
                .eq("mission_id", mission.id);

            if (updateError) {
                console.error("Update error:", updateError);
            }

            localStorage.setItem(`mission_connection_${user.id}`, JSON.stringify({
                missionId: mission.id,
                missionTitle: mission.title,
                outcomeId: missionContext.outcomeId,
                challengeId: missionContext.challengeId,
                focusAreaId: missionContext.focusAreaId,
                pillarId: missionContext.pillarId,
                shareConsent,
                wantsToLead,
                wantsToIntegrate,
                notifyLevel: wantsNotifications ? notifyLevel : null,
                savedAt: new Date().toISOString(),
            }));

            toast({
                title: "Preferences saved!",
                description: shareConsent ? "We'll connect you with others soon." : "You can update these anytime.",
            });

            if (addSubMissions) {
                onAddSubMissions();
            } else {
                navigate(returnPath);
            }
        } catch (err) {
            console.error("Error:", err);
            toast({
                title: "Something went wrong",
                description: "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            {/* Step 1: Celebration */}
            {currentStep === "celebration" && (
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mb-6 animate-pulse">
                        <PartyPopper className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">You committed to this mission!</h2>
                    <p className="text-xl text-emerald-600 font-medium mb-2">{mission.title}</p>
                    <p className="text-slate-600 max-w-md mx-auto mb-8">
                        {mission.statement}
                    </p>

                    <Button
                        size="lg"
                        onClick={handleNextStep}
                        className="ring-2 ring-emerald-400/50 ring-offset-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                        Continue
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            )}

            {/* Step 2: Connect with others */}
            {currentStep === "connect" && (
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Would you like to connect with others on this same mission?
                        </h2>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 mb-6 space-y-4">
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

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleNextStep}
                        >
                            Skip
                        </Button>
                        <Button
                            onClick={handleNextStep}
                            className="flex-1 ring-2 ring-blue-400/50 ring-offset-2"
                        >
                            Continue
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Notifications */}
            {currentStep === "notifications" && (
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Would you like to be notified when someone new commits to this mission?
                        </h2>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 mb-6 space-y-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={wantsNotifications}
                                onChange={(e) => setWantsNotifications(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-sm text-slate-700">
                                Yes, notify me about new people joining this mission
                            </span>
                        </label>

                        {wantsNotifications && (
                            <div className="ml-8 space-y-3">
                                <label className="block text-sm font-medium text-slate-900">
                                    Notify me about people who commit to...
                                </label>
                                <select
                                    value={notifyLevel}
                                    onChange={(e) => setNotifyLevel(e.target.value as typeof notifyLevel)}
                                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                >
                                    <option value="mission">This exact mission only</option>
                                    <option value="outcome">Same desired outcome</option>
                                    <option value="challenge">Same key challenge</option>
                                    <option value="focus">Same focus area (most emails)</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleNextStep}
                        >
                            Skip
                        </Button>
                        <Button
                            onClick={handleNextStep}
                            className="flex-1 ring-2 ring-amber-400/50 ring-offset-2"
                        >
                            Continue
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 4: Sub-missions */}
            {currentStep === "submissions" && (
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Would you like to add sub-missions that contribute to this mission?
                        </h2>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6 mb-6 border border-purple-100">
                        <p className="text-sm text-slate-600 mb-4">
                            Some missions have modular parts. If your contribution involves multiple distinct sub-missions,
                            you can add them now to create a more complete picture of your work.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => handleComplete(true)}
                            disabled={isSaving}
                            className="w-full ring-2 ring-purple-400/50 ring-offset-2 bg-purple-600 hover:bg-purple-700"
                        >
                            Yes, add related sub-missions
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleComplete(false)}
                            disabled={isSaving}
                            className="w-full"
                        >
                            Not now, thank you
                        </Button>
                    </div>

                    <p className="text-xs text-center text-slate-400 mt-4">
                        You can always come back and add sub-missions later.
                    </p>
                </div>
            )}

            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mt-8">
                {(["celebration", "connect", "notifications", "submissions"] as CommitStep[]).map((step, i) => (
                    <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-colors ${
                            currentStep === step
                                ? "bg-slate-900"
                                : i < ["celebration", "connect", "notifications", "submissions"].indexOf(currentStep)
                                    ? "bg-slate-400"
                                    : "bg-slate-200"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommitFlow;

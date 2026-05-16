import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Bell, Layers, ArrowRight, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Mission } from "@/modules/mission-discovery/types";

// Day 65 wave 9 (Sasha 2026-05-15): editorial-register tokens
// mirroring ZoneOfGeniusOverview / QoL Results per ui_playbook.md.
const INK = "#0a1628";
const INK_BODY = "rgba(26,30,58,0.78)";
const HALO_SOFT =
    "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)";

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
                console.warn("[CommitFlow] mission_participants update failed:", updateError.message);
            }

            // Day 65 wave 8 (Sasha 2026-05-15): mark the JOURNEY item #8
            // ("Discover your mission") complete. Writes
            // `game_profiles.mission_discovered_at` the first time this
            // user commits to any mission. Idempotent — the
            // `.is("mission_discovered_at", null)` filter means only the
            // first commit lands the timestamp; subsequent commits to
            // different missions don't overwrite the original discovery
            // moment. Also stamps `mission_id` so the user's primary
            // mission is queryable directly from game_profiles.
            try {
                await (supabase as any)
                    .from("game_profiles")
                    .update({
                        mission_discovered_at: new Date().toISOString(),
                        mission_id: mission.id,
                    })
                    .eq("user_id", user.id)
                    .is("mission_discovered_at", null);
            } catch (err) {
                console.warn("[CommitFlow] mission_discovered_at update failed:", err);
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
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500 mb-6 animate-pulse">
                        <PartyPopper className="w-10 h-10 text-white" />
                    </div>
                    {/* Day 65 wave 9: editorial register on the celebration
                        headline — Cormorant Garamond hero + Source Serif
                        body, matching ZoneOfGeniusOverview. */}
                    <h2
                        className="leading-[1.15] tracking-[-0.01em] mb-3"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 700,
                            fontSize: "clamp(1.75rem, 4.5vw, 2.25rem)",
                            color: INK,
                            textShadow: HALO_SOFT,
                        }}
                    >
                        You committed to this mission!
                    </h2>
                    <p className="text-xl text-emerald-600 font-medium mb-2">{mission.title}</p>
                    <p
                        className="max-w-md mx-auto mb-8 italic leading-relaxed"
                        style={{
                            fontFamily: "'Source Serif 4', Georgia, serif",
                            fontWeight: 300,
                            color: INK_BODY,
                        }}
                    >
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
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">
                            Would you like to connect with others on this same mission?
                        </h2>
                    </div>

                    <div className="bg-muted/40 rounded-xl p-6 mb-6 space-y-4 border border-border">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={shareConsent}
                                onChange={(e) => setShareConsent(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-[#6894d0]"
                            />
                            <span className="text-sm text-foreground">
                                Share my details with others on this mission so we can connect
                            </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={wantsToLead}
                                onChange={(e) => setWantsToLead(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-[#6894d0]"
                            />
                            <span className="text-sm text-foreground">
                                I'd like to help lead this mission
                            </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={wantsToIntegrate}
                                onChange={(e) => setWantsToIntegrate(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-[#6894d0]"
                            />
                            <span className="text-sm text-foreground">
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
                            className="flex-1 ring-2 ring-[#6894d0]/50 ring-offset-2"
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
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">
                            Would you like to be notified when someone new commits to this mission?
                        </h2>
                    </div>

                    <div className="bg-muted/40 rounded-xl p-6 mb-6 space-y-4 border border-border">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={wantsNotifications}
                                onChange={(e) => setWantsNotifications(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-foreground">
                                Yes, notify me about new people joining this mission
                            </span>
                        </label>

                        {wantsNotifications && (
                            <div className="ml-8 space-y-3">
                                <label className="block text-sm font-medium text-foreground">
                                    Notify me about people who commit to...
                                </label>
                                <select
                                    value={notifyLevel}
                                    onChange={(e) => setNotifyLevel(e.target.value as typeof notifyLevel)}
                                    className="w-full rounded-lg border border-border p-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
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
                            className="flex-1 ring-2 ring-[#8460ea]/50 ring-offset-2"
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
                        <h2 className="text-xl font-bold text-foreground">
                            Would you like to add sub-missions that contribute to this mission?
                        </h2>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6 mb-6 border border-purple-100">
                        <p className="text-sm text-muted-foreground mb-4">
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

                    <p className="text-xs text-center text-muted-foreground mt-4">
                        You can always come back and add sub-missions later.
                    </p>
                </div>
            )}

            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mt-8">
                {(["celebration", "connect", "notifications", "submissions"] as CommitStep[]).map((step, i) => (
                    <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-colors ${currentStep === step
                                ? "bg-foreground"
                                : i < ["celebration", "connect", "notifications", "submissions"].indexOf(currentStep)
                                    ? "bg-muted"
                                    : "bg-muted/40"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommitFlow;

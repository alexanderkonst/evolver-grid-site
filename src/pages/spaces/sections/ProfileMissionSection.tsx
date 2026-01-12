import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";
import { supabase } from "@/integrations/supabase/client";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";
import { DESIRED_OUTCOMES } from "@/modules/mission-discovery/data/outcomes";
import { KEY_CHALLENGES } from "@/modules/mission-discovery/data/challenges";
import { FOCUS_AREAS } from "@/modules/mission-discovery/data/focusAreas";
import { PILLARS } from "@/modules/mission-discovery/data/pillars";

type MissionCommitment = {
    mission_id: string;
    mission_title: string;
    mission_statement: string;
    pillar?: string;
    focus_area?: string;
    challenge?: string;
    outcome?: string;
    committed_at?: string;
};

const ProfileMissionSection = () => {
    const [missionCommitment, setMissionCommitment] = useState<MissionCommitment | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadMission = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !isMounted) return;

            const { data: participant } = await supabase
                .from("mission_participants")
                .select("mission_id, mission_title, pillar_id, focus_area_id, challenge_id, outcome_id, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (participant?.mission_id) {
                const mission = MISSIONS.find(m => m.id === participant.mission_id);
                const outcome = participant.outcome_id
                    ? DESIRED_OUTCOMES.find(o => o.id === participant.outcome_id)
                    : mission
                        ? DESIRED_OUTCOMES.find(o => o.id === mission.outcomeId)
                        : undefined;
                const challenge = participant.challenge_id
                    ? KEY_CHALLENGES.find(c => c.id === participant.challenge_id)
                    : outcome
                        ? KEY_CHALLENGES.find(c => c.id === outcome.challengeId)
                        : undefined;
                const focusArea = participant.focus_area_id
                    ? FOCUS_AREAS.find(f => f.id === participant.focus_area_id)
                    : challenge
                        ? FOCUS_AREAS.find(f => f.id === challenge.focusAreaId)
                        : undefined;
                const pillar = participant.pillar_id
                    ? PILLARS.find(p => p.id === participant.pillar_id)
                    : focusArea
                        ? PILLARS.find(p => p.id === focusArea.pillarId)
                        : undefined;

                if (isMounted) {
                    setMissionCommitment({
                        mission_id: participant.mission_id,
                        mission_title: participant.mission_title,
                        mission_statement: mission?.statement || mission?.title || participant.mission_title,
                        pillar: pillar?.title,
                        focus_area: focusArea?.title,
                        challenge: challenge?.title,
                        outcome: outcome?.title,
                        committed_at: participant.created_at || undefined,
                    });
                }
                return;
            }

            const stored = localStorage.getItem(`mission_commitment_${user.id}`);
            if (!stored) return;
            try {
                const parsed = JSON.parse(stored) as MissionCommitment;
                if (isMounted) setMissionCommitment(parsed);
            } catch (err) {
            }
        };

        loadMission();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <GameShellV2>
            <div className="p-6 lg:p-8 max-w-3xl mx-auto">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Target className="w-6 h-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-slate-900">Mission Snapshot</h1>
                    </div>
                    <p className="text-slate-600">Keep your mission front and center.</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
                                <Target className="w-4 h-4 text-blue-600" />
                                <span>Primary Mission</span>
                            </div>
                            {missionCommitment ? (
                                <>
                                    <h2 className="text-lg font-semibold text-slate-900 mb-1">
                                        {missionCommitment.mission_title}
                                    </h2>
                                    <p className="text-sm text-slate-600 mb-3">
                                        {missionCommitment.mission_statement}
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                        {missionCommitment.pillar && (
                                            <span className="rounded-full bg-slate-100 px-2 py-1">{missionCommitment.pillar}</span>
                                        )}
                                        {missionCommitment.focus_area && (
                                            <span className="rounded-full bg-slate-100 px-2 py-1">{missionCommitment.focus_area}</span>
                                        )}
                                        {missionCommitment.challenge && (
                                            <span className="rounded-full bg-slate-100 px-2 py-1">{missionCommitment.challenge}</span>
                                        )}
                                        {missionCommitment.outcome && (
                                            <span className="rounded-full bg-slate-100 px-2 py-1">{missionCommitment.outcome}</span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-lg font-semibold text-slate-900 mb-1">Set your mission</h2>
                                    <p className="text-sm text-slate-600">
                                        Choose the mission that best matches your contribution to the planet.
                                    </p>
                                </>
                            )}
                        </div>
                        <Button asChild variant="outline" size="sm" className="shrink-0">
                            <Link to="/mission-discovery">
                                {missionCommitment ? "Edit" : "Start"} <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </GameShellV2>
    );
};

export default ProfileMissionSection;

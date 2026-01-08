import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    User,
    Sparkles,
    BrainCircuit,
    Map,
    Target,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShell from "@/components/game/GameShell";
import { supabase } from "@/integrations/supabase/client";

interface ModuleCard {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    path: string;
    status: "available" | "completed" | "coming-soon";
}

const PROFILE_MODULES: ModuleCard[] = [
    {
        id: "zone-of-genius",
        title: "Zone of Genius",
        description: "Discover your unique genius and how you create value",
        icon: <Sparkles className="w-6 h-6" />,
        path: "/zone-of-genius?from=game&return=/game/profile",
        status: "available"
    },
    {
        id: "mission-discovery",
        title: "Mission Discovery",
        description: "Find your contribution to the planet",
        icon: <Target className="w-6 h-6" />,
        path: "/mission-discovery?from=game&return=/game/profile",
        status: "available"
    },
    {
        id: "personality-tests",
        title: "Personality Tests",
        description: "MBTI, Enneagram, and other frameworks",
        icon: <BrainCircuit className="w-6 h-6" />,
        path: "/resources/personality-tests?from=game&return=/game/profile",
        status: "available"
    },
    {
        id: "quality-of-life",
        title: "Quality of Life Map",
        description: "Assess your life across 8 domains",
        icon: <Map className="w-6 h-6" />,
        path: "/quality-of-life-map/assessment?from=game&return=/game/profile",
        status: "available"
    },
    {
        id: "asset-mapping",
        title: "Asset Mapping",
        description: "Map your skills, tools, and resources",
        icon: <User className="w-6 h-6" />,
        path: "/asset-mapping",
        status: "coming-soon"
    }
];

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

const ProfileSpace = () => {
    const [missionCommitment, setMissionCommitment] = useState<MissionCommitment | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadMission = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !isMounted) return;
            const stored = localStorage.getItem(`mission_commitment_${user.id}`);
            if (!stored) return;
            try {
                const parsed = JSON.parse(stored) as MissionCommitment;
                if (isMounted) setMissionCommitment(parsed);
            } catch (err) {
                console.error("Failed to parse mission commitment:", err);
            }
        };
        loadMission();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <GameShell>
            <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <User className="w-6 h-6 text-slate-700" />
                        <h1 className="text-2xl font-bold text-slate-900">Profile Space</h1>
                    </div>
                    <p className="text-slate-600">Know yourself. Build your character.</p>
                </div>

                {/* Mission Snapshot */}
                <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
                                <Target className="w-4 h-4 text-blue-600" />
                                <span>Mission</span>
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
                            <Link to="/mission-discovery?from=game&return=/game/profile">
                                {missionCommitment ? "Edit" : "Start"} <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Module Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {PROFILE_MODULES.map((module) => (
                        <div
                            key={module.id}
                            className={`
                rounded-xl border p-5
                ${module.status === "coming-soon"
                                    ? "border-slate-200 bg-slate-50 opacity-60"
                                    : "border-slate-200 bg-white hover:border-slate-300 transition-colors"
                                }
              `}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-slate-100">
                                    {module.icon}
                                </div>
                                {module.status === "coming-soon" && (
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                        Coming Soon
                                    </span>
                                )}
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">{module.title}</h3>
                            <p className="text-sm text-slate-600 mb-4">{module.description}</p>
                            {module.status !== "coming-soon" && (
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link to={module.path}>
                                        Start <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </GameShell>
    );
};

export default ProfileSpace;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    User,
    Sparkles,
    BrainCircuit,
    Map,
    Target,
    ArrowRight,
    Boxes,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShell from "@/components/game/GameShell";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import VisibilityToggle, { VisibilityValue } from "@/components/VisibilityToggle";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";
import { DESIRED_OUTCOMES } from "@/modules/mission-discovery/data/outcomes";
import { KEY_CHALLENGES } from "@/modules/mission-discovery/data/challenges";
import { FOCUS_AREAS } from "@/modules/mission-discovery/data/focusAreas";
import { PILLARS } from "@/modules/mission-discovery/data/pillars";
import { ASSET_TYPES } from "@/modules/asset-mapping/data/assetTypes";
import { ASSET_SUB_TYPES } from "@/modules/asset-mapping/data/assetSubtypes";

interface ModuleCard {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    path: string;
    status: "available" | "completed" | "coming-soon";
}

interface SavedAsset {
    typeId: string;
    subTypeId?: string;
    categoryId?: string;
    title: string;
    description?: string;
    savedAt: string;
    source: string;
}

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

type VisibilityKey = "zog" | "qol" | "assets";

const DEFAULT_VISIBILITY_SETTINGS: Record<VisibilityKey, VisibilityValue> = {
    zog: "community",
    qol: "private",
    assets: "private",
};

const ProfileSpace = () => {
    const { toast } = useToast();
    const [missionCommitment, setMissionCommitment] = useState<MissionCommitment | null>(null);
    const [savedAssets, setSavedAssets] = useState<SavedAsset[]>([]);
    const [showAssets, setShowAssets] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [visibilitySettings, setVisibilitySettings] = useState(DEFAULT_VISIBILITY_SETTINGS);
    const [savingVisibilityKey, setSavingVisibilityKey] = useState<VisibilityKey | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !isMounted) return;
            if (isMounted) setUserId(user.id);

            // Load assets from localStorage
            const assetsKey = `user_assets_${user.id}`;
            const storedAssets = localStorage.getItem(assetsKey);
            if (storedAssets) {
                try {
                    const parsed = JSON.parse(storedAssets);
                    if (isMounted) setSavedAssets(parsed);
                } catch (err) {
                    console.error("Failed to parse assets:", err);
                }
            }

            const { data: visibilityRows, error: visibilityError } = await supabase
                .from("visibility_settings")
                .select("data_type, visibility")
                .eq("user_id", user.id);

            if (visibilityError) {
                console.error("Failed to load visibility settings:", visibilityError);
            } else {
                const nextSettings = { ...DEFAULT_VISIBILITY_SETTINGS };
                visibilityRows?.forEach((row) => {
                    if (!(row.data_type in nextSettings)) return;
                    const dataType = row.data_type as VisibilityKey;
                    if (dataType === "qol") return;
                    if (["private", "community", "public"].includes(row.visibility)) {
                        nextSettings[dataType] = row.visibility as VisibilityValue;
                    }
                });
                if (isMounted) setVisibilitySettings(nextSettings);
            }

            // Load mission commitment
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
                console.error("Failed to parse mission commitment:", err);
            }
        };

        loadData();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleVisibilityChange = async (dataType: VisibilityKey, value: VisibilityValue) => {
        const previousValue = visibilitySettings[dataType];
        setVisibilitySettings((prev) => ({ ...prev, [dataType]: value }));

        if (!userId) return;

        setSavingVisibilityKey(dataType);
        const { error } = await supabase
            .from("visibility_settings")
            .upsert(
                {
                    user_id: userId,
                    data_type: dataType,
                    visibility: value,
                },
                { onConflict: "user_id,data_type" }
            );
        setSavingVisibilityKey(null);

        if (error) {
            setVisibilitySettings((prev) => ({ ...prev, [dataType]: previousValue }));
            toast({
                title: "Failed to save visibility",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const getAssetTypeName = (typeId: string) => {
        return ASSET_TYPES.find(t => t.id === typeId)?.title || typeId;
    };

    const getAssetSubTypeName = (subTypeId: string) => {
        return ASSET_SUB_TYPES.find(s => s.id === subTypeId)?.title || subTypeId;
    };

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
            description: savedAssets.length > 0
                ? `${savedAssets.length} assets mapped`
                : "Map your skills, tools, and resources",
            icon: <Boxes className="w-6 h-6" />,
            path: "/asset-mapping?from=game&return=/game/profile",
            status: "available"
        }
    ];

    const moduleVisibilityMap: Record<string, { key: VisibilityKey; disabled?: boolean }> = {
        "zone-of-genius": { key: "zog" },
        "quality-of-life": { key: "qol", disabled: true },
        "asset-mapping": { key: "assets" },
    };

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
                            <Link to="/mission-discovery?from=game&return=/game/profile">
                                {missionCommitment ? "Edit" : "Start"} <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Module Grid */}
                <div className="grid gap-4 sm:grid-cols-2 mb-8">
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
                                <div className="flex flex-col items-end gap-2">
                                    {module.status === "coming-soon" && (
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                            Coming Soon
                                        </span>
                                    )}
                                    {module.id === "asset-mapping" && savedAssets.length > 0 && (
                                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                            ✓ {savedAssets.length}
                                        </span>
                                    )}
                                    {moduleVisibilityMap[module.id] && (
                                        <VisibilityToggle
                                            value={visibilitySettings[moduleVisibilityMap[module.id].key]}
                                            onChange={(value) =>
                                                handleVisibilityChange(moduleVisibilityMap[module.id].key, value)
                                            }
                                            disabled={
                                                moduleVisibilityMap[module.id].disabled ||
                                                savingVisibilityKey === moduleVisibilityMap[module.id].key ||
                                                !userId
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">{module.title}</h3>
                            <p className="text-sm text-slate-600 mb-4">{module.description}</p>
                            {module.status !== "coming-soon" && (
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link to={module.path}>
                                        {module.id === "asset-mapping" && savedAssets.length > 0 ? "Add More" : "Start"}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Saved Assets Section */}
                {savedAssets.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                        <button
                            onClick={() => setShowAssets(!showAssets)}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Boxes className="w-5 h-5 text-slate-600" />
                                <span className="font-semibold text-slate-900">
                                    Your Assets ({savedAssets.length})
                                </span>
                            </div>
                            {showAssets ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                        </button>

                        {showAssets && (
                            <div className="border-t border-slate-100 max-h-96 overflow-y-auto">
                                {savedAssets.map((asset, i) => (
                                    <div
                                        key={i}
                                        className="p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                                    >
                                        <div className="flex flex-wrap items-center gap-1 mb-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                {getAssetTypeName(asset.typeId)}
                                            </span>
                                            {asset.subTypeId && (
                                                <span className="text-xs text-slate-400">
                                                    → {getAssetSubTypeName(asset.subTypeId)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-medium text-slate-900">{asset.title}</p>
                                        {asset.description && (
                                            <p className="text-sm text-slate-600 mt-1">{asset.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </GameShell>
    );
};

export default ProfileSpace;

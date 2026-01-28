import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Zap, Target, Quote, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import ShareZoG from "@/components/sharing/ShareZoG";

interface AppleseedData {
    vibrationalKey?: {
        name: string;
        essence: string;
    };
    bullseyeSentence?: string;
    threeLenses?: {
        actions: string[];
        primeDriver: string;
        archetype: string;
    };
    masteryStages?: Array<{
        stage: number;
        name: string;
        description: string;
    }>;
    monetizationAvenues?: string[];
}

/**
 * ZoneOfGeniusOverview - Shows the saved Zone of Genius data
 */
const ZoneOfGeniusOverview = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [appleseedData, setAppleseedData] = useState<AppleseedData | null>(null);
    const [profileId, setProfileId] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const resolvedProfileId = await getOrCreateGameProfileId();
                if (!resolvedProfileId) {
                    setLoading(false);
                    return;
                }
                setProfileId(resolvedProfileId);

                // Get the profile to find the zog snapshot ID
                const { data: profileData } = await supabase
                    .from("game_profiles")
                    .select("last_zog_snapshot_id")
                    .eq("id", resolvedProfileId)
                    .single();

                if (!profileData?.last_zog_snapshot_id) {
                    setLoading(false);
                    return;
                }

                // Load appleseed_data from zog_snapshots
                const { data: snapshotData } = await supabase
                    .from("zog_snapshots")
                    .select("appleseed_data")
                    .eq("id", profileData.last_zog_snapshot_id)
                    .single();

                if (snapshotData?.appleseed_data) {
                    console.log("[ZoGOverview] Loaded appleseed_data:", snapshotData.appleseed_data);
                    setAppleseedData(snapshotData.appleseed_data as unknown as AppleseedData);
                }
            } catch (err) {
                console.error("Error loading Zone of Genius data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const subPages = [
        { id: "archetype", label: "My Archetype", icon: Star, path: "/game/profile/zone-of-genius/archetype", description: "Your unique genius type" },
        { id: "talents", label: "Top Talents", icon: Zap, path: "/game/profile/zone-of-genius/talents", description: "Your natural strengths" },
        { id: "driver", label: "Prime Driver", icon: Target, path: "/game/profile/zone-of-genius/driver", description: "What fuels you" },
        { id: "action", label: "Action Statement", icon: Quote, path: "/game/profile/zone-of-genius/action", description: "Your core expression" },
    ];

    if (loading) {
        return (
            <GameShellV2>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-pulse text-[#a4a3d0]">Loading...</div>
                </div>
            </GameShellV2>
        );
    }

    if (!appleseedData?.vibrationalKey) {
        return (
            <GameShellV2>
                <div className="max-w-2xl mx-auto p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden mb-4">
                        <img src="/dodecahedron.png" alt="Zone of Genius" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#2c3150] mb-2">Discover Your Zone of Genius</h1>
                    <p className="text-[#a4a3d0] mb-6">
                        Take the 15-minute assessment to uncover your unique genius.
                    </p>
                    <Button
                        variant="wabi-primary"
                        onClick={() => navigate("/zone-of-genius/entry")}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Start Assessment
                    </Button>
                </div>
            </GameShellV2>
        );
    }

    return (
        <GameShellV2>
            <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
                {/* Hero - Updated to match RevelatoryHero styling */}
                <div className="text-center py-8 bg-gradient-to-br from-[#c8b7d8] via-[#d4d1e8] to-[#e7e9f5] rounded-2xl">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full overflow-hidden mb-4">
                        <img src="/dodecahedron.png" alt="Zone of Genius" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-[#8460ea] uppercase tracking-widest mb-2">My Genius Is To Be A</p>
                    <h1 className="text-3xl font-display font-bold text-[#2c3150] mb-3">
                        {appleseedData.vibrationalKey.name}
                    </h1>
                    {appleseedData.bullseyeSentence && (
                        <p className="text-[#2c3150]/80 max-w-md mx-auto px-4">
                            I {appleseedData.bullseyeSentence}
                        </p>
                    )}
                </div>

                {/* Three Lenses Summary */}
                {appleseedData.threeLenses && (
                    <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20 space-y-3">
                        <div>
                            <p className="text-xs text-[#8460ea] uppercase tracking-wide">My Top Talents</p>
                            <p className="text-[#2c3150] font-medium">{appleseedData.threeLenses.actions.join(" • ")}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#8460ea] uppercase tracking-wide">My Prime Driver</p>
                            <p className="text-[#2c3150] font-medium">{appleseedData.threeLenses.primeDriver}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#8460ea] uppercase tracking-wide">My Archetype</p>
                            <p className="text-[#2c3150] font-medium">{appleseedData.threeLenses.archetype}</p>
                        </div>
                    </div>
                )}

                {/* Mastery Stages */}
                {appleseedData.masteryStages && appleseedData.masteryStages.length > 0 && (
                    <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-[#8460ea]" />
                            <p className="text-xs text-[#8460ea] uppercase tracking-wide font-medium">Mastery Stages</p>
                        </div>
                        <div className="space-y-2">
                            {appleseedData.masteryStages.map((stage, index) => (
                                <div key={stage.stage || index} className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8460ea]/10 text-[#8460ea] text-xs font-medium flex items-center justify-center">
                                        {stage.stage || index + 1}
                                    </div>
                                    <div>
                                        <p className="text-[#2c3150] font-medium text-sm">{stage.name}</p>
                                        <p className="text-[#a4a3d0] text-xs">{stage.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Monetization Avenues */}
                {appleseedData.monetizationAvenues && appleseedData.monetizationAvenues.length > 0 && (
                    <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                        <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-2">Monetization Pathways</p>
                        <div className="flex flex-wrap gap-2">
                            {appleseedData.monetizationAvenues.map((avenue, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-[#8460ea]/10 text-[#8460ea] text-sm rounded-full"
                                >
                                    {avenue}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation to sub-pages */}
                <div className="grid grid-cols-2 gap-3">
                    {subPages.map((page) => (
                        <button
                            key={page.id}
                            onClick={() => navigate(page.path)}
                            className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20 hover:border-[#8460ea]/40 hover:bg-white/80 transition-all text-left group"
                        >
                            <page.icon className="w-5 h-5 text-[#8460ea] mb-2" />
                            <p className="font-medium text-[#2c3150] group-hover:text-[#8460ea] transition-colors">
                                {page.label}
                            </p>
                            <p className="text-xs text-[#a4a3d0]">{page.description}</p>
                        </button>
                    ))}
                </div>

                {/* Create Genius Business CTA */}
                <div className="text-center p-4 bg-gradient-to-br from-white via-[#f5f5ff] to-[#ebe8f7] rounded-xl border border-[#a4a3d0]/20">
                    <p className="text-sm text-[#a4a3d0] mb-3">Ready to turn your genius into an offer?</p>
                    <Button
                        variant="wabi-primary"
                        onClick={() => navigate("/zone-of-genius/entry?generate=excalibur")}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create My Genius Business
                    </Button>
                </div>

                {/* Share */}
                <ShareZoG
                    archetypeName={appleseedData.vibrationalKey.name}
                    tagline={appleseedData.bullseyeSentence || ""}
                    primeDriver={appleseedData.threeLenses?.primeDriver || ""}
                    talents={appleseedData.threeLenses?.actions}
                    archetype={appleseedData.threeLenses?.archetype}
                    profileId={profileId ?? undefined}
                />
            </div>
        </GameShellV2>
    );
};

export default ZoneOfGeniusOverview;

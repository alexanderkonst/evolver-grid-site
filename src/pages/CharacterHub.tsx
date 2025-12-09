import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Target, Heart, TrendingUp, Zap, Gift, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SoulDodecahedron from "@/components/SoulDodecahedron";
import CharacterTile from "@/components/CharacterTile";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getPlayerUpgrades } from "@/lib/upgradeSystem";

const CharacterHub = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [zogSnapshot, setZogSnapshot] = useState<any>(null);
    const [qolSnapshot, setQolSnapshot] = useState<any>(null);
    const [geniusOffer, setGeniusOffer] = useState<any>(null);
    const [soulColors, setSoulColors] = useState<string[] | null>(null);
    const [generatingColors, setGeneratingColors] = useState(false);
    const [upgradeCount, setUpgradeCount] = useState(0);

    useEffect(() => {
        loadCharacterData();
    }, []);

    const loadCharacterData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (!user) {
                setLoading(false);
                return;
            }

            // Get game profile
            const { data: profileData } = await supabase
                .from("game_profiles")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (profileData) {
                setProfile(profileData);
                // soul_colors will be added after migration
                setSoulColors((profileData as any).soul_colors || null);

                // Get ZoG snapshot
                if (profileData.last_zog_snapshot_id) {
                    const { data: zogData } = await supabase
                        .from("zog_snapshots")
                        .select("archetype_title, core_pattern, top_three_talents")
                        .eq("id", profileData.last_zog_snapshot_id)
                        .single();
                    setZogSnapshot(zogData);
                }

                // Get QoL snapshot
                if (profileData.last_qol_snapshot_id) {
                    const { data: qolData } = await supabase
                        .from("qol_snapshots")
                        .select("*")
                        .eq("id", profileData.last_qol_snapshot_id)
                        .single();
                    setQolSnapshot(qolData);
                }

                // Get player's completed upgrades count
                const upgrades = await getPlayerUpgrades(profileData.id);
                setUpgradeCount(upgrades.length);
            }

            // Get Genius Offer status
            const { data: offerData } = await supabase
                .from("genius_offer_requests")
                .select("id, status, summary_title")
                .eq("user_id", user.id)
                .maybeSingle();
            setGeniusOffer(offerData);

        } catch (error) {
            console.error("Error loading character data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSoulColors = async () => {
        if (!zogSnapshot) return;

        setGeneratingColors(true);
        try {
            const { data, error } = await supabase.functions.invoke("generate-soul-colors", {
                body: {
                    archetype: zogSnapshot.archetype_title,
                    topTalents: zogSnapshot.top_three_talents,
                    corePattern: zogSnapshot.core_pattern,
                },
            });

            if (error) throw error;
            if (data?.colors) {
                setSoulColors(data.colors);
            }
        } catch (error) {
            console.error("Error generating soul colors:", error);
        } finally {
            setGeneratingColors(false);
        }
    };

    const getQolAverage = () => {
        if (!qolSnapshot) return 0;
        const stages = [
            qolSnapshot.wealth_stage,
            qolSnapshot.health_stage,
            qolSnapshot.happiness_stage,
            qolSnapshot.love_relationships_stage,
            qolSnapshot.impact_stage,
            qolSnapshot.growth_stage,
            qolSnapshot.social_ties_stage,
            qolSnapshot.home_stage,
        ];
        return (stages.reduce((a, b) => a + b, 0) / stages.length).toFixed(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navigation />
                <main className="flex-grow flex items-center justify-center px-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-4">
                            <BoldText>SIGN IN TO ACCESS YOUR CHARACTER</BoldText>
                        </h1>
                        <Button onClick={() => navigate("/auth")} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                            Sign In
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />

            <main className="flex-grow pt-20 pb-20 px-4">
                <div className="container mx-auto max-w-lg">
                    {/* Back link */}
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span className="text-sm">Home</span>
                    </button>

                    {/* Player Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                            {profile?.first_name || user?.email?.split("@")[0] || "Player"}
                        </h1>
                        <p className="text-amber-400 text-sm">
                            Level {profile?.level || 1} · {(profile?.xp_total || 0).toLocaleString()} XP
                        </p>
                        {zogSnapshot?.archetype_title && (
                            <p className="text-slate-400 text-xs mt-1">{zogSnapshot.archetype_title}</p>
                        )}
                    </div>

                    {/* Soul Dodecahedron */}
                    <div className="flex flex-col items-center mb-8">
                        <SoulDodecahedron
                            soulColors={soulColors || undefined}
                            size="lg"
                            onClick={() => navigate("/map")}
                        />

                        {/* Generate colors button (only if ZoG exists but no colors) */}
                        {zogSnapshot && !soulColors && (
                            <Button
                                onClick={handleGenerateSoulColors}
                                disabled={generatingColors}
                                variant="outline"
                                size="sm"
                                className="mt-4 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                            >
                                {generatingColors ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Discovering Colors...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Unlock Your Soul Colors
                                    </>
                                )}
                            </Button>
                        )}

                        <p className="text-slate-400 text-xs mt-3">Tap to explore your paths</p>
                    </div>

                    {/* 6 Character Tiles - 2x3 Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm mx-auto">
                        {/* Zone of Genius */}
                        <CharacterTile
                            id="zog"
                            title="Zone of Genius"
                            subtitle={zogSnapshot?.archetype_title?.split(" ")[0] || undefined}
                            icon={<Sparkles className="w-full h-full" />}
                            color="#9b5de5"
                            progress={zogSnapshot ? 100 : 0}
                            isLocked={!zogSnapshot}
                            unlockHint="Complete assessment"
                            onClick={() => navigate(zogSnapshot ? "/zone-of-genius/results" : "/zone-of-genius/assessment")}
                        />

                        {/* Genius Offer */}
                        <CharacterTile
                            id="genius-offer"
                            title="Genius Offer"
                            subtitle={geniusOffer?.status === "completed" ? "Ready" : geniusOffer?.status || undefined}
                            icon={<Gift className="w-full h-full" />}
                            color="#f5a623"
                            progress={geniusOffer?.status === "completed" ? 100 : geniusOffer ? 50 : 0}
                            isLocked={!zogSnapshot}
                            unlockHint="ZoG first"
                            onClick={() => navigate(geniusOffer ? "/profile" : "/genius-offer/intake")}
                        />

                        {/* Quality of Life */}
                        <CharacterTile
                            id="qol"
                            title="Quality of Life"
                            icon={<Heart className="w-full h-full" />}
                            color="#ff6b35"
                            progress={qolSnapshot ? 100 : 0}
                            isLocked={!qolSnapshot}
                            unlockHint="Complete assessment"
                            onClick={() => navigate(qolSnapshot ? "/quality-of-life-map/results" : "/quality-of-life-map/assessment")}
                        >
                            {qolSnapshot && (
                                <span className="text-lg font-bold" style={{ color: "#ff6b35" }}>
                                    {getQolAverage()}
                                </span>
                            )}
                        </CharacterTile>

                        {/* Evolution / Progress */}
                        <CharacterTile
                            id="evolution"
                            title="Evolution"
                            icon={<TrendingUp className="w-full h-full" />}
                            color="#4361ee"
                            progress={Math.min(100, ((profile?.xp_total || 0) / 500) * 100)}
                            onClick={() => navigate("/game")}
                        >
                            <span className="text-xs text-slate-400">
                                {profile?.current_streak_days || 0}🔥 streak
                            </span>
                        </CharacterTile>

                        {/* Current Quest */}
                        <CharacterTile
                            id="quest"
                            title="My Quest"
                            subtitle={profile?.last_quest_title?.slice(0, 15) || "Get started"}
                            icon={<Target className="w-full h-full" />}
                            color="#2d6a4f"
                            onClick={() => navigate("/map")}
                        />

                        {/* Upgrades */}
                        <CharacterTile
                            id="upgrades"
                            title="Upgrades"
                            icon={<Zap className="w-full h-full" />}
                            color="#f72585"
                            progress={Math.min(100, upgradeCount * 10)}
                            onClick={() => navigate("/game")}
                        >
                            <span className="text-lg font-bold" style={{ color: "#f72585" }}>
                                {upgradeCount}
                            </span>
                        </CharacterTile>
                    </div>

                    {/* Quick Action */}
                    <div className="text-center mt-8">
                        <Button
                            onClick={() => navigate("/map")}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium px-6"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Get a Quest
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CharacterHub;

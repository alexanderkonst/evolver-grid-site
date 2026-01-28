import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Target, Heart, TrendingUp, Zap, Gift } from "lucide-react";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SoulDodecahedron from "@/components/SoulDodecahedron";
import CharacterTile from "@/components/CharacterTile";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { getPlayerUpgrades } from "@/lib/upgradeSystem";
import { useRecommendations } from "@/hooks/use-recommendations";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import AppleseedSummaryCard from "@/components/profile/AppleseedSummaryCard";
import ExcaliburSummaryCard from "@/components/profile/ExcaliburSummaryCard";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";
import LinkedInUpload from "@/components/profile/LinkedInUpload";
import PrivacySection from "@/components/profile/PrivacySection";
import GeniusGrowthPath from "@/modules/genius-path/GeniusGrowthPath";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";
import MyLifeSection from "@/components/game/MyLifeSection";
import dodecahedronImage from "@/assets/mc-dodecahedron.png";
import ShareZoG from "@/components/sharing/ShareZoG";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";
import { DESIRED_OUTCOMES } from "@/modules/mission-discovery/data/outcomes";
import { KEY_CHALLENGES } from "@/modules/mission-discovery/data/challenges";
import { FOCUS_AREAS } from "@/modules/mission-discovery/data/focusAreas";
import { PILLARS } from "@/modules/mission-discovery/data/pillars";

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
    const [appleseed, setAppleseed] = useState<AppleseedData | null>(null);
    const [excalibur, setExcalibur] = useState<ExcaliburData | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [linkedinPdfPath, setLinkedinPdfPath] = useState<string | null>(null);
    const [qolScores, setQolScores] = useState<Array<{ key: string; label: string; score: number }>>([]);
    const [privacySettings, setPrivacySettings] = useState({
        visibility: "full" as "hidden" | "minimal" | "medium" | "full",
        show_location: true,
        show_mission: true,
        show_offer: true,
    });
    const [missionCommitment, setMissionCommitment] = useState<{
        mission_title: string;
        mission_statement: string;
        intro_text?: string | null;
        pillar?: string;
        focus_area?: string;
    } | null>(null);

    // Get personalized recommendations
    const recommendations = useRecommendations(profile?.id || null);

    useEffect(() => {
        loadCharacterData();
    }, []);

    const populateProfileData = async (profileData: any) => {
        setProfile(profileData);
        setSoulColors((profileData as any).soul_colors || null);
        setAvatarUrl((profileData as any).avatar_url || null);
        setLinkedinPdfPath((profileData as any).linkedin_pdf_url || null);

        setPrivacySettings({
            visibility: (profileData as any).visibility || "full",
            show_location: (profileData as any).show_location ?? true,
            show_mission: (profileData as any).show_mission ?? true,
            show_offer: (profileData as any).show_offer ?? true,
        });

        if (profileData.last_zog_snapshot_id) {
            const { data: zogData } = await supabase
                .from("zog_snapshots")
                .select("archetype_title, core_pattern, top_three_talents, appleseed_data, excalibur_data")
                .eq("id", profileData.last_zog_snapshot_id)
                .single();
            setZogSnapshot(zogData);
            if (zogData?.appleseed_data) {
                setAppleseed(zogData.appleseed_data as unknown as AppleseedData);
            }
            if (zogData?.excalibur_data) {
                setExcalibur(zogData.excalibur_data as unknown as ExcaliburData);
            }
        }

        if (profileData.last_qol_snapshot_id) {
            const { data: qolData } = await supabase
                .from("qol_snapshots")
                .select("*")
                .eq("id", profileData.last_qol_snapshot_id)
                .single();
            setQolSnapshot(qolData);
            if (qolData) {
                setQolScores([
                    { key: "health_stage", label: "Health", score: qolData.health_stage || 5 },
                    { key: "wealth_stage", label: "Wealth", score: qolData.wealth_stage || 5 },
                    { key: "happiness_stage", label: "Happiness", score: qolData.happiness_stage || 5 },
                    { key: "love_relationships_stage", label: "Love", score: qolData.love_relationships_stage || 5 },
                    { key: "impact_stage", label: "Impact", score: qolData.impact_stage || 5 },
                    { key: "growth_stage", label: "Growth", score: qolData.growth_stage || 5 },
                    { key: "social_ties_stage", label: "Social", score: qolData.social_ties_stage || 5 },
                    { key: "home_stage", label: "Home", score: qolData.home_stage || 5 },
                ]);
            }
        }

        const upgrades = await getPlayerUpgrades(profileData.id);
        setUpgradeCount(upgrades.length);
    };

    const loadCharacterData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (!user) {
                const profileId = await getOrCreateGameProfileId().catch(() => null);
                if (!profileId) {
                    setLoading(false);
                    return;
                }

                const { data: profileData } = await supabase
                    .from("game_profiles")
                    .select("*")
                    .eq("id", profileId)
                    .maybeSingle();

                if (profileData) {
                    await populateProfileData(profileData);
                }

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
                await populateProfileData(profileData);
            }

            const { data: participant } = await supabase
                .from("mission_participants")
                .select("mission_id, mission_title, pillar_id, focus_area_id, challenge_id, outcome_id, intro_text, created_at")
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

                setMissionCommitment({
                    mission_title: participant.mission_title,
                    mission_statement: mission?.statement || mission?.title || participant.mission_title,
                    intro_text: participant.intro_text || null,
                    pillar: pillar?.title,
                    focus_area: focusArea?.title,
                });
            } else {
                setMissionCommitment(null);
            }

            // Get Genius Offer status
            const { data: offerData } = await supabase
                .from("genius_offer_requests")
                .select("id, status, summary_title")
                .eq("user_id", user.id)
                .maybeSingle();
            setGeniusOffer(offerData);

        } catch (error) {
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
            <div className="min-h-dvh flex items-center justify-center bg-background">
                <PremiumLoader size="lg" />
            </div>
        );
    }

    if (!user && !profile) {
        return (
            <div className="min-h-dvh flex flex-col bg-background">
                <Navigation />
                <main className="flex-grow flex items-center justify-center px-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-4">
                            <BoldText>SIGN IN TO ACCESS YOUR CHARACTER</BoldText>
                        </h1>
                        <Button onClick={() => navigate("/auth")} className="bg-amber-500 hover:bg-amber-600 text-[#2c3150]">
                            Sign In
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-dvh flex flex-col bg-background">
            <Navigation />

            <main className="flex-grow pt-20 pb-20 px-4">
                <div className="container mx-auto max-w-lg">
                    {/* Back link */}
                    <BackButton
                        to="/"
                        label="Home"
                        className="text-slate-400 hover:text-white transition-colors mb-4"
                    />

                    {/* Player Header */}
                    <div className="relative text-center mb-6">
                        <img
                            src={dodecahedronImage}
                            alt=""
                            loading="lazy"
                            className="pointer-events-none absolute -right-4 -top-6 w-24 opacity-10"
                            aria-hidden="true"
                        />
                        {user && profile && (
                            <div className="flex justify-center mb-4">
                                <ProfilePictureUpload
                                    userId={user.id}
                                    avatarUrl={avatarUrl || undefined}
                                    displayName={`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || user.email}
                                    size={120}
                                    onUpload={(url) => setAvatarUrl(url)}
                                />
                            </div>
                        )}
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

                    {!user && (
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-left mb-6">
                            <p className="text-xs text-amber-300 font-medium mb-1">Anonymous Mode</p>
                            <p className="text-sm text-slate-200 mb-3">
                                You’re exploring without signing in. Sign in to save and sync your progress.
                            </p>
                            <Button
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600 text-[#2c3150]"
                                onClick={() => navigate("/auth")}
                            >
                                Sign In
                            </Button>
                        </div>
                    )}

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
                                        <span className="premium-spinner w-4 h-4 mr-2" />
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

                    {/* 🌱 GENIUS GROWTH PATH */}
                    <div className="mb-8 space-y-4">
                        <GeniusGrowthPath appleseed={appleseed} excalibur={excalibur} />
                        {appleseed ? (
                            <div className="space-y-4">
                                <AppleseedSummaryCard appleseed={appleseed} />
                                <ShareZoG
                                    archetypeName={appleseed.vibrationalKey.name}
                                    tagline={appleseed.vibrationalKey.tagline}
                                    primeDriver={appleseed.threeLenses.primeDriver}
                                    profileId={profile?.id}
                                    profileUrl={user?.id && typeof window !== "undefined" ? `${window.location.origin}/profile/${user.id}` : undefined}
                                />
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-left">
                                <p className="text-xs text-amber-300 font-medium mb-1">Your Zone of Genius</p>
                                <p className="text-sm text-slate-200 mb-3">
                                    Generate your Zone of Genius to unlock your profile.
                                </p>
                                <Button
                                    size="sm"
                                    className="bg-amber-500 hover:bg-amber-600 text-[#2c3150]"
                                    onClick={() => navigate("/zone-of-genius/entry")}
                                >
                                    Start Zone of Genius
                                </Button>
                            </div>
                        )}
                        {excalibur ? (
                            <ExcaliburSummaryCard excalibur={excalibur} />
                        ) : appleseed ? (
                            <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5 text-left">
                                <p className="text-xs text-violet-300 font-medium mb-1">Your Unique Offer</p>
                                <p className="text-sm text-slate-200 mb-3">
                                    You know WHO you are. Now discover WHAT you can offer.
                                </p>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-violet-500 text-white hover:bg-violet-600"
                                    onClick={() => navigate("/zone-of-genius/entry")}
                                >
                                    Create My Unique Offer →
                                </Button>
                            </div>
                        ) : null}
                    </div>

                    {/* 🎯 MY MISSION */}
                    <div className="mb-8">
                        <div className="rounded-2xl border border-slate-700/40 bg-slate-900/40 p-5 text-left">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <div>
                                    <p className="text-xs text-amber-300 font-medium mb-1">My Mission</p>
                                    <h3 className="text-base font-semibold text-slate-100">
                                        {missionCommitment?.mission_title || "Choose your mission"}
                                    </h3>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-amber-500 text-[#2c3150] hover:bg-amber-600"
                                    onClick={() => navigate("/game/mission")}
                                >
                                    {missionCommitment ? "Edit" : "Select"}
                                </Button>
                            </div>
                            {missionCommitment ? (
                                <div className="space-y-2 text-sm text-slate-300">
                                    <p>{missionCommitment.mission_statement}</p>
                                    {(missionCommitment.pillar || missionCommitment.focus_area) && (
                                        <p className="text-xs text-slate-400">
                                            {missionCommitment.pillar ? `Pillar: ${missionCommitment.pillar}` : ""}
                                            {missionCommitment.pillar && missionCommitment.focus_area ? " · " : ""}
                                            {missionCommitment.focus_area ? `Focus: ${missionCommitment.focus_area}` : ""}
                                        </p>
                                    )}
                                    {missionCommitment.intro_text && (
                                        <p className="text-slate-300 italic">\"{missionCommitment.intro_text}\"</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-300">
                                    Set your mission to unlock clearer matchmaking and community alignment.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 📊 MY LIFE */}
                    {qolScores.length > 0 && (
                        <div className="mb-8">
                            <MyLifeSection qolScores={qolScores} />
                        </div>
                    )}

                    {/* 📄 LINKEDIN PROFILE */}
                    {user && (
                        <div className="mb-8">
                            <LinkedInUpload
                                userId={user.id}
                                pdfPath={linkedinPdfPath}
                                onUpdate={setLinkedinPdfPath}
                            />
                        </div>
                    )}

                    {/* 🔒 PRIVACY SETTINGS */}
                    {user && (
                        <div className="mb-8">
                            <PrivacySection
                                userId={user.id}
                                visibility={privacySettings.visibility}
                                showLocation={privacySettings.show_location}
                                showMission={privacySettings.show_mission}
                                showOffer={privacySettings.show_offer}
                                onUpdate={(updates) => setPrivacySettings(prev => ({ ...prev, ...updates }))}
                            />
                        </div>
                    )}

                    {/* ✨ SUGGESTED FOR YOU */}
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            SUGGESTED FOR YOU
                        </h2>

                        {/* Next Quest Card */}
                        {recommendations.quest ? (
                            <div
                                className="p-4 rounded-xl border mb-3"
                                style={{
                                    borderColor: `${recommendations.quest.pathColor}40`,
                                    backgroundColor: `${recommendations.quest.pathColor}10`
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="w-4 h-4" style={{ color: recommendations.quest.pathColor }} />
                                            <span className="text-xs font-medium" style={{ color: recommendations.quest.pathColor }}>
                                                Next Quest
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-foreground">
                                            {recommendations.quest.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {recommendations.quest.path} · {recommendations.quest.xp} XP · {recommendations.quest.duration}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        style={{ backgroundColor: recommendations.quest.pathColor }}
                                        className="text-white hover:opacity-90"
                                        onClick={() => navigate("/map")}
                                    >
                                        Start →
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 mb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="w-4 h-4 text-amber-400" />
                                            <span className="text-xs text-amber-400 font-medium">Next Quest</span>
                                        </div>
                                        <h3 className="font-semibold text-foreground">
                                            Find Your First Quest
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Explore the Game Map to discover quests
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-amber-500 hover:bg-amber-600 text-[#2c3150]"
                                        onClick={() => navigate("/map")}
                                    >
                                        Explore →
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Recommended Upgrade Card */}
                        {recommendations.upgrade ? (
                            <div
                                className="p-4 rounded-xl border"
                                style={{
                                    borderColor: `${recommendations.upgrade.pathColor}40`,
                                    backgroundColor: `${recommendations.upgrade.pathColor}10`
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Zap className="w-4 h-4" style={{ color: recommendations.upgrade.pathColor }} />
                                            <span className="text-xs font-medium" style={{ color: recommendations.upgrade.pathColor }}>
                                                Recommended Upgrade
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-foreground">
                                            {recommendations.upgrade.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {recommendations.upgrade.path} · {recommendations.upgrade.description}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        style={{ borderColor: `${recommendations.upgrade.pathColor}60`, color: recommendations.upgrade.pathColor }}
                                        className="hover:opacity-80"
                                        onClick={() => navigate("/game/details")}
                                    >
                                        View
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* 📊 YOUR ASSESSMENTS */}
                    <div>
                        <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            YOUR ASSESSMENTS
                        </h2>

                        {/* 4 Assessment Tiles */}
                        <div className="grid grid-cols-4 gap-2">
                            {/* Zone of Genius */}
                            <CharacterTile
                                id="zog"
                                title="Genius"
                                icon={<Sparkles className="w-full h-full" />}
                                color="#9b5de5"
                                progress={zogSnapshot ? 100 : 0}
                                isLocked={!zogSnapshot}
                                unlockHint="Start"
                                size="sm"
                                onClick={() => navigate(zogSnapshot ? "/zone-of-genius" : "/zone-of-genius/entry")}
                            />

                            {/* Quality of Life */}
                            <CharacterTile
                                id="qol"
                                title="Life"
                                icon={<Heart className="w-full h-full" />}
                                color="#ff6b35"
                                progress={qolSnapshot ? 100 : 0}
                                isLocked={!qolSnapshot}
                                unlockHint="Start"
                                size="sm"
                                onClick={() => navigate(qolSnapshot ? "/quality-of-life-map/results" : "/quality-of-life-map/assessment")}
                            />

                            {/* Genius Offer */}
                            <CharacterTile
                                id="genius-offer"
                                title="Offer"
                                icon={<Gift className="w-full h-full" />}
                                color="#f5a623"
                                progress={geniusOffer?.status === "completed" ? 100 : geniusOffer ? 50 : 0}
                                isLocked={!zogSnapshot}
                                unlockHint="ZoG"
                                size="sm"
                                onClick={() => navigate(geniusOffer ? "/profile" : "/genius-offer-intake")}
                            />

                            {/* Multiple Intelligences */}
                            <CharacterTile
                                id="mi"
                                title="MI"
                                icon={<TrendingUp className="w-full h-full" />}
                                color="#4361ee"
                                size="sm"
                                onClick={() => navigate("/intelligences")}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CharacterHub;

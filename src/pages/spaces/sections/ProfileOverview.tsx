import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, Target, Sparkles, Map, Boxes, ArrowRight, Settings, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";
import PlayerStatsBadge from "@/components/game/PlayerStatsBadge";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";

interface ProfileData {
    level: number;
    xp_total: number;
    current_streak_days: number;
    // ZoG data
    zogArchetype?: string;
    zogSentence?: string;
    // QoL data
    qolScore?: number;
    // Genius Business data
    businessName?: string;
    businessTagline?: string;
}

const ProfileOverviewContent = () => {
    const [data, setData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadProfileData = async () => {
            try {
                const profileId = await getOrCreateGameProfileId();

                // Load game_profiles data including excalibur_data
                const { data: profile } = await supabase
                    .from("game_profiles")
                    .select("level, xp_total, current_streak_days, excalibur_data")
                    .eq("id", profileId)
                    .maybeSingle();

                // Load ZoG snapshot
                const { data: snapshot } = await supabase
                    .from("zog_snapshots")
                    .select("appleseed_data, archetype_title, core_pattern")
                    .eq("profile_id", profileId)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                // Load QoL data
                const { data: qol } = await supabase
                    .from("qol_snapshots")
                    .select("overall_score")
                    .eq("profile_id", profileId)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (!isMounted) return;

                // Extract business data from excalibur_data
                const excalibur = profile?.excalibur_data as any;

                setData({
                    level: profile?.level ?? 0,
                    xp_total: profile?.xp_total ?? 0,
                    current_streak_days: profile?.current_streak_days ?? 0,
                    zogArchetype: snapshot?.archetype_title,
                    zogSentence: snapshot?.core_pattern,
                    qolScore: qol?.overall_score,
                    businessName: excalibur?.businessIdentity?.name,
                    businessTagline: excalibur?.businessIdentity?.tagline,
                });
            } catch {
                // Ignore profile stats failures.
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        loadProfileData();
        return () => {
            isMounted = false;
        };
    }, []);

    const Skeleton = ({ className }: { className?: string }) => (
        <div className={`animate-pulse rounded bg-slate-200 ${className || ""}`} />
    );

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <User className="w-6 h-6 text-slate-700" />
                    <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
                </div>
                <p className="text-slate-600">Know yourself. Build your character.</p>
                {isLoading ? (
                    <div className="mt-4">
                        <Skeleton className="h-6 w-40" />
                    </div>
                ) : (
                    data && (
                        <div className="mt-4">
                            <PlayerStatsBadge
                                level={data.level}
                                xpTotal={data.xp_total}
                                streakDays={data.current_streak_days}
                                size="sm"
                            />
                        </div>
                    )
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {isLoading && (
                    <>
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </>
                )}

                {/* Zone of Genius Card - with summary */}
                {!isLoading && (
                    <div className="rounded-xl border border-[#a4a3d0]/30 bg-gradient-to-br from-[#e7e9e5] to-[#dcdde2] p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-[#8460ea] mb-2">
                                    <Sparkles className="w-5 h-5" />
                                    <h3 className="font-semibold">Zone of Genius</h3>
                                </div>
                                {data?.zogArchetype ? (
                                    <div className="space-y-1">
                                        <p className="text-[#2c3150] font-medium">{data.zogArchetype}</p>
                                        <p className="text-sm text-[#a4a3d0] line-clamp-2">{data.zogSentence}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-[#a4a3d0]">
                                        Discover how you create value.
                                    </p>
                                )}
                            </div>
                            <Button asChild variant="wabi-ghost" size="sm">
                                <Link to="/zone-of-genius/entry">
                                    {data?.zogArchetype ? "View" : "Start"} <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Genius Business Card - with summary */}
                {!isLoading && (
                    <div className="rounded-xl border border-[#a4a3d0]/30 bg-gradient-to-br from-[#e7e9e5] to-[#dcdde2] p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-[#8460ea] mb-2">
                                    <Briefcase className="w-5 h-5" />
                                    <h3 className="font-semibold">Genius Business</h3>
                                </div>
                                {data?.businessName ? (
                                    <div className="space-y-1">
                                        <p className="text-[#2c3150] font-medium">{data.businessName}</p>
                                        <p className="text-sm text-[#a4a3d0] line-clamp-2">{data.businessTagline}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-[#a4a3d0]">
                                        Monetize your genius.
                                    </p>
                                )}
                            </div>
                            <Button asChild variant="wabi-ghost" size="sm">
                                <Link to="/game/profile/genius-business">
                                    {data?.businessName ? "View" : "Create"} <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Quality of Life Card - with summary */}
                {!isLoading && (
                    <div className="rounded-xl border border-[#a4a3d0]/30 bg-gradient-to-br from-[#e7e9e5] to-[#dcdde2] p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-[#8460ea] mb-2">
                                    <Map className="w-5 h-5" />
                                    <h3 className="font-semibold">Quality of Life</h3>
                                </div>
                                {data?.qolScore ? (
                                    <div className="space-y-1">
                                        <p className="text-[#2c3150] font-medium">Score: {data.qolScore.toFixed(1)}/10</p>
                                        <p className="text-sm text-[#a4a3d0]">Across 8 life domains</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-[#a4a3d0]">
                                        Assess your life across 8 domains.
                                    </p>
                                )}
                            </div>
                            <Button asChild variant="wabi-ghost" size="sm">
                                <Link to="/quality-of-life-map/assessment">
                                    {data?.qolScore ? "View" : "Start"} <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* My Mission Card */}
                {!isLoading && (
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-slate-700 mb-2">
                                    <Target className="w-5 h-5" />
                                    <h3 className="font-semibold">My Mission</h3>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Check or update your mission commitment.
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/game/profile/mission">
                                    Open <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Assets Card */}
                {!isLoading && (
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-slate-700 mb-2">
                                    <Boxes className="w-5 h-5" />
                                    <h3 className="font-semibold">Assets</h3>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Review and grow your saved assets.
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/game/profile/assets">
                                    Open <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Settings with Reset */}
                {!isLoading && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-red-700 mb-2">
                                    <Settings className="w-5 h-5" />
                                    <h3 className="font-semibold">Account Settings</h3>
                                </div>
                                <p className="text-sm text-red-600">
                                    Manage account, billing, or reset your progress.
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                                <Link to="/settings">
                                    Open <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProfileOverview = () => {
    return (
        <GameShellV2>
            <ProfileOverviewContent />
        </GameShellV2>
    );
};

export default ProfileOverview;
export { ProfileOverviewContent };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, Target, Sparkles, Map, Boxes, ArrowRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";
import PlayerStatsBadge from "@/components/game/PlayerStatsBadge";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";

const ProfileOverviewContent = () => {
    const [stats, setStats] = useState<{
        level: number;
        xp_total: number;
        current_streak_days: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadStats = async () => {
            try {
                const profileId = await getOrCreateGameProfileId();
                const { data } = await supabase
                    .from("game_profiles")
                    .select("level, xp_total, current_streak_days")
                    .eq("id", profileId)
                    .maybeSingle();
                if (!isMounted || !data) return;
                setStats({
                    level: data.level ?? 0,
                    xp_total: data.xp_total ?? 0,
                    current_streak_days: data.current_streak_days ?? 0,
                });
            } catch {
                // Ignore profile stats failures.
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        loadStats();
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
                    stats && (
                        <div className="mt-4">
                            <PlayerStatsBadge
                                level={stats.level}
                                xpTotal={stats.xp_total}
                                streakDays={stats.current_streak_days}
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

                {!isLoading && (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2 text-slate-700 mb-2">
                                <Sparkles className="w-5 h-5" />
                                <h3 className="font-semibold">Zone of Genius</h3>
                            </div>
                            <p className="text-sm text-slate-600">
                                Discover how you create value.
                            </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link to="/zone-of-genius/entry">
                                Open <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
                )}

                {!isLoading && (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2 text-slate-700 mb-2">
                                <Map className="w-5 h-5" />
                                <h3 className="font-semibold">Quality of Life</h3>
                            </div>
                            <p className="text-sm text-slate-600">
                                Assess your life across 8 domains.
                            </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link to="/quality-of-life-map/assessment">
                                Open <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
                )}

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

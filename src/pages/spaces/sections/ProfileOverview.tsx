import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, Sparkles, Briefcase, Map, Target, Boxes, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";
import PlayerStatsBadge from "@/components/game/PlayerStatsBadge";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { getOnboardingStep } from "@/lib/onboardingProgress";

interface ProfileData {
    firstName: string | null;
    level: number;
    xpTotal: number;
    streakDays: number;
    onboardingStage: string | null;
}

const ProfileOverviewContent = () => {
    const [data, setData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            try {
                const profileId = await getOrCreateGameProfileId();
                const { data: profile } = await supabase
                    .from("game_profiles")
                    .select("first_name, level, xp_total, current_streak_days, onboarding_stage")
                    .eq("id", profileId)
                    .maybeSingle();

                if (!isMounted) return;
                setData({
                    firstName: profile?.first_name ?? null,
                    level: profile?.level ?? 0,
                    xpTotal: profile?.xp_total ?? 0,
                    streakDays: profile?.current_streak_days ?? 0,
                    onboardingStage: profile?.onboarding_stage ?? null,
                });
            } catch {
                // Silent fail
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, []);

    const currentStep = getOnboardingStep(data?.onboardingStage);

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 max-w-2xl mx-auto flex items-center justify-center min-h-[50vh]">
                <div className="text-white/30 animate-pulse text-sm">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
            {/* Welcome Header */}
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#8460ea]/15 flex items-center justify-center ring-1 ring-white/10">
                    <User className="w-8 h-8 text-[#8460ea]" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                    {data?.firstName ? `Hello, ${data.firstName}!` : "Your Profile"}
                </h1>
                <p className="text-white/40">
                    Know yourself. Build your character.
                </p>
            </div>

            {/* Stats */}
            {data && (
                <div className="flex justify-center">
                    <PlayerStatsBadge
                        level={data.level}
                        xpTotal={data.xpTotal}
                        streakDays={data.streakDays}
                        size="md"
                    />
                </div>
            )}

            {/* Onboarding Progress */}
            <div className="rounded-2xl liquid-glass ring-1 ring-white/10 p-6">
                <OnboardingProgress currentStep={currentStep} />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
                <Link
                    to="/zone-of-genius/entry"
                    className="flex items-center gap-3 p-4 rounded-xl liquid-glass ring-1 ring-white/10 hover:ring-[#8460ea]/30 hover:bg-white/[0.03] transition-all group"
                >
                    <Sparkles className="w-5 h-5 text-[#8460ea]" />
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Top Talent</span>
                </Link>
                <Link
                    to="/game/me/genius-business"
                    className="flex items-center gap-3 p-4 rounded-xl liquid-glass ring-1 ring-white/10 hover:ring-[#8460ea]/30 hover:bg-white/[0.03] transition-all group"
                >
                    <Briefcase className="w-5 h-5 text-[#8460ea]" />
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Genius Business</span>
                </Link>
                <Link
                    to="/quality-of-life-map/assessment"
                    className="flex items-center gap-3 p-4 rounded-xl liquid-glass ring-1 ring-white/10 hover:ring-[#8460ea]/30 hover:bg-white/[0.03] transition-all group"
                >
                    <Map className="w-5 h-5 text-[#8460ea]" />
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Quality of Life</span>
                </Link>
                <Link
                    to="/game/me/mission"
                    className="flex items-center gap-3 p-4 rounded-xl liquid-glass ring-1 ring-white/10 hover:ring-[#8460ea]/30 hover:bg-white/[0.03] transition-all group"
                >
                    <Target className="w-5 h-5 text-[#8460ea]" />
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">My Mission</span>
                </Link>
            </div>

            {/* Profile settings moved to the unified Settings page (2026-04-21).
                Reachable via the Settings button at the bottom of the spaces rail. */}
        </div>
    );
};

const ProfileOverview = () => (
    <GameShellV2>
        <ProfileOverviewContent />
    </GameShellV2>
);

export { ProfileOverviewContent };
export default ProfileOverview;

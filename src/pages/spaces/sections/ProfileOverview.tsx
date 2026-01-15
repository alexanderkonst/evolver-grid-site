import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, Sparkles, Briefcase, Map, Target, Boxes, Settings, ArrowRight } from "lucide-react";
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

    return (
        <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
            {/* Welcome Header */}
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#8460ea]/20 to-[#a4a3d0]/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-[#8460ea]" />
                </div>
                <h1 className="text-2xl font-bold text-[#2c3150] mb-2">
                    {isLoading ? "Loading..." : data?.firstName ? `Hello, ${data.firstName}!` : "Your Profile"}
                </h1>
                <p className="text-[#a4a3d0]">
                    Know yourself. Build your character.
                </p>
            </div>

            {/* Stats */}
            {!isLoading && data && (
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
            {!isLoading && (
                <div className="rounded-2xl border border-[#a4a3d0]/20 bg-gradient-to-br from-[#e7e9e5] to-[#dcdde2] p-6">
                    <OnboardingProgress currentStep={currentStep} />
                </div>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
                <Link
                    to="/zone-of-genius/entry"
                    className="flex items-center gap-3 p-4 rounded-xl border border-[#a4a3d0]/20 bg-white/50 hover:bg-[#8460ea]/5 transition-colors"
                >
                    <Sparkles className="w-5 h-5 text-[#8460ea]" />
                    <span className="text-sm font-medium text-[#2c3150]">Zone of Genius</span>
                </Link>
                <Link
                    to="/game/profile/genius-business"
                    className="flex items-center gap-3 p-4 rounded-xl border border-[#a4a3d0]/20 bg-white/50 hover:bg-[#8460ea]/5 transition-colors"
                >
                    <Briefcase className="w-5 h-5 text-[#8460ea]" />
                    <span className="text-sm font-medium text-[#2c3150]">Genius Business</span>
                </Link>
                <Link
                    to="/quality-of-life-map/assessment"
                    className="flex items-center gap-3 p-4 rounded-xl border border-[#a4a3d0]/20 bg-white/50 hover:bg-[#8460ea]/5 transition-colors"
                >
                    <Map className="w-5 h-5 text-[#8460ea]" />
                    <span className="text-sm font-medium text-[#2c3150]">Quality of Life</span>
                </Link>
                <Link
                    to="/game/profile/mission"
                    className="flex items-center gap-3 p-4 rounded-xl border border-[#a4a3d0]/20 bg-white/50 hover:bg-[#8460ea]/5 transition-colors"
                >
                    <Target className="w-5 h-5 text-[#8460ea]" />
                    <span className="text-sm font-medium text-[#2c3150]">My Mission</span>
                </Link>
            </div>

            {/* Settings Link */}
            <div className="text-center">
                <Link
                    to="/game/profile/settings"
                    className="inline-flex items-center gap-2 text-sm text-[#a4a3d0] hover:text-[#8460ea] transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                </Link>
            </div>
        </div>
    );
};

const ProfileOverview = () => (
    <GameShellV2>
        <ProfileOverviewContent />
    </GameShellV2>
);

export default ProfileOverview;

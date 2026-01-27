import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import OnboardingFlow from "@/modules/onboarding/OnboardingFlow";
import { Loader2 } from "lucide-react";

/**
 * OnboardingPage - Entry point for /start route
 * Handles auth check and loads OnboardingFlow with user profile data
 */
const OnboardingPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState<{
        profileId: string;
        initialStep: number | null;
        hasZog: boolean;
        hasQol: boolean;
    } | null>(null);

    useEffect(() => {
        const checkAuthAndProfile = async () => {
            // Check if user is authenticated
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Redirect to auth with return to /start
                navigate("/auth?mode=signup&redirect=/start");
                return;
            }

            // Fetch game profile - using actual column names
            const { data: profile, error } = await supabase
                .from("game_profiles")
                .select("id, onboarding_step, onboarding_completed, zone_of_genius_completed, last_zog_snapshot_id, last_qol_snapshot_id")
                .eq("user_id", user.id)
                .single();

            if (error || !profile) {
                // Create profile if doesn't exist
                const { data: newProfile, error: createError } = await supabase
                    .from("game_profiles")
                    .insert({ user_id: user.id })
                    .select("id, onboarding_step, onboarding_completed, zone_of_genius_completed, last_zog_snapshot_id, last_qol_snapshot_id")
                    .single();

                if (createError || !newProfile) {
                    console.error("Failed to create profile:", createError);
                    return;
                }

                setProfileData({
                    profileId: newProfile.id,
                    initialStep: newProfile.onboarding_step ?? 0,
                    hasZog: newProfile.zone_of_genius_completed === true || !!newProfile.last_zog_snapshot_id,
                    hasQol: !!newProfile.last_qol_snapshot_id
                });
            } else {
                // Check if onboarding is already completed
                if (profile.onboarding_completed) {
                    navigate("/game");
                    return;
                }

                setProfileData({
                    profileId: profile.id,
                    initialStep: profile.onboarding_step ?? 0,
                    hasZog: profile.zone_of_genius_completed === true || !!profile.last_zog_snapshot_id,
                    hasQol: !!profile.last_qol_snapshot_id
                });
            }

            setLoading(false);
        };

        checkAuthAndProfile();
    }, [navigate]);

    const handleComplete = () => {
        navigate("/game");
    };

    if (loading) {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-[var(--wabi-lavender)] via-[var(--wabi-background)] to-[var(--wabi-lilac)]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--depth-violet)]" />
                    <p className="text-[var(--wabi-text-secondary)]">Preparing your journey...</p>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return null;
    }

    return (
        <OnboardingFlow
            profileId={profileData.profileId}
            initialStep={profileData.initialStep}
            hasZog={profileData.hasZog}
            hasQol={profileData.hasQol}
            onComplete={handleComplete}
        />
    );
};

export default OnboardingPage;

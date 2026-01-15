import { Button } from "@/components/ui/button";
import { Save, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ShareZoG from "@/components/sharing/ShareZoG";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import { AppleseedData } from "./appleseedGenerator";

interface AppleseedDisplayProps {
    appleseed: AppleseedData;
    profileUrl?: string;
    profileId?: string;
    onSaveGenius?: () => void;
    onCreateBusiness?: () => void;
    isSaving?: boolean;
    isSaved?: boolean;
    isGuest?: boolean;
}

/**
 * AppleseedDisplay - Simplified for drip-feed onboarding
 * Shows: RevelatoryHero + ShareButton + Save My Genius
 * For guests: after save, redirects to signup
 * For auth users: shows Reveal My Genius Business button
 */
const AppleseedDisplay = ({
    appleseed,
    profileUrl,
    profileId,
    onSaveGenius,
    onCreateBusiness,
    isSaving,
    isSaved,
    isGuest = true
}: AppleseedDisplayProps) => {
    const navigate = useNavigate();

    // Redirect guests to signup after save
    useEffect(() => {
        if (isSaved && isGuest) {
            // Small delay for celebration animation
            const timer = setTimeout(() => {
                navigate("/auth?mode=signup&redirect=/game");
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isSaved, isGuest, navigate]);

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            {/* Epic Revelatory Hero - The core genius reveal */}
            <RevelatoryHero
                type="appleseed"
                title={appleseed.vibrationalKey.name}
                tagline="Your genius is to be a"
                actionStatement={appleseed.bullseyeSentence}
                threeLenses={{
                    actions: appleseed.threeLenses.actions,
                    primeDriver: appleseed.threeLenses.primeDriver,
                    archetype: appleseed.threeLenses.archetype,
                }}
            />

            {/* Share Your Genius - Dropdown button */}
            <ShareZoG
                archetypeName={appleseed.vibrationalKey.name}
                tagline={appleseed.bullseyeSentence}
                primeDriver={appleseed.threeLenses.primeDriver}
                talents={appleseed.threeLenses.actions}
                archetype={appleseed.threeLenses.archetype}
                profileUrl={profileUrl}
                profileId={profileId}
            />

            {/* Save My Genius - For guests, saves to localStorage then redirects to signup */}
            {onSaveGenius && !isSaved && (
                <Button
                    variant="wabi-primary"
                    size="lg"
                    className="w-full"
                    onClick={onSaveGenius}
                    disabled={isSaving}
                >
                    <Save className="w-5 h-5 mr-2" />
                    {isSaving ? "Saving..." : "Save My Genius"}
                </Button>
            )}

            {/* Guest: Show celebration then redirect to signup */}
            {isSaved && isGuest && (
                <div className="text-center py-4">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {['🎉', '✨', '⭐', '💫', '🌟'].map((emoji, i) => (
                            <span
                                key={i}
                                className="absolute text-2xl animate-bounce"
                                style={{
                                    left: `${10 + i * 20}%`,
                                    top: `${-10 + (i % 3) * 10}%`,
                                    animationDelay: `${i * 0.2}s`,
                                    animationDuration: '1.5s'
                                }}
                            >
                                {emoji}
                            </span>
                        ))}
                    </div>
                    <p className="text-lg font-semibold text-[#8460ea] animate-pulse">
                        🎊 Genius Saved! Creating your account...
                    </p>
                </div>
            )}

            {/* Auth user: Show Reveal My Genius Business */}
            {isSaved && !isGuest && onCreateBusiness && (
                <div className="space-y-3">
                    <div className="text-center py-2">
                        <p className="text-lg font-semibold text-[#8460ea]">
                            Your Genius is Saved!
                        </p>
                        <p className="text-sm text-[#a4a3d0] mt-1">
                            Ready to discover how to monetize it?
                        </p>
                    </div>
                    <Button
                        variant="wabi-primary"
                        size="lg"
                        className="w-full shadow-[0_0_30px_rgba(132,96,234,0.5)] hover:shadow-[0_0_40px_rgba(132,96,234,0.7)] transition-all"
                        onClick={onCreateBusiness}
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Reveal My Genius Business
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AppleseedDisplay;

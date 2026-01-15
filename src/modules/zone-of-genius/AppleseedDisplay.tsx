import { Button } from "@/components/ui/button";
import { User, Sparkles } from "lucide-react";
import ShareZoG from "@/components/sharing/ShareZoG";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import { AppleseedData } from "./appleseedGenerator";

interface AppleseedDisplayProps {
    appleseed: AppleseedData;
    profileUrl?: string;
    profileId?: string;
    onSaveToProfile?: () => void;
    onCreateBusiness?: () => void;
    isSaving?: boolean;
    isSaved?: boolean;
}

/**
 * AppleseedDisplay - Simplified for drip-feed onboarding
 * Shows: RevelatoryHero + ShareButton + Save to Profile + Create Business CTA
 * Fits on one screen
 */
const AppleseedDisplay = ({ appleseed, profileUrl, profileId, onSaveToProfile, onCreateBusiness, isSaving, isSaved }: AppleseedDisplayProps) => {
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

            {/* Save to My Profile - Triggers signup for guests */}
            {onSaveToProfile && !isSaved && (
                <Button
                    variant="wabi-primary"
                    size="lg"
                    className="w-full"
                    onClick={onSaveToProfile}
                    disabled={isSaving}
                >
                    <User className="w-5 h-5 mr-2" />
                    {isSaving ? "Saving..." : "Save to My Profile"}
                </Button>
            )}

            {/* Celebration + Reveal Genius Business CTA - Shows after save */}
            {isSaved && onCreateBusiness && (
                <div className="space-y-3 relative">
                    {/* Confetti celebration effect */}
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

                    {/* Celebration text */}
                    <div className="text-center py-2">
                        <p className="text-lg font-semibold text-[#8460ea] animate-pulse">
                            🎊 Saved! Your genius is captured!
                        </p>
                        <p className="text-sm text-[#a4a3d0] mt-1">
                            Ready to discover how to monetize it?
                        </p>
                    </div>

                    {/* Glowing CTA Button */}
                    <Button
                        variant="wabi-primary"
                        size="lg"
                        className="w-full relative overflow-hidden shadow-[0_0_30px_rgba(132,96,234,0.5)] hover:shadow-[0_0_40px_rgba(132,96,234,0.7)] transition-all animate-pulse"
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


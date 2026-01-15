import { Button } from "@/components/ui/button";
import { Save, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ShareZoG from "@/components/sharing/ShareZoG";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import { AppleseedData } from "./appleseedGenerator";

interface AppleseedDisplayProps {
    appleseed: AppleseedData;
    profileUrl?: string;
    profileId?: string;
    onSaveGenius?: () => Promise<void> | void;
    onCreateBusiness?: () => void;
    isSaving?: boolean;
    isGuest?: boolean;
}

/**
 * AppleseedDisplay - Simplified for drip-feed onboarding
 * Shows: RevelatoryHero + ShareButton + Save My Genius
 * For guests: button saves then redirects to signup
 * For auth users: button saves then shows Reveal My Genius Business
 */
const AppleseedDisplay = ({
    appleseed,
    profileUrl,
    profileId,
    onSaveGenius,
    onCreateBusiness,
    isSaving,
    isGuest = true
}: AppleseedDisplayProps) => {
    const navigate = useNavigate();

    // Handle save + redirect for guests
    const handleSaveClick = async () => {
        if (onSaveGenius) {
            await onSaveGenius();
        }
        if (isGuest) {
            // Redirect to signup after save
            navigate("/auth?mode=signup&redirect=/game");
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-2 space-y-3">
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
            {isGuest && onSaveGenius && (
                <Button
                    variant="wabi-primary"
                    size="lg"
                    className="w-full"
                    onClick={handleSaveClick}
                    disabled={isSaving}
                >
                    <Save className="w-5 h-5 mr-2" />
                    {isSaving ? "Saving..." : "Save My Genius"}
                </Button>
            )}

            {/* Auth user: Show Reveal My Genius Business */}
            {!isGuest && onCreateBusiness && (
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

import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import ShareZoG from "@/components/sharing/ShareZoG";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import { AppleseedData } from "./appleseedGenerator";

interface AppleseedDisplayProps {
    appleseed: AppleseedData;
    profileUrl?: string;
    profileId?: string;
    onSaveToProfile?: () => void;
    isSaving?: boolean;
}

/**
 * AppleseedDisplay - Simplified for drip-feed onboarding
 * Shows: RevelatoryHero + ShareButton + Save to Profile
 * Fits on one screen
 */
const AppleseedDisplay = ({ appleseed, profileUrl, profileId, onSaveToProfile, isSaving }: AppleseedDisplayProps) => {
    return (
        <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
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
            {onSaveToProfile && (
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
        </div>
    );
};

export default AppleseedDisplay;


import { Button } from "@/components/ui/button";
import { User, Briefcase } from "lucide-react";
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

            {/* Create Genius Business CTA - Shows after save */}
            {isSaved && onCreateBusiness && (
                <div className="space-y-3">
                    <div className="text-center">
                        <p className="text-sm text-[#a4a3d0]">
                            ✨ Saved! Ready for the next step?
                        </p>
                    </div>
                    <Button
                        variant="wabi-secondary"
                        size="lg"
                        className="w-full"
                        onClick={onCreateBusiness}
                    >
                        <Briefcase className="w-5 h-5 mr-2" />
                        Create Your Genius Business
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AppleseedDisplay;

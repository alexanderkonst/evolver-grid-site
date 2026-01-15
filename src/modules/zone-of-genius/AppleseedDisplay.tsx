import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import ShareZoG from "@/components/sharing/ShareZoG";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import { AppleseedData } from "./appleseedGenerator";

interface AppleseedDisplayProps {
    appleseed: AppleseedData;
    profileUrl?: string;
    profileId?: string;
    onCreateBusiness?: () => void;
    isSaved?: boolean;
}

/**
 * AppleseedDisplay - For authenticated users only (signup-first flow)
 * Shows: RevelatoryHero + ShareButton + Reveal My Genius Business
 * Data is auto-saved to database in background
 */
const AppleseedDisplay = ({
    appleseed,
    profileUrl,
    profileId,
    onCreateBusiness,
    isSaved = true
}: AppleseedDisplayProps) => {

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

            {/* Reveal My Genius Business - Main CTA for auth users */}
            {onCreateBusiness && (
                <Button
                    variant="wabi-primary"
                    size="lg"
                    className="w-full shadow-[0_0_30px_rgba(132,96,234,0.5)] hover:shadow-[0_0_40px_rgba(132,96,234,0.7)] transition-all"
                    onClick={onCreateBusiness}
                >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Reveal My Genius Business
                </Button>
            )}
        </div>
    );
};

export default AppleseedDisplay;

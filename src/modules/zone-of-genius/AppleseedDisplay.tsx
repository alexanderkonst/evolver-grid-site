import { Button } from "@/components/ui/button";
import { Sparkles, Share2, Copy, Check } from "lucide-react";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import ShareZoG from "@/components/sharing/ShareZoG";
import { AppleseedData } from "./appleseedGenerator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AppleseedDisplayProps {
    appleseed: AppleseedData;
    profileUrl?: string;
    profileId?: string;
    onCreateBusiness?: () => void;
    isSaved?: boolean;
}

/**
 * AppleseedDisplay - For authenticated users only (signup-first flow)
 * Shows: RevelatoryHero + Share buttons + Reveal My Genius Business + ShareZoG dropdown
 */
const AppleseedDisplay = ({
    appleseed,
    profileUrl,
    profileId,
    onCreateBusiness,
    isSaved = true
}: AppleseedDisplayProps) => {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleShare = async () => {
        const shareText = `My genius is to be a ${appleseed.vibrationalKey.name}. I ${appleseed.bullseyeSentence}`;

        // Try native share first
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${appleseed.vibrationalKey.name} - Zone of Genius`,
                    text: shareText,
                    url: profileUrl
                });
                return;
            } catch {
                // Fall through to clipboard
            }
        }

        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            toast({
                title: "Copied to clipboard!",
                description: "Share your genius with others.",
            });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({
                title: "Share failed",
                description: "Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-2 space-y-4">
            {/* Epic Revelatory Hero - The core genius reveal */}
            <RevelatoryHero
                type="appleseed"
                title={appleseed.vibrationalKey.name}
                tagline="My genius is to be a"
                actionStatement={appleseed.bullseyeSentence}
                threeLenses={{
                    actions: appleseed.threeLenses.actions,
                    primeDriver: appleseed.threeLenses.primeDriver,
                    archetype: appleseed.threeLenses.archetype,
                }}
            />

            {/* Quick action buttons: Share + Reveal My Genius Business - Side by side */}
            <div className="flex gap-3 justify-center">
                {/* Quick Share Button (mobile-friendly native share) */}
                <Button
                    variant="wabi-ghost"
                    className="px-6"
                    onClick={handleShare}
                >
                    {copied ? (
                        <Check className="w-4 h-4 mr-2" />
                    ) : (
                        <Share2 className="w-4 h-4 mr-2" />
                    )}
                    Share
                </Button>

                {/* Reveal My Genius Business - CTA */}
                {onCreateBusiness && (
                    <Button
                        variant="wabi-primary"
                        className="px-6 shadow-[0_0_20px_rgba(132,96,234,0.4)] hover:shadow-[0_0_30px_rgba(132,96,234,0.6)] transition-all"
                        onClick={onCreateBusiness}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Reveal My Genius Business
                    </Button>
                )}
            </div>

            {/* Full Share dropdown with pre-written text for social networks */}
            <ShareZoG
                archetypeName={appleseed.vibrationalKey.name}
                tagline={appleseed.bullseyeSentence}
                primeDriver={appleseed.threeLenses.primeDriver}
                talents={appleseed.threeLenses.actions}
                archetype={appleseed.threeLenses.archetype}
                profileId={profileId}
                profileUrl={profileUrl}
            />
        </div>
    );
};

export default AppleseedDisplay;

import { Button } from "@/components/ui/button";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Sparkles, Share2, Copy, Check } from "lucide-react";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import ShareZoG from "@/components/sharing/ShareZoG";
import ResonanceRating from "@/components/ui/ResonanceRating";
import { AppleseedData } from "./appleseedGenerator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AppleseedDisplayProps {
    appleseed: AppleseedData;
    profileUrl?: string;
    profileId?: string;
    onCreateBusiness?: () => void;
    isSaved?: boolean;
    onSave?: () => void;
    isSaving?: boolean;
    onResonanceRating?: (rating: number) => void;
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
    isSaved = true,
    onSave,
    isSaving = false,
    onResonanceRating
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

            {/* Resonance Rating - Validation metric */}
            {onResonanceRating && (
                <ResonanceRating
                    question="From 1 to 10, how well does this match how you see yourself at your brightest?"
                    onRate={onResonanceRating}
                />
            )}

            {/* Save to Profile CTA - Shows when not yet saved */}
            {!isSaved && onSave && (
                <div className="flex justify-center">
                    <PremiumButton
                        size="lg"
                        onClick={onSave}
                        loading={isSaving}
                        disabled={isSaving}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save to My Profile'}
                    </PremiumButton>
                </div>
            )}

            {/* Full Share dropdown with pre-written text for social networks */}
            {/* Only showing the dropdown - removed simple Share button as it was duplicate */}
            <div className="flex justify-center">
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

            {/* Reveal My Genius Business - Hidden for now, should only show after ZoG Profile Deep Dive */}
            {/* TODO: Show this after user has read their ZoG profile (zog_profile_read_at is set)
            {onCreateBusiness && (
                <div className="flex justify-center">
                    <PremiumButton
                        className="px-6"
                        onClick={onCreateBusiness}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Reveal My Genius Business
                    </PremiumButton>
                </div>
            )}
            */}
        </div>
    );
};

export default AppleseedDisplay;

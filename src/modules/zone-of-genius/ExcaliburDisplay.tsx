import { useState } from "react";
import { Copy, Check, Users, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareZoG from "@/components/sharing/ShareZoG";
import { ExcaliburData } from "./excaliburGenerator";

interface ExcaliburDisplayProps {
    excalibur: ExcaliburData;
    profileId?: string;
    onSaveToProfile?: () => void;
    isSaving?: boolean;
}

/**
 * GeniusBusinessDisplay - My Unique Genius Business
 * Compact one-screen layout: USP, Who, Promise
 * Form, Deliverable, Channels, BiggerArc → moved to profile section
 */
const ExcaliburDisplay = ({ excalibur, profileId, onSaveToProfile, isSaving }: ExcaliburDisplayProps) => {
    const [copiedOffer, setCopiedOffer] = useState(false);

    const handleCopyOffer = async () => {
        // Get first sentence of offer statement
        const firstSentence = excalibur.offer.statement.split('.')[0] + '.';
        await navigator.clipboard.writeText(firstSentence);
        setCopiedOffer(true);
        setTimeout(() => setCopiedOffer(false), 2000);
    };

    // Get first sentence of offer statement for USP
    const getFirstSentence = (text: string) => {
        const sentences = text.match(/[^.!?]+[.!?]+/g);
        return sentences ? sentences[0].trim() : text;
    };

    // Get first phrase of profile (before comma or full text if short)
    const getFirstPhrase = (text: string) => {
        const parts = text.split(',');
        return parts[0].trim();
    };

    // Create "I [action]" header from tagline
    const getActionHeader = () => {
        const tagline = excalibur.businessIdentity.tagline;
        // Capitalize first letter and ensure it starts with "I "
        const cleaned = tagline.replace(/^["']|["']$/g, '').trim();
        // If starts with lowercase verb, add "I "
        if (/^[a-z]/.test(cleaned)) {
            return "I " + cleaned;
        }
        return "I " + cleaned.toLowerCase();
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-2 space-y-3">
            {/* Hero: Action Statement as Header */}
            <div className="text-center space-y-2 py-4">
                <div className="inline-flex items-center justify-center w-[84px] h-[84px] rounded-full overflow-hidden mb-3">
                    <img
                        src="/genius-business-logo.png"
                        alt="Genius Business"
                        className="w-full h-full object-cover"
                    />
                </div>

                <p className="text-xs text-[#a4a3d0] uppercase tracking-wide">My Unique Genius Business</p>

                {/* Action Statement with "I" - Main Header */}
                <h1 className="text-xl lg:text-2xl font-bold text-[#2c3150] leading-tight">
                    {getActionHeader()}
                </h1>
            </div>

            {/* Compact Box with all sections */}
            <div className="p-4 bg-gradient-to-br from-white via-[#f5f5ff] to-[#ebe8f7] rounded-2xl border border-[#a4a3d0]/30 shadow-sm space-y-4">
                {/* My Unique Selling Proposition (first sentence only) */}
                <div>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <p className="text-xs text-[#8460ea] font-medium uppercase tracking-wide mb-1">My Unique Selling Proposition</p>
                            <p className="text-base text-[#2c3150] leading-relaxed">
                                {getFirstSentence(excalibur.offer.statement)}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyOffer}
                            className="shrink-0 h-8 w-8 p-0"
                        >
                            {copiedOffer ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[#a4a3d0]" />}
                        </Button>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#a4a3d0]/20" />

                {/* Who This Is For (first phrase only) */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-[#8460ea]" />
                        <p className="text-xs font-medium text-[#8460ea] uppercase tracking-wide">Who This Is For</p>
                    </div>
                    <p className="text-base text-[#2c3150]">{getFirstPhrase(excalibur.idealClient.profile)}</p>
                </div>

                {/* Divider */}
                <div className="border-t border-[#a4a3d0]/20" />

                {/* Transformational Promise (A → B only) */}
                <div>
                    <p className="text-xs font-medium text-[#8460ea] uppercase tracking-wide mb-2">Transformational Promise</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 p-2 bg-white/80 rounded-lg">
                            <p className="text-[10px] text-[#a4a3d0] uppercase">From</p>
                            <p className="text-sm text-[#2c3150]">{excalibur.transformationalPromise.fromState}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#8460ea] shrink-0" />
                        <div className="flex-1 p-2 bg-white/80 rounded-lg">
                            <p className="text-[10px] text-[#a4a3d0] uppercase">To</p>
                            <p className="text-sm text-[#2c3150]">{excalibur.transformationalPromise.toState}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Button */}
            <ShareZoG
                archetypeName={excalibur.businessIdentity.name}
                tagline={excalibur.businessIdentity.tagline}
                primeDriver={excalibur.essenceAnchor.primeDriver}
                profileId={profileId}
            />

            {/* Save and Go to My Profile Button */}
            {onSaveToProfile && (
                <Button
                    variant="wabi-primary"
                    size="lg"
                    className="w-full"
                    onClick={onSaveToProfile}
                    disabled={isSaving}
                >
                    <User className="w-5 h-5 mr-2" />
                    {isSaving ? "Saving..." : "Save and Go to My Profile"}
                </Button>
            )}
        </div>
    );
};

export default ExcaliburDisplay;

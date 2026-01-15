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
 * All in one compact box: logo, title, USP, Who, Promise
 */
const ExcaliburDisplay = ({ excalibur, profileId, onSaveToProfile, isSaving }: ExcaliburDisplayProps) => {
    const [copiedOffer, setCopiedOffer] = useState(false);

    const handleCopyOffer = async () => {
        const firstSentence = getFirstSentence(excalibur.offer.statement);
        await navigator.clipboard.writeText(firstSentence);
        setCopiedOffer(true);
        setTimeout(() => setCopiedOffer(false), 2000);
    };

    // Get first sentence of offer statement
    const getFirstSentence = (text: string) => {
        const sentences = text.match(/[^.!?]+[.!?]+/g);
        return sentences ? sentences[0].trim() : text;
    };

    // Create "I [verb] [rest]" header from offer statement
    // Takes first sentence and converts "I guide..." or extracts action verb
    const getActionHeader = () => {
        const firstSentence = getFirstSentence(excalibur.offer.statement);
        // Already starts with "I " - use as is
        if (firstSentence.toLowerCase().startsWith("i ")) {
            return firstSentence.replace(/\.$/, ""); // Remove trailing period
        }
        // Otherwise construct from businessIdentity.name
        const name = excalibur.businessIdentity.name; // e.g. "Holonic System Architect"
        // Try to make it active: "I architect holonic systems..."
        return `I ${name.toLowerCase()}`;
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-1 space-y-2">
            {/* Single Unified Box with everything */}
            <div className="p-4 bg-gradient-to-br from-white via-[#f5f5ff] to-[#ebe8f7] rounded-2xl border border-[#a4a3d0]/30 shadow-sm">
                {/* Header: Logo + Title + Action Statement */}
                <div className="text-center mb-3 pb-3 border-b border-[#a4a3d0]/20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden mb-2">
                        <img
                            src="/genius-business-logo.png"
                            alt="Genius Business"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <p className="text-[10px] text-[#a4a3d0] uppercase tracking-wide mb-1">My Unique Genius Business</p>
                    <h1 className="text-lg lg:text-xl font-bold text-[#2c3150] leading-tight">
                        {getActionHeader()}
                    </h1>
                </div>

                {/* Sections */}
                <div className="space-y-3">
                    {/* My Unique Selling Proposition (first sentence) */}
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <p className="text-[10px] text-[#8460ea] font-medium uppercase tracking-wide mb-0.5">My Unique Selling Proposition</p>
                                <p className="text-sm text-[#2c3150] leading-relaxed">
                                    {getFirstSentence(excalibur.offer.statement)}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyOffer}
                                className="shrink-0 h-7 w-7 p-0"
                            >
                                {copiedOffer ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-[#a4a3d0]" />}
                            </Button>
                        </div>
                    </div>

                    {/* Who This Is For (FULL text, no truncation) */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Users className="w-3 h-3 text-[#8460ea]" />
                            <p className="text-[10px] font-medium text-[#8460ea] uppercase tracking-wide">Who This Is For</p>
                        </div>
                        <p className="text-sm text-[#2c3150]">{excalibur.idealClient.profile}</p>
                    </div>

                    {/* Transformational Promise (A → B) */}
                    <div>
                        <p className="text-[10px] font-medium text-[#8460ea] uppercase tracking-wide mb-1">Transformational Promise</p>
                        <div className="flex items-center gap-1.5">
                            <div className="flex-1 p-1.5 bg-white/80 rounded-lg">
                                <p className="text-[9px] text-[#a4a3d0] uppercase">From</p>
                                <p className="text-xs text-[#2c3150]">{excalibur.transformationalPromise.fromState}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#8460ea] shrink-0" />
                            <div className="flex-1 p-1.5 bg-white/80 rounded-lg">
                                <p className="text-[9px] text-[#a4a3d0] uppercase">To</p>
                                <p className="text-xs text-[#2c3150]">{excalibur.transformationalPromise.toState}</p>
                            </div>
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

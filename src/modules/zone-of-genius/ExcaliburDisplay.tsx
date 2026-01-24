import { useState } from "react";
import { Copy, Check, Users, ArrowRight, User, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareZoG from "@/components/sharing/ShareZoG";
import ResonanceRating from "@/components/ui/ResonanceRating";
import { ExcaliburData } from "./excaliburGenerator";

interface ExcaliburDisplayProps {
    excalibur: ExcaliburData;
    profileId?: string;
    onSaveToProfile?: () => void;
    isSaving?: boolean;
    onResonanceRating?: (rating: number) => void;
    onLaunchProductBuilder?: () => void;
    showProductBuilderButton?: boolean;
}

/**
 * GeniusBusinessDisplay - My Unique Genius Business
 * Ultra-compact one-screen layout with Fraunces/Inter fonts
 */
const ExcaliburDisplay = ({ excalibur, profileId, onSaveToProfile, isSaving, onResonanceRating, onLaunchProductBuilder, showProductBuilderButton = true }: ExcaliburDisplayProps) => {
    const [copiedOffer, setCopiedOffer] = useState(false);

    const handleCopyOffer = async () => {
        const statement = excalibur?.offer?.statement || "";
        const firstSentence = getFirstSentence(statement);
        await navigator.clipboard.writeText(firstSentence);
        setCopiedOffer(true);
        setTimeout(() => setCopiedOffer(false), 2000);
    };

    const getFirstSentence = (text: string) => {
        const sentences = text.match(/[^.!?]+[.!?]+/g);
        return sentences ? sentences[0].trim() : text;
    };

    const getActionHeader = () => {
        const statement = excalibur?.offer?.statement || "";
        const firstSentence = getFirstSentence(statement);
        if (firstSentence.toLowerCase().startsWith("i ")) {
            return firstSentence.replace(/\.$/, "");
        }
        return `I ${excalibur?.businessIdentity?.name?.toLowerCase() || "help"}`;
    };

    return (
        <div className="max-w-2xl mx-auto px-3 py-1 space-y-1.5 font-['Inter',sans-serif]">
            {/* Single Unified Box */}
            <div className="p-3 bg-gradient-to-br from-white via-[#f5f5ff] to-[#ebe8f7] rounded-2xl border border-[#a4a3d0]/30 shadow-sm">
                {/* Header: Logo + Title + Action Statement */}
                <div className="text-center mb-2 pb-2 border-b border-[#a4a3d0]/20">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full overflow-hidden mb-1.5">
                        <img
                            src="/genius-business-logo.png"
                            alt="Genius Business"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <p className="text-[9px] text-[#a4a3d0] uppercase tracking-wider mb-0.5">My Unique Genius Business</p>
                    <h1 className="text-base lg:text-lg font-semibold text-[#2c3150] leading-snug font-['Fraunces',serif]">
                        {getActionHeader()}
                    </h1>
                </div>

                {/* Sections - Ultra Compact */}
                <div className="space-y-2">
                    {/* USP */}
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <p className="text-[9px] text-[#8460ea] font-medium uppercase tracking-wide mb-0.5">My Unique Selling Proposition</p>
                                <p className="text-xs text-[#2c3150] leading-relaxed">
                                    {getFirstSentence(excalibur?.offer?.statement || "")}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyOffer}
                                className="shrink-0 h-6 w-6 p-0"
                            >
                                {copiedOffer ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-[#a4a3d0]" />}
                            </Button>
                        </div>
                    </div>

                    {/* Who This Is For */}
                    <div>
                        <div className="flex items-center gap-1 mb-0.5">
                            <Users className="w-3 h-3 text-[#8460ea]" />
                            <p className="text-[9px] font-medium text-[#8460ea] uppercase tracking-wide">Who This Is For</p>
                        </div>
                        <p className="text-xs text-[#2c3150]">{excalibur?.idealClient?.profile || "Your ideal client"}</p>
                    </div>

                    {/* Transformational Promise */}
                    <div>
                        <p className="text-[9px] font-medium text-[#8460ea] uppercase tracking-wide mb-1">Transformational Promise</p>
                        <div className="flex items-center gap-1">
                            <div className="flex-1 p-1.5 bg-white/80 rounded-lg">
                                <p className="text-[8px] text-[#a4a3d0] uppercase">From</p>
                                <p className="text-[11px] text-[#2c3150] leading-tight">{excalibur?.transformationalPromise?.fromState || "Where they are"}</p>
                            </div>
                            <ArrowRight className="w-3 h-3 text-[#8460ea] shrink-0" />
                            <div className="flex-1 p-1.5 bg-white/80 rounded-lg">
                                <p className="text-[8px] text-[#a4a3d0] uppercase">To</p>
                                <p className="text-[11px] text-[#2c3150] leading-tight">{excalibur?.transformationalPromise?.toState || "Where they want to be"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resonance Rating - Validation metric */}
            {onResonanceRating && (
                <ResonanceRating
                    question="From 1 to 10, how clearly does this describe the value you can bring to others?"
                    onRate={onResonanceRating}
                />
            )}

            {/* Share Button */}
            <ShareZoG
                archetypeName={excalibur?.businessIdentity?.name || "Your Genius"}
                tagline={excalibur?.businessIdentity?.tagline || ""}
                primeDriver={excalibur?.essenceAnchor?.primeDriver || ""}
                profileId={profileId}
            />

            {/* Launch Product Builder - Bridge to Product Compiler */}
            {showProductBuilderButton && onLaunchProductBuilder && (
                <Button
                    type="button"
                    variant="default"
                    size="lg"
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    onClick={() => onLaunchProductBuilder()}
                >
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch Product Builder
                </Button>
            )}

            {/* Save Button */}
            {onSaveToProfile && (
                <Button
                    variant="wabi-primary"
                    size="lg"
                    className="w-full"
                    onClick={onSaveToProfile}
                    disabled={isSaving}
                >
                    <User className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save and Go to My Profile"}
                </Button>
            )}
        </div>
    );
};

export default ExcaliburDisplay;

import { useState } from "react";
import { Copy, Check, Users, ArrowRight, User, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumButton } from "@/components/ui/PremiumButton";
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
 * ExcaliburDisplay — My Unique Genius Business (light-surface glass)
 * Ultra-compact one-screen layout with glass card treatment
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
        <div className="max-w-2xl mx-auto px-3 py-1 space-y-3">
            {/* Single Unified Box — Light-surface Glass Card.
                Day 48 iter 7 (Sasha): all purple labels (#8460ea) +
                dividers (#a4a3d0) migrated to the signature gold
                palette so this screen reads as one family with the
                landing + entry CTAs. */}
            <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-sm alive-card">
                {/* Header: Icon + Title + Action Statement */}
                <div className="text-center mb-3 pb-3 border-b border-[#d4af37]/20">
                    <div className="flex justify-center mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f4d472]/20 to-[#a06d08]/12 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" style={{ color: "#7a5108" }} />
                        </div>
                    </div>
                    <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: "rgba(122, 81, 8, 0.7)" }}>My Unique Genius Business</p>
                    <h1 className="text-base lg:text-lg font-semibold text-[#2c3150] leading-snug font-display">
                        {getActionHeader()}
                    </h1>
                </div>

                {/* Sections - Ultra Compact */}
                <div className="space-y-2">
                    {/* USP */}
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <p className="text-[9px] font-medium uppercase tracking-wide mb-0.5" style={{ color: "#7a5108" }}>My Unique Selling Proposition</p>
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
                                {copiedOffer ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" style={{ color: "rgba(122, 81, 8, 0.55)" }} />}
                            </Button>
                        </div>
                    </div>

                    {/* Who This Is For */}
                    <div>
                        <div className="flex items-center gap-1 mb-0.5">
                            <Users className="w-3 h-3" style={{ color: "#7a5108" }} />
                            <p className="text-[9px] font-medium uppercase tracking-wide" style={{ color: "#7a5108" }}>Who This Is For</p>
                        </div>
                        <p className="text-xs text-[#2c3150]">{excalibur?.idealClient?.profile || "Your ideal client"}</p>
                    </div>

                    {/* Transformational Promise */}
                    <div>
                        <p className="text-[9px] font-medium uppercase tracking-wide mb-1" style={{ color: "#7a5108" }}>Transformational Promise</p>
                        <div className="flex items-center gap-1">
                            <div className="flex-1 p-1.5 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
                                <p className="text-[8px] uppercase" style={{ color: "rgba(122, 81, 8, 0.6)" }}>From</p>
                                <p className="text-[11px] text-[#2c3150] leading-tight">{excalibur?.transformationalPromise?.fromState || "Where they are"}</p>
                            </div>
                            <ArrowRight className="w-3 h-3 shrink-0" style={{ color: "#7a5108" }} />
                            <div className="flex-1 p-1.5 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
                                <p className="text-[8px] uppercase" style={{ color: "rgba(122, 81, 8, 0.6)" }}>To</p>
                                <p className="text-[11px] text-[#2c3150] leading-tight">{excalibur?.transformationalPromise?.toState || "Where they want to be"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resonance Rating — Specificity Loop step "excalibur" */}
            {onResonanceRating && (
                <ResonanceRating
                    step="excalibur"
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

            {/* Launch Product Builder — Day 48 iter 7 (Sasha):
                violet-blue gradient (#8460ea → #6894d0) swapped for
                the dark-glass + gold-halo pill used across the funnel. */}
            {showProductBuilderButton && onLaunchProductBuilder && (
                <button
                    type="button"
                    className="group liquid-glass-dark cta-breath w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
                        backgroundImage:
                            "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
                        boxShadow:
                            "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                    }}
                    onClick={() => onLaunchProductBuilder()}
                >
                    <Rocket className="w-4 h-4" style={{ color: "#f4d472" }} />
                    Launch Product Builder
                </button>
            )}

            {/* Save Button */}
            {onSaveToProfile && (
                <PremiumButton
                    size="lg"
                    className="w-full"
                    onClick={onSaveToProfile}
                    loading={isSaving}
                >
                    <User className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save and Go to My Profile"}
                </PremiumButton>
            )}
        </div>
    );
};

export default ExcaliburDisplay;

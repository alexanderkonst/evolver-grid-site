import { useState } from "react";
import { Briefcase, Copy, Check, Users, Radio, ArrowRight, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareZoG from "@/components/sharing/ShareZoG";
import { ExcaliburData } from "./excaliburGenerator";

interface ExcaliburDisplayProps {
    excalibur: ExcaliburData;
    onSaveToProfile?: () => void;
    isSaving?: boolean;
}

/**
 * GeniusBusinessDisplay - Shows the Genius Business (formerly Excalibur)
 * Compact one-screen layout with new structure
 */
const ExcaliburDisplay = ({ excalibur, onSaveToProfile, isSaving }: ExcaliburDisplayProps) => {
    const [copiedOffer, setCopiedOffer] = useState(false);

    const handleCopyOffer = async () => {
        await navigator.clipboard.writeText(excalibur.offer.statement);
        setCopiedOffer(true);
        setTimeout(() => setCopiedOffer(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
            {/* Hero: Business Name + Tagline */}
            <div className="text-center space-y-4 py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8460ea] to-[#29549f] mb-4">
                    <Briefcase className="w-8 h-8 text-white" />
                </div>

                <p className="text-sm text-[#a4a3d0] uppercase tracking-wide">My Genius Business</p>

                {/* 3-Word Business Name */}
                <h1 className="text-3xl lg:text-4xl font-bold text-[#2c3150]">
                    {excalibur.businessIdentity.name}
                </h1>

                {/* Product Hunt Tagline */}
                <p className="text-lg text-[#8460ea] font-medium italic">
                    "{excalibur.businessIdentity.tagline}"
                </p>
            </div>

            {/* Essence Anchor (Genius Apple Seed) */}
            <div className="p-4 bg-gradient-to-br from-[#a4a3d0]/10 to-[#c8b7d8]/10 rounded-2xl border border-[#a4a3d0]/30">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#8460ea]" />
                    <p className="text-sm font-medium text-[#2c3150]">Genius Apple Seed</p>
                </div>
                <p className="text-[#2c3150]">{excalibur.essenceAnchor.geniusAppleSeed}</p>
                <div className="flex gap-4 mt-3 text-sm text-[#a4a3d0]">
                    <span>Driver: {excalibur.essenceAnchor.primeDriver}</span>
                    <span>•</span>
                    <span>{excalibur.essenceAnchor.archetype}</span>
                </div>
            </div>

            {/* Your Offer */}
            <div className="p-5 bg-white rounded-2xl border border-[#a4a3d0]/30 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-[#8460ea] font-medium mb-2">Your Offer</p>
                        <p className="text-lg text-[#2c3150] leading-relaxed">
                            {excalibur.offer.statement}
                        </p>
                    </div>
                    <Button
                        variant="wabi-ghost"
                        size="sm"
                        onClick={handleCopyOffer}
                        className="shrink-0"
                    >
                        {copiedOffer ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>
                <div className="flex gap-6 mt-4 pt-4 border-t border-[#a4a3d0]/20 text-sm">
                    <div>
                        <p className="text-[#a4a3d0]">Form</p>
                        <p className="text-[#2c3150] font-medium">{excalibur.offer.form}</p>
                    </div>
                    <div>
                        <p className="text-[#a4a3d0]">Deliverable</p>
                        <p className="text-[#2c3150] font-medium">{excalibur.offer.deliverable}</p>
                    </div>
                </div>
            </div>

            {/* Ideal Client */}
            <div className="p-4 bg-white rounded-xl border border-[#a4a3d0]/30">
                <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-[#8460ea]" />
                    <p className="text-sm font-medium text-[#2c3150]">Who This Is For</p>
                </div>
                <p className="text-[#2c3150] mb-2">{excalibur.idealClient.profile}</p>
                <p className="text-sm text-[#a4a3d0]">Problem: {excalibur.idealClient.problem}</p>
                <div className="mt-3 p-3 bg-[#a4a3d0]/10 rounded-lg border-l-4 border-[#8460ea]">
                    <p className="text-sm text-[#a4a3d0]">Their Aha moment:</p>
                    <p className="text-[#2c3150] italic">"{excalibur.idealClient.aha}"</p>
                </div>
            </div>

            {/* Transformational Promise */}
            <div className="p-4 bg-gradient-to-r from-[#8460ea]/10 to-[#29549f]/10 rounded-xl border border-[#8460ea]/30">
                <p className="text-sm font-medium text-[#8460ea] mb-3">Transformational Promise</p>
                <div className="flex items-center gap-3">
                    <div className="flex-1 p-3 bg-white/80 rounded-lg">
                        <p className="text-xs text-[#a4a3d0]">Point A</p>
                        <p className="text-sm text-[#2c3150]">{excalibur.transformationalPromise.fromState}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#8460ea] shrink-0" />
                    <div className="flex-1 p-3 bg-white/80 rounded-lg">
                        <p className="text-xs text-[#a4a3d0]">Point B</p>
                        <p className="text-sm text-[#2c3150]">{excalibur.transformationalPromise.toState}</p>
                    </div>
                </div>
                <p className="text-sm text-[#2c3150] mt-3">{excalibur.transformationalPromise.journey}</p>
            </div>

            {/* Channels */}
            <div className="p-4 bg-white rounded-xl border border-[#a4a3d0]/30">
                <div className="flex items-center gap-2 mb-3">
                    <Radio className="w-4 h-4 text-[#8460ea]" />
                    <p className="text-sm font-medium text-[#2c3150]">How to Reach Them</p>
                </div>
                <div className="flex gap-4 text-sm">
                    <span className="text-[#2c3150]">{excalibur.channels.primary}</span>
                    <span className="text-[#a4a3d0]">•</span>
                    <span className="text-[#a4a3d0]">{excalibur.channels.secondary}</span>
                </div>
                <p className="mt-2 text-[#8460ea] italic">"{excalibur.channels.hook}"</p>
            </div>

            {/* Bigger Arc */}
            <div className="p-4 bg-[#2c3150] rounded-xl text-white">
                <p className="text-sm font-medium text-[#a4a3d0] mb-2">The Bigger Arc</p>
                <p className="text-white/90">{excalibur.biggerArc.vision}</p>
                <div className="flex items-center gap-2 mt-3 text-[#8460ea]">
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-sm">{excalibur.biggerArc.moonshot}</span>
                </div>
            </div>

            {/* Share Button */}
            <ShareZoG
                archetypeName={excalibur.businessIdentity.name}
                tagline={excalibur.businessIdentity.tagline}
                primeDriver={excalibur.essenceAnchor.primeDriver}
            />

            {/* Save Button */}
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

export default ExcaliburDisplay;


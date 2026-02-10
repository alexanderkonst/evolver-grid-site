import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Users, Target, Radio, Telescope, Sparkles, Sword } from "lucide-react";
import { useExcaliburData } from "@/hooks/useExcaliburData";
import ShareZoG from "@/components/sharing/ShareZoG";
import { supabase } from "@/integrations/supabase/client";

/**
 * GeniusBusiness - Overview page for the Genius Business module
 * Shows the 3-word name + tagline and links to sub-modules
 * 
 * Three states:
 * 1. No ZoG data at all → "Discover My Genius" → ZoG entry
 * 2. Has Appleseed but no Excalibur → "Reveal My Genius Business" → generate Excalibur in-place
 * 3. Has Excalibur → show full overview
 */
const GeniusBusiness = () => {
    const navigate = useNavigate();
    const { loading, excaliburData, hasAppleseed, snapshotId, profileId } = useExcaliburData();
    const [isGenerating, setIsGenerating] = useState(false);

    const modules = [
        { id: "audience", label: "Ideal Client", icon: Users, path: "/game/me/genius-business/audience", description: "Who this is for" },
        { id: "promise", label: "Promise", icon: Target, path: "/game/me/genius-business/promise", description: "A to B transformation" },
        { id: "channels", label: "Channels", icon: Radio, path: "/game/me/genius-business/channels", description: "How to reach them" },
        { id: "vision", label: "Vision", icon: Telescope, path: "/game/me/genius-business/vision", description: "The bigger arc" },
    ];

    if (loading) {
        return (
            <GameShellV2>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-pulse text-[#a4a3d0]">Loading...</div>
                </div>
            </GameShellV2>
        );
    }

    // State: Generating Excalibur in-place
    if (isGenerating) {
        return (
            <GameShellV2>
                <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="relative w-32 h-32 mb-8">
                        <div className="absolute inset-0 border-2 border-violet-200 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                        <div className="absolute inset-4 border-2 border-violet-300 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                        <div className="absolute inset-8 border-2 border-violet-400 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
                        <div className="absolute inset-12 bg-violet-200 rounded-full animate-pulse flex items-center justify-center">
                            <Sword className="w-6 h-6 text-violet-600" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-[#2c3150] mb-2">Crafting Your Genius Business</h2>
                    <p className="text-[#a4a3d0] animate-pulse">
                        Transforming your genius into a business identity...
                    </p>
                </div>
            </GameShellV2>
        );
    }

    // State 1: No ZoG data at all — need to discover genius first
    if (!excaliburData?.businessIdentity && !hasAppleseed) {
        return (
            <GameShellV2>
                <div className="max-w-2xl mx-auto p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden mb-4">
                        <img src="/genius-business-logo.png" alt="Genius Business" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#2c3150] mb-2">Create Your Genius Business</h1>
                    <p className="text-[#a4a3d0] mb-6">
                        Discover your Zone of Genius first to unlock your Genius Business.
                    </p>
                    <Button
                        variant="wabi-primary"
                        onClick={() => navigate("/zone-of-genius/entry?return=/game/me/genius-business")}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Discover My Genius
                    </Button>
                </div>
            </GameShellV2>
        );
    }

    // State 2: Has Appleseed but no Excalibur — generate Genius Business directly
    if (!excaliburData?.businessIdentity && hasAppleseed) {
        const handleRevealGeniusBusiness = async () => {
            setIsGenerating(true);
            try {
                // Load appleseed from snapshot
                const { data: snapshot } = await supabase
                    .from("zog_snapshots")
                    .select("appleseed_data")
                    .eq("id", snapshotId!)
                    .single();

                if (!snapshot?.appleseed_data) {
                    throw new Error("Could not load your genius data");
                }

                // Import and run the Excalibur generator
                const { generateExcalibur } = await import("@/modules/zone-of-genius/excaliburGenerator");
                const excalibur = await generateExcalibur(snapshot.appleseed_data as any);

                // Save Excalibur to snapshot
                const { saveExcalibur } = await import("@/modules/zone-of-genius/saveToDatabase");
                await saveExcalibur(excalibur);

                // Reload page to show the full overview
                window.location.reload();
            } catch (err) {
                console.error("Failed to generate Genius Business:", err);
                setIsGenerating(false);
            }
        };

        return (
            <GameShellV2>
                <div className="max-w-2xl mx-auto p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden mb-4">
                        <img src="/genius-business-logo.png" alt="Genius Business" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#2c3150] mb-2">Your Genius Is Ready</h1>
                    <p className="text-[#a4a3d0] mb-6">
                        Let's transform your Zone of Genius into a business identity.
                    </p>
                    <Button
                        variant="wabi-primary"
                        onClick={handleRevealGeniusBusiness}
                    >
                        <Sword className="w-4 h-4 mr-2" />
                        Reveal My Genius Business
                    </Button>
                </div>
            </GameShellV2>
        );
    }

    return (
        <GameShellV2>
            <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
                {/* Hero: Business name + tagline */}
                <div className="text-center py-8 bg-gradient-to-br from-[#e7e9e5] to-[#dcdde2] rounded-2xl border border-[#a4a3d0]/20">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full overflow-hidden mb-4">
                        <img src="/genius-business-logo.png" alt="Genius Business" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-[#2c3150] mb-2">
                        {excaliburData.businessIdentity.name}
                    </h1>
                    <p className="text-lg text-[#8460ea] font-medium">
                        {excaliburData.businessIdentity.tagline}
                    </p>
                </div>

                {/* Essence Anchor summary */}
                {excaliburData.essenceAnchor && (
                    <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                        <p className="text-sm text-[#a4a3d0] mb-1">Genius Apple Seed</p>
                        <p className="text-[#2c3150] font-medium">{excaliburData.essenceAnchor.geniusAppleSeed}</p>
                    </div>
                )}

                {/* Offer statement */}
                {excaliburData.offer && (
                    <div className="p-4 bg-white/60 rounded-xl border border-#a4a3d0]/20">
                        <p className="text-sm text-[#a4a3d0] mb-1">Your Unique Selling Proposition</p>
                        <p className="text-[#2c3150]">{excaliburData.offer.statement}</p>
                    </div>
                )}

                {/* Module navigation */}
                <div className="grid grid-cols-2 gap-3">
                    {modules.map((mod) => (
                        <button
                            key={mod.id}
                            onClick={() => navigate(mod.path)}
                            className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20 hover:border-[#8460ea]/40 hover:bg-white/80 transition-all text-left group"
                        >
                            <mod.icon className="w-5 h-5 text-[#8460ea] mb-2" />
                            <p className="font-medium text-[#2c3150] group-hover:text-[#8460ea] transition-colors">
                                {mod.label}
                            </p>
                            <p className="text-xs text-[#a4a3d0]">{mod.description}</p>
                        </button>
                    ))}
                </div>

                {/* Share button */}
                <ShareZoG
                    archetypeName={excaliburData.businessIdentity.name}
                    tagline={excaliburData.businessIdentity.tagline}
                    primeDriver={excaliburData.essenceAnchor?.primeDriver || ""}
                    profileId={profileId ?? undefined}
                />
            </div>
        </GameShellV2>
    );
};

export default GeniusBusiness;


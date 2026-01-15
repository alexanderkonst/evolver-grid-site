import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, ArrowRight, Target, Radio, Telescope, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import ShareZoG from "@/components/sharing/ShareZoG";

interface ExcaliburData {
    businessIdentity?: {
        name: string;
        tagline: string;
    };
    essenceAnchor?: {
        geniusAppleSeed: string;
        primeDriver: string;
        archetype: string;
    };
    offer?: {
        statement: string;
        form: string;
        deliverable: string;
    };
}

/**
 * GeniusBusiness - Overview page for the Genius Business module
 * Shows the 3-word name + tagline and links to sub-modules
 */
const GeniusBusiness = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [excaliburData, setExcaliburData] = useState<ExcaliburData | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const profileId = await getOrCreateGameProfileId();
                if (!profileId) return;

                const { data } = await supabase
                    .from("game_profiles")
                    .select("excalibur_data")
                    .eq("id", profileId)
                    .single();

                if (data?.excalibur_data) {
                    setExcaliburData(data.excalibur_data as ExcaliburData);
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const modules = [
        { id: "audience", label: "Ideal Client", icon: Users, path: "/game/profile/genius-business/audience", description: "Who this is for" },
        { id: "promise", label: "Promise", icon: Target, path: "/game/profile/genius-business/promise", description: "A to B transformation" },
        { id: "channels", label: "Channels", icon: Radio, path: "/game/profile/genius-business/channels", description: "How to reach them" },
        { id: "vision", label: "Vision", icon: Telescope, path: "/game/profile/genius-business/vision", description: "The bigger arc" },
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

    if (!excaliburData?.businessIdentity) {
        return (
            <GameShellV2>
                <div className="max-w-2xl mx-auto p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#8460ea] to-[#29549f] flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#2c3150] mb-2">Create Your Genius Business</h1>
                    <p className="text-[#a4a3d0] mb-6">
                        Complete your Zone of Genius first to unlock your Genius Business.
                    </p>
                    <Button
                        variant="wabi-primary"
                        onClick={() => navigate("/zone-of-genius/entry")}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Start Zone of Genius
                    </Button>
                </div>
            </GameShellV2>
        );
    }

    return (
        <GameShellV2>
            <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
                {/* Hero: 3-word name + tagline */}
                <div className="text-center py-8 bg-gradient-to-br from-[#e7e9e5] to-[#dcdde2] rounded-2xl border border-[#a4a3d0]/20">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#8460ea] to-[#29549f] flex items-center justify-center">
                        <Briefcase className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#2c3150] mb-2">
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
                    <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                        <p className="text-sm text-[#a4a3d0] mb-1">Your Offer</p>
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
                />
            </div>
        </GameShellV2>
    );
};

export default GeniusBusiness;

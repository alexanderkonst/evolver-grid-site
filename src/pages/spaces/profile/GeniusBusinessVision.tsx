import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Telescope, ArrowLeft, Rocket, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";

interface BiggerArcData {
    vision: string;
    moonshot: string;
}

/**
 * GeniusBusinessVision - The Bigger Arc module
 * Shows vision and moonshot
 */
const GeniusBusinessVision = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<BiggerArcData | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const profileId = await getOrCreateGameProfileId();
                if (!profileId) return;

                const { data: profile } = await supabase
                    .from("game_profiles")
                    .select("excalibur_data")
                    .eq("id", profileId)
                    .single();

                if (profile?.excalibur_data?.biggerArc) {
                    setData(profile.excalibur_data.biggerArc as BiggerArcData);
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <GameShellV2>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-pulse text-[#a4a3d0]">Loading...</div>
                </div>
            </GameShellV2>
        );
    }

    return (
        <GameShellV2>
            <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
                {/* Header with back button */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/game/profile/genius-business")}
                        className="p-2 hover:bg-[#a4a3d0]/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#a4a3d0]" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#2c3150]">The Bigger Arc</h1>
                        <p className="text-sm text-[#a4a3d0]">Your vision and moonshot</p>
                    </div>
                </div>

                {data ? (
                    <div className="space-y-4">
                        {/* Vision */}
                        <div className="p-5 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                            <div className="flex items-start gap-3">
                                <Telescope className="w-5 h-5 text-[#8460ea] mt-0.5" />
                                <div>
                                    <p className="text-sm text-[#a4a3d0] mb-1">How this fits your bigger purpose</p>
                                    <p className="text-[#2c3150]">{data.vision}</p>
                                </div>
                            </div>
                        </div>

                        {/* Moonshot */}
                        <div className="p-6 bg-gradient-to-br from-[#8460ea]/10 to-[#29549f]/10 rounded-xl border border-[#8460ea]/20">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8460ea] to-[#29549f] flex items-center justify-center flex-shrink-0">
                                    <Rocket className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#8460ea] mb-1">MOONSHOT</p>
                                    <p className="text-[#2c3150] font-medium">{data.moonshot}</p>
                                </div>
                            </div>
                        </div>

                        {/* Inspirational footer */}
                        <div className="text-center py-4">
                            <Sparkles className="w-6 h-6 text-[#a4a3d0]/50 mx-auto mb-2" />
                            <p className="text-sm text-[#a4a3d0]">
                                This is the future you're building towards
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Telescope className="w-12 h-12 text-[#a4a3d0]/50 mx-auto mb-3" />
                        <p className="text-[#a4a3d0]">No vision data yet</p>
                        <Button
                            variant="wabi-ghost"
                            className="mt-4"
                            onClick={() => navigate("/zone-of-genius/entry")}
                        >
                            Generate Genius Business
                        </Button>
                    </div>
                )}
            </div>
        </GameShellV2>
    );
};

export default GeniusBusinessVision;

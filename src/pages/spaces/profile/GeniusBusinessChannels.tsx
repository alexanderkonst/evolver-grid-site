import { useNavigate } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Radio, ArrowLeft, Megaphone, Share2 } from "lucide-react";
import { useExcaliburData } from "@/hooks/useExcaliburData";

/**
 * GeniusBusinessChannels - Channels module
 * Shows primary/secondary channels and content strategy
 */
const GeniusBusinessChannels = () => {
    const navigate = useNavigate();
    const { loading, excaliburData } = useExcaliburData();
    const data = excaliburData?.channels;

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
                        <h1 className="text-2xl font-bold text-[#2c3150]">Channels</h1>
                        <p className="text-sm text-[#a4a3d0]">How to reach your clients</p>
                    </div>
                </div>

                {data ? (
                    <div className="space-y-4">
                        {/* Primary Channel */}
                        <div className="p-5 bg-gradient-to-r from-[#8460ea]/10 to-[#29549f]/10 rounded-xl border border-[#8460ea]/20">
                            <div className="flex items-start gap-3">
                                <Radio className="w-5 h-5 text-[#8460ea] mt-0.5" />
                                <div>
                                    <p className="text-xs text-[#8460ea] mb-1">PRIMARY CHANNEL</p>
                                    <p className="text-[#2c3150] font-medium">{data.primary}</p>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Channel */}
                        {data.secondary && (
                            <div className="p-5 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                                <div className="flex items-start gap-3">
                                    <Share2 className="w-5 h-5 text-[#8460ea] mt-0.5" />
                                    <div>
                                        <p className="text-sm text-[#a4a3d0] mb-1">Secondary Channel</p>
                                        <p className="text-[#2c3150]">{data.secondary}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Content Strategy */}
                        {data.content && (
                            <div className="p-5 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                                <div className="flex items-start gap-3">
                                    <Megaphone className="w-5 h-5 text-[#8460ea] mt-0.5" />
                                    <div>
                                        <p className="text-sm text-[#a4a3d0] mb-1">Content Strategy</p>
                                        <p className="text-[#2c3150]">{data.content}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Radio className="w-12 h-12 text-[#a4a3d0]/50 mx-auto mb-3" />
                        <p className="text-[#a4a3d0]">No channels data yet</p>
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

export default GeniusBusinessChannels;

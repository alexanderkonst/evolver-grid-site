import { useNavigate } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, Lightbulb, AlertCircle } from "lucide-react";
import { useExcaliburData } from "@/hooks/useExcaliburData";

/**
 * GeniusBusinessAudience - Ideal Client module
 * Shows who the offer is for, their problem, and aha moment
 */
const GeniusBusinessAudience = () => {
    const navigate = useNavigate();
    const { loading, excaliburData } = useExcaliburData();
    const data = excaliburData?.idealClient;

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
                        <h1 className="text-2xl font-bold text-[#2c3150]">Ideal Client</h1>
                        <p className="text-sm text-[#a4a3d0]">Who this is for</p>
                    </div>
                </div>

                {data ? (
                    <div className="space-y-4">
                        {/* Profile */}
                        <div className="p-5 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                            <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-[#8460ea] mt-0.5" />
                                <div>
                                    <p className="text-sm text-[#a4a3d0] mb-1">Who benefits most</p>
                                    <p className="text-[#2c3150]">{data.profile}</p>
                                </div>
                            </div>
                        </div>

                        {/* Problem */}
                        <div className="p-5 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-[#8460ea] mt-0.5" />
                                <div>
                                    <p className="text-sm text-[#a4a3d0] mb-1">What problem this solves</p>
                                    <p className="text-[#2c3150]">{data.problem}</p>
                                </div>
                            </div>
                        </div>

                        {/* Aha moment */}
                        {data.ahaRealization && (
                            <div className="p-5 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="w-5 h-5 text-[#8460ea] mt-0.5" />
                                    <div>
                                        <p className="text-sm text-[#a4a3d0] mb-1">Their "Aha" moment</p>
                                        <p className="text-[#2c3150]">{data.ahaRealization}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-[#a4a3d0]/50 mx-auto mb-3" />
                        <p className="text-[#a4a3d0]">No ideal client data yet</p>
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

export default GeniusBusinessAudience;

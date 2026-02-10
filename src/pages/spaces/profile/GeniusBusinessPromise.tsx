import { useNavigate } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Target, ArrowLeft, ArrowRight } from "lucide-react";
import { useExcaliburData } from "@/hooks/useExcaliburData";

/**
 * GeniusBusinessPromise - Transformational Promise module
 * Shows Point A → Point B journey
 */
const GeniusBusinessPromise = () => {
    const navigate = useNavigate();
    const { loading, excaliburData } = useExcaliburData();
    const data = excaliburData?.transformationalPromise;

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
                        onClick={() => navigate("/game/me/genius-business")}
                        className="p-2 hover:bg-[#a4a3d0]/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#a4a3d0]" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#2c3150]">Transformational Promise</h1>
                        <p className="text-sm text-[#a4a3d0]">Point A to Point B</p>
                    </div>
                </div>

                {data ? (
                    <div className="space-y-4">
                        {/* Visual A → B flow */}
                        <div className="p-6 bg-gradient-to-r from-[#e7e9e5] to-[#dcdde2] rounded-xl border border-[#a4a3d0]/20">
                            <div className="flex items-center gap-4">
                                {/* Point A */}
                                <div className="flex-1 p-4 bg-white/70 rounded-xl text-center">
                                    <p className="text-xs text-[#a4a3d0] mb-1">POINT A</p>
                                    <p className="text-sm text-[#2c3150] font-medium">{data.fromState}</p>
                                </div>

                                {/* Arrow */}
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8460ea] to-[#29549f] flex items-center justify-center">
                                        <ArrowRight className="w-5 h-5 text-white" />
                                    </div>
                                </div>

                                {/* Point B */}
                                <div className="flex-1 p-4 bg-gradient-to-br from-[#8460ea]/10 to-[#29549f]/10 rounded-xl text-center border border-[#8460ea]/20">
                                    <p className="text-xs text-[#8460ea] mb-1">POINT B</p>
                                    <p className="text-sm text-[#2c3150] font-medium">{data.toState}</p>
                                </div>
                            </div>
                        </div>

                        {/* The Journey */}
                        {data.journey && (
                            <div className="p-5 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                                <div className="flex items-start gap-3">
                                    <Target className="w-5 h-5 text-[#8460ea] mt-0.5" />
                                    <div>
                                        <p className="text-sm text-[#a4a3d0] mb-1">The Journey</p>
                                        <p className="text-[#2c3150]">{data.journey}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Target className="w-12 h-12 text-[#a4a3d0]/50 mx-auto mb-3" />
                        <p className="text-[#a4a3d0]">No promise data yet</p>
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

export default GeniusBusinessPromise;

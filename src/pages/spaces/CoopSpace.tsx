import { Building2 } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";

const CoopSpace = () => {
    return (
        <GameShellV2>
            <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-6 h-6 text-slate-700" />
                        <h1 className="text-2xl font-bold text-slate-900">Startup Co-op Space</h1>
                    </div>
                    <p className="text-slate-600">Build together. Create collective wealth.</p>
                </div>

                {/* Coming Soon */}
                <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                    <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700 mb-2">Coming Soon</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        The Startup Co-op will enable you to join collective ventures, contribute your genius,
                        and share in the wealth created by the community.
                    </p>
                </div>
            </div>
        </GameShellV2>
    );
};

export default CoopSpace;

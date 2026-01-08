import { Store } from "lucide-react";
import GameShell from "@/components/game/GameShell";

const MarketplaceSpace = () => {
    return (
        <GameShell>
            <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Store className="w-6 h-6 text-slate-700" />
                        <h1 className="text-2xl font-bold text-slate-900">Marketplace Space</h1>
                    </div>
                    <p className="text-slate-600">Monetize your genius. Create and sell offers.</p>
                </div>

                {/* Coming Soon */}
                <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                    <Store className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700 mb-2">Coming Soon</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        The Marketplace will allow you to create offers based on your Zone of Genius,
                        sell your services, and generate revenue from your unique talents.
                    </p>
                </div>
            </div>
        </GameShell>
    );
};

export default MarketplaceSpace;

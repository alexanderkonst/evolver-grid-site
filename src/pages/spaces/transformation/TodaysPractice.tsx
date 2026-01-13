import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";

/**
 * Today's Practice section - personalized daily recommendation
 */
const TodaysPractice = () => {
    return (
        <GameShellV2>
            <div className="p-6 lg:p-8 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-6 h-6 text-slate-700" />
                        <h1 className="text-2xl font-bold text-slate-900">Today's Practice</h1>
                    </div>
                    <p className="text-slate-600">Get your personalized practice recommendation</p>
                </div>

                {/* Main Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <p className="text-slate-600 mb-6">
                        Based on your profile and progress, we'll recommend the best practice for today.
                    </p>
                    <Button asChild size="lg" className="w-full">
                        <Link to="/game">
                            Go to My Next Move <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </GameShellV2>
    );
};

export default TodaysPractice;

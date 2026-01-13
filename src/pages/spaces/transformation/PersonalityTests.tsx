import { Link } from "react-router-dom";
import { Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";

/**
 * Personality Tests section - MBTI, Enneagram, etc.
 */
const PersonalityTests = () => {
    return (
        <GameShellV2>
            <div className="p-6 lg:p-8 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="w-6 h-6 text-purple-600" />
                        <h1 className="text-2xl font-bold text-slate-900">Personality Tests</h1>
                    </div>
                    <p className="text-slate-600">MBTI, Enneagram, and other frameworks</p>
                </div>

                {/* Main Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">Upgrade</span>
                    </div>
                    <p className="text-slate-600 mb-6">
                        Take personality tests to deepen your self-understanding.
                    </p>
                    <Button asChild size="lg" className="w-full">
                        <Link to="/resources/personality-tests?from=transformation">
                            Take Tests <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </GameShellV2>
    );
};

export default PersonalityTests;

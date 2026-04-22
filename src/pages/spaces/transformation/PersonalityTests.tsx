import { useNavigate } from "react-router-dom";
import { Award, ArrowRight } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import Panel3Actions from "@/components/game/Panel3Actions";

/**
 * Personality Tests section - MBTI, Enneagram, etc.
 */
const PersonalityTests = () => {
    const navigate = useNavigate();

    return (
        <GameShellV2>
            <div className="p-6 pb-24 lg:p-8 lg:pb-8 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Award className="w-6 h-6 text-primary" />
                            <h1 className="text-2xl font-bold text-foreground">Personality Tests</h1>
                        </div>
                        <p className="text-muted-foreground">MBTI, Enneagram, and other frameworks</p>
                    </div>
                    <Panel3Actions
                        primaryLabel="Take Tests"
                        primaryAction={() => navigate("/resources/personality-tests?from=transformation")}
                        primaryIcon={<ArrowRight className="w-4 h-4" />}
                    />
                </div>

                {/* Main Card */}
                <div className="rounded-xl border border-border bg-white/85 backdrop-blur-sm p-6 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">Upgrade</span>
                    </div>
                    <p className="text-muted-foreground mb-6">
                        Take personality tests to deepen your self-understanding.
                    </p>
                </div>
            </div>
        </GameShellV2>
    );
};

export default PersonalityTests;

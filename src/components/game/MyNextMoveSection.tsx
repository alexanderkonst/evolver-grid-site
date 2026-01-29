import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Clock, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Action } from "@/data/actions";

interface MyNextMoveSectionProps {
    action: Action | null;
    onComplete: (action: Action) => void;
    isCompleting?: boolean;
}

const VECTOR_COLORS: Record<string, string> = {
    body: 'bg-green-100 text-green-700',
    mind: 'bg-blue-100 text-blue-700',
    emotions: 'bg-pink-100 text-pink-700',
    spirit: 'bg-purple-100 text-purple-700',
    uniqueness: 'bg-[#c8b7d8]/30 text-[#8460ea]'
};

const VECTOR_LABELS: Record<string, string> = {
    body: 'Body',
    mind: 'Mind',
    emotions: 'Emotions',
    spirit: 'Spirit',
    uniqueness: 'Genius'
};

const MyNextMoveSection = ({ action, onComplete, isCompleting }: MyNextMoveSectionProps) => {
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);

    if (!action) {
        return (
            <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-5 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                <h2 className="font-display text-lg font-semibold text-[#2c3150] mb-3">My Next Move</h2>
                <div className="text-center py-8 text-[#2c3150]/60">
                    <p>Complete your Zone of Genius and Quality of Life assessments to get personalized recommendations.</p>
                    <Button asChild className="mt-4">
                        <Link to="/start">Start Zone of Genius</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const handleDoIt = () => {
        if (action.link) {
            // Navigate to the action's content
            navigate(action.link);
        } else {
            // Show completion confirmation
            setShowConfirm(true);
        }
    };

    const handleConfirmComplete = () => {
        setShowConfirm(false);
        onComplete(action);
    };

    return (
        <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-5 shadow-[0_4px_16px_rgba(44,49,80,0.06)] breathing-card">
            <h2 className="font-display text-lg font-semibold text-[#2c3150] mb-4">My Next Move</h2>

            {/* Action Card */}
            <div className="rounded-xl border-2 border-[#a4a3d0]/20 bg-[#f0f4ff]/50 p-5 mb-4">
                <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{action.emoji || '🎯'}</span>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-[#2c3150]">{action.title}</h3>
                        <p className="text-sm text-[rgba(44,49,80,0.7)] mt-1">{action.description}</p>
                    </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[#a4a3d0]/10 text-[#2c3150]/70">
                        <Clock className="w-3 h-3" />
                        {action.duration}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${VECTOR_COLORS[action.vector]}`}>
                        <Zap className="w-3 h-3" />
                        +{action.xp} XP · {VECTOR_LABELS[action.vector]}
                    </span>
                </div>

                {/* Action Button */}
                {showConfirm ? (
                    <div className="space-y-2">
                        <p className="text-sm text-[rgba(44,49,80,0.7)] text-center">Did you complete this action?</p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowConfirm(false)}
                            >
                                Not Yet
                            </Button>
                            <Button
                                className="flex-1 bg-[#b1c9b6] hover:bg-[#9ab8a5]"
                                onClick={handleConfirmComplete}
                                disabled={isCompleting}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Done!
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleDoIt}
                    >
                        DO IT
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>

            {/* Explore More */}
            <Link
                to="/game/transformation"
                className="flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-[#2c3150] transition-colors"
            >
                Not this? Explore more
                <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
    );
};

export default MyNextMoveSection;

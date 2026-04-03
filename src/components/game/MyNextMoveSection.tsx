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
    body: 'bg-green-500/15 text-green-300',
    mind: 'bg-blue-500/15 text-blue-300',
    emotions: 'bg-pink-500/15 text-pink-300',
    spirit: 'bg-purple-500/15 text-purple-300',
    uniqueness: 'bg-[#8460ea]/15 text-[#a4a3d0]'
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
            <div className="rounded-xl liquid-glass ring-1 ring-white/10 p-5">
                <h2 className="font-display text-lg font-semibold text-white mb-3">My Next Move</h2>
                <div className="text-center py-8 text-white/40">
                    <p>Complete your Zone of Genius and Quality of Life assessments to get personalized recommendations.</p>
                    <Button asChild className="mt-4 liquid-glass-strong ring-1 ring-white/20 text-white hover:bg-white/10">
                        <Link to="/start">Start Zone of Genius</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const handleDoIt = () => {
        if (action.link) {
            navigate(action.link);
        } else {
            setShowConfirm(true);
        }
    };

    const handleConfirmComplete = () => {
        setShowConfirm(false);
        onComplete(action);
    };

    return (
        <div className="rounded-xl liquid-glass ring-1 ring-white/10 p-5 breathing-card">
            <h2 className="font-display text-lg font-semibold text-white mb-4">My Next Move</h2>

            {/* Action Card */}
            <div className="rounded-xl liquid-glass-strong ring-1 ring-white/15 p-5 mb-4">
                <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{action.emoji || '🎯'}</span>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-white">{action.title}</h3>
                        <p className="text-sm text-white/50 mt-1">{action.description}</p>
                    </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/5 text-white/50 ring-1 ring-white/10">
                        <Clock className="w-3 h-3" />
                        {action.duration}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ring-1 ring-white/10 ${VECTOR_COLORS[action.vector]}`}>
                        <Zap className="w-3 h-3" />
                        +{action.xp} XP · {VECTOR_LABELS[action.vector]}
                    </span>
                </div>

                {/* Action Button */}
                {showConfirm ? (
                    <div className="space-y-2">
                        <p className="text-sm text-white/50 text-center">Did you complete this action?</p>
                        <div className="flex gap-2">
                            <button
                                className="flex-1 py-2 rounded-lg liquid-glass ring-1 ring-white/15 text-white/70 hover:bg-white/10 transition-all text-sm font-medium"
                                onClick={() => setShowConfirm(false)}
                            >
                                Not Yet
                            </button>
                            <button
                                className="flex-1 py-2 rounded-lg bg-[#b1c9b6]/20 ring-1 ring-[#b1c9b6]/30 text-[#b1c9b6] hover:bg-[#b1c9b6]/30 transition-all text-sm font-medium flex items-center justify-center gap-1"
                                onClick={handleConfirmComplete}
                                disabled={isCompleting}
                            >
                                <Check className="w-4 h-4" />
                                Done!
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        className="w-full py-3 rounded-xl liquid-glass-strong ring-1 ring-white/20 text-white font-semibold tracking-wide uppercase
                                   shadow-[0_0_30px_rgba(132,96,234,0.15)] hover:shadow-[0_0_40px_rgba(132,96,234,0.25)]
                                   hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                        onClick={handleDoIt}
                    >
                        Read Profile
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Explore More */}
            <Link
                to="/game/transformation"
                className="flex items-center justify-center gap-1 text-sm text-white/30 hover:text-white/60 transition-colors"
            >
                ✦ Explore All Spaces
            </Link>
        </div>
    );
};

export default MyNextMoveSection;

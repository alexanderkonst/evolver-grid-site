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
    uniqueness: 'bg-amber-100 text-amber-700'
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
            <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="font-semibold text-slate-900 mb-3">My Next Move</h2>
                <div className="text-center py-8 text-slate-500">
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
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900 mb-4">My Next Move</h2>

            {/* Action Card */}
            <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-5 mb-4">
                <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{action.emoji || '🎯'}</span>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-slate-900">{action.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{action.description}</p>
                    </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
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
                        <p className="text-sm text-slate-600 text-center">Did you complete this action?</p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowConfirm(false)}
                            >
                                Not Yet
                            </Button>
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700"
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
                className="flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
                Not this? Explore more
                <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
    );
};

export default MyNextMoveSection;

import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import Panel3Actions from "@/components/game/Panel3Actions";

/**
 * Practice Library section - breathwork, meditation, micro-actions
 */
const PracticeLibrary = () => {
    const navigate = useNavigate();

    return (
        <GameShellV2>
            <div className="p-6 pb-24 lg:p-8 lg:pb-8 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-6 h-6 text-slate-700" />
                            <h1 className="text-2xl font-bold text-slate-900">Practice Library</h1>
                        </div>
                        <p className="text-slate-600">Breathwork, meditation, and micro-actions</p>
                    </div>
                    <Panel3Actions
                        primaryLabel="Browse Library"
                        primaryAction={() => navigate("/library?from=transformation")}
                        primaryIcon={<ArrowRight className="w-4 h-4" />}
                    />
                </div>

                {/* Main Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <p className="text-slate-600 mb-6">
                        Curated collection of practices for your transformation journey.
                    </p>
                </div>
            </div>
        </GameShellV2>
    );
};

export default PracticeLibrary;

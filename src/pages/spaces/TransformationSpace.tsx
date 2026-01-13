import { Link } from "react-router-dom";
import {
    Sparkles,
    BookOpen,
    TrendingUp,
    Award,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";

const TransformationSpace = () => {
    return (
        <GameShellV2>
            <ErrorBoundary>
                <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-6 h-6 text-slate-700" />
                            <h1 className="text-2xl font-bold text-slate-900">Transformation Space</h1>
                        </div>
                        <p className="text-slate-600">Master yourself through practice and growth.</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                            <p className="text-2xl font-bold text-slate-900">0</p>
                            <p className="text-sm text-slate-500">Actions</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                            <p className="text-2xl font-bold text-slate-900">0</p>
                            <p className="text-sm text-slate-500">XP Total</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                            <p className="text-2xl font-bold text-slate-900">1</p>
                            <p className="text-sm text-slate-500">Level</p>
                        </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Library */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-slate-100">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Practice Library</h3>
                            <p className="text-sm text-slate-600 mb-4">Breathwork, meditation, and micro-actions</p>
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link to="/library?from=transformation">
                                    Browse <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>

                        {/* Growth Paths */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-slate-100">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">5 Growth Paths</h3>
                            <p className="text-sm text-slate-600 mb-4">Spirit, Mind, Emotions, Genius, Body</p>
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link to="/growth-paths">
                                    View Paths <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>

                        {/* Personality Upgrade */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-purple-100">
                                    <Award className="w-6 h-6 text-purple-600" />
                                </div>
                                <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">Upgrade</span>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Personality Tests</h3>
                            <p className="text-sm text-slate-600 mb-4">MBTI, Enneagram, and other frameworks</p>
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link to="/resources/personality-tests?from=transformation">
                                    Take Tests <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>

                        {/* Daily Loop */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-slate-100">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Today's Practice</h3>
                            <p className="text-sm text-slate-600 mb-4">Get your personalized recommendation</p>
                            <Button asChild size="sm" className="w-full">
                                <Link to="/game">
                                    Go to Next Move <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default TransformationSpace;

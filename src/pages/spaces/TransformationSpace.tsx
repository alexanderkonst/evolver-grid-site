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
                            <Sparkles className="w-6 h-6 text-[#2c3150]" />
                            <h1 className="text-2xl font-bold text-[#2c3150]">Transformation Space</h1>
                        </div>
                        <p className="text-[rgba(44,49,80,0.7)]">Master yourself through practice and growth.</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-4 text-center shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                            <p className="text-2xl font-bold text-[#2c3150]">0</p>
                            <p className="text-sm text-[#2c3150]/60">Actions</p>
                        </div>
                        <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-4 text-center shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                            <p className="text-2xl font-bold text-[#2c3150]">0</p>
                            <p className="text-sm text-[#2c3150]/60">XP Total</p>
                        </div>
                        <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-4 text-center shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                            <p className="text-2xl font-bold text-[#2c3150]">1</p>
                            <p className="text-sm text-[#2c3150]/60">Level</p>
                        </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Library */}
                        <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-5 hover:border-[#a4a3d0]/40 transition-colors shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-[#6894d0]/20">
                                    <BookOpen className="w-6 h-6 text-[#6894d0]" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-[#2c3150] mb-1">Practice Library</h3>
                            <p className="text-sm text-[#2c3150]/70 mb-4">Breathwork, meditation, and micro-actions</p>
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link to="/library?from=transformation">
                                    Browse <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>

                        {/* Growth Paths */}
                        <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-5 hover:border-[#a4a3d0]/40 transition-colors shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-[#b1c9b6]/30">
                                    <TrendingUp className="w-6 h-6 text-[#2c3150]" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-[#2c3150] mb-1">5 Growth Paths</h3>
                            <p className="text-sm text-[#2c3150]/70 mb-4">Spirit, Mind, Emotions, Genius, Body</p>
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link to="/growth-paths">
                                    View Paths <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>

                        {/* Personality Upgrade */}
                        <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-5 hover:border-[#a4a3d0]/40 transition-colors shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-[#c8b7d8]/30">
                                    <Award className="w-6 h-6 text-[#8460ea]" />
                                </div>
                                <span className="text-xs text-[#8460ea] font-medium bg-[#8460ea]/10 px-2 py-1 rounded-full">Upgrade</span>
                            </div>
                            <h3 className="font-semibold text-[#2c3150] mb-1">Personality Tests</h3>
                            <p className="text-sm text-[#2c3150]/70 mb-4">MBTI, Enneagram, and other frameworks</p>
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link to="/resources/personality-tests?from=transformation">
                                    Take Tests <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>

                        {/* Daily Loop */}
                        <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-5 hover:border-[#a4a3d0]/40 transition-colors shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-[#8460ea]/20">
                                    <Sparkles className="w-6 h-6 text-[#8460ea]" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-[#2c3150] mb-1">Today's Practice</h3>
                            <p className="text-sm text-[#2c3150]/70 mb-4">Get your personalized recommendation</p>
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

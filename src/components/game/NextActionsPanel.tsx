/**
 * NextActionsPanel — Two recommended actions with shimmer/glow effects
 * 
 * Shows after first transformation:
 * 1. "Continue Genius Discovery" — next step in genius articulation
 * 2. "Continue Transformation" — next practice from Growth Path
 * 
 * Features:
 * - Shimmer animation on current recommended actions
 * - Green checkmarks on completed steps
 * - Progress investment visualization
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Sparkles, TrendingUp, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CompletedStep {
    id: string;
    title: string;
    completedAt: string;
    xpEarned: number;
}

interface NextAction {
    id: string;
    type: 'genius' | 'transformation';
    title: string;
    description: string;
    route: string;
    ctaLabel: string;
    icon: 'sparkles' | 'trending';
    priority: 'primary' | 'secondary';
}

interface NextActionsPanelProps {
    completedSteps: CompletedStep[];
    nextActions: NextAction[];
    onActionClick?: (action: NextAction) => void;
}

export default function NextActionsPanel({
    completedSteps,
    nextActions,
    onActionClick
}: NextActionsPanelProps) {
    const [showCompleted, setShowCompleted] = useState(false);

    const primaryAction = nextActions.find(a => a.priority === 'primary');
    const secondaryAction = nextActions.find(a => a.priority === 'secondary');

    return (
        <div className="space-y-4">
            {/* Completed Steps (collapsible) */}
            {completedSteps.length > 0 && (
                <div className="rounded-lg border border-[#b1c9b6]/50 bg-[#b1c9b6]/10">
                    <button
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#b1c9b6]" />
                            <span className="text-sm font-medium text-[#2c3150]">
                                {completedSteps.length} step{completedSteps.length > 1 ? 's' : ''} completed
                            </span>
                            <span className="text-xs text-[#2c3150]/70 bg-[#b1c9b6]/30 px-2 py-0.5 rounded-full">
                                +{completedSteps.reduce((sum, s) => sum + s.xpEarned, 0)} XP
                            </span>
                        </div>
                        {showCompleted ? (
                            <ChevronUp className="w-4 h-4 text-[#b1c9b6]" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-[#b1c9b6]" />
                        )}
                    </button>

                    {showCompleted && (
                        <div className="px-4 pb-3 space-y-2">
                            {completedSteps.map((step) => (
                                <div
                                    key={step.id}
                                    className="flex items-center justify-between text-sm py-1.5 border-t border-emerald-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#b1c9b6]" />
                                        <span className="text-[#2c3150]">{step.title}</span>
                                    </div>
                                    <span className="text-xs text-[#2c3150]/70">+{step.xpEarned} XP</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Two Next Actions */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#2c3150]/60 uppercase ">
                    Your Next Move
                </h3>

                {/* Primary Action Card with Shimmer */}
                {primaryAction && (
                    <div
                        className={cn(
                            "relative rounded-xl border-2 p-5 overflow-hidden",
                            "border-[#8460ea]/30 bg-[#8460ea]/5",
                            "shimmer-card"
                        )}
                    >
                        {/* Shimmer overlay */}
                        <div className="shimmer-overlay" />

                        <div className="relative z-above">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-[#8460ea] flex items-center justify-center">
                                    {primaryAction.icon === 'sparkles' ? (
                                        <Sparkles className="w-4 h-4 text-white" />
                                    ) : (
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <span className="text-xs font-semibold uppercase text-[#8460ea]">
                                    {primaryAction.type === 'genius' ? 'Genius Discovery' : 'Growth Path'}
                                </span>
                            </div>

                            <h4 className="text-lg font-bold text-[#2c3150] mb-1">
                                {primaryAction.title}
                            </h4>
                            <p className="text-sm text-[rgba(44,49,80,0.7)] mb-4">
                                {primaryAction.description}
                            </p>

                            <Button
                                asChild
                                className="w-full bg-[#8460ea] hover:bg-[#7550da]"
                                onClick={() => onActionClick?.(primaryAction)}
                            >
                                <Link to={primaryAction.route}>
                                    {primaryAction.ctaLabel}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Divider with "or" */}
                {primaryAction && secondaryAction && (
                    <div className="flex items-center gap-3 px-4">
                        <div className="flex-1 h-px bg-[#a4a3d0]/30" />
                        <span className="text-xs text-[#2c3150]/50 uppercase">or</span>
                        <div className="flex-1 h-px bg-[#a4a3d0]/30" />
                    </div>
                )}

                {/* Secondary Action Card */}
                {secondaryAction && (
                    <div
                        className={cn(
                            "rounded-xl border p-4",
                            "border-[#a4a3d0]/20 bg-white/85 hover:border-[#a4a3d0]/40 transition-colors"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#a4a3d0]/20 flex items-center justify-center flex-shrink-0">
                                {secondaryAction.icon === 'sparkles' ? (
                                    <Sparkles className="w-4 h-4 text-[#2c3150]/70" />
                                ) : (
                                    <TrendingUp className="w-4 h-4 text-[#2c3150]/70" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-[#2c3150]/60 uppercase ">
                                        {secondaryAction.type === 'genius' ? 'Genius Discovery' : 'Growth Path'}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-[#2c3150] mt-1">
                                    {secondaryAction.title}
                                </h4>
                                <p className="text-sm text-[#2c3150]/60 mt-0.5 mb-3">
                                    {secondaryAction.description}
                                </p>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onActionClick?.(secondaryAction)}
                                >
                                    <Link to={secondaryAction.route}>
                                        {secondaryAction.ctaLabel}
                                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

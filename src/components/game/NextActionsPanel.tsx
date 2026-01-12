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
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50">
                    <button
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">
                                {completedSteps.length} step{completedSteps.length > 1 ? 's' : ''} completed
                            </span>
                            <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                +{completedSteps.reduce((sum, s) => sum + s.xpEarned, 0)} XP
                            </span>
                        </div>
                        {showCompleted ? (
                            <ChevronUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-emerald-500" />
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
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-slate-700">{step.title}</span>
                                    </div>
                                    <span className="text-xs text-emerald-600">+{step.xpEarned} XP</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Two Next Actions */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Your Next Move
                </h3>

                {/* Primary Action Card with Shimmer */}
                {primaryAction && (
                    <div
                        className={cn(
                            "relative rounded-xl border-2 p-5 overflow-hidden",
                            "border-indigo-200 bg-indigo-50",
                            "shimmer-card"
                        )}
                    >
                        {/* Shimmer overlay */}
                        <div className="shimmer-overlay" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                    {primaryAction.icon === 'sparkles' ? (
                                        <Sparkles className="w-4 h-4 text-white" />
                                    ) : (
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                                    {primaryAction.type === 'genius' ? 'Genius Discovery' : 'Growth Path'}
                                </span>
                            </div>

                            <h4 className="text-lg font-bold text-slate-900 mb-1">
                                {primaryAction.title}
                            </h4>
                            <p className="text-sm text-slate-600 mb-4">
                                {primaryAction.description}
                            </p>

                            <Button
                                asChild
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
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
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400 uppercase">or</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>
                )}

                {/* Secondary Action Card */}
                {secondaryAction && (
                    <div
                        className={cn(
                            "rounded-xl border p-4",
                            "border-slate-200 bg-white hover:border-slate-300 transition-colors"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                {secondaryAction.icon === 'sparkles' ? (
                                    <Sparkles className="w-4 h-4 text-slate-600" />
                                ) : (
                                    <TrendingUp className="w-4 h-4 text-slate-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        {secondaryAction.type === 'genius' ? 'Genius Discovery' : 'Growth Path'}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-slate-900 mt-1">
                                    {secondaryAction.title}
                                </h4>
                                <p className="text-sm text-slate-500 mt-0.5 mb-3">
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

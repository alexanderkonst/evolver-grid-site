import { ReactNode, useEffect, useState, useRef } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TourStepConfig {
    /** ID to highlight in SpacesRail (matches SPACES.id) */
    targetSpaceId: string;
    /** Title shown in tooltip */
    title: string;
    /** Tagline/subtitle */
    tagline: string;
    /** Full description */
    description: string;
}

interface TourSpotlightProps {
    /** Array of tour steps */
    steps: TourStepConfig[];
    /** Currently active step index */
    currentStep: number;
    /** Callback when user clicks Next */
    onNext: () => void;
    /** Callback when user clicks Back */
    onBack: () => void;
    /** Callback when tour is completed */
    onComplete: () => void;
    /** Callback when user skips the tour */
    onSkip: () => void;
    /** Whether tour is active (shows overlay) */
    isActive: boolean;
}

/**
 * TourSpotlight - Overlay component for guided tour
 * Dims the screen and highlights navigation items with a tooltip
 */
const TourSpotlight = ({
    steps,
    currentStep,
    onNext,
    onBack,
    onComplete,
    onSkip,
    isActive,
}: TourSpotlightProps) => {
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const step = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    // Find and position tooltip next to highlighted element
    useEffect(() => {
        if (!isActive || !step) return;

        const findTarget = () => {
            // Look for the space button by its data attribute or position in rail
            const spaceButtons = document.querySelectorAll('[data-tour-id]');
            const target = Array.from(spaceButtons).find(
                (btn) => btn.getAttribute('data-tour-id') === step.targetSpaceId
            );

            if (target) {
                const rect = target.getBoundingClientRect();
                // Position tooltip to the right of the element on desktop
                setTooltipPosition({
                    top: rect.top + rect.height / 2,
                    left: rect.right + 24,
                });
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(findTarget, 100);
        // Recalculate on resize
        window.addEventListener('resize', findTarget);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', findTarget);
        };
    }, [isActive, step, currentStep]);

    if (!isActive || !step) return null;

    return (
        <>
            {/* Dim overlay - covers entire screen */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[100] transition-opacity duration-300"
                onClick={onSkip}
            />

            {/* Highlight box around the target element */}
            <HighlightBox targetSpaceId={step.targetSpaceId} />

            {/* Tooltip Card */}
            <div
                ref={tooltipRef}
                className={cn(
                    "fixed z-[102] w-80 bg-white rounded-2xl shadow-2xl p-6 transition-all duration-300",
                    "animate-in fade-in slide-in-from-left-4",
                    // Mobile: bottom sheet style
                    "lg:animate-none"
                )}
                style={
                    tooltipPosition
                        ? {
                            top: `${Math.max(100, Math.min(tooltipPosition.top - 80, window.innerHeight - 300))}px`,
                            left: `${tooltipPosition.left}px`,
                        }
                        : {
                            // Mobile fallback: bottom of screen
                            bottom: '2rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                        }
                }
            >
                {/* Step Counter */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[var(--wabi-text-muted)]">
                        Space {currentStep + 1} of {steps.length}
                    </span>
                    <button
                        onClick={onSkip}
                        className="text-sm text-[var(--wabi-text-muted)] hover:text-[var(--wabi-text-primary)] transition-colors"
                    >
                        Skip tour
                    </button>
                </div>

                {/* Tagline */}
                <p className="text-xs uppercase tracking-wide text-[var(--depth-violet)] font-medium mb-1">
                    {step.tagline}
                </p>

                {/* Title */}
                <h3 className="text-xl font-display font-bold text-[var(--wabi-text-primary)] mb-3">
                    {step.title}
                </h3>

                {/* Description */}
                <p className="text-[var(--wabi-text-secondary)] text-sm leading-relaxed mb-6">
                    {step.description}
                </p>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3">
                    {!isFirstStep && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onBack}
                            className="flex-1"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={isLastStep ? onComplete : onNext}
                        className={cn(
                            "flex-1 bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)]",
                            "hover:opacity-90 transition-opacity"
                        )}
                    >
                        {isLastStep ? "Finish Tour" : "Next"}
                        {!isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </div>
        </>
    );
};

/**
 * HighlightBox - Creates a "spotlight" effect around the target element
 */
const HighlightBox = ({ targetSpaceId }: { targetSpaceId: string }) => {
    const [rect, setRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        const findTarget = () => {
            const target = document.querySelector(`[data-tour-id="${targetSpaceId}"]`);
            if (target) {
                setRect(target.getBoundingClientRect());
            }
        };

        findTarget();
        window.addEventListener('resize', findTarget);
        return () => window.removeEventListener('resize', findTarget);
    }, [targetSpaceId]);

    if (!rect) return null;

    const padding = 8;

    return (
        <div
            className="fixed z-[101] rounded-xl ring-4 ring-white/50 shadow-[0_0_30px_rgba(255,255,255,0.5)] pointer-events-none transition-all duration-300"
            style={{
                top: rect.top - padding,
                left: rect.left - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2,
            }}
        />
    );
};

export default TourSpotlight;

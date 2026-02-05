import { ArrowLeft, ArrowRight, User, Zap, Compass, Building2, Lock, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TourStepsScreenProps {
    onComplete: () => void;
    onBack: () => void;
    onSkip: () => void;
}

interface TourStep {
    id: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    title: string;
    tagline: string;
    description: string;
    status: "unlocked" | "locked" | "view-only";
    unlockAction?: string;
}

const TOUR_STEPS: TourStep[] = [
    {
        id: "profile",
        icon: User,
        iconColor: "text-[var(--depth-violet)]",
        iconBg: "bg-[var(--depth-violet)]/10",
        title: "Your Profile",
        tagline: "Your Zone of Genius lives here",
        description: "This is you — your Zone of Genius, your story, your unique gifts. Everything you discover about yourself gets saved here.",
        status: "unlocked",
    },
    {
        id: "zog-applications",
        icon: Eye,
        iconColor: "text-[var(--wabi-aqua)]",
        iconBg: "bg-[var(--wabi-aqua)]/10",
        title: "Your Genius Applications",
        tagline: "Explore how your genius applies",
        description: "Discover where your Zone of Genius shines — in work, relationships, and life. Read insights tailored to your unique pattern.",
        status: "unlocked",
    },
    {
        id: "learn",
        icon: Zap,
        iconColor: "text-[var(--wabi-sage)]",
        iconBg: "bg-[var(--wabi-sage)]/10",
        title: "Learn & Grow",
        tagline: "Your path of transformation",
        description: "Map your Quality of Life, choose your growth path, and access transformational content. This is where you grow yourself.",
        status: "unlocked",
    },
    {
        id: "build",
        icon: Building2,
        iconColor: "text-[var(--wabi-orchid)]",
        iconBg: "bg-[var(--wabi-orchid)]/10",
        title: "Build Your Business",
        tagline: "Turn genius into income",
        description: "Create your unique offer, build your landing page, and launch your genius business to the world.",
        status: "unlocked",
    },
    {
        id: "meet",
        icon: Compass,
        iconColor: "text-[var(--wabi-blush)]",
        iconBg: "bg-[var(--wabi-blush)]/10",
        title: "Meet Your People",
        tagline: "Find collaborators",
        description: "Connect with aligned people through genius matchmaking. Find partners, mentors, and collaborators who complement your gifts.",
        status: "unlocked",
    },
];

/**
 * TourStepsScreen - 5-space tooltip walkthrough
 * Shows each space with description, lock status, and unlock action
 */
const TourStepsScreen = ({ onComplete, onBack, onSkip }: TourStepsScreenProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const step = TOUR_STEPS[currentStep];
    const Icon = step.icon;

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            onBack();
        }
    };

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-b from-white to-[var(--wabi-pearl)]">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-[var(--wabi-text-secondary)] hover:text-[var(--wabi-text-primary)] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm">Back</span>
                </button>
                <div className="flex items-center gap-2 text-sm text-[var(--wabi-text-muted)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--wabi-lilac)]" />
                    <span>Space {currentStep + 1} of {TOUR_STEPS.length}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                <div className="w-full max-w-md text-center space-y-6">

                    {/* Space Icon */}
                    <div className={`w-20 h-20 mx-auto rounded-2xl ${step.iconBg} flex items-center justify-center shadow-lg`}>
                        <Icon className={`w-10 h-10 ${step.iconColor}`} />
                    </div>

                    {/* Tagline */}
                    <p className="text-sm uppercase tracking-wide text-[var(--wabi-text-muted)]">
                        {step.tagline}
                    </p>

                    {/* Title */}
                    <h1 className="text-3xl font-display font-bold text-[var(--wabi-text-primary)]">
                        {step.title}
                    </h1>

                    {/* Description Card */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg space-y-4">
                        <p className="text-lg text-[var(--wabi-text-secondary)] leading-relaxed">
                            {step.description}
                        </p>

                        {/* Status Badge */}
                        <div className="flex items-center justify-center gap-2 pt-2">
                            {step.status === "unlocked" && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--wabi-sage)]/20 text-[var(--wabi-sage)]">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">Unlocked</span>
                                </span>
                            )}
                            {step.status === "locked" && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--wabi-blush)]/20 text-[var(--wabi-blush)]">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-sm font-medium">Locked</span>
                                </span>
                            )}
                            {step.status === "view-only" && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--wabi-champagne)]/40 text-[var(--wabi-text-secondary)]">
                                    <Eye className="w-4 h-4" />
                                    <span className="text-sm font-medium">View Only</span>
                                </span>
                            )}
                        </div>

                        {/* Unlock Action */}
                        {step.unlockAction && (
                            <p className="text-sm text-[var(--wabi-text-muted)]">
                                <span className="font-medium">To unlock:</span> {step.unlockAction}
                            </p>
                        )}
                    </div>

                    {/* Progress Dots */}
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {TOUR_STEPS.map((_, index) => (
                            <span
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                    ? 'w-6 bg-[var(--depth-violet)]'
                                    : index < currentStep
                                        ? 'bg-[var(--wabi-sage)]'
                                        : 'bg-[var(--wabi-lavender)]/40'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer CTAs */}
            <div className="px-6 pb-8 space-y-3">
                <div className="max-w-md mx-auto space-y-3">
                    <Button
                        size="lg"
                        className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] text-white hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                        onClick={handleNext}
                    >
                        {currentStep < TOUR_STEPS.length - 1 ? (
                            <>
                                Next: {TOUR_STEPS[currentStep + 1].title}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        ) : (
                            <>
                                Complete Tour
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="lg"
                        className="w-full h-12 text-[var(--wabi-text-secondary)] hover:text-[var(--wabi-text-primary)]"
                        onClick={onSkip}
                    >
                        Skip Tour
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TourStepsScreen;

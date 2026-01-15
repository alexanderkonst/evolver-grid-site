import { Check, Sparkles, Briefcase, Map, Target, Compass, Users, Flag } from "lucide-react";

interface OnboardingProgressProps {
    currentStep: number;
    className?: string;
}

const ONBOARDING_STEPS = [
    { id: 1, label: "Genius", icon: Sparkles, description: "Discover your Zone of Genius" },
    { id: 2, label: "Business", icon: Briefcase, description: "Create your Genius Business" },
    { id: 3, label: "Life Map", icon: Map, description: "Assess your Quality of Life" },
    { id: 4, label: "Priorities", icon: Target, description: "Set growth priorities" },
    { id: 5, label: "Recipe", icon: Compass, description: "Get your growth recipe" },
    { id: 6, label: "Daily", icon: Flag, description: "Enter the daily loop" },
    { id: 7, label: "Connect", icon: Users, description: "Find your people" },
    { id: 8, label: "Mission", icon: Flag, description: "Discover your mission" },
];

/**
 * OnboardingProgress - Visual progress through 8-step journey
 * Shows as a horizontal bar with icons for each step
 */
const OnboardingProgress = ({ currentStep, className = "" }: OnboardingProgressProps) => {
    return (
        <div className={`w-full ${className}`}>
            {/* Progress bar */}
            <div className="relative">
                {/* Background track */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#a4a3d0]/20" />

                {/* Filled track */}
                <div
                    className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-[#8460ea] to-[#a4a3d0] transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100}%` }}
                />

                {/* Step dots */}
                <div className="relative flex justify-between">
                    {ONBOARDING_STEPS.map((step) => {
                        const isCompleted = step.id < currentStep;
                        const isCurrent = step.id === currentStep;
                        const isPending = step.id > currentStep;
                        const Icon = step.icon;

                        return (
                            <div key={step.id} className="flex flex-col items-center" style={{ width: '12.5%' }}>
                                {/* Circle with icon */}
                                <div
                                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCompleted
                                            ? "bg-[#8460ea] text-white"
                                            : isCurrent
                                                ? "bg-[#8460ea] text-white ring-4 ring-[#8460ea]/20"
                                                : "bg-[#a4a3d0]/20 text-[#a4a3d0]"
                                        }
                  `}
                                >
                                    {isCompleted ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={`
                    mt-2 text-xs font-medium text-center
                    ${isCurrent ? "text-[#8460ea]" : isCompleted ? "text-[#2c3150]" : "text-[#a4a3d0]"}
                  `}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Current step description */}
            <div className="mt-4 text-center">
                <p className="text-sm text-[#a4a3d0]">
                    Step {currentStep} of {ONBOARDING_STEPS.length}: {ONBOARDING_STEPS[currentStep - 1]?.description}
                </p>
            </div>
        </div>
    );
};

export default OnboardingProgress;
export { ONBOARDING_STEPS };

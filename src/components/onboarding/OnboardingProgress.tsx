import { Check, Sparkles, Briefcase, Map, Target, Compass, Users, Flag } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OnboardingProgressProps {
    currentStep: number;
    className?: string;
}

const ONBOARDING_STEPS = [
    { id: 1, labelKey: "onboarding.step1Label", icon: Sparkles, descriptionKey: "onboarding.step1Description" },
    { id: 2, labelKey: "onboarding.step2Label", icon: Briefcase, descriptionKey: "onboarding.step2Description" },
    { id: 3, labelKey: "onboarding.step3Label", icon: Map, descriptionKey: "onboarding.step3Description" },
    { id: 4, labelKey: "onboarding.step4Label", icon: Target, descriptionKey: "onboarding.step4Description" },
    { id: 5, labelKey: "onboarding.step5Label", icon: Compass, descriptionKey: "onboarding.step5Description" },
    { id: 6, labelKey: "onboarding.step6Label", icon: Flag, descriptionKey: "onboarding.step6Description" },
    { id: 7, labelKey: "onboarding.step7Label", icon: Users, descriptionKey: "onboarding.step7Description" },
    { id: 8, labelKey: "onboarding.step8Label", icon: Flag, descriptionKey: "onboarding.step8Description" },
];

/**
 * OnboardingProgress - Visual progress through 8-step journey
 * Shows as a horizontal bar with icons for each step
 */
const OnboardingProgress = ({ currentStep, className = "" }: OnboardingProgressProps) => {
    const { t } = useTranslation();

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
                                    {t(step.labelKey)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Current step description */}
            <div className="mt-4 text-center">
                <p className="text-sm text-[#a4a3d0]">
                    {t("onboarding.stepCounter", {
                        current: currentStep,
                        total: ONBOARDING_STEPS.length,
                        description: ONBOARDING_STEPS[currentStep - 1]
                            ? t(ONBOARDING_STEPS[currentStep - 1].descriptionKey)
                            : "",
                    })}
                </p>
            </div>
        </div>
    );
};

export default OnboardingProgress;
export { ONBOARDING_STEPS };

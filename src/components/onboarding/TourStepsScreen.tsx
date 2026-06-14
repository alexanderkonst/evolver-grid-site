import { useState } from "react";
import { useTranslation } from "react-i18next";
import GameShellV2 from "@/components/game/GameShellV2";
import TourSpotlight, { TourStepConfig } from "./TourSpotlight";

interface TourStepsScreenProps {
    onComplete: () => void;
    onBack: () => void;
    onSkip: () => void;
}

/**
 * Tour steps configuration - maps to SpacesRail space IDs
 * Order: Profile (ME) first, then other spaces
 *
 * Copy lives in i18n under the `tourSteps.<key>.*` namespace and is
 * resolved at render time (see component body).
 */
interface TourStepDef {
    /** ID to highlight in SpacesRail (matches SPACES.id) */
    targetSpaceId: string;
    /** i18n key suffix for this step's title/tagline/description */
    key: string;
}

const TOUR_STEPS: TourStepDef[] = [
    // Hidden until built — uncomment to re-enable
    // {
    //     targetSpaceId: "next-move",
    //     key: "nextMove",
    // },
    {
        targetSpaceId: "grow",
        key: "me",
    },
    {
        targetSpaceId: "learn",
        key: "learn",
    },
    {
        targetSpaceId: "meet",
        key: "meet",
    },
    {
        targetSpaceId: "collaborate",
        key: "collaborate",
    },
    {
        targetSpaceId: "build",
        key: "build",
    },
    {
        targetSpaceId: "buysell",
        key: "offer",
    },
];

/**
 * TourStepsScreen - Interactive tour within GameShell
 * Shows navigation with spotlight highlighting each space
 */
const TourStepsScreen = ({ onComplete, onBack, onSkip }: TourStepsScreenProps) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);

    const resolvedSteps: TourStepConfig[] = TOUR_STEPS.map((step) => ({
        targetSpaceId: step.targetSpaceId,
        title: t(`tourSteps.${step.key}.title`),
        tagline: t(`tourSteps.${step.key}.tagline`),
        description: t(`tourSteps.${step.key}.description`),
    }));

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
        <GameShellV2 showNavigation>
            {/* Empty content - tour shows in spotlight overlay */}
            <div className="min-h-[60vh] flex items-center justify-center p-8">
                <div className="text-center text-[var(--wabi-text-muted)]">
                    <p className="text-sm">{t("tourSteps.exploreHint")} →</p>
                </div>
            </div>

            {/* Tour Spotlight Overlay */}
            <TourSpotlight
                steps={resolvedSteps}
                currentStep={currentStep}
                onNext={handleNext}
                onBack={handleBack}
                onComplete={onComplete}
                onSkip={onSkip}
                isActive={true}
            />
        </GameShellV2>
    );
};

export default TourStepsScreen;

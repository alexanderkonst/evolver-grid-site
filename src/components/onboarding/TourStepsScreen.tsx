import { useState } from "react";
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
 */
const TOUR_STEPS: TourStepConfig[] = [
    {
        targetSpaceId: "grow",
        title: "Your Profile",
        tagline: "Your Zone of Genius lives here",
        description: "This is you — your Zone of Genius, your story, your unique gifts. Everything you discover about yourself gets saved here.",
    },
    {
        targetSpaceId: "next-move",
        title: "My Next Move",
        tagline: "Your personalized recommendations",
        description: "This is your command center. See your recommended next action, track your progress, and stay focused on what matters most.",
    },
    {
        targetSpaceId: "learn",
        title: "Learn & Grow",
        tagline: "Your path of transformation",
        description: "Map your Quality of Life, choose your growth path, and access transformational content. This is where you grow yourself.",
    },
    {
        targetSpaceId: "build",
        title: "Build Your Business",
        tagline: "Turn genius into income",
        description: "Create your unique offer, build your landing page, and launch your genius business to the world.",
    },
    {
        targetSpaceId: "meet",
        title: "Meet Your People",
        tagline: "Find collaborators",
        description: "Connect with aligned people through genius matchmaking. Find partners, mentors, and collaborators who complement your gifts.",
    },
];

/**
 * TourStepsScreen - Interactive tour within GameShell
 * Shows navigation with spotlight highlighting each space
 */
const TourStepsScreen = ({ onComplete, onBack, onSkip }: TourStepsScreenProps) => {
    const [currentStep, setCurrentStep] = useState(0);

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
        <GameShellV2>
            {/* Empty content - tour shows in spotlight overlay */}
            <div className="min-h-[60vh] flex items-center justify-center p-8">
                <div className="text-center text-[var(--wabi-text-muted)]">
                    <p className="text-sm">Explore your spaces →</p>
                </div>
            </div>

            {/* Tour Spotlight Overlay */}
            <TourSpotlight
                steps={TOUR_STEPS}
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

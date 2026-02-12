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
        targetSpaceId: "next-move",
        title: "My Next Move",
        tagline: "Your personalized recommendations",
        description: "This is your command center. See your recommended next action, track your progress, and stay focused on what matters most.",
    },
    {
        targetSpaceId: "grow",
        title: "Me",
        tagline: "Your Zone of Genius lives here",
        description: "This is you — your Zone of Genius, your story, your unique gifts. Everything you discover about yourself gets saved here.",
    },
    {
        targetSpaceId: "learn",
        title: "Learn",
        tagline: "Your path of transformation",
        description: "Map your Quality of Life, choose your growth path, and access transformational content. This is where you grow.",
    },
    {
        targetSpaceId: "meet",
        title: "Meet",
        tagline: "Find your people",
        description: "Connect with aligned people through genius matchmaking. Find partners, mentors, and collaborators who complement your gifts.",
    },
    {
        targetSpaceId: "collaborate",
        title: "Collaborate",
        tagline: "Work together",
        description: "Join forces with others on shared projects and missions. This is where individual genius becomes collective impact.",
    },
    {
        targetSpaceId: "build",
        title: "Build",
        tagline: "Turn genius into income",
        description: "Create your unique offer, build your landing page, and launch your genius business to the world.",
    },
    {
        targetSpaceId: "buysell",
        title: "Buy & Sell",
        tagline: "The marketplace",
        description: "Browse and purchase offers from other creators, or list your own. This is where genius gets exchanged.",
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

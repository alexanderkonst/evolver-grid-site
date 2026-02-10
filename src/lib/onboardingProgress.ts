/**
 * Maps onboarding_stage from database to step number (1-8)
 */
export const getOnboardingStep = (stage: string | null | undefined): number => {
    switch (stage) {
        case null:
        case undefined:
        case "new":
        case "started":
            return 1; // Discover Genius
        case "zog_complete":
            return 2; // Create Business
        case "offer_complete":
            return 3; // Life Map
        case "qol_complete":
            return 4; // Priorities
        case "priorities_complete":
            return 5; // Growth Recipe
        case "recipe_complete":
            return 6; // Daily Loop
        case "daily_active":
            return 7; // Connect
        case "unlocked":
        case "complete":
            return 8; // Mission
        default:
            return 1;
    }
};

/**
 * Get the next step URL based on current onboarding_stage
 */
export const getNextStepUrl = (stage: string | null | undefined): string => {
    const step = getOnboardingStep(stage);
    switch (step) {
        case 1:
            return "/zone-of-genius/entry";
        case 2:
            return "/zone-of-genius/entry"; // Genius Business is part of ZoG flow
        case 3:
            return "/quality-of-life-map/assessment";
        case 4:
            return "/quality-of-life-map/priorities";
        case 5:
            return "/quality-of-life-map/growth-recipe";
        case 6:
            return "/game";
        case 7:
            return "/game/collabs";
        case 8:
            return "/game/me/mission";
        default:
            return "/game";
    }
};

/**
 * Check if onboarding is complete
 */
export const isOnboardingComplete = (stage: string | null | undefined): boolean => {
    return stage === "unlocked" || stage === "complete";
};

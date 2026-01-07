export interface MissionPillar {
    id: string;
    title: string;
    description: string;
    icon?: string; // Icon name from lucide-react
    color?: string; // Tailwind color class stub
}

export interface MissionFocusArea {
    id: string;
    pillarId: string;
    title: string;
    description: string;
    // Future: tags, heatmaps
}

export interface MissionKeyChallenge {
    id: string;
    focusAreaId: string;
    title: string;
    description: string;
}

export interface MissionDesiredOutcome {
    id: string;
    challengeId: string;
    title: string;
    description: string;
}

export interface Mission {
    id: string;
    outcomeId: string;
    title: string;
    statement: string;
    existingProjects?: string[];
    chatLink?: string;
    pillarId?: string;
    focusAreaId?: string;
    challengeId?: string;
    status?: string;
}

export type MissionSelection = {
    pillarId?: string;
    focusAreaId?: string;
    challengeId?: string;
    outcomeId?: string;
    missionId?: string;
};

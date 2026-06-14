/**
 * Domain to Vector Mapping
 * Maps QoL domains to growth vectors for recommendation algorithm
 */

import { type DomainId } from "@/modules/quality-of-life-map/qolConfig";

export type VectorId = "genius" | "body" | "mind" | "emotions" | "spirit";

/**
 * Maps each QoL domain to its primary growth vector
 * Tie-breaker rule: When multiple vectors could apply, first listed wins
 */
export const DOMAIN_TO_VECTOR: Record<DomainId, VectorId> = {
    wealth: "genius",
    health: "body",
    happiness: "spirit",
    love: "emotions",
    impact: "mind",
    growth: "spirit", // tie-breaker: Spirit wins over Mind
    socialTies: "emotions",
    home: "body",
};

/**
 * Vector display configuration
 */
export const VECTOR_CONFIG: Record<VectorId, { label: string; icon: string; color: string }> = {
    genius: { label: "Genius", icon: "🎯", color: "#cec9b0" },
    body: { label: "Body", icon: "💪", color: "#b1c9b6" },
    mind: { label: "Mind", icon: "🧠", color: "#29549f" },
    emotions: { label: "Emotions", icon: "💖", color: "#cea4ae" },
    spirit: { label: "Spirit", icon: "✨", color: "#a4a3d0" },
};

/**
 * Starter actions for each vector
 * Used when user has no completed actions
 * `title` is the English fallback; `titleKey` resolves the localized label via i18n.
 */
export const STARTER_ACTIONS: Record<VectorId, { title: string; titleKey: string; duration: number; xp: number }> = {
    genius: { title: "Articulate Your Top 3 Talents", titleKey: "nextMove.starterActions.genius", duration: 10, xp: 15 },
    body: { title: "10-Minute Morning Stretch", titleKey: "nextMove.starterActions.body", duration: 10, xp: 10 },
    mind: { title: "Read 1 Educational Article", titleKey: "nextMove.starterActions.mind", duration: 15, xp: 10 },
    emotions: { title: "Gratitude Journal Entry", titleKey: "nextMove.starterActions.emotions", duration: 5, xp: 5 },
    spirit: { title: "5-Minute Breathing Practice", titleKey: "nextMove.starterActions.spirit", duration: 5, xp: 10 },
};

/**
 * Find the lowest QoL domain from scores
 */
export function findLowestDomain(scores: Partial<Record<DomainId, number>>): DomainId | null {
    let lowest: { domain: DomainId; score: number } | null = null;

    for (const [domain, score] of Object.entries(scores)) {
        if (typeof score === "number" && score > 0) {
            if (!lowest || score < lowest.score) {
                lowest = { domain: domain as DomainId, score };
            }
        }
    }

    return lowest?.domain ?? null;
}

/**
 * Get the recommended vector based on QoL scores
 */
export function getRecommendedVector(scores: Partial<Record<DomainId, number>>): VectorId | null {
    const lowestDomain = findLowestDomain(scores);
    if (!lowestDomain) return null;
    return DOMAIN_TO_VECTOR[lowestDomain];
}

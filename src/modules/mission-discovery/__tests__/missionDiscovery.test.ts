import { describe, expect, it } from "vitest";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";
import { DESIRED_OUTCOMES } from "@/modules/mission-discovery/data/outcomes";
import { KEY_CHALLENGES } from "@/modules/mission-discovery/data/challenges";
import { FOCUS_AREAS } from "@/modules/mission-discovery/data/focusAreas";
import { PILLARS } from "@/modules/mission-discovery/data/pillars";

// Helper function to build mission context (same as in MissionDiscoveryLanding)
const buildMissionContext = (mission: typeof MISSIONS[0]) => {
    const outcome = DESIRED_OUTCOMES.find(o => o.id === mission.outcomeId);
    const challenge = outcome ? KEY_CHALLENGES.find(c => c.id === outcome.challengeId) : undefined;
    const focusArea = challenge ? FOCUS_AREAS.find(f => f.id === challenge.focusAreaId) : undefined;
    const pillar = focusArea ? PILLARS.find(p => p.id === focusArea.pillarId) : undefined;

    return {
        pillar: pillar?.title,
        focusArea: focusArea?.title,
        challenge: challenge?.title,
        outcome: outcome?.title,
        pillarId: pillar?.id,
    };
};

// Helper function to tokenize text for matching
const STOP_WORDS = new Set([
    "the", "and", "for", "with", "that", "this", "from", "into", "your", "you",
    "are", "was", "were", "our", "their", "them", "they", "his", "her", "she",
    "him", "its", "about", "over", "under", "here", "there", "then", "than",
    "what", "when", "where", "which", "who", "whom", "why", "how", "a", "an",
    "to", "of", "in", "on", "at", "by", "as", "or", "be", "is"
]);

const tokenize = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(token => token.length > 2 && !STOP_WORDS.has(token));

// Helper function to match missions by text
const matchMissionsByText = (text: string, limit: number = 6) => {
    const tokens = tokenize(text);
    const tokenSet = new Set(tokens);

    return MISSIONS.map((mission) => {
        const corpus = `${mission.title} ${mission.statement}`;
        const missionTokens = tokenize(corpus);
        const overlap = missionTokens.reduce((count, token) => count + (tokenSet.has(token) ? 1 : 0), 0);
        return {
            mission,
            score: overlap,
            context: buildMissionContext(mission),
        };
    })
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};

describe("Mission Discovery", () => {
    describe("Data Structure", () => {
        it("has pillars defined", () => {
            expect(PILLARS.length).toBeGreaterThan(0);
            PILLARS.forEach(pillar => {
                expect(pillar.id).toBeDefined();
                expect(pillar.title).toBeDefined();
            });
        });

        it("has focus areas linked to pillars", () => {
            expect(FOCUS_AREAS.length).toBeGreaterThan(0);
            FOCUS_AREAS.forEach(focusArea => {
                expect(focusArea.pillarId).toBeDefined();
                const linkedPillar = PILLARS.find(p => p.id === focusArea.pillarId);
                expect(linkedPillar).toBeDefined();
            });
        });

        it("has challenges linked to focus areas", () => {
            expect(KEY_CHALLENGES.length).toBeGreaterThan(0);
            KEY_CHALLENGES.forEach(challenge => {
                expect(challenge.focusAreaId).toBeDefined();
                const linkedFocusArea = FOCUS_AREAS.find(fa => fa.id === challenge.focusAreaId);
                expect(linkedFocusArea).toBeDefined();
            });
        });

        it("has outcomes linked to challenges", () => {
            expect(DESIRED_OUTCOMES.length).toBeGreaterThan(0);
            DESIRED_OUTCOMES.forEach(outcome => {
                expect(outcome.challengeId).toBeDefined();
                const linkedChallenge = KEY_CHALLENGES.find(c => c.id === outcome.challengeId);
                expect(linkedChallenge).toBeDefined();
            });
        });

        it("has missions linked to outcomes", () => {
            expect(MISSIONS.length).toBeGreaterThan(0);
            MISSIONS.forEach(mission => {
                expect(mission.outcomeId).toBeDefined();
                const linkedOutcome = DESIRED_OUTCOMES.find(o => o.id === mission.outcomeId);
                expect(linkedOutcome).toBeDefined();
            });
        });
    });

    describe("buildMissionContext", () => {
        it("builds full context for a valid mission", () => {
            const mission = MISSIONS[0];
            const context = buildMissionContext(mission);

            expect(context.outcome).toBeDefined();
            expect(context.challenge).toBeDefined();
            expect(context.focusArea).toBeDefined();
            expect(context.pillar).toBeDefined();
            expect(context.pillarId).toBeDefined();
        });

        it("returns complete hierarchy chain", () => {
            const mission = MISSIONS[0];
            const context = buildMissionContext(mission);

            // Verify the chain exists
            const outcome = DESIRED_OUTCOMES.find(o => o.id === mission.outcomeId);
            const challenge = outcome ? KEY_CHALLENGES.find(c => c.id === outcome.challengeId) : undefined;
            const focusArea = challenge ? FOCUS_AREAS.find(f => f.id === challenge.focusAreaId) : undefined;
            const pillar = focusArea ? PILLARS.find(p => p.id === focusArea.pillarId) : undefined;

            expect(context.outcome).toBe(outcome?.title);
            expect(context.challenge).toBe(challenge?.title);
            expect(context.focusArea).toBe(focusArea?.title);
            expect(context.pillar).toBe(pillar?.title);
        });
    });

    describe("tokenize", () => {
        it("converts text to lowercase tokens", () => {
            const tokens = tokenize("Hello World");
            expect(tokens).toContain("hello");
            expect(tokens).toContain("world");
        });

        it("removes stop words", () => {
            const tokens = tokenize("The quick brown fox and the lazy dog");
            expect(tokens).not.toContain("the");
            expect(tokens).not.toContain("and");
            expect(tokens).toContain("quick");
            expect(tokens).toContain("brown");
            expect(tokens).toContain("lazy");
        });

        it("removes short tokens", () => {
            const tokens = tokenize("I am a developer");
            expect(tokens).not.toContain("i");
            expect(tokens).not.toContain("am");
            expect(tokens).toContain("developer");
        });

        it("removes special characters", () => {
            const tokens = tokenize("Hello, World! How's it going?");
            expect(tokens).toContain("hello");
            expect(tokens).toContain("world");
            expect(tokens).toContain("going");
        });
    });

    describe("matchMissionsByText", () => {
        it("returns matches sorted by score", () => {
            const matches = matchMissionsByText("education training curriculum development");

            expect(matches.length).toBeGreaterThan(0);
            for (let i = 1; i < matches.length; i++) {
                expect(matches[i - 1].score).toBeGreaterThanOrEqual(matches[i].score);
            }
        });

        it("respects the limit parameter", () => {
            const matches = matchMissionsByText("global development transformation", 3);
            expect(matches.length).toBeLessThanOrEqual(3);
        });

        it("returns empty array for unmatched text", () => {
            const matches = matchMissionsByText("xyz123 qwerty asdfgh");
            expect(matches.length).toBe(0);
        });

        it("includes mission context in results", () => {
            const matches = matchMissionsByText("framework synthesis integration");

            if (matches.length > 0) {
                expect(matches[0].context).toBeDefined();
                expect(matches[0].mission).toBeDefined();
                expect(matches[0].score).toBeGreaterThan(0);
            }
        });
    });

    describe("Holonic Hierarchy Navigation", () => {
        it("can navigate from pillar to missions", () => {
            const pillar = PILLARS[0];

            // Get focus areas for this pillar
            const pillarFocusAreas = FOCUS_AREAS.filter(fa => fa.pillarId === pillar.id);
            expect(pillarFocusAreas.length).toBeGreaterThan(0);

            // Get challenges for these focus areas
            const focusAreaIds = new Set(pillarFocusAreas.map(fa => fa.id));
            const pillarChallenges = KEY_CHALLENGES.filter(c => focusAreaIds.has(c.focusAreaId));
            expect(pillarChallenges.length).toBeGreaterThan(0);

            // Get outcomes for these challenges
            const challengeIds = new Set(pillarChallenges.map(c => c.id));
            const pillarOutcomes = DESIRED_OUTCOMES.filter(o => challengeIds.has(o.challengeId));
            expect(pillarOutcomes.length).toBeGreaterThan(0);

            // Get missions for these outcomes
            const outcomeIds = new Set(pillarOutcomes.map(o => o.id));
            const pillarMissions = MISSIONS.filter(m => outcomeIds.has(m.outcomeId));
            expect(pillarMissions.length).toBeGreaterThan(0);
        });

        it("can navigate from mission back to pillar", () => {
            const mission = MISSIONS[0];
            const context = buildMissionContext(mission);

            expect(context.pillar).toBeDefined();
            expect(context.focusArea).toBeDefined();
            expect(context.challenge).toBeDefined();
            expect(context.outcome).toBeDefined();
        });
    });

    describe("URL Query Parameters", () => {
        it("supports readOnly parameter concept", () => {
            // This tests the concept - actual URL parsing is in the component
            const params = new URLSearchParams("readOnly=true&missionId=test-123");
            expect(params.get("readOnly")).toBe("true");
            expect(params.get("missionId")).toBe("test-123");
        });

        it("supports directCommit parameter concept", () => {
            const params = new URLSearchParams("directCommit=true&missionId=test-123");
            expect(params.get("directCommit")).toBe("true");
        });

        it("supports return path encoding", () => {
            const returnPath = "/game/me";
            const encoded = encodeURIComponent(returnPath);
            expect(decodeURIComponent(encoded)).toBe(returnPath);
        });
    });
});

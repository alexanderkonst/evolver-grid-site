import { describe, expect, it } from "vitest";
import { aggregateLegacyActions, buildGrowthPathActions, buildRecommendationFromLegacy, type RecommendationInputs } from "@/lib/actionEngine";
import { type UnifiedAction } from "@/types/actions";

const baseInputs: RecommendationInputs = {
  questSuggestion: {
    main: {
      quest_title: "Starter Quest",
      practice_type: "breathEnergy",
      approx_duration_minutes: 5,
    },
  },
  upgrade: {
    id: "upgrade-1",
    code: "zog_assessment_completed",
    title: "Zone of Genius Assessment",
    short_label: "ZoG",
    description: "Discover your unique genius.",
    path_slug: "uniqueness",
    branch: "mastery_of_genius",
    is_paid: false,
    xp_reward: 100,
    sort_order: 1,
  },
  practices: [
    {
      id: "practice-1",
      categoryId: "breathEnergy",
      title: "2-minute Micro Breath",
      teacher: "Fixture Guide",
      url: "https://example.com/micro-breath",
      youtubeId: "fixture123",
      durationMinutes: 2,
      primaryPath: "spirit",
      primaryDomain: "growth",
    },
  ],
  lowestDomains: ["Growth"],
  totalCompletedActions: 0,
};

describe("actionEngine", () => {
  it("aggregates legacy sources and extra actions", () => {
    const extraAction: UnifiedAction = {
      id: "marketplace:offer-1",
      type: "library_item",
      loop: "marketplace",
      title: "Marketplace Offer",
      source: "fixtures",
      duration: "md",
    };

    const { candidates } = aggregateLegacyActions({
      ...baseInputs,
      extraActions: [extraAction],
    });

    expect(candidates.some(action => action.id === "marketplace:offer-1")).toBe(true);
    expect(candidates.length).toBeGreaterThanOrEqual(4);
  });

  it("prioritizes QoL-matching actions and loop order", () => {
    const extraAction: UnifiedAction = {
      id: "profile:celebrate",
      type: "celebration",
      loop: "profile",
      title: "Profile Celebration",
      source: "fixtures",
      duration: "sm",
      qolDomain: "growth",
    };

    const recommendation = buildRecommendationFromLegacy({
      ...baseInputs,
      extraActions: [extraAction],
      lowestDomains: ["Growth"],
    });

    expect(recommendation?.primary.id).toBe("profile:celebrate");
  });

  it("keeps alternates to two items and excludes primary", () => {
    const recommendation = buildRecommendationFromLegacy({
      ...baseInputs,
      questSuggestion: {
        main: {
          quest_title: "Primary Quest",
          practice_type: "breathEnergy",
          approx_duration_minutes: 10,
        },
        alternatives: [
          { quest_title: "Alt Quest 1", practice_type: "breathEnergy", approx_duration_minutes: 10 },
          { quest_title: "Alt Quest 2", practice_type: "activations", approx_duration_minutes: 10 },
          { quest_title: "Alt Quest 3", practice_type: "activations", approx_duration_minutes: 10 },
        ],
      },
      practices: [],
      upgrade: null,
      lowestDomains: [],
      totalCompletedActions: 5,
    });

    expect(recommendation?.primary.title).toBe("Primary Quest");
    expect(recommendation?.alternates?.length).toBe(2);
    expect(recommendation?.alternates?.every(alt => alt.title !== "Primary Quest")).toBe(true);
  });

  it("prefers quick wins for new users", () => {
    const recommendation = buildRecommendationFromLegacy({
      ...baseInputs,
      practices: [
        {
          id: "practice-long",
          categoryId: "breathEnergy",
          title: "Long Practice",
          teacher: "Fixture Guide",
          url: "https://example.com/long",
          youtubeId: "fixture-long",
          durationMinutes: 25,
          primaryPath: "spirit",
          primaryDomain: "growth",
        },
        {
          id: "practice-short",
          categoryId: "breathEnergy",
          title: "Short Practice",
          teacher: "Fixture Guide",
          url: "https://example.com/short",
          youtubeId: "fixture-short",
          durationMinutes: 2,
          primaryPath: "spirit",
          primaryDomain: "growth",
        },
      ],
      questSuggestion: null,
      upgrade: null,
      totalCompletedActions: 0,
      lowestDomains: [],
    });

    expect(recommendation?.primary.title).toBe("Short Practice");
  });

  it("prioritizes loop order when no QoL or quick-win bias applies", () => {
    const extraActions: UnifiedAction[] = [
      {
        id: "matchmaking:connect",
        type: "library_item",
        loop: "matchmaking",
        title: "Matchmaking Action",
        source: "fixtures",
        duration: "md",
      },
      {
        id: "profile:checkin",
        type: "celebration",
        loop: "profile",
        title: "Profile Check-in",
        source: "fixtures",
        duration: "md",
      },
    ];

    const recommendation = buildRecommendationFromLegacy({
      questSuggestion: null,
      practices: [],
      upgrade: null,
      extraActions,
      totalCompletedActions: 10,
      lowestDomains: [],
    });

    expect(recommendation?.primary.id).toBe("profile:checkin");
  });

  it("maps growth path steps into unified actions", () => {
    const actions = buildGrowthPathActions([
      {
        id: "genius-step-1",
        title: "Name your genius edge",
        description: "One sentence clarity.",
        growthPath: "genius",
        durationMinutes: 5,
        xp: 25,
        version: "v1",
      },
    ]);

    expect(actions[0].type).toBe("growth_path_step");
    expect(actions[0].growthPath).toBe("genius");
    expect(actions[0].completionPayload?.xp).toBe(25);
  });
});

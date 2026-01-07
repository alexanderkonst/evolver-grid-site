import { type RecommendationInputs } from "@/lib/actionEngine";
import { type LibraryItem } from "@/modules/library/libraryContent";
import { type Upgrade } from "@/lib/upgradeSystem";

const fixturePractice: LibraryItem = {
  id: "fixture-practice-1",
  categoryId: "breathEnergy",
  title: "2-minute Micro Breath",
  teacher: "Fixture Guide",
  url: "https://example.com/micro-breath",
  youtubeId: "fixture123",
  durationMinutes: 2,
  primaryPath: "spirit",
  primaryDomain: "growth",
};

const fixtureUpgrade: Upgrade = {
  id: "fixture-upgrade-1",
  code: "zog_assessment_completed",
  title: "Zone of Genius Assessment",
  short_label: "ZoG",
  description: "Discover your unique genius.",
  path_slug: "uniqueness",
  branch: "mastery_of_genius",
  is_paid: false,
  xp_reward: 100,
  sort_order: 1,
};

export const actionEngineFixtures: RecommendationInputs = {
  questSuggestion: {
    main: {
      quest_title: "Starter Quest",
      practice_type: "breathEnergy",
      approx_duration_minutes: 5,
      why_it_is_a_good_next_move: "Build momentum with a quick win.",
    },
    alternatives: [
      {
        quest_title: "Alternative Quest",
        practice_type: "activations",
        approx_duration_minutes: 10,
      },
    ],
  },
  upgrade: fixtureUpgrade,
  practices: [fixturePractice],
  lowestDomains: ["Growth"],
  totalCompletedActions: 0,
};

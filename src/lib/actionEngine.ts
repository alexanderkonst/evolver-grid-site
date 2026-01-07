import { type LibraryItem } from "@/modules/library/libraryContent";
import { type Upgrade } from "@/lib/upgradeSystem";
import { type UnifiedAction, type RecommendationSet, type ActionDuration } from "@/types/actions";

type LegacyQuestSuggestion = {
  quest_title: string;
  practice_type?: string;
  approx_duration_minutes?: number;
  why_it_is_a_good_next_move?: string;
};

type LegacyQuestBundle = {
  main: LegacyQuestSuggestion;
  alternatives?: LegacyQuestSuggestion[];
};

const durationToBucket = (minutes?: number | null): ActionDuration | undefined => {
  if (minutes === null || minutes === undefined) return undefined;
  if (minutes <= 3) return "xs";
  if (minutes <= 10) return "sm";
  if (minutes <= 25) return "md";
  return "lg";
};

const normalizeGrowthPath = (path?: string | null) => {
  if (!path) return "genius";
  return path === "uniqueness" ? "genius" : path;
};

const normalizeQuest = (quest: LegacyQuestSuggestion): UnifiedAction => ({
  id: `quest:${quest.quest_title.toLowerCase().replace(/\s+/g, "-")}`,
  type: "quest",
  loop: "transformation",
  title: quest.quest_title,
  duration: durationToBucket(quest.approx_duration_minutes),
  growthPath: "genius",
  source: "lib/mainQuest.ts",
  whyRecommended: quest.why_it_is_a_good_next_move,
  tags: quest.practice_type ? [quest.practice_type] : undefined,
  completionPayload: { sourceId: quest.quest_title },
});

const normalizeUpgrade = (upgrade: Upgrade): UnifiedAction => ({
  id: `upgrade:${upgrade.id}`,
  type: "upgrade",
  loop: "transformation",
  title: upgrade.title,
  description: upgrade.description,
  growthPath: normalizeGrowthPath(upgrade.path_slug),
  duration: "md",
  source: "lib/upgradeSystem.ts",
  completionPayload: {
    sourceId: upgrade.id,
    xp: upgrade.xp_reward,
    growthPath: normalizeGrowthPath(upgrade.path_slug),
  },
  prerequisites: upgrade.prereqs?.map(prereq => ({ description: prereq, fulfilled: false })),
});

const normalizePractice = (practice: LibraryItem): UnifiedAction => ({
  id: `practice:${practice.id}`,
  type: "practice",
  loop: "transformation",
  title: practice.title,
  description: practice.teacher ? `with ${practice.teacher}` : undefined,
  growthPath: normalizeGrowthPath(practice.primaryPath),
  qolDomain: practice.primaryDomain,
  duration: durationToBucket(practice.durationMinutes),
  source: "lib/practiceSystem.ts",
  tags: [practice.categoryId, ...(practice.intents || [])].filter(Boolean) as string[],
  completionPayload: { sourceId: practice.id, growthPath: normalizeGrowthPath(practice.primaryPath) },
});

interface RecommendationInputs {
  questSuggestion?: LegacyQuestBundle | null;
  upgrade?: Upgrade | null;
  practices?: LibraryItem[];
  lowestDomains?: string[];
  totalCompletedActions?: number;
}

const buildRationale = (action: UnifiedAction, lowestDomains?: string[]) => {
  if (action.whyRecommended) return action.whyRecommended;
  if (lowestDomains && lowestDomains.length > 0) {
    return `Helps your ${lowestDomains.join(" & ")} focus.`;
  }
  if (action.type === "upgrade") return "Advance your Showing Up path.";
  return "Quick win to keep momentum.";
};

export const buildRecommendationFromLegacy = (inputs: RecommendationInputs): RecommendationSet | null => {
  const candidates: UnifiedAction[] = [];
  const alternates: UnifiedAction[] = [];

  if (inputs.questSuggestion) {
    const primaryQuest = normalizeQuest(inputs.questSuggestion.main);
    candidates.push(primaryQuest);
    (inputs.questSuggestion.alternatives || []).forEach(alt => alternates.push(normalizeQuest(alt)));
  }

  if (inputs.upgrade) {
    const upgradeAction = normalizeUpgrade(inputs.upgrade);
    candidates.push(upgradeAction);
  }

  if (inputs.practices && inputs.practices.length > 0) {
    inputs.practices.slice(0, 3).forEach(practice => {
      candidates.push(normalizePractice(practice));
    });
  }

  if (candidates.length === 0) return null;

  const totalCompleted = inputs.totalCompletedActions ?? 0;
  const quickWinFirst = totalCompleted < 3;
  const isQuickWin = (duration?: ActionDuration) => duration === "xs" || duration === "sm";

  const quickCandidates = quickWinFirst ? candidates.filter(action => isQuickWin(action.duration)) : [];
  const quickAlternates = quickWinFirst ? alternates.filter(action => isQuickWin(action.duration)) : [];

  const activeCandidates = quickCandidates.length > 0 ? quickCandidates : candidates;
  const activeAlternates = quickAlternates.length > 0 ? quickAlternates : alternates;

  const sorted = activeCandidates.sort((a, b) => {
    const durationScore = (duration?: ActionDuration) => {
      if (!duration) return 3;
      return ["xs", "sm", "md", "lg"].indexOf(duration);
    };

    const quickWinBias = quickWinFirst ? durationScore(a.duration) - durationScore(b.duration) : 0;
    if (quickWinBias !== 0) return quickWinBias;

    if (a.type === "quest" && b.type !== "quest") return -1;
    if (b.type === "quest" && a.type !== "quest") return 1;
    return durationScore(a.duration) - durationScore(b.duration);
  });

  const [primary, ...rest] = sorted;
  const remainingAlternates = [...activeAlternates, ...rest].slice(0, 2);

  return {
    primary: {
      ...primary,
      whyRecommended: buildRationale(primary, inputs.lowestDomains),
    },
    alternates: remainingAlternates.length ? remainingAlternates.map(action => ({
      ...action,
      whyRecommended: buildRationale(action, inputs.lowestDomains),
    })) : undefined,
    rationale: buildRationale(primary, inputs.lowestDomains),
    generatedAt: new Date().toISOString(),
  };
};

export const formatDurationBucket = (duration?: ActionDuration) => {
  switch (duration) {
    case "xs":
      return "≈3 min";
    case "sm":
      return "~10 min";
    case "md":
      return "~20–25 min";
    case "lg":
      return "45–60+ min";
    default:
      return undefined;
  }
};

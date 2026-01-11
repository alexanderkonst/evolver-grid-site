import { type LibraryItem } from "@/modules/library/libraryContent";
import { type Upgrade } from "@/lib/upgradeSystem";
import { type UnifiedAction, type RecommendationSet, type ActionDuration, type ActionLoop } from "@/types/actions";
import { type GrowthPathStep, type GrowthPathProgress } from "@/modules/growth-paths";

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

export const durationToBucket = (minutes?: number | null): ActionDuration | undefined => {
  if (minutes === null || minutes === undefined) return undefined;
  if (minutes <= 3) return "xs";
  if (minutes <= 10) return "sm";
  if (minutes <= 25) return "md";
  return "lg";
};

export const normalizeGrowthPath = (path?: string | null) => {
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
    sourceId: upgrade.code,
    metadata: { upgradeId: upgrade.id },
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

export interface RecommendationInputs {
  questSuggestion?: LegacyQuestBundle | null;
  upgrade?: Upgrade | null;
  practices?: LibraryItem[];
  extraActions?: UnifiedAction[];
  lowestDomains?: string[];
  totalCompletedActions?: number;
}

interface AggregatedActions {
  candidates: UnifiedAction[];
  alternates: UnifiedAction[];
}

export const aggregateLegacyActions = (inputs: RecommendationInputs): AggregatedActions => {
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

  if (inputs.extraActions && inputs.extraActions.length > 0) {
    candidates.push(...inputs.extraActions);
  }

  return { candidates, alternates };
};

const mapGrowthPathStep = (step: GrowthPathStep, stepIndex?: number): UnifiedAction => ({
  id: `sequence:${step.growthPath}:${step.id}`,
  type: "growth_path_step",
  loop: "transformation",
  title: step.title,
  description: step.description,
  growthPath: step.growthPath,
  duration: durationToBucket(step.durationMinutes),
  source: "src/modules/growth-paths",
  tags: step.tags,
  completionPayload: {
    sourceId: step.id,
    xp: step.xp,
    growthPath: step.growthPath,
    metadata: stepIndex === undefined ? { version: step.version } : { stepIndex, version: step.version },
  },
  locks: step.draft ? ["draft"] : undefined,
});

export const buildGrowthPathActions = (steps: GrowthPathStep[]): UnifiedAction[] =>
  steps.map(step => mapGrowthPathStep(step));

export const buildGrowthPathActionsForProgress = (
  steps: GrowthPathStep[],
  progress: GrowthPathProgress
): UnifiedAction[] => {
  const stepsByPath = steps.reduce<Record<string, GrowthPathStep[]>>((acc, step) => {
    if (!acc[step.growthPath]) acc[step.growthPath] = [];
    acc[step.growthPath].push(step);
    return acc;
  }, {});

  return Object.entries(stepsByPath)
    .map(([growthPath, pathSteps]) => {
      const availableSteps = pathSteps.filter(step => !step.draft).sort((a, b) => a.order - b.order);
      const index = progress[growthPath as keyof GrowthPathProgress] ?? 0;
      const nextStep = availableSteps[index];
      return nextStep
        ? mapGrowthPathStep(nextStep, index)
        : null;
    })
    .filter((action): action is UnifiedAction => Boolean(action));
};

const normalizeQolDomain = (value?: string | null) => {
  if (!value) return undefined;
  const normalized = value.toLowerCase().replace(/\s+/g, "_");
  const mapping: Record<string, string> = {
    love: "love_relationships",
    relationships: "love_relationships",
    love_relationships: "love_relationships",
    social: "social_ties",
    social_ties: "social_ties",
  };
  return mapping[normalized] || normalized;
};

const matchesQolFocus = (action: UnifiedAction, lowestDomains?: string[]) => {
  if (!action.qolDomain || !lowestDomains || lowestDomains.length === 0) return false;
  const actionDomain = normalizeQolDomain(action.qolDomain);
  if (!actionDomain) return false;
  return lowestDomains.some(domain => normalizeQolDomain(domain) === actionDomain);
};

const loopPriority: Record<ActionLoop, number> = {
  profile: 0,
  transformation: 1,
  marketplace: 2,
  teams: 3,
  coop: 4,
};

const typePriority: Record<UnifiedAction["type"], number> = {
  quest: 0,
  upgrade: 1,
  practice: 2,
  growth_path_step: 3,
  library_item: 4,
  onboarding: 5,
  celebration: 6,
};

const durationPriority = (duration?: ActionDuration) => {
  if (!duration) return 3;
  return ["xs", "sm", "md", "lg"].indexOf(duration);
};

const buildRationale = (action: UnifiedAction, lowestDomains?: string[]) => {
  if (action.whyRecommended) return action.whyRecommended;
  if (lowestDomains && lowestDomains.length > 0) {
    return `Helps your ${lowestDomains.join(" & ")} focus.`;
  }
  if (action.type === "upgrade") return "Advance your Showing Up path.";
  return "Quick win to keep momentum.";
};

export const buildRecommendationFromLegacy = (inputs: RecommendationInputs): RecommendationSet | null => {
  const { candidates, alternates } = aggregateLegacyActions(inputs);

  if (candidates.length === 0) return null;

  const totalCompleted = inputs.totalCompletedActions ?? 0;
  const quickWinFirst = totalCompleted < 3;
  const isQuickWin = (duration?: ActionDuration) => duration === "xs" || duration === "sm";

  const quickCandidates = quickWinFirst ? candidates.filter(action => isQuickWin(action.duration)) : [];
  const quickAlternates = quickWinFirst ? alternates.filter(action => isQuickWin(action.duration)) : [];

  const activeCandidates = quickCandidates.length > 0 ? quickCandidates : candidates;
  const activeAlternates = quickAlternates.length > 0 ? quickAlternates : alternates;

  const sorted = activeCandidates.sort((a, b) => {
    const aQol = matchesQolFocus(a, inputs.lowestDomains);
    const bQol = matchesQolFocus(b, inputs.lowestDomains);
    if (aQol !== bQol) return aQol ? -1 : 1;

    if (quickWinFirst) {
      const aQuick = isQuickWin(a.duration);
      const bQuick = isQuickWin(b.duration);
      if (aQuick !== bQuick) return aQuick ? -1 : 1;
    }

    const loopDiff = (loopPriority[a.loop] ?? 9) - (loopPriority[b.loop] ?? 9);
    if (loopDiff !== 0) return loopDiff;

    const typeDiff = (typePriority[a.type] ?? 9) - (typePriority[b.type] ?? 9);
    if (typeDiff !== 0) return typeDiff;

    return durationPriority(a.duration) - durationPriority(b.duration);
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

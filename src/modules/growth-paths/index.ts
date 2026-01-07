export type GrowthPathKey = "spirit" | "mind" | "emotions" | "body" | "genius";
export type GrowthPathVersion = "v1";

export type GrowthPathStep = {
  id: string;
  title: string;
  description?: string;
  growthPath: GrowthPathKey;
  order: number;
  durationMinutes?: number;
  xp?: number;
  tags?: string[];
  version: GrowthPathVersion;
  draft?: boolean;
};

export type GrowthPathProgress = Partial<Record<GrowthPathKey, number>>;

export const GROWTH_PATH_VERSION: GrowthPathVersion = "v1";

const growthPathStepsByVersion: Record<GrowthPathVersion, GrowthPathStep[]> = {
  v1: [
    {
      id: "genius-step-1",
      title: "Name your genius edge",
      description: "Write one sentence on what you do better than most people.",
      growthPath: "genius",
      order: 1,
      durationMinutes: 5,
      xp: 25,
      tags: ["clarity"],
      version: "v1",
    },
    {
      id: "spirit-step-1",
      title: "2-minute grounding breath",
      description: "Box-breathe for four rounds to reset your baseline.",
      growthPath: "spirit",
      order: 1,
      durationMinutes: 2,
      xp: 10,
      tags: ["breathwork"],
      version: "v1",
      draft: true,
    },
  ],
};

export const getGrowthPathSteps = (version: GrowthPathVersion = GROWTH_PATH_VERSION) =>
  growthPathStepsByVersion[version] ?? growthPathStepsByVersion[GROWTH_PATH_VERSION];

export const growthPathSteps = getGrowthPathSteps();

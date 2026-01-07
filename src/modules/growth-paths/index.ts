export type GrowthPathKey = "spirit" | "mind" | "emotions" | "body" | "genius";

export type GrowthPathStep = {
  id: string;
  title: string;
  description?: string;
  growthPath: GrowthPathKey;
  order: number;
  durationMinutes?: number;
  xp?: number;
  tags?: string[];
  version: string;
  draft?: boolean;
};

export type GrowthPathProgress = Partial<Record<GrowthPathKey, number>>;

export const growthPathSteps: GrowthPathStep[] = [
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
];

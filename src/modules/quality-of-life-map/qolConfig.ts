export type DomainId =
  | "wealth"
  | "health"
  | "happiness"
  | "love"
  | "impact"
  | "growth"
  | "socialTies"
  | "home";

export type Stage = {
  id: number;        // 1–10
  title: string;     // e.g. "Stage 3"
  description: string;
};

export type Domain = {
  id: DomainId;
  name: string;      // e.g. "Wealth"
  color: string;     // tailwind color key, e.g. "emerald"
  stages: Stage[];
};

const createStages = (domainName: string): Stage[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `Stage ${i + 1}`,
    description: `Placeholder description for Stage ${i + 1} of ${domainName}.`
  }));
};

export const DOMAINS: Domain[] = [
  {
    id: "wealth",
    name: "Wealth",
    color: "emerald",
    stages: createStages("Wealth")
  },
  {
    id: "health",
    name: "Health",
    color: "rose",
    stages: createStages("Health")
  },
  {
    id: "happiness",
    name: "Happiness",
    color: "amber",
    stages: createStages("Happiness")
  },
  {
    id: "love",
    name: "Love",
    color: "pink",
    stages: createStages("Love")
  },
  {
    id: "impact",
    name: "Impact",
    color: "violet",
    stages: createStages("Impact")
  },
  {
    id: "growth",
    name: "Growth",
    color: "blue",
    stages: createStages("Growth")
  },
  {
    id: "socialTies",
    name: "Social Ties",
    color: "cyan",
    stages: createStages("Social Ties")
  },
  {
    id: "home",
    name: "Home",
    color: "orange",
    stages: createStages("Home")
  }
];

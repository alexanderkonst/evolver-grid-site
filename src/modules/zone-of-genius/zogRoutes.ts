export const ZOG_STANDALONE_BASE = "/zone-of-genius/assessment";
export const ZOG_EMBEDDED_BASE = "/game/transformation/genius-assessment";

export const getZogAssessmentBasePath = (pathname: string) =>
  pathname.startsWith(ZOG_EMBEDDED_BASE) ? ZOG_EMBEDDED_BASE : ZOG_STANDALONE_BASE;

export const getZogAssessmentSteps = (basePath: string) => [
  { number: 1, label: "Choose Your Top 10 Talents", path: `${basePath}/step-1` },
  { number: 2, label: "Choose Your Top 3 Core Talents", path: `${basePath}/step-2` },
  { number: 3, label: "Order Your Top 3", path: `${basePath}/step-3` },
  { number: 4, label: "Your Zone of Genius Snapshot", path: `${basePath}/step-4` },
];

export const getZogStepPath = (basePath: string, step: number) => `${basePath}/step-${step}`;


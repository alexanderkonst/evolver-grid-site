interface TitleRule {
  match: (path: string) => boolean;
  title: string;
}

const titleRules: TitleRule[] = [
  { match: (path) => path === "/", title: "Home" },
  { match: (path) => path === "/library" || path.startsWith("/library/"), title: "Library" },
  { match: (path) => path === "/contact", title: "Contact" },
  { match: (path) => path === "/start", title: "Onboarding" },
  { match: (path) => path.startsWith("/zone-of-genius"), title: "Zone of Genius" },
  { match: (path) => path.startsWith("/quality-of-life-map"), title: "Quality of Life" },
  { match: (path) => path === "/game", title: "Game" },
  { match: (path) => path.startsWith("/game/next-move"), title: "Next Move" },
  { match: (path) => path.startsWith("/game/me"), title: "ME" },
  { match: (path) => path.startsWith("/game/profile"), title: "ME" },
  { match: (path) => path.startsWith("/game/transformation"), title: "Transformation" },
  { match: (path) => path.startsWith("/game/marketplace"), title: "Marketplace" },
  { match: (path) => path.startsWith("/game/teams"), title: "Teams" },
  { match: (path) => path.startsWith("/game/matches"), title: "Matches" },
  { match: (path) => path.startsWith("/game/events"), title: "Gatherings" },
  { match: (path) => path.startsWith("/game/coop"), title: "Business Incubator" },
  { match: (path) => path.startsWith("/mission-discovery"), title: "Mission Discovery" },
  { match: (path) => path.startsWith("/asset-mapping"), title: "Asset Mapping" },
  { match: (path) => path.startsWith("/resources/personality-tests"), title: "Personality Tests" },
  { match: (path) => path.startsWith("/resources/zog-intro-video"), title: "ZoG Intro" },
  { match: (path) => path.startsWith("/genius-offer"), title: "Genius Offer" },
  { match: (path) => path.startsWith("/intelligences"), title: "Multiple Intelligences" },
  { match: (path) => path.startsWith("/map"), title: "Game Map" },
];

export const getPageTitle = (pathname: string): string => {
  const match = titleRules.find((entry) => entry.match(pathname));
  return match ? match.title : "Explore";
};

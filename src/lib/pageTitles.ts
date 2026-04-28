interface TitleRule {
  match: (path: string) => boolean;
  title: string;
}

// Day 53 (Sasha 2026-04-27): tab title rules.
// - Empty string = no suffix (tab reads just "Find Your Top Talent").
// - Specific section names take precedence over generic space names so a
//   user with multiple tabs open can tell them apart at a glance.
// - Matches the labels used in the mobile shell breadcrumb so tab,
//   header, and rail all speak the same language.
const titleRules: TitleRule[] = [
  // Root + unknown → no suffix (the old "Home" / "Explore" read as
  // confusing leftover boilerplate in tabs).
  { match: (path) => path === "/", title: "" },

  // Journey space — section-specific so each tab is self-identifying.
  { match: (path) => path === "/playbook" || path.startsWith("/playbook/"), title: "Playbook" },
  { match: (path) => path === "/path" || path.startsWith("/path/"), title: "Path" },
  { match: (path) => path === "/ai-os" || path.startsWith("/ai-os/"), title: "AI OS" },
  { match: (path) => path === "/dashboard", title: "Dashboard" },
  { match: (path) => path === "/ubb" || path.startsWith("/ubb/"), title: "Build a Business" },
  { match: (path) => path.startsWith("/mission-discovery"), title: "Mission Discovery" },
  { match: (path) => path.startsWith("/asset-mapping"), title: "Asset Mapper" },

  // ME space → all collapsed to "Top Talent" (single-focus per Day 47).
  { match: (path) => path.startsWith("/zone-of-genius"), title: "Top Talent" },
  { match: (path) => path === "/game/me" || path.startsWith("/game/me/"), title: "Top Talent" },
  { match: (path) => path.startsWith("/game/profile"), title: "Top Talent" },

  // Other surfaces.
  { match: (path) => path === "/library" || path.startsWith("/library/"), title: "Library" },
  { match: (path) => path === "/contact", title: "Contact" },
  { match: (path) => path === "/start", title: "Onboarding" },
  { match: (path) => path.startsWith("/quality-of-life-map"), title: "Quality of Life" },
  { match: (path) => path.startsWith("/game/transformation"), title: "Transformation" },
  { match: (path) => path.startsWith("/game/marketplace"), title: "Marketplace" },
  { match: (path) => path.startsWith("/game/teams"), title: "Teams" },
  { match: (path) => path.startsWith("/game/matches"), title: "Matches" },
  { match: (path) => path.startsWith("/game/events"), title: "Gatherings" },
  { match: (path) => path.startsWith("/game/coop"), title: "Business Incubator" },
  { match: (path) => path.startsWith("/game/next-move"), title: "Next Move" },
  { match: (path) => path === "/game", title: "Game" },
  { match: (path) => path.startsWith("/resources/personality-tests"), title: "Personality Tests" },
  { match: (path) => path.startsWith("/resources/zog-intro-video"), title: "ZoG Intro" },
  { match: (path) => path.startsWith("/genius-offer"), title: "Genius Offer" },
  { match: (path) => path.startsWith("/intelligences"), title: "Multiple Intelligences" },
  { match: (path) => path.startsWith("/map"), title: "Game Map" },
  { match: (path) => path === "/holomap", title: "Morphogenetic Holo Map" },
  { match: (path) => path === "/founders", title: "The Originals — Founders" },
  { match: (path) => path === "/ignite", title: "Top Talent Business Session" },
];

/**
 * Returns the section/space label to append to the brand in the tab title.
 * Returns "" for root and unknown routes — caller should drop the " | "
 * separator in those cases (see App.tsx).
 */
export const getPageTitle = (pathname: string): string => {
  const match = titleRules.find((entry) => entry.match(pathname));
  return match ? match.title : "";
};

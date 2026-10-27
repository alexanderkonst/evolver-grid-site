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
  { match: (path) => path === "/build/cockpit/dashboard", title: "Founder Cockpit" },
  { match: (path) => path === "/build/cockpit/offers", title: "Offers Board" },
  { match: (path) => path === "/build/cockpit", title: "Founder Cockpit" },
  { match: (path) => path === "/ubb" || path.startsWith("/ubb/"), title: "The Forge" },
  { match: (path) => path === "/game/build" || path.startsWith("/game/build/"), title: "The Forge" },
  // Game vocabulary (Sasha 2026-10-26, issue #129): labels only. Specific
  // /game/learn/* pages come before the generic Training rule.
  { match: (path) => path === "/game/journey" || path.startsWith("/game/journey/"), title: "Main Quest" },
  { match: (path) => path.startsWith("/game/learn/genius-assessment"), title: "Character Creation" },
  { match: (path) => path.startsWith("/game/learn/qol-assessment") || path.startsWith("/game/learn/qol-results"), title: "Save Point / Level" },
  { match: (path) => path.startsWith("/game/learn/today"), title: "Daily Quests" },
  { match: (path) => path.startsWith("/game/learn/paths"), title: "Skill Tree" },
  { match: (path) => path === "/game/learn" || path.startsWith("/game/learn/"), title: "Training" },
  { match: (path) => path === "/built-by-you/commercial-os", title: "Commercial OS" },
  // Day 55 (Sasha 2026-04-29): tab titles aligned with the new nav
  // vocabulary (noun cores of the action+outcome phrases).
  { match: (path) => path.startsWith("/mission-discovery"), title: "Mission" },
  { match: (path) => path.startsWith("/asset-mapping"), title: "Assets" },

  // ME space → all collapsed to "Top Talent" (single-focus per Day 47).
  { match: (path) => path.startsWith("/zone-of-genius"), title: "Top Talent" },
  { match: (path) => path === "/game/me" || path.startsWith("/game/me/"), title: "Character" },
  { match: (path) => path.startsWith("/game/profile"), title: "Character" },

  // Other surfaces.
  { match: (path) => path === "/library" || path.startsWith("/library/"), title: "Library" },
  { match: (path) => path === "/grow/activate-your-dormant-potential", title: "Activate Your Dormant Potential" },
  { match: (path) => path === "/contact", title: "Contact" },
  { match: (path) => path === "/start", title: "Onboarding" },
  { match: (path) => path.startsWith("/quality-of-life-map"), title: "Quality of Life" },
  { match: (path) => path.startsWith("/game/transformation"), title: "Training" },
  { match: (path) => path.startsWith("/game/marketplace"), title: "Trading Post" },
  { match: (path) => path.startsWith("/game/teams"), title: "Party & Guild" },
  { match: (path) => path.startsWith("/game/matches"), title: "Party & Guild" },
  { match: (path) => path.startsWith("/game/collaborate"), title: "Party & Guild" },
  { match: (path) => path.startsWith("/game/events"), title: "Raids" },
  { match: (path) => path.startsWith("/game/meet"), title: "Raids" },
  { match: (path) => path.startsWith("/game/coop"), title: "The Forge" },
  { match: (path) => path.startsWith("/game/next-move"), title: "Next Move" },
  { match: (path) => path === "/game", title: "Game" },
  { match: (path) => path.startsWith("/resources/personality-tests"), title: "Personality Tests" },
  { match: (path) => path.startsWith("/resources/zog-intro-video"), title: "ZoG Intro" },
  { match: (path) => path.startsWith("/genius-offer"), title: "Genius Offer" },
  { match: (path) => path.startsWith("/intelligences"), title: "Multiple Intelligences" },
  { match: (path) => path.startsWith("/map"), title: "Game Map" },
  { match: (path) => path === "/holomap", title: "Morphogenetic Holo Map" },
  { match: (path) => path === "/founders", title: "The Originals — Founders" },
  { match: (path) => path === "/ignite", title: "Productize Yourself Session" },
  { match: (path) => path === "/build/mastermind", title: "Founder-Market Fit Discovery Mastermind" },
  { match: (path) => path === "/quiz", title: "Where Are You" },
  { match: (path) => path === "/quiz2", title: "Top Talent Diagnostic" },
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

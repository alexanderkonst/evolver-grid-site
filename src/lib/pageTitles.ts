import type { TFunction } from "i18next";

interface TitleRule {
  match: (path: string) => boolean;
  /** `pageTitles.<key>` in the catalog; "" for the rule with no suffix. */
  key: string;
  /** English source. Tests read it, and it is the fallback when a catalog lacks the key. */
  title: string;
}

// Day 53 (Sasha 2026-04-27): tab title rules.
// - Empty string = no suffix (tab reads just "Find Your Top Talent").
// - Specific section names take precedence over generic space names so a
//   user with multiple tabs open can tell them apart at a glance.
// - Matches the labels used in the mobile shell breadcrumb so tab,
//   header, and rail all speak the same language.
// - The English stays here as the source; `getPageTitle(path, t)` translates it
//   through `pageTitles.<key>` (issue #255).
const titleRules: TitleRule[] = [
  // Root + unknown → no suffix (the old "Home" / "Explore" read as
  // confusing leftover boilerplate in tabs).
  { match: (path) => path === "/", key: "", title: "" },

  // Journey space — section-specific so each tab is self-identifying.
  { match: (path) => path === "/playbook" || path.startsWith("/playbook/"), key: "playbook", title: "Playbook" },
  { match: (path) => path === "/path" || path.startsWith("/path/"), key: "path", title: "Path" },
  { match: (path) => path === "/ai-os" || path.startsWith("/ai-os/"), key: "aiOs", title: "AI OS" },
  { match: (path) => path === "/dashboard", key: "dashboard", title: "Dashboard" },
  { match: (path) => path === "/build/cockpit/dashboard", key: "founderCockpit", title: "Founder Cockpit" },
  { match: (path) => path === "/build/cockpit/offers", key: "offersBoard", title: "Offers Board" },
  { match: (path) => path === "/build/cockpit", key: "founderCockpit", title: "Founder Cockpit" },
  { match: (path) => path === "/ubb" || path.startsWith("/ubb/"), key: "workshop", title: "Workshop" },
  { match: (path) => path === "/game/build" || path.startsWith("/game/build/"), key: "workshop", title: "Workshop" },
  // Game vocabulary (Sasha 2026-10-26, issue #129): labels only. Specific
  // /game/learn/* pages come before the generic Training rule.
  { match: (path) => path === "/game/journey" || path.startsWith("/game/journey/"), key: "questBoard", title: "Quest Board" },
  { match: (path) => path.startsWith("/game/learn/genius-assessment"), key: "characterCreation", title: "Character Creation" },
  { match: (path) => path.startsWith("/game/learn/qol-assessment") || path.startsWith("/game/learn/qol-results"), key: "savePoint", title: "Save Point / Level" },
  { match: (path) => path.startsWith("/game/learn/today"), key: "dailyQuests", title: "Daily Quests" },
  { match: (path) => path.startsWith("/game/learn/paths"), key: "skillTree", title: "Skill Tree" },
  { match: (path) => path === "/game/learn" || path.startsWith("/game/learn/"), key: "training", title: "Training" },
  { match: (path) => path === "/built-by-you/commercial-os", key: "commercialOs", title: "Commercial OS" },
  // Day 55 (Sasha 2026-04-29): tab titles aligned with the new nav
  // vocabulary (noun cores of the action+outcome phrases).
  { match: (path) => path.startsWith("/mission-discovery"), key: "mission", title: "Mission" },
  { match: (path) => path.startsWith("/asset-mapping"), key: "assets", title: "Assets" },

  // ME space → all collapsed to "Top Talent" (single-focus per Day 47).
  { match: (path) => path.startsWith("/zone-of-genius"), key: "topTalent", title: "Top Talent" },
  { match: (path) => path === "/game/me" || path.startsWith("/game/me/"), key: "home", title: "Home" },
  { match: (path) => path.startsWith("/game/profile"), key: "home", title: "Home" },

  // Other surfaces.
  { match: (path) => path === "/library" || path.startsWith("/library/"), key: "library", title: "Library" },
  { match: (path) => path === "/grow/activate-your-dormant-potential", key: "activateDormantPotential", title: "Activate Your Dormant Potential" },
  { match: (path) => path === "/grow/consciousness-meets-science", key: "consciousnessMeetsScience", title: "Consciousness Meets Science" },
  { match: (path) => path === "/contact", key: "contact", title: "Contact" },
  { match: (path) => path === "/start", key: "onboarding", title: "Onboarding" },
  { match: (path) => path.startsWith("/quality-of-life-map"), key: "qualityOfLife", title: "Quality of Life" },
  { match: (path) => path.startsWith("/game/transformation"), key: "training", title: "Training" },
  { match: (path) => path.startsWith("/game/marketplace"), key: "market", title: "Market" },
  { match: (path) => path.startsWith("/game/teams"), key: "coworking", title: "Co-working" },
  { match: (path) => path.startsWith("/game/matches"), key: "coworking", title: "Co-working" },
  { match: (path) => path.startsWith("/game/collaborate"), key: "coworking", title: "Co-working" },
  { match: (path) => path.startsWith("/game/events"), key: "gatherings", title: "Gatherings" },
  { match: (path) => path.startsWith("/game/meet"), key: "cafe", title: "Café" },
  { match: (path) => path.startsWith("/game/coop"), key: "townHall", title: "Town Hall" },
  // WP-15: the Your AI place (FamiliarPage), named as the village names it.
  { match: (path) => path === "/game/your-ai" || path.startsWith("/game/your-ai/"), key: "yourAi", title: "Your AI" },
  { match: (path) => path.startsWith("/game/next-move"), key: "nextMove", title: "Next Move" },
  { match: (path) => path === "/game", key: "game", title: "Game" },
  { match: (path) => path.startsWith("/resources/personality-tests"), key: "personalityTests", title: "Personality Tests" },
  { match: (path) => path.startsWith("/resources/zog-intro-video"), key: "zogIntro", title: "ZoG Intro" },
  { match: (path) => path.startsWith("/genius-offer"), key: "geniusOffer", title: "Genius Offer" },
  { match: (path) => path.startsWith("/intelligences"), key: "intelligences", title: "Multiple Intelligences" },
  { match: (path) => path === "/village" || path.startsWith("/village/"), key: "digitalVillage", title: "Digital Village" },
  { match: (path) => path === "/holomap", key: "holomap", title: "Morphogenetic Holo Map" },
  { match: (path) => path === "/founders", key: "founders", title: "The Originals — Founders" },
  { match: (path) => path === "/ignite", key: "ignite", title: "Productize Yourself Session" },
  // WP-15: the tab reads the place name, as the village labels it (Mastermind, §14.13).
  { match: (path) => path === "/build/mastermind", key: "mastermind", title: "Mastermind" },
  { match: (path) => path === "/quiz", key: "quiz", title: "Where Are You" },
  { match: (path) => path === "/quiz2", key: "topTalentDiagnostic", title: "Top Talent Diagnostic" },
];

/**
 * Returns the section/space label to append to the brand in the tab title.
 * Returns "" for root and unknown routes — caller should drop the " | "
 * separator in those cases (see App.tsx).
 *
 * Pass `t` to get the label in the reader's language (`pageTitles.<key>`); without
 * it you get the English source.
 */
export const getPageTitle = (pathname: string, t?: TFunction): string => {
  const match = titleRules.find((entry) => entry.match(pathname));
  if (!match) return "";
  if (!t || !match.key) return match.title;
  return String(t(`pageTitles.${match.key}`, { defaultValue: match.title }));
};

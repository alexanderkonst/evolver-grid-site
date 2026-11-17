/**
 * Single source of truth for products: prices, durations, formats, links.
 *
 * Mirror of docs/04-products/product_brief.md §0 (v1, Sasha's edits of 2026-11-17); the brief wins on conflict.
 * Read by /products (cards and the Map view), the product landings and the home ladder.
 * Change a value here, never in a page or a locale file.
 *
 * Fallbacks: a price the brief marks "?" / "price not assigned" is `null` and reads "On request";
 * a duration marked "?" is left out. A row with no landing in the brief has no `landing`.
 * `hidden` rows are never rendered (Spiritual Practice with Cannabis: not public).
 * `version` is Hark's draft estimate (scale in the brief); it is kept for the team and not shown to visitors.
 */

export type ProductGroupId = "client-path" | "other" | "rd";
export type ProductFamilyId = "top-talent" | "fmf";

export interface ProductFamily {
  id: ProductFamilyId;
  name: string;
  /** What the family does, in a phrase. */
  function?: string;
}

export interface ProductOffer {
  /** "1:1", "group", "online": reads after the price. */
  label?: string;
  /** Display price; `null` = not assigned, reads "On request". */
  price: string | null;
  amountUsd?: number;
  duration?: string;
  format?: string;
  note?: string;
  /** Machine-readable numbers, for landing copy in any language that states a length. */
  facts?: ProductFacts;
}

export interface ProductFacts {
  /** Number of sessions or calls (per week for BUILD). */
  sessions?: number;
  /** Minutes per session. */
  minutes?: number;
  weeks?: number;
  months?: number;
  /** Hours, as written ("2", "2–2.5"). */
  hours?: string;
}

export interface ProductLanding {
  href: string;
  /** External links open in a new tab; internal ones are relative routes. */
  external: boolean;
}

export interface ProductRow {
  /** Stable key. Never rename: pages and tests read it. */
  id: string;
  group: ProductGroupId;
  /** Position on the value ladder (client path only). */
  step?: string;
  /** Level-1 module the product belongs to; the sub-product is the row itself. */
  family?: ProductFamilyId;
  /** Module (function). */
  module: string;
  name: string;
  /** For whom, in the client's own voice. */
  forWhom?: string;
  shift?: string;
  offers: ProductOffer[];
  /** Joins offers in one line; default " · ". */
  offerSeparator?: string;
  version: string;
  landing?: ProductLanding;
  hidden?: boolean;
}

export const PRODUCT_GROUPS: { id: ProductGroupId; title: string }[] = [
  { id: "client-path", title: "Client path" },
  { id: "other", title: "Other offers" },
  { id: "rd", title: "R&D" },
];

export const PRODUCT_FAMILIES: Record<ProductFamilyId, ProductFamily> = {
  "top-talent": { id: "top-talent", name: "Top Talent" },
  fmf: {
    id: "fmf",
    name: "Founder-Market Fit",
    function: "Formulating value: a person's unique values in one sentence",
  },
};

const internal = (href: string): ProductLanding => ({ href, external: false });
const external = (href: string): ProductLanding => ({ href, external: true });

export const PRODUCTS: ProductRow[] = [
  // ── §0.1 Client path ──
  {
    id: "quiz",
    group: "client-path",
    step: "0",
    module: "Diagnosing the stage of the path",
    name: "Where Am I on the Hero's Journey",
    forWhom: "I'm in a transition and I don't understand where I am or what's next",
    shift: "Sees their stage, its obstacles and what leads to the next",
    offers: [{ price: "Free", duration: "~2 min, 3 questions", format: "online quiz" }],
    version: "1.0",
    landing: internal("/quiz"),
  },
  {
    id: "direction-call",
    group: "client-path",
    step: "0",
    module: "Choosing a direction (after the quiz, by profile)",
    name: "Professional Direction Call",
    forWhom: "I feel I'm meant to go somewhere, but I can't see where",
    shift: "Sees what they grow out of, what they grow into, and the direction",
    offers: [{ price: "Free", amountUsd: 0, duration: "45 min", format: "1:1 online", facts: { minutes: 45 } }],
    version: "1.2",
    landing: external("https://cal.com/aleksandrkonstantinov/direction-choice-call"),
  },
  {
    id: "top-talent-free",
    group: "client-path",
    step: "1a",
    family: "top-talent",
    module: "Finding your top talent",
    name: "Top Talent (free)",
    forWhom: "I want to finally name what my gift is",
    shift: "Talent named in exact words",
    offers: [{ price: "Free", format: "online on the platform" }],
    version: "0.9",
    landing: internal("/"),
  },
  {
    id: "top-talent-course",
    group: "client-path",
    step: "1b",
    family: "top-talent",
    module: "Top Talent course (in the Academy of Human Development)",
    name: "Deep Top Talent Reveal",
    forWhom: "I found my talent, now I want to know what to do with it",
    shift: "Goes through their own reading step by step and knows how to show the talent",
    offers: [{ price: "$37", format: "online course" }],
    version: "0.5",
    landing: external("https://ancient-william-0f8.notion.site/THE-ZONE-OF-GENIUS-PROGRAM-10981c75c23680cdb971df7314d07eda"),
  },
  {
    id: "zog-session",
    group: "client-path",
    step: "1c",
    family: "top-talent",
    module: "Zone of Genius 1:1 (pure uniqueness)",
    name: "Zone of Genius Session",
    forWhom: "I want a master to see and name my uniqueness, in person",
    shift: "Uniqueness named and lived in conversation",
    offers: [{ price: "$333", format: "1:1 online" }],
    version: "1.2",
    landing: external("https://nas.com/founder-academy/sessions/zone-of-genius-live-session"),
  },
  {
    id: "zog-teams",
    group: "client-path",
    step: "1d",
    family: "top-talent",
    module: "Zone of Genius for teams",
    name: "Zone of Genius for Teams",
    forWhom: "I want my team to see each other's gifts",
    shift: "Everyone on the team named, roles by gift",
    offers: [{ price: "$1,000", format: "workshop" }],
    version: "1.0",
  },
  {
    id: "fmf-session",
    group: "client-path",
    step: "2a",
    family: "fmf",
    module: "Formulating value",
    name: "FMF Private Session",
    forWhom: "I have a lot going on, but I can't say in one sentence what I give and to whom",
    shift: "Value, ideal client, pain, promise, product outline and USP in one sentence",
    offers: [{ price: "$555", amountUsd: 555, duration: "2 hours", format: "1:1 online workshop", facts: { hours: "2" } }],
    version: "1.5",
    landing: internal("/ignite"),
  },
  {
    id: "fmf-mastermind",
    group: "client-path",
    step: "2b",
    family: "fmf",
    module: "Formulating value",
    name: "FMF Mastermind",
    forWhom: "The same, in a group",
    shift: "The same",
    offers: [{ price: "$222", amountUsd: 222, format: "small group" }],
    version: "1.0",
    landing: internal("/build/mastermind"),
  },
  {
    id: "pmf-discovery",
    group: "client-path",
    step: "3",
    module: "Finding product-market fit for a technology (its own module, not FMF)",
    name: "Product-Market Fit Discovery",
    forWhom: "I have a technology, but I don't know who needs it",
    shift: "Who it's for, what changes, why they'll want it, one sentence",
    offers: [{ price: null, duration: "2–2.5 hours", format: "1:1 online", facts: { hours: "2–2.5" } }],
    version: "1.0",
    landing: internal("/products/pmf-core"),
  },
  {
    id: "build",
    group: "client-path",
    step: "4",
    module: "Building, packaging and launching a product to the first sale",
    name: "BUILD container",
    forWhom: "I know who I am and what I give. I want it to become a product people buy",
    shift: "Direction → offer → first clients → strategy → MVP → beta → first sale",
    offers: [
      {
        label: "group",
        price: "$1,111",
        amountUsd: 1111,
        duration: "4 weeks",
        format:
          "2 calls of 90 min a week (Mon: opportunities, frameworks, codes; Thu: mindset clearing, group Q&A) + chat",
        facts: { sessions: 2, minutes: 90, weeks: 4 },
      },
      { label: "1:1", price: "$5,555", amountUsd: 5555 },
    ],
    version: "0.8",
    landing: internal("/products/built"),
  },
  {
    id: "crossing",
    group: "client-path",
    step: "5",
    module: "Accompanying a transition, mentoring",
    name: "The Crossing",
    forWhom: "I'm in a career transition: the old is gone, the new isn't born yet",
    shift: "Their own brand (a unique business) in months, not years",
    offers: [
      {
        label: "1:1",
        price: "$2,222",
        amountUsd: 2222,
        duration: "2 months",
        format: "8 sessions of 75 min + a 2-hour workshop + chat",
        facts: { sessions: 8, minutes: 75, months: 2 },
      },
      { label: "group (from 5 people), per person", price: "$444", amountUsd: 444 },
    ],
    version: "1.2",
    landing: internal("/products/crossing"),
  },
  {
    id: "vector",
    group: "client-path",
    step: "5b",
    module: "Landing depth in life and business",
    name: "The Vector",
    forWhom: "I've already opened depth, but it doesn't work in my life and work yet",
    shift: "A shift on 3–5 parameters the client names, scale 0–10, three measurements",
    offers: [
      {
        label: "1:1, in Russian",
        price: "$3,750",
        amountUsd: 3750,
        duration: "~4 months",
        format: "15 sessions of 90 min, weekly by default, rhythm set to the client + chat",
        facts: { sessions: 15, minutes: 90, months: 4 },
      },
    ],
    version: "0.8",
    landing: internal("/products/vector"),
  },
  {
    id: "collective",
    group: "client-path",
    step: "6",
    module: "Building unique businesses together",
    name: "Sovereign Founder Collective (= Venture Studio)",
    forWhom: "I've built my own thing and I want to build together with equals",
    shift: "They build together and self-organize",
    offers: [{ price: "10% of revenue to the common treasury", duration: "open-ended", format: "artel" }],
    version: "0.3",
  },
  {
    id: "for-clients",
    group: "client-path",
    step: "7",
    module: "Running the path for other people's clients",
    name: "I run it for your clients",
    forWhom: "My clients hit the question of uniqueness, and that's not my thing",
    shift: "The whole path for their clients: Sasha does the work, the partner stays with their clients",
    offers: [{ price: "Rev share 50/50" }],
    version: "0.5",
  },
  {
    id: "license",
    group: "client-path",
    step: "8",
    module: "Passing on the method",
    name: "License",
    forWhom: "I want to run this program myself",
    shift: "Runs the program themselves",
    offers: [{ price: "10% to Sasha; part of it goes to the Collective" }],
    version: "0.2",
  },

  // ── §0.2 Other offers ──
  {
    id: "profile",
    group: "other",
    module: "Self-description",
    name: "High-Precision Business Profile",
    forWhom: "I want AI, partners and opportunities to understand me precisely",
    shift: "A precise profile for AI, opportunities and co-founders",
    offers: [{ price: "Free", duration: "5–10 min", format: "online" }],
    version: "0.8",
    landing: internal("/"),
  },
  {
    id: "matchmaking",
    group: "other",
    module: "Matching complementary people",
    name: "Matchmaking",
    forWhom: "I'm looking for my people: those who complement me",
    shift: "Meets a fitting co-founder",
    offers: [{ price: "Free (test)", format: "platform" }],
    version: "0.6",
    landing: internal("/game/collaborate/matches"),
  },
  {
    id: "white-label",
    group: "other",
    module: "Revealing a community's talents",
    name: "White-label onboarding",
    forWhom: "I want everyone in my community to open up and find their people",
    shift: "Every member revealed, with a profile and matching inside the community",
    offers: [{ price: "By arrangement" }],
    version: "0.5",
    landing: internal("/proposalforwegoodovahere"),
  },
  {
    id: "ai-training",
    group: "other",
    module: "Understanding AI",
    name: "Deep AI training",
    forWhom: "AI is changing everything and I don't understand how",
    shift: "Understanding of AI for years ahead",
    offers: [{ price: "$800", amountUsd: 800, duration: "2 hours", format: "workshop" }],
    version: "1.0",
  },
  {
    id: "equilibrium",
    group: "other",
    module: "Living by natural cycles",
    name: "Equilibrium",
    forWhom: "I want to live and work in rhythm, not against it",
    shift: "Planning by cycles plus a simple task manager",
    offers: [{ price: "Free (test)", format: "web app" }],
    version: "0.8",
    landing: internal("/build/equilibrium"),
  },
  {
    id: "mystery-school",
    group: "other",
    module: "The whole line as a group",
    name: "Mystery School for Founders",
    forWhom: "I want to walk the path with a group",
    shift: "Most of the products in one combo",
    offers: [{ price: "$111–222", duration: "1 month", format: "cohort" }],
    version: "1.0",
    landing: external("https://nas.com/founder-academy/products/pugb/view"),
  },
  {
    id: "cockpit",
    group: "other",
    module: "Navigating the venture and the founder",
    name: "Founder Cockpit",
    forWhom: "I want to see myself and my business as one whole",
    shift: "Business and person visible as one system",
    offers: [{ price: "Free (test)", format: "web app" }],
    version: "0.6",
    landing: internal("/build/cockpit"),
  },
  {
    id: "your-ai",
    group: "other",
    module: "Function to be defined",
    name: "Your AI",
    offers: [{ price: "Free up to a limit; packages TBD" }],
    version: "0.4",
    landing: internal("/game/your-ai"),
  },
  {
    id: "cannabis",
    group: "other",
    hidden: true,
    module: "Expanding consciousness",
    name: "Spiritual Practice with Cannabis",
    shift: "Quality of life, vitality, mystical experience",
    offers: [{ price: "~$100 per seat", format: "group" }],
    version: "1.0",
  },

  // ── §0.3 R&D ──
  {
    id: "evolution-portal",
    group: "rd",
    module: "Visible evolution of clients",
    name: "Client Evolution Portal",
    forWhom: "I want my clients to see how they grow",
    shift: "Clients see their lines move",
    offers: [
      { label: "launch", price: "$555", amountUsd: 555 },
      { price: "$55/month", amountUsd: 55, note: "free until the 5th subscriber" },
    ],
    offerSeparator: " + ",
    version: "0.3",
    landing: internal("/products/evolution-portal"),
  },
  {
    id: "founder-read",
    group: "rd",
    module: "Measuring a founder's FMF",
    name: "The Founder Read",
    forWhom: "I want to understand a founder before I write the check",
    shift: "FMF and the hero's-journey chapter read before the check",
    offers: [{ price: null, format: "tool" }],
    version: "0.3",
    landing: internal("/products/founder-read"),
  },
];

// ── Readers ──

const BY_ID = new Map(PRODUCTS.map(row => [row.id, row]));

export const getProduct = (id: string): ProductRow => {
  const row = BY_ID.get(id);
  if (!row) throw new Error(`productMap: unknown product id "${id}"`);
  return row;
};

/** Rows that may be rendered. */
export const visibleProducts = (group?: ProductGroupId): ProductRow[] =>
  PRODUCTS.filter(row => !row.hidden && (!group || row.group === group));

/** The offer a landing quotes: the one with `label`, or the first. */
export const getOffer = (id: string, label?: string): ProductOffer => {
  const { offers } = getProduct(id);
  const offer = label ? offers.find(o => o.label === label) : offers[0];
  if (!offer) throw new Error(`productMap: "${id}" has no offer "${label}"`);
  return offer;
};

const ON_REQUEST = "On request";

export const offerPrice = (offer: ProductOffer): string => offer.price ?? ON_REQUEST;

/** "$1,111 group": the price with its label. */
export const offerHeadline = (offer: ProductOffer): string =>
  [offerPrice(offer), offer.label].filter(Boolean).join(" ");

/** Price, duration and format of one offer, as one line. */
export const offerLine = (offer: ProductOffer): string =>
  [offerHeadline(offer), offer.duration, offer.format, offer.note && `(${offer.note})`]
    .filter(Boolean)
    .join(" · ");

/** The price line of a product across its offers: "$1,111 group · $5,555 1:1". */
export const priceLine = (row: ProductRow): string =>
  row.offers.map(offerHeadline).join(row.offerSeparator ?? " · ");

/** Price · duration · format for every offer of a row. */
export const termsLines = (row: ProductRow): string[] => {
  if (row.offerSeparator) {
    return [
      row.offers
        .map(o => [offerHeadline(o), o.note && `(${o.note})`].filter(Boolean).join(" "))
        .join(row.offerSeparator),
    ];
  }
  return row.offers.map(offerLine);
};

/** Short terms for a card: price, what it is (label, else format), duration. One line per offer. */
export const summaryLines = (row: ProductRow): string[] => {
  if (row.offerSeparator) {
    return [row.offers.map(o => [offerHeadline(o), o.note && `(${o.note})`].filter(Boolean).join(" ")).join(row.offerSeparator)];
  }
  return row.offers.map(o =>
    [[offerPrice(o), o.label ?? o.format].filter(Boolean).join(o.price === null ? " · " : " "), o.duration]
      .filter(Boolean)
      .join(" · "),
  );
};

/** Price of `id` for landing copy: "$2,222". */
export const productPrice = (id: string, label?: string): string => offerPrice(getOffer(id, label));

/** Duration of `id` for landing copy: "2 months". */
export const productDuration = (id: string, label?: string): string | undefined => getOffer(id, label).duration;

/**
 * Interpolation values for a landing's i18n strings: `t("crossing.priceLine", productVars("crossing"))`
 * fills {{price}}, {{amount}}, {{sessions}}, {{minutes}}, {{weeks}}, {{months}}, {{hours}}.
 */
export const productVars = (id: string, label?: string): Record<string, string | number> => {
  const offer = getOffer(id, label);
  const vars: Record<string, string | number> = { price: offerPrice(offer), ...offer.facts };
  if (offer.amountUsd !== undefined) vars.amount = offer.amountUsd;
  return vars;
};

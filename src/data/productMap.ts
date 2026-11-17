/**
 * Mirror of docs/04-products/product_brief.md §0; the brief wins on conflict.
 *
 * Source: §0.1 (client path), §0.2 (other offers), §0.3 (R&D), commit 1524f2f, in English.
 * Left out on purpose: Spiritual Practice with Cannabis (not public), notes §0.4–0.6.
 * Fallbacks: a price marked "?" / "уточнить" / "цена не назначена" reads "On request";
 * a duration marked "?" is omitted.
 */

export interface ProductMapLink {
  label: string;
  href: string;
  /** External links open in a new tab; internal ones are relative routes. */
  external: boolean;
}

/** One price · duration · format line, as the brief writes it. */
export interface ProductMapTerms {
  price: string;
  duration?: string;
  format?: string;
}

export interface ProductMapRow {
  id: string;
  /** Step number on the value ladder (client path only). */
  step?: string;
  /** Module (function). */
  module: string;
  product: string;
  audience: string;
  shift: string;
  terms: ProductMapTerms[];
  /** Empty when the brief gives the product no page. */
  links: ProductMapLink[];
}

export interface ProductMapGroup {
  id: "client-path" | "other-offers" | "rd";
  title: string;
  rows: ProductMapRow[];
}

const internal = (label: string, href: string): ProductMapLink => ({ label, href, external: false });
const external = (label: string, href: string): ProductMapLink => ({ label, href, external: true });

export const PRODUCT_MAP: ProductMapGroup[] = [
  {
    id: "client-path",
    title: "Client path",
    rows: [
      {
        id: "quiz",
        step: "0",
        module: "Diagnosing the stage of the path",
        product: "Quiz “Where Am I on the Hero's Journey”",
        audience: "A person in transition who can't see where they are",
        shift: "Sees their stage, its obstacles and what leads to the next",
        terms: [{ price: "Free", duration: "~2 min, 3 questions", format: "online quiz" }],
        links: [internal("Quiz", "/quiz")],
      },
      {
        id: "direction-call",
        step: "0",
        module: "Discerning the direction",
        product: "Direction Call",
        audience: "Someone who took the quiz and fits the profile",
        shift: "Sees what they grow out of, what they grow into, and the direction",
        terms: [{ price: "Free", duration: "45 min", format: "1:1 online" }],
        links: [external("Book a call", "https://cal.com/aleksandrkonstantinov/direction-choice-call")],
      },
      {
        id: "zog",
        step: "1",
        module: "Recognizing the innate talent",
        product: "Zone of Genius",
        audience: "Anyone who wants to name their gift",
        shift: "The talent named in precise words, plus clarity on how to monetize it",
        terms: [{ price: "$37 online · $222–333 1:1 · $1,000 team workshop" }],
        links: [
          external("Notion program", "https://ancient-william-0f8.notion.site/THE-ZONE-OF-GENIUS-PROGRAM-10981c75c23680cdb971df7314d07eda"),
          external("nas.com live session", "https://nas.com/founder-academy/sessions/zone-of-genius-live-session"),
        ],
      },
      {
        id: "fmf",
        step: "2",
        module: "Crystallizing the unique value into one offer",
        product: "Founder-Market Fit (Private Session / Mastermind)",
        audience: "An entrepreneur who works with entrepreneurs",
        shift: "Value, ideal client, pain, promise, product outline and USP in one sentence",
        terms: [
          { price: "$555", duration: "2 hours", format: "1:1 online" },
          { price: "$222", duration: "2 sessions", format: "small group" },
        ],
        links: [internal("Private session", "/ignite"), internal("Mastermind", "/build/mastermind")],
      },
      {
        id: "pmf-core",
        step: "2b",
        module: "Finding the PMF core for a technology",
        product: "Product-Market Fit Core",
        audience: "A founder with a technology but no market",
        shift: "For whom, what changes, why they will want it, one phrase",
        terms: [{ price: "On request", duration: "~2 hours", format: "1:1 online" }],
        links: [internal("Product-Market Fit Core", "/products/pmf-core")],
      },
      {
        id: "pmf",
        step: "3",
        module: "Building the product up to the first sale",
        product: "Product-Market Fit",
        audience: "Someone who has FMF",
        shift: "Sales strategy, MVP, beta test, first sale",
        terms: [{ price: "$5,555 1:1 · $1,111 group · or $5,555 from the first $55,555", duration: "1 month" }],
        links: [],
      },
      {
        id: "built",
        step: "3b",
        module: "Packaging and launching the offer",
        product: "BUILT",
        audience: "Someone who has FMF",
        shift: "Direction → packaged offer → first clients",
        terms: [{ price: "$1,111", duration: "3 weeks", format: "weekly 2 hours + chat" }],
        links: [internal("BUILT", "/products/built")],
      },
      {
        id: "crossing",
        step: "4",
        module: "Accompanying the transition",
        product: "Entrepreneur's Evolution / The Crossing",
        audience: "An entrepreneur in a career transition",
        shift: "Their own brand (a unique business) in months, not years",
        terms: [{ price: "$2,222", duration: "2 months", format: "8 sessions + a 2-hour workshop + chat" }],
        links: [internal("The Crossing", "/products/crossing")],
      },
      {
        id: "vector",
        step: "4b",
        module: "Landing the depth in life and business",
        product: "The Vector",
        audience: "Someone who has already opened the depth and wants it to work",
        shift: "A shift on 3–5 parameters they name themselves, on a 0–10 scale",
        terms: [{ price: "$3,750", duration: "~7 months, 15 sessions of 90 min every 2 weeks + chat", format: "1:1, in Russian" }],
        links: [internal("The Vector", "/products/vector")],
      },
      {
        id: "collective",
        step: "5",
        module: "Building unique businesses together",
        product: "Sovereign Founder Collective",
        audience: "Those who have reached their business",
        shift: "They build together, self-organize",
        terms: [{ price: "10% of revenue to the common treasury", duration: "open-ended", format: "artel" }],
        links: [],
      },
      {
        id: "for-your-clients",
        step: "6",
        module: "Running the path for other people's clients",
        product: "I run it for your clients",
        audience: "Someone who works with entrepreneurs",
        shift: "The whole path for their clients",
        terms: [{ price: "Rev share 50/50" }],
        links: [],
      },
      {
        id: "license",
        step: "7",
        module: "Handing over the method",
        product: "License",
        audience: "Someone who wants to lead the program themselves",
        shift: "Leads the program themselves",
        terms: [{ price: "Rev share 90/10 in the Collective" }],
        links: [],
      },
    ],
  },
  {
    id: "other-offers",
    title: "Other offers",
    rows: [
      {
        id: "profile",
        module: "Self-description",
        product: "High-Precision Business Profile",
        audience: "Any entrepreneur",
        shift: "A precise profile for AI, opportunities, co-founders",
        terms: [{ price: "Free", duration: "5–10 min", format: "online" }],
        links: [internal("Business Profile", "/")],
      },
      {
        id: "matchmaking",
        module: "Bringing complementary people together",
        product: "Matchmaking",
        audience: "Founders of unique businesses",
        shift: "Meets a fitting co-founder",
        terms: [{ price: "Free (test)", format: "platform" }],
        links: [internal("Matchmaking", "/game/collaborate/matches")],
      },
      {
        id: "white-label",
        module: "Revealing the talents of a community",
        product: "White-label onboarding",
        audience: "Community leaders",
        shift: "Every member revealed, with a profile and matching inside",
        terms: [{ price: "By arrangement" }],
        links: [internal("White-label onboarding", "/proposalforwegoodovahere")],
      },
      {
        id: "ai-training",
        module: "Understanding AI",
        product: "Deep AI training",
        audience: "People and organizations",
        shift: "An understanding of AI for years ahead",
        terms: [{ price: "$800", duration: "2 hours", format: "workshop" }],
        links: [],
      },
      {
        id: "equilibrium",
        module: "Living by natural cycles",
        product: "Equilibrium",
        audience: "Founder",
        shift: "Planning by cycles + a simple task manager",
        terms: [{ price: "Free (test)", format: "web app" }],
        links: [internal("Equilibrium", "/build/equilibrium")],
      },
      {
        id: "mystery-school",
        module: "The whole line as a group",
        product: "Mystery School for Founders",
        audience: "A group of founders",
        shift: "Most of the products in one combo",
        terms: [{ price: "$111–222", duration: "1 month", format: "cohort" }],
        links: [external("Mystery School", "https://nas.com/founder-academy/products/pugb/view")],
      },
      {
        id: "cockpit",
        module: "Navigating the venture and the founder",
        product: "Founder Cockpit",
        audience: "A founder with their own venture",
        shift: "The venture and the person seen as one system",
        terms: [{ price: "Free (test)", format: "web app" }],
        links: [internal("Founder Cockpit", "/build/cockpit")],
      },
      {
        id: "your-ai",
        module: "Deep readings by AI",
        product: "Your AI",
        audience: "A platform user",
        shift: "Deep readings on a strong model",
        terms: [{ price: "Free up to a limit; packages TBD" }],
        links: [internal("Your AI", "/game/your-ai")],
      },
    ],
  },
  {
    id: "rd",
    title: "R&D",
    rows: [
      {
        id: "evolution-portal",
        module: "Visible evolution of clients",
        product: "Client Evolution Portal",
        audience: "Practitioners (coaches, therapists)",
        shift: "Clients see how their lines move",
        terms: [{ price: "$555 launch + $55/month (free until the 5th subscriber)" }],
        links: [internal("Client Evolution Portal", "/products/evolution-portal")],
      },
      {
        id: "founder-read",
        module: "Measuring a founder's FMF",
        product: "The Founder Read",
        audience: "Investors",
        shift: "FMF and the hero's-journey chapter read before the check",
        terms: [{ price: "On request", format: "tool" }],
        links: [internal("The Founder Read", "/products/founder-read")],
      },
      {
        id: "venture-studio",
        module: "A business from uniqueness",
        product: "Venture Studio",
        audience: "Founders",
        shift: "A company grown from who you are",
        terms: [{ price: "By invitation" }],
        links: [],
      },
    ],
  },
];

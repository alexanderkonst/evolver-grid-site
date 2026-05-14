/**
 * Playbook steps — single source of truth for the seven-step journey.
 *
 * Used by:
 *  - Landing page (`MethodologyLandingPage`) — name + 7-step infographic + CTA
 *  - Playbook pages (`PlaybookPage`) — top step nav, step card, substep disclosures
 *
 * Structure (v2 — 2026-04-16):
 *  Step → 3 Substeps (1, 2, 3)
 *    Each substep has:
 *      - name:              short handle (2–4 words)
 *      - description:       1 line, always visible once the step's "See how" is open
 *      - oneProvenStrategy: short paragraph (mostly one line) revealed when the
 *                           substep's "See one proven strategy" button is clicked
 *
 * Disclosure hierarchy (matches Sasha's sketch):
 *   Step (default: collapsed)
 *     └─ [ See how ▼ ]                     ← step-level trigger
 *          └─ Substeps 1, 2, 3             (name + description always visible)
 *                └─ [ See one proven       ← substep-level button + triangle
 *                     strategy ▶ ]
 *                     └─ ONE PROVEN STRATEGY
 *                          {short paragraph}
 *
 * Step names (subtitles) and transformational-result labels are psychoactive,
 * canonical, and VERBATIM from Sasha — never paraphrase, never drift.
 */

export type Substep = {
  /** 1, 2, 3 within a step */
  number: 1 | 2 | 3;
  /** Short title for this substep — 2–4 words, human voice */
  name: string;
  /** One-line description. Always visible when the step's "See how" is open. */
  description: string;
  /**
   * The ONE PROVEN STRATEGY — short paragraph (mostly one line).
   * Hidden until the substep's "See one proven strategy" button is clicked.
   */
  oneProvenStrategy: string;
};

export type PlaybookStep = {
  /** 1–7 */
  number: number;
  /** Short slug for route (e.g., "discover") */
  slug: string;
  /** UPPERCASE name — short handle for the nav bar (DISCOVER, PACKAGE, …) */
  appName: string;
  /** Full step title — VERBATIM from Sasha. Never paraphrase. */
  subtitle: string;
  /**
   * Transformational result, in the user's own voice.
   * What they say to themselves after completing the step.
   * Must be a full, self-contained sentence — works as a button label too.
   */
  transformationalResult: string;
  /** HSL color for visual accent */
  neonHsl: string;
  /** RGB triplet for box-shadow / rgba() use */
  neonRgb: string;
  /** The 3 substeps */
  substeps: [Substep, Substep, Substep];
  /**
   * Public price label (e.g., "Free", "$49", "$297"). The infographic
   * popover renders this in the header; when undefined we show
   * "Pricing coming soon" as the placeholder. Sasha fills these in as
   * the store copy stabilises.
   */
  price?: string;
  /**
   * Short bullets for the "What's included" list in the popover.
   * Keep each item one line, concrete and outcome-facing.
   * Sasha fills these in.
   */
  included?: string[];
  /**
   * Stripe Price ID for this step (e.g., "price_1ABCxyz"). When set, the
   * "Guidance to accelerate the process" CTA launches a one-time Stripe
   * Checkout Session. When undefined, the CTA shows a friendly
   * "Pricing coming soon" toast. Sasha fills in per-step as Stripe
   * products are created. Step 1 is free and stays undefined.
   */
  priceId?: string;
  /**
   * Multi-line label for the holonic circle infographic. Each element
   * becomes one line rendered with a <tspan>. Kept short (≤ 3 words per
   * line) so the ring's label ring stays readable at 640px wide.
   * If undefined, `appName` is used as a single-line fallback.
   */
  labelLines?: string[];
  /**
   * Primary CTA label for the popover and the step card's main button.
   * One sentence in the user's outcome voice — the thing they walk away
   * with ("Sharpen Your Top Talent to 9+/10 in 60 mins").
   * Falls back to generic "Open this step" / "Guidance to accelerate
   * the process" when undefined.
   */
  ctaText?: string;
  /**
   * Other step numbers this step is commercially bundled with.
   * Steps = methodology (psychological stages); containers = commercial
   * packaging. Bundles express one container covering multiple steps:
   *   - Ignition  = Steps 2 + 3 (one $555 purchase)
   *   - Build     = Steps 4 + 5 (one $1,111 + rev share purchase)
   * When set, the popover shows "Bundled with Step N" and a single
   * payment unlocks all partner steps.
   */
  bundleWith?: number[];
};

/**
 * PLACEHOLDER COPY — Sasha will replace substep names, descriptions, and
 * one-proven-strategy paragraphs with his own text. Step names (subtitles)
 * and transformational results are CANONICAL as of 2026-04-16 (Day 41).
 */
// Color spectrum (Sasha, 2026-04-21): UV → IR — violet through the rainbow
// to red-orange. Each step's neonHsl is a single hue stop on the arc.
// Step 1 violet · Step 2 indigo · Step 3 blue · Step 4 cyan · Step 5 green
// · Step 6 gold · Step 7 red-orange. High saturation + mid-lightness so each
// reads as neon, not pastel.
export const PLAYBOOK_STEPS: PlaybookStep[] = [
  {
    number: 1,
    slug: "discover",
    appName: "DISCOVER",
    subtitle: "Name Your Top Talent",
    transformationalResult: "I can name my top talent out loud.",
    neonHsl: "hsl(280, 85%, 68%)",
    neonRgb: "180, 95, 240",
    labelLines: ["Name Your", "Top Talent"],
    price: "Free",
    ctaText: "Find Your Top Talent",
    included: [
      "Your top talent distilled into one sentence in a couple of minutes",
    ],
    substeps: [
      {
        number: 1,
        name: "Ask your AI about your top talent",
        description: "",
        oneProvenStrategy:
          "Use this prompt: \u201CBased on all you know about me, what\u2019s my zone of genius?\u201D Or do the top talent reveal on this page. That gets you to a high enough specificity to then leverage and monetize your unique talent.",
      },
      {
        number: 2,
        name: "Distill it into one sentence — and actually write it down",
        description: "",
        oneProvenStrategy:
          "Ask your AI to do this for you, and then polish it yourself. You can use [this iterative improvement prompt](/ai-os/iteration).",
      },
      {
        number: 3,
        name: "Iterate whenever new clarity emerges",
        description: "",
        oneProvenStrategy:
          "Keep it in an accessible place, update it, and call each version v1.1, v2, and so on.",
      },
    ],
  },
  {
    number: 2,
    slug: "package",
    appName: "PACKAGE",
    subtitle: "Articulate it with Precision",
    transformationalResult:
      "I can describe my top talent in a crystal clear one sentence that lands visceral and emotive.",
    neonHsl: "hsl(248, 85%, 68%)",
    neonRgb: "110, 100, 240",
    labelLines: ["Articulate it", "with Precision"],
    price: "$555",
    bundleWith: [3],
    ctaText: "Sharpen Your Top Talent to 9+/10 in 60 mins",
    included: [
      "One-sentence top talent that lights you up and that you have had all your life",
      "Your top talent sharpened to 9/10 or higher — in 60 minutes",
    ],
    substeps: [
      {
        number: 1,
        name: "Iterate until you reach 9/10 resonance or higher",
        description:
          "Iterate on your current articulation until it reaches 9/10 of resonance or higher.",
        oneProvenStrategy:
          "Work with a guide who has reached 9.9+ resonance for themselves, or use a high-precision purpose-discovery tool.",
      },
      {
        number: 2,
        name: "Reach at least 9/10 resonance",
        description:
          "Reach at least 9/10 resonance — the threshold precise enough to later reveal your unique product.",
        oneProvenStrategy:
          "TL;DR: the process we have designed is the recommended option to get this result. Other methods will be suboptimal workarounds. If you did our top-talent reveal you are likely at 6-8 out of 10 resonance. None of the personality tests I or AI know will get you any further than that. I am aware of only three sufficiently precise tools, and even those (1) give you a report — not a single distilled sentence you can iterate on; (2) hence require AI-assisted iterative synthesis (these clarity prompts will help); and (3) still call for a guide, and as of April 2026 I haven't met anyone I can recommend, because the signal-to-noise threshold for precise top-talent articulation must be embodied by the guide, and that's not yet common.",
      },
      {
        number: 3,
        name: "Keep iterating as clarity trickles down",
        description:
          "Keep iterating as more clarity and insight into your top talent naturally emerges — it will trickle down across your entire business as improvements.",
        oneProvenStrategy:
          "Version your top-talent statement and keep it in your face — in your notes app, as a post-it on your desk, as your phone background.",
      },
    ],
  },
  {
    number: 3,
    slug: "build",
    appName: "BUILD",
    subtitle: "Enhance it with Business Structure",
    transformationalResult: "I know the shape of my business.",
    neonHsl: "hsl(210, 90%, 62%)",
    neonRgb: "56, 140, 235",
    labelLines: ["Enhance with", "Business Structure"],
    price: "$555",
    bundleWith: [2],
    ctaText: "Create your Unique Business Structure at 9+/10 resonance in 2 hours",
    included: [
      "Clarity and remembrance on what business your top talent was always pointing at",
      "7 business artifacts unique to YOUR business",
    ],
    substeps: [
      {
        number: 1,
        name: "Find your Top Blind Spot",
        description: "",
        oneProvenStrategy:
          "Give your AI your Top Talent, ask it: please reveal my top blind spot by turning my top talent inside out.",
      },
      {
        number: 2,
        name: "Remember Your Personal Myth that Magnetizes Your Aligned Clients",
        description: "",
        oneProvenStrategy:
          "Ask your AI: turn my top blind spot into a Master Belief most of the world believes in, turn my top talent into a Master Truth I stand behind when I shine.",
      },
      {
        number: 3,
        name:
          "Produce the minimally viable set of key business artifacts that together form a concrete specific business strategy that stands the test of reason and that of an investor.",
        description: "",
        oneProvenStrategy:
          "Translate your top talent, your top blind spot, and your magnetizing myth into the pain that one experiences by living everyday with blind spot, especially when it gets acute, then into your aligned client tribe, then into a transformation promise; and finally the user/hero journey you serve and guide them on. You got a business. To make it rain, keep iterating, getting stuck, getting naturally unstuck, until you get to 9.5+/10. Empirically this seems to be a sufficient specificity to continue to the next step.",
      },
    ],
  },
  {
    number: 4,
    slug: "product",
    appName: "PRODUCT",
    subtitle: "Build your First Unique Product",
    transformationalResult: "My first product exists — I can hand it to someone.",
    neonHsl: "hsl(180, 85%, 55%)",
    neonRgb: "35, 220, 220",
    labelLines: ["Build your First", "Unique Product"],
    price: "$1,111 + rev share",
    bundleWith: [5],
    ctaText: "Build Your First Unique Product, Ready for Testing and Selling",
    included: [
      "Major learnings and improvements to your product",
      "Realization that you gain enormously by having your medicine received",
      "Excitement, entering flow state deeper, a boost of confidence, a sense of being useful, gratitude",
    ],
    substeps: [
      {
        number: 1,
        name: "Iterate to bring the business artifacts to 9+/10 resonance",
        description:
          "Iterate to bring the business artifacts to 9+/10 resonance.",
        oneProvenStrategy:
          "Roast the current version with AI (use roasting prompts at metaprompt.lovable.app), provide your inputs, then produce the next iteration, and repeat until you get to 9/10 or further. I recommend: arrive at 9/10, then continue with next steps. You will keep receiving further clarity towards 10, so make sure you version your work otherwise you likely get stuck in analysis paralysis.",
      },
      {
        number: 2,
        name: "Solidify and Concretize The Transformational Promise",
        description:
          "Solidify and concretize the Transformational Promise, turn it into a User Journey, a Value Ladder, and a Lead Magnet.",
        oneProvenStrategy:
          "Give AI transcripts of prior most aligned consulting/coaching calls and ask it to extract these artifacts.",
      },
      {
        number: 3,
        name: "Deliver Your Unique Product for the First Time",
        description:
          "Deliver your unique product for the first time.",
        oneProvenStrategy:
          "Iterate until you are excited to run it in this new structured way and literally can\u2019t wait and until you arrive at a first signature 1:1 session. Trust the first name that comes to mind, consciously focus on a clear tangible transformational result but don\u2019t overwhelm your client.",
      },
    ],
  },
  {
    number: 5,
    slug: "test",
    appName: "TEST",
    subtitle: "Beta-Test That Everything Works by Gifting and/or Selling",
    transformationalResult: "People who got it say yes to more.",
    neonHsl: "hsl(130, 75%, 55%)",
    neonRgb: "65, 220, 105",
    labelLines: ["Gift or Sell", "to Beta-Test"],
    price: "$1,111 + rev share",
    bundleWith: [4],
    substeps: [
      {
        number: 1,
        name: "Intuitively identify 5 people in your network that are in your tribe",
        description: "",
        oneProvenStrategy:
          "Set an intention to be listening to your intuition to suggest. Then from then on, watch for names of people in your network naturally bubbling up in your awareness. Maybe almost right away, maybe in the next day or two, maybe longer. Don\u2019t brute force it with the mind greedily wanting more client names. The key is to get one at a time. Until the next one. Trust your first instinct even when the mind says \u201Cthat could not be it\u201D. Write them down immediately so your ego doesn\u2019t dodge. Then whenever you get to it send an intuitive quick message without overthinking it. At this stage, you could offer them the transformational promise as a gift, offer is at an introductory price if appropriate, share an exciting professional update of now focusing on this.",
      },
      {
        number: 2,
        name:
          "Deliver your product as a 1:1 session, record it, track and analyze with AI, extract testimonials from their direct text (and/or video) quotes, do it again, learn iteratively, track what you think are your three key metrics.",
        description: "",
        oneProvenStrategy:
          "Use a simple dashboard to track delivery + outcomes like findyourtoptalent.com/dashboard. Do use an AI recorder like fathom.video or Plaud so every session becomes a learning artifact.",
      },
      {
        number: 3,
        name: "Get good at delivery and find your highly specific tribe.",
        description: "",
        oneProvenStrategy:
          "When you reach ~10 sessions delivered across ~5 clients (so it seems), that\u2019s where you start to be getting good at delivering transformational results across key flavors of people and situations to your tribe. Out of this newly earned clarity blossoms the flower of the highly specific aligned client tribe. For me as of April 2026 that\u2019s conscious aspiring impact entrepreneurs building their visionary ventures.",
      },
    ],
  },
  {
    number: 6,
    slug: "launch",
    appName: "LAUNCH",
    subtitle: "Laser-Focus Tactically and Go Live",
    transformationalResult: "I have my first paying client.",
    neonHsl: "hsl(45, 98%, 60%)",
    neonRgb: "255, 200, 40",
    labelLines: ["Laser-Focus and", "Go Live"],
    substeps: [
      {
        number: 1,
        name: "Build landing, funnel, and lead magnet that transform your ~10/10 tribe at every touchpoint",
        description: "",
        oneProvenStrategy:
          "The site you are reading is the landing page, the lead magnet is this playbook and the top talent reveal. The funnel is you reading this and what follows. Here is the template:\n\n1. Give out your method/playbook of how you got your transformational result as a free lead magnet.\n2. Crystallize everything from Steps 1–5 into a landing page, and a funnel. Use Godfather Offer Architect GPT or equivalent, and iterate through cycles of roast, and producing a next version.\n3. Your funnel is you helping them make a beneficial decision. You could highlight the cost of procrastinating on solving their painful situation, use identity-shift language. Iterate until the page can close without you on the call. Test of success is straightforward: ~10/10 aligned clients buy. If yes, you are at early PMF. If not, keep iterating. You are the answer.\n\nPS: My recommendation is not to quit doing whatever is currently bringing income. Not until at least this stage of your unique business. Kinda obvious but it is better to say it.",
      },
      {
        number: 2,
        name: "Laser-focus your communication on your 9+/10 tribe.",
        description: "",
        oneProvenStrategy:
          "Create and activate a \u201Cmaster tuning fork\u201D that repels non-clients and pulls in your 9+/10 tribe \u2014 the simplest possible frame of the transformation in ONE sentence. It will make the right people sit up, and makes other quietly leave. Then post a variation of it to your key digital channels: (a) one line + a URL bios (LinkedIn, Instagram, WhatsApp, Telegram, email signature, X, FB); (b) ONE DM template gifting the lead magnet and sharing your life\u2019s work; (c) ONE life-update post \u2014 what you just focused your life on, URL as only link, no pitch; (d) ONE bold content piece that diagnoses the pain the tribe lives in, or another first post.",
      },
      {
        number: 3,
        name: "Send a personal life-update + your lead magnet to tribe-aligned people (selected intuitively, especially ones holding a community). Make intros in 9+/10 aligned communities where appropriate.",
        description:
          "If demand isn\u2019t growing organically at this point yet, there are three strategies to add more kindle to this ignition:\n\n1. you need more iteration towards higher specificity on your tribe which may require adjustment to the landing, funnel, and lead magnet, and/or\n2. Activate additional digital + physical surfaces (ask AI to give your an integral list of digital and physical surfaces where it is optimal for you to place your communication for your specific tribe)\n3. Go upstream to aligned practitioners serving the same tribe, and/or start outreach campaigns",
        oneProvenStrategy:
          "Sit still, let names arise \u2014 trust the first instinct, especially weak-tie names (research is clear: weak ties carry the novelty strong ties can\u2019t). The higher their tribe-alignment AND community-holding potential, the better. Include the lead magnet (playbook / methodology link) as the gift, not the ask. Parallel: write ONE short intro for each alive ~10/10 community where you\u2019re already a member \u2014 wherever appropriate. Culture-match the text using AI by giving it some of the chat content, and/or intros.",
      },
    ],
  },
  {
    number: 7,
    slug: "scale",
    appName: "SCALE",
    subtitle: "Turn Organic Growth into Scaling Impact and Revenue",
    transformationalResult: "My income is organically growing without me pushing.",
    neonHsl: "hsl(10, 95%, 62%)",
    neonRgb: "250, 95, 60",
    labelLines: ["Grow & Scale", "with Others, in Flow"],
    price: "10% rev share or equity",
    substeps: [
      {
        number: 1,
        name: "Get guidance from a whole team of venture scalers working with you",
        description: "",
        oneProvenStrategy:
          "[Pending Sasha's vetted text]",
      },
      {
        number: 2,
        name: "Enter a decentralized revenue-sharing coop scheme",
        description: "",
        oneProvenStrategy:
          "[Pending Sasha's vetted text]",
      },
      {
        number: 3,
        name: "Enjoy the next octave of the ride",
        description: "",
        oneProvenStrategy:
          "[Pending Sasha's vetted text]",
      },
    ],
  },
];

/** Lookup by slug */
export const getStepBySlug = (slug: string): PlaybookStep | undefined =>
  PLAYBOOK_STEPS.find((s) => s.slug === slug);

/** Lookup by number (1–7) */
export const getStepByNumber = (n: number): PlaybookStep | undefined =>
  PLAYBOOK_STEPS.find((s) => s.number === n);

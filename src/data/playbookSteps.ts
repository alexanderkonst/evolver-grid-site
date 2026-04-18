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
export const PLAYBOOK_STEPS: PlaybookStep[] = [
  {
    number: 1,
    slug: "discover",
    appName: "DISCOVER",
    subtitle: "Name Your Top Talent",
    transformationalResult: "I can name my top talent out loud.",
    neonHsl: "hsl(175, 80%, 55%)",
    neonRgb: "0, 210, 190",
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
          "Use this prompt: \u201CBased on all you know about me, what\u2019s my zone of genius?\u201D",
      },
      {
        number: 2,
        name: "Distill it into one sentence — and actually write it down",
        description:
          "Distill your top talent into one sentence, and actually write it down.",
        oneProvenStrategy:
          "Ask your AI to do this for you, and then polish it yourself.",
      },
      {
        number: 3,
        name: "Iterate whenever new clarity emerges",
        description:
          "Work on it iteratively whenever you get new clarity.",
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
    transformationalResult: "I can describe my business in one sentence.",
    neonHsl: "hsl(260, 70%, 65%)",
    neonRgb: "140, 100, 234",
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
    neonHsl: "hsl(210, 70%, 60%)",
    neonRgb: "70, 140, 220",
    labelLines: ["Enhance with", "Business Structure"],
    price: "$555",
    bundleWith: [2],
    ctaText: "Create Your Unique Business Structure at 9+/10 Resonance in 90 mins",
    included: [
      "7 business artifacts unique to YOUR business",
      "Clarity and remembrance of what your top talent was always pointing at",
    ],
    substeps: [
      {
        number: 1,
        name: "See your Top Blind Spot",
        description:
          "See your top blind spot — what stays hidden precisely because it is the shadow of your gift.",
        oneProvenStrategy:
          "Ask your AI to reveal your top blind spot by turning your top talent inside out.",
      },
      {
        number: 2,
        name: "Turn Blind Spot into Master Lie and Master Truth",
        description:
          "Turn your top blind spot into a Master Lie the world believes — and a Master Truth that has been your life's main quest, the axis of your hero's journey.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.]",
      },
      {
        number: 3,
        name: "Translate into your Unique Business Structure",
        description:
          "Translate the myth, talent, blind-spot pain, tribe, transformation promise, and the user journey you take your tribe on — into one coherent business structure.",
        oneProvenStrategy:
          "Give your AI this playbook and you will get your unique business structure at 5-7 resonance. Then keep iterating until you reach 9.5+/10 — empirically that is sufficient precision to continue to the next step.",
      },
    ],
  },
  {
    number: 4,
    slug: "product",
    appName: "PRODUCT",
    subtitle: "Build your First Unique Product",
    transformationalResult: "My first product exists — I can hand it to someone.",
    neonHsl: "hsl(45, 90%, 55%)",
    neonRgb: "230, 190, 30",
    labelLines: ["Build your First", "Unique Product"],
    price: "$1,111 + rev share",
    bundleWith: [5],
    ctaText: "Build Your First Unique Product, Ready for Testing and Selling",
    included: [
      "[PLACEHOLDER — Sasha fills in what's included in the cohort Build]",
    ],
    substeps: [
      {
        number: 1,
        name: "Solidify and concretize the transformational promise",
        description:
          "Solidify and concretize your transformational promise — using transcripts of your prior most aligned consulting or coaching work.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.]",
      },
      {
        number: 2,
        name: "Design your first signature 1:1 session",
        description:
          "Turn the A→B user journey into a value ladder and arrive at a first signature 1:1 session with a clear, tangible transformational result that isn't overwhelming. Iterate until you are excited to run it in this new structured way — and literally can't wait.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.]",
      },
      {
        number: 3,
        name: "[PLACEHOLDER — Sasha fills in]",
        description:
          "[PLACEHOLDER — Sasha fills in.]",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.]",
      },
    ],
  },
  {
    number: 5,
    slug: "test",
    appName: "TEST",
    subtitle: "Gift it or Sell It To Beta-Test That Everything Works",
    transformationalResult: "People who got it say yes to more.",
    neonHsl: "hsl(330, 70%, 60%)",
    neonRgb: "220, 80, 140",
    labelLines: ["Gift or Sell", "to Beta-Test"],
    price: "$1,111 + rev share",
    bundleWith: [4],
    substeps: [
      {
        number: 1,
        name: "Gift the first three",
        description:
          "Gift the first three — full value, no price, full presence.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] Pick three people who match the tribe description exactly. Deliver as if they paid premium. Tell them: 'I need to know if this lands.'",
      },
      {
        number: 2,
        name: "Capture the shift",
        description:
          "Capture the shift — in their words, before the afterglow fades.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] Within 48 hours ask: what changed in you? And: what would you tell a friend who's stuck where you were? Those are your testimonials and your marketing copy.",
      },
      {
        number: 3,
        name: "Read the signal",
        description:
          "Read the signal — who wants more, who referred, who paid.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] Three gifts, three signals. Two of three want more → the ground is real. One of three refers → distribution is starting. Zero reach back → return to step two.",
      },
    ],
  },
  {
    number: 6,
    slug: "launch",
    appName: "LAUNCH",
    subtitle: "Laser-Focus Tactically and Go Live",
    transformationalResult: "I have my first paying client.",
    neonHsl: "hsl(145, 60%, 50%)",
    neonRgb: "50, 190, 100",
    labelLines: ["Laser-Focus and", "Go Live"],
    substeps: [
      {
        number: 1,
        name: "Name the price",
        description:
          "Name the price — premium, specific, with the reason underneath.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] Price the transformation, not the hours. Fixed price per container, no sliding scale. Write why this number feels right, for you.",
      },
      {
        number: 2,
        name: "Send the invitation",
        description:
          "Send the specific invitation — not a broadcast, a direct message.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] One message to one person: name the pain, name the shift, name the price. 'I'm opening three spots — want one?' Send ten before posting socially.",
      },
      {
        number: 3,
        name: "Hold the first session",
        description:
          "Hold the first paid session with the same care as the free ones.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] The money doesn't change the work — it names the commitment. Deliver the same depth. Notice what the payment opens.",
      },
    ],
  },
  {
    number: 7,
    slug: "scale",
    appName: "SCALE",
    subtitle: "Grow & Scale with Others, in Flow",
    transformationalResult: "My income is organically growing without me pushing.",
    neonHsl: "hsl(290, 60%, 60%)",
    neonRgb: "180, 100, 220",
    labelLines: ["Grow & Scale", "with Others, in Flow"],
    price: "10% rev share or equity",
    substeps: [
      {
        number: 1,
        name: "Multiply what works",
        description:
          "Find the channel that already works — and do more of only that.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] Map where your first three clients came from. The channel with two or more of them is your channel. Multiply it by three before adding anything new.",
      },
      {
        number: 2,
        name: "Systematise the session",
        description:
          "Systematise the sessions — keep the soul, document the steps.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] After each session, write what you did in order. What you do every time is the spine. What you adapt each time is the art — leave it alone.",
      },
      {
        number: 3,
        name: "Gather the circle",
        description: "Gather the circle — peers, not followers.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] Five founders, each holding a different unique business. Meet monthly. Share one question and one result. No leader role — the rotation is the leader.",
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

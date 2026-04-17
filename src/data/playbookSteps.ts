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
    price: "Free",
    included: [
      "Zone-of-Genius reflection prompt",
      "Talent-to-pain mapping worksheet",
      "Your one-line identity sentence",
    ],
    substeps: [
      {
        number: 1,
        name: "Ask your AI to reflect it back at you",
        description: "",
        oneProvenStrategy:
          "Use this prompt: \u201CBased on all you know about me, what\u2019s my zone of genius?\u201D",
      },
      {
        number: 2,
        name: "Map talent to pain",
        description:
          "Map where your talent meets a real pain someone else feels.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] Write ten one-line pains you've personally moved through; circle the three where your natural move was the unlock.",
      },
      {
        number: 3,
        name: "Say it in one line",
        description:
          "Say it in one line — what you do, for whom, with what shift.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] Template: 'I help [who] move from [pain] to [promise].' Test it on three strangers. If they lean in, it's alive.",
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
    substeps: [
      {
        number: 1,
        name: "Choose the tribe",
        description:
          "Choose the tribe — the specific people whose fire you can already name.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] Use the Resonance Sort Protocol: signal first, demographics second. Write their nickname, not their job title.",
      },
      {
        number: 2,
        name: "Shape the promise",
        description:
          "Shape the promise — the visible shift you deliver, in their words.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] Write the pain in the tribe's phrasing, then the resolution in the tribe's phrasing. The gap between those two sentences is your promise.",
      },
      {
        number: 3,
        name: "Lock the pitch",
        description:
          "Lock the one-sentence pitch — who, from what, to what — crisp.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] 'I help [tribe] move from [pain] to [promise] through [method].' Read it out loud — if you stumble, cut a word.",
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
    substeps: [
      {
        number: 1,
        name: "Set the value ladder",
        description:
          "Set the value ladder — one offer per altitude, priced with conviction.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] Free opens the question. Entry delivers one phase shift. Deep is the full container. Premium at every tier — no sliding scale.",
      },
      {
        number: 2,
        name: "Name the channel",
        description:
          "Name the channel — the one surface where your tribe actually lives.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] Pick the channel where you already naturally show up. One channel, not three. Post the same promise in the tribe's language for 30 days.",
      },
      {
        number: 3,
        name: "Draw the shape",
        description:
          "Draw the shape — offers, channel, and cadence on one page.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] One-page business map: offer · tribe · channel · price. If it doesn't fit on one page, you haven't simplified enough.",
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
    substeps: [
      {
        number: 1,
        name: "Pick the smallest thing",
        description:
          "Pick the smallest complete thing — one session, one document, one call.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] If you can't deliver it this week, it's too big. Write what happens in the first 30 minutes, and what the person walks away with.",
      },
      {
        number: 2,
        name: "Build the container",
        description:
          "Build the container — the frame that holds the work.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] One landing page, one calendar link, one email template. No funnel yet. Ship the ugly version and refine from real use.",
      },
      {
        number: 3,
        name: "Write the invitation",
        description:
          "Write the invitation — the message that opens the door.",
        oneProvenStrategy:
          "[PLACEHOLDER — Sasha fills in.] Lead with the pain in their voice. Name the shift, not the feature list. End with one specific ask — a yes/no question, not 'thoughts?'",
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

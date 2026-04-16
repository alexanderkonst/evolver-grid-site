/**
 * Playbook steps — single source of truth for the seven-step journey.
 *
 * Used by:
 *  - Landing page (`MethodologyLandingPage`) — tile grid, circular infographic
 *  - Playbook pages (`PlaybookPage`) — top nav, step cards, substep disclosures
 *
 * Structure:
 *  Step → 3 Substeps (1, 2, 3)
 *    Substep has:
 *      - description (1–2 lines, always visible as the row's default state)
 *      - oneGoodStrategyBullets[] — revealed on click of the ONE GOOD STRATEGY ▶ triangle
 *
 * Transformational-result labels are written in the user's own voice — what
 * they say to themselves after they've completed the step. The phrase must
 * stand alone as a proud, legible identity statement — NOT a dangling fragment.
 *
 * Step names (subtitles) are VERBATIM — do not paraphrase, do not compress.
 */

export type Substep = {
  /** 1, 2, 3 within a step */
  number: 1 | 2 | 3;
  /** What this substep does, 1–2 lines, human voice — always visible */
  description: string;
  /** The "ONE GOOD STRATEGY" bullets — hidden until the triangle is clicked */
  oneGoodStrategyBullets: string[];
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
};

/**
 * PLACEHOLDER COPY — Sasha will replace substep descriptions and strategy
 * bullets with his own text. Step names (subtitles) and transformational
 * results are final as of Day 41 (April 16, 2026).
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
    substeps: [
      {
        number: 1,
        description:
          "Name the one thing you do that others can't copy. The natural move, not the trained one.",
        oneGoodStrategyBullets: [
          "Run the Zone of Genius quiz — reveals your archetype in 6 questions.",
          "Ask five people who love you: what do I do that surprises you?",
          "Notice what you keep doing for free. That's the signal.",
        ],
      },
      {
        number: 2,
        description:
          "Map where your talent meets a real pain someone else feels.",
        oneGoodStrategyBullets: [
          "Write 10 one-line pains you've personally moved through.",
          "Circle the 3 where your natural move was the unlock.",
          "Those 3 are your ground. The rest are someone else's business.",
        ],
      },
      {
        number: 3,
        description:
          "Say it in one line — what you do, for whom, with what shift.",
        oneGoodStrategyBullets: [
          "Template: 'I help [who] move from [pain] to [promise].'",
          "Test it on 3 strangers. If they lean in, it's alive.",
          "Refine until it fits in one breath.",
        ],
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
        description:
          "Choose the tribe — the specific people whose fire you can name.",
        oneGoodStrategyBullets: [
          "Run the Resonance Sort Protocol: signal first, demographics second.",
          "Look for awakened practitioners who can't yet name what they carry.",
          "Write their nickname, not their job title.",
        ],
      },
      {
        number: 2,
        description:
          "Shape the promise — the visible shift you deliver, in their words.",
        oneGoodStrategyBullets: [
          "Write the pain in the tribe's exact phrasing.",
          "Write the resolution in the tribe's exact phrasing.",
          "The gap between those two sentences is your promise.",
        ],
      },
      {
        number: 3,
        description:
          "Lock the one-sentence pitch — who, from what, to what — crisp.",
        oneGoodStrategyBullets: [
          "Template: 'I help [tribe] move from [pain] to [promise] through [method].'",
          "Read it out loud. If you stumble, cut a word.",
          "Test on three strangers. If they ask a follow-up, it's alive.",
        ],
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
        description:
          "Set the value ladder — one offer per altitude, priced with conviction.",
        oneGoodStrategyBullets: [
          "Free: the question that opens them to themselves.",
          "Entry: a single session that delivers one phase shift.",
          "Deep: the full container — weeks, not minutes.",
          "Premium at every tier. No sliding scale.",
        ],
      },
      {
        number: 2,
        description:
          "Name the channel — the one surface where your tribe actually lives.",
        oneGoodStrategyBullets: [
          "Pick the channel where you already naturally show up.",
          "One channel. Not three. Not even two — yet.",
          "Post the same promise in the tribe's language for 30 days.",
        ],
      },
      {
        number: 3,
        description:
          "Draw the shape — offers, channel, and cadence on one page.",
        oneGoodStrategyBullets: [
          "One-page business map: offer · tribe · channel · price.",
          "If it doesn't fit on one page, you haven't simplified enough.",
          "Keep it where you see it daily.",
        ],
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
        description:
          "Pick the smallest complete thing — one session, one document, one call.",
        oneGoodStrategyBullets: [
          "If you can't deliver it this week, it's too big.",
          "Write what happens in the first 30 minutes.",
          "Write what the person walks away with.",
        ],
      },
      {
        number: 2,
        description: "Build the container — the frame that holds the work.",
        oneGoodStrategyBullets: [
          "One landing page. One calendar link. One email template.",
          "No funnel yet. One surface, clear door.",
          "Ship the ugly version. Refine from real use.",
        ],
      },
      {
        number: 3,
        description: "Write the invitation — the message that opens the door.",
        oneGoodStrategyBullets: [
          "Lead with the pain in their voice.",
          "Name the shift. No feature list.",
          "End with one specific ask — a yes or no question, not 'thoughts?'.",
        ],
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
        description:
          "Gift the first three — full value, no price, full presence.",
        oneGoodStrategyBullets: [
          "Pick 3 people who match the tribe description exactly.",
          "Deliver as if they paid premium.",
          "Tell them: 'I'm not selling. I need to know if this lands.'",
        ],
      },
      {
        number: 2,
        description:
          "Capture the shift — in their words, before the afterglow fades.",
        oneGoodStrategyBullets: [
          "Ask within 48 hours: what changed in you?",
          "Ask: what would you tell a friend who's stuck where you were?",
          "Those two answers are your testimonials and your marketing copy.",
        ],
      },
      {
        number: 3,
        description: "Read the signal — who wants more, who referred, who paid.",
        oneGoodStrategyBullets: [
          "Three gifts → three signals. Count them.",
          "If 2 of 3 want more, the ground is real.",
          "If 1 of 3 refers someone, distribution is starting.",
          "If 0 of 3 reach back, the promise doesn't match the pain. Return to step 2.",
        ],
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
        description:
          "Name the price — premium, specific, with the reason underneath.",
        oneGoodStrategyBullets: [
          "Price the transformation, not the hours.",
          "Fixed price per container. No sliding scale.",
          "Write why this number feels right, for you.",
        ],
      },
      {
        number: 2,
        description:
          "Send the specific invitation — not a broadcast, a direct message.",
        oneGoodStrategyBullets: [
          "One message to one person. Name the pain. Name the shift. Name the price.",
          "'I'm opening 3 spots. Want to be one?'",
          "Send 10 of these before you write a single social post.",
        ],
      },
      {
        number: 3,
        description:
          "Hold the first paid session with the same care as the free ones.",
        oneGoodStrategyBullets: [
          "The money doesn't change the work. It just names the commitment.",
          "Deliver the same depth. Notice what the payment opens.",
          "Capture what was different, if anything.",
        ],
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
        description:
          "Find the channel that already works — and do more of only that.",
        oneGoodStrategyBullets: [
          "Map where your first 3 clients came from.",
          "The channel with 2+ of them is your channel. Ignore the rest.",
          "Multiply by 3 before adding a new one.",
        ],
      },
      {
        number: 2,
        description:
          "Systematise the sessions — keep the soul, document the steps.",
        oneGoodStrategyBullets: [
          "After each session, write what you did, in order.",
          "Notice what you do every time. That's the spine.",
          "Notice what you adapt each time. That's the art. Leave it.",
        ],
      },
      {
        number: 3,
        description: "Gather the circle — peers, not followers.",
        oneGoodStrategyBullets: [
          "5 founders who each hold a different unique business.",
          "Meet monthly. Share one question and one result.",
          "No leader role. The rotation is the leader.",
        ],
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

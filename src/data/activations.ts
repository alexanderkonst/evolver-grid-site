// Activations — educational apps in the Planetary OS.
// Each entry = a 2-hour transformative workshop, recorded, productized.
// Day 51 (Sasha 2026-04-25): scaffolding — placeholder entries to be
// filled in with real titles, promises, YouTube IDs, and Stripe URLs.
//
// Editing flow:
//   1. Replace placeholder fields with real copy + IDs.
//   2. Set status: "live" when ready to ship.
//   3. Items with status: "placeholder" are hidden from the public index
//      but still accessible at /activations/<slug> for preview.

export type ActivationTheme =
  | "body"
  | "emotions"
  | "mind"
  | "talent"
  | "spirit";

export interface Activation {
  /** unique key — used internally and for analytics */
  id: string;
  /** URL slug — used in /activations/<slug> */
  slug: string;
  /** main title (Cormorant italic on hero) */
  title: string;
  /** short tag below title */
  subtitle: string;
  /** transformational promise — 1 sentence "Walk away with X" */
  promise: string;
  /** specific ideal-client description */
  whoFor: string;
  /** e.g. "2 hours" or "1h 45m" */
  duration: string;
  /** bullets of concrete outcomes / what's included */
  outcomes: string[];
  /** themes used for future grouping inside LEARN space */
  themes: ActivationTheme[];
  /** price in USD (display + matches Stripe link) */
  price: number;
  /** Stripe Payment Link — paste URL here. Empty = not yet wired. */
  stripeUrl: string;
  /** YouTube video ID (the part after ?v=). Used on access page. */
  youtubeId: string;
  /** "live" shows in public index; "placeholder" hides it */
  status: "live" | "placeholder";
  /** optional — testimonials for sales page */
  testimonials?: Array<{ name: string; quote: string }>;
}

// Placeholder roster — Sasha provides titles + transcripts; we synthesize
// the transformational promise + outcomes together. Once filled, set
// status: "live" and the entry shows on /activations.
export const ACTIVATIONS: Activation[] = [
  {
    id: "activation-01",
    slug: "activation-01",
    title: "Activation 01",
    subtitle: "[Topic to fill]",
    promise: "[Walk away with X — to be synthesized from transcript]",
    whoFor: "[Specific ideal-client description]",
    duration: "2 hours",
    outcomes: [
      "[Concrete outcome 1]",
      "[Concrete outcome 2]",
      "[Concrete outcome 3]",
    ],
    themes: [],
    price: 39,
    stripeUrl: "",
    youtubeId: "",
    status: "placeholder",
  },
  {
    id: "activation-02",
    slug: "activation-02",
    title: "Activation 02",
    subtitle: "[Topic to fill]",
    promise: "[Walk away with X — to be synthesized from transcript]",
    whoFor: "[Specific ideal-client description]",
    duration: "2 hours",
    outcomes: [
      "[Concrete outcome 1]",
      "[Concrete outcome 2]",
      "[Concrete outcome 3]",
    ],
    themes: [],
    price: 39,
    stripeUrl: "",
    youtubeId: "",
    status: "placeholder",
  },
  {
    id: "activation-03",
    slug: "activation-03",
    title: "Activation 03",
    subtitle: "[Topic to fill]",
    promise: "[Walk away with X — to be synthesized from transcript]",
    whoFor: "[Specific ideal-client description]",
    duration: "2 hours",
    outcomes: [
      "[Concrete outcome 1]",
      "[Concrete outcome 2]",
      "[Concrete outcome 3]",
    ],
    themes: [],
    price: 39,
    stripeUrl: "",
    youtubeId: "",
    status: "placeholder",
  },
  {
    id: "activation-04",
    slug: "activation-04",
    title: "Activation 04",
    subtitle: "[Topic to fill]",
    promise: "[Walk away with X — to be synthesized from transcript]",
    whoFor: "[Specific ideal-client description]",
    duration: "2 hours",
    outcomes: ["[Outcome 1]", "[Outcome 2]", "[Outcome 3]"],
    themes: [],
    price: 39,
    stripeUrl: "",
    youtubeId: "",
    status: "placeholder",
  },
  {
    id: "activation-05",
    slug: "activation-05",
    title: "Activation 05",
    subtitle: "[Topic to fill]",
    promise: "[Walk away with X — to be synthesized from transcript]",
    whoFor: "[Specific ideal-client description]",
    duration: "2 hours",
    outcomes: ["[Outcome 1]", "[Outcome 2]", "[Outcome 3]"],
    themes: [],
    price: 39,
    stripeUrl: "",
    youtubeId: "",
    status: "placeholder",
  },
  {
    id: "activation-06",
    slug: "activation-06",
    title: "Activation 06",
    subtitle: "[Topic to fill]",
    promise: "[Walk away with X — to be synthesized from transcript]",
    whoFor: "[Specific ideal-client description]",
    duration: "2 hours",
    outcomes: ["[Outcome 1]", "[Outcome 2]", "[Outcome 3]"],
    themes: [],
    price: 39,
    stripeUrl: "",
    youtubeId: "",
    status: "placeholder",
  },
  {
    id: "activation-07",
    slug: "activation-07",
    title: "Activation 07",
    subtitle: "[Topic to fill]",
    promise: "[Walk away with X — to be synthesized from transcript]",
    whoFor: "[Specific ideal-client description]",
    duration: "2 hours",
    outcomes: ["[Outcome 1]", "[Outcome 2]", "[Outcome 3]"],
    themes: [],
    price: 39,
    stripeUrl: "",
    youtubeId: "",
    status: "placeholder",
  },
  {
    id: "activation-08",
    slug: "activation-08",
    title: "Activation 08",
    subtitle: "[Topic to fill]",
    promise: "[Walk away with X — to be synthesized from transcript]",
    whoFor: "[Specific ideal-client description]",
    duration: "2 hours",
    outcomes: ["[Outcome 1]", "[Outcome 2]", "[Outcome 3]"],
    themes: [],
    price: 39,
    stripeUrl: "",
    youtubeId: "",
    status: "placeholder",
  },
  {
    id: "activation-09",
    slug: "activation-09",
    title: "Activation 09",
    subtitle: "[Topic to fill]",
    promise: "[Walk away with X — to be synthesized from transcript]",
    whoFor: "[Specific ideal-client description]",
    duration: "2 hours",
    outcomes: ["[Outcome 1]", "[Outcome 2]", "[Outcome 3]"],
    themes: [],
    price: 39,
    stripeUrl: "",
    youtubeId: "",
    status: "placeholder",
  },
  {
    id: "activation-10",
    slug: "activation-10",
    title: "Activation 10",
    subtitle: "[Topic to fill]",
    promise: "[Walk away with X — to be synthesized from transcript]",
    whoFor: "[Specific ideal-client description]",
    duration: "2 hours",
    outcomes: ["[Outcome 1]", "[Outcome 2]", "[Outcome 3]"],
    themes: [],
    price: 39,
    stripeUrl: "",
    youtubeId: "",
    status: "placeholder",
  },
];

// Bundle price — discount от sum of individual prices.
// Sasha: $39 × 10 = $390 individual. Bundle anchor $297 saves $93.
export const ACTIVATIONS_BUNDLE_PRICE = 297;
export const ACTIVATIONS_BUNDLE_STRIPE_URL = "";

export function getActivationBySlug(slug: string): Activation | undefined {
  return ACTIVATIONS.find((a) => a.slug === slug);
}

export function getLiveActivations(): Activation[] {
  return ACTIVATIONS.filter((a) => a.status === "live");
}

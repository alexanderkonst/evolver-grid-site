/**
 * The Book of Psychoactive Infographics, as data for the reader at /game/learn/book (spec row C4).
 *
 * SOURCE OF TRUTH: docs/assets/infographics/BOOK.md (contents, chapters, card titles, one-line
 * captions, status). This file FOLLOWS it; edit BOOK.md first, then mirror the change here.
 * Nothing is parsed at runtime. Chapters are in BOOK.md order. Card images live in
 * docs/assets/infographics/book/ (the source) and are copied to public/infographics/book/
 * with the same folder names (first-principles, ideal-client, laws, noosphere).
 *
 * The word "psychoactive" is the book's name only; it never appears on a card.
 */

export interface BookCard {
  /** Card id from BOOK.md (primitives-NN, ideal-client-NN, noosphere-N, or the law's old ID such as III.01). */
  id: string;
  title: string;
  /** The one-line caption from BOOK.md. Absent where BOOK.md has none. */
  caption?: string;
  /** Public URL of the card image. */
  image: string;
  /** Status as BOOK.md states it, e.g. "draft v4". */
  status: string;
}

export interface BookChapter {
  /** Number as in BOOK.md contents: "1", "2.1", "3.2". */
  number: string;
  title: string;
  /** 1 = a part of the book, 2 = a chapter inside a part. */
  depth: 1 | 2;
  /** The aside BOOK.md gives after the title, e.g. "the course's main infographic". */
  note?: string;
  /** True where BOOK.md says "(to make)" or lists no cards yet: shown as a quiet "coming" row. */
  coming: boolean;
  /** Cards in BOOK.md order. Empty for a coming chapter and for a part that only holds chapters. */
  cards: BookCard[];
}

export const BOOK_TITLE = "The Book of Psychoactive Infographics";

export const BOOK_CHAPTERS: BookChapter[] = [
  {
    number: "1",
    title: "Activate Your Dormant Potential",
    depth: 1,
    note: "the course's main infographic",
    coming: true,
    cards: [],
  },
  {
    number: "2",
    title: "See yourself",
    depth: 1,
    coming: false,
    cards: [],
  },
  {
    number: "2.1",
    title: "Uniqueness (top talent)",
    depth: 2,
    coming: true,
    cards: [],
  },
  {
    number: "2.2",
    title: "Mission",
    depth: 2,
    coming: true,
    cards: [],
  },
  {
    number: "2.3",
    title: "Resources",
    depth: 2,
    coming: true,
    cards: [],
  },
  {
    number: "2.4",
    title: "Quality of life",
    depth: 2,
    coming: true,
    cards: [],
  },
  {
    number: "3",
    title: "Branch A, default: Unique Business",
    depth: 1,
    coming: false,
    cards: [],
  },
  {
    number: "3.1",
    title: "Business from first principles",
    depth: 2,
    coming: false,
    cards: [
      { id: "primitives-01", title: "Two Humans", caption: "Every business, even deep tech, is a relationship between people.", image: "/infographics/book/first-principles/primitives-01.png", status: "draft v4" },
      { id: "primitives-02", title: "Process, Change, Exchange", caption: "What happens between the two.", image: "/infographics/book/first-principles/primitives-02.png", status: "draft v4" },
      { id: "primitives-03", title: "The DNA of a Business", caption: "Six cells. Every business that holds has all six.", image: "/infographics/book/first-principles/primitives-03.png", status: "draft v4" },
      { id: "primitives-04", title: "Uniqueness and Myth", caption: "Where the energy comes from, and what it does to the space.", image: "/infographics/book/first-principles/primitives-04.png", status: "draft v4" },
      { id: "primitives-05", title: "Tribe and Transition", caption: "Who the myth calls, and what they are walking through.", image: "/infographics/book/first-principles/primitives-05.png", status: "draft v4" },
      { id: "primitives-06", title: "Promise Becomes Tagline", caption: "The founder walked further. The promise takes others there.", image: "/infographics/book/first-principles/primitives-06.png", status: "draft v4" },
      { id: "primitives-07", title: "One Signal, Many Formats", caption: "Deck, demo, pitch: the same signal in different clothes.", image: "/infographics/book/first-principles/primitives-07.png", status: "draft v4" },
      { id: "primitives-08", title: "Human Signal First", caption: "AI needs a human signal. Without one, it gives low-signal output.", image: "/infographics/book/first-principles/primitives-08.png", status: "draft v4" },
      { id: "primitives-09", title: "Primitive or Noise", caption: "Skip the primitive and you start solving with your head.", image: "/infographics/book/first-principles/primitives-09.png", status: "draft v4" },
      { id: "primitives-10", title: "Two Signals", caption: "Co-founders are two signals. They amplify or they collide.", image: "/infographics/book/first-principles/primitives-10.png", status: "draft v4" },
      { id: "primitives-11", title: "Business and Product", caption: "Each founder has a unique business. Together they build one product.", image: "/infographics/book/first-principles/primitives-11.png", status: "draft v4" },
      { id: "primitives-12", title: "One Product, One Button", caption: "A business starts with one product. A product is one change.", image: "/infographics/book/first-principles/primitives-12.png", status: "draft v4" },
      { id: "primitives-13", title: "Start With Who", caption: "A result can't be invented in a vacuum.", image: "/infographics/book/first-principles/primitives-13.png", status: "draft v4" },
      { id: "primitives-14", title: "Two Dead Ends", caption: "The usual way to find demand: guess segments, test, wait for a hit.", image: "/infographics/book/first-principles/primitives-14.png", status: "draft v4" },
      { id: "primitives-15", title: "Equity VC Is a Casino", caption: "Investors who buy shares are placing bets.", image: "/infographics/book/first-principles/primitives-15.png", status: "draft v4" },
      { id: "primitives-16", title: "The Interchangeable Founder", caption: "How the equity game sees the person running the company.", image: "/infographics/book/first-principles/primitives-16.png", status: "draft v4" },
      { id: "primitives-17", title: "Sell What They Want", caption: "Give what they need inside it.", image: "/infographics/book/first-principles/primitives-17.png", status: "draft v4" },
      { id: "primitives-18", title: "Ready to Receive", caption: "Every tradition that asked this found the same four things.", image: "/infographics/book/first-principles/primitives-18.png", status: "draft v4" },
      { id: "primitives-19", title: "Find the Primitive", caption: "A session plan: from one question to one sentence.", image: "/infographics/book/first-principles/primitives-19.png", status: "draft v4" },
    ],
  },
  {
    number: "3.2",
    title: "Choosing your client",
    depth: 2,
    coming: false,
    cards: [
      { id: "ideal-client-01", title: "Your Ideal Client Is You", caption: "No one else is you. So measure everyone by how close they are to you.", image: "/infographics/book/ideal-client/ideal-client-01.png", status: "draft v1" },
      { id: "ideal-client-02", title: "Similar, and Different", caption: "Two corners make them like you. One corner makes them want to buy.", image: "/infographics/book/ideal-client/ideal-client-02.png", status: "draft v1" },
      { id: "ideal-client-03", title: "Three Kinds of Marketing", caption: "Speak to who they are, what they believe, and where they are crossing.", image: "/infographics/book/ideal-client/ideal-client-03.png", status: "draft v1" },
      { id: "ideal-client-04", title: "Take Them to the Next Village", caption: "You are the ferryman. The client comes to the pier at their threshold.", image: "/infographics/book/ideal-client/ideal-client-04.png", status: "draft v1" },
      { id: "ideal-client-05", title: "The Delta Is the Product", caption: "Your gift grows in stages. The step you've crossed is what you can hand on.", image: "/infographics/book/ideal-client/ideal-client-05.png", status: "draft v1" },
      { id: "ideal-client-06", title: "The Product Ladder", caption: "Describe the path you walked, then cut it into pieces that make sense.", image: "/infographics/book/ideal-client/ideal-client-06.png", status: "draft v1" },
      { id: "ideal-client-07", title: "Your Method Already Exists", caption: "You've delivered results. A structure was there, even if no one saw it.", image: "/infographics/book/ideal-client/ideal-client-07.png", status: "draft v1" },
      { id: "ideal-client-08", title: "The Key Is Inside", caption: "People look only at the doors available to them, not inward.", image: "/infographics/book/ideal-client/ideal-client-08.png", status: "draft v1" },
      { id: "ideal-client-09", title: "One Path", caption: "Your business grows as you grow. Inner work and business work become one.", image: "/infographics/book/ideal-client/ideal-client-09.png", status: "draft v1" },
      { id: "III.01", title: "Three Readinesses Multiply", caption: "If any one is near zero, the whole is zero.", image: "/infographics/book/laws/III.01.png", status: "draft v6" },
      { id: "III.02", title: "Which Program to Offer", caption: "Where is the person on their hero's journey?", image: "/infographics/book/laws/III.02.png", status: "draft v6" },
    ],
  },
  {
    number: "3.3",
    title: "Results and fair exchange",
    depth: 2,
    coming: false,
    cards: [
      { id: "VI.01", title: "Their Own 0–10 Scale", caption: "The client rates each of their goals: at the start, the middle and the end.", image: "/infographics/book/laws/VI.01.png", status: "draft v6" },
      { id: "VI.02", title: "Compared to What You Expected", caption: "At the end, one question for each goal: \"How far did it come true?\"", image: "/infographics/book/laws/VI.02.png", status: "draft v6" },
      { id: "VI.03", title: "Seen Change Gets Paid Fairly", caption: "Show clients what moved, in their own words. Never ask them to price it.", image: "/infographics/book/laws/VI.03.png", status: "draft v6" },
    ],
  },
  {
    number: "4",
    title: "Branch B: Grow",
    depth: 1,
    note: "further learning and activation of potential",
    coming: false,
    cards: [],
  },
  {
    number: "4.1",
    title: "Consciousness Meets Science",
    depth: 2,
    note: "the course's main infographic",
    coming: true,
    cards: [],
  },
  {
    number: "4.2",
    title: "Next Grow courses",
    depth: 2,
    coming: true,
    cards: [],
  },
  {
    number: "5",
    title: "Closing: the system behind it",
    depth: 1,
    coming: false,
    cards: [
      { id: "VII.01", title: "One Transformation, Three Forms", caption: "Each shift we deliver exists as a product, a game step and a software module.", image: "/infographics/book/laws/VII.01.png", status: "draft v6" },
      { id: "noosphere-1", title: "Every Cell Has a Neighbor", caption: "The world already knows each piece. Nobody holds all six from one source.", image: "/infographics/book/noosphere/noosphere-1.png", status: "draft v4" },
      { id: "noosphere-2", title: "The Founder, Replaced", caption: "Wasserman, Harvard: 212 US startups from the late 1990s and early 2000s.", image: "/infographics/book/noosphere/noosphere-2.png", status: "draft v4" },
      { id: "noosphere-3", title: "Most Venture Funds Lose to an Index Fund", image: "/infographics/book/noosphere/noosphere-3.png", status: "draft v4" },
    ],
  },
];

/** All cards of the book in reading order, for counting and checks. */
export const BOOK_CARDS: BookCard[] = BOOK_CHAPTERS.flatMap((c) => c.cards);

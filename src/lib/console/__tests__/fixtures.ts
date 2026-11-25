import type { ChainState, ButtonId, CardRecord } from "../phoenixChain";
import { emptyChain } from "../phoenixChain";

/** Model outputs in the shape the prompts ask for: full text, then one fenced JSON block. */
export const output = (card: unknown, full = "Here is the full answer."): string => `${full}\n\n\`\`\`json\n${JSON.stringify(card)}\n\`\`\``;

export const CARDS: Record<ButtonId, unknown> = {
  1: { goal: "Launch my first paid cohort.", why: ["You said you teach best live.", "Your top talent is synthesis.", "Three people asked you for it."], notThis: "Not a content calendar." },
  2: {
    case: "A cohort is the shortest path from skill to income.",
    risks: ["No audience", "Too much scope", "Price too low"],
    mistakes: [
      { mistake: "Build before asking", sign: "Slides before conversations" },
      { mistake: "Polish forever", sign: "Third rewrite of the intro" },
      { mistake: "Discount first", sign: "Offering free spots to friends" },
    ],
  },
  3: { goalV2: "Run a 4-week paid cohort for 8 people by March.", moves: ["Ask 10 people", "Write the offer", "Open 8 seats"], whatChanged: "Smaller and dated." },
  4: { weak: ["No price", "No date"], fixes: ["Set 300 USD", "Pick March 3"], thirteenth: "Sell the first seat before you build." },
  5: { survived: "A dated 8-seat cohort.", burned: "The big platform plan.", nextMove: "Message 10 people today." },
};

export const rec = (id: ButtonId, full = "full text"): CardRecord => ({ data: CARDS[id] as CardRecord["data"], full, at: "2026-11-25T00:00:00.000Z" });

export const chainWith = (...ids: ButtonId[]): ChainState => {
  const c = emptyChain(new Date("2026-11-25T00:00:00Z"));
  for (const id of ids) c.cards[id] = rec(id);
  return c;
};

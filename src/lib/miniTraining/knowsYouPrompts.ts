/**
 * Mini-training 2 · AI That Knows You: the prompt builder.
 *
 * Spec (single source): docs/02-strategy/ai-suite/mini-trainings/02-ai-that-knows-you.md (v0.1).
 * Pure functions only: no React, no network. Profile in, prompt text out.
 * Same filling rule as rung 1 (lib/miniTraining/mirrorPrompts.ts): data after a colon, an empty
 * field drops its whole label, a trailing period is stripped before the label's period.
 */
import { cleanValue, labelLine, type MirrorProfile } from "@/lib/miniTraining/mirrorPrompts";

/** Rung 2 reads the same profile as rung 1, plus the plan saved there (on this device). */
export type KnowsYouProfile = MirrorProfile & {
  /** The three-step plan saved in rung 1, if any. */
  plan?: string | null;
};

/** #5: the gap the person fills by voice or Edit. Send waits while it is on the card. */
export const SAY_IT_TOKEN = "(say it)";

/** #7: what goes under the profile when it is copied into another AI. */
export const ANYWHERE_PROMPT = "Read my profile. In 3 lines: what would you do differently for me now?";

const CLOSER = "Up to 5 lines, no emojis.";
const PAGE = "One page at most, up to 3 lines per section, no emojis.";

const join = (parts: Array<string | null | undefined | false>): string =>
  parts.filter((part): part is string => typeof part === "string" && part.length > 0).join(" ");

const talentsOf = (p: KnowsYouProfile): string | null => {
  const names = (p.topTalents ?? []).map((n) => cleanValue(n)).filter((n): n is string => !!n);
  return names.length > 0 ? names.join(", ") : null;
};

export type KnowsYouStep = {
  /** Stable id used for progress and the thread: «1a», «1b», «2», … «6b». */
  id: string;
  /** The micro-module this card belongs to (1–6; #7 has no AI card). */
  module: number;
  title: string;
  build: (profile: KnowsYouProfile) => string;
  /** «Save profile» is offered after the answer (#3, #4, #6b). */
  saveProfile?: boolean;
  /** #4: the profile comes back only after this many answers, so Save waits for them. */
  saveAfterReplies?: number;
  /** #1a: sent alone, like a brand-new chat, and left out of the thread for later buttons. */
  isolated?: boolean;
  /** Dialog cards: how many answers the person may give under the AI's reply. */
  replies?: number;
  /** #5: the card carries a gap the person fills before Send. */
  fillToken?: string;
};

export const KNOWS_YOU_STEPS: KnowsYouStep[] = [
  {
    id: "1a",
    module: 1,
    title: "First, as a stranger would ask",
    isolated: true,
    build: () => join(["Give me advice for my week.", CLOSER]),
  },
  {
    id: "1b",
    module: 1,
    title: "Then, the same question with you in it",
    build: (p) => {
      const mission = labelLine("My mission", p.mission);
      const priority = labelLine("My most important life area", p.priorityArea);
      // A button whose only profile fields are empty uses the next field it has (rung 1 rule).
      const fallback = mission || priority ? null : labelLine("My top talents", talentsOf(p));
      return join([mission, priority, fallback, "Now give me advice for my week.", CLOSER]);
    },
  },
  {
    id: "2",
    module: 2,
    title: "Let AI bring itself up to speed",
    replies: 5,
    build: () =>
      join([
        "Ask me 5 short questions, one at a time, that a new colleague would need to understand me and my work.",
        "Ask only the first question now and wait for my answer.",
        "After my fifth answer, tell me what you now know about me.",
        CLOSER,
      ]),
  },
  {
    id: "3",
    module: 3,
    title: "Write your one-page profile",
    saveProfile: true,
    build: (p) =>
      join([
        labelLine("My talents", talentsOf(p)),
        labelLine("My archetype", p.archetype),
        labelLine("My mission", p.mission),
        labelLine("My plan", p.plan),
        "From everything in this chat and these lines, write my one-page AI profile with five short sections: identity and roles, 90-day goals, genius, how I like answers, my limits. Mark what you guessed.",
        PAGE,
      ]),
  },
  {
    id: "4",
    module: 4,
    title: "Add your layer of «no»",
    saveProfile: true,
    saveAfterReplies: 3,
    replies: 3,
    build: () =>
      join([
        "Ask me 3 questions, one at a time, to find what you must never do for me or with my data.",
        "Ask only the first question now and wait for my answer.",
        "After my third answer, add a «No» section to my profile and show the whole profile again.",
        "No emojis.",
      ]),
  },
  {
    id: "5",
    module: 5,
    title: "Say what you want; let AI check it understood",
    replies: 2,
    fillToken: SAY_IT_TOKEN,
    build: () =>
      join([
        `Here is something I want: ${SAY_IT_TOKEN}.`,
        "Before answering, tell me in 3 lines what goal and context you understood, and what's missing.",
        "No emojis.",
      ]),
  },
  {
    id: "6a",
    module: 6,
    title: "First, the roast",
    build: () => join(["Roast my profile.", CLOSER]),
  },
  {
    id: "6b",
    module: 6,
    title: "Then, the next version",
    saveProfile: true,
    replies: 2,
    build: () =>
      join([
        "Produce the next version of my profile, with what the roast found.",
        "Same one page, five short sections, no emojis.",
      ]),
  },
];

export const knowsYouStepsOfModule = (module: number): KnowsYouStep[] =>
  KNOWS_YOU_STEPS.filter((s) => s.module === module);

/** #7: what Copy writes for another AI: the profile, then the question. */
export function anywhereText(profile: string | null | undefined): string {
  const text = typeof profile === "string" ? profile.trim() : "";
  return text ? `${text}\n\n${ANYWHERE_PROMPT}` : ANYWHERE_PROMPT;
}

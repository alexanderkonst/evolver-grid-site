/**
 * Mini-training 1 · AI as a Mirror: the eight micro-modules and the ready prompt of each button.
 * Spec (single source): docs/02-strategy/ai-suite/mini-trainings/01-ai-as-a-mirror.md (v0.6).
 * Prompt wording is quoted from the spec's Step 2 table; change the spec first, then this file.
 *
 * Filling rule: profile data always goes after a colon, as a label and its value
 * («My weakest life area: health.»). An empty field drops its WHOLE label line, never a
 * stand-in. A trailing period in a value is stripped before the label's own period
 * (cleanValue, in mirrorProfile.ts).
 *
 * Closing rule: every prompt ends «Up to 5 lines, no emojis.» (or the spec's own tighter cap).
 */
import type { MirrorProfile } from "./mirrorProfile";

/** Placeholder the #6 prompt carries until the player taps a line. */
export const LINE_PLACEHOLDER = "[LINE]";
/** #6 can be run up to this many times (spec issue #392). */
export const MAX_SHADOW_TAPS = 3;
/** What the weakest life area becomes when a prompt is copied to an outside AI (privacy rule). */
export const MASKED_AREA = "[an area of my life]";

export const WEAKEST_LABEL = "My weakest life area now";

export type MirrorStepCtx = { line?: string };

export type MirrorStep = {
  /** Unique across the page: "1" … "6", "7a", "7b", "8". */
  key: string;
  /** Which micro-module (1–8) the step belongs to. */
  moduleId: number;
  /** The ready prompt, filled from the profile (and, for #6, the tapped line). */
  prompt: (profile: MirrorProfile, ctx?: MirrorStepCtx) => string;
  /** Why Send is unavailable for this profile, or null when it is ready. */
  blockedReason?: (profile: MirrorProfile) => string | null;
  /** A gentle note under the prompt (does not block). */
  hint?: (profile: MirrorProfile) => string | null;
  /** «Save plan» appears under the answer (#5, #8). */
  savesPlan?: boolean;
};

export type MirrorModule = {
  id: number;
  title: string;
  idea: string;
  promise: string;
  steps: MirrorStep[];
};

const NEEDS_TALENT = "This one needs your Top Talent. Do the reveal first.";
const CLOSING = "Up to 5 lines, no emojis.";

/** «Name: value.» or null when the value is empty (the whole line is dropped). */
export const labelLine = (label: string, value: string | undefined): string | null =>
  value ? `${label}: ${value}.` : null;

const compose = (...parts: (string | null | undefined | false)[]): string =>
  parts.filter((p): p is string => typeof p === "string" && p.length > 0).join("\n");

const needsTalents = (p: MirrorProfile) => (p.top_talents ? null : NEEDS_TALENT);

/** Strip a trailing period from a tapped line, then add one unless it ends in ? or !. */
const sentence = (line: string): string => {
  const bare = line.replace(/\s+/g, " ").trim().replace(/\.+$/, "").trim();
  return /[?!]$/.test(bare) ? bare : `${bare}.`;
};

export const MIRROR_MODULES: MirrorModule[] = [
  {
    id: 1,
    title: "Nothing unnatural",
    idea: "There is one intelligence; AI is a new form of it, not something alien.",
    promise: "You stop seeing AI as a stranger.",
    steps: [
      {
        key: "1",
        moduleId: 1,
        blockedReason: needsTalents,
        prompt: (p) =>
          compose(
            labelLine("My name", p.first_name),
            labelLine("My top talents", p.top_talents),
            labelLine("My mission", p.mission),
            "In up to 5 lines: what do you see in me that I may not see myself? Last line: what you are least sure of. No emojis.",
          ),
      },
    ],
  },
  {
    id: 2,
    title: "Artificial = made with art",
    idea: "«Artificial» comes from art: made by skill, not fake.",
    promise: "You stop calling it a fake.",
    steps: [
      {
        key: "2",
        moduleId: 2,
        blockedReason: (p) => (p.mastery_action || p.top_talents ? null : NEEDS_TALENT),
        // No mastery action: the next field it has (top talents) stands in, still as a label.
        // (The spec's own wording asks for 4 + 2 lines, so only «No emojis.» is added here.)
        prompt: (p) =>
          p.mastery_action
            ? compose(
                labelLine("What I do best", p.mastery_action),
                "Write a four-line motto for it. Then two lines: what in it is your craft, and what came from me? No emojis.",
              )
            : compose(
                labelLine("My talents", p.top_talents),
                "Write a four-line motto for them. Then two lines: what in it is your craft, and what came from me? No emojis.",
              ),
      },
    ],
  },
  {
    id: 3,
    title: "We choose where it goes",
    idea: "People choose where AI goes, step by step; your part starts today.",
    promise: "You see your own part, today.",
    steps: [
      {
        key: "3",
        moduleId: 3,
        blockedReason: (p) => (p.mastery_action || p.top_talents ? null : NEEDS_TALENT),
        prompt: (p) =>
          compose(
            labelLine("What I do best", p.mastery_action),
            labelLine("My talents", p.top_talents),
            "Up to 5 lines: what can AI do in my work better than me, and what stays only mine? No emojis.",
          ),
      },
    ],
  },
  {
    id: 4,
    title: "Not a tool: a synthetic brain",
    idea: "A brain trained on human language; unlike a hammer, it adapts to you.",
    promise: "You can explain AI in two sentences.",
    steps: [
      {
        key: "4",
        moduleId: 4,
        blockedReason: (p) => (p.top_talents || p.archetype ? null : NEEDS_TALENT),
        prompt: (p) =>
          compose(
            "AI is a synthetic brain trained on human language. Unlike a hammer, it adapts to the person.",
            labelLine("My talents", p.top_talents),
            labelLine("My archetype", p.archetype),
            "Show me in up to 5 lines how you adapt to me, without explaining how AI works. No emojis.",
          ),
      },
    ],
  },
  {
    id: 5,
    title: "A partner, not a search box",
    idea: "AI is a whole (voice, memory, hands, mirror of culture…) and today it can work with you.",
    promise: "You make your first plan together.",
    steps: [
      {
        key: "5",
        moduleId: 5,
        savesPlan: true,
        hint: (p) =>
          p.mission ? null : "No mission saved yet. Press the microphone and say it in your own words.",
        prompt: (p) =>
          compose(
            labelLine("My mission", p.mission),
            labelLine("My most important life area", p.priority_area),
            `Be my partner: three steps for this week, then ask me which one we start with. ${CLOSING}`,
          ),
      },
    ],
  },
  {
    id: 6,
    title: "AI's shadows",
    idea: "AI tends to please and to make things up; you judge, not it.",
    promise: "You catch AI flattering you, in your own chat.",
    steps: [
      {
        key: "6",
        moduleId: 6,
        // No profile field: only the line the player taps (spec: «No AI call first»).
        prompt: (_p, ctx) =>
          `This line would fit anyone: ${ctx?.line ? sentence(ctx.line) : `${LINE_PLACEHOLDER}.`} Say it again so it fits only me, or tell me you don't know. Up to 3 lines, no emojis.`,
      },
    ],
  },
  {
    id: 7,
    title: "The mirror",
    idea: "AI answers at the level you speak to it.",
    promise: "You see your own words change the answer.",
    steps: [
      { key: "7a", moduleId: 7, prompt: () => "Help me with my life." },
      {
        key: "7b",
        moduleId: 7,
        blockedReason: (p) => (p.top_talents || p.archetype ? null : NEEDS_TALENT),
        prompt: (p) =>
          compose(
            labelLine("My name", p.first_name),
            labelLine("My archetype", p.archetype),
            labelLine(WEAKEST_LABEL, p.weakest_area),
            labelLine("My talents", p.top_talents),
            `Three moves that use my talents. ${CLOSING}`,
          ),
      },
    ],
  },
  {
    id: 8,
    title: "A real conversation",
    idea: "From tool to relationship: speak to it like to a colleague.",
    promise: "You have a partner, not an app.",
    steps: [
      {
        key: "8",
        moduleId: 8,
        savesPlan: true,
        hint: () => "About 5 minutes. Press the microphone and answer by voice.",
        prompt: () =>
          "You know my plan from this conversation. Ask me three questions, one at a time, to understand what I want most right now. Then tell me which of the three steps we start with tomorrow. Your final answer: up to 5 lines, no emojis.",
      },
    ],
  },
];

export const MIRROR_STEPS: MirrorStep[] = MIRROR_MODULES.flatMap((m) => m.steps);

export const getMirrorStep = (key: string): MirrorStep => {
  const step = MIRROR_STEPS.find((s) => s.key === key);
  if (!step) throw new Error(`Unknown mini-training step: ${key}`);
  return step;
};

/**
 * Privacy rule: life-area levels stay inside Your AI. On Copy to an outside AI the weakest area
 * becomes «[an area of my life]»; the player can type it in themselves.
 */
export function maskForCopy(text: string, profile: MirrorProfile): string {
  const area = profile.weakest_area;
  if (!area) return text;
  return text.split(`${WEAKEST_LABEL}: ${area}.`).join(`${WEAKEST_LABEL}: ${MASKED_AREA}.`);
}

/** The lines of an answer, one per tap target: bullets and numbering stripped, blanks dropped. */
export function answerLines(answer: string): string[] {
  return answer
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim())
    .filter(Boolean);
}

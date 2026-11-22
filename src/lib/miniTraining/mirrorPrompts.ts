/**
 * Mini-training 1 · AI as a Mirror: the prompt builder (issue #392).
 *
 * Spec (single source): docs/02-strategy/ai-suite/mini-trainings/01-ai-as-a-mirror.md (v0.6).
 * Pure functions only: no React, no network. Profile in, prompt text out.
 *
 * Filling rule (spec «Filling rule»):
 *  - profile data always goes after a colon, as a label and its value;
 *  - an empty field drops its WHOLE label, never a stand-in;
 *  - weakest-area tie: the field is left out (see `weakestAreaOf`);
 *  - a trailing period is stripped from a value before the label's period is added.
 * Privacy rule: on Copy to an outside AI the weakest area becomes «[an area of my life]».
 */
import { TALENTS } from "@/modules/zone-of-genius/talents";
import { DOMAINS, type DomainId } from "@/modules/quality-of-life-map/qolConfig";
import { QOL_DOMAIN_COLUMNS, type QolStageColumns } from "@/lib/qolLevel";

/** The seven placeholders of the spec's «Profile fields used» table, already as plain text. */
export type MirrorProfile = {
  firstName?: string | null;
  /** The three talents as names, in the player's order. */
  topTalents?: string[] | null;
  archetype?: string | null;
  masteryAction?: string | null;
  mission?: string | null;
  priorityArea?: string | null;
  weakestArea?: string | null;
};

/** What the Copy button writes where the weakest area was. */
export const WEAKEST_AREA_MASK = "[an area of my life]";

/** The one token #6 carries until the player taps a line. */
export const LINE_TOKEN = "[LINE]";

/** Every prompt ends with this (spec: «Up to 5 lines, no emojis»). */
const CLOSER = "Up to 5 lines, no emojis.";

/** One whitespace-normalised value with a trailing period removed; null when nothing is left. */
export function cleanValue(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/\s+/g, " ").trim().replace(/\.$/, "").trim();
  return text.length > 0 ? text : null;
}

/** «My name: Mira.» or nothing at all. */
export function labelLine(label: string, value: string | null | undefined): string | null {
  const clean = cleanValue(value);
  return clean ? `${label}: ${clean}.` : null;
}

const join = (parts: Array<string | null | undefined | false>): string =>
  parts.filter((part): part is string => typeof part === "string" && part.length > 0).join(" ");

const talentsOf = (p: MirrorProfile): string | null => {
  const names = (p.topTalents ?? []).map((n) => cleanValue(n)).filter((n): n is string => !!n);
  return names.length > 0 ? names.join(", ") : null;
};

/* ------------------------------------------------------------------ profile → text */

/** Talent ids arrive as numbers (or numeric strings); a name that is not an id passes through. */
export function talentNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const names: string[] = [];
  for (const item of raw) {
    const asNumber = typeof item === "number" ? item : typeof item === "string" && /^\d+$/.test(item.trim()) ? Number(item) : null;
    if (asNumber !== null) {
      const talent = TALENTS.find((t) => t.id === asNumber);
      if (talent) names.push(talent.name);
    } else if (typeof item === "string" && item.trim()) {
      names.push(item.trim());
    }
  }
  return names;
}

const domainName = (id: DomainId): string => (DOMAINS.find((d) => d.id === id)?.name ?? id).toLowerCase();

/** First of `game_profiles.qol_priorities` that is a known life area, as a lowercase name. */
export function priorityAreaOf(raw: unknown): string | null {
  if (!Array.isArray(raw)) return null;
  for (const item of raw) {
    if (typeof item === "string" && item in QOL_DOMAIN_COLUMNS) return domainName(item as DomainId);
  }
  return null;
}

/**
 * The life area with the lowest stage. A tie for the lowest stage returns null
 * (spec: «leave {weakest_area} out»); so does a snapshot with no scores.
 */
export function weakestAreaOf(snapshot: Partial<QolStageColumns> | null | undefined): string | null {
  if (!snapshot) return null;
  const scored: Array<{ id: DomainId; stage: number }> = [];
  for (const id of Object.keys(QOL_DOMAIN_COLUMNS) as DomainId[]) {
    const stage = snapshot[QOL_DOMAIN_COLUMNS[id]];
    if (typeof stage === "number" && Number.isFinite(stage)) scored.push({ id, stage });
  }
  if (scored.length === 0) return null;
  const lowest = Math.min(...scored.map((s) => s.stage));
  const atLowest = scored.filter((s) => s.stage === lowest);
  return atLowest.length === 1 ? domainName(atLowest[0].id) : null;
}

/* ------------------------------------------------------------------ the buttons */

/** What a button may need beyond the profile. */
export type PromptContext = {
  /** #6: the line the player tapped in an earlier answer. */
  line?: string | null;
};

export type PromptStep = {
  /** Stable id used for progress and the thread: «1», «2», … «7a», «7b», «8». */
  id: string;
  /** The micro-module this card belongs to (1–8). */
  module: number;
  /** Heading of the card. */
  title: string;
  /** The prompt, filled from the profile. */
  build: (profile: MirrorProfile, ctx?: PromptContext) => string;
  /** «Save plan» is offered after the answer (#5, #8). */
  savePlan?: boolean;
  /** #6: the prompt carries [LINE], filled by tapping a line of an earlier answer. */
  needsLine?: boolean;
};

const nameLine = (p: MirrorProfile) => labelLine("My name", p.firstName);
const talentsLine = (p: MirrorProfile, label = "My top talents") => labelLine(label, talentsOf(p));
const missionLine = (p: MirrorProfile) => labelLine("My mission", p.mission);
const archetypeLine = (p: MirrorProfile) => labelLine("My archetype", p.archetype);

export const MIRROR_STEPS: PromptStep[] = [
  {
    id: "1",
    module: 1,
    title: "Ask AI what it sees in you",
    build: (p) =>
      join([
        nameLine(p),
        talentsLine(p),
        missionLine(p),
        "What do you see in me that I may not see myself? Last line: what you are least sure of.",
        CLOSER,
      ]),
  },
  {
    id: "2",
    module: 2,
    title: "Ask AI for a motto",
    build: (p) => {
      // #2 without {mastery_action} uses {top_talents} (spec).
      const own = labelLine("What I do best", p.masteryAction);
      const source = own ?? talentsLine(p, "My top talents");
      const pronoun = own ? "it" : "them";
      return join([
        source,
        `Write a four-line motto for ${pronoun}. Then two lines: what in it is your craft, and what came from me?`,
        // The motto (4) plus the two lines (2) is six lines, so this one prompt keeps only the emoji rule.
        "No emojis.",
      ]);
    },
  },
  {
    id: "3",
    module: 3,
    title: "Ask AI: its part, your part",
    build: (p) =>
      join([
        labelLine("What I do best", p.masteryAction),
        talentsLine(p, "My talents"),
        "What can AI do in my work better than me, and what stays only mine?",
        CLOSER,
      ]),
  },
  {
    id: "4",
    module: 4,
    title: "Ask AI to adapt to you",
    build: (p) =>
      join([
        "AI is a synthetic brain trained on human language. Unlike a hammer, it adapts to the person.",
        talentsLine(p, "My talents"),
        archetypeLine(p),
        "Show me how you adapt to me, without explaining how AI works.",
        CLOSER,
      ]),
  },
  {
    id: "5",
    module: 5,
    title: "Ask AI for a plan for this week",
    savePlan: true,
    build: (p) => {
      const mission = missionLine(p);
      const priority = labelLine("My most important life area", p.priorityArea);
      // A button whose only profile fields are empty uses the next field it has (spec).
      const fallback = mission || priority ? null : talentsLine(p);
      return join([
        mission,
        priority,
        fallback,
        "Be my partner: three steps for this week, then ask me which one we start with.",
        CLOSER,
      ]);
    },
  },
  {
    id: "6",
    module: 6,
    title: "Ask AI to say it so it fits only you",
    needsLine: true,
    build: (_p, ctx) => {
      const line = cleanValue(ctx?.line) ?? LINE_TOKEN;
      return join([
        `This line would fit anyone: ${line}.`,
        "Say it again so it fits only me, or tell me you don't know.",
        "Up to 3 lines, no emojis.",
      ]);
    },
  },
  {
    id: "7a",
    module: 7,
    title: "First, the vague question",
    build: () => join(["Help me with my life.", CLOSER]),
  },
  {
    id: "7b",
    module: 7,
    title: "Then, the same question from your profile",
    build: (p) =>
      join([
        nameLine(p),
        archetypeLine(p),
        labelLine("My weakest life area now", p.weakestArea),
        talentsLine(p, "My talents"),
        "Three moves that use my talents.",
        CLOSER,
      ]),
  },
  {
    id: "8",
    module: 8,
    title: "Talk to it like a colleague",
    savePlan: true,
    build: () =>
      join([
        "You know my plan from this conversation. Ask me three questions, one at a time, to understand what I want most right now. Then tell me which of the three steps we start with tomorrow.",
        // Spec: the last line of the #8 prompt, verbatim.
        "Your final answer: up to 5 lines, no emojis.",
      ]),
  },
];

export const stepById = (id: string): PromptStep | undefined => MIRROR_STEPS.find((s) => s.id === id);
export const stepsOfModule = (module: number): PromptStep[] => MIRROR_STEPS.filter((s) => s.module === module);

/* ------------------------------------------------------------------ copy + lines */

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Text for Copy to an outside AI. Life-area levels are private in the game, so the weakest
 * area is replaced by «[an area of my life]» (the person may type it in themselves).
 * Works on the text as it stands on the card, edited or not.
 */
export function prepareForCopy(text: string, weakestArea: string | null | undefined): string {
  const area = cleanValue(weakestArea);
  if (!area) return text;
  const pattern = new RegExp(`(My weakest life area now: )${escapeRegExp(area)}(\\.)`, "gi");
  return text.replace(pattern, `$1${WEAKEST_AREA_MASK}$2`);
}

/** The lines of an AI answer a player can tap in #6: non-empty, bullets and numbers stripped. */
export function answerLines(answer: string | null | undefined): string[] {
  if (!answer) return [];
  return answer
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").replace(/\*\*/g, "").trim())
    .filter((line) => line.length > 0);
}

/** #6 may use up to this many taps (spec: «up to 3 times»). */
export const MAX_LINE_TAPS = 3;

/**
 * buildFamiliarPrompt — pure assembly of the player's personal prompt (Task A, §9).
 *
 *   «About me» (top talent, mission) + «My work» (Workshop artifacts) + AI OS + its licence header
 *
 * The two short sections come first so the model reads who it is talking to before it reads
 * how to think. AI OS follows, and its licence header (the leading version and License lines,
 * text untouched) closes the prompt, so a long paste does not open on legal text. Empty parts
 * are omitted, headings included: a guest gets AI OS alone, header first, which is today's
 * `/ai-os` install. No I/O and no clock, so it tests without a browser.
 */

export interface FamiliarTalentInput {
  archetypeTitle?: string | null;
  corePattern?: string | null;
  /** `zog_snapshots.top_three_talents`: the long sentences, second person. */
  topThreeTalents?: string[] | null;
}

export interface FamiliarArtifactInput {
  /** `user_business_artifacts.artifact_key`. */
  key: string;
  /** Player-facing name, e.g. «Uniqueness». */
  label: string;
  text: string;
}

export interface BuildFamiliarPromptInput {
  /** The AI OS text, appended last. */
  aiOs: string;
  talent?: FamiliarTalentInput | null;
  mission?: string | null;
  artifacts?: FamiliarArtifactInput[] | null;
}

/** One landing page can run to thousands of words; each piece gets this many characters. */
export const ARTIFACT_CHAR_CAP = 2000;

const clean = (s: string | null | undefined): string => (s ?? "").trim();

const cap = (s: string): string => (s.length > ARTIFACT_CHAR_CAP ? `${s.slice(0, ARTIFACT_CHAR_CAP).trimEnd()}…` : s);

/** The text of an artifact row: `content` when it has some, else every string inside `content_json`. */
export const artifactText = (row: { content?: string | null; content_json?: unknown }): string => {
  const direct = clean(row.content);
  if (direct) return direct;
  const parts: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") {
      if (v.trim()) parts.push(v.trim());
    } else if (Array.isArray(v)) {
      v.forEach(walk);
    } else if (v && typeof v === "object") {
      Object.values(v as Record<string, unknown>).forEach(walk);
    }
  };
  walk(row.content_json);
  return parts.join("\n");
};

/** The «About me» section, or "" when there is nothing to say. */
const aboutMe = (talent: FamiliarTalentInput | null | undefined, mission: string | null | undefined): string => {
  const lines: string[] = [];
  const title = clean(talent?.archetypeTitle);
  const pattern = clean(talent?.corePattern);
  const three = (talent?.topThreeTalents ?? []).map(clean).filter(Boolean);
  if (title) lines.push(`My top talent: ${title}`);
  if (pattern) lines.push(`My core pattern: ${pattern}`);
  if (three.length > 0) lines.push(`My three top talents:\n${three.map((s) => `- ${s}`).join("\n")}`);
  const m = clean(mission);
  if (m) lines.push(`My mission: ${m}`);
  return lines.length > 0 ? `# About me\n\n${lines.join("\n\n")}` : "";
};

/** The «My work» section, or "" when no artifact has text. */
const myWork = (artifacts: FamiliarArtifactInput[] | null | undefined): string => {
  const blocks = (artifacts ?? [])
    .map((a) => ({ label: clean(a.label) || a.key, text: cap(clean(a.text)) }))
    .filter((a) => a.text)
    .map((a) => `## ${a.label}\n\n${a.text}`);
  return blocks.length > 0 ? `# My work\n\n${blocks.join("\n\n")}` : "";
};

const preamble = (withLicence: boolean): string =>
  `Below is who I am and what I do, followed by the system prompt you operate under${withLicence ? " and, at the very end, its licence" : ""}. Keep it in mind in every answer and use it where it helps me. Do not recite it back unless I ask.`;

/** The AI OS header lines: «AI OS v6.0 · date · © owner» and «License: …». */
const LICENCE_LINE = /^(AI OS v\d|License:)/;

/**
 * Splits the AI OS text into its leading licence header and the rest. A text without that header
 * (an older release) comes back whole as `body`. Lines are kept exactly as written.
 */
export const splitLicence = (aiOs: string): { licence: string; body: string } => {
  const lines = clean(aiOs).split("\n");
  let n = 0;
  while (n < lines.length && LICENCE_LINE.test(lines[n])) n++;
  if (n === 0) return { licence: "", body: lines.join("\n") };
  return { licence: lines.slice(0, n).join("\n"), body: lines.slice(n).join("\n").trim() };
};

/** Which parts the personal prompt holds, with each one's size in characters (`prompt.length` in total). */
export type PromptSectionKey = "aboutMe" | "myWork" | "aiOs";
export interface PromptSection {
  key: PromptSectionKey;
  chars: number;
}

/** The sections `buildFamiliarPrompt` puts in the prompt, for the «what your AI receives» list. */
export function promptSections(input: BuildFamiliarPromptInput): PromptSection[] {
  const out: PromptSection[] = [];
  const about = aboutMe(input.talent, input.mission);
  const work = myWork(input.artifacts);
  if (about) out.push({ key: "aboutMe", chars: about.length });
  if (work) out.push({ key: "myWork", chars: work.length });
  out.push({ key: "aiOs", chars: clean(input.aiOs).length });
  return out;
}

export function buildFamiliarPrompt(input: BuildFamiliarPromptInput): string {
  const aiOs = clean(input.aiOs);
  const sections = [aboutMe(input.talent, input.mission), myWork(input.artifacts)].filter(Boolean);
  if (sections.length === 0) return aiOs;
  const { licence, body } = splitLicence(aiOs);
  const tail = licence ? ["---", licence] : [];
  return [preamble(!!licence), ...sections, "---", body, ...tail].filter((s) => s !== "").join("\n\n");
}

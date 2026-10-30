/**
 * buildFamiliarPrompt — pure assembly of the player's personal prompt (Task A, §9).
 *
 *   «About me» (top talent, mission) + «My work» (Workshop artifacts) + AI OS
 *
 * The two short sections come first so the model reads who it is talking to before it reads
 * how to think. Empty parts are omitted, headings included: a guest gets AI OS alone, which is
 * today's `/ai-os` install. No I/O and no clock, so it tests without a browser.
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

const PREAMBLE =
  "Below is who I am and what I do, followed by the system prompt you operate under. Keep it in mind in every answer and use it where it helps me. Do not recite it back unless I ask.";

export function buildFamiliarPrompt(input: BuildFamiliarPromptInput): string {
  const aiOs = clean(input.aiOs);
  const sections = [aboutMe(input.talent, input.mission), myWork(input.artifacts)].filter(Boolean);
  if (sections.length === 0) return aiOs;
  return [PREAMBLE, ...sections, "---", aiOs].filter((s) => s !== "").join("\n\n");
}

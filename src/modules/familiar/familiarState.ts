/**
 * familiarState — the three gifts, the prompt and its version, from what the player has saved.
 * Pure; `useFamiliar` loads the data and calls this. Gift 2 (activated) needs no data, so it is
 * lit for everyone, guests included (§1.2).
 */
import { buildFamiliarPrompt, type BuildFamiliarPromptInput } from "./buildFamiliarPrompt";
import type { FamiliarState, GiftState } from "./types";

export const WORKSHOP_TOTAL = 19;

export interface FamiliarSources extends BuildFamiliarPromptInput {
  aiOsVersion: string;
}

/** FNV-1a, 32 bits, as hex: a short stable stamp of the prompt (synchronous, no crypto). */
export const hashPrompt = (s: string): string => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
};

export function buildGifts(src: FamiliarSources): GiftState[] {
  const hasTalent = !!src.talent?.archetypeTitle?.trim();
  const hasMission = !!src.mission?.trim();
  const pieces = (src.artifacts ?? []).filter((a) => a.text.trim()).length;
  return [
    {
      key: "knowsYou",
      lit: hasTalent,
      label: "Knows you",
      detail: hasTalent ? (hasMission ? "your top talent + your mission" : "your top talent") : undefined,
      opensWhen: hasTalent ? undefined : "Opens when you save your top talent",
    },
    { key: "activated", lit: true, label: "Activated", detail: `AI OS ${src.aiOsVersion}` },
    {
      key: "knowsYourWork",
      lit: pieces > 0,
      label: "Knows your work",
      detail: pieces > 0 ? `${pieces} of ${WORKSHOP_TOTAL} Workshop pieces` : undefined,
      opensWhen: pieces > 0 ? undefined : "Opens in the Workshop",
    },
  ];
}

export function buildFamiliarState(src: FamiliarSources): Omit<FamiliarState, "loading"> {
  const prompt = buildFamiliarPrompt(src);
  return { gifts: buildGifts(src), prompt, version: hashPrompt(prompt) };
}

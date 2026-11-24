/**
 * Shared contract of the Your AI place (docs/specs/ai-familiar/ai-familiar_tracker.md §9).
 * Exactly as written there; each build task works against it. Code ids stay `familiar`.
 */
export type GiftKey = "knowsYou" | "activated" | "knowsYourWork";
/** `detail` / `opensWhen` are English defaults; the `*Key` fields name the `familiar.giftText.*` locale key
 *  (with `params`) that GiftChips translates them with. */
export interface GiftState {
  key: GiftKey;
  lit: boolean;
  label: string;
  detail?: string;
  detailKey?: string;
  opensWhen?: string;
  opensWhenKey?: string;
  params?: Record<string, string | number>;
}
/** One part of the prompt, for the «What your AI receives» list (`chars` is its size). */
export interface PromptPart { key: "aboutMe" | "myWork" | "aiOs"; chars: number }
export interface FamiliarState {
  gifts: GiftState[];
  prompt: string;
  version: string;
  /** The parts the prompt holds, in prompt order. */
  parts: PromptPart[];
  /** Release of the AI OS text inside the prompt, e.g. "6.0". */
  aiOsVersion: string;
  lastLearned?: string;
  loading: boolean;
}
export type ChatApp = "chatgpt" | "claude" | "gemini";

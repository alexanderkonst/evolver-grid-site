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
export interface FamiliarState { gifts: GiftState[]; prompt: string; version: string; lastLearned?: string; loading: boolean }

/**
 * Shared contract of the Your AI place (docs/specs/ai-familiar/ai-familiar_tracker.md §9).
 * Exactly as written there; each build task works against it. Code ids stay `familiar`.
 */
export type GiftKey = "knowsYou" | "activated" | "knowsYourWork";
export interface GiftState { key: GiftKey; lit: boolean; label: string; detail?: string; opensWhen?: string }
export interface FamiliarState { gifts: GiftState[]; prompt: string; version: string; lastLearned?: string; loading: boolean }
export type ChatApp = "chatgpt" | "claude" | "gemini";
export interface CompareResult { mode: "live" | "self"; plain?: string; personal?: string }

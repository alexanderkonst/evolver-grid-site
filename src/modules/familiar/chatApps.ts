import type { ChatApp } from "./types";

/**
 * The chat apps a player can take their AI into, and the address of each one's new chat.
 * The personal prompt (thousands of words) is too long to prefill through a URL, so it always
 * travels by clipboard; these addresses only open an empty chat to paste into.
 */
export const CHAT_APPS: { id: ChatApp; name: string; url: string }[] = [
  { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com/" },
  { id: "claude", name: "Claude", url: "https://claude.ai/new" },
  { id: "gemini", name: "Gemini", url: "https://gemini.google.com/app" },
];

export const DEFAULT_CHAT_APP: ChatApp = "chatgpt";

export const isChatApp = (v: unknown): v is ChatApp => CHAT_APPS.some((a) => a.id === v);

export const chatAppName = (id: ChatApp): string => CHAT_APPS.find((a) => a.id === id)?.name ?? id;

export const chatAppUrl = (id: ChatApp): string => (CHAT_APPS.find((a) => a.id === id) ?? CHAT_APPS[0]).url;

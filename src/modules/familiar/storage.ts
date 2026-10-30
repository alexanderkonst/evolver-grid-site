/**
 * What the Your AI place remembers on this device. All of it is local; nothing here is sent
 * anywhere. Every read and write is guarded, so a blocked or full storage never breaks the screen.
 */
import { DEFAULT_CHAT_APP, isChatApp } from "./chatApps";
import type { ChatApp } from "./types";

const APP_KEY = "familiar:chatApp";
const COPIED_KEY = "familiar:copiedVersion";
const RATING_KEY = "familiar:rating";
/** The question lives in sessionStorage: it survives a refresh of the tab, not a new visit. */
const QUESTION_KEY = "familiar:question";

const local = (): Storage | null => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

const session = (): Storage | null => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

const read = (s: Storage | null, key: string): string | null => {
  try {
    return s?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const write = (s: Storage | null, key: string, value: string) => {
  try {
    s?.setItem(key, value);
  } catch {
    /* storage full or blocked: the screen works without it */
  }
};

export const getChatApp = (): ChatApp => {
  const v = read(local(), APP_KEY);
  return isChatApp(v) ? v : DEFAULT_CHAT_APP;
};
export const setChatApp = (app: ChatApp) => write(local(), APP_KEY, app);

/** The prompt version the player last copied, or null if they never have. */
export const getCopiedVersion = (): string | null => read(local(), COPIED_KEY);
export const setCopiedVersion = (version: string) => write(local(), COPIED_KEY, version);

export const getRating = (): number | null => {
  const n = Number(read(local(), RATING_KEY));
  return Number.isInteger(n) && n >= 1 && n <= 10 ? n : null;
};
export const setRating = (rating: number) => write(local(), RATING_KEY, String(rating));

export const getQuestion = (): string => read(session(), QUESTION_KEY) ?? "";
export const setQuestion = (question: string) => write(session(), QUESTION_KEY, question);

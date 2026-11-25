/**
 * Mini-training 2 · what the player has done. Kept in the browser (localStorage, one entry per
 * player), like rung 1: the one shared chat thread, which buttons were sent, the saved profile,
 * and whether the person marked #7 («It knew me»). No table, no migration.
 */
import { MIRROR_AI_IS_STUB, type ThreadMessage } from "@/lib/miniTraining/mirrorAi";
import { knowsYouStepsOfModule } from "@/lib/miniTraining/knowsYouPrompts";

export type SavedProfile = { text: string; stepId: string; savedAt: string };

export type KnowsYouState = {
  thread: ThreadMessage[];
  sent: string[];
  profile: SavedProfile | null;
  /** #7: the person pasted the profile into another AI and it answered like it knows them. */
  anywhereDone: boolean;
};

/** Number of micro-modules. */
export const KNOWS_YOU_MODULES = 7;

/** #7 is not an AI card: it is done when the person marks it. */
export const ANYWHERE_STEP_ID = "7";

export const emptyKnowsYouState = (): KnowsYouState => ({ thread: [], sent: [], profile: null, anywhereDone: false });

export const knowsYouStateKey = (userId: string, stub: boolean = MIRROR_AI_IS_STUB): string =>
  `mini-training:ai-that-knows-you:v1:${stub ? "stub:" : ""}${userId}`;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const defaultStorage = (): StorageLike | null => {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
};

const isThreadMessage = (m: unknown): m is ThreadMessage =>
  !!m && typeof m === "object" &&
  ((m as ThreadMessage).role === "player" || (m as ThreadMessage).role === "ai") &&
  typeof (m as ThreadMessage).text === "string" &&
  typeof (m as ThreadMessage).stepId === "string";

export function loadKnowsYouState(userId: string, storage: StorageLike | null = defaultStorage(), stub?: boolean): KnowsYouState {
  if (!storage) return emptyKnowsYouState();
  try {
    const raw = storage.getItem(knowsYouStateKey(userId, stub));
    if (!raw) return emptyKnowsYouState();
    const parsed = JSON.parse(raw) as Partial<KnowsYouState>;
    const profile = parsed.profile;
    return {
      thread: Array.isArray(parsed.thread) ? parsed.thread.filter(isThreadMessage) : [],
      sent: Array.isArray(parsed.sent) ? parsed.sent.filter((s): s is string => typeof s === "string") : [],
      profile:
        profile && typeof profile.text === "string" && typeof profile.stepId === "string" && typeof profile.savedAt === "string"
          ? profile
          : null,
      anywhereDone: parsed.anywhereDone === true,
    };
  } catch {
    return emptyKnowsYouState();
  }
}

export function saveKnowsYouState(userId: string, state: KnowsYouState, storage: StorageLike | null = defaultStorage(), stub?: boolean): void {
  if (!storage) return;
  try {
    storage.setItem(knowsYouStateKey(userId, stub), JSON.stringify(state));
  } catch {
    /* private mode or full: the page keeps working from memory */
  }
}

/** A micro-module is done when every button on its card was sent; #7 when the person marked it. */
export function isKnowsYouModuleDone(module: number, state: Pick<KnowsYouState, "sent" | "anywhereDone">): boolean {
  if (module === 7) return state.anywhereDone;
  const steps = knowsYouStepsOfModule(module);
  return steps.length > 0 && steps.every((s) => state.sent.includes(s.id));
}

export const knowsYouModulesDone = (state: Pick<KnowsYouState, "sent" | "anywhereDone">): number =>
  Array.from({ length: KNOWS_YOU_MODULES }, (_, i) => i + 1).filter((m) => isKnowsYouModuleDone(m, state)).length;

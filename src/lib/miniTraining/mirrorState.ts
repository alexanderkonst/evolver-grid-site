/**
 * Mini-training 1 · what the player has done (issue #392).
 *
 * Kept in the browser (localStorage, one entry per player): the one shared chat thread, which
 * buttons were sent, the saved plan, and how many times #6 was used. No table, no migration.
 * The player's plan needs a real table before it can follow them across devices (see the PR).
 */
import { MIRROR_AI_IS_STUB, type ThreadMessage } from "@/lib/miniTraining/mirrorAi";
import { MAX_LINE_TAPS, stepsOfModule } from "@/lib/miniTraining/mirrorPrompts";

export type SavedPlan = { text: string; stepId: string; savedAt: string };

export type MirrorState = {
  thread: ThreadMessage[];
  /** Ids of the buttons that were sent. */
  sent: string[];
  plan: SavedPlan | null;
  /** How many times #6 was sent with a tapped line. */
  lineTaps: number;
};

export const emptyMirrorState = (): MirrorState => ({ thread: [], sent: [], plan: null, lineTaps: 0 });

/** Stub answers live under their own key, so they never leak into the thread once the AI is live. */
export const mirrorStateKey = (userId: string, stub: boolean = MIRROR_AI_IS_STUB): string =>
  `mini-training:ai-as-a-mirror:v1:${stub ? "stub:" : ""}${userId}`;

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

export function loadMirrorState(userId: string, storage: StorageLike | null = defaultStorage(), stub?: boolean): MirrorState {
  if (!storage) return emptyMirrorState();
  try {
    const raw = storage.getItem(mirrorStateKey(userId, stub));
    if (!raw) return emptyMirrorState();
    const parsed = JSON.parse(raw) as Partial<MirrorState>;
    const plan = parsed.plan;
    return {
      thread: Array.isArray(parsed.thread) ? parsed.thread.filter(isThreadMessage) : [],
      sent: Array.isArray(parsed.sent) ? parsed.sent.filter((s): s is string => typeof s === "string") : [],
      plan:
        plan && typeof plan.text === "string" && typeof plan.stepId === "string" && typeof plan.savedAt === "string"
          ? plan
          : null,
      lineTaps: typeof parsed.lineTaps === "number" && parsed.lineTaps > 0 ? Math.min(parsed.lineTaps, MAX_LINE_TAPS) : 0,
    };
  } catch {
    return emptyMirrorState();
  }
}

export function saveMirrorState(userId: string, state: MirrorState, storage: StorageLike | null = defaultStorage(), stub?: boolean): void {
  if (!storage) return;
  try {
    storage.setItem(mirrorStateKey(userId, stub), JSON.stringify(state));
  } catch {
    /* private mode or full: the page keeps working from memory */
  }
}

/** The AI's latest answer to a button, or null. */
export function lastAnswer(thread: ThreadMessage[], stepId: string): string | null {
  for (let i = thread.length - 1; i >= 0; i--) {
    if (thread[i].role === "ai" && thread[i].stepId === stepId) return thread[i].text;
  }
  return null;
}

/** A micro-module is done when every button on its card was sent. */
export function isModuleDone(module: number, sent: string[]): boolean {
  const steps = stepsOfModule(module);
  return steps.length > 0 && steps.every((s) => sent.includes(s.id));
}

export const modulesDone = (sent: string[]): number =>
  [1, 2, 3, 4, 5, 6, 7, 8].filter((m) => isModuleDone(m, sent)).length;

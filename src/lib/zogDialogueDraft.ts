/**
 * zogDialogueDraft — the unfinished Your AI dialogue, kept on this device (issue #281).
 *
 * A player who answers a question or two and then reloads, or leaves and comes back, picks up
 * where they stopped. Client only: localStorage, for guests and signed-in players alike. The
 * draft is cleared when the reveal is made (the result then lives in the reveal's own save),
 * or when the player chooses «Start over». Pure data in/out, no React, so the title screen and
 * the test share it. All storage access is guarded: private mode must never break the test.
 */

export const DIALOGUE_DRAFT_KEY = "fytt:zog-dialogue:v1";

/** A draft older than this is stale: the player starts fresh instead of resuming a forgotten chat. */
export const DIALOGUE_DRAFT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** Structural copy of the dialogue message (kept here so this file imports nothing from modules/). */
export type DraftMessage = {
  role: "ai" | "player";
  text: string;
  buttons?: { id: string; kind: string; label: string; to?: string }[];
};

export type DialogueDraft = {
  messages: DraftMessage[];
  ownAiNotes: string;
  ready: boolean;
  savedAt: number;
};

const isMessage = (m: unknown): m is DraftMessage => {
  if (!m || typeof m !== "object") return false;
  const { role, text } = m as { role?: unknown; text?: unknown };
  return (role === "ai" || role === "player") && typeof text === "string";
};

/** A draft is worth keeping once the player has answered at least once. */
export const hasPlayerAnswer = (messages: readonly DraftMessage[]): boolean =>
  messages.some((m) => m.role === "player" && m.text.trim().length > 0);

export function readDialogueDraft(now: number = Date.now()): DialogueDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DIALOGUE_DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const { messages, ownAiNotes, ready, savedAt } = parsed as Record<string, unknown>;
    if (!Array.isArray(messages) || !messages.every(isMessage)) return null;
    if (!hasPlayerAnswer(messages)) return null;
    const at = typeof savedAt === "number" && Number.isFinite(savedAt) ? savedAt : 0;
    if (now - at > DIALOGUE_DRAFT_MAX_AGE_MS) return null;
    return {
      messages,
      ownAiNotes: typeof ownAiNotes === "string" ? ownAiNotes : "",
      ready: ready === true,
      savedAt: at,
    };
  } catch {
    return null;
  }
}

/** True when an unfinished dialogue waits on this device (the title offers Continue). */
export function hasUnfinishedDialogue(): boolean {
  return readDialogueDraft() !== null;
}

/**
 * Keep the dialogue as it stands. Before the first answer there is nothing worth keeping,
 * so an empty or answer-less dialogue writes nothing (and never overwrites a real draft).
 */
export function writeDialogueDraft(messages: readonly DraftMessage[], ownAiNotes: string, ready: boolean): void {
  if (typeof window === "undefined") return;
  if (!hasPlayerAnswer(messages)) return;
  try {
    const draft: DialogueDraft = { messages: [...messages], ownAiNotes, ready, savedAt: Date.now() };
    window.localStorage.setItem(DIALOGUE_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota or private mode: the dialogue still works, it just will not resume */
  }
}

export function clearDialogueDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DIALOGUE_DRAFT_KEY);
  } catch {
    /* nothing to clear */
  }
}

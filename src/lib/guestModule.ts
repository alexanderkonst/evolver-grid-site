/**
 * Guest progress of the one module a stranger can play before they have an account.
 * Design: docs/02-strategy/game_of_being_you.md §14.1 (experience first), WP-7b (result first,
 * the account only to save).
 *
 * A guest's rating and real choice for a guest-playable step live in this browser
 * (localStorage, one JSON object). The account is asked for only at «Save». After sign-in,
 * `carryGuestProgress` writes what the guest left into `journey_victories` and
 * `module_choices` (the same rows a signed-in player writes at the Outro) and empties the
 * browser copy. First answer stands: a row the account already has is never overwritten.
 *
 * Only steps listed in `GUEST_STEP_IDS` are ever stored here; every other module still needs
 * the account, exactly as before.
 */

import { supabase } from "@/integrations/supabase/client";
import { isValidRating } from "@/data/journeyModules";
import { cleanChoiceText } from "@/data/journeyChoices";

/** Steps a guest may play start to finish. Ids are `journey_victories` / `module_choices` step ids. */
export const GUEST_STEP_IDS = ["academy-welcome"] as const;
export type GuestStepId = (typeof GUEST_STEP_IDS)[number];

export const isGuestStep = (stepId: string | null | undefined): stepId is GuestStepId =>
  !!stepId && (GUEST_STEP_IDS as readonly string[]).includes(stepId);

export const GUEST_STORAGE_KEY = "evolver:guest-modules:v1";

export type GuestStepRecord = {
  /** 1–10. */
  rating?: number;
  choice?: { text: string; at: string };
};

type GuestStore = Partial<Record<GuestStepId, GuestStepRecord>>;

const readStore = (): GuestStore => {
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: GuestStore = {};
    for (const id of GUEST_STEP_IDS) {
      const rec = (parsed as Record<string, unknown>)[id];
      if (!rec || typeof rec !== "object") continue;
      const r = rec as Record<string, unknown>;
      const clean: GuestStepRecord = {};
      if (isValidRating(r.rating)) clean.rating = r.rating;
      const c = r.choice as { text?: unknown; at?: unknown } | undefined;
      if (c && typeof c.text === "string" && typeof c.at === "string" && cleanChoiceText(c.text)) {
        clean.choice = { text: c.text, at: c.at };
      }
      out[id] = clean;
    }
    return out;
  } catch {
    return {};
  }
};

const writeStore = (store: GuestStore): boolean => {
  try {
    window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    // Private mode / quota: the guest still sees the screen, it just cannot be remembered.
    return false;
  }
};

export const readGuestStep = (stepId: GuestStepId): GuestStepRecord => readStore()[stepId] ?? {};

const patchGuestStep = (stepId: GuestStepId, patch: GuestStepRecord): boolean => {
  const store = readStore();
  store[stepId] = { ...store[stepId], ...patch };
  return writeStore(store);
};

/** First answer stands, like the table. Returns what is now stored. */
export const saveGuestRating = (stepId: GuestStepId, rating: number): number | null => {
  if (!isValidRating(rating)) return null;
  const existing = readGuestStep(stepId).rating;
  if (existing !== undefined) return existing;
  return patchGuestStep(stepId, { rating }) ? rating : null;
};

export const saveGuestChoice = (
  stepId: GuestStepId,
  rawText: string,
  now: Date = new Date(),
): { text: string; at: string } | null => {
  const text = cleanChoiceText(rawText);
  if (!text) return null;
  const existing = readGuestStep(stepId).choice;
  if (existing) return existing;
  const choice = { text, at: now.toISOString() };
  return patchGuestStep(stepId, { choice }) ? choice : null;
};

const isDuplicate = (error: { code?: string } | null) => error?.code === "23505";

/**
 * Write the guest's progress into the account, then forget it in this browser. Safe to call
 * on every visit: it does nothing without progress, and a step is only cleared once its rows
 * are in (or were already there). A failure leaves the browser copy for the next try.
 */
export async function carryGuestProgress(userId: string): Promise<void> {
  const store = readStore();
  for (const id of GUEST_STEP_IDS) {
    const rec = store[id];
    if (!rec) continue;
    let carried = true;

    if (rec.rating !== undefined) {
      // The table is absent from the generated `Database` type; same loose access as useJourneyVictory.
      const table = supabase.from("journey_victories" as never) as unknown as {
        insert: (row: { user_id: string; step_id: string; rating: number }) => PromiseLike<{
          error: { code?: string } | null;
        }>;
      };
      try {
        const { error } = await table.insert({ user_id: userId, step_id: id, rating: rec.rating });
        if (error && !isDuplicate(error)) carried = false;
      } catch {
        carried = false;
      }
    }

    if (rec.choice) {
      try {
        const { error } = await supabase
          .from("module_choices")
          .insert({ user_id: userId, step_id: id, choice_text: rec.choice.text });
        if (error && !isDuplicate(error)) carried = false;
      } catch {
        carried = false;
      }
    }

    if (carried) {
      const next = readStore();
      delete next[id];
      writeStore(next);
    }
  }
}

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cleanChoiceText, isFollowup, type Followup } from "@/data/journeyChoices";
import { isGuestStep, readGuestStep, saveGuestChoice, type GuestStepId } from "@/lib/guestModule";

/**
 * The real choice a player made at the end of a Journey module (WP-19).
 * Design: docs/02-strategy/game_of_being_you.md §15.5, §14.12.
 *
 * Rows live in `module_choices` (one per player per step; RLS: own rows only; the player may
 * insert user_id, step_id, choice_text and may update only followup and followup_at). A choice
 * is private: it is read here for the signed-in player and shown only on their own Outro,
 * House shelf and village follow-up, never to another player.
 *
 * Like the rating (useJourneyVictory), every failure on the read path (missing table,
 * network, RLS) quietly means `available: false`: the screen shows the same Outro without the
 * choice. Nothing is thrown and nothing is logged. A guest has no save file, so no choice.
 */

type QueryError = { code?: string; message?: string } | null;

export type ModuleChoice = {
  step_id: string;
  choice_text: string;
  created_at: string;
  followup: Followup | null;
  followup_at: string | null;
};

const COLUMNS = "step_id, choice_text, created_at, followup, followup_at";

export type ChoiceResult = { ok: true } | { ok: false; message: string };

const TRY_AGAIN = "It did not go through just now. Try again in a moment.";

/** Remembered for the session so a missing table is probed once, not per screen. */
let tableMissing = false;

const isMissingTable = (error: QueryError) =>
  !!error &&
  (error.code === "42P01" ||
    error.code === "PGRST205" ||
    /does not exist|schema cache|not find the table/i.test(error.message ?? ""));

const toChoice = (row: {
  step_id: string;
  choice_text: string;
  created_at: string;
  followup: string | null;
  followup_at: string | null;
}): ModuleChoice => ({
  step_id: row.step_id,
  choice_text: row.choice_text,
  created_at: row.created_at,
  followup: isFollowup(row.followup) ? row.followup : null,
  followup_at: row.followup_at,
});

/** A guest's choice for a guest-playable step, in the shape of a stored one. */
const guestChoice = (stepId: GuestStepId): ModuleChoice | null => {
  const c = readGuestStep(stepId).choice;
  return c ? { step_id: stepId, choice_text: c.text, created_at: c.at, followup: null, followup_at: null } : null;
};

/** The signed-in player's id; `known` flips once the first answer is in. */
function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  const [known, setKnown] = useState(false);

  useEffect(() => {
    let live = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!live) return;
        setUserId(data.session?.user.id ?? null);
        setKnown(true);
      })
      .catch(() => {
        if (!live) return;
        setUserId(null);
        setKnown(true);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (live) setUserId(session?.user.id ?? null);
    });
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { userId, known };
}

// ------------------------------------------------------------ one step (Outro)

export type ModuleChoiceApi = {
  /** The table answered. False while it is missing or unreadable: hide the choice. */
  available: boolean;
  /**
   * The player has a save file to record in: an account, or, for a guest-playable step
   * (src/lib/guestModule.ts), the guest's own browser. Other steps give guests no save file.
   */
  signedIn: boolean;
  /** Still finding out whether a choice exists. */
  loading: boolean;
  /** The player's choice for this step, once made. */
  choice: ModuleChoice | null;
  choose: (rawText: string) => Promise<ChoiceResult>;
};

/** Pass null to stay idle (nothing is fetched). */
export function useModuleChoice(stepId: string | null | undefined): ModuleChoiceApi {
  const { userId, known } = useUserId();
  const [available, setAvailable] = useState(!tableMissing);
  const [loading, setLoading] = useState(true);
  const [choice, setChoice] = useState<ModuleChoice | null>(null);

  useEffect(() => {
    setChoice(null);
    if (!stepId || !known) return;
    if (!userId && isGuestStep(stepId)) {
      // A guest-playable step keeps its choice in this browser until «Save» (guestModule).
      setAvailable(true);
      setChoice(guestChoice(stepId));
      setLoading(false);
      return;
    }
    if (tableMissing) {
      setAvailable(false);
      setLoading(false);
      return;
    }
    if (!userId) {
      setLoading(false);
      return;
    }
    let live = true;
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from("module_choices")
          .select(COLUMNS)
          .eq("user_id", userId)
          .eq("step_id", stepId)
          .limit(1);
        if (!live) return;
        if (error) {
          if (isMissingTable(error)) tableMissing = true;
          setAvailable(false);
          return;
        }
        setAvailable(true);
        setChoice(data?.[0] ? toChoice(data[0]) : null);
      } catch {
        if (live) setAvailable(false);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [stepId, userId, known]);

  const choose = useCallback(
    async (rawText: string): Promise<ChoiceResult> => {
      if (stepId && !userId && isGuestStep(stepId)) {
        if (!saveGuestChoice(stepId, rawText)) {
          return { ok: false, message: "Write a few words, up to 280 characters." };
        }
        setChoice(guestChoice(stepId));
        return { ok: true };
      }
      if (!stepId || !userId || !available) {
        return { ok: false, message: "Your choice can be saved once you are signed in." };
      }
      const text = cleanChoiceText(rawText);
      if (!text) return { ok: false, message: "Write a few words, up to 280 characters." };
      try {
        const { data, error } = await supabase
          .from("module_choices")
          .insert({ user_id: userId, step_id: stepId, choice_text: text })
          .select(COLUMNS)
          .single();
        if (error) {
          if (isMissingTable(error)) {
            tableMissing = true;
            setAvailable(false);
          } else if (error.code === "23505") {
            // Chosen before (another tab, a retry): the first choice stands.
            const { data: first } = await supabase
              .from("module_choices")
              .select(COLUMNS)
              .eq("user_id", userId)
              .eq("step_id", stepId)
              .limit(1);
            if (first?.[0]) {
              setChoice(toChoice(first[0]));
              return { ok: true };
            }
          }
          return { ok: false, message: TRY_AGAIN };
        }
        setChoice(toChoice(data));
        return { ok: true };
      } catch {
        return { ok: false, message: TRY_AGAIN };
      }
    },
    [stepId, userId, available],
  );

  return { available, signedIn: !!userId || (known && isGuestStep(stepId)), loading, choice, choose };
}

// ------------------------------------------------- all of a player's (shelf, village)

export type ModuleChoicesApi = {
  available: boolean;
  signedIn: boolean;
  loading: boolean;
  /** Oldest first. */
  choices: ModuleChoice[];
  /** The player's choice for one step, if any. */
  forStep: (stepId: string) => ModuleChoice | null;
  /** Record how it went. Only followup and followup_at are written. */
  answer: (stepId: string, value: Followup) => Promise<ChoiceResult>;
};

/** Every choice the signed-in player has made. Idle for guests. */
export function useModuleChoices(): ModuleChoicesApi {
  const { userId, known } = useUserId();
  const [available, setAvailable] = useState(!tableMissing);
  const [loading, setLoading] = useState(true);
  const [choices, setChoices] = useState<ModuleChoice[]>([]);

  useEffect(() => {
    setChoices([]);
    if (!known) return;
    if (tableMissing) {
      setAvailable(false);
      setLoading(false);
      return;
    }
    if (!userId) {
      setLoading(false);
      return;
    }
    let live = true;
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from("module_choices")
          .select(COLUMNS)
          .eq("user_id", userId)
          .order("created_at", { ascending: true });
        if (!live) return;
        if (error) {
          if (isMissingTable(error)) tableMissing = true;
          setAvailable(false);
          return;
        }
        setAvailable(true);
        setChoices((data ?? []).map(toChoice));
      } catch {
        if (live) setAvailable(false);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [userId, known]);

  const forStep = useCallback(
    (stepId: string) => choices.find((c) => c.step_id === stepId) ?? null,
    [choices],
  );

  const answer = useCallback(
    async (stepId: string, value: Followup): Promise<ChoiceResult> => {
      if (!userId || !available) {
        return { ok: false, message: "Your answer can be saved once you are signed in." };
      }
      if (!isFollowup(value)) return { ok: false, message: TRY_AGAIN };
      const at = new Date().toISOString();
      try {
        const { error } = await supabase
          .from("module_choices")
          .update({ followup: value, followup_at: at })
          .eq("user_id", userId)
          .eq("step_id", stepId);
        if (error) return { ok: false, message: TRY_AGAIN };
      } catch {
        return { ok: false, message: TRY_AGAIN };
      }
      setChoices((prev) =>
        prev.map((c) => (c.step_id === stepId ? { ...c, followup: value, followup_at: at } : c)),
      );
      return { ok: true };
    },
    [userId, available],
  );

  return { available, signedIn: !!userId, loading, choices, forStep, answer };
}

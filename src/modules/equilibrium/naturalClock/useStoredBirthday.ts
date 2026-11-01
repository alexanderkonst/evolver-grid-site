import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseBirthdayParts } from "./solarBattery";

export interface StoredBirthday {
  userId: string | null;
  /** "YYYY-MM-DD" or null. */
  birthday: string | null;
  loading: boolean;
  /** Re-reads after BirthdayPrompt saved. */
  refresh: () => void;
}

/**
 * The signed-in player's birthday, read-only: `equilibrium_state.birthday`
 * first, then the localStorage copy BirthdayPrompt writes
 * (`equilibrium_v2_birthday:<userId>`). Same sources as `useEquilibriumV2`,
 * without loading the whole Equilibrium state. Writes nothing.
 */
export function useStoredBirthday(): StoredBirthday {
  const [userId, setUserId] = useState<string | null>(null);
  const [birthday, setBirthday] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const alive = useRef(true);

  const load = useCallback(async (uid: string | null) => {
    if (!uid) {
      if (alive.current) {
        setBirthday(null);
        setLoading(false);
      }
      return;
    }
    // `equilibrium_state.birthday` is not in the generated types (same cast as useEquilibriumV2).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eqAny = supabase as any;
    let fromServer: string | null = null;
    try {
      const { data } = await eqAny
        .from("equilibrium_state")
        .select("birthday")
        .eq("user_id", uid)
        .maybeSingle();
      fromServer = (data?.birthday as string | null | undefined) ?? null;
    } catch {
      fromServer = null;
    }
    let cached: string | null = null;
    try {
      cached = window.localStorage.getItem(`equilibrium_v2_birthday:${uid}`);
    } catch {
      cached = null;
    }
    const pick = [fromServer, cached].find((b) => parseBirthdayParts(b)) ?? null;
    if (alive.current) {
      setBirthday(pick);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      if (!alive.current) return;
      setUserId(uid);
      void load(uid);
    });
    return () => {
      alive.current = false;
    };
  }, [load]);

  const refresh = useCallback(() => {
    void load(userId);
  }, [load, userId]);

  return { userId, birthday, loading, refresh };
}

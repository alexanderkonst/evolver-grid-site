/**
 * `litSeen` with the player's save. Signed in: the record lives in `game_profiles.first_time_actions`
 * (`instrument_lit_<element>: true`, the same flat record the XP service already keeps), mirrored to
 * localStorage so the instrument knows at first paint. Signed out: localStorage only. The rules
 * (parse, merge, mark, the key names) are the pure functions in `state.ts`.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ElementKey } from "@/data/villagePlaces";
import {
  litSeenFromActions,
  litSeenToActions,
  markLitSeen,
  mergeLitSeen,
  readLitSeen,
  writeLitSeen,
  type LitSeen,
} from "@/lib/instrument/state";

const readRemote = async (profileId: string): Promise<LitSeen | null> => {
  const { data, error } = await supabase.from("game_profiles").select("first_time_actions").eq("id", profileId).maybeSingle();
  if (error || !data) return null;
  return litSeenFromActions(data.first_time_actions);
};

/** Merge into the existing record: other first-time actions are never dropped. */
const writeRemote = async (profileId: string, seen: LitSeen): Promise<void> => {
  const { data, error } = await supabase.from("game_profiles").select("first_time_actions").eq("id", profileId).maybeSingle();
  if (error || !data) return;
  const current = (data.first_time_actions as Record<string, boolean> | null) ?? {};
  await supabase
    .from("game_profiles")
    .update({ first_time_actions: { ...current, ...litSeenToActions(seen) } })
    .eq("id", profileId);
};

/**
 * `[litSeen, markSeen]` for one player. `markSeen(element)` is idempotent; it persists at once to
 * localStorage and, when signed in, to the profile (best effort: a failed write never blocks the player).
 */
export const useLitSeen = (ownerId: string | null): readonly [LitSeen, (element: ElementKey) => void] => {
  const [seen, setSeen] = useState<LitSeen>(() => readLitSeen(ownerId));
  const seenRef = useRef(seen);
  seenRef.current = seen;

  useEffect(() => {
    const local = readLitSeen(ownerId);
    seenRef.current = local;
    setSeen(local);
    if (!ownerId) return;
    let cancelled = false;
    void readRemote(ownerId)
      .then((remote) => {
        if (cancelled || !remote) return;
        const merged = mergeLitSeen(seenRef.current, remote);
        writeLitSeen(ownerId, merged);
        seenRef.current = merged;
        setSeen(merged);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  const markSeen = useCallback(
    (element: ElementKey) => {
      const next = markLitSeen(seenRef.current, element);
      if (next === seenRef.current) return;
      seenRef.current = next;
      setSeen(next);
      writeLitSeen(ownerId, next);
      if (ownerId) void writeRemote(ownerId, next).catch(() => {});
    },
    [ownerId],
  );

  return [seen, markSeen] as const;
};

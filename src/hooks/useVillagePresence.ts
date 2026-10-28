import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { VILLAGE_PLACES } from "@/data/villagePlaces";

/**
 * Village presence (WP-21): the other players who are here now, as anonymous lights.
 * Design: docs/02-strategy/game_of_being_you.md §15.2.
 *
 * Supabase Realtime Presence on one channel for the village. Nothing is stored and
 * nothing is tracked: the payload is only
 *   { place_key, session_key (random per tab, never the user id), hue?, first_name? }
 * and `first_name` is sent only for a player who turned on «Show my first name».
 * No user id, email, photo or history is broadcast or written, and nothing here
 * links to a profile.
 *
 * On by default for everyone, guests included. A signed-in player's switches are
 * `game_profiles.village_presence_on` / `village_show_name`; a guest's presence
 * switch lives in localStorage. Every failure (columns missing, realtime down)
 * quietly means «defaults» or «no lights»: nothing is thrown and nothing is logged.
 */

export type PresencePayload = {
  place_key: string;
  session_key: string;
  hue?: number;
  first_name?: string;
};

/** One other player, as the screen may know them: a spot, a color, maybe a first name. */
export type PresenceLight = {
  sessionKey: string;
  hue: number | null;
  firstName: string | null;
};

export type PresenceByPlace = Record<string, PresenceLight[]>;

/** The map has no place of its own; a player standing on it is visible nowhere. */
export const MAP_PLACE_KEY = "map";

const CHANNEL = "village:main";
const THROTTLE_MS = 5000;
const MAX_LIGHTS_PER_PLACE = 12;
const MAX_NAME_LENGTH = 24;
const GUEST_OFF_KEY = "fytt:village-presence-off";

const PLACE_KEYS = new Set<string>([...VILLAGE_PLACES.map((p) => p.key), MAP_PLACE_KEY]);

// ----------------------------------------------------------------- helpers

const newSessionKey = (): string => {
  try {
    return window.crypto.randomUUID();
  } catch {
    return `s${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }
};

/** First word of a name, control characters removed; null when nothing is left. */
export const firstNameOf = (name: string | null | undefined): string | null => {
  const printable = Array.from(name ?? "", (ch) => {
    const code = ch.charCodeAt(0);
    return code < 32 || code === 127 ? " " : ch;
  }).join("");
  const word = printable.trim().split(/\s+/)[0]?.slice(0, MAX_NAME_LENGTH);
  return word ? word : null;
};

/** Hue (0–359) of a CSS `#rgb`, `#rrggbb` or `hsl(...)` color; null for anything else. */
export const hueFromColor = (color: string | null | undefined): number | null => {
  if (!color) return null;
  const value = color.trim();
  const hsl = /^hsla?\(\s*(-?\d+(?:\.\d+)?)/i.exec(value);
  if (hsl) return Math.round(((Number(hsl[1]) % 360) + 360) % 360) % 360;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (!hex) return null;
  const h = hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) return null; // grey: no hue, the skin's accent is the honest light
  const sector = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round(((sector * 60) + 360) % 360) % 360;
};

/** Everything arriving from the channel is untrusted: keep only what we can draw. */
const readEntry = (raw: unknown): (PresenceLight & { placeKey: string }) | null => {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  if (typeof e.place_key !== "string" || !PLACE_KEYS.has(e.place_key)) return null;
  if (typeof e.session_key !== "string" || e.session_key.length === 0 || e.session_key.length > 64) return null;
  const hue = typeof e.hue === "number" && Number.isFinite(e.hue) ? Math.round(((e.hue % 360) + 360) % 360) % 360 : null;
  const firstName = typeof e.first_name === "string" ? firstNameOf(e.first_name) : null;
  return { placeKey: e.place_key, sessionKey: e.session_key, hue, firstName };
};

const lightsFrom = (channel: RealtimeChannel, ownKey: string): PresenceByPlace => {
  const out: PresenceByPlace = {};
  const seen = new Set<string>();
  for (const entries of Object.values(channel.presenceState() as Record<string, unknown[]>)) {
    for (const raw of entries) {
      const entry = readEntry(raw);
      if (!entry || entry.sessionKey === ownKey || seen.has(entry.sessionKey)) continue;
      seen.add(entry.sessionKey);
      (out[entry.placeKey] ??= []).push({
        sessionKey: entry.sessionKey,
        hue: entry.hue,
        firstName: entry.firstName,
      });
    }
  }
  for (const key of Object.keys(out)) {
    out[key].sort((a, b) => (a.sessionKey < b.sessionKey ? -1 : 1));
    out[key] = out[key].slice(0, MAX_LIGHTS_PER_PLACE);
  }
  return out;
};

// ------------------------------------------------------------------ prefs

export type VillagePresencePrefs = {
  /** False until the switches are read; nothing is shown or sent before then. */
  ready: boolean;
  signedIn: boolean;
  /** «Show me in the village». Default on. */
  presenceOn: boolean;
  /** «Show my first name in the village». Default off; always off for guests. */
  showName: boolean;
  setPresenceOn: (next: boolean) => Promise<boolean>;
  setShowName: (next: boolean) => Promise<boolean>;
};

const readGuestOff = (): boolean => {
  try {
    return window.localStorage.getItem(GUEST_OFF_KEY) === "1";
  } catch {
    return false;
  }
};

const writeGuestOff = (off: boolean) => {
  try {
    if (off) window.localStorage.setItem(GUEST_OFF_KEY, "1");
    else window.localStorage.removeItem(GUEST_OFF_KEY);
  } catch {
    // storage unavailable: the switch holds for this visit only
  }
};

/** The player's two switches. Missing columns or an unreadable row mean the defaults. */
export function useVillagePresencePrefs(): VillagePresencePrefs {
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionRead, setSessionRead] = useState(false);
  const [rowRead, setRowRead] = useState(false);
  const [presenceOn, setPresenceOnState] = useState(true);
  const [showName, setShowNameState] = useState(false);

  useEffect(() => {
    let live = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!live) return;
        setUserId(data.session?.user.id ?? null);
        setSessionRead(true);
      })
      .catch(() => {
        if (!live) return;
        setUserId(null);
        setSessionRead(true);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (live) setUserId(session?.user.id ?? null);
    });
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionRead) return;
    if (!userId) {
      setPresenceOnState(!readGuestOff());
      setShowNameState(false);
      setRowRead(true);
      return;
    }
    let live = true;
    setRowRead(false);
    (async () => {
      let on = true;
      let name = false;
      try {
        const { data, error } = await supabase
          .from("game_profiles")
          .select("village_presence_on, village_show_name")
          .eq("user_id", userId)
          .order("created_at", { ascending: true })
          .limit(1);
        if (!error) {
          const row = data?.[0] as { village_presence_on?: boolean | null; village_show_name?: boolean | null } | undefined;
          on = row?.village_presence_on !== false;
          name = row?.village_show_name === true;
        }
      } catch {
        // defaults
      }
      if (!live) return;
      setPresenceOnState(on);
      setShowNameState(name);
      setRowRead(true);
    })();
    return () => {
      live = false;
    };
  }, [sessionRead, userId]);

  const save = useCallback(
    async (column: "village_presence_on" | "village_show_name", next: boolean): Promise<boolean> => {
      if (!userId) return false;
      try {
        const { error } = await supabase
          .from("game_profiles")
          .update({ [column]: next } as never)
          .eq("user_id", userId);
        return !error;
      } catch {
        return false;
      }
    },
    [userId],
  );

  const setPresenceOn = useCallback(
    async (next: boolean) => {
      const prev = presenceOn;
      setPresenceOnState(next); // optimistic: the light goes the moment it is switched
      if (!userId) {
        writeGuestOff(!next);
        return true;
      }
      const ok = await save("village_presence_on", next);
      if (!ok) setPresenceOnState(prev);
      return ok;
    },
    [presenceOn, userId, save],
  );

  const setShowName = useCallback(
    async (next: boolean) => {
      if (!userId) return false; // a guest has no name to show
      const prev = showName;
      setShowNameState(next);
      const ok = await save("village_show_name", next);
      if (!ok) setShowNameState(prev);
      return ok;
    },
    [showName, userId, save],
  );

  return {
    ready: sessionRead && rowRead,
    signedIn: !!userId,
    presenceOn,
    showName: !!userId && showName,
    setPresenceOn,
    setShowName,
  };
}

// ------------------------------------------------------------------- hook

type Options = {
  /** Where this tab is: a place key, or MAP_PLACE_KEY on the map. */
  placeKey: string;
  /** Join the channel and see others. False until the switches are read. */
  listen: boolean;
  /** Appear to others. False when the player switched presence off. */
  appear: boolean;
  /** Color of this player's light, if known. */
  hue?: number | null;
  /** Sent only when the player opted in to showing their first name. */
  firstName?: string | null;
};

/** The other players' lights, by place. Empty until the channel is joined. */
export function useVillagePresence({ placeKey, listen, appear, hue, firstName }: Options): PresenceByPlace {
  const [sessionKey] = useState(newSessionKey);
  const [others, setOthers] = useState<PresenceByPlace>({});
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState !== "hidden",
  );
  const lastSent = useRef(0);

  // What is sent, and nothing else. A name goes out only when the caller passes one.
  const payload = useMemo<PresencePayload>(() => {
    const p: PresencePayload = { place_key: placeKey, session_key: sessionKey };
    if (typeof hue === "number") p.hue = hue;
    if (firstName) p.first_name = firstName;
    return p;
  }, [placeKey, sessionKey, hue, firstName]);

  // A hidden tab leaves; coming back rejoins.
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  // Join the village channel (listening needs no tracking), leave on unmount.
  useEffect(() => {
    if (!listen) return;
    let ch: RealtimeChannel | null = null;
    let live = true;
    try {
      ch = supabase.channel(CHANNEL, { config: { presence: { key: sessionKey } } });
      const refresh = () => {
        if (live && ch) setOthers(lightsFrom(ch, sessionKey));
      };
      ch.on("presence", { event: "sync" }, refresh).subscribe((status) => {
        if (live && status === "SUBSCRIBED") setChannel(ch);
      });
    } catch {
      return;
    }
    return () => {
      live = false;
      setChannel(null);
      setOthers({});
      lastSent.current = 0;
      if (ch) void supabase.removeChannel(ch).catch(() => undefined);
    };
  }, [listen, sessionKey]);

  // Appear: track the payload, at most once per THROTTLE_MS. Disappearing is immediate.
  useEffect(() => {
    if (!channel) return;
    if (!appear || !visible) {
      lastSent.current = 0;
      void channel.untrack().catch(() => undefined);
      return;
    }
    const send = () => {
      lastSent.current = Date.now();
      void channel.track(payload).catch(() => undefined);
    };
    const wait = lastSent.current + THROTTLE_MS - Date.now();
    if (wait <= 0) {
      send();
      return;
    }
    const timer = window.setTimeout(send, wait);
    return () => window.clearTimeout(timer);
  }, [channel, appear, visible, payload]);

  return others;
}

/**
 * SkinContext — Day 47 very-late-night (Sasha).
 *
 * Two-skin system. Changes `<html data-skin="...">` attribute and persists
 * the choice in localStorage. All styling is token-based via CSS custom
 * properties in `src/index.css` — this context only manages the switch.
 *
 * Usage:
 *   <SkinProvider>              // once, near the app root
 *     …rest of app…
 *   </SkinProvider>
 *
 *   const { skin, setSkin } = useSkin();  // from any component
 *
 * Components that want to be skin-aware read from `var(--skin-*)` tokens
 * via inline styles. Components that are NOT yet skin-aware simply keep
 * their hardcoded colors — they render as Aurora regardless of skin.
 * That's deliberate: it lets us migrate progressively without risk.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { initialSkinScope } from "@/lib/skinScope";
import { supabase } from "@/integrations/supabase/client";

// Day 91 (Sasha 2026-06-09): the two first-class platform themes got
// their real names — "lapis" (light default, navy-and-gold-on-cream,
// the blue stone veined with gold) and "aurum" (dark, gold-on-near-
// black; formerly the route-scoped "darktheme" preview). Legacy slugs
// stored in localStorage are migrated on read (see getPersistedSkin).
export type Skin = "lapis" | "navy-gold" | "network-school" | "karime" | "daouniverse" | "planetir" | "aurum" | "techstars";

interface SkinContextValue {
  skin: Skin;
  setSkin: (s: Skin) => void;
  /**
   * Pushes a temporary skin override (e.g. /preview/navy-gold forces
   * navy-gold while mounted). Returns a cleanup fn that restores the
   * prior skin.
   */
  pushTemporarySkin: (s: Skin) => () => void;
}

const STORAGE_KEY = "app-skin";
const VALID_SKINS: Skin[] = ["lapis", "navy-gold", "network-school", "karime", "daouniverse", "planetir", "aurum", "techstars"];

/** One-time slug migration for choices persisted before the Day 91
 *  rename. Without this, the VALID_SKINS gate would silently discard
 *  stored "darktheme" and the user's dark choice would fall back to
 *  light. The same map is inlined in index.html's pre-paint script —
 *  keep both in sync. */
const LEGACY_SKIN_MIGRATIONS: Record<string, Skin> = {
  aurora: "lapis",
  darktheme: "aurum",
};

/** Reads the user's persisted skin (with legacy-slug migration),
 *  ignoring any route-scoped temporary override. Exported so surfaces
 *  like PreviewBanner's Exit can restore the user's actual choice
 *  instead of hard-resetting to the default. */
export const getPersistedSkin = (): Skin => {
  if (typeof window === "undefined") return "lapis";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const stored = raw && LEGACY_SKIN_MIGRATIONS[raw] ? LEGACY_SKIN_MIGRATIONS[raw] : raw;
    if (stored && VALID_SKINS.includes(stored as Skin)) {
      if (raw !== stored) {
        try {
          window.localStorage.setItem(STORAGE_KEY, stored);
        } catch {
          // ignore — migration retries next read
        }
      }
      return stored as Skin;
    }
  } catch {
    // localStorage unavailable (e.g. private mode) — fall through.
  }
  return "lapis";
};

const readStoredSkin = getPersistedSkin;

const applySkinToDocument = (skin: Skin) => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.skin = skin;
};

/** Only the two first-class themes follow the person across devices.
 *  White-label demo skins are route-scoped and never sync; navy-gold
 *  is an internal preview. Day 91 (Sasha 2026-06-10). */
const SYNCABLE_SKINS: ReadonlyArray<Skin> = ["lapis", "aurum"];

/** Fire-and-forget: persist the choice to the user's profile so it
 *  follows them across devices. Guests no-op (localStorage covers the
 *  device). Errors swallowed deliberately: if the column migration
 *  hasn't applied yet or the network is down, the local persistence
 *  path stands and the next successful toggle re-syncs. */
const syncSkinToProfile = async (next: Skin) => {
  if (!SYNCABLE_SKINS.includes(next)) return;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    await (supabase as any)
      .from("game_profiles")
      .update({ preferred_skin: next } as never)
      .eq("user_id", session.user.id);
  } catch {
    // offline / migration pending — silent, local choice stands
  }
};

const SkinContext = createContext<SkinContextValue>({
  skin: "lapis",
  setSkin: () => {},
  pushTemporarySkin: () => () => {},
});

export const SkinProvider = ({ children }: { children: ReactNode }) => {
  // Day 91: initial state is seeded from the route scope when one is
  // active (/aurum, /ns, /planetir, …). Previously it started from the
  // PERSISTED skin, so on scoped routes the provider's mount effect
  // would re-apply the stale persisted value post-paint (after the
  // child ScopeLock had already pushed the scope skin) — a momentary
  // attr flip-flop that becomes a visible dark↔light blink once dark
  // is persistable. Seeding from the scope kills the flip-flop.
  const [skin, setSkinState] = useState<Skin>(
    () => (initialSkinScope?.skin as Skin | undefined) ?? readStoredSkin()
  );

  // The "user's choice" — the skin they'd have if no route scope or
  // /preview push was forcing an override. Used to restore after a
  // temporary override. Deliberately read from storage (NOT from the
  // scope-seeded state above) so the restore path returns to the
  // user's actual persisted theme.
  const persistedSkinRef = useRef<Skin>(readStoredSkin());

  // Apply to <html> whenever skin changes
  useEffect(() => {
    applySkinToDocument(skin);
  }, [skin]);

  // Day 91 (Sasha 2026-06-10): person-level theme reconcile. On load /
  // sign-in, read `game_profiles.preferred_skin`:
  //   - remote choice exists and differs from local → remote wins
  //     (the user's latest cross-device choice), cache it locally, and
  //     apply unless a route scope owns the paint.
  //   - remote is NULL but this device holds an explicit choice (the
  //     localStorage key exists) → push the local choice up, so users
  //     who picked a theme before this feature shipped get synced on
  //     their next visit.
  useEffect(() => {
    let cancelled = false;

    const reconcile = async (userId: string) => {
      try {
        const { data } = await (supabase as any)
          .from("game_profiles")
          .select("preferred_skin")
          .eq("user_id", userId)
          .maybeSingle();
        if (cancelled) return;
        const remote = (data as { preferred_skin?: string | null } | null)
          ?.preferred_skin;
        if (remote && SYNCABLE_SKINS.includes(remote as Skin)) {
          if (remote !== getPersistedSkin()) {
            persistedSkinRef.current = remote as Skin;
            try {
              window.localStorage.setItem(STORAGE_KEY, remote);
            } catch {
              // ignore
            }
            // Route scopes (/aurum, /ns, …) own the paint for the whole
            // SPA session — update only the persisted layer there.
            if (!initialSkinScope) setSkinState(remote as Skin);
          }
          return;
        }
        // Remote empty: push up this device's explicit choice, if any.
        let hasExplicitLocal = false;
        try {
          hasExplicitLocal = window.localStorage.getItem(STORAGE_KEY) !== null;
        } catch {
          // ignore
        }
        if (hasExplicitLocal) void syncSkinToProfile(getPersistedSkin());
      } catch {
        // column migration pending / offline — local persistence stands
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session?.user?.id) void reconcile(session.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user?.id) {
          void reconcile(session.user.id);
        }
      }
    );
    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const setSkin = useCallback((next: Skin) => {
    persistedSkinRef.current = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    setSkinState(next);
    // Person-level sync — fire-and-forget (see syncSkinToProfile).
    void syncSkinToProfile(next);
  }, []);

  const pushTemporarySkin = useCallback((next: Skin): (() => void) => {
    // Don't clobber persistedSkinRef — this is a temporary push.
    setSkinState(next);
    applySkinToDocument(next);
    return () => {
      // Restore the user's persisted skin
      setSkinState(persistedSkinRef.current);
      applySkinToDocument(persistedSkinRef.current);
    };
  }, []);

  return (
    <SkinContext.Provider value={{ skin, setSkin, pushTemporarySkin }}>
      {children}
    </SkinContext.Provider>
  );
};

export const useSkin = (): SkinContextValue => useContext(SkinContext);

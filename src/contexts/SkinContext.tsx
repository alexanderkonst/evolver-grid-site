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

  const setSkin = useCallback((next: Skin) => {
    persistedSkinRef.current = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    setSkinState(next);
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

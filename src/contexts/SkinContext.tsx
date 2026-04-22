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

export type Skin = "aurora" | "navy-gold";

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
const VALID_SKINS: Skin[] = ["aurora", "navy-gold"];

const readStoredSkin = (): Skin => {
  if (typeof window === "undefined") return "aurora";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_SKINS.includes(stored as Skin)) return stored as Skin;
  } catch {
    // localStorage unavailable (e.g. private mode) — fall through.
  }
  return "aurora";
};

const applySkinToDocument = (skin: Skin) => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.skin = skin;
};

const SkinContext = createContext<SkinContextValue>({
  skin: "aurora",
  setSkin: () => {},
  pushTemporarySkin: () => () => {},
});

export const SkinProvider = ({ children }: { children: ReactNode }) => {
  const [skin, setSkinState] = useState<Skin>(() => readStoredSkin());

  // The "user's choice" — the skin they'd have if no /preview route was
  // forcing an override. Used to restore after a temporary override.
  const persistedSkinRef = useRef<Skin>(skin);

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

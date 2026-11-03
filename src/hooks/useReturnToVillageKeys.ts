import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  VILLAGE_MAP_PATH,
  isModalOpen,
  isTypingTarget,
  shouldReturnToVillage,
} from "@/lib/returnToVillage";

/**
 * M and Esc return to the village map from any game screen (village-as-dashboard step 1).
 * Mounted once at the app root. Never while typing; never over an open dialog, sheet or the
 * phone menu (Esc closes that first); never on the map itself. See shouldReturnToVillage.
 */
export const useReturnToVillageKeys = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const go = shouldReturnToVillage({
        key: e.key,
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey,
        defaultPrevented: e.defaultPrevented,
        repeat: e.repeat,
        typing: isTypingTarget(document.activeElement),
        modalOpen: isModalOpen(document),
        pathname,
      });
      if (!go) return;
      e.preventDefault();
      navigate(VILLAGE_MAP_PATH);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pathname, navigate]);
};

/** Renders nothing; lets the hook live inside the router. */
export const ReturnToVillageKeys = () => {
  useReturnToVillageKeys();
  return null;
};

export default useReturnToVillageKeys;

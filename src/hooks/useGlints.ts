import { useCallback, useEffect, useState } from "react";
import type { ElementKey } from "@/data/villagePlaces";
import { GLINT_EVENT, clearGlint, glintStorageKey, readGlints, writeGlints, type Glints } from "@/lib/instrument/glint";

/**
 * `[glints, clear]` for one player: the bodies whose face changed since they were here. Your House
 * writes them (`useSinceYouWereHere`); the instrument reads them and clears a body's glint when its
 * face is opened. Same document (the House and the instrument share a page) is heard through
 * `GLINT_EVENT`; another tab through the `storage` event. Storage that is unavailable means no glint.
 */
export const useGlints = (ownerId: string | null): readonly [Glints, (element: ElementKey) => void] => {
  const [glints, setGlints] = useState<Glints>(() => readGlints(ownerId));

  useEffect(() => {
    const sync = () => setGlints(readGlints(ownerId));
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === glintStorageKey(ownerId)) sync();
    };
    window.addEventListener(GLINT_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(GLINT_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, [ownerId]);

  const clear = useCallback(
    (element: ElementKey) => {
      // Read the stored record, not the render's: the House may have written since.
      const stored = readGlints(ownerId);
      const next = clearGlint(stored, element);
      if (next !== stored) writeGlints(ownerId, next);
      setGlints((g) => clearGlint(g, element));
    },
    [ownerId],
  );

  return [glints, clear] as const;
};

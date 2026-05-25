/**
 * PlanetirScopeLock — forces the `planetir` skin while mounted.
 *
 * White-label deployment (2026-05-25, Sasha): mounted at the App root
 * whenever the initial URL is under `/planetir/*`. The skin is pushed
 * via `pushTemporarySkin` so it does NOT persist to localStorage —
 * leaving `/planetir` (full page reload to a non-/planetir URL)
 * restores the user's actual persisted skin.
 *
 * Visual register mirrors planetir.org: forest-mystic regenerative,
 * Lexend display (rounded geometric grotesque) + Inter body,
 * white-pill CTA on dark forest.
 *
 * See also: `src/index.css` `[data-skin="planetir"]` token block,
 * App.tsx SKIN_PREFIXES table, `docs/02-strategy/white_label_strategy.md`.
 */
import { useEffect } from "react";
import { useSkin } from "@/contexts/SkinContext";

const PlanetirScopeLock = () => {
  const { pushTemporarySkin } = useSkin();
  useEffect(() => pushTemporarySkin("planetir"), [pushTemporarySkin]);
  return null;
};

export default PlanetirScopeLock;

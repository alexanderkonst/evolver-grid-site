/**
 * DaouniverseScopeLock — forces the `daouniverse` skin while mounted.
 *
 * White-label deployment (2026-05-25, Sasha): mounted at the App root
 * whenever the initial URL is under `/daouniverse/*`. The skin is pushed
 * via `pushTemporarySkin` so it does NOT persist to localStorage —
 * leaving `/daouniverse` (full page reload to a non-/daouniverse URL)
 * restores the user's actual persisted skin.
 *
 * Visual register mirrors latamimpact.io: forest-green editorial,
 * gold pyramid mark, Playfair Display display + Inter body.
 *
 * See also: `src/index.css` `[data-skin="daouniverse"]` token block,
 * App.tsx SKIN_PREFIXES table, `docs/02-strategy/white_label_strategy.md`.
 */
import { useEffect } from "react";
import { useSkin } from "@/contexts/SkinContext";

const DaouniverseScopeLock = () => {
  const { pushTemporarySkin } = useSkin();
  useEffect(() => pushTemporarySkin("daouniverse"), [pushTemporarySkin]);
  return null;
};

export default DaouniverseScopeLock;

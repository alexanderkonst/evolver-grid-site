/**
 * NSScopeLock — forces the `network-school` skin while mounted.
 *
 * White-label demo (2026-05-18, Sasha): mounted at the App root
 * whenever the initial URL is under `/ns/*`. The skin is pushed
 * via `pushTemporarySkin` so it does NOT persist to localStorage —
 * leaving `/ns` (full page reload to a non-/ns URL) restores the
 * user's actual persisted skin.
 *
 * See also: `src/index.css` `[data-skin="network-school"]` token block,
 * App.tsx basename detection, `docs/02-strategy/white_label_strategy.md`.
 */
import { useEffect } from "react";
import { useSkin } from "@/contexts/SkinContext";

const NSScopeLock = () => {
  const { pushTemporarySkin } = useSkin();
  useEffect(() => pushTemporarySkin("network-school"), [pushTemporarySkin]);
  return null;
};

export default NSScopeLock;

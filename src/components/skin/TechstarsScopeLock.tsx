/**
 * TechstarsScopeLock — forces the `techstars` skin while mounted.
 *
 * Day 91 (Sasha 2026-06-08): mounted at the App root whenever the
 * initial URL is under `/techstars/*`. The skin is pushed via
 * `pushTemporarySkin` so it does NOT persist to localStorage —
 * leaving `/techstars` (full page reload to a non-/techstars URL)
 * restores the user's actual persisted skin.
 *
 * Techstars editorial register: bold sans (Inter near-match for
 * Suisse Intl) on photographic Mux video bg, bright Techstars-green
 * primary CTA (#3DCC4A), white wordmark + green underscore brand mark.
 *
 * See also: `src/index.css` `[data-skin="techstars"]` token block,
 * App.tsx SKIN_PREFIXES table, `docs/03-playbooks/skin_creation_playbook.md`.
 */
import { useEffect } from "react";
import { useSkin } from "@/contexts/SkinContext";

const TechstarsScopeLock = () => {
  const { pushTemporarySkin } = useSkin();
  useEffect(() => pushTemporarySkin("techstars"), [pushTemporarySkin]);
  return null;
};

export default TechstarsScopeLock;

/**
 * AurumScopeLock — forces the `aurum` skin while mounted.
 *
 * Day 88 (Sasha 2026-05-30): born as DarkthemeScopeLock for the
 * route-scoped dark-theme preview at /darktheme/*.
 * Day 91 (Sasha 2026-06-09): renamed with the skin's graduation to
 * the first-class "Aurum" theme (sister to Lapis, the light default).
 * Mounted at the App root whenever the initial URL is under /aurum/*
 * or the legacy alias /darktheme/*. The skin is pushed via
 * `pushTemporarySkin` so it does NOT persist to localStorage —
 * leaving the scope (full page reload to a non-prefixed URL) restores
 * the user's actual persisted theme. Users who want Aurum everywhere
 * pick it in Settings → Appearance (or the rail toggle), which
 * persists via `setSkin`.
 *
 * See also: `src/index.css` `[data-skin="aurum"]` token block,
 * `src/lib/skinScope.ts` SKIN_PREFIXES table,
 * `docs/03-playbooks/skin_creation_playbook.md`.
 */
import { useEffect } from "react";
import { useSkin } from "@/contexts/SkinContext";

const AurumScopeLock = () => {
  const { pushTemporarySkin } = useSkin();
  useEffect(() => pushTemporarySkin("aurum"), [pushTemporarySkin]);
  return null;
};

export default AurumScopeLock;

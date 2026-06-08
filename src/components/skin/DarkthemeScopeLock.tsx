/**
 * DarkthemeScopeLock — forces the `darktheme` skin while mounted.
 *
 * Day 88 (Sasha 2026-05-30): mounted at the App root whenever the
 * initial URL is under `/darktheme/*`. The skin is pushed via
 * `pushTemporarySkin` so it does NOT persist to localStorage — leaving
 * `/darktheme` (full page reload to a non-/darktheme URL) restores the
 * user's actual persisted skin.
 *
 * Editorial Noir register: deep near-black bg, warm cream text, warm
 * amber accents. Aurora's voice in its dark register. Same Cormorant
 * Garamond display + Montserrat body, no new font import needed.
 *
 * First production skin AUTHORED FROM SCRATCH (no source brand to mirror).
 * Aesthetic is the platform's canonical dark theme — sister to Aurora.
 *
 * See also: `src/index.css` `[data-skin="darktheme"]` token block,
 * App.tsx SKIN_PREFIXES table, `docs/03-playbooks/skin_creation_playbook.md`.
 */
import { useEffect } from "react";
import { useSkin } from "@/contexts/SkinContext";

const DarkthemeScopeLock = () => {
  const { pushTemporarySkin } = useSkin();
  useEffect(() => pushTemporarySkin("darktheme"), [pushTemporarySkin]);
  return null;
};

export default DarkthemeScopeLock;

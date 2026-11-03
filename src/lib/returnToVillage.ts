import { pathUsesLayoutShell } from "@/lib/shellRoutes";

/**
 * Return to the village (village-as-dashboard, step 1, Sasha 2026-11-03).
 *
 * The emblem of the «YOU be original» logo is the moon medallion: from any game screen it
 * leads back to the village map. M or Esc do the same from the keyboard. Pure helpers only;
 * the medallion is src/components/game/MoonMedallion.tsx, the keys useReturnToVillageKeys.
 */

/** Where the medallion leads: the village map. */
export const VILLAGE_MAP_PATH = "/village";

/**
 * A game screen: everything inside the game shell (rail + panes), the village and its places,
 * and the Top Talent test (the Entry Portal's inside). The title screen ("/") is not one.
 */
export const isGameScreen = (pathname: string): boolean =>
  pathname === VILLAGE_MAP_PATH ||
  pathname.startsWith(`${VILLAGE_MAP_PATH}/`) ||
  pathname === "/game" ||
  pathname.startsWith("/game/") ||
  pathname.startsWith("/zone-of-genius") ||
  pathUsesLayoutShell(pathname);

/** True for the village map itself (the medallion is home there; M / Esc do nothing). */
export const isVillageMap = (pathname: string): boolean =>
  pathname === VILLAGE_MAP_PATH || pathname === `${VILLAGE_MAP_PATH}/`;

/** Minimal shape of the key event and the page this decision reads, so it can be tested. */
export type ReturnKeyInput = {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  defaultPrevented?: boolean;
  repeat?: boolean;
  /** The focused element takes text (input, textarea, select, contenteditable). */
  typing: boolean;
  /** A dialog, sheet or drawer is open: Esc belongs to it first. */
  modalOpen: boolean;
  pathname: string;
};

/**
 * Should this key press take the player back to the village map?
 * M (or «м», the same key on a Russian layout) or Esc; never while typing, never over a modal
 * (Esc closes the modal first), never with a modifier, never on the map itself.
 */
export const shouldReturnToVillage = (e: ReturnKeyInput): boolean => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented || e.repeat) return false;
  if (e.typing || e.modalOpen) return false;
  if (!isGameScreen(e.pathname) || isVillageMap(e.pathname)) return false;
  const k = e.key.toLowerCase();
  // A village place already answers Esc itself (Village.tsx); leave it that one press.
  if (k === "escape") return !e.pathname.startsWith(`${VILLAGE_MAP_PATH}/`);
  return !e.shiftKey && (k === "m" || k === "м");
};

const NON_TEXT_INPUTS = ["button", "checkbox", "radio", "range", "submit", "reset", "color", "file", "image"];

/** The focused element takes text. */
export const isTypingTarget = (el: Element | null): boolean => {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    const type = ((el as HTMLInputElement).type || "text").toLowerCase();
    return !NON_TEXT_INPUTS.includes(type);
  }
  return (el as HTMLElement).isContentEditable === true;
};

/** Something modal is open: a dialog, alert dialog, sheet, drawer or the phone menu. */
export const isModalOpen = (doc: Document): boolean =>
  !!doc.querySelector(
    '[role="dialog"]:not([hidden]), [role="alertdialog"]:not([hidden]), [aria-modal="true"], [data-modal-open="true"]',
  );

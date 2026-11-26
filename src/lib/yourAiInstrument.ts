/**
 * Your AI as a carried instrument: the pure parts (docs/specs/your-ai-instrument/sow.md, Phase 1).
 * The component lives in `src/components/game/YourAiInstrument.tsx`.
 */

/** Open or close the instrument from the keyboard (SoW decision: the period). */
export const TOGGLE_KEY = ".";
/** The navigation instrument's key (architecture §5.1): `I`, either case. The period keeps working. */
export const INSTRUMENT_KEY = "i";

/** localStorage latch: the first-open tour is shown once. */
export const TOUR_SEEN_KEY = "fytt:your-ai-tour-seen";

/** Swipe down at least this far (px) to close. */
export const SWIPE_CLOSE_PX = 72;
/** Swipe up at least this far (px) from the glyph to open. */
export const SWIPE_OPEN_PX = 40;

/** The groups the first-open tour zooms onto, in order. */
export const TOUR_GROUPS = ["header", "conversation", "console"] as const;
export type TourGroup = (typeof TOUR_GROUPS)[number];

/**
 * The AI OS suites as app buttons. Mirrors `SUITE_SLUG` in `src/modules/ai-os/AiOsPage.tsx`
 * (category id → route under /ai-os). Mirrored, not imported: AiOsPage is a 3.7k-line page
 * with heavy backgrounds, and the instrument sits in the shell on every screen. The label of
 * each button is the existing `aiOsPage.suites.<category>` string.
 */
export const CONSOLE_SUITES = [
  { category: "clarity", to: "/ai-os/clarity" },
  { category: "iteration", to: "/ai-os/iteration" },
  { category: "deployment", to: "/ai-os/vibe-code" },
  { category: "design", to: "/ai-os/design" },
] as const;

type KeyLike = Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey" | "defaultPrevented" | "isComposing"> & {
  target: EventTarget | null;
};

/** True when typing: the period must stay a period in a text field. */
export const isEditableTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  if (!el || typeof el.matches !== "function") return false;
  return el.matches("input, textarea, select, [contenteditable=''], [contenteditable='true']");
};

/** The bare period or `I`, outside text fields, not already handled by something else. */
export const isToggleKey = (e: KeyLike): boolean =>
  (e.key === TOGGLE_KEY || e.key.toLowerCase() === INSTRUMENT_KEY) &&
  !e.metaKey &&
  !e.ctrlKey &&
  !e.altKey &&
  !e.defaultPrevented &&
  !e.isComposing &&
  !isEditableTarget(e.target);

export const readTourSeen = (storage: Pick<Storage, "getItem"> | null = safeStorage()): boolean => {
  try {
    return storage?.getItem(TOUR_SEEN_KEY) === "true";
  } catch {
    return false;
  }
};

export const writeTourSeen = (storage: Pick<Storage, "setItem"> | null = safeStorage()): void => {
  try {
    storage?.setItem(TOUR_SEEN_KEY, "true");
  } catch {
    // Private mode: the tour may show again next visit. Non-blocking.
  }
};

function safeStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

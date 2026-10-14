/**
 * Zone-of-Genius retake helpers (Issue #48, Sasha 2026-10-14).
 *
 * Pulled out of ZoneOfGeniusEntry so the "start a fresh reveal" behaviour
 * is (a) one canonical definition shared by every surface that offers a
 * retake and (b) unit-testable without rendering the component.
 *
 * Why a canonical path: before this, the Top Talent card's "Retake" went
 * to `/zone-of-genius/assessment` (jumps straight into the Guided Top-10
 * select) and the JOURNEY rail offered no ZoG retake at all — the only
 * "Retake" near Top Talent was the Step-0 hero-journey quiz, which points
 * at `/quiz` (correct for the quiz, wrong as a ZoG retake). `ZOG_RETAKE_PATH`
 * routes to the entry screen with `?redo=true`, which clears the guest
 * recovery buffers and reopens the Faster/Guided choice fresh (see the
 * `isRedoing` branch in ZoneOfGeniusEntry's loadExisting effect).
 */

/** Canonical "retake the Zone of Genius" destination. */
export const ZOG_RETAKE_PATH = "/zone-of-genius/entry?redo=true";

/**
 * The localStorage keys that hold a guest's in-progress / recovery ZoG
 * data. A retake must clear all of them so a stale buffer can't re-reveal
 * the previous result. Kept in sync with saveToDatabase.ts.
 */
export const GUEST_BUFFER_KEYS = [
  "guest_appleseed_data",
  "guest_excalibur_data",
  "guest_ai_response",
] as const;

/** Minimal Storage shape — lets tests pass a fake without a DOM. */
export interface StorageLike {
  removeItem(key: string): void;
}

/** Clear every guest ZoG buffer. No-op safe if a key is absent. */
export const clearGuestBuffers = (storage: StorageLike): void => {
  for (const key of GUEST_BUFFER_KEYS) {
    try {
      storage.removeItem(key);
    } catch {
      // Defensive — a single key failing must not abort the rest.
    }
  }
};

/** The ZoG entry step the UI shows after a retake (the Faster/Guided choice). */
export type ZogRetakeStep = "choice-route";

/**
 * The full set of component-state resets a retake performs. Returned as a
 * plain object so ZoneOfGeniusEntry can apply it and tests can assert it
 * without a render. `hasSavedAppleseed` is deliberately reset to `false`
 * so the freshly-generated reveal auto-saves again (a loaded reveal sets
 * it `true` to suppress the redundant mount-time save — Issue #48 P0 #3).
 */
export interface FreshRetakeState {
  step: ZogRetakeStep;
  appleseed: null;
  excalibur: null;
  aiResponse: "";
  error: null;
  isSaved: false;
  guestRevealUnlocked: false;
  hasSavedAppleseed: false;
}

export const freshRetakeState = (): FreshRetakeState => ({
  step: "choice-route",
  appleseed: null,
  excalibur: null,
  aiResponse: "",
  error: null,
  isSaved: false,
  guestRevealUnlocked: false,
  hasSavedAppleseed: false,
});

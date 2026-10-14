import { describe, it, expect } from "vitest";
import {
  ZOG_RETAKE_PATH,
  GUEST_BUFFER_KEYS,
  clearGuestBuffers,
  freshRetakeState,
} from "../retake";

/**
 * Issue #48 P0 #1 + #2: the canonical Zone-of-Genius retake.
 *
 * These lock in the two things the UI depends on:
 *   - the retake route points at the entry screen with ?redo=true (which
 *     clears buffers + reopens the Faster/Guided choice), NOT /quiz or the
 *     Guided-only assessment;
 *   - confirming a retake clears every guest buffer and resets the entry
 *     component to a fresh choice-route state (including re-arming the
 *     auto-save so the NEXT reveal persists).
 */

describe("ZoG retake — canonical route (#2)", () => {
  it("routes to the entry screen with the redo flag", () => {
    expect(ZOG_RETAKE_PATH).toBe("/zone-of-genius/entry?redo=true");
  });

  it("does not route to /quiz or the Guided-only assessment", () => {
    expect(ZOG_RETAKE_PATH).not.toContain("/quiz");
    expect(ZOG_RETAKE_PATH).not.toContain("/assessment");
  });
});

describe("ZoG retake — clearGuestBuffers", () => {
  it("removes every guest buffer key", () => {
    const removed: string[] = [];
    clearGuestBuffers({ removeItem: (k) => removed.push(k) });
    expect(removed).toEqual([...GUEST_BUFFER_KEYS]);
    // The appleseed buffer (the one that re-reveals a stale result) is covered.
    expect(removed).toContain("guest_appleseed_data");
  });

  it("keeps clearing even if one key throws", () => {
    const removed: string[] = [];
    clearGuestBuffers({
      removeItem: (k) => {
        if (k === "guest_appleseed_data") throw new Error("storage blocked");
        removed.push(k);
      },
    });
    // The throwing key is skipped but the rest still clear.
    expect(removed).toContain("guest_excalibur_data");
    expect(removed).toContain("guest_ai_response");
  });
});

describe("ZoG retake — freshRetakeState (#1)", () => {
  it("resets to the Faster/Guided choice with cleared result + re-armed auto-save", () => {
    const fresh = freshRetakeState();
    expect(fresh.step).toBe("choice-route");
    expect(fresh.appleseed).toBeNull();
    expect(fresh.excalibur).toBeNull();
    expect(fresh.aiResponse).toBe("");
    expect(fresh.error).toBeNull();
    expect(fresh.isSaved).toBe(false);
    expect(fresh.guestRevealUnlocked).toBe(false);
    // false ⇒ the freshly generated reveal auto-saves again (a LOADED
    // reveal sets this true to suppress the redundant mount-time save).
    expect(fresh.hasSavedAppleseed).toBe(false);
  });
});

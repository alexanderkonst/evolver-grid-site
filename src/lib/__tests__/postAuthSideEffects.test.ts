import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Issue #370: a freshly confirmed player landed on /mission-discovery before the guest Top Talent
 * result had been synced into the account, so the mission step read «Not open yet». The gating
 * loaders now await `awaitGuestResultSync`: migrate first, claim second, then read.
 */

const mocks = vi.hoisted(() => ({
  order: [] as string[],
  migrate: vi.fn(),
  claim: vi.fn(),
  clearCache: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { onAuthStateChange: vi.fn() } },
}));
vi.mock("@/lib/zogSnapshotCache", () => ({ clearCachedZogSnapshot: mocks.clearCache }));
vi.mock("@/modules/zone-of-genius/saveToDatabase", () => ({ migrateGuestDataToProfile: mocks.migrate }));
vi.mock("@/lib/anonClaimGuard", () => ({ claimAnonymousZogIfAllowed: mocks.claim }));

import { awaitGuestResultSync } from "../postAuthSideEffects";

let userSeq = 0;
const freshUser = () => `user-${++userSeq}`;

describe("awaitGuestResultSync", () => {
  beforeEach(() => {
    mocks.order.length = 0;
    mocks.migrate.mockReset().mockImplementation(async () => {
      mocks.order.push("migrate");
    });
    mocks.claim.mockReset().mockImplementation(async () => {
      mocks.order.push("claim");
      return "claim_new_user";
    });
    mocks.clearCache.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves only after migrate, then claim, have finished", async () => {
    await awaitGuestResultSync(freshUser());
    expect(mocks.order).toEqual(["migrate", "claim"]);
    expect(mocks.clearCache).toHaveBeenCalled();
  });

  it("shares one run between concurrent callers", async () => {
    const id = freshUser();
    await Promise.all([awaitGuestResultSync(id), awaitGuestResultSync(id)]);
    expect(mocks.migrate).toHaveBeenCalledTimes(1);
    expect(mocks.claim).toHaveBeenCalledTimes(1);
  });

  it("gives up waiting after the timeout and calls onLate when the sync lands", async () => {
    vi.useFakeTimers();
    let release!: () => void;
    mocks.claim.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = () => resolve("claim_new_user");
        }),
    );
    const onLate = vi.fn();
    const waited = awaitGuestResultSync(freshUser(), { timeoutMs: 1000, onLate });
    await vi.advanceTimersByTimeAsync(1000);
    await waited;
    expect(onLate).not.toHaveBeenCalled();
    release();
    await vi.advanceTimersByTimeAsync(0);
    expect(onLate).toHaveBeenCalledTimes(1);
  });

  it("never throws when migrate fails", async () => {
    mocks.migrate.mockRejectedValue(new Error("boom"));
    await expect(awaitGuestResultSync(freshUser())).resolves.toBeUndefined();
    expect(mocks.claim).toHaveBeenCalled();
  });
});

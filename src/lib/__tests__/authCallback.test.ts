import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deferAuthCallback } from "@/lib/authCallback";

describe("deferAuthCallback (#263)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns at once, even when the handler never settles", () => {
    const handler = vi.fn((..._args: unknown[]) => new Promise<void>(() => {}));
    const result = deferAuthCallback(handler)("SIGNED_IN", { user: 1 });
    // Not a promise: supabase-js has nothing to await while it holds the auth lock.
    expect(result).toBeUndefined();
    expect(handler).not.toHaveBeenCalled();
  });

  it("runs the handler on the next tick with the same arguments", async () => {
    const handler = vi.fn(async (..._args: unknown[]) => {});
    deferAuthCallback(handler)("SIGNED_IN", { user: 1 });
    await vi.runAllTimersAsync();
    expect(handler).toHaveBeenCalledWith("SIGNED_IN", { user: 1 });
  });

  it("swallows a failing handler instead of leaking an unhandled rejection", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    deferAuthCallback(async (..._args: unknown[]) => {
      throw new Error("boom");
    })("SIGNED_IN", null);
    await vi.runAllTimersAsync();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

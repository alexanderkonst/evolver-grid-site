import { describe, expect, it, vi } from "vitest";
import {
  RUNTIME_CRM_SNAPSHOT_URL,
  fetchRuntimeOffers,
  getBundledOffers,
} from "@/lib/runtimeOffers";

const validOffer = {
  dateSent: "2026-07-15",
  name: "Pat",
  segmentOrCampaign: "Direction Call",
  channel: "email",
  offerType: "free" as const,
  amountUsd: 0,
  status: "waiting" as const,
  nextFollowupDate: "2026-07-18",
  quantity: 1,
  notes: "Runtime fixture",
};

describe("runtime offers", () => {
  it("fetches the latest committed snapshot with cache bypassing", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      generated_at: "2026-07-16T00:00:00.000Z",
      offers: [validOffer],
    }), { status: 200 })) as unknown as typeof fetch;

    const result = await fetchRuntimeOffers(fetcher, 12345);

    expect(fetcher).toHaveBeenCalledWith(
      `${RUNTIME_CRM_SNAPSHOT_URL}?runtime=12345`,
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(result).toMatchObject({ source: "runtime", generatedAt: "2026-07-16T00:00:00.000Z" });
    expect(result.offers).toEqual([validOffer]);
  });

  it("rejects malformed runtime rows instead of silently hiding them", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      offers: [{ ...validOffer, dateSent: "July 15" }],
    }), { status: 200 })) as unknown as typeof fetch;

    await expect(fetchRuntimeOffers(fetcher, 1)).rejects.toThrow("invalid offer row");
  });

  it("surfaces network errors so the UI can identify bundled fallback data", async () => {
    const fetcher = vi.fn(async () => new Response("no", { status: 503 })) as unknown as typeof fetch;

    await expect(fetchRuntimeOffers(fetcher, 1)).rejects.toThrow("503");
    expect(getBundledOffers().source).toBe("bundled");
  });
});

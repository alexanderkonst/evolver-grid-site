import { describe, expect, it } from "vitest";
import {
  calculateOffersBoardMetrics,
  normalizeOffers,
  type OutreachOffer,
} from "@/lib/offersBoard";

const fixture: OutreachOffer[] = [
  { dateSent: "2026-07-13", name: "Ada", segmentOrCampaign: "Founder outreach", channel: "email", offerType: "paid", amountUsd: 500, status: "waiting", nextFollowupDate: "2026-07-15", quantity: 1, notes: "Warm lead" },
  { dateSent: "2026-07-14", name: "Ben", segmentOrCampaign: "Founder outreach", channel: "dm", offerType: "free", amountUsd: 0, status: "replied", nextFollowupDate: "2026-07-16", quantity: 1, notes: "Interested" },
  { dateSent: "2026-07-15", name: "Warm wave", segmentOrCampaign: "Direction Call", channel: "email", offerType: "free", amountUsd: 0, status: "waiting", nextFollowupDate: "2026-07-18", quantity: 24, notes: "Campaign remainder" },
  { dateSent: "2026-07-15", name: "Cora", segmentOrCampaign: "Ecosystem", channel: "email", offerType: "partnership", amountUsd: 0, status: "waiting", nextFollowupDate: "2026-07-16", quantity: 1, notes: "Follow up today" },
  { dateSent: "2026-07-09", name: "Dev", segmentOrCampaign: "Founder outreach", channel: "dm", offerType: "paid", amountUsd: 1200, status: "waiting", nextFollowupDate: "2026-07-17", quantity: 1, notes: "Last week" },
  { dateSent: "2026-07-08", name: "Eli", segmentOrCampaign: "Ecosystem", channel: "email", offerType: "partnership", amountUsd: 0, status: "closed", nextFollowupDate: "", quantity: 1, notes: "Not now" },
  { dateSent: "2026-07-06", name: "Fay", segmentOrCampaign: "Founder outreach", channel: "email", offerType: "free", amountUsd: 0, status: "booked", nextFollowupDate: "2026-07-08", quantity: 1, notes: "Booked" },
];

describe("Offers Board", () => {
  it("normalizes Pulse-derived rows and rejects malformed dates", () => {
    const normalized = normalizeOffers([
      ...fixture,
      { ...fixture[0], name: "Bad", dateSent: "July 13" },
    ]);

    expect(normalized).toHaveLength(fixture.length);
    expect(normalized[0]).toMatchObject({ name: "Ada", quantity: 1 });
  });

  it("calculates Monday-Sunday OMTM counts with aggregate campaign quantities", () => {
    const metrics = calculateOffersBoardMetrics(fixture, new Date(2026, 6, 16, 12));

    expect(metrics.thisWeek).toEqual({ paid: 1, free: 25, partnership: 1, total: 27 });
    expect(metrics.lastWeek).toEqual({ paid: 1, free: 1, partnership: 1, total: 3 });
    expect(metrics.pendingAmountUsd).toBe(1700);
  });

  it("keeps replied and booked offers open while paid and closed offers leave the board", () => {
    const metrics = calculateOffersBoardMetrics(fixture, new Date(2026, 6, 16, 12));

    expect(metrics.waitingOffers.map((offer) => offer.name)).toEqual([
      "Fay",
      "Ada",
      "Ben",
      "Cora",
      "Dev",
      "Warm wave",
    ]);
  });

  it("pulls due follow-ups forward and highlights only overdue rows", () => {
    const metrics = calculateOffersBoardMetrics(fixture, new Date(2026, 6, 16, 12));

    expect(metrics.followupsDue.map((offer) => offer.name)).toEqual(["Fay", "Ada", "Ben", "Cora"]);
    expect(metrics.overdueOfferKeys.size).toBe(2);
  });
});

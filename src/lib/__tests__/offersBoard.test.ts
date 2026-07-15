import { describe, expect, it } from "vitest";
import { calculateOffersBoardMetrics, parseOutreachCsv } from "@/lib/offersBoard";

const fixture = `date_sent,name,segment_or_campaign,channel,offer_type(paid|free|partnership),amount_usd,status(waiting|replied|booked|paid|closed),next_followup_date,notes
2026-07-13,Ada,Founder outreach,email,paid,500,waiting,2026-07-15,"Warm lead, asked for details"
2026-07-14,Ben,Founder outreach,dm,free,0,replied,2026-07-16,Interested
2026-07-15,Cora,Ecosystem,email,partnership,0,waiting,2026-07-16,Follow up today
2026-07-09,Dev,Founder outreach,dm,paid,1200,waiting,2026-07-17,Last week
2026-07-08,Eli,Ecosystem,email,partnership,0,closed,,Not now
2026-07-06,Fay,Founder outreach,email,free,0,booked,2026-07-08,Booked
`;

describe("Offers Board", () => {
  it("parses quoted CSV fields and preserves the tracker data", () => {
    const offers = parseOutreachCsv(fixture);

    expect(offers).toHaveLength(6);
    expect(offers[0]).toMatchObject({
      name: "Ada",
      amountUsd: 500,
      notes: "Warm lead, asked for details",
    });
  });

  it("calculates Monday-Sunday OMTM counts and pending dollars", () => {
    const metrics = calculateOffersBoardMetrics(
      parseOutreachCsv(fixture),
      new Date(2026, 6, 16, 12),
    );

    expect(metrics.thisWeek).toEqual({ paid: 1, free: 1, partnership: 1, total: 3 });
    expect(metrics.lastWeek).toEqual({ paid: 1, free: 1, partnership: 1, total: 3 });
    expect(metrics.pendingAmountUsd).toBe(1700);
  });

  it("pulls due follow-ups forward, highlights only overdue rows, and sorts blank dates last", () => {
    const metrics = calculateOffersBoardMetrics(
      parseOutreachCsv(fixture),
      new Date(2026, 6, 16, 12),
    );

    expect(metrics.followupsDue.map((offer) => offer.name)).toEqual(["Ada", "Cora"]);
    expect(metrics.overdueOfferKeys.size).toBe(1);
    expect(metrics.waitingOffers.map((offer) => offer.name)).toEqual(["Ada", "Cora", "Dev"]);
  });

  it("rejects schema drift instead of rendering misleading numbers", () => {
    expect(() => parseOutreachCsv("date,name\n2026-07-15,Ada")).toThrow(/headers/i);
  });
});

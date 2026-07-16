export const offerTypes = ["paid", "free", "partnership"] as const;
export const offerStatuses = ["waiting", "replied", "booked", "paid", "closed"] as const;

export type OfferType = (typeof offerTypes)[number];
export type OfferStatus = (typeof offerStatuses)[number];

export interface OutreachOffer {
  dateSent: string;
  name: string;
  segmentOrCampaign: string;
  channel: string;
  offerType: OfferType;
  amountUsd: number;
  status: OfferStatus;
  nextFollowupDate: string;
  quantity: number;
  notes: string;
}

export interface OfferTypeCounts {
  paid: number;
  free: number;
  partnership: number;
}

export interface OffersBoardMetrics {
  thisWeek: OfferTypeCounts & { total: number };
  lastWeek: OfferTypeCounts & { total: number };
  pendingAmountUsd: number;
  waitingOffers: OutreachOffer[];
  followupsDue: OutreachOffer[];
  overdueOfferKeys: Set<string>;
}

const emptyCounts = (): OfferTypeCounts => ({ paid: 0, free: 0, partnership: 0 });

const isDateOnly = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const localDate = (value: string): Date | null => {
  if (!isDateOnly(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
};

const startOfLocalDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const startOfMondayWeek = (date: Date) => {
  const day = startOfLocalDay(date);
  const offset = day.getDay() === 0 ? 6 : day.getDay() - 1;
  day.setDate(day.getDate() - offset);
  return day;
};

const offerKey = (offer: OutreachOffer) =>
  `${offer.dateSent}\u0000${offer.name}\u0000${offer.segmentOrCampaign}`;


export const normalizeOffers = (offers: OutreachOffer[]): OutreachOffer[] =>
  offers.filter((offer) =>
    Boolean(
      localDate(offer.dateSent) &&
        offer.name &&
        offerTypes.includes(offer.offerType) &&
        offerStatuses.includes(offer.status) &&
        (!offer.nextFollowupDate || localDate(offer.nextFollowupDate)),
    ),
  ).map((offer) => ({ ...offer, quantity: Math.max(1, offer.quantity || 1) }));

export const calculateOffersBoardMetrics = (
  offers: OutreachOffer[],
  now = new Date(),
): OffersBoardMetrics => {
  const thisWeekStart = startOfMondayWeek(now);
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const today = startOfLocalDay(now);

  const current = emptyCounts();
  const previous = emptyCounts();

  offers.forEach((offer) => {
    const sent = localDate(offer.dateSent);
    if (!sent) return;
    if (sent >= thisWeekStart && sent < nextWeekStart) current[offer.offerType] += offer.quantity;
    if (sent >= lastWeekStart && sent < thisWeekStart) previous[offer.offerType] += offer.quantity;
  });

  const byFollowup = (left: OutreachOffer, right: OutreachOffer) => {
    if (!left.nextFollowupDate && !right.nextFollowupDate) return 0;
    if (!left.nextFollowupDate) return 1;
    if (!right.nextFollowupDate) return -1;
    return left.nextFollowupDate.localeCompare(right.nextFollowupDate);
  };
  const waitingOffers = offers
    .filter((offer) => !["paid", "closed"].includes(offer.status))
    .sort(byFollowup);
  const followupsDue = waitingOffers.filter((offer) => {
    const followup = localDate(offer.nextFollowupDate);
    return followup !== null && followup <= today;
  });
  const overdueOfferKeys = new Set(
    followupsDue
      .filter((offer) => (localDate(offer.nextFollowupDate)?.getTime() ?? 0) < today.getTime())
      .map(offerKey),
  );

  return {
    thisWeek: { ...current, total: current.paid + current.free + current.partnership },
    lastWeek: { ...previous, total: previous.paid + previous.free + previous.partnership },
    pendingAmountUsd: waitingOffers.reduce((sum, offer) => sum + offer.amountUsd * offer.quantity, 0),
    waitingOffers,
    followupsDue,
    overdueOfferKeys,
  };
};

export const getOfferKey = offerKey;

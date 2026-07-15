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

const expectedHeaders = [
  "date_sent",
  "name",
  "segment_or_campaign",
  "channel",
  "offer_type(paid|free|partnership)",
  "amount_usd",
  "status(waiting|replied|booked|paid|closed)",
  "next_followup_date",
  "notes",
] as const;

const emptyCounts = (): OfferTypeCounts => ({ paid: 0, free: 0, partnership: 0 });

/** Parses RFC-4180-style CSV, including commas, quotes and line breaks in fields. */
const parseCsvRows = (input: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  row.push(field);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
};

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

export const parseOutreachCsv = (input: string): OutreachOffer[] => {
  const rows = parseCsvRows(input.replace(/^\uFEFF/, ""));
  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.trim());
  if (
    headers.length !== expectedHeaders.length ||
    expectedHeaders.some((header, index) => headers[index] !== header)
  ) {
    throw new Error(`Outreach tracker headers do not match the Offers Board schema.`);
  }

  return rows.slice(1).map((values, rowIndex) => {
    const rowNumber = rowIndex + 2;
    if (values.length !== expectedHeaders.length) {
      throw new Error(
        `Row ${rowNumber}: expected ${expectedHeaders.length} columns, found ${values.length}. Quote fields that contain commas.`,
      );
    }
    const cells = expectedHeaders.map((_, index) => (values[index] ?? "").trim());
    const [dateSent, name, segmentOrCampaign, channel, rawType, rawAmount, rawStatus, nextFollowupDate, notes] = cells;

    if (!localDate(dateSent)) throw new Error(`Row ${rowNumber}: date_sent must be YYYY-MM-DD.`);
    if (!name) throw new Error(`Row ${rowNumber}: name is required.`);
    if (!offerTypes.includes(rawType as OfferType)) {
      throw new Error(`Row ${rowNumber}: offer_type must be paid, free, or partnership.`);
    }
    if (!offerStatuses.includes(rawStatus as OfferStatus)) {
      throw new Error(`Row ${rowNumber}: status is invalid.`);
    }
    if (nextFollowupDate && !localDate(nextFollowupDate)) {
      throw new Error(`Row ${rowNumber}: next_followup_date must be YYYY-MM-DD or empty.`);
    }

    const amountUsd = rawAmount === "" ? 0 : Number(rawAmount);
    if (!Number.isFinite(amountUsd) || amountUsd < 0) {
      throw new Error(`Row ${rowNumber}: amount_usd must be a non-negative number.`);
    }

    return {
      dateSent,
      name,
      segmentOrCampaign,
      channel,
      offerType: rawType as OfferType,
      amountUsd,
      status: rawStatus as OfferStatus,
      nextFollowupDate,
      notes,
    };
  });
};

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
    if (sent >= thisWeekStart && sent < nextWeekStart) current[offer.offerType] += 1;
    if (sent >= lastWeekStart && sent < thisWeekStart) previous[offer.offerType] += 1;
  });

  const byFollowup = (left: OutreachOffer, right: OutreachOffer) => {
    if (!left.nextFollowupDate && !right.nextFollowupDate) return 0;
    if (!left.nextFollowupDate) return 1;
    if (!right.nextFollowupDate) return -1;
    return left.nextFollowupDate.localeCompare(right.nextFollowupDate);
  };
  const waitingOffers = offers.filter((offer) => offer.status === "waiting").sort(byFollowup);
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
    pendingAmountUsd: waitingOffers.reduce((sum, offer) => sum + offer.amountUsd, 0),
    waitingOffers,
    followupsDue,
    overdueOfferKeys,
  };
};

export const getOfferKey = offerKey;

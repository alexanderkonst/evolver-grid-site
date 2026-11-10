import crmSnapshotRaw from "@/generated/crm-snapshot";
import pulseSnapshotRaw from "@/generated/project-pulse-snapshot.json";
import type { OutreachOffer } from "@/lib/offersBoard";

/** Typed views of the committed build-time snapshots. Founder-only: render behind the founder gate. */
export interface FunnelMetrics {
  accepted?: number | string;
  messaged?: number | string;
  replied?: number | string;
  "call-booked"?: number | string;
  "call-done"?: number | string;
  offered?: number | string;
  paid?: number | string;
}

export interface MetricsHistoryRow {
  date?: string;
  usd_paid?: number | string;
}

export const crmSnapshot = crmSnapshotRaw as {
  generated_at?: string;
  contactsCount?: number;
  openItemsCount?: number;
  energyLeakCount?: number;
  cashReceivedUsd?: number;
  revShareContractsUsd?: number;
  stageDistribution?: Record<string, number>;
  segmentDistribution?: Record<string, number>;
  funnel?: Array<{ cohort: string; metrics: FunnelMetrics }>;
  metricsHistory?: MetricsHistoryRow[];
  offers?: OutreachOffer[];
};

export const pulseSnapshot = pulseSnapshotRaw as {
  generated_at?: string;
  eventsCount?: number;
  latestEvent?: {
    title?: string;
    what_happened?: string;
    next_action?: string;
    phase_shift_significance?: string;
  };
  openNextActions?: Array<{ title?: string; next_action?: string }>;
};

export const formatDate = (value?: string | null) => {
  if (!value) return "not loaded";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

export const clipped = (text?: string | null, max = 190) => {
  if (!text) return "Not set yet";
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
};

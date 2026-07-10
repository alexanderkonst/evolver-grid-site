/**
 * Profile Space — deterministic "what changed" history builder (D2,
 * docs/specs/profile-space/sow_and_dods.md). Pure functions, no React,
 * no Supabase — takes the already-loaded ProfileSpaceData and produces
 * a merged, newest-first HistoryEvent[] for the progression timeline
 * (ProfileSpaceHome) and the PDF's "Profile history" section
 * (generateProfilePdf.ts imports buildHistoryEvents from here so the
 * diff logic is not duplicated).
 *
 * v1 change lines are computed client-side from raw field diffs (no
 * AI narrative — that's wave 2, see D2). Every changeLine is plain
 * data text (talent names, numbers, titles) — never translated. The
 * UI/PDF render `t(titleKey) + changeLine`.
 */

import type {
  AssetLite,
  HistoryEvent,
  ProfileSpaceData,
  QolSnapshotLite,
  ZogSnapshotLite,
} from "./types";

const TITLE_KEYS = {
  zog: "profileSpace.history.zog",
  qol: "profileSpace.history.qol",
  mission: "profileSpace.history.mission",
  asset: "profileSpace.history.asset",
  request: "profileSpace.history.request",
} as const;

// ─────────────────────────────────────────────────────────────────────
// ZoG — talent-set diff between consecutive snapshots
// ─────────────────────────────────────────────────────────────────────

function buildZogEvents(history: ZogSnapshotLite[]): HistoryEvent[] {
  // history is newest-first; walk oldest→newest so each entry compares
  // against its true predecessor, then we reverse back to newest-first.
  const chronological = [...history].reverse();
  const events: HistoryEvent[] = [];

  chronological.forEach((snapshot, idx) => {
    const previous = idx > 0 ? chronological[idx - 1] : null;
    let changeLine: string;

    if (!previous) {
      changeLine = snapshot.topThreeTalents.join(" · ");
    } else {
      const prevSet = new Set(previous.topThreeTalents);
      const nextSet = new Set(snapshot.topThreeTalents);
      const added = snapshot.topThreeTalents.filter((t) => !prevSet.has(t));
      const removed = previous.topThreeTalents.filter((t) => !nextSet.has(t));

      if (added.length === 0 && removed.length === 0) {
        changeLine = `re-confirmed: ${snapshot.topThreeTalents.join(" · ")}`;
      } else {
        const parts: string[] = [];
        if (added.length > 0) parts.push(`+ ${added.join(", ")}`);
        if (removed.length > 0) parts.push(`− ${removed.join(", ")}`);
        changeLine = parts.join(" / ");
      }
    }

    events.push({
      kind: "zog",
      date: snapshot.createdAt,
      titleKey: TITLE_KEYS.zog,
      changeLine,
    });
  });

  return events.reverse();
}

// ─────────────────────────────────────────────────────────────────────
// QoL — stage delta between consecutive snapshots
// ─────────────────────────────────────────────────────────────────────

const QOL_DIM_LABELS: Array<{ key: keyof QolSnapshotLite["stages"]; label: string }> = [
  { key: "wealth", label: "Wealth" },
  { key: "health", label: "Health" },
  { key: "happiness", label: "Happiness" },
  { key: "loveRelationships", label: "Love & Relationships" },
  { key: "impact", label: "Impact" },
  { key: "growth", label: "Growth" },
  { key: "socialTies", label: "Social Ties" },
  { key: "home", label: "Home" },
];

function qolAverage(stages: QolSnapshotLite["stages"]): number {
  const sum = QOL_DIM_LABELS.reduce((acc, { key }) => acc + stages[key], 0);
  return sum / QOL_DIM_LABELS.length;
}

function buildQolEvents(history: QolSnapshotLite[]): HistoryEvent[] {
  const chronological = [...history].reverse();
  const events: HistoryEvent[] = [];

  chronological.forEach((snapshot, idx) => {
    const previous = idx > 0 ? chronological[idx - 1] : null;
    let changeLine: string;

    if (!previous) {
      changeLine = `First map: overall ${qolAverage(snapshot.stages).toFixed(1)}`;
    } else {
      const deltas = QOL_DIM_LABELS
        .map(({ key, label }) => ({ label, from: previous.stages[key], to: snapshot.stages[key] }))
        .filter((d) => d.from !== d.to);

      if (deltas.length === 0) {
        changeLine = "No change";
      } else {
        const shown = deltas.slice(0, 4).map((d) => `${d.label} ${d.from}→${d.to}`);
        const extra = deltas.length - shown.length;
        changeLine = shown.join(", ") + (extra > 0 ? ` +${extra} more` : "");
      }
    }

    events.push({
      kind: "qol",
      date: snapshot.createdAt,
      titleKey: TITLE_KEYS.qol,
      changeLine,
    });
  });

  return events.reverse();
}

// ─────────────────────────────────────────────────────────────────────
// Mission — single event at discovery time
// ─────────────────────────────────────────────────────────────────────

function buildMissionEvents(mission: ProfileSpaceData["mission"]): HistoryEvent[] {
  if (!mission.statement || !mission.discoveredAt) return [];
  const changeLine = mission.statement.slice(0, 90);
  return [
    {
      kind: "mission",
      date: mission.discoveredAt,
      titleKey: TITLE_KEYS.mission,
      changeLine,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────
// Assets — grouped by calendar day (local date, YYYY-MM-DD)
// ─────────────────────────────────────────────────────────────────────

function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function buildAssetEvents(assets: AssetLite[]): HistoryEvent[] {
  const groups = new Map<string, AssetLite[]>();
  for (const asset of assets) {
    const key = dayKey(asset.createdAt);
    const group = groups.get(key);
    if (group) {
      group.push(asset);
    } else {
      groups.set(key, [asset]);
    }
  }

  const events: HistoryEvent[] = [];
  for (const [, group] of groups) {
    // Newest createdAt within the group represents the event's date.
    const sorted = [...group].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const titles = sorted.slice(0, 3).map((a) => a.title);
    const extra = sorted.length - titles.length;
    const changeLine = titles.join(", ") + (extra > 0 ? ` +${extra} more` : "");
    events.push({
      kind: "asset",
      date: sorted[0].createdAt,
      titleKey: TITLE_KEYS.asset,
      changeLine,
    });
  }
  return events;
}

// ─────────────────────────────────────────────────────────────────────
// Requests — one event per sent match_interest
// ─────────────────────────────────────────────────────────────────────

const STATUS_WORD: Record<string, string> = {
  pending: "pending",
  accepted: "accepted",
  declined: "declined",
};

function buildRequestEvents(requests: ProfileSpaceData["requests"]): HistoryEvent[] {
  return requests.map((r) => ({
    kind: "request",
    date: r.createdAt,
    titleKey: TITLE_KEYS.request,
    changeLine: `${r.toName ?? "someone"} (${STATUS_WORD[r.status] ?? r.status})`,
  }));
}

// ─────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────

/**
 * Build the merged, newest-first history timeline from ProfileSpaceData.
 * Deterministic — same input always produces the same output. Safe to
 * call with partially-empty data (empty arrays / nulls produce no
 * events for that kind).
 */
export function buildHistoryEvents(data: ProfileSpaceData): HistoryEvent[] {
  const events: HistoryEvent[] = [
    ...buildZogEvents(data.zogHistory),
    ...buildQolEvents(data.qolHistory),
    ...buildMissionEvents(data.mission),
    ...buildAssetEvents(data.assets),
    ...buildRequestEvents(data.requests),
  ];

  return events.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export default buildHistoryEvents;

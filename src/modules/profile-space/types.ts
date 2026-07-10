// Profile Space — shared contract (Day 119 spec: docs/specs/profile-space/sow_and_dods.md).
// Authored first so data layer and UI can be built in parallel against one truth.

export interface ZogSnapshotLite {
  id: string;
  archetypeTitle: string | null;
  corePattern: string | null;
  topThreeTalents: string[];
  topTenTalents: string[];
  createdAt: string;
}

export interface QolSnapshotLite {
  id: string;
  createdAt: string;
  // The eight dimension stages, 1-based ints as stored on qol_snapshots.
  stages: {
    wealth: number;
    health: number;
    happiness: number;
    loveRelationships: number;
    impact: number;
    growth: number;
    socialTies: number;
    home: number;
  };
}

export interface AssetLite {
  id: string;
  title: string;
  typeId: string | null;
  description: string | null;
  createdAt: string;
}

export interface CollabRequestLite {
  id: string;
  toUserId: string;
  toName: string | null; // resolved from game_profiles when readable, else null
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface ProfileIdentity {
  userId: string;
  profileId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  memberSince: string | null;
  linkedinPdfUrl: string | null;
}

export interface MissionInfo {
  statement: string | null;
  categories: string[];
  discoveredAt: string | null;
}

export interface ProfileSpaceData {
  identity: ProfileIdentity | null;
  zogLatest: ZogSnapshotLite | null;
  zogHistory: ZogSnapshotLite[]; // newest first, includes latest
  mission: MissionInfo;
  assets: AssetLite[]; // newest first
  qolLatest: QolSnapshotLite | null;
  qolHistory: QolSnapshotLite[]; // newest first, includes latest
  requests: CollabRequestLite[]; // newest first
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export type HistoryEventKind =
  | "zog"
  | "qol"
  | "mission"
  | "asset"
  | "request";

export interface HistoryEvent {
  kind: HistoryEventKind;
  date: string; // ISO
  // i18n key under profileSpace.history.* naming the event type
  titleKey: string;
  // Deterministic, already-localizable change description parts.
  // UI renders: t(titleKey) + changeLine (changeLine is plain data text —
  // talent names, stage deltas, asset titles — not translated).
  changeLine: string;
}

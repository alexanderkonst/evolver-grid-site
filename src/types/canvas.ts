/**
 * Canvas Types
 *
 * TypeScript interfaces for the Unique Business Canvas data model.
 * The Canvas contains 7 artifacts produced during facilitated sessions.
 */

// --- Individual Artifact Types ---

export interface CanvasUniqueness {
  distillation: string;
  archetype: string;
  tagline: string;
  fullText: string;
}

export interface CanvasMyth {
  lie: string;
  truth: string;
  line: string;
  fullText: string;
}

export interface CanvasTribe {
  name: string;
  description: string;
  traits: string[];
  fullText: string;
}

export interface CanvasPain {
  layers: string[];
  fullText: string;
}

export interface CanvasPromise {
  statement: string;
  fullText: string;
}

export interface CanvasLeadMagnet {
  type: string;
  description: string;
  fullText: string;
}

export interface CanvasValueLadderTier {
  name: string;
  price: string;
  description: string;
}

export interface CanvasValueLadder {
  tiers: CanvasValueLadderTier[];
}

// --- Artifact Status ---

export type ArtifactStatusValue = "draft" | "landed" | "refining";

export interface CanvasArtifactStatus {
  uniqueness: ArtifactStatusValue;
  myth: ArtifactStatusValue;
  tribe: ArtifactStatusValue;
  pain: ArtifactStatusValue;
  promise: ArtifactStatusValue;
  lead_magnet: ArtifactStatusValue;
  value_ladder: ArtifactStatusValue;
}

// --- Full Canvas Snapshot ---

export interface CanvasSnapshot {
  id: string;
  profile_id: string | null;
  user_id: string | null;
  version: string;
  session_number: number;
  uniqueness: CanvasUniqueness | null;
  myth: CanvasMyth | null;
  tribe: CanvasTribe | null;
  pain: CanvasPain | null;
  promise: CanvasPromise | null;
  lead_magnet: CanvasLeadMagnet | null;
  value_ladder: CanvasValueLadder | null;
  tagline: string | null;
  facilitator: string | null;
  session_date: string | null;
  notes: string | null;
  artifact_status: CanvasArtifactStatus;
  created_at: string;
  updated_at: string;
}

// --- Canvas Artifact Metadata (for UI rendering) ---

export const CANVAS_ARTIFACTS = [
  { key: "uniqueness", label: "Uniqueness", icon: "Sparkles", question: "Who am I at my brightest?" },
  { key: "myth", label: "Myth", icon: "BookOpen", question: "What must be true for my work to be inevitable?" },
  { key: "tribe", label: "Tribe", icon: "Users", question: "Who recognizes themselves in this myth?" },
  { key: "pain", label: "Pain", icon: "AlertCircle", question: "What's unbearable about their situation?" },
  { key: "promise", label: "Promise", icon: "ArrowRight", question: "What's the master transformational result?" },
  { key: "lead_magnet", label: "Lead Magnet", icon: "Magnet", question: "How do people get in the door?" },
  { key: "value_ladder", label: "Value Ladder", icon: "TrendingUp", question: "What are the ascending containers?" },
] as const;

export type CanvasArtifactKey = typeof CANVAS_ARTIFACTS[number]["key"];

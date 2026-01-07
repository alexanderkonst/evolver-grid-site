export type ActionLoop =
  | "profile"
  | "transformation"
  | "marketplace"
  | "matchmaking"
  | "coop";

export type ActionType =
  | "quest"
  | "practice"
  | "upgrade"
  | "library_item"
  | "growth_path_step"
  | "onboarding"
  | "celebration";

export type ActionDuration = "xs" | "sm" | "md" | "lg";

export interface ActionPrerequisite {
  description: string;
  fulfilled: boolean;
}

export interface ActionCompletionPayload {
  xp?: number;
  growthPath?: string;
  qolDomain?: string;
  sourceId?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface UnifiedAction {
  /** Stable identifier, typically source + id (e.g., "quest:starter-path"). */
  id: string;
  type: ActionType;
  loop: ActionLoop;
  title: string;
  description?: string;
  growthPath?: string;
  qolDomain?: string;
  duration?: ActionDuration;
  intensity?: "low" | "medium" | "high";
  mode?: "solo" | "pair" | "group";
  whyRecommended?: string;
  source: string;
  completionPayload?: ActionCompletionPayload;
  prerequisites?: ActionPrerequisite[];
  locks?: string[];
  tags?: string[];
}

export interface RecommendationSet {
  primary: UnifiedAction;
  alternates?: UnifiedAction[];
  rationale?: string;
  generatedAt: string;
}

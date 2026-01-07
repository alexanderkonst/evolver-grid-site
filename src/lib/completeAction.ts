import { completeUpgrade } from "@/lib/upgradeSystem";
import { markPracticeDone } from "@/lib/practiceSystem";
import { completeLegacyQuest } from "@/lib/questCompletion";
import { type UnifiedAction } from "@/types/actions";
import type { CanonicalDomain } from "@/lib/mainQuest";

interface CompleteActionContext {
  profileId: string;
}

export interface CompleteActionResult {
  success: boolean;
  xpAwarded?: number;
  error?: string;
}

const durationBucketToMinutes = (duration?: UnifiedAction["duration"]) => {
  switch (duration) {
    case "xs":
      return 3;
    case "sm":
      return 10;
    case "md":
      return 20;
    case "lg":
      return 45;
    default:
      return undefined;
  }
};

const normalizeDomain = (path?: string): CanonicalDomain | undefined => {
  if (!path) return undefined;
  return path === "genius" ? "uniqueness" : (path as CanonicalDomain);
};

export const completeAction = async (
  action: UnifiedAction,
  context: CompleteActionContext
): Promise<CompleteActionResult> => {
  switch (action.type) {
    case "practice": {
      const practiceId = action.completionPayload?.sourceId;
      if (!practiceId) {
        return { success: false, error: "Missing practice id." };
      }
      const normalizedPath = normalizeDomain(action.growthPath);
      const result = await markPracticeDone(practiceId, normalizedPath);
      return { success: result.success, error: result.error };
    }
    case "upgrade": {
      const upgradeCode = action.completionPayload?.sourceId;
      if (!upgradeCode) {
        return { success: false, error: "Missing upgrade code." };
      }
      const result = await completeUpgrade(context.profileId, upgradeCode);
      return { success: result.success, error: result.error };
    }
    case "quest": {
      const legacyResult = await completeLegacyQuest({
        profileId: context.profileId,
        title: action.title,
        practiceType: action.tags?.[0],
        durationMinutes: durationBucketToMinutes(action.duration),
      });

      return {
        success: legacyResult.success,
        xpAwarded: legacyResult.xpAwarded,
        error: legacyResult.error,
      };
    }
    default:
      return { success: false, error: "Unsupported action type." };
  }
};

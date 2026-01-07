import { completeUpgrade } from "@/lib/upgradeSystem";
import { markPracticeDone } from "@/lib/practiceSystem";
import { completeLegacyQuest } from "@/lib/questCompletion";
import { awardXp } from "@/lib/xpSystem";
import { updateGrowthPathProgress } from "@/lib/growthPathProgress";
import { logActionEvent } from "@/lib/actionEvents";
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

const applyGenericCompletion = async (
  action: UnifiedAction,
  context: CompleteActionContext
): Promise<CompleteActionResult> => {
  const xpAwarded = action.completionPayload?.xp;
  if (!xpAwarded) {
    return { success: true };
  }

  const normalizedPath = normalizeDomain(action.growthPath);
  const result = await awardXp(context.profileId, xpAwarded, normalizedPath);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, xpAwarded };
};

const recordCompletionEvent = async (
  action: UnifiedAction,
  context: CompleteActionContext
): Promise<void> => {
  await logActionEvent({
    actionId: action.id,
    profileId: context.profileId,
    source: action.source,
    loop: action.loop,
    growthPath: action.growthPath,
    qolDomain: action.qolDomain,
    duration: action.duration,
    mode: action.mode,
    completedAt: new Date().toISOString(),
    metadata: {
      intent: "completed",
      ...(action.completionPayload?.metadata ?? {}),
    },
  });
};

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
      if (result.success) {
        await recordCompletionEvent(action, context);
      }
      return { success: result.success, error: result.error };
    }
    case "upgrade": {
      const upgradeCode = action.completionPayload?.sourceId;
      if (!upgradeCode) {
        return { success: false, error: "Missing upgrade code." };
      }
      const result = await completeUpgrade(context.profileId, upgradeCode);
      if (result.success) {
        await recordCompletionEvent(action, context);
      }
      return { success: result.success, error: result.error };
    }
    case "quest": {
      const legacyResult = await completeLegacyQuest({
        profileId: context.profileId,
        title: action.title,
        practiceType: action.tags?.[0],
        durationMinutes: durationBucketToMinutes(action.duration),
      });

      if (legacyResult.success) {
        await recordCompletionEvent(action, context);
      }
      return {
        success: legacyResult.success,
        xpAwarded: legacyResult.xpAwarded,
        error: legacyResult.error,
      };
    }
    case "growth_path_step":
      {
        const result = await applyGenericCompletion(action, context);
        if (!result.success) return result;
        const stepIndex = action.completionPayload?.metadata?.stepIndex;
        const version = action.completionPayload?.metadata?.version;
        if (typeof stepIndex === "number" && version && action.growthPath) {
          await updateGrowthPathProgress({
            profileId: context.profileId,
            growthPath: action.growthPath,
            stepIndex: stepIndex + 1,
            version,
          });
        }
        if (result.success) {
          await recordCompletionEvent(action, context);
        }
        return result;
      }
    case "library_item":
    case "onboarding":
    case "celebration":
      {
        const result = await applyGenericCompletion(action, context);
        if (result.success) {
          await recordCompletionEvent(action, context);
        }
        return result;
      }
    default:
      return { success: false, error: "Unsupported action type." };
  }
};

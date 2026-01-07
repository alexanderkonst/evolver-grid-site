import { completeUpgrade } from "@/lib/upgradeSystem";
import { markPracticeDone } from "@/lib/practiceSystem";
import { completeSideQuest } from "@/lib/questRunsApi";
import { type UnifiedAction } from "@/types/actions";

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
      const result = await markPracticeDone(practiceId, action.growthPath);
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
      const result = await completeSideQuest({
        profileId: context.profileId,
        practiceId: action.id,
        practiceTitle: action.title,
        practiceType: action.tags?.[0],
        durationMin: durationBucketToMinutes(action.duration),
        notes: action.whyRecommended,
      });
      return { success: result.success, xpAwarded: result.xpAwarded, error: result.error };
    }
    default:
      return { success: false, error: "Unsupported action type." };
  }
};

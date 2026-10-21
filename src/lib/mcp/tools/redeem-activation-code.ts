import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { WRITE_IDEMPOTENT, ToolError, runForUser, type Db } from "./_shared";

export const redeemActivationCodeInput = {
  code: z.string().trim().min(1).max(100).describe("The activation code, as the user received it."),
};

type RedeemResponse = { unlocked?: boolean; alreadyUnlocked?: boolean; error?: string };

/**
 * Calls the redeem-activation-coupon edge function with the user's own token.
 * The code list and the service-role write stay server-side there; this tool
 * only relays the outcome.
 */
export async function redeemActivationCode(db: Db, _userId: string, input: { code: string }) {
  const res = (await db.functions.invoke("redeem-activation-coupon", { body: { code: input.code } })) as {
    data: RedeemResponse | null;
    error: unknown;
  };

  const data = res.data;
  if (data?.unlocked) {
    return { unlocked: true, already_unlocked: data.alreadyUnlocked === true };
  }
  // "Invalid code" is a normal outcome, not a failure of the tool.
  if (data?.error === "Invalid code") {
    return { unlocked: false, reason: "invalid_code", hint: "That code was not recognised. Check it for typos." };
  }
  if (res.error || data?.error) {
    console.error("[mcp] redeem failed", data?.error ?? "invoke-error");
    if (data?.error === "Profile not found") {
      throw new ToolError("Could not redeem the code: this account has no profile yet. Finish onboarding first.");
    }
    throw new ToolError("Could not redeem the code right now. Try again in a minute.");
  }
  throw new ToolError("Could not redeem the code: unexpected response from the platform.");
}

export default defineTool({
  name: "redeem_activation_code",
  title: "Redeem activation code",
  description:
    "Redeem an activation code to unlock the deeper Top Talent view for the signed-in user. Safe to repeat: an already-unlocked account reports already_unlocked. An unrecognised code returns unlocked=false.",
  inputSchema: redeemActivationCodeInput,
  annotations: WRITE_IDEMPOTENT,
  handler: (input, ctx) =>
    runForUser(ctx, "redeem the code", (db, userId) => redeemActivationCode(db, userId, input)),
});

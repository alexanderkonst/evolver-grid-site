import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { buildAppleseedPrompt, type AppleseedData } from "../../../modules/zone-of-genius/appleseedPrompt";
import { SNAPSHOT_PENDING_SENTINEL } from "../../../modules/zone-of-genius/snapshotSentinel";
import { WRITE_APPEND, ToolError, getOrCreateProfileId, runForUser, unwrap, unwrapFunction, type Db } from "./_shared";

const MAX_MIRROR_CHARS = 30_000;

export const runTopTalentInput = {
  mirror_text: z
    .string()
    .trim()
    .min(40)
    .max(MAX_MIRROR_CHARS)
    .optional()
    .describe(
      "The pasted answer from an AI 'mirror' conversation about the user's genius (what they are appreciated for, what energises them, how they work). Free text or the structured JSON the Top Talent prompt returns.",
    ),
  top_talents: z
    .array(z.string().trim().min(1).max(120))
    .min(3)
    .max(10)
    .optional()
    .describe("Talent names the user selected, strongest first. The first three are treated as the core talents (the guided assessment's Top 3)."),
  language: z.string().trim().min(2).max(10).optional().describe("Output language code (e.g. en, ru). Defaults to English."),
};

type RunInput = { mirror_text?: string; top_talents?: string[]; language?: string };

/** The same raw-signal shape the guided assessment (Step4GenerateSnapshot) feeds the Appleseed generator, minus the first-pass snapshot. */
export function buildRawSignal(input: RunInput): string {
  const parts: string[] = [];
  if (input.top_talents?.length) {
    const top3 = input.top_talents.slice(0, 3);
    parts.push(
      `TOP TALENT — GUIDED ASSESSMENT (talent-selection lane)

The user selected their talents, strongest first.

TOP TALENTS SELECTED:
${JSON.stringify(input.top_talents.map((name) => ({ name })), null, 2)}

TOP 3 CORE TALENTS (in order, 1 = strongest):
${JSON.stringify(top3.map((name) => ({ name })), null, 2)}`,
    );
  }
  if (input.mirror_text) {
    parts.push(`${input.top_talents?.length ? "ADDITIONAL MIRROR TEXT FROM THE USER:\n\n" : ""}${input.mirror_text}`);
  }
  return parts.join("\n\n");
}

function assertAppleseedShape(value: unknown): asserts value is AppleseedData {
  const a = value as Partial<AppleseedData> | null;
  if (
    !a ||
    typeof a.bullseyeSentence !== "string" ||
    !a.bullseyeSentence.trim() ||
    typeof a.vibrationalKey?.name !== "string" ||
    !a.vibrationalKey.name.trim() ||
    !Array.isArray(a.threeLenses?.actions)
  ) {
    throw new ToolError("Could not create the Top Talent: the AI result was incomplete. Try again in a minute.");
  }
}

type SnapshotRef = { id: string; excalibur_data: unknown };

/**
 * Same snapshot rule as saveToDatabase.getOrCreateSnapshot: reuse the newest
 * snapshot while it is a partial run (no Excalibur yet), otherwise start a
 * fresh row so a retake appends to history instead of overwriting it.
 */
async function getOrCreateSnapshotId(db: Db, profileId: string): Promise<string> {
  const latest = unwrap(
    await db
      .from("zog_snapshots")
      .select("id, excalibur_data")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    "read the Top Talent snapshot",
  ) as SnapshotRef | null;
  if (latest && latest.excalibur_data == null) return latest.id;

  const created = unwrap(
    await db
      .from("zog_snapshots")
      .insert({
        profile_id: profileId,
        archetype_title: SNAPSHOT_PENDING_SENTINEL,
        core_pattern: SNAPSHOT_PENDING_SENTINEL,
        top_ten_talents: [],
        top_three_talents: [],
        xp_awarded: false,
      })
      .select("id")
      .single(),
    "create the Top Talent snapshot",
  ) as { id: string } | null;
  if (!created?.id) throw new ToolError("Could not create the Top Talent snapshot: the platform returned no id.");
  return created.id;
}

/**
 * Generate the Appleseed (archetype + 12 perspectives) through the same
 * generate-appleseed edge function the app uses, then save it the way
 * saveAppleseed does: update the snapshot row and point the profile at it.
 * XP awards and celebration UI stay in the app.
 */
export async function runTopTalent(db: Db, userId: string, input: RunInput) {
  if (!input.mirror_text && !input.top_talents?.length) {
    throw new ToolError("Provide mirror_text (a pasted AI mirror answer) or top_talents (at least 3 talent names).");
  }
  const rawSignal = buildRawSignal(input);
  const prompt = buildAppleseedPrompt(rawSignal);

  const invoked = await db.functions.invoke("generate-appleseed", {
    body: { prompt, rawSignal, target_language: input.language ?? "en" },
  });
  const data = unwrapFunction(
    invoked as { data: { appleseed?: unknown; error?: string } | null; error: unknown },
    "create the Top Talent",
  );
  assertAppleseedShape(data.appleseed);
  const appleseed = data.appleseed as AppleseedData;

  const profileId = await getOrCreateProfileId(db, userId);
  const snapshotId = await getOrCreateSnapshotId(db, profileId);

  const talents = input.top_talents?.length ? { top_ten_talents: input.top_talents } : {};
  // `.select("id")`: an RLS denial on UPDATE filters the row silently instead of raising.
  const updated = (unwrap(
    await db
      .from("zog_snapshots")
      .update({
        appleseed_data: JSON.parse(JSON.stringify(appleseed)),
        appleseed_generated_at: new Date().toISOString(),
        ai_response_raw: rawSignal,
        archetype_title: appleseed.vibrationalKey.name,
        core_pattern: appleseed.bullseyeSentence,
        top_three_talents: appleseed.threeLenses.actions.slice(0, 3),
        ...talents,
        output_language: input.language ?? "en",
      })
      .eq("id", snapshotId)
      .select("id"),
    "save the Top Talent",
  ) ?? []) as { id: string }[];
  if (updated.length === 0) {
    throw new ToolError("Not allowed to save the Top Talent. The signed-in account cannot update this snapshot.");
  }

  const pointed = (unwrap(
    await db
      .from("game_profiles")
      .update({
        last_zog_snapshot_id: snapshotId,
        zone_of_genius_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId)
      .select("id"),
    "link the Top Talent to the profile",
  ) ?? []) as { id: string }[];
  if (pointed.length === 0) {
    throw new ToolError("Not allowed to update the profile. The signed-in account cannot link the Top Talent.");
  }

  return {
    saved: true,
    snapshot_id: snapshotId,
    archetype: appleseed.vibrationalKey.name,
    bullseye: appleseed.bullseyeSentence,
    top_three_talents: appleseed.threeLenses.actions.slice(0, 3),
    deep_profile: appleseed.topTalentProfile ?? null,
    next: "Use get_top_talent with include_full=true for all 12 perspectives.",
  };
}

export default defineTool({
  name: "run_top_talent",
  title: "Run Top Talent",
  description:
    "Create the signed-in user's Top Talent (Zone of Genius archetype). Give it a pasted AI mirror answer (mirror_text), a ranked list of selected talents (top_talents), or both. Generates the archetype, bullseye sentence and 12-perspective Appleseed, saves it, and makes it the user's current result. Takes up to a minute (AI call). A retake keeps the earlier result in history.",
  inputSchema: runTopTalentInput,
  annotations: WRITE_APPEND,
  handler: (input, ctx) => runForUser(ctx, "create the Top Talent", (db, userId) => runTopTalent(db, userId, input)),
});

import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { WRITE_IDEMPOTENT, ToolError, getOrCreateProfileId, runForUser, unwrap, type Db } from "./_shared";

const stage = z.number().int().min(1).max(10);

/** Domain id → qol_snapshots column. Ids match DomainId in modules/quality-of-life-map/qolConfig.ts. */
const COLUMN_BY_DOMAIN = {
  wealth: "wealth_stage",
  health: "health_stage",
  happiness: "happiness_stage",
  love: "love_relationships_stage",
  impact: "impact_stage",
  growth: "growth_stage",
  socialTies: "social_ties_stage",
  home: "home_stage",
} as const;

export const submitQualityOfLifeInput = {
  wealth: stage.describe("Wealth stage 1-10 (1 Barely Surviving ... 10 Legacy Creation)."),
  health: stage.describe("Health stage 1-10 (1 Low Energy ... 10 Lifelong Health Legacy)."),
  happiness: stage.describe("Happiness stage 1-10 (1 Crisis/Survival Mode ... 10 Unified Self)."),
  love: stage.describe("Love & relationships stage 1-10."),
  impact: stage.describe("Impact stage 1-10."),
  growth: stage.describe("Growth stage 1-10."),
  socialTies: stage.describe("Social ties stage 1-10."),
  home: stage.describe("Home stage 1-10."),
};

type Answers = { [K in keyof typeof COLUMN_BY_DOMAIN]: number };
type SnapshotRow = { id: string } & { [C in (typeof COLUMN_BY_DOMAIN)[keyof typeof COLUMN_BY_DOMAIN]]: number };

const COLUMNS = Object.values(COLUMN_BY_DOMAIN);

/**
 * Same save as the QoL results page: skip when the newest snapshot already
 * holds exactly these eight stages (idempotent), otherwise insert a new
 * snapshot and point game_profiles.last_qol_snapshot_id at it. XP awards and
 * telemetry stay in the app.
 */
export async function submitQualityOfLife(db: Db, userId: string, input: Answers) {
  const profileId = await getOrCreateProfileId(db, userId);
  const stages = Object.fromEntries(
    (Object.keys(COLUMN_BY_DOMAIN) as (keyof Answers)[]).map((d) => [d, input[d]]),
  );

  const latest = unwrap(
    await db
      .from("qol_snapshots")
      .select(`id, ${COLUMNS.join(", ")}`)
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    "read the latest quality-of-life snapshot",
  ) as SnapshotRow | null;

  const same =
    latest && (Object.keys(COLUMN_BY_DOMAIN) as (keyof Answers)[]).every((d) => latest[COLUMN_BY_DOMAIN[d]] === input[d]);

  let snapshotId: string;
  if (same && latest) {
    snapshotId = latest.id;
  } else {
    const insert: Record<string, unknown> = { profile_id: profileId, xp_awarded: false };
    for (const d of Object.keys(COLUMN_BY_DOMAIN) as (keyof Answers)[]) insert[COLUMN_BY_DOMAIN[d]] = input[d];
    const created = unwrap(
      await db.from("qol_snapshots").insert(insert).select("id").single(),
      "save the quality-of-life snapshot",
    ) as { id: string } | null;
    if (!created?.id) throw new ToolError("Could not save the quality-of-life snapshot: the platform returned no id.");
    snapshotId = created.id;
  }

  // Heal/set the pointer even on the idempotent path, so pointer-based screens agree.
  const pointed = (unwrap(
    await db
      .from("game_profiles")
      .update({ last_qol_snapshot_id: snapshotId, updated_at: new Date().toISOString() })
      .eq("id", profileId)
      .select("id"),
    "link the snapshot to the profile",
  ) ?? []) as { id: string }[];
  if (pointed.length === 0) {
    throw new ToolError("Not allowed to update the profile. The signed-in account cannot link the snapshot.");
  }

  const average = Number((Object.values(stages).reduce((a, b) => a + b, 0) / 8).toFixed(1));
  return { snapshot_id: snapshotId, created: !same, stages, average_stage: average };
}

export default defineTool({
  name: "submit_quality_of_life",
  title: "Submit Quality of Life map",
  description:
    "Save the signed-in user's Quality of Life self-assessment: a stage from 1 to 10 for each of the 8 domains (wealth, health, happiness, love, impact, growth, socialTies, home). Creates a new snapshot unless the latest one already has identical answers.",
  inputSchema: submitQualityOfLifeInput,
  annotations: WRITE_IDEMPOTENT,
  handler: (input, ctx) =>
    runForUser(ctx, "save the quality-of-life snapshot", (db, userId) => submitQualityOfLife(db, userId, input)),
});

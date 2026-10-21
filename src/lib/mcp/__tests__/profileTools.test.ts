/**
 * Profile-side MCP tools: save_mission / get_mission, add_assets / list_assets,
 * submit_quality_of_life, redeem_activation_code, run_top_talent / get_top_talent.
 * Same fake client as the Equilibrium and UBB suites; edge functions are stubbed.
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ToolError } from "../tools/_shared";
import { addAssets, addAssetsInput } from "../tools/add-assets";
import { getMission } from "../tools/get-mission";
import { getTopTalent } from "../tools/get-top-talent";
import { listAssets } from "../tools/list-assets";
import { redeemActivationCode } from "../tools/redeem-activation-code";
import { buildRawSignal, runTopTalent } from "../tools/run-top-talent";
import { saveMission, saveMissionInput } from "../tools/save-mission";
import { submitQualityOfLife, submitQualityOfLifeInput } from "../tools/submit-quality-of-life";
import { OTHER_USER, RAW_DB_MESSAGE, USER, fakeDb, type Row } from "./fakeDb";

const PROFILE = "00000000-0000-4000-8000-0000000000c1";
const profile = (extra: Row = {}): Row => ({ id: PROFILE, user_id: USER, ...extra });

describe("save_mission / get_mission", () => {
  it("saves the sentence and stamps the discovery date once", async () => {
    const { db, tables } = fakeDb({ game_profiles: [profile()] });

    const first = await saveMission(db, USER, { sentence: "  Help founders ship  " });
    expect(first.mission).toBe("Help founders ship");
    expect(first.discovered_at).toBeTruthy();

    const second = await saveMission(db, USER, { sentence: "Help founders ship what matters" });
    expect(second.mission).toBe("Help founders ship what matters");
    expect(second.discovered_at).toBe(first.discovered_at);
    expect(tables.game_profiles).toHaveLength(1);
  });

  it("creates the profile when the account has none yet", async () => {
    const { db, tables } = fakeDb();
    await saveMission(db, USER, { sentence: "Make learning joyful" });
    expect(tables.game_profiles).toHaveLength(1);
    expect(tables.game_profiles[0]).toMatchObject({ user_id: USER, mission_statement: "Make learning joyful" });
  });

  it("never writes another user's profile", async () => {
    const { db, tables } = fakeDb({ game_profiles: [{ ...profile(), user_id: OTHER_USER, mission_statement: "Theirs" }] });
    await saveMission(db, USER, { sentence: "Mine is mine" });
    expect(tables.game_profiles.find((p) => p.user_id === OTHER_USER)?.mission_statement).toBe("Theirs");
  });

  it("turns a write failure into a friendly error", async () => {
    const { db } = fakeDb({ game_profiles: [profile()] }, { fail: { table: "game_profiles", op: "update", code: "42703" } });
    const error = await saveMission(db, USER, { sentence: "Long enough sentence" }).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).toMatch(/not available on the current deployment/i);
    expect(error.message).not.toContain(RAW_DB_MESSAGE);
  });

  it("validates length in the schema", () => {
    const schema = z.object(saveMissionInput);
    expect(schema.safeParse({ sentence: "ok" }).success).toBe(false);
    expect(schema.safeParse({ sentence: "x".repeat(1001) }).success).toBe(false);
    expect(schema.safeParse({ sentence: "A real mission sentence" }).success).toBe(true);
  });

  it("get_mission returns the saved mission or a hint", async () => {
    const { db } = fakeDb({ game_profiles: [profile({ mission_statement: "Help founders ship", mission_discovered_at: "2026-10-01T00:00:00.000Z" })] });
    expect(await getMission(db, USER)).toMatchObject({ mission: "Help founders ship", discovered_at: "2026-10-01T00:00:00.000Z" });

    const empty = await getMission(fakeDb().db, USER);
    expect(empty.mission).toBeNull();
    expect(empty).toHaveProperty("hint");
  });
});

describe("add_assets / list_assets", () => {
  it("adds new assets, skipping titles the user already has (case and spacing insensitive) and duplicates in the call", async () => {
    const { db, tables } = fakeDb({
      game_profiles: [profile({ resources_mapped_at: null })],
      user_assets: [{ id: "a1", user_id: USER, type_id: "expertise", title: "Facilitation", created_at: "2026-10-01T00:00:00.000Z" }],
    });

    const out = await addAssets(db, USER, {
      assets: [
        { type: "expertise", title: " facilitation " },
        { type: "networks", title: "Founder circle", description: "40 founders" },
        { type: "networks", title: "founder  CIRCLE" },
      ],
    });

    expect(out).toMatchObject({ saved: 1, skipped: 2 });
    expect(tables.user_assets).toHaveLength(2);
    expect(tables.user_assets[1]).toMatchObject({
      user_id: USER,
      type_id: "networks",
      title: "Founder circle",
      description: "40 founders",
      sub_type_id: null,
      source: "ai",
    });
    expect(tables.game_profiles[0].resources_mapped_at).toBeTruthy();
  });

  it("is a no-op when repeated and keeps the first resources_mapped_at", async () => {
    const { db, tables } = fakeDb({ game_profiles: [profile({ resources_mapped_at: "2026-01-01T00:00:00.000Z" })] });
    const input = { assets: [{ type: "ip", title: "The Framework" }] };

    await addAssets(db, USER, input);
    const again = await addAssets(db, USER, input);

    expect(again).toMatchObject({ saved: 0, skipped: 1 });
    expect(tables.user_assets).toHaveLength(1);
    expect(tables.game_profiles[0].resources_mapped_at).toBe("2026-01-01T00:00:00.000Z");
  });

  it("does not treat another user's asset as a duplicate", async () => {
    const { db, tables } = fakeDb({ user_assets: [{ id: "a9", user_id: OTHER_USER, type_id: "ip", title: "The Framework" }] });
    const out = await addAssets(db, USER, { assets: [{ type: "ip", title: "The Framework" }] });
    expect(out.saved).toBe(1);
    expect(tables.user_assets).toHaveLength(2);
  });

  it("validates type and size in the schema", () => {
    const schema = z.object(addAssetsInput);
    expect(schema.safeParse({ assets: [{ type: "stuff", title: "x" }] }).success).toBe(false);
    expect(schema.safeParse({ assets: [] }).success).toBe(false);
    expect(schema.safeParse({ assets: [{ type: "influence", title: "Newsletter" }] }).success).toBe(true);
  });

  it("reports a save failure as a friendly error", async () => {
    const { db } = fakeDb({}, { fail: { table: "user_assets", op: "upsert", code: "42501" } });
    const error = await addAssets(db, USER, { assets: [{ type: "ip", title: "x" }] }).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).not.toContain(RAW_DB_MESSAGE);
  });

  it("lists the user's assets with counts, optionally by type", async () => {
    const { db } = fakeDb({
      user_assets: [
        { id: "a1", user_id: USER, type_id: "expertise", title: "Facilitation", created_at: "2026-10-01T00:00:00.000Z" },
        { id: "a2", user_id: USER, type_id: "networks", title: "Circle", created_at: "2026-10-02T00:00:00.000Z" },
        { id: "a3", user_id: USER, type_id: "networks", title: "Alumni", created_at: "2026-10-03T00:00:00.000Z" },
        { id: "a9", user_id: OTHER_USER, type_id: "networks", title: "Theirs", created_at: "2026-10-04T00:00:00.000Z" },
      ],
    });

    const all = await listAssets(db, USER, {});
    expect(all.count).toBe(3);
    expect(all.counts_by_type).toEqual({ expertise: 1, networks: 2 });
    expect(all.assets.map((a) => a.title)).toEqual(["Facilitation", "Circle", "Alumni"]);

    const networks = await listAssets(db, USER, { type: "networks" });
    expect(networks.assets.map((a) => a.title)).toEqual(["Circle", "Alumni"]);
  });
});

describe("submit_quality_of_life", () => {
  const answers = { wealth: 4, health: 5, happiness: 6, love: 7, impact: 3, growth: 8, socialTies: 2, home: 5 };

  it("saves a snapshot with all eight stages and points the profile at it", async () => {
    const { db, tables } = fakeDb({ game_profiles: [profile()] });

    const out = await submitQualityOfLife(db, USER, answers);

    expect(tables.qol_snapshots).toHaveLength(1);
    expect(tables.qol_snapshots[0]).toMatchObject({
      profile_id: PROFILE,
      wealth_stage: 4,
      health_stage: 5,
      happiness_stage: 6,
      love_relationships_stage: 7,
      impact_stage: 3,
      growth_stage: 8,
      social_ties_stage: 2,
      home_stage: 5,
      xp_awarded: false,
    });
    expect(tables.game_profiles[0].last_qol_snapshot_id).toBe(out.snapshot_id);
    expect(out).toMatchObject({ created: true, average_stage: 5 });
  });

  it("is idempotent for identical answers and appends a snapshot when answers change", async () => {
    const { db, tables } = fakeDb({ game_profiles: [profile()] });

    const first = await submitQualityOfLife(db, USER, answers);
    const same = await submitQualityOfLife(db, USER, answers);
    expect(same).toMatchObject({ created: false, snapshot_id: first.snapshot_id });
    expect(tables.qol_snapshots).toHaveLength(1);

    const changed = await submitQualityOfLife(db, USER, { ...answers, wealth: 9 });
    expect(changed.created).toBe(true);
    expect(tables.qol_snapshots).toHaveLength(2);
    expect(tables.game_profiles[0].last_qol_snapshot_id).toBe(changed.snapshot_id);
  });

  it("validates each stage as an integer from 1 to 10", () => {
    const schema = z.object(submitQualityOfLifeInput);
    expect(schema.safeParse(answers).success).toBe(true);
    expect(schema.safeParse({ ...answers, home: 0 }).success).toBe(false);
    expect(schema.safeParse({ ...answers, home: 11 }).success).toBe(false);
    expect(schema.safeParse({ ...answers, home: 5.5 }).success).toBe(false);
    const { home: _omitted, ...missing } = answers;
    expect(schema.safeParse(missing).success).toBe(false);
  });

  it("reports a failed insert as a friendly error", async () => {
    const { db } = fakeDb({ game_profiles: [profile()] }, { fail: { table: "qol_snapshots", op: "insert", code: "23514" } });
    const error = await submitQualityOfLife(db, USER, answers).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).toMatch(/rejected the values/i);
    expect(error.message).not.toContain(RAW_DB_MESSAGE);
  });
});

describe("redeem_activation_code", () => {
  const redeem = (result: { data: unknown; error: unknown }) => {
    const { db, invocations } = fakeDb({}, { invoke: () => result });
    return { run: () => redeemActivationCode(db, USER, { code: "SOME-CODE" }), invocations };
  };

  it("relays an unlock and forwards the code to the edge function", async () => {
    const { run, invocations } = redeem({ data: { unlocked: true }, error: null });
    expect(await run()).toEqual({ unlocked: true, already_unlocked: false });
    expect(invocations[0]).toEqual({ name: "redeem-activation-coupon", body: { code: "SOME-CODE" } });
  });

  it("reports an already-unlocked account", async () => {
    const { run } = redeem({ data: { unlocked: true, alreadyUnlocked: true }, error: null });
    expect(await run()).toEqual({ unlocked: true, already_unlocked: true });
  });

  it("treats an unrecognised code as a normal outcome, not a tool failure", async () => {
    const { run } = redeem({ data: { unlocked: false, error: "Invalid code" }, error: null });
    expect(await run()).toMatchObject({ unlocked: false, reason: "invalid_code" });
  });

  it("maps failures to friendly messages", async () => {
    const down = await redeem({ data: null, error: { message: "FunctionsFetchError: raw upstream detail" } }).run().catch((e) => e);
    expect(down).toBeInstanceOf(ToolError);
    expect(down.message).not.toContain("raw upstream detail");

    const noProfile = await redeem({ data: { unlocked: false, error: "Profile not found" }, error: null }).run().catch((e) => e);
    expect(noProfile.message).toMatch(/no profile yet/);
  });
});

describe("run_top_talent / get_top_talent", () => {
  const appleseed = {
    bullseyeSentence: "turn fog into frameworks people can act on",
    vibrationalKey: { name: "Fog to Framework Building" },
    threeLenses: { actions: ["Clarifying", "Structuring", "Teaching", "Extra"], primeDriver: "Clarity" },
    topTalentProfile: { archetype_title: "Fog to Framework Building", flywheel_action: "Teach one framework a week" },
  };
  const ok = () => ({ data: { appleseed }, error: null });
  const mirror = "People thank me for making a messy situation suddenly make sense, usually within one conversation.";

  it("generates from pasted mirror text and saves a snapshot the profile points at", async () => {
    const { db, tables, invocations } = fakeDb({ game_profiles: [profile()] }, { invoke: ok });

    const out = await runTopTalent(db, USER, { mirror_text: mirror });

    expect(invocations[0].name).toBe("generate-appleseed");
    expect(invocations[0].body.rawSignal).toBe(mirror);
    expect(invocations[0].body.prompt).toContain("Appleseed Generator");
    expect(invocations[0].body.prompt).toContain("messy situation suddenly make sense");
    expect(tables.zog_snapshots).toHaveLength(1);
    expect(tables.zog_snapshots[0]).toMatchObject({
      profile_id: PROFILE,
      archetype_title: "Fog to Framework Building",
      core_pattern: "turn fog into frameworks people can act on",
      top_three_talents: ["Clarifying", "Structuring", "Teaching"],
      ai_response_raw: mirror,
      appleseed_data: appleseed,
    });
    expect(tables.game_profiles[0]).toMatchObject({
      last_zog_snapshot_id: tables.zog_snapshots[0].id,
      zone_of_genius_completed: true,
    });
    expect(out).toMatchObject({
      saved: true,
      archetype: "Fog to Framework Building",
      top_three_talents: ["Clarifying", "Structuring", "Teaching"],
    });
  });

  it("builds the guided signal from ranked talents and stores them", async () => {
    const { db, tables, invocations } = fakeDb({ game_profiles: [profile()] }, { invoke: ok });

    await runTopTalent(db, USER, { top_talents: ["Clarifying", "Structuring", "Teaching", "Connecting"] });

    const signal = invocations[0].body.rawSignal as string;
    expect(signal).toContain("GUIDED ASSESSMENT");
    expect(signal).toContain("TOP 3 CORE TALENTS");
    expect(signal.split("TOP 3 CORE TALENTS")[1]).not.toContain("Connecting");
    expect(tables.zog_snapshots[0].top_ten_talents).toEqual(["Clarifying", "Structuring", "Teaching", "Connecting"]);
  });

  it("combines both inputs", () => {
    const signal = buildRawSignal({ top_talents: ["A", "B", "C"], mirror_text: mirror });
    expect(signal).toContain("TOP 3 CORE TALENTS");
    expect(signal).toContain("ADDITIONAL MIRROR TEXT");
    expect(signal).toContain(mirror);
  });

  it("requires at least one input", async () => {
    const { db, invocations } = fakeDb({ game_profiles: [profile()] }, { invoke: ok });
    await expect(runTopTalent(db, USER, {})).rejects.toThrow(/mirror_text .* top_talents/);
    expect(invocations).toHaveLength(0);
  });

  it("finishes a partial run in place but appends a new snapshot after a complete one", async () => {
    const partial = fakeDb(
      { game_profiles: [profile()], zog_snapshots: [{ id: "z1", profile_id: PROFILE, created_at: "2026-10-01T00:00:00.000Z", excalibur_data: null }] },
      { invoke: ok },
    );
    await runTopTalent(partial.db, USER, { mirror_text: mirror });
    expect(partial.tables.zog_snapshots).toHaveLength(1);
    expect(partial.tables.zog_snapshots[0].archetype_title).toBe("Fog to Framework Building");

    const complete = fakeDb(
      {
        game_profiles: [profile()],
        zog_snapshots: [{ id: "z1", profile_id: PROFILE, created_at: "2026-10-01T00:00:00.000Z", archetype_title: "Old", excalibur_data: { offer: {} } }],
      },
      { invoke: ok },
    );
    await runTopTalent(complete.db, USER, { mirror_text: mirror });
    expect(complete.tables.zog_snapshots).toHaveLength(2);
    expect(complete.tables.zog_snapshots.find((s) => s.id === "z1")?.archetype_title).toBe("Old");
    expect(complete.tables.game_profiles[0].last_zog_snapshot_id).not.toBe("z1");
  });

  it("saves nothing when the AI result is incomplete", async () => {
    const { db, tables } = fakeDb({ game_profiles: [profile()] }, { invoke: () => ({ data: { appleseed: { bullseyeSentence: "" } }, error: null }) });
    await expect(runTopTalent(db, USER, { mirror_text: mirror })).rejects.toThrow(/incomplete/);
    expect(tables.zog_snapshots ?? []).toHaveLength(0);
  });

  it("maps an AI failure to a friendly message", async () => {
    const { db } = fakeDb({ game_profiles: [profile()] }, { invoke: () => ({ data: null, error: { message: "boom internal 500" } }) });
    const error = await runTopTalent(db, USER, { mirror_text: mirror }).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).not.toContain("boom");
  });

  it("get_top_talent reports completed=false before a result exists, including the 'Pending' placeholder", async () => {
    expect(await getTopTalent(fakeDb().db, USER, {})).toMatchObject({ completed: false });

    const pending = fakeDb({
      game_profiles: [profile({ last_zog_snapshot_id: "z1" })],
      zog_snapshots: [{ id: "z1", profile_id: PROFILE, created_at: "2026-10-01T00:00:00.000Z", archetype_title: "Pending", core_pattern: "Pending" }],
    });
    expect(await getTopTalent(pending.db, USER, {})).toMatchObject({ completed: false });
  });

  it("get_top_talent returns the current result, falling back to the newest snapshot when the pointer is empty", async () => {
    const { db } = fakeDb({
      game_profiles: [profile({ last_zog_snapshot_id: null })],
      zog_snapshots: [
        { id: "z1", profile_id: PROFILE, created_at: "2026-10-01T00:00:00.000Z", archetype_title: "Old One", core_pattern: "old" },
        {
          id: "z2",
          profile_id: PROFILE,
          created_at: "2026-10-05T00:00:00.000Z",
          archetype_title: "Fog to Framework Building",
          core_pattern: "fallback pattern",
          top_three_talents: ["Clarifying", "Structuring", "Teaching"],
          appleseed_data: appleseed,
        },
      ],
    });

    const out = await getTopTalent(db, USER, {});
    expect(out).toMatchObject({
      completed: true,
      snapshot_id: "z2",
      archetype: "Fog to Framework Building",
      bullseye: "turn fog into frameworks people can act on",
      top_three_talents: ["Clarifying", "Structuring", "Teaching"],
    });
    expect(out).not.toHaveProperty("appleseed");

    const full = await getTopTalent(db, USER, { include_full: true });
    expect(full).toHaveProperty("appleseed");
  });
});

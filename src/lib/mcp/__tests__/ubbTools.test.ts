/**
 * Unique Business Builder MCP tools: ubb_list_artifacts, ubb_generate_artifact,
 * ubb_improve_artifact, ubb_lock_artifact.
 *
 * The edge functions (generate-artifact / improve-artifact) are stubbed; what is
 * pinned down is the context the tools assemble for them, the rows they append,
 * idempotency, and that failures reach the agent as friendly messages only.
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";
import { PROMPT_VERSION } from "../../../modules/unique-business-builder/promptVersions";
import { ToolError } from "../tools/_shared";
import { ubbGenerateArtifact, ubbGenerateArtifactInput } from "../tools/ubb-generate-artifact";
import { ubbImproveArtifact } from "../tools/ubb-improve-artifact";
import { ubbListArtifacts } from "../tools/ubb-list-artifacts";
import { ubbLockArtifact } from "../tools/ubb-lock-artifact";
import { OTHER_USER, RAW_DB_MESSAGE, USER, fakeDb, type Row } from "./fakeDb";

const PROFILE = "00000000-0000-4000-8000-0000000000c1";

const artifact = (
  id: string,
  artifact_key: string,
  version: string,
  created_at: string,
  extra: Row = {},
): Row => ({
  id,
  user_id: USER,
  artifact_key,
  version,
  content_json: { text: `${artifact_key} ${version}` },
  specificity_score: 6,
  is_locked: false,
  step_number: Number(version.replace(/\D/g, "")),
  created_at,
  ...extra,
});

const T1 = "2026-10-01T10:00:00.000Z";
const T2 = "2026-10-02T10:00:00.000Z";
const T3 = "2026-10-03T10:00:00.000Z";

const generated = {
  data: {
    content: { statement: "A first draft" },
    initial_specificity: 5.5,
    crystallized_action: "Say it to one person today",
    input_version_at_lock: "abc123def456",
  },
  error: null,
};

const improved = {
  data: {
    improved_content: { statement: "A sharper draft" },
    what_changed: "Named the tribe",
    specificity_score: 7.4,
    roast_findings: [{ quadrant: "UL", weakness: "too vague" }],
    crystallized_action: "Ship it",
    diminishing_returns: false,
    input_version_at_lock: "zz99",
  },
  error: null,
};

const founderSeed = (): Record<string, Row[]> => ({
  game_profiles: [
    { id: PROFILE, user_id: USER, mission_statement: "Help founders ship", mission_discovered_at: T1 },
  ],
  zog_snapshots: [{ id: "z1", profile_id: PROFILE, created_at: T1, archetype_title: "Fog to Framework", excalibur_data: { offer: { statement: "x" } } }],
  user_assets: [
    { id: "a1", user_id: USER, type_id: "expertise", sub_type_id: null, category_id: "c1", title: "Facilitation", description: "10 years" },
  ],
});

describe("ubb_list_artifacts", () => {
  it("summarizes all 18 artifact types, with locked and unlocked-changes states", async () => {
    const { db } = fakeDb({
      user_business_artifacts: [
        artifact("u1", "uniqueness", "v1", T1, { is_locked: true }),
        artifact("u2", "uniqueness", "v2", T2, { specificity_score: 7.5 }),
        artifact("m1", "myth", "v1", T1),
        // Another user's row must not show up.
        { ...artifact("x1", "tribe", "v1", T1), user_id: OTHER_USER },
      ],
    });

    const out = await ubbListArtifacts(db, USER, {});

    expect(out.artifacts).toHaveLength(18);
    const byType = Object.fromEntries(out.artifacts.map((a) => [a.type, a]));
    expect(byType.uniqueness).toMatchObject({
      status: "locked",
      latest_version: 2,
      locked_version: 1,
      version_count: 2,
      specificity: 7.5,
      has_unlocked_changes: true,
    });
    expect(byType.myth).toMatchObject({ status: "draft", latest_version: 1, locked_version: null });
    expect(byType.tribe).toMatchObject({ status: "empty", version_count: 0 });
    expect(byType.uniqueness.content).toBeUndefined();
    expect(out.totals).toEqual({ locked: 1, drafts: 1, empty: 16 });
    expect(out.hard_gate_artifacts.find((g) => g.type === "uniqueness")?.locked).toBe(true);
    expect(out.hard_gate_artifacts.find((g) => g.type === "pain")?.locked).toBe(false);
    expect(out.next_to_generate).toBe("tribe");
  });

  it("includes the latest content only when asked", async () => {
    const { db } = fakeDb({ user_business_artifacts: [artifact("m1", "myth", "v1", T1)] });
    const out = await ubbListArtifacts(db, USER, { include_content: true });
    expect(out.artifacts.find((a) => a.type === "myth")?.content).toEqual({ text: "myth v1" });
  });

  it("reports a read failure as a friendly error", async () => {
    const { db } = fakeDb({}, { fail: { table: "user_business_artifacts", op: "select" } });
    const error = await ubbListArtifacts(db, USER, {}).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).not.toContain(RAW_DB_MESSAGE);
  });
});

describe("ubb_generate_artifact", () => {
  it("builds the founder context, calls generate-artifact and appends v1", async () => {
    const { db, tables, invocations } = fakeDb(
      {
        ...founderSeed(),
        user_business_artifacts: [artifact("u1", "uniqueness", "v1", T1, { is_locked: true })],
      },
      { invoke: () => generated },
    );

    const out = await ubbGenerateArtifact(db, USER, { type: "myth" });

    expect(invocations).toHaveLength(1);
    expect(invocations[0].name).toBe("generate-artifact");
    const body = invocations[0].body;
    expect(body.artifact_key).toBe("myth");
    expect(body.target_language).toBe("en");
    expect(body.sibling_artifacts).toEqual({ uniqueness: { content: { text: "uniqueness v1" }, specificity: 6 } });
    expect(body.root_context.mission).toEqual({ sentence: "Help founders ship", discovered_at: T1 });
    expect(body.root_context.zog_snapshot.id).toBe("z1");
    expect(body.root_context.excalibur_data).toEqual({ offer: { statement: "x" } });
    expect(body.root_context.assets).toEqual([
      { typeId: "expertise", subTypeId: null, categoryId: "c1", title: "Facilitation", description: "10 years" },
    ]);

    const rows = tables.user_business_artifacts.filter((r) => r.artifact_key === "myth");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      user_id: USER,
      version: "v1",
      content_json: { statement: "A first draft" },
      specificity_score: 5.5,
      step_number: 1,
      is_locked: false,
      prompt_version_at_lock: PROMPT_VERSION.myth,
      input_version_at_lock: "abc123def456",
    });
    expect(out).toMatchObject({
      generated: true,
      artifact: { type: "myth", version: 1, specificity: 5.5, locked: false },
      crystallized_action: "Say it to one person today",
      thin_inputs: { mission: false, assets: false, top_talent: false },
    });
  });

  it("is idempotent: when a version exists nothing is generated", async () => {
    const { db, tables, invocations } = fakeDb(
      { user_business_artifacts: [artifact("m1", "myth", "v1", T1)] },
      { invoke: () => generated },
    );

    const out = await ubbGenerateArtifact(db, USER, { type: "myth" });

    expect(out).toMatchObject({ generated: false, reason: "already_exists", artifact: { version: 1 } });
    expect(invocations).toHaveLength(0);
    expect(tables.user_business_artifacts).toHaveLength(1);
  });

  it("still generates with thin inputs and says so", async () => {
    const { db, invocations } = fakeDb({}, { invoke: () => generated });

    const out = await ubbGenerateArtifact(db, USER, { type: "uniqueness", language: "ru" });

    expect(out).toMatchObject({ generated: true, thin_inputs: { mission: true, assets: true, top_talent: true } });
    expect(invocations[0].body.root_context).toEqual({ zog_snapshot: {} });
    expect(invocations[0].body.target_language).toBe("ru");
  });

  it("maps AI failures to friendly messages without leaking the raw error", async () => {
    const run = (result: { data: unknown; error: unknown }) =>
      ubbGenerateArtifact(fakeDb({}, { invoke: () => result }).db, USER, { type: "myth" }).catch((e) => e);

    const rateLimited = await run({ data: null, error: { message: "FunctionsHttpError: 429 Too Many Requests" } });
    expect(rateLimited).toBeInstanceOf(ToolError);
    expect(rateLimited.message).toMatch(/rate-limited/);
    expect(rateLimited.message).not.toContain("FunctionsHttpError");

    const noCredit = await run({ data: { error: "insufficient_credit" }, error: null });
    expect(noCredit.message).toMatch(/credit/i);

    const down = await run({ data: { error: "model_error" }, error: null });
    expect(down.message).toMatch(/briefly unavailable/);
    expect(down.message).not.toContain("model_error");
  });

  it("does not save anything when the AI returns no content", async () => {
    const { db, tables } = fakeDb({}, { invoke: () => ({ data: { initial_specificity: 5 }, error: null }) });
    await expect(ubbGenerateArtifact(db, USER, { type: "myth" })).rejects.toThrow(/returned no content/);
    expect(tables.user_business_artifacts ?? []).toHaveLength(0);
  });

  it("reports a save failure as a friendly error", async () => {
    const { db } = fakeDb({}, { invoke: () => generated, fail: { table: "user_business_artifacts", op: "insert", code: "42501" } });
    const error = await ubbGenerateArtifact(db, USER, { type: "myth" }).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).toMatch(/not allowed to save the generated artifact/i);
    expect(error.message).not.toContain(RAW_DB_MESSAGE);
  });

  it("retries without the stamp columns when PostgREST's schema cache lags", async () => {
    const { db, tables } = fakeDb(
      {},
      {
        invoke: () => generated,
        fail: {
          table: "user_business_artifacts",
          op: "insert",
          times: 1,
          message: "Could not find the 'prompt_version_at_lock' column of 'user_business_artifacts' in the schema cache",
        },
      },
    );

    const out = await ubbGenerateArtifact(db, USER, { type: "myth" });

    expect(out.generated).toBe(true);
    expect(tables.user_business_artifacts).toHaveLength(1);
    expect(tables.user_business_artifacts[0]).not.toHaveProperty("prompt_version_at_lock");
    expect(tables.user_business_artifacts[0]).not.toHaveProperty("input_version_at_lock");
  });

  it("accepts only the 18 known artifact keys", () => {
    const schema = z.object(ubbGenerateArtifactInput);
    expect(schema.safeParse({ type: "landing_page" }).success).toBe(true);
    expect(schema.safeParse({ type: "dossier" }).success).toBe(false);
    expect(schema.safeParse({}).success).toBe(false);
  });
});

describe("ubb_improve_artifact", () => {
  const seedMyth = () => ({
    ...founderSeed(),
    user_business_artifacts: [
      artifact("u1", "uniqueness", "v1", T1, { is_locked: true }),
      artifact("m1", "myth", "v1", T2),
    ],
  });

  it("appends the improvement as a new unlocked version and logs it", async () => {
    const { db, tables, invocations } = fakeDb(seedMyth(), { invoke: () => improved });

    const out = await ubbImproveArtifact(db, USER, { type: "myth" });

    expect(invocations[0].name).toBe("improve-artifact");
    expect(invocations[0].body).toMatchObject({
      artifact_key: "myth",
      current_content: { text: "myth v1" },
      current_specificity: 6,
      previous_versions: [{ text: "myth v1" }],
    });
    // Locked siblings are context, the artifact itself is not.
    expect(Object.keys(invocations[0].body.sibling_artifacts)).toEqual(["uniqueness"]);

    const mythRows = tables.user_business_artifacts.filter((r) => r.artifact_key === "myth");
    expect(mythRows).toHaveLength(2);
    expect(mythRows.find((r) => r.id === "m1")).toMatchObject({ version: "v1", content_json: { text: "myth v1" } });
    const v2 = mythRows.find((r) => r.id !== "m1")!;
    expect(v2).toMatchObject({
      user_id: USER,
      version: "v2",
      parent_version_id: "m1",
      content_json: { statement: "A sharper draft" },
      specificity_score: 7.4,
      what_changed: "Named the tribe",
      step_number: 2,
      is_locked: false,
      prompt_version_at_lock: PROMPT_VERSION.myth,
      input_version_at_lock: "zz99",
    });

    expect(tables.artifact_improvements).toHaveLength(1);
    expect(tables.artifact_improvements[0]).toMatchObject({
      artifact_key: "myth",
      artifact_before_id: "m1",
      artifact_after_id: v2.id,
      specificity_before: 6,
      specificity_after: 7.4,
      specificity_delta: 1.4,
      accepted: true,
    });
    expect(out).toMatchObject({ improved: true, applied: true, version: 2, previous_version: 1, locked: false });
  });

  it("builds on the newest version when several exist", async () => {
    const { db, tables, invocations } = fakeDb(
      {
        user_business_artifacts: [
          artifact("m1", "myth", "v1", T1),
          artifact("m2", "myth", "v2", T2, { specificity_score: 7 }),
        ],
      },
      { invoke: () => improved },
    );

    await ubbImproveArtifact(db, USER, { type: "myth" });

    expect(invocations[0].body.current_content).toEqual({ text: "myth v2" });
    expect(invocations[0].body.previous_versions).toEqual([{ text: "myth v2" }, { text: "myth v1" }]);
    expect(tables.user_business_artifacts.find((r) => r.version === "v3")).toMatchObject({ parent_version_id: "m2" });
  });

  it("clamps a score above 10", async () => {
    const { db, tables } = fakeDb(
      { user_business_artifacts: [artifact("m1", "myth", "v1", T1, { specificity_score: 9.5 })] },
      { invoke: () => ({ data: { ...improved.data, specificity_score: 10.2 }, error: null }) },
    );

    await ubbImproveArtifact(db, USER, { type: "myth" });

    expect(tables.user_business_artifacts.find((r) => r.version === "v2")?.specificity_score).toBe(10);
  });

  it("apply=false previews without saving anything", async () => {
    const { db, tables } = fakeDb(seedMyth(), { invoke: () => improved });

    const out = await ubbImproveArtifact(db, USER, { type: "myth", apply: false });

    expect(out).toMatchObject({
      improved: false,
      applied: false,
      preview: true,
      proposal: { content: { statement: "A sharper draft" }, specificity_after: 7.4, specificity_delta: 1.4 },
    });
    expect(tables.user_business_artifacts).toHaveLength(2);
    expect(tables.artifact_improvements ?? []).toHaveLength(0);
  });

  it("saves nothing on diminishing returns", async () => {
    const { db, tables } = fakeDb(seedMyth(), {
      invoke: () => ({ data: { ...improved.data, diminishing_returns: true }, error: null }),
    });

    const out = await ubbImproveArtifact(db, USER, { type: "myth" });

    expect(out).toMatchObject({ improved: false, reason: "diminishing_returns" });
    expect(tables.user_business_artifacts).toHaveLength(2);
  });

  it("skips the AI call at 10/10", async () => {
    const { db, invocations } = fakeDb(
      { user_business_artifacts: [artifact("m1", "myth", "v1", T1, { specificity_score: 10 })] },
      { invoke: () => improved },
    );

    const out = await ubbImproveArtifact(db, USER, { type: "myth" });

    expect(out).toMatchObject({ improved: false, reason: "max_specificity" });
    expect(invocations).toHaveLength(0);
  });

  it("tells the agent to generate first when there is no draft", async () => {
    const { db, invocations } = fakeDb({}, { invoke: () => improved });
    const error = await ubbImproveArtifact(db, USER, { type: "myth" }).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).toMatch(/ubb_generate_artifact/);
    expect(invocations).toHaveLength(0);
  });

  it("maps an AI failure to a friendly message", async () => {
    const { db, tables } = fakeDb(seedMyth(), { invoke: () => ({ data: null, error: { message: "boom 500 internal" } }) });
    const error = await ubbImproveArtifact(db, USER, { type: "myth" }).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).toMatch(/briefly unavailable/);
    expect(error.message).not.toContain("boom");
    expect(tables.user_business_artifacts).toHaveLength(2);
  });

  it("keeps the saved version when only the improvement log fails", async () => {
    const { db, tables } = fakeDb(seedMyth(), {
      invoke: () => improved,
      fail: { table: "artifact_improvements", op: "insert" },
    });

    const out = await ubbImproveArtifact(db, USER, { type: "myth" });

    expect(out).toMatchObject({ improved: true, version: 2 });
    expect(tables.user_business_artifacts.filter((r) => r.artifact_key === "myth")).toHaveLength(2);
  });
});

describe("ubb_lock_artifact", () => {
  it("locks the latest version", async () => {
    const { db, tables } = fakeDb({
      user_business_artifacts: [artifact("m1", "myth", "v1", T1), artifact("m2", "myth", "v2", T2)],
    });

    const out = await ubbLockArtifact(db, USER, { type: "myth" });

    expect(out).toMatchObject({ type: "myth", locked: true, changed: true, version: 2 });
    expect(tables.user_business_artifacts.find((r) => r.id === "m2")?.is_locked).toBe(true);
    expect(tables.user_business_artifacts.find((r) => r.id === "m1")?.is_locked).toBe(false);
  });

  it("is idempotent when the latest version is already locked", async () => {
    const { db } = fakeDb({ user_business_artifacts: [artifact("m1", "myth", "v1", T1, { is_locked: true })] });
    const out = await ubbLockArtifact(db, USER, { type: "myth" });
    expect(out).toMatchObject({ locked: true, changed: false, version: 1 });
  });

  it("flags locked downstream artifacts that may now be stale", async () => {
    const { db } = fakeDb({
      user_business_artifacts: [
        artifact("u1", "uniqueness", "v1", T1),
        artifact("m1", "myth", "v1", T1, { is_locked: true }),
        artifact("t1", "tribe", "v1", T1),
        artifact("c1", "core_belief", "v1", T1, { is_locked: true }),
        artifact("s1", "surface_inventory", "v1", T1, { is_locked: true }), // not downstream of uniqueness
      ],
    });

    const out = await ubbLockArtifact(db, USER, { type: "uniqueness" });

    expect(out.rederive_suggested?.sort()).toEqual(["core_belief", "myth"]);
  });

  it("unlocks the locked version with locked=false", async () => {
    const { db, tables } = fakeDb({
      user_business_artifacts: [artifact("m1", "myth", "v1", T1, { is_locked: true }), artifact("m2", "myth", "v2", T2)],
    });

    const out = await ubbLockArtifact(db, USER, { type: "myth", locked: false });

    expect(out).toMatchObject({ locked: false, changed: true, version: 1 });
    expect(tables.user_business_artifacts.every((r) => r.is_locked === false)).toBe(true);

    const again = await ubbLockArtifact(db, USER, { type: "myth", locked: false });
    expect(again).toMatchObject({ locked: false, changed: false });
  });

  it("explains what to do when there is nothing to lock", async () => {
    const { db } = fakeDb();
    const error = await ubbLockArtifact(db, USER, { type: "myth" }).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).toMatch(/ubb_generate_artifact/);
  });

  it("does not lock another user's artifact", async () => {
    const { db, tables } = fakeDb({
      user_business_artifacts: [{ ...artifact("x1", "myth", "v1", T1), user_id: OTHER_USER }],
    });

    await expect(ubbLockArtifact(db, USER, { type: "myth" })).rejects.toBeInstanceOf(ToolError);
    expect(tables.user_business_artifacts[0].is_locked).toBe(false);
  });

  it("reports a write failure as a friendly error", async () => {
    const { db } = fakeDb(
      { user_business_artifacts: [artifact("m1", "myth", "v1", T1)] },
      { fail: { table: "user_business_artifacts", op: "update", code: "42501" } },
    );
    const error = await ubbLockArtifact(db, USER, { type: "myth" }).catch((e) => e);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.message).toMatch(/not allowed to lock the artifact/i);
    expect(error.message).not.toContain(RAW_DB_MESSAGE);
  });
});

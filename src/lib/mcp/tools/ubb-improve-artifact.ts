import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { nextVersionString } from "../../../modules/unique-business-builder/constants";
import type { ArtifactKey } from "../../../modules/unique-business-builder/types";
import { WRITE_APPEND, ToolError, runForUser, unwrapFunction, type Db } from "./_shared";
import {
  artifactTypeSchema,
  clampSpecificity,
  contentOf,
  insertArtifactVersion,
  languageSchema,
  loadArtifactRows,
  loadRootContext,
  promptVersionFor,
  siblingContext,
  versionNumber,
} from "./ubb-shared";

export const ubbImproveArtifactInput = {
  type: artifactTypeSchema,
  apply: z
    .boolean()
    .default(true)
    .describe(
      "true (default): save the improvement as a new version. false: preview only, return the proposed improvement without saving anything.",
    ),
  language: languageSchema,
};

type ImproveResult = {
  roast_findings?: unknown;
  improved_content?: unknown;
  what_changed?: string;
  specificity_score?: number;
  crystallized_action?: string;
  diminishing_returns?: boolean;
  input_version_at_lock?: string;
};

/**
 * One Improve pass (27-perspective roast) via the improve-artifact edge
 * function, then append the result as a new version, exactly what the page
 * does on "accept". Versions are append-only; the previous row is untouched.
 */
export async function ubbImproveArtifact(
  db: Db,
  userId: string,
  input: { type: ArtifactKey; apply?: boolean; language?: string },
) {
  const key = input.type;
  const rows = await loadArtifactRows(db, userId);
  const history = rows.filter((r) => r.artifact_key === key);
  const current = history[0];
  if (!current) {
    throw new ToolError(`There is no draft of "${key}" yet. Generate one first with ubb_generate_artifact.`);
  }

  const currentScore = Number(current.specificity_score ?? 0);
  if (currentScore >= 10) {
    return {
      improved: false,
      reason: "max_specificity",
      hint: "Already at 10/10. Sharpen a sibling artifact, then revisit.",
      version: versionNumber(current),
      specificity: currentScore,
    };
  }

  const rootContext = await loadRootContext(db, userId);
  const invoked = await db.functions.invoke("improve-artifact", {
    body: {
      artifact_key: key,
      current_content: contentOf(current),
      current_specificity: currentScore,
      sibling_artifacts: siblingContext(rows, key),
      root_context: rootContext,
      previous_versions: history.slice(0, 3).map(contentOf),
      target_language: input.language ?? "en",
    },
  });
  const result = unwrapFunction(invoked as { data: ImproveResult | null; error: unknown }, "improve the artifact");

  if (result.diminishing_returns) {
    return {
      improved: false,
      reason: "diminishing_returns",
      hint: "This version may be at its current ceiling. Try again after surrounding artifacts sharpen.",
      version: versionNumber(current),
      specificity: currentScore,
    };
  }
  if (result.improved_content === undefined || result.improved_content === null) {
    throw new ToolError("Could not improve the artifact: the AI returned no improvement. Try again in a minute.");
  }

  const newScore = clampSpecificity(result.specificity_score);
  const delta = Number((newScore - currentScore).toFixed(1));
  const proposal = {
    what_changed: result.what_changed ?? null,
    specificity_before: currentScore,
    specificity_after: newScore,
    specificity_delta: delta,
    roast_findings: result.roast_findings ?? null,
    crystallized_action: result.crystallized_action ?? null,
    content: result.improved_content,
  };

  if (input.apply === false) {
    return { improved: false, applied: false, preview: true, version: versionNumber(current), proposal };
  }

  const row = await insertArtifactVersion(
    db,
    {
      user_id: userId,
      artifact_key: key,
      version: nextVersionString(current.version),
      content_json: result.improved_content,
      specificity_score: newScore,
      parent_version_id: current.id,
      roast_findings: result.roast_findings ?? null,
      what_changed: result.what_changed ?? null,
      step_number: versionNumber(current) + 1,
      is_locked: false,
      output_language: input.language ?? "en",
      prompt_version_at_lock: promptVersionFor(key),
      input_version_at_lock: result.input_version_at_lock ?? null,
    },
    "save the improved artifact",
  );

  // Improvement log is analytics; a failure here must not undo or hide the saved version.
  const logged = await db.from("artifact_improvements").insert({
    user_id: userId,
    artifact_key: key,
    artifact_before_id: current.id,
    artifact_after_id: row.id,
    roast_findings: result.roast_findings ?? null,
    what_changed: result.what_changed ?? null,
    crystallized_action: result.crystallized_action ?? null,
    specificity_before: currentScore,
    specificity_after: newScore,
    specificity_delta: delta,
    accepted: true,
    diminishing_returns: false,
  });
  if (logged?.error) console.error("[mcp] improvement log failed", (logged.error as { code?: string }).code ?? "no-code");

  return {
    improved: true,
    applied: true,
    version: versionNumber(row),
    previous_version: versionNumber(current),
    locked: false,
    proposal,
    next: "Improve again, or ubb_lock_artifact when it is right. The new version is unlocked.",
  };
}

export default defineTool({
  name: "ubb_improve_artifact",
  title: "Improve a Unique Business artifact",
  description:
    "Run one Improve pass on a Unique Business Builder artifact: a 27-perspective roast that returns a sharper version with a higher specificity score. By default the result is saved as a NEW (unlocked) version; previous versions are kept. Pass apply=false to preview without saving. Takes up to a minute (AI call). Not idempotent: each applied call adds a version.",
  inputSchema: ubbImproveArtifactInput,
  annotations: WRITE_APPEND,
  handler: (input, ctx) =>
    runForUser(ctx, "improve the artifact", (db, userId) => ubbImproveArtifact(db, userId, input)),
});

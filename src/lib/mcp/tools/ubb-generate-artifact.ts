import { defineTool } from "@lovable.dev/mcp-js";
import type { ArtifactKey } from "../../../modules/unique-business-builder/types";
import { WRITE_IDEMPOTENT, ToolError, runForUser, unwrapFunction, type Db } from "./_shared";
import {
  type ArtifactRow,
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

export const ubbGenerateArtifactInput = {
  type: artifactTypeSchema,
  language: languageSchema,
};

type GenerateResult = {
  content: unknown;
  initial_specificity: number;
  crystallized_action?: string;
  input_version_at_lock?: string;
};

/**
 * Produce v1 of an artifact: the same generate-artifact edge function and the
 * same user_business_artifacts insert the Unique Business Builder page uses.
 * Idempotent: when a version already exists nothing is generated and the
 * existing latest is returned (use ubb_improve_artifact to evolve it).
 */
export async function ubbGenerateArtifact(
  db: Db,
  userId: string,
  input: { type: ArtifactKey; language?: string },
) {
  const key = input.type;
  const rows = await loadArtifactRows(db, userId);
  const existing = rows.find((r) => r.artifact_key === key);
  if (existing) {
    return {
      generated: false,
      reason: "already_exists",
      hint: "A version already exists. Use ubb_improve_artifact to sharpen it.",
      artifact: describe(key, existing),
    };
  }

  const rootContext = await loadRootContext(db, userId);
  const invoked = await db.functions.invoke("generate-artifact", {
    body: {
      artifact_key: key,
      sibling_artifacts: siblingContext(rows, key),
      root_context: rootContext,
      target_language: input.language ?? "en",
    },
  });
  const result = unwrapFunction(invoked as { data: GenerateResult | null; error: unknown }, "generate the artifact");
  if (result.content === undefined || result.content === null) {
    throw new ToolError("Could not generate the artifact: the AI returned no content. Try again in a minute.");
  }

  const row = await insertArtifactVersion(
    db,
    {
      user_id: userId,
      artifact_key: key,
      version: "v1",
      content_json: result.content,
      specificity_score: clampSpecificity(result.initial_specificity),
      step_number: 1,
      is_locked: false,
      output_language: input.language ?? "en",
      prompt_version_at_lock: promptVersionFor(key),
      input_version_at_lock: result.input_version_at_lock ?? null,
    },
    "save the generated artifact",
  );

  return {
    generated: true,
    artifact: describe(key, row),
    crystallized_action: result.crystallized_action ?? null,
    thin_inputs: {
      mission: !rootContext.mission,
      assets: !rootContext.assets,
      top_talent: Object.keys(rootContext.zog_snapshot).length === 0,
    },
    next: "Review the content, then ubb_improve_artifact to sharpen it and ubb_lock_artifact when it is right.",
  };
}

function describe(key: ArtifactKey, row: ArtifactRow) {
  return {
    type: key,
    version: versionNumber(row),
    specificity: Number(row.specificity_score ?? 0),
    locked: Boolean(row.is_locked),
    content: contentOf(row),
  };
}

export default defineTool({
  name: "ubb_generate_artifact",
  title: "Generate a Unique Business artifact",
  description:
    "Generate the first draft (v1) of one Unique Business Builder artifact for the signed-in user, using their Top Talent, mission, assets and locked sibling artifacts. Takes up to a minute (AI call). If a version already exists nothing is generated and the existing one is returned.",
  inputSchema: ubbGenerateArtifactInput,
  annotations: WRITE_IDEMPOTENT,
  handler: (input, ctx) =>
    runForUser(ctx, "generate the artifact", (db, userId) => ubbGenerateArtifact(db, userId, input)),
});

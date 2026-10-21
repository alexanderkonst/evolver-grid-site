import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getDownstream } from "../../../modules/unique-business-builder/dependencyTree";
import type { ArtifactKey } from "../../../modules/unique-business-builder/types";
import { WRITE_IDEMPOTENT, ToolError, runForUser, unwrap, type Db } from "./_shared";
import { artifactTypeSchema, loadArtifactRows, versionNumber } from "./ubb-shared";

export const ubbLockArtifactInput = {
  type: artifactTypeSchema,
  locked: z
    .boolean()
    .default(true)
    .describe("true (default): lock the latest version so it feeds sibling artifacts. false: unlock the locked version."),
};

/**
 * Lock the latest version (or unlock the locked one): the same single
 * `is_locked` update the page's Lock & Continue / Unlock buttons do.
 */
export async function ubbLockArtifact(db: Db, userId: string, input: { type: ArtifactKey; locked?: boolean }) {
  const key = input.type;
  const rows = await loadArtifactRows(db, userId);
  const history = rows.filter((r) => r.artifact_key === key);
  const wantLocked = input.locked !== false;

  if (!wantLocked) {
    const locked = history.find((r) => r.is_locked);
    if (!locked) return { type: key, locked: false, changed: false, hint: "It was not locked." };
    unwrap(
      await db.from("user_business_artifacts").update({ is_locked: false }).eq("id", locked.id).eq("user_id", userId),
      "unlock the artifact",
    );
    return { type: key, locked: false, changed: true, version: versionNumber(locked) };
  }

  const latest = history[0];
  if (!latest) {
    throw new ToolError(`There is no draft of "${key}" to lock. Generate one first with ubb_generate_artifact.`);
  }
  if (latest.is_locked) {
    return { type: key, locked: true, changed: false, version: versionNumber(latest) };
  }

  unwrap(
    await db.from("user_business_artifacts").update({ is_locked: true }).eq("id", latest.id).eq("user_id", userId),
    "lock the artifact",
  );

  // Locked descendants were derived from the previous upstream version; the UI offers a re-derive prompt.
  const lockedDescendants = getDownstream(key).filter((d) => rows.some((r) => r.artifact_key === d && r.is_locked));
  return {
    type: key,
    locked: true,
    changed: true,
    version: versionNumber(latest),
    specificity: Number(latest.specificity_score ?? 0),
    rederive_suggested: lockedDescendants,
  };
}

export default defineTool({
  name: "ubb_lock_artifact",
  title: "Lock a Unique Business artifact",
  description:
    "Lock the latest version of a Unique Business Builder artifact so it becomes context for the artifacts downstream of it (or unlock it with locked=false). Reports locked downstream artifacts that may now be stale and worth re-improving. Safe to repeat.",
  inputSchema: ubbLockArtifactInput,
  annotations: WRITE_IDEMPOTENT,
  handler: (input, ctx) =>
    runForUser(ctx, "lock the artifact", (db, userId) => ubbLockArtifact(db, userId, input)),
});

import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { HARD_GATE_ARTIFACTS } from "../../../modules/unique-business-builder/types";
import { READ_ONLY, runForUser, type Db } from "./_shared";
import { loadArtifactRows, summarizeArtifacts } from "./ubb-shared";

export const ubbListArtifactsInput = {
  include_content: z
    .boolean()
    .default(false)
    .describe("Include the latest version's full content for each artifact. Default false (summaries only)."),
};

export async function ubbListArtifacts(db: Db, userId: string, input: { include_content?: boolean }) {
  const rows = await loadArtifactRows(db, userId);
  const artifacts = summarizeArtifacts(rows, input.include_content === true);
  const next = artifacts.find((a) => a.status === "empty");
  return {
    artifacts,
    totals: {
      locked: artifacts.filter((a) => a.status === "locked").length,
      drafts: artifacts.filter((a) => a.status === "draft").length,
      empty: artifacts.filter((a) => a.status === "empty").length,
    },
    // Dossier publishing is gated on these being locked.
    hard_gate_artifacts: HARD_GATE_ARTIFACTS.map((key) => ({
      type: key,
      locked: artifacts.find((a) => a.type === key)?.status === "locked",
    })),
    next_to_generate: next?.type ?? null,
  };
}

export default defineTool({
  name: "ubb_list_artifacts",
  title: "List Unique Business artifacts",
  description:
    "List the signed-in user's Unique Business Builder artifacts (18 types): status (empty / draft / locked), latest version, specificity score 0-10, version count. Optionally include the latest content. Also reports which hard-gate artifacts still need locking and the next type to generate.",
  inputSchema: ubbListArtifactsInput,
  annotations: READ_ONLY,
  handler: (input, ctx) =>
    runForUser(ctx, "list the artifacts", (db, userId) => ubbListArtifacts(db, userId, input)),
});

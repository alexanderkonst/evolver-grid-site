import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { ASSET_TYPES } from "../../../modules/asset-mapping/data/assetTypes";
import { READ_ONLY, runForUser, unwrap, type Db } from "./_shared";

const ASSET_TYPE_IDS = ASSET_TYPES.map((t) => t.id) as [string, ...string[]];

export const listAssetsInput = {
  type: z.enum(ASSET_TYPE_IDS).optional().describe("Only list assets of this type."),
};

export async function listAssets(db: Db, userId: string, input: { type?: string }) {
  let query = db
    .from("user_assets")
    .select("id, type_id, sub_type_id, category_id, title, description, source, created_at")
    .eq("user_id", userId);
  if (input.type) query = query.eq("type_id", input.type);
  const rows = (unwrap(await query.order("created_at", { ascending: true }), "read the assets") ?? []) as {
    id: string;
    type_id: string;
    sub_type_id: string | null;
    category_id: string | null;
    title: string;
    description: string | null;
    source: string | null;
    created_at: string;
  }[];

  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.type_id] = (counts[r.type_id] ?? 0) + 1;

  return {
    assets: rows.map((r) => ({
      id: r.id,
      type: r.type_id,
      sub_type: r.sub_type_id,
      category: r.category_id,
      title: r.title,
      description: r.description,
      source: r.source,
      added_at: r.created_at,
    })),
    count: rows.length,
    counts_by_type: counts,
  };
}

export default defineTool({
  name: "list_assets",
  title: "List assets",
  description: "List the signed-in user's mapped assets (expertise, experiences, networks, resources, IP, influence), optionally filtered by type.",
  inputSchema: listAssetsInput,
  annotations: READ_ONLY,
  handler: (input, ctx) => runForUser(ctx, "read the assets", (db, userId) => listAssets(db, userId, input)),
});

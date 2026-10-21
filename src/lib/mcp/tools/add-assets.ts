import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { ASSET_TYPES } from "../../../modules/asset-mapping/data/assetTypes";
import { WRITE_IDEMPOTENT, normalizeText, runForUser, unwrap, type Db } from "./_shared";

const MAX_ASSETS_PER_CALL = 50;
const ASSET_TYPE_IDS = ASSET_TYPES.map((t) => t.id) as [string, ...string[]];

export const addAssetsInput = {
  assets: z
    .array(
      z.object({
        type: z
          .enum(ASSET_TYPE_IDS)
          .describe("expertise (skills, knowledge) | experiences | networks | resources (material) | ip (intellectual property) | influence"),
        title: z.string().trim().min(1).max(200).describe("Short name of the asset."),
        description: z.string().trim().max(2000).optional().describe("Optional detail."),
        sub_type: z.string().trim().max(80).optional().describe("Optional sub-type id."),
        category: z.string().trim().max(80).optional().describe("Optional category id."),
      }),
    )
    .min(1)
    .max(MAX_ASSETS_PER_CALL)
    .describe(`1-${MAX_ASSETS_PER_CALL} assets to add to the user's asset map.`),
};

type AssetInput = { type: string; title: string; description?: string; sub_type?: string; category?: string };

/**
 * Same behaviour as saveAssets in assetSync.ts: skip titles the user already
 * has (case/space-insensitive), insert the rest, ignore duplicate races, and
 * stamp `resources_mapped_at` the first time.
 */
export async function addAssets(db: Db, userId: string, input: { assets: AssetInput[] }) {
  const existing = (unwrap(
    await db.from("user_assets").select("title").eq("user_id", userId),
    "read the current assets",
  ) ?? []) as { title: string }[];
  const seen = new Set(existing.map((a) => normalizeText(a.title)));

  const rows: Record<string, unknown>[] = [];
  const skipped: string[] = [];
  for (const asset of input.assets) {
    const key = normalizeText(asset.title);
    if (!key || seen.has(key)) {
      skipped.push(asset.title);
      continue;
    }
    seen.add(key);
    rows.push({
      user_id: userId,
      type_id: asset.type,
      sub_type_id: asset.sub_type || null,
      category_id: asset.category || null,
      title: asset.title.trim(),
      description: asset.description || null,
      source: "ai",
    });
  }

  if (rows.length > 0) {
    unwrap(await db.from("user_assets").upsert(rows, { ignoreDuplicates: true }), "save the assets");
    // First-write-wins pointer that ticks "Map your assets" in the JOURNEY. Best effort, as in the UI.
    await db
      .from("game_profiles")
      .update({ resources_mapped_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("resources_mapped_at", null);
  }

  return { saved: rows.length, skipped: skipped.length, skipped_titles: skipped };
}

export default defineTool({
  name: "add_assets",
  title: "Add assets",
  description:
    "Add assets (expertise, experiences, networks, material resources, IP, influence) to the signed-in user's asset map. Titles the user already has are skipped, so repeating a call adds nothing new. Existing assets are never changed or removed.",
  inputSchema: addAssetsInput,
  annotations: WRITE_IDEMPOTENT,
  handler: (input, ctx) => runForUser(ctx, "save the assets", (db, userId) => addAssets(db, userId, input)),
});

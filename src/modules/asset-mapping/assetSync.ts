/**
 * Asset Sync — localStorage ↔ Supabase `user_assets` table
 * 
 * Handles the migration from localStorage-only assets to DB-backed assets.
 * On load: reads DB, merges with any localStorage-only assets, writes back.
 * On save: writes to both localStorage (for instant reads) and DB (for matching).
 */

import { supabase } from "@/integrations/supabase/client";

export interface SavedAsset {
  typeId: string;
  subTypeId?: string;
  categoryId?: string;
  title: string;
  description?: string;
  savedAt: string;
  source?: string;
}

interface DbAsset {
  id: string;
  user_id: string;
  type_id: string;
  sub_type_id: string | null;
  category_id: string | null;
  title: string;
  description: string | null;
  source: string | null;
  created_at: string;
}

const getLocalStorageKey = (userId: string) => `user_assets_${userId}`;

/**
 * Day 65 wave 8 (Sasha 2026-05-15): mark `game_profiles.resources_mapped_at`
 * the first time a user successfully writes an asset to the DB. Drives
 * JOURNEY item #5 ("Map your assets") strikethrough plus any other
 * downstream "user has mapped" gates.
 *
 * Idempotent: the `.is("resources_mapped_at", null)` filter means only
 * the first call actually writes; subsequent calls match zero rows.
 * Silent on error — pointer is nice-to-have, not load-blocking; the
 * client-side fallback in useJourneyProgress probes `user_assets`
 * directly if this column is null, so a failed pointer write still
 * shows up as a struck-through row (just with an extra round trip).
 */
const markResourcesMapped = async (userId: string): Promise<void> => {
  try {
    await (supabase as any)
      .from("game_profiles")
      .update({ resources_mapped_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("resources_mapped_at", null);
  } catch {
    // silent — see comment above.
  }
};

/** Read assets from localStorage */
export const readLocalAssets = (userId: string): SavedAsset[] => {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/** Write assets to localStorage */
export const writeLocalAssets = (userId: string, assets: SavedAsset[]) => {
  localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(assets));
};

/** Convert DB row to SavedAsset */
const dbToLocal = (row: DbAsset): SavedAsset => ({
  typeId: row.type_id,
  subTypeId: row.sub_type_id || undefined,
  categoryId: row.category_id || undefined,
  title: row.title,
  description: row.description || undefined,
  savedAt: row.created_at,
  source: row.source || "manual",
});

/** Convert SavedAsset to DB insert shape */
const localToDb = (asset: SavedAsset, userId: string) => ({
  user_id: userId,
  type_id: asset.typeId,
  sub_type_id: asset.subTypeId || null,
  category_id: asset.categoryId || null,
  title: asset.title,
  description: asset.description || null,
  source: asset.source || "manual",
});

/**
 * Load assets: DB-first, with localStorage backfill.
 * 
 * 1. Read from DB
 * 2. Read from localStorage
 * 3. Any localStorage assets not in DB → insert to DB
 * 4. Return merged list
 */
export const loadAndSyncAssets = async (userId: string): Promise<SavedAsset[]> => {
  // Try to read from DB
  const { data: dbRows, error } = await (supabase as any)
    .from("user_assets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  // If DB table doesn't exist yet (migration not applied), fall back to localStorage
  if (error) {
    console.warn("user_assets table not available, using localStorage:", error.message);
    return readLocalAssets(userId);
  }

  const dbAssets: SavedAsset[] = (dbRows || []).map(dbToLocal);
  const localAssets = readLocalAssets(userId);

  // Find localStorage assets not yet in DB (by title match)
  const dbTitles = new Set(dbAssets.map(a => a.title.trim().toLowerCase()));
  const missingFromDb = localAssets.filter(
    a => !dbTitles.has(a.title.trim().toLowerCase())
  );

  // Backfill missing assets to DB
  if (missingFromDb.length > 0) {
    const inserts = missingFromDb.map(a => localToDb(a, userId));
    const { error: insertError } = await (supabase as any)
      .from("user_assets")
      .upsert(inserts, { ignoreDuplicates: true });

    if (insertError) {
      console.warn("Failed to sync localStorage assets to DB:", insertError.message);
    } else {
      // First-write-wins pointer for JOURNEY item #5 strikethrough.
      await markResourcesMapped(userId);
    }
  } else if (dbAssets.length > 0) {
    // Existing assets in DB but no pointer write happened. Backfills
    // pointer for legacy accounts that may have inserted before this
    // helper existed. Idempotent.
    await markResourcesMapped(userId);
  }

  // Merge and deduplicate
  const allAssets = [...dbAssets];
  for (const local of localAssets) {
    if (!dbTitles.has(local.title.trim().toLowerCase())) {
      allAssets.push(local);
    }
  }

  // Update localStorage with the unified list
  writeLocalAssets(userId, allAssets);

  return allAssets;
};

/**
 * Save a single asset to both localStorage and DB.
 */
export const saveAsset = async (userId: string, asset: SavedAsset): Promise<boolean> => {
  // Save to localStorage immediately
  const existing = readLocalAssets(userId);
  const normalizedTitle = asset.title.trim().toLowerCase();
  const alreadyExists = existing.some(
    a => a.title.trim().toLowerCase() === normalizedTitle
  );

  if (!alreadyExists) {
    existing.push(asset);
    writeLocalAssets(userId, existing);
  }

  // Save to DB (upsert to handle unique constraint gracefully)
  const { error } = await (supabase as any)
    .from("user_assets")
    .upsert(localToDb(asset, userId), { ignoreDuplicates: true });

  if (error) {
    // DB might not be available yet; localStorage is the fallback
    console.warn("Failed to save asset to DB:", error.message);
    return false;
  }

  // First-write-wins pointer for JOURNEY item #5 strikethrough.
  await markResourcesMapped(userId);
  return true;
};

/**
 * Save multiple assets to both localStorage and DB.
 */
export const saveAssets = async (userId: string, assets: SavedAsset[]): Promise<{ saved: number; skipped: number }> => {
  const existing = readLocalAssets(userId);
  const existingTitles = new Set(
    existing.map(a => a.title.trim().toLowerCase())
  );

  const newAssets: SavedAsset[] = [];
  let skipped = 0;

  for (const asset of assets) {
    const norm = asset.title.trim().toLowerCase();
    if (!norm || existingTitles.has(norm)) {
      skipped++;
      continue;
    }
    newAssets.push(asset);
    existingTitles.add(norm);
  }

  if (newAssets.length === 0) {
    return { saved: 0, skipped };
  }

  // Save to localStorage
  const updated = [...existing, ...newAssets];
  writeLocalAssets(userId, updated);

  // Save to DB (upsert to handle unique constraint gracefully)
  const inserts = newAssets.map(a => localToDb(a, userId));
  const { error } = await (supabase as any)
    .from("user_assets")
    .upsert(inserts, { ignoreDuplicates: true });

  if (error) {
    console.warn("Failed to save assets to DB:", error.message);
  } else {
    // First-write-wins pointer for JOURNEY item #5 strikethrough.
    await markResourcesMapped(userId);
  }

  return { saved: newAssets.length, skipped };
};

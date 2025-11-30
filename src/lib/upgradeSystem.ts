import { supabase } from "@/integrations/supabase/client";
import { awardXp } from "./xpSystem";

export interface Upgrade {
  id: string;
  code: string;
  title: string;
  short_label: string;
  description: string;
  path_slug: string;
  branch: string;
  is_paid: boolean;
  xp_reward: number;
  sort_order: number;
}

export interface PlayerUpgrade {
  id: string;
  profile_id: string;
  upgrade_id: string;
  status: string;
  completed_at: string | null;
}

/**
 * Mark an upgrade as completed for a profile
 * Awards XP and updates level (idempotent - won't double-award)
 */
export async function completeUpgrade(
  profileId: string,
  upgradeCode: string
): Promise<{ success: boolean; error?: any }> {
  try {
    // Get the upgrade from catalog
    const { data: upgrade, error: upgradeError } = await supabase
      .from('upgrade_catalog')
      .select('*')
      .eq('code', upgradeCode)
      .single();

    if (upgradeError) throw upgradeError;
    if (!upgrade) throw new Error('Upgrade not found');

    // Check if already completed
    const { data: existing, error: checkError } = await supabase
      .from('player_upgrades')
      .select('id')
      .eq('profile_id', profileId)
      .eq('upgrade_id', upgrade.id)
      .maybeSingle();

    if (checkError) throw checkError;

    // If already completed, return success (idempotent)
    if (existing) {
      return { success: true };
    }

    // Insert player_upgrade record
    const { error: insertError } = await supabase
      .from('player_upgrades')
      .insert({
        profile_id: profileId,
        upgrade_id: upgrade.id,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

    if (insertError) throw insertError;

    // Award XP (xpSystem will handle total + path-specific)
    await awardXp(profileId, upgrade.xp_reward, upgrade.path_slug);

    return { success: true };
  } catch (error) {
    console.error('Error completing upgrade:', error);
    return { success: false, error };
  }
}

/**
 * Get all upgrades from catalog for a specific path/branch
 */
export async function getUpgradesByBranch(
  pathSlug: string,
  branch: string
): Promise<Upgrade[]> {
  const { data, error } = await supabase
    .from('upgrade_catalog')
    .select('*')
    .eq('path_slug', pathSlug)
    .eq('branch', branch)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching upgrades:', error);
    return [];
  }

  return data || [];
}

/**
 * Get player's completed upgrades
 */
export async function getPlayerUpgrades(
  profileId: string
): Promise<{ upgradeId: string; code: string; completedAt: string | null }[]> {
  const { data, error } = await supabase
    .from('player_upgrades')
    .select(`
      id,
      upgrade_id,
      completed_at,
      upgrade_catalog!inner(code)
    `)
    .eq('profile_id', profileId);

  if (error) {
    console.error('Error fetching player upgrades:', error);
    return [];
  }

  return (data || []).map((pu: any) => ({
    upgradeId: pu.upgrade_id,
    code: pu.upgrade_catalog.code,
    completedAt: pu.completed_at,
  }));
}

/**
 * Check if a specific upgrade is completed
 */
export async function isUpgradeCompleted(
  profileId: string,
  upgradeCode: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('player_upgrades')
    .select(`
      id,
      upgrade_catalog!inner(code)
    `)
    .eq('profile_id', profileId)
    .eq('upgrade_catalog.code', upgradeCode)
    .maybeSingle();

  if (error) {
    console.error('Error checking upgrade completion:', error);
    return false;
  }

  return !!data;
}

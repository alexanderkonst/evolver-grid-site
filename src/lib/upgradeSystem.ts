import { supabase } from "@/integrations/supabase/client";
import { awardXp } from "./xpSystem";

/**
 * Unlock effects applied when an upgrade is completed
 */
export interface UnlockEffects {
  unlock_next_upgrades?: string[];  // upgrade codes that become available
  unlock_practice_tags?: string[];  // practice tags to recommend
  capability_flags?: string[];      // feature flags unlocked
}

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
  prereqs?: string[]; // codes of required upgrades
  unlock_effects?: UnlockEffects;
  unlock_hint?: string; // hint shown when locked
}

export interface PlayerUpgrade {
  id: string;
  profile_id: string;
  upgrade_id: string;
  status: string;
  completed_at: string | null;
}

/**
 * Check if an upgrade is unlocked based on completed upgrades
 */
export function isUpgradeUnlocked(
  upgrade: Upgrade,
  completedCodes: Set<string>
): { unlocked: boolean; missingPrereqs: string[] } {
  if (!upgrade.prereqs || upgrade.prereqs.length === 0) {
    return { unlocked: true, missingPrereqs: [] };
  }

  const missing = upgrade.prereqs.filter(code => !completedCodes.has(code));
  return {
    unlocked: missing.length === 0,
    missingPrereqs: missing,
  };
}

/**
 * Get next recommended upgrade (first unlocked but not completed)
 */
export function getNextRecommendedUpgrade(
  upgrades: Upgrade[],
  completedCodes: Set<string>
): Upgrade | null {
  for (const upgrade of upgrades) {
    if (completedCodes.has(upgrade.code)) continue;

    const { unlocked } = isUpgradeUnlocked(upgrade, completedCodes);
    if (unlocked) {
      return upgrade;
    }
  }
  return null;
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

  // Map database result to Upgrade type
  // Note: prereqs and unlock_effects are not in DB schema yet, using defaults
  return (data || []).map(row => ({
    ...row,
    prereqs: [] as string[],
    unlock_effects: undefined as UnlockEffects | undefined,
  }));
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

/**
 * Canonical domain slugs for XP balancing
 */
export const DOMAIN_SLUGS = ['spirit', 'mind', 'uniqueness', 'emotions', 'body'] as const;
export type DomainSlug = typeof DOMAIN_SLUGS[number];

/**
 * Map domain slugs to branches
 */
const DOMAIN_TO_BRANCH: Record<DomainSlug, { path: string; branch: string }> = {
  uniqueness: { path: 'uniqueness', branch: 'mastery_of_genius' },
  spirit: { path: 'spirit', branch: 'mastery_of_spirit' },
  mind: { path: 'mind', branch: 'mastery_of_mind' },
  emotions: { path: 'emotions', branch: 'mastery_of_emotions' },
  body: { path: 'body', branch: 'mastery_of_body' },
};

/**
 * Get upgrade titles by their codes (for displaying prereq names)
 */
export async function getUpgradeTitlesByCode(
  codes: string[]
): Promise<Record<string, string>> {
  if (codes.length === 0) return {};

  const { data, error } = await supabase
    .from('upgrade_catalog')
    .select('code, title')
    .in('code', codes);

  if (error) {
    console.error('Error fetching upgrade titles:', error);
    return {};
  }

  const titles: Record<string, string> = {};
  (data || []).forEach(row => {
    titles[row.code] = row.title;
  });
  return titles;
}

/**
 * Get all upgrades from the catalog
 */
export async function getAllUpgrades(): Promise<Upgrade[]> {
  const { data, error } = await supabase
    .from('upgrade_catalog')
    .select('*')
    .order('path_slug')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching all upgrades:', error);
    return [];
  }

  // Note: prereqs and unlock_effects are not in DB schema yet, using defaults
  return (data || []).map(row => ({
    ...row,
    prereqs: [] as string[],
    unlock_effects: undefined as UnlockEffects | undefined,
  }));
}

/**
 * Profile XP shape for domain balancing
 */
export interface ProfileXp {
  xp_spirit: number;
  xp_mind: number;
  xp_uniqueness: number;
  xp_emotions: number;
  xp_body: number;
}

/**
 * Get the next recommended upgrade, prioritizing the user's weakest domain
 * Falls back to any unlocked upgrade if no domain-specific upgrade is available
 */
export async function getRecommendedUpgradeByDomain(
  profileXp: ProfileXp,
  completedCodes: Set<string>
): Promise<{ upgrade: Upgrade | null; domain: DomainSlug | null }> {
  // Calculate domain rankings (lowest XP first)
  const domainXp: { domain: DomainSlug; xp: number }[] = [
    { domain: 'spirit', xp: profileXp.xp_spirit },
    { domain: 'mind', xp: profileXp.xp_mind },
    { domain: 'uniqueness', xp: profileXp.xp_uniqueness },
    { domain: 'emotions', xp: profileXp.xp_emotions },
    { domain: 'body', xp: profileXp.xp_body },
  ];

  // Sort by XP ascending (weakest first)
  domainXp.sort((a, b) => a.xp - b.xp);

  // Try each domain in order of weakness
  for (const { domain } of domainXp) {
    const { path, branch } = DOMAIN_TO_BRANCH[domain];
    const upgrades = await getUpgradesByBranch(path, branch);
    const recommended = getNextRecommendedUpgrade(upgrades, completedCodes);

    if (recommended) {
      return { upgrade: recommended, domain };
    }
  }

  return { upgrade: null, domain: null };
}

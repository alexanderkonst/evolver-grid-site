import { supabase } from "@/integrations/supabase/client";

const REFERRAL_STORAGE_KEY = "invited_by_profile_id";

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const getReferralId = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const refParam = params.get("ref");
  if (refParam && isUuid(refParam)) {
    window.localStorage.setItem(REFERRAL_STORAGE_KEY, refParam);
    return refParam;
  }

  const stored = window.localStorage.getItem(REFERRAL_STORAGE_KEY);
  return stored && isUuid(stored) ? stored : null;
};

export const captureReferralIdFromUrl = () => {
  getReferralId();
};

/**
 * Gets or creates a game profile ID, with support for both authenticated users and anonymous guests.
 * 
 * This function manages profiles for the "Game of Life" system:
 * - If user is logged in: finds or creates a profile linked to their user_id
 * - If user is guest: falls back to device-based localStorage profile
 * - Supports profile migration: attaches anonymous profiles to users on first login
 * 
 * **Important**: This function must only be called in client-side/browser context
 * (e.g., inside useEffect, event handlers). It will throw an error if called during SSR.
 * 
 * @returns Promise resolving to the game profile ID (UUID string)
 * @throws Error if called in non-browser environment or if profile creation fails
 * 
 * @example
 * ```tsx
 * useEffect(() => {
 *   getOrCreateGameProfileId().then(profileId => {
 *   });
 * }, []);
 * ```
 */
export async function getOrCreateGameProfileId(): Promise<string> {
  // Guard against SSR/non-browser environments
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('getOrCreateGameProfileId can only be called in browser/client context');
  }

  const referralId = getReferralId();

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated - find or create profile linked to user_id
    const { data: existingProfile, error: fetchError } = await supabase
      .from('game_profiles')
      .select('id, first_name, last_name, invited_by')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Get name from user metadata (set during signup)
    const metaFirstName = user.user_metadata?.first_name || null;
    const metaLastName = user.user_metadata?.last_name || null;

    if (existingProfile) {
      // Found existing profile for this user
      // Sync names from metadata if profile doesn't have them yet
      if ((!existingProfile.first_name || !existingProfile.last_name) && (metaFirstName || metaLastName)) {
        await supabase
          .from('game_profiles')
          .update({
            first_name: existingProfile.first_name || metaFirstName,
            last_name: existingProfile.last_name || metaLastName,
          })
          .eq('id', existingProfile.id);
      }
      if (!existingProfile.invited_by && referralId) {
        await supabase
          .from('game_profiles')
          .update({ invited_by: referralId })
          .eq('id', existingProfile.id)
          .is('invited_by', null);
      }
      return existingProfile.id;
    }

    // No profile for this user yet - check if we can migrate an anonymous profile
    const anonymousId = window.localStorage.getItem("game_profile_id");
    if (anonymousId) {
      // Try to attach the anonymous profile to this user
      const { data: anonymousProfile } = await supabase
        .from('game_profiles')
        .select('id, user_id, invited_by')
        .eq('id', anonymousId)
        .maybeSingle();

      if (anonymousProfile && !anonymousProfile.user_id) {
        // This is an unclaimed anonymous profile - attach it to the user with names
        const { error: updateError } = await supabase
          .from('game_profiles')
          .update({
            user_id: user.id,
            first_name: metaFirstName,
            last_name: metaLastName,
            invited_by: anonymousProfile.invited_by || referralId,
          })
          .eq('id', anonymousId);

        if (!updateError) {
          return anonymousId;
        }
      }
    }

    // Create a new profile for this user (with names from metadata)
    const { data, error } = await supabase
      .from('game_profiles')
      .insert({
        user_id: user.id,
        first_name: metaFirstName,
        last_name: metaLastName,
        invited_by: referralId,
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from profile creation');
    }

    return data.id;
  }

  // User is not authenticated - use device-based anonymous profile (localStorage only)
  const existingId = window.localStorage.getItem("game_profile_id");
  if (existingId) {
    // Already have a local guest profile ID
    return existingId;
  }

  // Generate a new local UUID for guest (no DB interaction - RLS blocks inserts without user_id)
  const newId = crypto.randomUUID();
  window.localStorage.setItem("game_profile_id", newId);
  console.log("[gameProfile] Created guest profile ID (localStorage only):", newId);

  return newId;
}

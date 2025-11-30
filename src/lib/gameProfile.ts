import { supabase } from "@/integrations/supabase/client";

/**
 * Gets or creates a game profile ID, with support for both authenticated users and anonymous guests.
 * 
 * This function manages profiles for the "Game of You" system:
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
 *     console.log('Profile ID:', profileId);
 *   });
 * }, []);
 * ```
 */
export async function getOrCreateGameProfileId(): Promise<string> {
  // Guard against SSR/non-browser environments
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('getOrCreateGameProfileId can only be called in browser/client context');
  }

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated - find or create profile linked to user_id
    const { data: existingProfile, error: fetchError } = await supabase
      .from('game_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Failed to fetch game profile:', fetchError);
      throw fetchError;
    }

    if (existingProfile) {
      // Found existing profile for this user
      return existingProfile.id;
    }

    // No profile for this user yet - check if we can migrate an anonymous profile
    const anonymousId = window.localStorage.getItem("game_profile_id");
    if (anonymousId) {
      // Try to attach the anonymous profile to this user
      const { data: anonymousProfile } = await supabase
        .from('game_profiles')
        .select('id, user_id')
        .eq('id', anonymousId)
        .maybeSingle();

      if (anonymousProfile && !anonymousProfile.user_id) {
        // This is an unclaimed anonymous profile - attach it to the user
        const { error: updateError } = await supabase
          .from('game_profiles')
          .update({ user_id: user.id })
          .eq('id', anonymousId);

        if (!updateError) {
          return anonymousId;
        }
      }
    }

    // Create a new profile for this user
    const { data, error } = await supabase
      .from('game_profiles')
      .insert({ user_id: user.id })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create game profile:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from profile creation');
    }

    return data.id;
  }

  // User is not authenticated - use device-based anonymous profile
  const existingId = window.localStorage.getItem("game_profile_id");
  if (existingId) {
    return existingId;
  }

  // Create a new anonymous profile
  const { data, error } = await supabase
    .from('game_profiles')
    .insert({})
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create game profile:', error);
    throw error;
  }

  if (!data) {
    throw new Error('No data returned from profile creation');
  }

  // Store the new ID in localStorage
  const newId = data.id;
  window.localStorage.setItem("game_profile_id", newId);

  return newId;
}

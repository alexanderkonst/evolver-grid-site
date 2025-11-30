import { supabase } from "@/integrations/supabase/client";

/**
 * Gets or creates a device-based game profile ID.
 * 
 * This function manages anonymous, device-based profiles for the "Game of You" system.
 * - Checks localStorage for existing "game_profile_id"
 * - If not found, creates a new profile in Supabase and stores the ID
 * - Returns the profile ID
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

  // Check localStorage first
  const existingId = window.localStorage.getItem("game_profile_id");
  if (existingId) {
    return existingId;
  }

  // Create a new profile with default values
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

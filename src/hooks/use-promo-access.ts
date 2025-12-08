import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

// Server-side promo code validation for AI Upgrade
export const useAIUpgradeAccess = (user: User | null) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      // If no user, we can't check access
      if (!user) {
        setIsLoading(false);
        setHasAccess(false);
        setProfileId(null);
        return;
      }

      try {
        // Find or create profile linked to user
        let profile = await findOrCreateUserProfile(user.id);
        setProfileId(profile.id);

        if (profile.ai_upgrade_access) {
          setHasAccess(true);
        }
      } catch (err) {
        console.error('Error checking access:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user]);

  const validateAndGrantAccess = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Please log in to use promo codes' };
    }

    if (!profileId) {
      return { success: false, error: 'Profile not ready. Please refresh.' };
    }

    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('validate-promo-code', {
        body: { promoCode: code, profileId }
      });

      if (invokeError) {
        console.error('Error invoking promo function:', invokeError);
        return { success: false, error: 'Failed to validate promo code' };
      }

      if (data?.valid) {
        setHasAccess(true);
        return { success: true };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return { success: false, error: 'Invalid promo code' };
    } catch (err) {
      console.error('Error validating promo code:', err);
      return { success: false, error: 'Failed to validate promo code' };
    }
  };

  return { hasAccess, isLoading, validateAndGrantAccess, error, setHasAccess };
};

// Helper to find or create a profile linked to a user
async function findOrCreateUserProfile(userId: string): Promise<{ id: string; ai_upgrade_access: boolean }> {
  // First, try to find existing profile for this user
  const { data: existingProfile, error: fetchError } = await supabase
    .from('game_profiles')
    .select('id, ai_upgrade_access')
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (existingProfile) {
    return existingProfile;
  }

  // Check if there's an anonymous profile in localStorage to migrate
  const anonymousId = typeof window !== 'undefined' ? localStorage.getItem("game_profile_id") : null;
  
  if (anonymousId) {
    const { data: anonymousProfile } = await supabase
      .from('game_profiles')
      .select('id, user_id, ai_upgrade_access')
      .eq('id', anonymousId)
      .maybeSingle();

    if (anonymousProfile && !anonymousProfile.user_id) {
      // Migrate anonymous profile to user
      const { error: updateError } = await supabase
        .from('game_profiles')
        .update({ user_id: userId })
        .eq('id', anonymousId);

      if (!updateError) {
        return { id: anonymousId, ai_upgrade_access: anonymousProfile.ai_upgrade_access || false };
      }
    }
  }

  // Create new profile for user
  const { data: newProfile, error: createError } = await supabase
    .from('game_profiles')
    .insert({ user_id: userId })
    .select('id, ai_upgrade_access')
    .single();

  if (createError || !newProfile) {
    throw createError || new Error('Failed to create profile');
  }

  return newProfile;
}

// Zone of Genius access management (free, client-side only)
const ZONE_OF_GENIUS_ACCESS_KEY = "zone_of_genius_access_granted";

export const useZoneOfGeniusAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const access = localStorage.getItem(ZONE_OF_GENIUS_ACCESS_KEY);
    setHasAccess(access === "true");
  }, []);

  const grantAccess = () => {
    localStorage.setItem(ZONE_OF_GENIUS_ACCESS_KEY, "true");
    setHasAccess(true);
  };

  const revokeAccess = () => {
    localStorage.removeItem(ZONE_OF_GENIUS_ACCESS_KEY);
    setHasAccess(false);
  };

  return { hasAccess, grantAccess, revokeAccess };
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";

// Server-side promo code validation for AI Upgrade
export const useAIUpgradeAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const id = await getOrCreateGameProfileId();
        setProfileId(id);

        // Check access from database
        const { data, error } = await supabase
          .from('game_profiles')
          .select('ai_upgrade_access')
          .eq('id', id)
          .single();

        if (!error && data?.ai_upgrade_access) {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Error checking access:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, []);

  const validateAndGrantAccess = async (code: string): Promise<boolean> => {
    if (!profileId) {
      return false;
    }

    try {
      // Check if user is authenticated - promo code requires auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('User must be logged in to use promo code');
        return false;
      }

      const { data, error } = await supabase.functions.invoke('validate-promo-code', {
        body: { promoCode: code, profileId }
      });

      if (error) {
        console.error('Error validating promo code:', error);
        return false;
      }

      if (data?.valid) {
        setHasAccess(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error validating promo code:', error);
      return false;
    }
  };

  return { hasAccess, isLoading, validateAndGrantAccess };
};

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

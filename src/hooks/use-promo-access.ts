import { useState, useEffect } from "react";

// Shared promo codes for all products
export const VALID_PROMO_CODES = [
  "GIFTED",         // Universal promo code across entire website
  "AIUPGRADEGIFT",  // AI Upgrade specific code
];

export const validatePromoCode = (code: string): boolean => {
  const normalized = code.trim().toUpperCase();
  return VALID_PROMO_CODES.includes(normalized);
};

// AI Upgrade access management
const AI_UPGRADE_ACCESS_KEY = "ai_upgrade_access_granted";

export const useAIUpgradeAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const access = localStorage.getItem(AI_UPGRADE_ACCESS_KEY);
    setHasAccess(access === "true");
  }, []);

  const grantAccess = () => {
    localStorage.setItem(AI_UPGRADE_ACCESS_KEY, "true");
    setHasAccess(true);
  };

  const revokeAccess = () => {
    localStorage.removeItem(AI_UPGRADE_ACCESS_KEY);
    setHasAccess(false);
  };

  return { hasAccess, grantAccess, revokeAccess };
};

// Zone of Genius access management
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

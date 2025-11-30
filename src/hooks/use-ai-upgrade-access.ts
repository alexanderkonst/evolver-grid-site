import { useState, useEffect } from "react";

const ACCESS_KEY = "ai_upgrade_access_granted";

export const useAIUpgradeAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const access = localStorage.getItem(ACCESS_KEY);
    setHasAccess(access === "true");
  }, []);

  const grantAccess = () => {
    localStorage.setItem(ACCESS_KEY, "true");
    setHasAccess(true);
  };

  const revokeAccess = () => {
    localStorage.removeItem(ACCESS_KEY);
    setHasAccess(false);
  };

  return { hasAccess, grantAccess, revokeAccess };
};

const VALID_PROMO_CODES = [
  "AIUPGRADEGIFT",
  "GIFT100",
];

export const validatePromoCode = (code: string): boolean => {
  const normalized = code.trim().toUpperCase();
  return VALID_PROMO_CODES.includes(normalized);
};

import { Navigate, useLocation } from "react-router-dom";

/**
 * Share card: the founder's old slugs (/aleksandr, /alexander, /integralevolution) land on
 * /sasha keeping ?query and #hash, so a scanned QR (?utm_source=qr&utm_medium=share_card)
 * is still attributed after the hop.
 */
export const FOUNDER_PATH = "/sasha";

/** Where an old founder slug goes: the canonical path plus whatever came after the slug. */
export const founderRedirectTarget = (search: string, hash: string): string => `${FOUNDER_PATH}${search}${hash}`;

const FounderRedirect = () => {
  const { search, hash } = useLocation();
  return <Navigate to={founderRedirectTarget(search, hash)} replace />;
};

export default FounderRedirect;

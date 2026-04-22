/**
 * SkinPreview — `/preview` entry point.
 *
 * Day 47 very-late-night → autonomous night pass (Sasha):
 *
 * Previously a standalone route that rendered the landing inside a
 * temporary skin push, reverting on unmount. That scoped the preview
 * to a single view.
 *
 * Now: `/preview` is a thin entry ramp. It flips the skin to
 * `navy-gold` via `setSkin` (persisted in localStorage) and redirects
 * to `/`. The `<PreviewBanner />` mounted at App root stays visible
 * on every route while the alt skin is active. Clicking Exit on that
 * banner calls `setSkin('aurora')` and returns home.
 *
 * Result: Sasha can tour the ENTIRE site in Navy+Gold, not just the
 * landing. Navigate to /playbook, /path, /zone-of-genius, /ignite,
 * /game/settings, /my-artifacts — all render Navy+Gold until he
 * presses Exit.
 *
 * Implementation note: we flip the skin INSIDE `useEffect` and gate
 * the Navigate on a `ready` flag. Rendering `<Navigate>` directly
 * would cause its own internal effect to fire BEFORE this component's
 * effect (React fires child effects before parent effects on mount),
 * which would unmount SkinPreview before `setSkin` ever ran — the
 * skin would never actually flip. The `ready` flag makes sure the
 * setSkin call commits first, then we navigate.
 */

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSkin } from "@/contexts/SkinContext";

const SkinPreview = () => {
  const { setSkin } = useSkin();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSkin("navy-gold");
    // Defer the navigate to the next frame so the skin flip has
    // committed to the DOM (data-skin attribute + localStorage) before
    // the route changes. Otherwise the landing might first paint in
    // Aurora for one tick and then re-render as Navy+Gold.
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [setSkin]);

  if (!ready) return null;
  return <Navigate to="/" replace />;
};

export default SkinPreview;

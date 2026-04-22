/**
 * SkinPreview — Day 47 very-late-night (Sasha).
 *
 * `/preview` route. Forces the Navy+Gold skin while this page is mounted,
 * reverts to the user's persisted skin on unmount.
 *
 * What's visible in Navy+Gold here (as of first pass):
 *   - Landing hero (h1 + echo + ornament + 4-line structure)
 *   - Primary CTA + secondary text link (PlaybookHero)
 *   - Panel 3 wash
 *
 * Everything else (nav, sections panel, footer, etc.) renders as Aurora
 * until we migrate those surfaces too. That's intentional — the preview
 * shows the skin's headline moves without risking full-site drift.
 *
 * Discoverable by URL only (not linked from any nav). Gated by nobody
 * typing `/preview` unless they know to.
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import JourneyPage from "./JourneyPage";
import { useSkin } from "@/contexts/SkinContext";

const SkinPreview = () => {
  const { pushTemporarySkin } = useSkin();

  useEffect(() => {
    // Push navy-gold while mounted. Cleanup restores prior skin.
    const restore = pushTemporarySkin("navy-gold");
    return restore;
  }, [pushTemporarySkin]);

  return (
    <>
      <JourneyPage />

      {/* Floating preview banner — bottom-right, discreet. Clickable to
          return to Aurora (home). Styled so it reads in both skins. */}
      <Link
        to="/"
        className="fixed bottom-4 right-4 z-[9999] inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all hover:scale-[1.03] active:scale-[0.98]"
        style={{
          backgroundColor: "rgba(10, 22, 40, 0.85)",
          color: "#d4af37",
          border: "1px solid rgba(212, 175, 55, 0.4)",
          boxShadow:
            "0 10px 30px -8px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <span aria-hidden="true" style={{ color: "#d4af37" }}>✦</span>
        <span>Navy + Gold preview</span>
        <span aria-hidden="true" style={{ opacity: 0.55 }}>·</span>
        <span style={{ opacity: 0.7 }}>Back to Aurora →</span>
      </Link>
    </>
  );
};

export default SkinPreview;

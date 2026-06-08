/**
 * PreviewBanner — floating chip that renders on every page while an
 * alt skin (e.g. Navy+Gold) is active.
 *
 * Two behavior modes:
 *
 *   1. DISCLAIMER mode — for white-label community skins (NS, Daouniverse,
 *      Planetir). Renders an unclickable "Demo · not affiliated with <X>"
 *      chip. The skin is route-scoped (e.g. /ns/*), so an "exit" button
 *      would be confusing — the visitor exits by navigating away from the
 *      route. Pattern established for NS V6 (Sasha 2026-05-19); extended
 *      to Daouniverse + Planetir Day 84 evening per Sasha's call.
 *
 *   2. PREVIEW mode — for the internal Navy+Gold test ground (set by
 *      visiting /preview). Clickable Exit button that flips back to
 *      Aurora and navigates home. Used by Sasha to dogfood alt aesthetics
 *      without route prefixes.
 *
 * Day 47 very-late-night → autonomous night pass (Sasha): original
 * implementation. Day 84 evening (Sasha 2026-05-25): refactored to a
 * SKIN_BANNER_CONFIG table so adding a new white-label disclaimer is
 * one row, no branching logic.
 */

import { useSkin, type Skin } from "@/contexts/SkinContext";
import { useNavigate } from "react-router-dom";

type DisclaimerConfig = {
  mode: "disclaimer";
  /** What appears on the chip — "Demo · not affiliated with <text>". */
  notAffiliatedWith: string;
};

type PreviewConfig = {
  mode: "preview";
  /** Human label for the chip ("Navy + Gold preview"). */
  label: string;
};

type HiddenConfig = { mode: "hidden" };

/**
 * Per-skin banner config. Add a row when shipping a new white-label skin.
 * Karime is route-scoped to /build/karime/* but is a production landing
 * (not a demo / not a preview), so it gets `hidden`.
 */
const SKIN_BANNER_CONFIG: Partial<
  Record<Skin, DisclaimerConfig | PreviewConfig | HiddenConfig>
> = {
  "network-school": {
    mode: "disclaimer",
    notAffiliatedWith: "ns.com",
  },
  daouniverse: {
    mode: "disclaimer",
    notAffiliatedWith: "latamimpact.io",
  },
  planetir: {
    mode: "disclaimer",
    notAffiliatedWith: "planetir.org",
  },
  // Day 88 (Sasha 2026-05-30): darktheme is the platform's canonical
  // dark register, NOT a third-party demo. Use the clickable preview
  // mode (same as navy-gold) so the visitor can flip back to Aurora —
  // the disclaimer mode would falsely imply this is a community demo.
  darktheme: {
    mode: "preview",
    label: "Dark theme preview",
  },
  karime: { mode: "hidden" },
  "navy-gold": {
    mode: "preview",
    label: "Navy + Gold preview",
  },
};

const PreviewBanner = () => {
  const { skin, setSkin } = useSkin();
  const navigate = useNavigate();

  if (skin === "aurora") return null;

  const config = SKIN_BANNER_CONFIG[skin];
  if (!config || config.mode === "hidden") return null;

  if (config.mode === "disclaimer") {
    return (
      <div
        className="fixed bottom-4 right-4 z-[9999] inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] tracking-[0.04em] pointer-events-none select-none"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          color: "rgba(10, 10, 10, 0.78)",
          border: "1px solid rgba(10, 10, 10, 0.10)",
          fontFamily: '"Inter", system-ui, sans-serif',
          fontWeight: 500,
          boxShadow: "0 4px 14px -6px rgba(0, 0, 0, 0.10)",
        }}
        aria-label={`Demo only. This platform is not affiliated with ${config.notAffiliatedWith}.`}
      >
        <span>Demo · not affiliated with {config.notAffiliatedWith}</span>
      </div>
    );
  }

  // preview mode — clickable exit (Navy+Gold internal preview)
  return (
    <button
      type="button"
      onClick={() => {
        setSkin("aurora");
        navigate("/");
      }}
      className="fixed bottom-4 right-4 z-[9999] inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all hover:scale-[1.03] active:scale-[0.98]"
      style={{
        backgroundColor: "rgba(10, 22, 40, 0.88)",
        color: "#d4af37",
        border: "1px solid rgba(212, 175, 55, 0.42)",
        boxShadow:
          "0 10px 30px -8px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.12)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
      }}
      title="Exit preview and return to Aurora"
      aria-label="Exit preview and return to Aurora"
    >
      <span aria-hidden="true" style={{ color: "#d4af37" }}>
        ✦
      </span>
      <span>{config.label}</span>
      <span aria-hidden="true" style={{ opacity: 0.55 }}>
        ·
      </span>
      <span style={{ opacity: 0.72 }}>Exit →</span>
    </button>
  );
};

export default PreviewBanner;

/**
 * PreviewBanner — floating chip that renders on every page while an
 * alt skin (e.g. Navy+Gold) is active.
 *
 * Day 47 very-late-night → autonomous night pass (Sasha):
 *
 *   When Sasha visits `/preview`, the skin flips to navy-gold and
 *   persists in localStorage. The preview is no longer scoped to the
 *   `/preview` route — he can tour every surface of the site in the
 *   alt skin until he clicks Exit on this banner.
 *
 *   Banner behavior:
 *     • Visible whenever skin !== 'aurora'
 *     • Click to exit: calls setSkin('aurora') + navigates to `/`
 *     • Styled to read in any skin (dark glass + gold text)
 *     • Lives at `fixed bottom-4 right-4` on every route
 */

import { useSkin } from "@/contexts/SkinContext";
import { useNavigate } from "react-router-dom";

const PreviewBanner = () => {
  const { skin, setSkin } = useSkin();
  const navigate = useNavigate();

  if (skin === "aurora") return null;

  const isNS = skin === "network-school";

  // V6 (Sasha 2026-05-19): restored banner under NS with disclaimer copy.
  // V4 hid the banner entirely on NS (so it wouldn't read as debug chrome
  // to an external evaluator). Sasha's call now: bring it back, but as
  // a legal-ish disclaimer rather than a "preview" chip — makes the
  // not-affiliated relationship explicit so the demo is honest.
  if (isNS) {
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
        aria-label="Demo only. This platform is not affiliated with ns.com."
      >
        <span>Demo · not affiliated with ns.com</span>
      </div>
    );
  }

  const humanName =
    skin === "navy-gold" ? "Navy + Gold preview" : `${skin} preview`;

  return (
    <button
      type="button"
      onClick={() => {
        setSkin("aurora");
        // Navigate home so exit feels like a clean return to Aurora.
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
      <span>{humanName}</span>
      <span aria-hidden="true" style={{ opacity: 0.55 }}>
        ·
      </span>
      <span style={{ opacity: 0.72 }}>Exit →</span>
    </button>
  );
};

export default PreviewBanner;

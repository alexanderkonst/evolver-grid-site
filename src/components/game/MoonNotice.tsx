import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FONTS_HREF } from "@/lib/gameFonts";

/**
 * MoonNotice — the one full-page notice template with no game shell (issue #270).
 * Used by the 404 page and by the locked mission doors. No rail, no music, no chrome:
 * a title, one line, one primary action, one quiet way back. Moon-world canon:
 * ink #e6ebf2, teal #5ec8bd, Cormorant Garamond + IBM Plex Mono.
 */

const INK = "#e6ebf2";
const TEAL = "#5ec8bd";
const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const MONO = '"IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace';

type Action = { to: string; label: string };

type Props = {
  /** Small mono line above the title (e.g. «404», «Locked»). */
  eyebrow: string;
  title: string;
  line?: string;
  primary: Action;
  secondary?: Action;
  children?: ReactNode;
};

const MoonNotice = ({ eyebrow, title, line, primary, secondary, children }: Props) => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  return (
    <main
      data-testid="moon-notice"
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        background: "radial-gradient(ellipse at 50% 0%, #14213a 0%, #0a0f1a 62%)",
        color: INK,
        fontFamily: SERIF,
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <p style={{ margin: 0, fontFamily: MONO, fontWeight: 300, fontSize: 13, letterSpacing: "0.3em", textTransform: "uppercase", color: TEAL }}>
          {eyebrow}
        </p>
        <h1 style={{ margin: "18px 0 0", fontWeight: 300, fontSize: "clamp(34px, 6vw, 56px)", lineHeight: 1.1, color: INK, textWrap: "balance" }}>
          {title}
        </h1>
        {line ? (
          <p style={{ margin: "16px 0 0", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(18px, 2.4vw, 22px)", color: INK, opacity: 0.85 }}>
            {line}
          </p>
        ) : null}
        {children}
        <div style={{ marginTop: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <Link
            to={primary.to}
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 44,
              padding: "0 28px",
              border: `1px solid ${TEAL}`,
              color: INK,
              fontFamily: MONO,
              fontWeight: 300,
              fontSize: 13,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            {primary.label}
          </Link>
          {secondary ? (
            <Link
              to={secondary.to}
              style={{ display: "inline-flex", alignItems: "center", minHeight: 44, fontFamily: MONO, fontWeight: 300, fontSize: 13, letterSpacing: "0.14em", color: INK, textDecoration: "underline", textUnderlineOffset: 4 }}
            >
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default MoonNotice;

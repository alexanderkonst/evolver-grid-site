/** Shared pieces of the moon/neon product-page look (/products/vector, /products/built).
 *  Styles live in src/pages/TheVector.css, scoped to `.vector-page`; import that file from the page. */
import type { ReactNode } from "react";
import igniteStar from "@/assets/ignite-logo.png";

/** The Ignite star as a decorative mark: divider centre or list bullet. Size comes from CSS. */
export const MoonStar = ({ className = "" }: { className?: string }) => (
  <img src={igniteStar} alt="" aria-hidden="true" decoding="async" className={`vector-star ${className}`.trim()} />
);

/** Section divider: iridescent hairlines either side of one small star. No motion. */
export const MoonDivider = () => (
  <div className="vector-divider" aria-hidden="true">
    <MoonStar className="vector-divider-star" />
  </div>
);

/** Section eyebrow: neon serif heading, optional number, an iridescent hairline under it. */
export const MoonEyebrow = ({ n, children, heading = false }: { n?: string; children: ReactNode; heading?: boolean }) => {
  const Tag = heading ? "h2" : "p";
  return (
    <Tag className="vector-eyebrow">
      {n && <span className="vector-eyebrow-num" aria-hidden="true">{n} <span className="vector-eyebrow-dot">·</span></span>}
      <span className="vector-heading-text">{children}</span>
    </Tag>
  );
};

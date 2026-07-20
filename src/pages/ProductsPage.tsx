/**
 * /products — buyer-facing product sheet (Day 121, July 11, 2026).
 *
 * One page. Seven offers. Shelf language. One CTA per card.
 * Standalone editorial page, no game shell (not in shellRoutes.ts).
 * Spec: docs/specs/products-page/scope_of_work.md.
 *
 * Register matches MatchCard's parchment/Cormorant/gold-eyebrow cocktail
 * (src/components/matchmaking/MatchCard.tsx) — this page borrows the same
 * skin-token fallbacks so it renders correctly across all skins.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const CALCOM_15MIN = "https://cal.com/aleksandrkonstantinov/15min";

const eyebrowGold: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: "10.5px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--skin-accent-gold, #b8860b)",
};

const cormorantTitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 700,
  letterSpacing: "-0.005em",
  color: "var(--skin-text-primary, #0b2a5a)",
};

const sourceSerifBody: React.CSSProperties = {
  fontFamily: "'Source Serif 4', serif",
  fontWeight: 500,
  color: "var(--skin-text-primary, #0b2a5a)",
  lineHeight: 1.6,
};

const parchmentCard: React.CSSProperties = {
  background: "var(--skin-card-fill, rgba(255, 252, 245, 0.92))",
  border: "0.5px solid rgba(212, 175, 55, 0.55)",
  boxShadow:
    "0 0 22px -8px rgba(212, 175, 55, 0.30), 0 16px 40px -20px rgba(10, 22, 40, 0.22)",
};

const badgePill: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 600,
  fontSize: "11px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--skin-goldDeep, #5d4307)",
  background: "rgba(212, 175, 55, 0.12)",
  border: "0.5px solid rgba(212, 175, 55, 0.40)",
  borderRadius: "999px",
  padding: "3px 12px",
  whiteSpace: "nowrap" as const,
};

const ceremonialCta: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "12px",
  background:
    "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.85) 50%, rgba(10,22,40,0.92) 100%))",
  color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
  border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
  boxShadow:
    "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28))",
};

interface ProductCardDef {
  key: string;
  href: string;
  external: boolean;
}

// Locked order per spec (docs/specs/products-page/scope_of_work.md).
const CARDS: ProductCardDef[] = [
  { key: "card1", href: "/ignite", external: false },
  { key: "card2", href: "/zone-of-genius", external: false },
  { key: "card3", href: CALCOM_15MIN, external: true },
  { key: "card4", href: "/zone-of-genius", external: false },
  { key: "card5", href: CALCOM_15MIN, external: true },
  { key: "card6", href: CALCOM_15MIN, external: true },
  { key: "card7", href: CALCOM_15MIN, external: true },
  // Day 130: Client Evolution Portal (Practitioner Node).
  { key: "card8", href: "/products/evolution-portal", external: false },
];

const ProductCard = ({ def }: { def: ProductCardDef }) => {
  const { t } = useTranslation();
  const name = t(`products.${def.key}.name`);
  const badge = t(`products.${def.key}.badge`);
  const line = t(`products.${def.key}.line`);
  const body = t(`products.${def.key}.body`);
  const cta = t(`products.${def.key}.cta`);

  return (
    <div className="rounded-2xl overflow-hidden" style={parchmentCard}>
      <div className="p-6 md:p-7 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h2 style={{ ...cormorantTitle, fontSize: "24px" }} className="leading-[1.2]">
            {name}
          </h2>
          <span style={badgePill}>{badge}</span>
        </div>

        <p
          className="italic"
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: "14.5px",
            color: "var(--skin-accent-gold, #b8860b)",
          }}
        >
          {line}
        </p>

        <p style={{ ...sourceSerifBody, fontSize: "15px" }}>{body}</p>

        <div className="pt-2">
          {def.external ? (
            <a
              href={def.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 hover:translate-y-[-1px]"
              style={ceremonialCta}
            >
              {cta}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <Link
              to={def.href}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 hover:translate-y-[-1px]"
              style={ceremonialCta}
            >
              {cta}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO title={t("products.title")} description={t("products.seoDescription")} path="/products" />
      <div
        className="min-h-dvh"
        style={{
          background: "var(--skin-page-bg, #f7f3ea)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-20 space-y-10">
          <header className="text-center space-y-4">
            <p style={eyebrowGold}>{t("products.eyebrow")}</p>
            <h1
              style={{
                ...cormorantTitle,
                fontSize: "clamp(2rem, 5vw, 3rem)",
                lineHeight: 1.15,
              }}
            >
              {t("products.title")}
            </h1>
            <p
              className="max-w-xl mx-auto"
              style={{ ...sourceSerifBody, fontSize: "16px", lineHeight: 1.6 }}
            >
              {t("products.intro")}
            </p>
          </header>

          <div className="space-y-6 md:space-y-8">
            {CARDS.map((def) => (
              <ProductCard key={def.key} def={def} />
            ))}
          </div>

          <p
            className="text-center pt-4"
            style={{ ...sourceSerifBody, fontSize: "14px", fontStyle: "italic" }}
          >
            {t("products.closingBefore")}
            <a
              href={CALCOM_15MIN}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
              style={{ color: "var(--skin-accent-gold, #b8860b)" }}
            >
              {t("products.closingLink")}
            </a>
            {t("products.closingAfter")}
          </p>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;

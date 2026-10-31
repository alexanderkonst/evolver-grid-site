/** /products — public offer catalogue, using Ignite's editorial design grammar. */
import { useTranslation } from "react-i18next";
import { marketDoor } from "@/data/marketDoorCopy";
import { ChevronDown } from "lucide-react";
import SEO from "@/components/SEO";
import { ProductCta, ProductEyebrow, ProductHero, ProductLanding } from "@/components/products/ProductLanding";
import { Ornament } from "@/lib/landingDesign";
import { cn } from "@/lib/utils";

const TELEGRAM_CONVERSATION = "https://t.me/integralevolution";

interface ProductLinkDef {
  href: string;
  external: boolean;
  ctaKey: "cta" | "cta2";
}

interface ProductCardDef {
  key: string;
  links: ProductLinkDef[];
}

// Order, names, prices and links follow docs/04-products/product_brief.md:
// the eight-step transformational path first, then the other offers. A card with no link has none in the brief.
const CARDS: ProductCardDef[] = [
  { key: "quiz", links: [{ href: "/quiz", external: false, ctaKey: "cta" }] },
  {
    key: "zog",
    links: [
      { href: "https://ancient-william-0f8.notion.site/THE-ZONE-OF-GENIUS-PROGRAM-10981c75c23680cdb971df7314d07eda", external: true, ctaKey: "cta" },
      { href: "https://nas.com/founder-academy/sessions/zone-of-genius-live-session", external: true, ctaKey: "cta2" },
    ],
  },
  { key: "fmf", links: [{ href: "/ignite", external: false, ctaKey: "cta" }] },
  { key: "pmf", links: [] },
  { key: "evolution", links: [{ href: "/products/crossing", external: false, ctaKey: "cta" }] },
  { key: "collective", links: [] },
  { key: "forClients", links: [] },
  { key: "license", links: [] },
  { key: "profile", links: [{ href: "/", external: false, ctaKey: "cta" }] },
  { key: "matchmaking", links: [{ href: "/game/collaborate/matches", external: false, ctaKey: "cta" }] },
  { key: "whiteLabel", links: [{ href: "/proposalforwegoodovahere", external: false, ctaKey: "cta" }] },
  { key: "aiTraining", links: [] },
  { key: "equilibrium", links: [{ href: "/build/equilibrium", external: false, ctaKey: "cta" }] },
  { key: "mystery", links: [{ href: "https://nas.com/founder-academy/products/pugb/view", external: true, ctaKey: "cta" }] },
  { key: "cockpit", links: [{ href: "/build/cockpit", external: false, ctaKey: "cta" }] },
];

// Products that were on /products before the brief and are not in it. Kept as-is, shown muted, no CTA.
const RD_CARDS: ProductCardDef[] = [
  { key: "card7", links: [] },
  { key: "card8", links: [] },
  { key: "card10", links: [] },
];

const ProductCard = ({ def, muted = false }: { def: ProductCardDef; muted?: boolean }) => {
  const { t, i18n } = useTranslation();
  const name = t(`products.${def.key}.name`);
  // Market door (2026-10-30): the promise is the shared experience; the method keeps its name.
  const line =
    def.key === "fmf" ? marketDoor("productsFmfLine", i18n.resolvedLanguage)
    : def.key === "pmf" ? marketDoor("productsPmfLine", i18n.resolvedLanguage)
    : t(`products.${def.key}.line`);

  return (
    <article
      className={cn("liquid-glass-strong rounded-[2.5rem] p-7 md:p-9 space-y-5", muted && "opacity-60")}
      aria-labelledby={`${def.key}-title`}
    >
      <div className="space-y-3">
        <ProductEyebrow>{t(`products.${def.key}.badge`)}</ProductEyebrow>
        <h2 id={`${def.key}-title`} className="product-title text-2xl sm:text-3xl">{name}</h2>
        <p className="product-body text-base italic">{line}</p>
      </div>
      <p className="product-body text-base">{t(`products.${def.key}.body`)}</p>
      {def.links.length > 0 && (
        <div className="pt-1 flex flex-wrap gap-3">
          {def.links.map(link => (
            <ProductCta key={link.ctaKey} href={link.href} external={link.external}>
              {t(`products.${def.key}.${link.ctaKey}`)}
            </ProductCta>
          ))}
        </div>
      )}
    </article>
  );
};

const ProductsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO title={t("products.title")} description={t("products.seoDescription")} path="/products" />
      <ProductLanding>
        <ProductHero eyebrow={t("products.eyebrow")} title={t("products.title")} subtitle={t("products.intro")}>
          <Ornament />
        </ProductHero>

        <section className="text-center space-y-4 max-w-lg mx-auto" aria-labelledby="products-summary">
          <ProductEyebrow>{t("products.summaryEyebrow")}</ProductEyebrow>
          <details className="group liquid-glass rounded-2xl text-left">
            <summary className="product-summary cursor-pointer list-none p-5 rounded-2xl">
              <h2 id="products-summary" className="product-title text-2xl flex items-center justify-between gap-4">
                {t("products.summaryHeading")}
                <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </h2>
            </summary>
            <p className="product-body text-base px-5 pb-5">{t("products.summaryBody")}</p>
          </details>
        </section>

        <Ornament />

        <div className="space-y-6 md:space-y-8">
          {CARDS.map(def => <ProductCard key={def.key} def={def} />)}
        </div>

        <section className="space-y-6 md:space-y-8" aria-labelledby="products-rd">
          <div className="text-center space-y-3">
            <ProductEyebrow>{t("products.rdEyebrow")}</ProductEyebrow>
            <h2 id="products-rd" className="product-title text-3xl">{t("products.rdHeading")}</h2>
            <p className="product-body text-base italic max-w-md mx-auto">{t("products.rdIntro")}</p>
          </div>
          {RD_CARDS.map(def => <ProductCard key={def.key} def={def} muted />)}
        </section>

        <footer className="text-center space-y-6 pb-8">
          <Ornament />
          <p className="product-body text-sm italic max-w-md mx-auto">
            {t("products.closingBefore")}
            <a href={TELEGRAM_CONVERSATION} target="_blank" rel="noopener noreferrer" className="product-quiet-link">
              {t("products.closingLink")}
            </a>
            {t("products.closingAfter")}
          </p>
        </footer>
      </ProductLanding>
    </>
  );
};

export default ProductsPage;

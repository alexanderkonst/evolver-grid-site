/** /products — public offer catalogue, using Ignite's editorial design grammar. */
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import SEO from "@/components/SEO";
import { ProductCta, ProductEyebrow, ProductHero, ProductLanding } from "@/components/products/ProductLanding";
import { Ornament } from "@/lib/landingDesign";

const TELEGRAM_CONVERSATION = "https://t.me/integralevolution";

interface ProductCardDef {
  key: string;
  href: string;
  external: boolean;
}

// Preserve the catalogue's existing order and destinations.
const CARDS: ProductCardDef[] = [
  { key: "card1", href: "/ignite", external: false },
  { key: "card2", href: "/zone-of-genius", external: false },
  { key: "card3", href: TELEGRAM_CONVERSATION, external: true },
  { key: "card4", href: "/zone-of-genius", external: false },
  { key: "card5", href: TELEGRAM_CONVERSATION, external: true },
  { key: "card6", href: TELEGRAM_CONVERSATION, external: true },
  { key: "card7", href: TELEGRAM_CONVERSATION, external: true },
  { key: "card8", href: "/products/evolution-portal", external: false },
  { key: "card9", href: "/products/crossing", external: false },
  { key: "card10", href: "/products/founder-read", external: false },
];

const ProductCard = ({ def }: { def: ProductCardDef }) => {
  const { t } = useTranslation();
  const name = t(`products.${def.key}.name`);

  return (
    <article className="liquid-glass-strong rounded-[2.5rem] p-7 md:p-9 space-y-5" aria-labelledby={`${def.key}-title`}>
      <div className="space-y-3">
        <ProductEyebrow>{t(`products.${def.key}.badge`)}</ProductEyebrow>
        <h2 id={`${def.key}-title`} className="product-title text-2xl sm:text-3xl">{name}</h2>
        <p className="product-body text-base italic">{t(`products.${def.key}.line`)}</p>
      </div>
      <p className="product-body text-base">{t(`products.${def.key}.body`)}</p>
      <div className="pt-1">
        <ProductCta href={def.href} external={def.external}>{t(`products.${def.key}.cta`)}</ProductCta>
      </div>
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

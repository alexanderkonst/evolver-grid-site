/** /products — public offer catalogue, using Ignite's editorial design grammar.
 *  Prices, durations, formats and links come from src/data/productMap.ts; this file holds layout and prose only. */
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { marketDoor } from "@/data/marketDoorCopy";
import { ChevronDown } from "lucide-react";
import SEO from "@/components/SEO";
import { ProductCta, ProductEyebrow, ProductHero, ProductLanding } from "@/components/products/ProductLanding";
import { ProductMapView } from "@/components/products/ProductMapView";
import { PRODUCT_FAMILIES, getProduct, summaryLines } from "@/data/productMap";
import { Ornament } from "@/lib/landingDesign";
import { cn } from "@/lib/utils";

const TELEGRAM_CONVERSATION = "https://t.me/integralevolution";

interface ProductCardDef {
  /** Locale key under `products.` for the prose (name, line, body, CTA labels). */
  key: string;
  /** Product ids in src/data/productMap.ts whose terms the card shows. */
  products: string[];
  /** Buttons: the landing comes from the product's row; a row with no landing gets no button. */
  links: { product: string; ctaKey: "cta" | "cta2" }[];
  /** Shown when the locale has no name for this card. */
  fallbackName?: string;
}

// Order follows docs/04-products/product_brief.md §0: the client path first, then the other offers.
const CARDS: ProductCardDef[] = [
  { key: "quiz", products: ["quiz"], links: [{ product: "quiz", ctaKey: "cta" }] },
  {
    key: "zog",
    products: ["top-talent-course", "zog-session", "zog-teams"],
    links: [
      { product: "top-talent-course", ctaKey: "cta" },
      { product: "zog-session", ctaKey: "cta2" },
    ],
  },
  {
    key: "fmf",
    products: ["fmf-session", "fmf-mastermind"],
    links: [{ product: "fmf-session", ctaKey: "cta" }],
    fallbackName: PRODUCT_FAMILIES.fmf.name,
  },
  { key: "pmfCore", products: ["pmf-discovery"], links: [{ product: "pmf-discovery", ctaKey: "cta" }] },
  { key: "pmf", products: ["build"], links: [{ product: "build", ctaKey: "cta" }] },
  { key: "evolution", products: ["crossing"], links: [{ product: "crossing", ctaKey: "cta" }] },
  { key: "vector", products: ["vector"], links: [{ product: "vector", ctaKey: "cta" }] },
  { key: "collective", products: ["collective"], links: [] },
  { key: "forClients", products: ["for-clients"], links: [] },
  { key: "license", products: ["license"], links: [] },
  { key: "profile", products: ["profile"], links: [{ product: "profile", ctaKey: "cta" }] },
  { key: "matchmaking", products: ["matchmaking"], links: [{ product: "matchmaking", ctaKey: "cta" }] },
  { key: "whiteLabel", products: ["white-label"], links: [{ product: "white-label", ctaKey: "cta" }] },
  { key: "aiTraining", products: ["ai-training"], links: [] },
  { key: "equilibrium", products: ["equilibrium"], links: [{ product: "equilibrium", ctaKey: "cta" }] },
  { key: "mystery", products: ["mystery-school"], links: [{ product: "mystery-school", ctaKey: "cta" }] },
  { key: "cockpit", products: ["cockpit"], links: [{ product: "cockpit", ctaKey: "cta" }] },
];

// R&D rows of the brief (§0.3), shown muted, no CTA.
const RD_CARDS: ProductCardDef[] = [
  { key: "card8", products: ["evolution-portal"], links: [] },
  { key: "card10", products: ["founder-read"], links: [] },
];

const ProductCard = ({ def, muted = false }: { def: ProductCardDef; muted?: boolean }) => {
  const { t, i18n } = useTranslation();
  const rows = def.products.map(getProduct);
  const name = t(`products.${def.key}.name`, { defaultValue: def.fallbackName ?? rows[0].name });
  // Market door (2026-10-30): the promise is the shared experience; the method keeps its name.
  const line =
    def.key === "fmf" ? marketDoor("productsFmfLine", i18n.resolvedLanguage)
    : def.key === "pmf" ? marketDoor("productsPmfLine", i18n.resolvedLanguage)
    : t(`products.${def.key}.line`);
  const links = def.links.flatMap(({ product, ctaKey }) => {
    const landing = getProduct(product).landing;
    return landing ? [{ ...landing, ctaKey }] : [];
  });

  return (
    <article
      className={cn("liquid-glass-strong rounded-[2.5rem] p-7 md:p-9 space-y-5", muted && "opacity-60")}
      aria-labelledby={`${def.key}-title`}
    >
      <div className="space-y-3">
        <div>
          {rows.flatMap(summaryLines).map(terms => <ProductEyebrow key={terms}>{terms}</ProductEyebrow>)}
        </div>
        <h2 id={`${def.key}-title`} className="product-title text-2xl sm:text-3xl">{name}</h2>
        <p className="product-body text-base italic">{line}</p>
      </div>
      <p className="product-body text-base">{t(`products.${def.key}.body`)}</p>
      {links.length > 0 && (
        <div className="pt-1 flex flex-wrap gap-3">
          {links.map(link => (
            <ProductCta key={link.ctaKey} href={link.href} external={link.external}>
              {t(`products.${def.key}.${link.ctaKey}`)}
            </ProductCta>
          ))}
        </div>
      )}
    </article>
  );
};

type View = "cards" | "map";

const ViewToggle = ({ view, onChange }: { view: View; onChange: (view: View) => void }) => {
  const { t } = useTranslation();
  const options: { id: View; label: string }[] = [
    { id: "cards", label: t("products.viewCards") },
    { id: "map", label: t("products.viewMap") },
  ];
  return (
    <div role="group" aria-label={t("products.viewLabel")} className="flex justify-center gap-2">
      {options.map(option => (
        <button
          key={option.id}
          type="button"
          aria-pressed={view === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "product-eyebrow rounded-full px-5 py-2 min-h-11 transition-colors",
            view === option.id ? "liquid-glass-strong" : "liquid-glass opacity-70 hover:opacity-100",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

const ProductsPage = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<View>("cards");

  return (
    <>
      <SEO title={t("products.title")} description={t("products.seoDescription")} path="/products" />
      <ProductLanding wide={view === "map"}>
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

        <ViewToggle view={view} onChange={setView} />

        {view === "map" ? (
          <ProductMapView />
        ) : (
          <>
            <div className="space-y-6 md:space-y-8">
              {CARDS.map(def => (
                <Fragment key={def.key}>
                  <ProductCard def={def} />
                  {def.key === "profile" && (
                    <p className="product-body text-sm italic max-w-md mx-auto text-center">
                      <span className="font-semibold not-italic">{t("products.aiCreditsHeading")}.</span> {t("products.aiCreditsBody")}
                    </p>
                  )}
                </Fragment>
              ))}
            </div>

            <section className="space-y-6 md:space-y-8" aria-labelledby="products-rd">
              <div className="text-center space-y-3">
                <ProductEyebrow>{t("products.rdEyebrow")}</ProductEyebrow>
                <h2 id="products-rd" className="product-title text-3xl">{t("products.rdHeading")}</h2>
                <p className="product-body text-base italic max-w-md mx-auto">{t("products.rdIntro")}</p>
              </div>
              {RD_CARDS.map(def => <ProductCard key={def.key} def={def} muted />)}
            </section>
          </>
        )}

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

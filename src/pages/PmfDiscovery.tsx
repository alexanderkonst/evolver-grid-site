/**
 * /products/pmf-discovery — "Product-Market Fit Discovery in One Session" (2026-11-12).
 * Explains what happens in the session. No client case on purpose (Sasha, 2026-11-12).
 * Copy law: docs/templates/module-form.md §12 (result named, one button, one image).
 */
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { ProductCta, ProductEyebrow, ProductHero, ProductLanding, ProductList } from "@/components/products/ProductLanding";
import { Ornament } from "@/lib/landingDesign";

const TELEGRAM_CONVERSATION = "https://t.me/integralevolution";

const PmfDiscovery = () => {
  const { t } = useTranslation();
  const k = (key: string) => t(`pmfDiscoveryPage.${key}`);
  const list = (key: string) => t(`pmfDiscoveryPage.${key}`, { returnObjects: true }) as string[];

  return (
    <>
      <SEO title={k("title")} description={k("seoDescription")} path="/products/pmf-discovery" />
      <ProductLanding>
        <ProductHero eyebrow={k("eyebrow")} title={k("title")} subtitle={k("subtitle")}>
          <Ornament />
        </ProductHero>

        <section className="liquid-glass-strong rounded-[2.5rem] p-7 md:p-9 space-y-5" aria-labelledby="pmf-discovery-get">
          <ProductEyebrow>{k("getEyebrow")}</ProductEyebrow>
          <h2 id="pmf-discovery-get" className="product-title text-2xl sm:text-3xl">{k("getHeading")}</h2>
          <ProductList items={list("getItems")} />
        </section>

        <section className="liquid-glass-strong rounded-[2.5rem] p-7 md:p-9 space-y-5" aria-labelledby="pmf-discovery-how">
          <ProductEyebrow>{k("howEyebrow")}</ProductEyebrow>
          <h2 id="pmf-discovery-how" className="product-title text-2xl sm:text-3xl">{k("howHeading")}</h2>
          <ProductList items={list("howItems")} />
        </section>

        <section className="text-center space-y-4 max-w-lg mx-auto" aria-labelledby="pmf-discovery-promise">
          <ProductEyebrow>{k("promiseEyebrow")}</ProductEyebrow>
          <h2 id="pmf-discovery-promise" className="product-title text-2xl">{k("promiseHeading")}</h2>
          <p className="product-body text-base italic">{k("promiseBody")}</p>
        </section>

        <footer className="text-center space-y-6 pb-8">
          <Ornament />
          <p className="product-body text-sm italic">{k("format")}</p>
          <ProductCta href={TELEGRAM_CONVERSATION} external breathe>{k("cta")}</ProductCta>
        </footer>
      </ProductLanding>
    </>
  );
};

export default PmfDiscovery;

/** /products/vector — the landing-and-direction program, in the shared product-landing design language. */
import type { CSSProperties } from "react";
import { Droplets, Flame, Mountain, Sparkles, Wind, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { ProductCta, ProductEyebrow, ProductHero, ProductLanding, ProductList } from "@/components/products/ProductLanding";
import { Ornament } from "@/lib/landingDesign";
import "./TheVector.css";

const TELEGRAM_CONVERSATION = "https://t.me/integralevolution";

// Blocks 0 to 9, in route order. The number is part of each title string.
const BLOCK_KEYS = ["b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9"] as const;

// Block 7 (Элементы) shows the five elements as chips under its text.
const ELEMENTS_BLOCK = "b7";
const ELEMENTS: { key: string; Icon: LucideIcon }[] = [
  { key: "fire", Icon: Flame },
  { key: "water", Icon: Droplets },
  { key: "earth", Icon: Mountain },
  { key: "air", Icon: Wind },
  { key: "ether", Icon: Sparkles },
];

const TheVector = () => {
  const { t } = useTranslation();
  const contact = <ProductCta href={TELEGRAM_CONVERSATION} external breathe>{t("vector.cta")}</ProductCta>;

  return (
    <>
      <SEO title={t("vector.title")} description={t("vector.seoDescription")} path="/products/vector" />
      <ProductLanding>
        <ProductHero eyebrow={t("vector.eyebrow")} title={t("vector.heading")} subtitle={t("vector.subheading")}>
          <Ornament />
          <div className="flex flex-col items-center gap-3 pt-2">
            {contact}
            <p className="product-body text-xs">{t("vector.priceLine")}</p>
          </div>
        </ProductHero>

        <section className="max-w-md mx-auto space-y-6">
          <p className="product-body text-base text-center">{t("vector.essence")}</p>
          <ProductEyebrow heading className="text-center">{t("vector.formatHeading")}</ProductEyebrow>
          <ProductList items={["f1", "f2", "f3", "f4", "f5"].map(key => t(`vector.${key}`))} />
        </section>

        <section className="liquid-glass-strong rounded-[2.5rem] p-7 md:p-9 space-y-6">
          <ProductEyebrow heading className="text-center">{t("vector.splitHeading")}</ProductEyebrow>
          {/* Proportional 40 / 50 bar: flex-grow carries the minutes, so the widths are 4:5. */}
          <div className="vector-split" role="presentation">
            <div className="vector-split-part vector-split-yours" style={{ flexGrow: 40 }}>{t("vector.split1Label")}</div>
            <div className="vector-split-part vector-split-content" style={{ flexGrow: 50 }}>{t("vector.split2Label")}</div>
          </div>
          <div className="grid gap-5 md:grid-cols-[40fr_50fr] md:gap-6">
            <p className="product-body text-base">{t("vector.split1Body")}</p>
            <p className="product-body text-base">{t("vector.split2Body")}</p>
          </div>
        </section>

        <Ornament />

        <section className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-4">
            <ProductEyebrow heading>{t("vector.sequenceHeading")}</ProductEyebrow>
            <p className="product-body text-base italic max-w-md mx-auto">{t("vector.sequenceIntro")}</p>
          </div>
          {/* One directed line from block 0 to block 9: it tapers up and brightens toward the arrowhead. */}
          <ol className="vector-route space-y-8">
            {BLOCK_KEYS.map((key, index) => (
              <li key={key} style={{ "--n": index } as CSSProperties}>
                <h3 className="product-title text-2xl mb-3">{t(`vector.${key}.title`)}</h3>
                <p className="product-body text-base">{t(`vector.${key}.body`)}</p>
                {key === ELEMENTS_BLOCK && (
                  <ul className="vector-elements">
                    {ELEMENTS.map(({ key: element, Icon }) => (
                      <li key={element} className="vector-element liquid-glass">
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span className="product-body text-sm">{t(`vector.elements.${element}`)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>

        <Ornament />

        <section className="liquid-glass-strong rounded-[2.5rem] p-7 md:p-9 text-center space-y-6 mb-8">
          <ProductEyebrow heading>{t("vector.priceHeading")}</ProductEyebrow>
          <p className="product-price">{t("vector.priceLine")}</p>
          <Ornament />
          <div className="pt-2">{contact}</div>
        </section>
      </ProductLanding>
    </>
  );
};

export default TheVector;

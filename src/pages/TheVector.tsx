/** /products/vector — the landing-and-direction program, in the infographic style (v4).
 *  Lunar is the baseline; every other skin re-voices the same structure through the
 *  `--vec-*` role tokens in TheVector.css. No colour lives in this file. */
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Droplets, Flame, Mountain, Sparkles, Wind, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { Ornament, igniteLogo } from "@/lib/landingDesign";
import "./TheVector.css";
import { productVars } from "@/data/productMap";

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

/** Section eyebrow: small tracked caps, a section number and a hairline under it. */
const VectorEyebrow = ({ n, children, heading = false }: { n?: string; children: ReactNode; heading?: boolean }) => {
  const Tag = heading ? "h2" : "p";
  return (
    <Tag className="vector-eyebrow">
      {n && <span className="vector-eyebrow-num" aria-hidden="true">{n} <span className="vector-eyebrow-dot">·</span></span>}
      <span>{children}</span>
    </Tag>
  );
};

/** The 0–9 path. On desktop the hairline leans: JS only measures where each block sits,
 *  so the pearl orbs ride the diagonal exactly; CSS decides whether to use it (mobile stays vertical). */
const VectorRoute = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLOListElement>(null);

  useLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const place = () => {
      const items = Array.from(list.children) as HTMLElement[];
      if (items.length < 2) return;
      const tops = items.map(item => item.offsetTop);
      const span = tops[tops.length - 1] - tops[0];
      list.style.setProperty("--route-top", `${tops[0]}px`);
      list.style.setProperty("--route-h", `${span}px`);
      items.forEach((item, i) => item.style.setProperty("--shift", span > 0 ? `${(tops[i] - tops[0]) / span}` : "0"));
    };
    place();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(place);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return <ol ref={ref} className="vector-route">{children}</ol>;
};

const TheVector = () => {
  const { t } = useTranslation();
  const vars = productVars("vector");
  const contact = (
    <a href={TELEGRAM_CONVERSATION} target="_blank" rel="noopener noreferrer" className="vector-cta">
      <span>{t("vector.cta")}</span>
      <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
    </a>
  );

  return (
    <>
      <SEO title={t("vector.title")} description={t("vector.seoDescription", vars)} path="/products/vector" />
      <main className="product-landing vector-page relative min-h-dvh font-sans">
        <div className="vector-sky" aria-hidden="true" />
        <div className="vector-inner relative max-w-2xl mx-auto px-5 md:px-6 py-16 space-y-16">
          <header className="vector-hero text-center space-y-6 pt-4 pb-2">
            <span className="vector-moon" aria-hidden="true" />
            {/* The star: same asset, size and glow as on every product page. Untouched. */}
            <img src={igniteLogo} alt={t("ignite.logoAlt")} width={140} height={140}
              className="w-[140px] h-auto mx-auto opacity-80" />
            <VectorEyebrow>{t("vector.eyebrow")}</VectorEyebrow>
            <h1 className="vector-title vector-hero-title">{t("vector.heading")}</h1>
            <p className="vector-lead max-w-md mx-auto">{t("vector.subheading")}</p>
            <Ornament />
            {/* Price lives once, in the closing block (Sasha, 2026-11-17). */}
            <div className="flex flex-col items-center gap-3 pt-2">{contact}</div>
          </header>

          <section className="max-w-md mx-auto space-y-6">
            <p className="vector-body text-center">{t("vector.essence")}</p>
            <VectorEyebrow n="01" heading>{t("vector.formatHeading")}</VectorEyebrow>
            <ul className="vector-list space-y-3 text-left">
              {["f1", "f2", "f3", "f4", "f5"].map(key => (
                <li key={key}>
                  <span className="vector-orb" aria-hidden="true" />
                  <span className="vector-body">{t(`vector.${key}`, vars)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-7">
            <VectorEyebrow n="02" heading>{t("vector.splitHeading")}</VectorEyebrow>
            {/* One thin bar, split 40 / 50: flex-grow carries the minutes, so the widths are 4:5. */}
            <div className="vector-split" role="presentation">
              <div className="vector-split-part" style={{ flexGrow: 40 }}>
                <span className="vector-split-bar vector-split-yours" />
                <span className="vector-split-label">{t("vector.split1Label")}</span>
              </div>
              <div className="vector-split-part" style={{ flexGrow: 50 }}>
                <span className="vector-split-bar vector-split-content" />
                <span className="vector-split-label">{t("vector.split2Label")}</span>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-[40fr_50fr] md:gap-6">
              <p className="vector-body">{t("vector.split1Body")}</p>
              <p className="vector-body">{t("vector.split2Body")}</p>
            </div>
          </section>

          <Ornament />

          <section className="vector-route-section mx-auto space-y-9">
            <div className="text-center space-y-4">
              <VectorEyebrow n="03" heading>{t("vector.sequenceHeading")}</VectorEyebrow>
              <p className="vector-quote max-w-md mx-auto text-left">{t("vector.sequenceIntro")}</p>
            </div>
            <VectorRoute>
              {BLOCK_KEYS.map((key, index) => (
                <li key={key} style={{ "--n": index } as CSSProperties}>
                  <span className="vector-route-orb" aria-hidden="true" />
                  <h3 className="vector-title vector-block-title">{t(`vector.${key}.title`)}</h3>
                  <p className="vector-body">{t(`vector.${key}.body`)}</p>
                  {key === ELEMENTS_BLOCK && (
                    <ul className="vector-elements">
                      {ELEMENTS.map(({ key: element, Icon }) => (
                        <li key={element} className="vector-element">
                          <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{t(`vector.elements.${element}`)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </VectorRoute>
          </section>

          <Ornament />

          <section className="text-center space-y-6 pb-4">
            <VectorEyebrow n="04" heading>{t("vector.priceHeading")}</VectorEyebrow>
            <p className="vector-price">{t("vector.priceLine", vars)}</p>
            <div className="pt-2">{contact}</div>
            <p className="vector-footer-mark" aria-hidden="true">findyourtoptalent.com</p>
          </section>
        </div>
      </main>
    </>
  );
};

export default TheVector;

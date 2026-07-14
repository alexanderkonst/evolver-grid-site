import { ArrowDown, ArrowUpRight, Asterisk, Orbit, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import logo from "@/assets/you-be-original-holo-transparent.png";
import aleksandrPhoto from "@/assets/aleksandr-photo.jpeg";
import "./YouBeOriginal.css";

const BOOKING_URL = "https://www.calendly.com/konstantinov";

export default function YouBeOriginal() {
  const { t } = useTranslation();

  const moves = [
    { n: "01", title: t("youpage.move1Title"), body: t("youpage.move1Body") },
    { n: "02", title: t("youpage.move2Title"), body: t("youpage.move2Body") },
    { n: "03", title: t("youpage.move3Title"), body: t("youpage.move3Body") },
  ];

  return (
    <main className="you-page">
      <Helmet>
        <title>{t("youpage.seoTitle")}</title>
        <meta name="description" content={t("youpage.seoDescription")} />
      </Helmet>

      <header className="you-header">
        <a className="you-brand" href="/you" aria-label="YOU — be original">
          <img src={logo} alt="YOU — be original" />
        </a>
        <p>{t("youpage.headerTagline")}</p>
        <a className="you-header-cta" href={BOOKING_URL} target="_blank" rel="noreferrer">
          {t("youpage.headerCta")} <ArrowUpRight size={16} />
        </a>
      </header>

      <section className="you-hero">
        <div className="you-orbit" aria-hidden="true"><div /><span>YOU</span><i /></div>
        <p className="you-hero-index">{t("youpage.heroIndex")}</p>
        <h1>
          {t("youpage.heroH1Part1")} <em>{t("youpage.heroH1Em")}</em>{t("youpage.heroH1Part2")}
        </h1>
        <div className="you-hero-aside">
          <p>{t("youpage.heroAsideBody")}</p>
          <a className="you-primary-cta" href={BOOKING_URL} target="_blank" rel="noreferrer">
            {t("youpage.heroCtaPrimary")} · {t("youpage.price")} <ArrowUpRight size={18} />
          </a>
          <small><span /> {t("youpage.scarcityLine")}</small>
          <p className="you-parent-note">{t("youpage.parentLine")}</p>
        </div>
        <a className="you-scroll" href="#orientation" aria-label="Continue to the next section"><ArrowDown /></a>
      </section>

      <section className="you-statement" id="orientation">
        <div className="you-statement-label"><Asterisk /> {t("youpage.statementLabel")}</div>
        <p>{t("youpage.statementPre")} <strong>{t("youpage.statementStrong")}</strong></p>
        <p className="you-statement-answer">{t("youpage.statementAnswer")}</p>
      </section>

      <section className="you-initiation">
        <div className="you-initiation-title">
          <p>{t("youpage.initiationLabel")}</p>
          <h2>{t("youpage.initiationH2")}</h2>
          <div className="you-prism" aria-hidden="true"><Orbit /><span>{t("youpage.initiationPrismLabel")}</span></div>
        </div>
        <div className="you-initiation-copy">
          <p className="you-large-copy">{t("youpage.initiationLarge")}</p>
          <p>{t("youpage.initiationBody1")}</p>
          <p>{t("youpage.initiationBody2")}</p>
        </div>
      </section>

      <section className="you-moves">
        <div className="you-moves-head">
          <p>{t("youpage.movesLabel")}</p>
          <h2>{t("youpage.movesH2")}</h2>
        </div>
        <div className="you-move-list">
          {moves.map((move) => (
            <article className="you-move" key={move.n}>
              <span>{move.n}</span><h3>{move.title}</h3><p>{move.body}</p><Sparkles size={18} />
            </article>
          ))}
        </div>
      </section>

      <aside className="you-neural">
        <p className="you-neural-label">{t("youpage.neuralLabel")}</p>
        <blockquote>{t("youpage.neuralQuoteMain")} <em>{t("youpage.neuralQuoteEm")}</em></blockquote>
        <div className="you-neural-note">{t("youpage.neuralNote")}</div>
      </aside>

      <section className="you-about">
        <div className="you-about-photo">
          <div className="you-photo-aura" aria-hidden="true" />
          <img src={aleksandrPhoto} alt="Aleksandr Konstantinov" />
          <span>{t("youpage.aboutPhotoTag")}</span>
        </div>
        <div className="you-about-copy">
          <p className="you-kicker">{t("youpage.aboutKicker")}</p>
          <h2>{t("youpage.aboutH2")}</h2>
          <p className="you-credentials">{t("youpage.aboutCredentials")}</p>
          <p>
            {t("youpage.aboutBody1Pre")}
            <a href="https://findyourtoptalent.com" target="_blank" rel="noreferrer">{t("youpage.aboutBody1LinkText")}</a>
            {t("youpage.aboutBody1Post")}
          </p>
          <p>{t("youpage.aboutBody2")}</p>
          <div className="you-belief"><span>{t("youpage.aboutBeliefLabel")}</span> {t("youpage.aboutBeliefBody")}</div>
        </div>
      </section>

      <section className="you-after">
        <p className="you-after-label">{t("youpage.afterLabel")}</p>
        <h3>{t("youpage.afterTitle")}</h3>
        <p>{t("youpage.afterBody")}</p>
      </section>

      <section className="you-final">
        <img src={logo} alt="YOU — be original" />
        <p>{t("youpage.finalLabel")}</p>
        <h2>
          {t("youpage.finalH2Pre")} <em>{t("youpage.finalH2Em")}</em>
        </h2>
        <p className="you-final-copy">{t("youpage.finalCopy")}</p>
        <a className="you-primary-cta" href={BOOKING_URL} target="_blank" rel="noreferrer">
          {t("youpage.finalCta")} · {t("youpage.price")} <ArrowUpRight size={18} />
        </a>
        <small>{t("youpage.finalScarcity")}</small>
      </section>

      <footer className="you-footer"><span>{t("youpage.footerBrand")}</span><span>{t("youpage.footerTagline")}</span><span>© 2026</span></footer>
    </main>
  );
}

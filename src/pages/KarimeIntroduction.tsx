import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import SEO from "@/components/SEO";
import GameShellV2 from "@/components/game/GameShellV2";
import KarimeIntroductionBackground from "@/components/landing/KarimeIntroductionBackground";
import { useSkin } from "@/contexts/SkinContext";
import "./KarimeIntroduction.css";

// The contact links intentionally arrange introductions through Sasha.
const WHATSAPP_URL =
  "https://wa.me/14157073432?text=Hi%20Sasha%2C%20I%20would%20like%20to%20arrange%20a%20free%2030-minute%20chemistry%20call%20with%20Karima.";
const TELEGRAM_HANDLE_URL = "https://t.me/integralevolution";
const PORTRAIT = "/karime/bluelotus/assets/karime.jpg";

const SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "Who I am, in the order that matters.",
    paragraphs: [
      "I was born in Mexico. I spent a decade in international policy. A master's in public policy from Oxford. Then Mexico's telecommunications regulator, where I directed digital development and led internet neutrality policy. Then the World Economic Forum, where I was selected as a Global Leadership Fellow.",
    ],
  },
  {
    heading: "",
    paragraphs: [
      "What was never on that résumé is that for twenty-two years, running alongside all of it, I have been a ceremonialist. Hundreds of ceremonies with sacred plants, across three continents and seven countries. I was instructed and initiated in the traditions of Mexico and other Indigenous peoples of Latin America.",
      "My longest work is with cannabis, which I know as Santa María. One of the missions of my life is to return her to her original place on the altar of the master plants.",
    ],
  },
  {
    heading: "Who I work with.",
    paragraphs: [
      "Accomplished women in the middle of a heartbreak or an illness. Women who carry a great deal, who have done the therapy and read the books, and who still cannot find, in their own body, the meaning they know is supposed to be in there.",
      "A heartbreak is not only a breakup. Some of the deepest ones happen inside a relationship that is still standing.",
      "She is the one everyone else leans on, so there is nowhere for her to fall apart. They keep telling her how strong she is, and every time it is said she feels more alone. And she notices this has come around before.",
    ],
  },

];

const KarimeIntroduction = () => {
  const { pushTemporarySkin } = useSkin();
  const [searchParams] = useSearchParams();
  const referrer = (searchParams.get("from") || "").trim().slice(0, 40);

  useEffect(() => pushTemporarySkin("karime"), [pushTemporarySkin]);

  return (
    <GameShellV2 hideNavigation hideLogo defaultRailMinimized>
      <SEO
        title="Karima Kuri · An introduction"
        description="A decade in international policy. Twenty-two years in ceremony. I work with accomplished women in the middle of a heartbreak or an illness so that instead of only surviving it they become initiated into spiritual advancement and the next phase of womanhood and leadership."
        path="/meet-karime"
        ogTitle="An initiation into womanhood and self-leadership"
        ogImage="https://findyourtoptalent.com/karime/bluelotus/assets/karime.jpg"
        ogImageAlt="Karima Kuri Tiscareño in ceremony"
      />
      <div className="karime-introduction" lang="en">
        <a className="ki-skip-link" href="#ki-main">Skip to introduction</a>
        <section className="ki-hero" aria-labelledby="ki-title">
          <header className="ki-header ki-container">
            <div className="ki-brand">
              <KarimeIntroductionBackground />
            <a href="#" className="ki-wordmark" aria-label="Karima Kuri, back to top">
              Karima Kuri<span>Ceremony · Womanhood · Leadership</span>
            </a>
            </div>
            <nav className="ki-nav" aria-label="Karima’s introduction">
              <a href="#ki-about">Meet Karima</a>
              <a href="#ki-work">The work</a>
            </nav>
            <a href="#ki-contact" className="ki-header-contact">
              Let’s connect <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </header>

          <div className="ki-hero-content ki-container">
            {referrer && <p className="ki-eyebrow ki-referrer">An introduction, by way of {referrer}</p>}
            <h1 id="ki-title">
              <span className="ki-title-first">A heartbreak or an illness is not a problem to fix</span>{" "}
              <span>It is an <em>initiation into womanhood and self-leadership</em></span>
            </h1>
            <a className="ki-button" href="#ki-contact">
              Book a free chemistry call <ArrowDown size={17} aria-hidden="true" />
            </a>
          </div>

          <div className="ki-hero-bottom ki-container">
            <p>A decade in international policy.<br /><span>Twenty-two years in ceremony.</span></p>
            <a href="#ki-about" className="ki-scroll-link">
              <span>The introduction</span><ArrowDown size={18} aria-hidden="true" />
            </a>
          </div>
        </section>

        <main id="ki-main" tabIndex={-1}>
          <section id="ki-for-you" className="ki-for-you ki-section" aria-labelledby="ki-for-you-heading">
            <div className="ki-container ki-editorial-grid">
              <div className="ki-section-heading">
                <p className="ki-eyebrow">01 / The women I meet</p>
                <h2 id="ki-for-you-heading">Who I{" "}<br /><em>work with</em></h2>
              </div>
              <div className="ki-prose ki-audience-copy">
                <p>{SECTIONS[2].paragraphs[0]}</p>
                <p>{SECTIONS[2].paragraphs[2]}</p>
                <p>{SECTIONS[2].paragraphs[1]}</p>
              </div>
            </div>
          </section>

          <section id="ki-about" className="ki-about ki-section" aria-labelledby="ki-about-heading">
            <div className="ki-container">
              {referrer && (
                <p className="ki-personal-note">
                  {referrer} told me she had spoken with you about my work, and that you were curious. So, briefly.
                </p>
              )}
              <ul className="ki-credentials" aria-label="Background and qualifications">
                <li><div className="ki-logo"><img src="/karime/introduction/logos/oxford.svg" alt="University of Oxford" loading="lazy" /></div><small>Master’s in Public Policy</small></li>
                <li><div className="ki-logo"><img src="/karime/introduction/logos/wef.svg" alt="World Economic Forum" loading="lazy" /></div><small>Global Leadership Fellow</small></li>
                <li><div className="ki-logo ki-logo-sofia"><img src="/karime/introduction/logos/sofia.png" alt="Sofia University" loading="lazy" /></div><small>Transformational Life Coach</small></li>
                <li><div className="ki-logo"><span>Twenty-two years</span></div><small>Ceremony across seven countries</small></li>
              </ul>
              <div className="ki-section-heading">
                <p className="ki-eyebrow">02 / Meet Karima</p>
                <h2 id="ki-about-heading">A curandera &amp; <em>a ceremonialist</em></h2>
                <p className="ki-heading-support">Also an ex-WEF Global Fellow and an Oxford alum</p>
              </div>
              <div className="ki-story-grid">
                <figure className="ki-portrait">
                  <img src={PORTRAIT} alt="Karima Kuri Tiscareño holding ceremonial feathers in warm light" width="1241" height="1268" loading="lazy" decoding="async" />
                  <figcaption>
                    <span>Karima Kuri Tiscareño</span>
                    <span>Born in Mexico. Working worldwide.</span>
                  </figcaption>
                </figure>
                <div className="ki-prose ki-story">
                  <p>{SECTIONS[0].paragraphs[0]}</p>
                  <p className="ki-hinge">Then I left.</p>
                  <p>{SECTIONS[1].paragraphs[0]}</p>
                  <p>{SECTIONS[1].paragraphs[1]}</p>
                </div>
              </div>

            </div>
          </section>

          <section id="ki-work" className="ki-work ki-section" aria-labelledby="ki-work-heading">
            <div className="ki-container ki-editorial-grid">
              <div className="ki-section-heading">
                <p className="ki-eyebrow">03 / How the work happens</p>
                <h2 id="ki-work-heading">We begin with <em>where you are</em></h2>
                <p className="ki-section-intro">The form of the work follows what you need and what you are ready for. We begin gently, with deeper work built on preparation.</p>
              </div>
              <ol className="ki-steps">
                <li><h3>A chemistry conversation</h3><p>In a free 30-minute call, we look at what is happening in your life, what you are seeking, and whether this is the right time for us to work together.</p></li>
                <li><h3>A place to bring what is difficult</h3><p>You bring a topic you want to work through. I listen for what is happening beneath the words and guide you through it. Together, we explore the form of support that fits this passage.</p></li>
                <li><h3>Ceremony, with preparation</h3><p>When ceremony belongs in the work, we prepare for it together. The lighter work prepares you for the deeper work, and the next step follows your readiness.</p></li>
                <li><h3>Time to integrate</h3><p>We make space to understand what comes up and bring it into daily life. Integration continues through conversation and practices you can return to between sessions.</p></li>
              </ol>
            </div>
          </section>

          <section id="ki-expectations" className="ki-expectations ki-section" aria-labelledby="ki-expectations-heading">
            <div className="ki-container">
              <div className="ki-editorial-grid">
                <div className="ki-section-heading">
                  <p className="ki-eyebrow">04 / What to expect</p>
                  <h2 id="ki-expectations-heading">The practical <em>details</em></h2>
                </div>
                <div className="ki-prose">
                  <p><strong>Your first conversation</strong><br />A free 30-minute chemistry call to look at your situation and whether now is the time to work together.</p>
                  <p><strong>Individual sessions and ongoing support</strong><br />Healing sessions take place online or in person. One-to-one coaching takes place online over three to six months.</p>
                  <p><strong>Ceremony</strong><br />Santa María, Triple Goddess and mushroom ceremonies take place in person. Santa María rituals are also available online.</p>
                  <p><strong>Between sessions</strong><br />Recorded practices include ritual, meditation, nervous system regulation, energy activation, forgiveness and identity work.</p>
                </div>
              </div>
              <div className="ki-formats">
                <div><h3>Six-month microdosing support</h3><p>A personal protocol, medicines, integration sessions and recorded practices, brought into the coaching work.</p></div>
                <div><h3>Metamorphosis · Seven months</h3><p>My most comprehensive individual journey combines mushroom ceremony, a microdosing protocol, coaching and recorded practices, online and in person.</p></div>
                <div><h3>Shared ceremonial spaces</h3><p>In-person Santa María ceremonies for groups and couples, and mushroom ceremonies for women’s groups or mixed groups.</p></div>
                <div><h3>Homes, businesses and families</h3><p>Harmonization work with spaces and family-business situations, arranged around the people and place involved.</p></div>
              </div>
            </div>
          </section>

          <section id="ki-contact" className="ki-contact ki-section" aria-labelledby="ki-contact-heading">
            <div className="ki-container ki-contact-inner">
              <p className="ki-eyebrow">05 / An invitation</p>
              <h2 id="ki-contact-heading">If this describes you, <em>let’s talk</em></h2>
              <p className="ki-invitation-copy">Book a free 30-min chemistry call where we look at your situation</p>
              <a className="ki-button" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Arrange my free chemistry call <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <p className="ki-contact-details">30 minutes · No cost · Arrange via WhatsApp<br />Online worldwide · In person by arrangement</p>
            </div>
          </section>
        </main>

        <footer className="ki-footer">
          <div className="ki-container ki-footer-inner">
            <a href="#" className="ki-wordmark">Karima Kuri<span>Tiscareño</span></a>
            <p>Ceremony · Womanhood · Leadership</p>
            <div className="ki-footer-links">
              <a href={TELEGRAM_HANDLE_URL} target="_blank" rel="noopener noreferrer">Telegram <ArrowUpRight size={14} aria-hidden="true" /></a>
              <a href="https://wa.me/14157073432" target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={14} aria-hidden="true" /></a>
            </div>
          </div>
        </footer>
      </div>
    </GameShellV2>
  );
};

export default KarimeIntroduction;

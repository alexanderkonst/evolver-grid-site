import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import SEO from "@/components/SEO";
import GameShellV2 from "@/components/game/GameShellV2";
import KarimeIntroductionBackground from "@/components/landing/KarimeIntroductionBackground";
import { useSkin } from "@/contexts/SkinContext";
import "./KarimeIntroduction.css";

/**
 * A personal introduction, presented as an editorial landing page.
 * Copy source: docs/02-strategy/unique-businesses/karimes_unique_business.md.
 * Keep the policy career → “Then I left.” → ceremony sequence, all five
 * narrative beats, and the intentional Sasha contact relay. English only.
 * ?from=Name personalizes the introduction without changing the core letter.
 */
const WHATSAPP_URL =
  "https://wa.me/14157073432?text=Hi%20Sasha%2C%20I%20read%20Karime%27s%20introduction%20and%20would%20like%20to%20connect.";
const TELEGRAM_HANDLE_URL = "https://t.me/integralevolution";
const PORTRAIT = "/karime/bluelotus/assets/karime.jpg";

const SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "Who I am, in the order that matters.",
    paragraphs: [
      "I was born in Mexico. I spent a decade in international policy. A master's in public policy from Oxford. Then Mexico's telecommunications regulator, where I directed digital development and led our net neutrality policy. Then the World Economic Forum, where I was selected as a Global Leadership Fellow.",
    ],
  },
  {
    heading: "",
    paragraphs: [
      "What was never on that résumé is that for twenty-two years, running alongside all of it, I have been a ceremonialist. Hundreds of ceremonies with sacred plants, across three continents and seven countries. I was instructed and initiated in the traditions of Mexico and other Indigenous peoples of Latin America.",
      "My longest work is with cannabis, which I know as Santa María. One of the missions of my life is to return her to her original place on the altar of the master plants.",
      "Both halves were always there. At some point I stopped hiding one of them, and I stopped accepting that they belong in separate rooms.",
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
  {
    heading: "Why there is usually nowhere to go.",
    paragraphs: [
      "Go to medicine and it gets treated as a malfunction. A protocol, a timeline, nothing about what it might mean.",
      "Go to the healing world and someone will finally treat it as meaningful, but they cannot meet her mind or the world she works in. She leaves the room realigned, and then she is alone again with her job, her family, and everything she is responsible for.",
      "So she does what she has always done. She holds it together for everyone else and postpones herself one more time.",
    ],
  },
  {
    heading: "What happens instead.",
    paragraphs: [
      "I walk her through the passage rather than around it. Ceremony and ritual where the work calls for it, which is what the twenty-two years are for. And then the ordinary part that most of this world skips: one boundary, one conversation, one honest sentence she can actually say on a Tuesday.",
      "She stops just getting through it. She sleeps again. She can say what she needs without apologizing for it, and the thing stops running her days.",
      "And she does not come out the same person. Something that was closed in her opens. She comes out further into her own womanhood and further into her leadership. The pattern stops coming back, because she finally gave it what it had been asking for.",
      "I am in one of these passages myself as I write this, and I am meeting it the way I ask my clients to.",
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
        title="Karime Kuri · An introduction"
        description="A decade in international policy. Twenty-two years in ceremony. I work with accomplished women in the middle of a heartbreak or an illness so that instead of only surviving it they become initiated into spiritual advancement and the next phase of womanhood and leadership."
        path="/meet-karime"
        ogTitle="It is not a problem. It is an initiation."
        ogImage="https://findyourtoptalent.com/karime/bluelotus/assets/karime.jpg"
        ogImageAlt="Karime Kuri Tiscareño in ceremony"
      />
      <div className="karime-introduction" lang="en">
        <a className="ki-skip-link" href="#ki-main">Skip to introduction</a>
        <section className="ki-hero" aria-labelledby="ki-title">
          <KarimeIntroductionBackground />
          <header className="ki-header ki-container">
            <a href="#" className="ki-wordmark" aria-label="Karime Kuri, back to top">
              Karime Kuri<span>Ceremony · Womanhood · Leadership</span>
            </a>
            <nav className="ki-nav" aria-label="Karime’s introduction">
              <a href="#ki-about">Meet Karime</a>
              <a href="#ki-work">The work</a>
            </nav>
            <a href="#ki-contact" className="ki-header-contact">
              Let’s connect <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </header>

          <div className="ki-hero-content ki-container">
            <p className="ki-eyebrow ki-referrer">
              {referrer ? `An introduction, by way of ${referrer}` : "An introduction to my work"}
            </p>
            <h1 id="ki-title">
              <span className="ki-title-first">It is not a problem.</span>{" "}
              <span>It is an <em>initiation.</em></span>
            </h1>
            <p className="ki-hero-description">
              A heartbreak or an illness arrives, and everyone around you
              treats it as a problem to be solved.
            </p>
            <a className="ki-button" href="#ki-about">
              Explore my work <ArrowDown size={17} aria-hidden="true" />
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
          <section id="ki-about" className="ki-about ki-section" aria-labelledby="ki-about-heading">
            <div className="ki-container">
              {referrer && (
                <p className="ki-personal-note">
                  {referrer} told me she had spoken with you about my work, and that you were curious. So, briefly.
                </p>
              )}
              <div className="ki-section-heading">
                <p className="ki-eyebrow">01 / Meet Karime</p>
                <h2 id="ki-about-heading">Who I am,<br /><em>in the order that matters.</em></h2>
              </div>
              <div className="ki-story-grid">
                <figure className="ki-portrait">
                  <img src={PORTRAIT} alt="Karime Kuri Tiscareño holding ceremonial feathers in warm candlelight" width="1241" height="1268" loading="lazy" decoding="async" />
                  <figcaption>
                    <span>Karime Kuri Tiscareño</span>
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
              <p className="ki-story-close">{SECTIONS[1].paragraphs[2]}</p>
              <ul className="ki-credentials" aria-label="Background and qualifications">
                <li><span>University of Oxford</span><small>MA Public Policy</small></li>
                <li><span>World Economic Forum</span><small>Global Leadership Fellow</small></li>
                <li><span>Sofia University</span><small>Transformational Life Coach</small></li>
                <li><span>Twenty-two years</span><small>Ceremony across seven countries</small></li>
              </ul>
            </div>
          </section>

          <section id="ki-for-you" className="ki-for-you ki-section" aria-labelledby="ki-for-you-heading">
            <div className="ki-container ki-editorial-grid">
              <div className="ki-section-heading">
                <p className="ki-eyebrow">02 / The women I meet</p>
                <h2 id="ki-for-you-heading">Who I<br /><em>work with.</em></h2>
              </div>
              <div className="ki-prose ki-audience-copy">
                <p className="ki-lead">{SECTIONS[2].paragraphs[0]}</p>
                <p>{SECTIONS[2].paragraphs[2]}</p>
                <p className="ki-intimate-note">{SECTIONS[2].paragraphs[1]}</p>
              </div>
            </div>
          </section>

          <section className="ki-gap ki-section" aria-labelledby="ki-gap-heading">
            <div className="ki-container ki-editorial-grid">
              <div className="ki-section-heading">
                <p className="ki-eyebrow">03 / Between two worlds</p>
                <h2 id="ki-gap-heading">Why there is<br />usually<br /><em>nowhere to go.</em></h2>
              </div>
              <div className="ki-prose ki-gap-copy">
                <p>{SECTIONS[3].paragraphs[0]}</p>
                <p>{SECTIONS[3].paragraphs[1]}</p>
                <p className="ki-gap-conclusion">{SECTIONS[3].paragraphs[2]}</p>
              </div>
            </div>
          </section>

          <section id="ki-work" className="ki-work ki-section" aria-labelledby="ki-work-heading">
            <div className="ki-container">
              <div className="ki-editorial-grid">
                <div className="ki-section-heading">
                  <p className="ki-eyebrow">04 / The passage</p>
                  <h2 id="ki-work-heading">What happens<br /><em>instead.</em></h2>
                </div>
                <div className="ki-prose">
                  <p className="ki-lead">{SECTIONS[4].paragraphs[0]}</p>
                  <p>{SECTIONS[4].paragraphs[1]}</p>
                </div>
              </div>
              <div className="ki-becoming">
                <p className="ki-eyebrow">Womanhood · Leadership</p>
                <p>{SECTIONS[4].paragraphs[2]}</p>
              </div>
              <div className="ki-personal-close">
                <p>{SECTIONS[4].paragraphs[3]}</p>
                <span className="ki-signature">Karime</span>
              </div>
            </div>
          </section>

          <section id="ki-contact" className="ki-contact ki-section" aria-labelledby="ki-contact-heading">
            <div className="ki-container ki-contact-inner">
              <p className="ki-eyebrow">05 / An invitation</p>
              <h2 id="ki-contact-heading">If any of this interests you,<br /><em>I would welcome a conversation.</em></h2>
              <a className="ki-button" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Speak with Karime <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <p className="ki-contact-details">A first conversation, at no cost<br />Online worldwide · In person by arrangement</p>
            </div>
          </section>
        </main>

        <footer className="ki-footer">
          <div className="ki-container ki-footer-inner">
            <a href="#" className="ki-wordmark">Karime Kuri<span>Tiscareño</span></a>
            <p>Ceremony. Womanhood. Leadership.</p>
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

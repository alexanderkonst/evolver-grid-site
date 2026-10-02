import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import SEO from "@/components/SEO";
import GameShellV2 from "@/components/game/GameShellV2";
import KarimeIntroductionBackground from "@/components/landing/KarimeIntroductionBackground";
import { useSkin } from "@/contexts/SkinContext";
import "./KarimeIntroduction.css";

// Direct contact with Karima.
const WHATSAPP_URL =
  "https://wa.me/14157070563?text=Hi%20Karima%2C%20I%27d%20love%20to%20arrange%20a%20free%20chemistry%20call%20with%20you%2C%20can%20you%20send%20me%20the%20calendar%20link%20please%3F";
const TELEGRAM_HANDLE_URL = "https://t.me/doctoraquantum";
const PORTRAIT = "/karime/introduction/karima-soft-portrait.png";

const BIOGRAPHY = [
  "I was born in Mexico. For over a decade, I worked in international policy: shaping national policies for digital development and technological inclusion within the Mexican government, and leading global technology governance projects at the World Economic Forum. I was selected as a Global Leadership Fellow and hold a master’s in public policy from Oxford.",
  "Alongside my leadership in policy, I have spent twenty-two years in the healing arts, leading hundreds of sacred plant ceremonies across three continents and seven countries. I have been instructed and initiated in the traditions of Mexico and other Indigenous peoples of Latin America.",
  "Today, my focus is conscious, heart-centered leadership. I see life’s ruptures as openings for initiation. In helping people turn difficulty into purpose, I hold the larger picture: leaders with the courage and wisdom to guide themselves and their communities through change.",
];

const AUDIENCE = [
  "I am currently guided to serve accomplished individuals facing heartbreak or illness. People who carry a great deal of responsibility, yet feel alone in what they are living through.",
  "Individuals who recognize that vulnerable experiences can become rites of passage, and seek to turn difficulty into a fuller expression of who they are. As leaders, they see the same possibility in the collective: rupture can open a path to evolution.",
  "A heartbreak is not only a breakup. Some of the deepest ones happen inside a relationship that is still standing.",
  "I am also available to serve individuals navigating other life circumstances, as well as couples and groups.",
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
        description="Karima Kuri brings international policy, shamanic healing arts and transpersonal coaching together in service of conscious, heart-centered leadership."
        path="/karima"
        ogTitle="An initiation into a spiritually connected and heart-centered life"
        ogImage="https://findyourtoptalent.com/karime/introduction/karima-soft-portrait.png"
        ogImageAlt="Karima Kuri Tiscareño in ceremony"
      />
      <div className="karime-introduction" lang="en">
        <a className="ki-skip-link" href="#ki-main">Skip to introduction</a>
        <section className="ki-hero" aria-labelledby="ki-title">
          <header className="ki-header ki-container">
            <div className="ki-brand">
              <KarimeIntroductionBackground />
            <a href="#" className="ki-wordmark" aria-label="Karima Kuri, back to top">
              Karima Kuri<span>Ceremony · Healing Arts · Leadership</span>
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
              <span>It is an <em>initiation into a spiritually connected and heart-centered life</em></span>
            </h1>
            <p className="ki-hero-support">How we meet our own most difficult life moments shapes how we lead, love and hold the field for others.</p>
            <a className="ki-button" href="#ki-contact">
              Book a free chemistry call <ArrowDown size={17} aria-hidden="true" />
            </a>
          </div>

          <div className="ki-hero-bottom ki-container">
            <p>15+ years in international policy and systems change.<br /><span>Twenty-two years in healing arts and ceremony.</span></p>
            <a href="#ki-about" className="ki-scroll-link">
              <span>The introduction</span><ArrowDown size={18} aria-hidden="true" />
            </a>
          </div>
        </section>

        <main id="ki-main" tabIndex={-1}>
          <section id="ki-for-you" className="ki-for-you ki-section" aria-labelledby="ki-for-you-heading">
            <div className="ki-container ki-audience-layout">
              <div className="ki-section-heading">
                <p className="ki-eyebrow">01 / Who I serve</p>
                <h2 id="ki-for-you-heading">Who I{" "}<br /><em>work with</em></h2>
              </div>
              <figure className="ki-audience-portrait">
                <img src="/karime/introduction/karima-open-ceremony.jpg" alt="Karima seated with her arms raised, surrounded by flowers, candles and tropical greenery" width="2829" height="4241" loading="lazy" decoding="async" />
              </figure>
              <div className="ki-prose ki-audience-copy">
                {AUDIENCE.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
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
                <li><div className="ki-logo ki-logo-sofia"><span className="ki-sofia-art"><img src="/karime/introduction/logos/sofia.png" alt="Sofia University" loading="lazy" /><img className="ki-sofia-lettering" src="/karime/introduction/logos/sofia.png" alt="" aria-hidden="true" loading="lazy" /></span></div><small>Transformational Life Coach</small></li>
                <li><div className="ki-logo"><span className="ki-healing-mark"><b>22</b><span>Years in the healing arts</span></span></div><small>Across three continents and seven countries</small></li>
              </ul>
              <div className="ki-section-heading">
                <p className="ki-eyebrow">02 / Meet Karima</p>
                <h2 id="ki-about-heading">A curandera &amp; <em>a ceremonialist</em></h2>
                <p className="ki-heading-support">Also a former Global Leadership Fellow at the World Economic Forum and an Oxford alum</p>
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
                  {BIOGRAPHY.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </div>
              <div className="ki-conviction">
                <blockquote>“The way we lead ourselves through the pain and the confusion is the way we will lead others through the chaos and the uncertainty.”</blockquote>
                <p>My work is to assist people through life’s difficult passages: tending to the deeper layers of the hurt, shedding false identities that block connection to spirit, and making room for a more loving way of living and leading.</p>
              </div>
            </div>
          </section>

          <section id="ki-work" className="ki-work ki-section" aria-labelledby="ki-work-heading">
            <div className="ki-container">
              <div className="ki-section-heading">
                <p className="ki-eyebrow">03 / The components of this work</p>
                <h2 id="ki-work-heading">Shamanic <em>healing arts</em></h2>
              </div>
              <div className="ki-healing-components">
                <div><h3>Ceremony with ancient flowers</h3><p>Sacred cannabis, quantum rose and blue lotus. Through deep relaxation, presence and an open heart, these ceremonies invite connection with the Divine Mother within, remembrance of the womb–heart–crown connection, and a fuller claiming of the phase of womanhood each woman inhabits.</p></div>
                <div><h3>Ceremony with sacred mushrooms</h3><p>Rooted in the Indigenous traditions of Mexico, these ceremonies aim to create loving spaces for remembering our true nature, feeling interconnected with all that is, and opening to unity consciousness.</p></div>
                <div><h3>Microdosing protocols</h3><p>With the intention of supporting nervous system regulation, healing and spiritual stabilization.</p></div>
                <div><h3>Shamanic limpias</h3><p>Cleansing work assisted by the elemental energies of fire and water, tobacco, sacred smokes and herbal remedies.</p></div>
              </div>
              <div className="ki-coaching-component ki-editorial-grid">
                <h2>Transpersonal <em>coaching</em></h2>
                <p>Working with the mental, emotional, energetic, physical and spiritual bodies as a whole. These containers aim to purify, harmonize and reconnect a person with their true essence, supporting the metabolization of difficult life experiences and stabilization through the passage.</p>
              </div>
            </div>
          </section>

          <section id="ki-expectations" className="ki-expectations ki-section" aria-labelledby="ki-expectations-heading">
            <div className="ki-container">
              <div className="ki-section-heading">
                <p className="ki-eyebrow">04 / Ways of working together</p>
                <h2 id="ki-expectations-heading">Individuals, couples <em>and groups</em></h2>
              </div>
              <ul className="ki-container-types">
                <li>One-to-one containers</li>
                <li>Couple ceremonies</li>
                <li>Group ceremonies<span>Women only and mixed groups</span></li>
              </ul>
            </div>
          </section>

          <section id="ki-contact" className="ki-contact ki-section" aria-labelledby="ki-contact-heading">
            <div className="ki-container ki-contact-inner">
              <p className="ki-eyebrow">05 / An invitation</p>
              <p className="ki-manifesto-close">Every venom can be turned into medicine<br />Every rupture can become a spiritual initiation</p>
              <h2 id="ki-contact-heading">Book a free 30-min <em>chemistry call</em></h2>
              <a className="ki-button" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Arrange my free chemistry call <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
          </section>
        </main>

        <footer className="ki-footer">
          <div className="ki-container ki-footer-inner">
            <a href="#" className="ki-wordmark">Karima Kuri<span>Tiscareño</span></a>
            <p>Ceremony · Healing Arts · Leadership</p>
            <div className="ki-footer-links">
              <a href={TELEGRAM_HANDLE_URL} target="_blank" rel="noopener noreferrer">Telegram <ArrowUpRight size={14} aria-hidden="true" /></a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={14} aria-hidden="true" /></a>
            </div>
          </div>
        </footer>
      </div>
    </GameShellV2>
  );
};

export default KarimeIntroduction;

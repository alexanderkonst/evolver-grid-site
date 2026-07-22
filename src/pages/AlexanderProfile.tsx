import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { igniteLogo } from "@/lib/landingDesign";
import profilePhoto from "@/assets/profile-photo.png";

/**
 * /aleksandr — Aleksandr Konstantinov's own public platform profile.
 *
 * v2 (founder redesign): contemporary Korean/Japanese mythic minimalism.
 * Midnight indigo, atmospheric depth, monumental geometry (octahedron
 * inscribed in a circle — the brand's canonical artifact), restrained
 * antique gold, Shippori Mincho display type, and a solitary human-scale
 * presence inside something archetypal. Reads as one tall futuristic
 * profile card floating in fog.
 *
 * Self-contained cinematic dark page — does NOT follow skin CSS vars
 * (same pattern as Founder.tsx owning its own look). All styles scoped
 * to this component. Copy is verbatim from v1; only presentation changed.
 */

// ── Palette ──
const INK = "#e8e6df"; // primary off-white
const MUTE = "#8b93a7"; // secondary blue-grey
const GOLD = "#b99a5f"; // restrained antique gold
const GOLD_HAIRLINE = "rgba(185, 154, 95, 0.25)";
const GOLD_FAINT = "rgba(185, 154, 95, 0.15)";
const GOLD_ROW_RULE = "rgba(185, 154, 95, 0.12)";

const DISPLAY_FONT = "'Shippori Mincho', 'Cormorant Garamond', Georgia, serif";
const BODY_FONT = "'Source Serif 4', Georgia, serif";

const EYEBROW_STYLE: React.CSSProperties = {
  fontFamily: DISPLAY_FONT,
  fontSize: "11px",
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  color: GOLD,
  fontWeight: 500,
};

// ── Local gold ornament — hairline · emblem · hairline ──
const GoldOrnament = () => (
  <div
    className="flex items-center justify-center gap-4 max-w-[280px] mx-auto my-7 sm:my-9"
    aria-hidden="true"
  >
    <span
      className="flex-1 h-px"
      style={{ background: `linear-gradient(to right, transparent, ${GOLD_HAIRLINE})` }}
    />
    <img
      src={igniteLogo}
      alt=""
      aria-hidden="true"
      className="h-4 w-auto"
      style={{
        opacity: 0.55,
        filter: "drop-shadow(0 0 6px rgba(185, 154, 95, 0.35))",
        animation: "ornament-spin 48s linear infinite",
        transformOrigin: "center",
        willChange: "transform",
      }}
      draggable={false}
    />
    <span
      className="flex-1 h-px"
      style={{ background: `linear-gradient(to left, transparent, ${GOLD_HAIRLINE})` }}
    />
  </div>
);

// ── Monumental geometry — octahedron inscribed in a circle ──
// The brand's canonical artifact as thin gold line-art: a circle, the
// octahedron projection (square rotated 45°), and its vertical +
// horizontal diagonals through center. Archetypal architecture behind
// the name block.
const CanonicalArtifact = () => (
  <svg
    viewBox="0 0 520 520"
    aria-hidden="true"
    className="absolute left-1/2 -translate-x-1/2 pointer-events-none select-none"
    style={{
      // Centered on the name block: header text sits ~56px into the
      // header zone, so the circle's center (~288px from svg top at
      // rendered scale) lands on the name — the solitary human presence
      // at the heart of the archetypal form.
      top: "-230px",
      width: "min(575px, 120vw)",
      height: "auto",
      stroke: GOLD,
      opacity: 0.22,
    }}
  >
    <g fill="none" strokeWidth="1">
      <circle cx="260" cy="260" r="230" />
      <path d="M260 30 L490 260 L260 490 L30 260 Z" />
      <line x1="260" y1="30" x2="260" y2="490" />
      <line x1="30" y1="260" x2="490" y2="260" />
    </g>
  </svg>
);

// ── Seal mark — the same construction at hanko scale ──
// A quiet signature at the card's bottom-right. No text, no link.
const SealMark = () => (
  <svg
    viewBox="0 0 520 520"
    aria-hidden="true"
    style={{ width: "26px", height: "26px", stroke: GOLD, opacity: 0.45 }}
  >
    <g fill="none" strokeWidth="14">
      <circle cx="260" cy="260" r="230" />
      <path d="M260 30 L490 260 L260 490 L30 260 Z" />
      <line x1="260" y1="30" x2="260" y2="490" />
      <line x1="30" y1="260" x2="490" y2="260" />
    </g>
  </svg>
);

const sentences = [
  {
    eyebrow: "Zone of Genius",
    text: "I turn vague thoughts into exact words people can use to decide and act.",
  },
  {
    eyebrow: "Life's Direction",
    text: "Assist humanity evolve into a consciously coordinated civilization by awakening individual genius, integrating consciousness with technology, and architecting systems that transform human potential into coherent collective flourishing.",
  },
  {
    eyebrow: "What I Do",
    text: "I help conscious aspiring impact founders turn their top talent into an organically growing scalable business — in flow, in 6–8 weeks.",
  },
  {
    eyebrow: "Ideal Roles, in Plain English",
    text: "Clarity architect for founders, venture studios, and accelerators: I name what you actually do, build the offer and the page, and design the method your team can run without you.",
  },
];

const resources = [
  "Top Talent extraction: a proven method that takes a person from a vague sense of gift to one exact sentence.",
  "The Unique Business Playbook: an 18-artifact canvas that compiles a talent into a venture.",
  "A working platform: FindYourTopTalent.com, AI-powered profiles and matching.",
  "AI-native building speed: full products designed, built, and shipped solo in days.",
  "A published corpus: a Universal Ontology and a 112-domain Phase Shift Technology Library.",
  "The 27-perspective seeing instrument: complete analysis of any system, every angle at every depth.",
  "The Holomap: an instrument for reading where any living system develops next.",
  "Exact-words craft applied to offers, landing pages, and pitches that convert.",
  "A founder collective and a cross-community network spanning research, crypto, and impact ecosystems.",
  "Sales as love: full-price sessions sold to strangers through my own funnel, practiced end to end.",
];

const collaborations = [
  "Top Talent Business Session: 1:1, your talent turned into a sellable offer.",
  "White-label platform node for your community, with revenue share.",
  "Community precision-matchmaking pilots.",
  "Advisory for founders building AI-native ventures.",
  "Joint products on revenue-share agreements.",
];

const ecosystems = ["MIT", "Bell Labs", "Network School", "UN", "Autodidact"];

export default function AlexanderProfile() {
  const navigate = useNavigate();
  const [ctaHover, setCtaHover] = useState(false);

  return (
    <div
      className="relative"
      style={{
        // Solid base color + full-height gradient on the outermost wrapper.
        // The wrapper grows with content, so the indigo covers the whole
        // document at any content length (the earlier version broke past
        // the first viewport). backgroundColor is the hard floor — no
        // light app body can ever show through.
        minHeight: "100vh",
        backgroundColor: "#080d1a",
        backgroundImage: "linear-gradient(175deg, #080d1a 0%, #0d1526 55%, #080d1a 100%)",
        color: INK,
        fontFamily: BODY_FONT,
      }}
    >
      <Helmet>
        <title>Aleksandr Konstantinov — Find Your Top Talent</title>
        <meta
          name="description"
          content="I turn vague thoughts into exact words people can use to decide and act. This is my own platform profile, public."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* Atmospheric depth — indigo mist, fog over mountains at dusk.
          FIXED to the viewport (not absolute to the document) so the mist
          washes the screen at every scroll position. */}
      <div
        aria-hidden="true"
        className="pointer-events-none"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: [
            "radial-gradient(ellipse 90% 45% at 50% -5%, rgba(46, 62, 102, 0.22), transparent 70%)",
            "radial-gradient(ellipse 70% 35% at 30% 68%, rgba(38, 52, 88, 0.16), transparent 70%)",
            "radial-gradient(ellipse 60% 30% at 78% 42%, rgba(42, 56, 94, 0.13), transparent 70%)",
          ].join(", "),
        }}
      />
      {/* Vignette — also viewport-fixed */}
      <div
        aria-hidden="true"
        className="pointer-events-none"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(4, 7, 14, 0.55) 100%)",
        }}
      />

      <div
        className="relative max-w-[620px] mx-auto px-5 sm:px-8 pt-32 sm:pt-40 pb-[120px] overflow-x-clip"
        style={{ zIndex: 1 }}
      >
        {/* Header — a solitary presence inside the archetype */}
        <header className="relative text-center mb-4">
          <CanonicalArtifact />
          <img
            src={profilePhoto}
            alt="Aleksandr Konstantinov"
            className="relative mx-auto mb-7 h-28 w-28 sm:h-32 sm:w-32 rounded-full object-cover"
            style={{
              border: `1px solid ${GOLD_HAIRLINE}`,
              boxShadow: "0 0 0 6px rgba(8, 13, 26, 0.76), 0 0 40px rgba(185, 154, 95, 0.18)",
            }}
          />
          <h1
            className="relative text-[2rem] sm:text-[2.6rem] leading-tight"
            style={{ fontFamily: DISPLAY_FONT, letterSpacing: "0.08em", fontWeight: 400 }}
          >
            Aleksandr Konstantinov
          </h1>
          <p
            className="relative mt-3 text-sm sm:text-base"
            style={{ fontFamily: DISPLAY_FONT, color: MUTE, letterSpacing: "0.12em" }}
          >
            Founder of Find Your Top Talent
          </p>
          <p className="relative mt-4 text-[13px] italic" style={{ color: MUTE }}>
            This page is my own platform profile, public.
          </p>
        </header>

        {/* Profile card panel — floating in fog */}
        <div
          className="mt-12 sm:mt-16 rounded-2xl px-5 sm:px-10 py-8 sm:py-9"
          style={{
            border: `1px solid ${GOLD_FAINT}`,
            background: "rgba(6, 10, 20, 0.45)",
            backdropFilter: "blur(2px)",
          }}
        >
          {/* Four one-sentence sections: eyebrow + sentence */}
          {sentences.map((s, i) => (
            <section key={s.eyebrow} className="text-center">
              {i > 0 && <GoldOrnament />}
              <p style={EYEBROW_STYLE} className="mb-3">
                {s.eyebrow}
              </p>
              <p
                className="text-[19px] sm:text-[21px] leading-relaxed"
                style={{ fontFamily: DISPLAY_FONT, color: INK, fontWeight: 400 }}
              >
                {s.text}
              </p>
            </section>
          ))}

          <GoldOrnament />

          {/* Top 10 Resources — compact hairline rows, gold numerals */}
          <section>
            <p style={EYEBROW_STYLE} className="mb-4 text-center">
              Top 10 Resources I Bring
            </p>
            <ol>
              {resources.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-4 items-baseline py-2.5 text-[13.5px] leading-snug"
                  style={{
                    color: MUTE,
                    borderTop: i === 0 ? "none" : `1px solid ${GOLD_ROW_RULE}`,
                  }}
                >
                  <span
                    className="flex-none w-5 text-right text-[13px]"
                    style={{ fontFamily: DISPLAY_FONT, color: "#cdad6d", fontWeight: 600 }}
                  >
                    {i + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </section>

          <GoldOrnament />

          {/* Ideal Complementary Partner */}
          <section className="text-center">
            <p style={EYEBROW_STYLE} className="mb-3">
              Ideal Complementary Partner
            </p>
            <p
              className="text-[17px] sm:text-[19px] leading-relaxed"
              style={{ fontFamily: DISPLAY_FONT, color: INK }}
            >
              A grounded closer-operator who loves finishing — running sales calls, setting
              prices, sending proposals, installing the weekly cadence that turns plans into
              revenue.
            </p>
          </section>

          <GoldOrnament />

          {/* Collaborations Offered — hairline rows, no bullets */}
          <section>
            <p style={EYEBROW_STYLE} className="mb-4 text-center">
              Collaborations Offered
            </p>
            <ul>
              {collaborations.map((item, i) => (
                <li
                  key={i}
                  className="py-2.5 text-[13.5px] leading-snug"
                  style={{
                    color: MUTE,
                    borderTop: i === 0 ? "none" : `1px solid ${GOLD_ROW_RULE}`,
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-center text-[13px]">
              <a
                href="/products"
                className="transition-opacity hover:opacity-75"
                style={{
                  color: GOLD,
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                  textDecorationColor: GOLD_HAIRLINE,
                }}
              >
                Products → findyourtoptalent.com/products
              </a>
            </p>
          </section>

          <GoldOrnament />

          {/* Ecosystem Experience — ghost pills, seal at bottom-right */}
          <section className="text-center">
            <p style={EYEBROW_STYLE} className="mb-3">
              Ecosystem Experience
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {ecosystems.map((name) => (
                <span
                  key={name}
                  className="rounded-full px-4 py-1.5"
                  style={{
                    border: `1px solid ${GOLD_HAIRLINE}`,
                    color: MUTE,
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    background: "transparent",
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
            <div className="flex justify-end mt-4 -mb-2 sm:-mr-4">
              <SealMark />
            </div>
          </section>

          <GoldOrnament />

          {/* CTA — the only call to action on the page, closing the card */}
          <section className="text-center">
            <h2
              className="text-[22px] sm:text-[26px] leading-snug"
              style={{ fontFamily: DISPLAY_FONT, color: INK, letterSpacing: "0.04em", fontWeight: 400 }}
            >
              Create your professional profile in minutes.
            </h2>
            <p className="mt-2.5 text-sm" style={{ color: MUTE }}>
              Get matched to high-fit professionals.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                onMouseEnter={() => setCtaHover(true)}
                onMouseLeave={() => setCtaHover(false)}
                className="rounded-full px-8 py-3.5 transition-all duration-300"
                style={{
                  fontFamily: DISPLAY_FONT,
                  border: `1px solid ${GOLD}`,
                  color: GOLD,
                  background: ctaHover ? "rgba(185, 154, 95, 0.08)" : "transparent",
                  fontSize: "12px",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                Create your profile
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

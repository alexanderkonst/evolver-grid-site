import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { GOLD_TEXT_STYLE, META_EYEBROW_STYLE, Ornament } from "@/lib/landingDesign";
import { EditorialCta } from "@/components/ui/editorial-cta";

const DISPLAY_FONT = "'Cormorant Garamond', Georgia, serif";
const BODY_FONT = "'Source Serif 4', Georgia, serif";

/**
 * /alexander — Alexander Konstantinov's own public platform profile.
 *
 * "The platform's profile, in public." Resume-shaped, but a profile:
 * the same editorial register as the rest of Find Your Top Talent
 * (Cormorant Garamond display, Source Serif 4 body, gold accents via
 * landingDesign tokens, skin-aware color throughout). One CTA only,
 * at the close: create your own profile.
 */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p
    style={{
      ...META_EYEBROW_STYLE,
      color: "var(--skin-text-muted, rgba(44,49,80,0.55))",
    }}
    className="mb-3 text-center sm:text-left"
  >
    {children}
  </p>
);

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

  return (
    <div
      className="min-h-dvh"
      style={{
        background:
          "var(--skin-page-wash, radial-gradient(circle at top,#f8f4ff,transparent 45%),radial-gradient(circle at bottom,#fff6ea,transparent 50%))",
        color: "var(--skin-text-primary, #2c3150)",
        fontFamily: BODY_FONT,
      }}
    >
      <Helmet>
        <title>Alexander Konstantinov — Find Your Top Talent</title>
        <meta
          name="description"
          content="I turn vague thoughts into exact words people can use to decide and act. This is my own platform profile, public."
        />
      </Helmet>

      <div className="max-w-[760px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
        {/* Header */}
        <header className="text-center mb-14 sm:mb-20">
          <h1
            className="text-4xl sm:text-5xl font-semibold"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Alexander Konstantinov
          </h1>
          <p
            className="mt-3 text-lg sm:text-xl"
            style={{ fontFamily: DISPLAY_FONT, color: "var(--skin-text-primary, #2c3150)" }}
          >
            Founder of Find Your Top Talent
          </p>
          <p
            className="mt-4 text-sm italic"
            style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.6))" }}
          >
            This page is my own platform profile, public.
          </p>
        </header>

        <Ornament className="mb-14 sm:mb-20" />

        {/* Zone of Genius */}
        <section className="mb-14 sm:mb-20 text-center">
          <SectionLabel>Zone of Genius</SectionLabel>
          <p
            className="text-2xl sm:text-3xl leading-snug bg-clip-text text-transparent"
            style={{ fontFamily: DISPLAY_FONT, ...GOLD_TEXT_STYLE }}
          >
            I turn vague thoughts into exact words people can use to decide and act.
          </p>
        </section>

        <Ornament className="mb-14 sm:mb-20" />

        {/* Life's Direction */}
        <section className="mb-14 sm:mb-20">
          <SectionLabel>Life's Direction</SectionLabel>
          <p
            className="text-lg sm:text-xl leading-relaxed"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            "Assist humanity evolve into a consciously coordinated civilization by awakening
            individual genius, integrating consciousness with technology, and architecting
            systems that transform human potential into coherent collective flourishing."
          </p>
        </section>

        {/* What I Do */}
        <section className="mb-14 sm:mb-20">
          <SectionLabel>What I Do</SectionLabel>
          <p className="text-base sm:text-lg leading-relaxed">
            "I help conscious aspiring impact founders turn their top talent into an
            organically growing scalable business — in flow, in 6–8 weeks."
          </p>
        </section>

        {/* Ideal Roles */}
        <section className="mb-14 sm:mb-20">
          <SectionLabel>Ideal Roles, in Plain English</SectionLabel>
          <p className="text-base sm:text-lg leading-relaxed">
            "Clarity architect for founders, venture studios, and accelerators: I name what
            you actually do, build the offer and the page, and design the method your team
            can run without you."
          </p>
        </section>

        <Ornament className="mb-14 sm:mb-20" />

        {/* Top 10 Resources */}
        <section className="mb-14 sm:mb-20">
          <SectionLabel>Top 10 Resources I Bring</SectionLabel>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mt-4">
            {resources.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm sm:text-base leading-relaxed">
                <span
                  className="flex-none font-semibold"
                  style={{ fontFamily: DISPLAY_FONT, color: "var(--skin-text-primary, #2c3150)" }}
                >
                  {i + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <Ornament className="mb-14 sm:mb-20" />

        {/* Ideal Complementary Partner */}
        <section className="mb-14 sm:mb-20">
          <SectionLabel>Ideal Complementary Partner</SectionLabel>
          <p className="text-base sm:text-lg leading-relaxed">
            "A grounded closer-operator who loves finishing — running sales calls, setting
            prices, sending proposals, installing the weekly cadence that turns plans into
            revenue."
          </p>
        </section>

        {/* Collaborations Offered */}
        <section className="mb-14 sm:mb-20">
          <SectionLabel>Collaborations Offered</SectionLabel>
          <ul className="space-y-3 mt-4">
            {collaborations.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm sm:text-base leading-relaxed">
                <span aria-hidden="true" style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.5))" }}>
                  &middot;
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm">
            <a
              href="/products"
              className="underline underline-offset-4 decoration-[var(--skin-hairline,rgba(44,49,80,0.3))] hover:opacity-80 transition-opacity"
              style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.7))" }}
            >
              Products → findyourtoptalent.com/products
            </a>
          </p>
        </section>

        <Ornament className="mb-14 sm:mb-20" />

        {/* Ecosystem Experience */}
        <section className="mb-16 sm:mb-24 text-center">
          <SectionLabel>
            <span className="block text-center">Ecosystem Experience</span>
          </SectionLabel>
          <div className="flex flex-wrap justify-center gap-2.5 mt-4">
            {ecosystems.map((name) => (
              <span
                key={name}
                className="rounded-full px-4 py-1.5 text-xs sm:text-sm border"
                style={{
                  borderColor: "var(--skin-hairline, rgba(164,163,208,0.3))",
                  color: "var(--skin-text-primary, #2c3150)",
                  background: "var(--skin-card-bg, rgba(255,255,255,0.5))",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </section>

        {/* CTA — the only call to action on the page */}
        <section className="text-center">
          <h2
            className="text-2xl sm:text-3xl font-semibold"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Create your professional profile in minutes.
          </h2>
          <p
            className="mt-3 text-sm sm:text-base"
            style={{ color: "var(--skin-text-muted, rgba(44,49,80,0.65))" }}
          >
            Get matched to high-fit professionals.
          </p>
          <div className="mt-8 flex justify-center">
            <EditorialCta label="Create your profile" onClick={() => navigate("/")} />
          </div>
        </section>
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { EditorialCta } from "@/components/ui/editorial-cta";
import { Ornament } from "@/lib/landingDesign";
import SEO from "@/components/SEO";
import GameShellV2 from "@/components/game/GameShellV2";
import KarimeHlsBackground from "@/components/landing/KarimeHlsBackground";
import { useSkin } from "@/contexts/SkinContext";

/**
 * KarimeIntroduction — `/meet-karime`.
 *
 * Day 188 (Sasha + Karime, 2026-09-29): the client-facing one-pager, built
 * first for the Marianne Williamson warm introduction and reusable for any
 * high-trust referral. Visually a copy of `KarimeOffer` (same Karime skin,
 * Mux HLS bg, glassmorphic container, Cormorant editorial register) with a
 * longer editorial body instead of the short hero.
 *
 * Why it exists separately from /build/karime: that page is the cold funnel
 * front door (pain-mirror → WhatsApp relay). This one is a warm, referral-
 * backed introduction that has to survive being read by someone at Marianne
 * Williamson's altitude. Different job, different register, same skin.
 *
 * COPY SOURCE OF TRUTH: `docs/02-strategy/unique-businesses/karimes_unique_business.md`
 * → Unique Business Canvas v1.3 + "The Marianne Williamson one-pager".
 *
 * The strategic inversion (canvas §0 / one-pager §5): every healer who
 * approaches someone like Williamson leads with the spirituality. Karime
 * leads with the policy career she walked away from, and lets the ceremony
 * be the surprise. Karime's own instruction, Sep 29: "I'm not doing this
 * work as a hippie medicine woman. I care about the leadership and this
 * planet. Because she cares about that too."
 *
 * Three corrections from the Sep 29 review, carried here:
 *   1. The self-trade / self-abandonment mechanism is CUT from the front
 *      door. Karime: "that's what we uncover in the process of her
 *      initiation. That's not what they come to me for." It stays an
 *      internal diagnostic (canvas §1.1), never client-facing copy.
 *   2. "Grief" is deliberately never used. Karime ruled it out: naming it
 *      draws people with dying family members into a container built for a
 *      different passage.
 *   3. The promise is stated as what the passage initiates (spiritual
 *      advancement · the next phase of womanhood and leadership), per the
 *      one sentence both she and Sasha signed off on.
 *
 * A SCAFFOLD, NOT A FINISHED LETTER. Karime rewrites this in her own voice
 * before it is sent. Her call, Sep 29: "Marianne Williamson will not read my
 * one pager through words. She will read it through transmission." And her
 * worry about the first draft: too many layers overlaid, at risk of sending a
 * confusing signal. So this version holds five beats instead of seven and
 * names one thread at a time. If it grows again, that is the bug.
 *
 * ENGLISH ONLY, by design. This is a personal letter to named individuals,
 * not a funnel surface, so it is not wired into i18n. If it ever becomes a
 * public acquisition page, move the copy into locales first.
 *
 * Personalization: `?from=Name` renders the referrer line at the top. Warm-
 * intro physics — the referrer's name does the trust work, so it goes in
 * the first line rather than the sign-off. Without the param the page reads
 * as a clean general introduction.
 */

const WHATSAPP_URL =
  "https://wa.me/14157073432?text=Hi%20Sasha%2C%20I%20read%20Karime%27s%20introduction%20and%20would%20like%20to%20connect.";
const TELEGRAM_HANDLE_URL = "https://t.me/integralevolution";

// Matches KarimeOffer's emphasis treatment: solid deep coffee-bronze with a
// cream halo, legible against both the bright and dark passages of the bg
// video. One emphasis word per viewport is the house rule.
const EMPHASIS_STYLE = {
  color: "#4a2806",
  fontWeight: 800,
  textShadow:
    "0 0 2px rgba(255, 230, 200, 0.6), 0 1px 0 rgba(91, 42, 11, 0.35)",
};

const INK = "var(--skin-text-primary, #0a1628)";
const HALO_DEEP =
  "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))";
const HALO_BODY =
  "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))";

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
      "Accomplished women in the middle of a heartbreak or an illness. Women who carry a great deal, who have done the therapy and read the books, and who are now inside something they cannot manage their way out of.",
      "A heartbreak is not only a breakup. Some of the deepest ones happen inside a relationship that is still standing.",
      "She is the one everyone else leans on, so there is nowhere for her to fall apart. They keep telling her how strong she is, and every time it is said she feels more alone. And she notices this has come around before.",
    ],
  },
  {
    heading: "Why there is usually nowhere to go.",
    paragraphs: [
      "If she looks for someone intellectually serious, she gets a doctor and a protocol.",
      "If she looks for someone spiritually serious, she usually gets someone who cannot meet her mind, her work, or the real weight of what she carries. She leaves the room realigned, and then she is on her own with her actual life.",
      "So she does what she has always done. She holds it together for everyone else and postpones herself one more time.",
    ],
  },
  {
    heading: "What happens instead.",
    paragraphs: [
      "I walk her through the passage rather than around it. Ceremony and ritual where the work calls for it, which is what the twenty-two years are for. And then the ordinary part that most of this world skips: one boundary, one conversation, one honest sentence she can actually say on a Tuesday.",
      "She stops only surviving it. She sleeps again, and she can say what she needs without apologizing for it.",
      "And she comes out further along than she went in. Her spirituality opens where it had been shut, and she steps into the next phase of her womanhood and her leadership. The pattern stops repeating, because what it kept asking for has finally been given.",
      "I am in one of these passages myself as I write this, and I am meeting it the way I ask my clients to.",
    ],
  },
];

const KarimeIntroduction = () => {
  const { pushTemporarySkin } = useSkin();
  const [searchParams] = useSearchParams();

  // `?from=Constanza` → "Constanza suggested I send you this." Trimmed and
  // length-capped so a junk param cannot blow out the layout.
  const referrer = (searchParams.get("from") || "").trim().slice(0, 40);

  useEffect(() => {
    const cleanup = pushTemporarySkin("karime");
    return cleanup;
  }, [pushTemporarySkin]);

  const handleContact = () => {
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
  };

  return (
    // hideNavigation: no rail, no sections panel. /build/karime is a platform
    // surface that happens to be branded; this page is a letter, and platform
    // furniture around it undercuts the register it depends on.
    <GameShellV2 hideNavigation hideLogo defaultRailMinimized>
      <SEO
        title="Karime Kuri · An introduction"
        description="A decade in international policy. Twenty-two years in ceremony. I work with accomplished women in the middle of a heartbreak or an illness so that instead of only surviving it they become initiated into spiritual advancement and the next phase of womanhood and leadership."
        path="/meet-karime"
        ogTitle="It is not a problem. It is an initiation."
      />
      <KarimeHlsBackground />

      <div className="relative z-10 max-w-[760px] mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        <div
          // Scrim is deliberately heavier than KarimeOffer's 0.06 wash.
          // That page is a short hero that only ever sits over one region of
          // the video. This one is a long read that scrolls across the bright
          // curtain and sky passages, where 0.06 leaves body copy illegible.
          // Legibility wins on a page whose whole job is being read to the end.
          className="rounded-3xl backdrop-blur-[16px] px-5 py-8 sm:px-7 sm:py-10 md:px-9 md:py-12"
          style={{
            background: "rgba(250, 246, 240, 0.62)",
            border: "1px solid rgba(255, 250, 244, 0.38)",
            boxShadow:
              "0 18px 56px -10px rgba(30, 26, 22, 0.42), inset 0 1px 0 rgba(255, 252, 248, 0.5)",
          }}
        >
          <header className="text-center">
            <p
              className="mb-4 sm:mb-5"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: INK,
                textShadow: HALO_DEEP,
              }}
            >
              {referrer
                ? `An introduction, by way of ${referrer}`
                : "An introduction to my work"}
            </p>

            <p
              className="text-lg sm:text-xl md:text-2xl leading-[1.32] italic mb-4 sm:mb-5"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                letterSpacing: "0.01em",
                color: INK,
                textShadow: HALO_DEEP,
              }}
            >
              A heartbreak or an illness arrives, and everyone around you
              treats it as a problem to be solved.
            </p>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.018em] mb-4 sm:mb-5"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: INK,
                textShadow: HALO_BODY,
                fontVariantNumeric: "lining-nums",
                fontFeatureSettings: '"lnum" 1, "onum" 0',
              }}
            >
              It is not a problem. It is an{" "}
              <span style={EMPHASIS_STYLE}>initiation</span>.
            </h1>

            <Ornament className="my-5 sm:my-6" />
          </header>

          {/* Body — editorial prose. Section headings are small-caps Cormorant
              so they read as beats in a letter rather than as product
              sub-headers. A section with an empty heading is a continuation
              of the one above it. */}
          <div
            className="text-left"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: INK,
              textShadow: HALO_BODY,
            }}
          >
            {referrer && (
              <p className="text-lg sm:text-xl leading-[1.5] mb-7 sm:mb-8 italic font-semibold">
                {referrer} told me she had spoken with you about my work, and
                that you were curious. So, briefly.
              </p>
            )}

            {SECTIONS.map((section, i) => (
              <section key={i} className={i === 0 ? "" : "mt-7 sm:mt-8"}>
                {section.heading && (
                  <h2
                    className="mb-3 sm:mb-3.5"
                    style={{
                      fontWeight: 700,
                      fontSize: "12px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: INK,
                      opacity: 0.78,
                    }}
                  >
                    {section.heading}
                  </h2>
                )}
                <div className="space-y-3.5 sm:space-y-4">
                  {section.paragraphs.map((p, j) => (
                    <p
                      key={j}
                      className="text-base sm:text-lg md:text-xl leading-[1.55]"
                      style={{ fontWeight: 500 }}
                    >
                      {p}
                    </p>
                  ))}
                </div>

                {/* "Then I left." is the hinge of the whole page: it sits
                    alone between the résumé and the reveal, and it is what
                    makes the reader want the reason. */}
                {i === 0 && (
                  <p
                    className="text-2xl sm:text-3xl md:text-[2rem] leading-[1.2] mt-6 sm:mt-7 mb-1 text-center italic"
                    style={{
                      fontWeight: 700,
                      color: "#3d1f04",
                      textShadow: "0 1px 0 rgba(255, 252, 246, 0.85)",
                    }}
                  >
                    Then I left.
                  </p>
                )}
              </section>
            ))}
          </div>

          <Ornament className="my-7 sm:my-8" />

          {/* Close + CTA cluster. The ask is the smallest possible one: a
              conversation, with an easy out. No prices, no products, no
              ladder — this page exists to earn a first conversation, and
              anything transactional reframes it as a solicitation. */}
          <div className="flex flex-col items-center gap-4 px-2 text-center">
            <p
              className="text-lg sm:text-xl md:text-[1.35rem] leading-[1.45] max-w-[560px]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                color: INK,
                textShadow: HALO_BODY,
              }}
            >
              If any of this interests you, I would welcome a conversation.
            </p>

            <EditorialCta label="Speak with Karime" onClick={handleContact} />

            <div
              className="inline-flex items-center justify-center gap-2 max-w-[520px] mt-1"
              style={{
                color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                textShadow:
                  "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                fontSize: "0.68rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              <span>
                A first conversation, at no cost · Online worldwide · In person
                by arrangement
              </span>
            </div>

            {/* Credential line, held to the end and kept factual. It is proof,
                not positioning — the positioning already happened in the
                opening beat. */}
            <div
              className="max-w-[560px] mt-2"
              style={{
                color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))",
                textShadow:
                  "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                fontSize: "0.64rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 500,
                lineHeight: 1.7,
              }}
            >
              Karime Kuri Tiscareño · MA Public Policy, University of Oxford ·
              Global Leadership Fellow, World Economic Forum · Transformational
              Life Coach, Sofia University · Twenty-two years of ceremony across
              seven countries
            </div>

            <div
              className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 max-w-[520px] mt-1"
              style={{
                color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))",
                textShadow:
                  "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                fontSize: "0.64rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              <a
                href={TELEGRAM_HANDLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                Telegram
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://wa.me/14157073432"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </GameShellV2>
  );
};

export default KarimeIntroduction;

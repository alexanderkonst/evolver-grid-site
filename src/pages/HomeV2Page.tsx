import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { EditorialCta } from "@/components/ui/editorial-cta";
import SEO from "@/components/SEO";

/**
 * HomeV2Page — `/home`, the approved "Name what's next" truth landing
 * (Sasha 2026-07-29, copy verbatim per his mega-prompt).
 *
 * Context: the prior `/home` occupant (the Ceiling Law draft) moved to
 * `/home2` unchanged — see HomeLandingPage.tsx. This page is the new
 * copy Sasha approved word-for-word: hero ("Name what's next"), the
 * "here is what this actually is" mechanism section (pattern → free
 * diagnosis → paid build), a short qualifying "who this is for"
 * section, and a close that restates the Ceiling Law as a signature
 * line. Kept noindex for now, same review-only treatment as its
 * sibling until Sasha decides to promote it live.
 *
 * Copy lives under the `homeTruth` i18n namespace (src/locales/
 * {en,ru,es}/common.json). Design tokens (Cormorant headings, gold
 * gradient close line, Ornament divider, EditorialCta) are the same
 * ones MethodologyLandingPage / HomeLandingPage use — no new visual
 * language introduced here.
 */
const HomeV2Page = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goToQuiz = () => navigate("/quiz");

  // The two price sentences in mechanism.para3 read as one dense paragraph.
  // Split on the natural sentence boundary (". ") so each gets its own line
  // with breathing room — spacing only, the copy itself is untouched.
  const para3 = t("homeTruth.mechanism.para3");
  const priceSentences = para3
    .split(/(?<=\.)\s+/)
    .map((s: string) => s.trim())
    .filter(Boolean);

  return (
    <>
      <SEO
        title={t("homeTruth.seoTitle")}
        description={t("homeTruth.seoDescription")}
        path="/home"
        ogTitle={t("homeTruth.seoTitle")}
        noIndex
      />
      <div className="max-w-[660px] mx-auto px-5 pt-6 pb-28 sm:pt-7 sm:pb-24 md:pt-8">
        {/* Round-2 polish (2026-07-29): pb-28/pb-24 clears the fixed
            bottom-right Chat bubble (ChatLauncher) at every width down to
            375px — matches the approach already used on /quiz (suppressing
            the launcher there), but here we keep the bubble and just give
            the page room instead. */}
        {/* ═══════ HERO ═══════ */}
        <header className="text-center">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.2] tracking-[-0.018em] mb-3 sm:mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
          >
            {t("homeTruth.hero.headline")}
          </h1>

          <p
            className="text-base sm:text-lg leading-[1.4] max-w-[560px] mx-auto"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
            }}
          >
            {t("homeTruth.hero.body")}
          </p>

          <Ornament className="my-5 sm:my-6" />

          <div className="flex flex-col items-center gap-3">
            <EditorialCta
              label={t("homeTruth.hero.ctaLabel")}
              onClick={goToQuiz}
            />
            <p
              className="max-w-[420px]"
              style={{
                color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                textShadow:
                  "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                fontSize: "0.72rem",
                letterSpacing: "0.04em",
                fontWeight: 500,
              }}
            >
              {t("homeTruth.hero.ctaMicro")}
            </p>
          </div>
        </header>

        {/* Round-2 polish (2026-07-29): the opening viewport had two star
            dividers back to back (this one + the one under the hero sub
            above) — kept the hero one, dropped this one to a plain quiet
            hairline so the star reads as a single accent, not a repeated
            motif. */}
        <div
          className="my-10 sm:my-12 mx-auto max-w-md h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--skin-ornament-rule, rgba(26,30,58,0.16)), transparent)",
          }}
          aria-hidden="true"
        />

        {/* ═══════ WHAT THIS ACTUALLY IS ═══════ */}
        <section className="text-center max-w-[640px] mx-auto">
          <p
            className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] mb-5 bg-clip-text text-transparent"
            style={GOLD_TEXT_STYLE}
          >
            {t("homeTruth.mechanism.heading")}
          </p>

          <div className="space-y-4 text-left">
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{
                fontFamily: "'Source Serif 4', serif",
                color: "var(--skin-text-secondary, #33415c)",
              }}
            >
              {t("homeTruth.mechanism.para1")}
            </p>
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{
                fontFamily: "'Source Serif 4', serif",
                color: "var(--skin-text-secondary, #33415c)",
              }}
            >
              {t("homeTruth.mechanism.para2")}
            </p>
            {/* The two price sentences get their own lines with breathing
                room (spacing only — copy is split at its natural sentence
                boundary, not edited). */}
            {priceSentences.map((sentence, i) => (
              <p
                key={i}
                className="text-sm sm:text-base leading-relaxed"
                style={{
                  fontFamily: "'Source Serif 4', serif",
                  color: "var(--skin-text-secondary, #33415c)",
                  marginTop: i === 0 ? undefined : "1.1em",
                }}
              >
                {sentence}
              </p>
            ))}
          </div>
        </section>

        <Ornament className="my-10 sm:my-12" />

        {/* ═══════ WHO THIS IS FOR ═══════ */}
        <section className="text-center max-w-[640px] mx-auto">
          <p
            className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] mb-5 bg-clip-text text-transparent"
            style={GOLD_TEXT_STYLE}
          >
            {t("homeTruth.whoFor.eyebrow")}
          </p>

          <div className="space-y-4 text-left">
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{
                fontFamily: "'Source Serif 4', serif",
                color: "var(--skin-text-secondary, #33415c)",
              }}
            >
              {t("homeTruth.whoFor.para1")}
            </p>
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{
                fontFamily: "'Source Serif 4', serif",
                color: "var(--skin-text-secondary, #33415c)",
              }}
            >
              {t("homeTruth.whoFor.para2")}
            </p>
          </div>
        </section>

        {/* ═══════ CLOSE — centered like a colophon ═══════ */}
        <section className="mt-12 sm:mt-14 text-center max-w-[640px] mx-auto">
          <Ornament className="mb-6" />
          <p
            className="text-lg sm:text-xl leading-[1.4] mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              color: "var(--skin-text-primary, #0a1628)",
            }}
          >
            {t("homeTruth.close.line1")}
          </p>
          <p
            className="text-sm sm:text-base mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              color: "var(--skin-text-secondary, #33415c)",
            }}
          >
            <span
              className="not-italic font-semibold bg-clip-text text-transparent"
              style={GOLD_TEXT_STYLE}
            >
              {t("homeTruth.close.line2")}
            </span>
          </p>

          <div className="flex flex-col items-center gap-3 pb-4">
            <EditorialCta
              label={t("homeTruth.close.ctaLabel")}
              onClick={goToQuiz}
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default HomeV2Page;

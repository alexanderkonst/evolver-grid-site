import { useEffect, useState } from "react";
import { EditorialCta } from "@/components/ui/editorial-cta";
import { Ornament } from "@/lib/landingDesign";
import SEO from "@/components/SEO";
import GameShellV2 from "@/components/game/GameShellV2";
import KarimeHlsBackground from "@/components/landing/KarimeHlsBackground";
import { useSkin } from "@/contexts/SkinContext";

/**
 * KarimeIntake — preparatory page Sasha sends manually on WhatsApp after
 * the initial inbound from /build/karime. Not in BUILD sidebar; reachable
 * only by URL.
 *
 * Day 81 (Sasha 2026-05-23) — major restructure per Sasha's revision pass:
 *   - "How Karime works" section removed (the modality list was treading
 *     on what the live call should hold).
 *   - Quiz collapsed from 4 questions to 1 single multi-choice — the
 *     other questions belong to the actual conversation, not the form.
 *   - Booking CTA + contact info now PROGRESSIVELY REVEALED only after
 *     the visitor picks one of the 5 support options. The selection IS
 *     the qualifying act; before it, the page is read-and-orient, not
 *     book-and-go. After it, the path opens.
 *   - About Karime rewritten as a cohesive single paragraph (was a
 *     bullet list with a long closing sentence); credentials still
 *     all present, ordered from prestige → walked away → trained for
 *     this work → brings both.
 *   - Steps 1-3 visually upgraded with numbered gold-pip badges and a
 *     vertical gold connector line — same Cormorant register, more
 *     visual rhythm than flat labeled paragraphs.
 *   - "Cal.com" string removed from footer microcopy (visitor doesn't
 *     need to know the booking infra).
 *   - Hero subtitle paragraph + "A short reflection before we meet"
 *     framing both removed — page opens directly with About Karime.
 *
 * (a) Verbal-only modality language carried forward — no controlled
 * substances named anywhere on the page. The 5 quiz options are framed
 * as MOODS of support, not lists of practices.
 */

const CALCOM_BOOKING_URL = "https://cal.com/karimekuri/20min";
const KARIME_WHATSAPP_URL = "https://wa.me/14157073432";
const KARIME_TELEGRAM_URL = "https://t.me/integralevolution";

// Day 83 (Sasha 2026-05-25): warm copper-rose emphasis gradient,
// mirrored from KarimeOffer.tsx. Anchors the eye on a small handful of
// "task" words per page — the verbs and nouns that carry the line's
// meaning. Same pattern as the platform's landing pages (where
// GOLD_TEXT_STYLE highlights e.g. "CLEARLY", "ALWAYS", "co-creators",
// "Productize", "Top Talent"). For Karime we use the warm copper
// version so the highlights harmonize with the brass altar tones in
// the video bg instead of clashing with cool antique gold.
// Day 83 v4 (Sasha 2026-05-25): solid dark espresso-bronze with
// text-shadow halo — same simplification as KarimeOffer (gradient
// was washing pale; solid color reads as actual emphasis).
const KARIME_EMPHASIS_STYLE = {
  color: "#4a2806",
  fontWeight: 800,
  textShadow:
    "0 0 2px rgba(255, 230, 200, 0.6), 0 1px 0 rgba(91, 42, 11, 0.35)",
};

type SupportKey =
  | "gentle"
  | "deep"
  | "spiritual"
  | "ceremonial"
  | "unsure";

const SUPPORT_OPTIONS: { key: SupportKey; label: string }[] = [
  { key: "gentle", label: "Gentle conversation and emotional clarity" },
  { key: "deep", label: "Deep emotional support and nervous system care" },
  { key: "spiritual", label: "Spiritual guidance and inner work" },
  { key: "ceremonial", label: "Ceremonial or medicine-supported work" },
  { key: "unsure", label: "I'm not sure yet, but something needs to change" },
];

const KarimeIntake = () => {
  // Day 81 (Sasha 2026-05-23): route-scoped "karime" skin activation.
  // Same pattern as KarimeOffer — warm terracotta tokens applied only
  // while on this page, restored on unmount.
  const { pushTemporarySkin } = useSkin();
  useEffect(() => {
    const cleanup = pushTemporarySkin("karime");
    return cleanup;
  }, [pushTemporarySkin]);

  // Day 85 (Sasha 2026-05-25): support question is now MULTI-select.
  // Selections drive the reveal of the CTA (any choice unlocks it) and
  // the body of the WhatsApp message we generate on submit.
  const [selectedSupport, setSelectedSupport] = useState<SupportKey[]>([]);

  const toggleSupport = (key: SupportKey) => {
    setSelectedSupport((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // Day 85 (Sasha 2026-05-25): form submission via WhatsApp. The page
  // collects no name/email/phone (Karime wanted minimum friction); the
  // WhatsApp channel carries identity (the sender's number is the
  // signal). Message body packages the selections + the cal.com link
  // so Karime sees the intent shape AND the visitor still has a
  // self-serve booking path inside the same message they're about to
  // send. One CTA per stage; this replaces the previous direct-to-cal
  // book button.
  const handleSendWhatsApp = () => {
    const selectedLabels = SUPPORT_OPTIONS.filter((opt) =>
      selectedSupport.includes(opt.key),
    )
      .map((opt) => `• ${opt.label}`)
      .join("\n");

    const message = [
      "Hi Karime,",
      "",
      "I came through your intake page (findyourtoptalent.com/build/karime/intake).",
      "",
      selectedSupport.length === 1
        ? "The kind of support that feels most aligned for me right now:"
        : "The kinds of support that feel most aligned for me right now:",
      selectedLabels,
      "",
      "When you have a moment, I'd love to book the 20-minute conversation:",
      CALCOM_BOOKING_URL,
    ].join("\n");

    const url = `${KARIME_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Shared style tokens for body prose — same Cormorant + deep halo as the
  // landing, keeps the two pages reading as a continuous editorial spread.
  const bodyTextStyle = {
    fontFamily: "'Cormorant Garamond', serif" as const,
    color: "var(--skin-text-primary, #0a1628)",
    textShadow:
      "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
  };

  const sectionHeadingStyle = {
    ...bodyTextStyle,
    fontFamily: "'Cormorant Garamond', serif" as const,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.28em",
    textTransform: "uppercase" as const,
  };

  return (
    <GameShellV2 hideLogo enableRailMinimize>
      <SEO
        title="Karime Kuri · Preparing for our conversation"
        description="A short orientation before your free 20-minute conversation with Karime — her bio, the path, and one question that helps her prepare thoughtfully."
        path="/build/karime/intake"
        ogTitle="Before we meet"
      />
      {/* Day 81 (Sasha 2026-05-23): warm Moroccan-sunset HLS video bg
          (Mux) shared with /build/karime landing for tonal continuity. */}
      <KarimeHlsBackground />
      <div className="relative z-10 max-w-[760px] mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        {/* Day 82 (Sasha 2026-05-24): glassmorphic content container —
            matches the landing. Warm-cream tint + medium backdrop blur. */}
        <div
          className="rounded-3xl backdrop-blur-[7px] px-5 py-8 sm:px-7 sm:py-10 md:px-9 md:py-12"
          style={{
            background: "rgba(245, 240, 235, 0.06)",
            border: "1px solid rgba(240, 230, 220, 0.20)",
            boxShadow:
              "0 12px 40px -8px rgba(30, 26, 22, 0.34), inset 0 1px 0 rgba(245, 240, 235, 0.14)",
          }}
        >
        {/* ── Page heading (minimal — placeholder for Sasha's substitute) ── */}
        <header className="text-center mb-8 sm:mb-10">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.1] tracking-[-0.018em]"
            style={bodyTextStyle}
          >
            Before we meet.
          </h1>
          <Ornament className="my-5 sm:my-6" />
        </header>

        {/* ── About Karime ─────────────────────────────────────── */}
        <section className="mb-10 sm:mb-12">
          <p className="text-center mb-4 sm:mb-5" style={sectionHeadingStyle}>
            About Karime
          </p>
          <div className="space-y-4 sm:space-y-5" style={bodyTextStyle}>
            <p className="text-lg sm:text-xl leading-[1.55]">
              Karime is an Oxford alum, former Project Lead at the World
              Economic Forum's Center for Emerging Technology, and a
              Global Fellow Leader who{" "}
              <span
                className="bg-clip-text text-transparent"
                style={KARIME_EMPHASIS_STYLE}
              >
                walked away
              </span>{" "}
              from the WEF track to do this work. She trained as a
              transformational life coach at Sofia University, San
              Francisco, and brings her international policy background
              into the depth of the inner work she now holds.
            </p>
            <p
              className="text-lg sm:text-xl leading-[1.55] italic text-center"
              style={{ ...bodyTextStyle, fontWeight: 600 }}
            >
              She is here{" "}
              <span
                className="bg-clip-text text-transparent not-italic"
                style={KARIME_EMPHASIS_STYLE}
              >
                by choice
              </span>
              .
            </p>
          </div>
        </section>

        {/* ── The path ─────────────────────────────────────────── */}
        <section className="mb-10 sm:mb-12">
          <p className="text-center mb-6 sm:mb-7" style={sectionHeadingStyle}>
            The path
          </p>
          {/* Steps 1-3 with numbered gold-pip badges + vertical
              connector line on the left rail. Cormorant numerals in
              gold-bordered circles; thin gold line connects pip-to-pip.
              Step content sits in the right column. Cleaner visual
              rhythm than flat labeled paragraphs. */}
          <ol className="space-y-0">
            {[
              {
                num: 1,
                title: "20-minute fit call.",
                body: "Free. You meet Karime, you share what is bringing you here, and you both feel whether this is the right fit.",
              },
              {
                num: 2,
                title: "Your first 1-hour session.",
                body: "You and Karime co-design your personalized 3-month plan together. Pricing for the engagement is set during this session, based on the healing modalities you choose, the regularity of meetings, and the time you spend with her.",
              },
              {
                num: 3,
                title: "A 3-month result-oriented engagement.",
                body: "You walk the plan together. Karime holds the container as the work unfolds.",
              },
            ].map((step, idx, arr) => {
              const isLast = idx === arr.length - 1;
              return (
                <li
                  key={step.num}
                  className="flex gap-4 sm:gap-5 items-stretch"
                >
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-base sm:text-lg"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "var(--skin-text-primary, #0a1628)",
                        border: "1px solid rgba(244, 212, 114, 0.55)",
                        background:
                          "radial-gradient(circle at 30% 30%, rgba(244, 212, 114, 0.18), rgba(244, 212, 114, 0.04) 70%)",
                        boxShadow:
                          "0 0 12px -2px rgba(244, 212, 114, 0.35), inset 0 0 6px rgba(244, 212, 114, 0.15)",
                      }}
                      aria-hidden="true"
                    >
                      {step.num}
                    </div>
                    {!isLast && (
                      <div
                        className="w-px flex-1 my-1.5"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(244, 212, 114, 0.45), rgba(244, 212, 114, 0.15))",
                          minHeight: "32px",
                        }}
                      />
                    )}
                  </div>
                  <div
                    className={`flex-1 ${isLast ? "pb-1" : "pb-6 sm:pb-7"}`}
                    style={bodyTextStyle}
                  >
                    {/* Day 83 (Sasha 2026-05-25): hierarchy fix — was
                        all-bold "Step N: title" on one line, which gave
                        the prefix equal weight with the title.
                        Now "Step N" is a small uppercase eyebrow label
                        and the title is the dominant row element. The
                        action you'll actually take reads first. */}
                    <p
                      className="text-[11px] sm:text-xs uppercase tracking-[0.18em] opacity-60 mb-1"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Step {step.num}
                    </p>
                    <p className="text-xl sm:text-2xl leading-[1.3] font-bold mb-1.5">
                      {step.title}
                    </p>
                    <p className="text-base sm:text-lg leading-[1.55] opacity-90">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
          <p
            className="text-base sm:text-lg leading-[1.5] italic text-center pt-6 sm:pt-7 opacity-80"
            style={bodyTextStyle}
          >
            Online sessions worldwide. In-person sessions by arrangement.
          </p>
        </section>

        {/* ── To help Karime prepare thoughtfully ──────────────── */}
        <section className="mb-6">
          <p className="text-center mb-3 sm:mb-4" style={sectionHeadingStyle}>
            To help Karime prepare thoughtfully
          </p>
          <p
            className="text-center text-lg sm:text-xl leading-[1.5] mb-6 sm:mb-8 max-w-[580px] mx-auto"
            style={bodyTextStyle}
          >
            Before scheduling, choose the type of support that feels most
            aligned for you right now.
          </p>

          <div>
            <p
              className="block mb-2 text-xl sm:text-2xl leading-[1.3] font-bold text-center"
              style={bodyTextStyle}
            >
              Which kind of support feels most aligned right now?
            </p>
            <p
              className="text-center mb-5 sm:mb-6 text-xs sm:text-sm italic opacity-70"
              style={bodyTextStyle}
            >
              Choose all that apply
            </p>
            {/* Day 81 (Sasha 2026-05-23): options redesigned as
                clearly-visible bordered cards with custom gold-aligned
                indicators. Native inputs buried the affordance — visitors
                didn't read this as a choice they needed to make. Each
                option is now a tactile chip with hover lift and a strong
                gold-ring selected state. Native input is sr-only but
                retains full keyboard + a11y semantics.

                Day 85 (Sasha 2026-05-25): converted from radio (single)
                to checkbox (multi). Square indicator with a gold check
                glyph; supports selecting any combination. The selection
                array drives both the CTA reveal and the WhatsApp message
                body composed in handleSendWhatsApp. */}
            <div className="space-y-3 sm:space-y-3.5 max-w-[580px] mx-auto">
              {SUPPORT_OPTIONS.map((opt) => {
                const isSelected = selectedSupport.includes(opt.key);
                return (
                  <label
                    key={opt.key}
                    className={`flex items-center gap-4 cursor-pointer p-4 sm:p-5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-white/55"
                        : "bg-white/25 hover:bg-white/40 hover:scale-[1.005]"
                    }`}
                    style={{
                      borderColor: isSelected
                        ? "rgba(244, 212, 114, 0.7)"
                        : "rgba(26, 30, 58, 0.14)",
                      boxShadow: isSelected
                        ? "0 0 0 1px rgba(244, 212, 114, 0.45), 0 6px 18px -6px rgba(244, 212, 114, 0.35), 0 1px 3px rgba(11, 42, 90, 0.08)"
                        : "0 1px 2px rgba(11, 42, 90, 0.04)",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="support"
                      value={opt.key}
                      checked={isSelected}
                      onChange={() => toggleSupport(opt.key)}
                      className="sr-only"
                    />
                    {/* Custom checkbox indicator — square, gold-themed,
                        check glyph appears when selected. Square shape
                        reads as "multi-select" vs the round radio. */}
                    <span
                      className="w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all"
                      style={{
                        borderColor: isSelected
                          ? "rgba(244, 212, 114, 0.9)"
                          : "rgba(26, 30, 58, 0.35)",
                        background: isSelected
                          ? "rgba(244, 212, 114, 0.18)"
                          : "rgba(255, 255, 255, 0.5)",
                        boxShadow: isSelected
                          ? "inset 0 0 4px rgba(244, 212, 114, 0.4)"
                          : "none",
                      }}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <svg
                          viewBox="0 0 16 16"
                          className="w-3.5 h-3.5"
                          style={{
                            color: "rgba(122, 81, 8, 0.95)",
                            filter:
                              "drop-shadow(0 0 4px rgba(244, 212, 114, 0.55))",
                          }}
                          aria-hidden="true"
                        >
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 8.5L6.5 12L13 4.5"
                          />
                        </svg>
                      )}
                    </span>
                    <span
                      className="text-base sm:text-lg leading-[1.4] font-semibold flex-1"
                      style={bodyTextStyle}
                    >
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA + contact (progressive reveal) ───────────────── */}
        {/* Renders only after the visitor picks at least one support
            option. The selection IS the qualifying act; revealing the
            booking + contact below makes the path forward feel earned,
            and gives Karime + Sasha a signal in the inbound.

            Day 85 (Sasha 2026-05-25): CTA action changed from direct
            cal.com booking to WhatsApp-with-prefilled-form. The form
            now actually delivers the visitor's selections to Karime as
            a WhatsApp message — she sees the support shape before the
            call. The cal.com URL is included inside the message body,
            so visitors keep a self-serve booking path; one CTA per
            stage preserved. */}
        {selectedSupport.length > 0 && (
          <section className="mt-2 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Ornament className="my-6 sm:my-8" />
            <p
              className="text-center text-lg sm:text-xl leading-[1.4] mb-5 sm:mb-6 max-w-[520px] mx-auto"
              style={{ ...bodyTextStyle, fontWeight: 600 }}
            >
              Send your reflection to Karime, and she'll be in touch.
            </p>
            <div className="flex flex-col items-center gap-4 px-4 text-center">
              <EditorialCta
                label="Send to Karime on WhatsApp"
                onClick={handleSendWhatsApp}
              />
              <div
                className="inline-flex items-center justify-center gap-2 max-w-[460px] mt-1"
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
                <span>Includes your booking link · Free 20-min call</span>
              </div>

              {/* Contact line revealed alongside the CTA — Telegram +
                  WhatsApp as fallback channels for visitors who prefer
                  to message before booking. "Questions?" lead-in (Sasha
                  Day 81) labels the line so visitors read the channels
                  as a question-channel, not a competing CTA. */}
              <div
                className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 max-w-[520px] mt-3"
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
                <span>Questions?</span>
                <a
                  href={KARIME_TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  Telegram @integralevolution
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href={KARIME_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  WhatsApp +1 (415) 707-3432
                </a>
              </div>
            </div>
          </section>
        )}
        </div>
      </div>
    </GameShellV2>
  );
};

export default KarimeIntake;

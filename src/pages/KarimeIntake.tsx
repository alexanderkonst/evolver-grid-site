import { useState } from "react";
import { EditorialCta } from "@/components/ui/editorial-cta";
import { Ornament } from "@/lib/landingDesign";
import SEO from "@/components/SEO";
import GameShellV2 from "@/components/game/GameShellV2";

/**
 * KarimeIntake — the preparatory page Sasha sends manually on WhatsApp
 * after the initial CTA from /build/karime. NOT in the BUILD sidebar; only
 * reachable via direct URL that Sasha forwards by hand. Pattern: visitor
 * lands on /build/karime → taps "Book a 20-min conversation" → WhatsApp
 * opens with a prefilled greeting to Sasha → Sasha replies with this
 * page's URL → visitor reads modalities, fills the priming quiz, and books
 * via the Cal.com link at the bottom.
 *
 * Day 81 (Sasha 2026-05-23):
 *   - Modality language is VERBAL-ONLY (option a). The page names the
 *     SHAPE of Karime's work (honest conversation, embodied practice,
 *     ceremonial container, meditation guidance) but does NOT name any
 *     specific substance, plant, or controlled modality. Those are
 *     discussed only on the live 20-min call where context + consent are
 *     present together. Safety + legal cleanliness for a US-hosted site.
 *   - Pricing is intentionally a soft placeholder — exact numbers shared
 *     by Karime on the call once she's heard what the visitor is bringing.
 *     Sasha + Karime to fill in real numbers when ready.
 *   - Quiz is LOCAL STATE only. No submission backend. The act of
 *     answering primes the visitor to think through their context before
 *     booking; they share their answers verbally on the call. Future:
 *     wire to Supabase if Karime wants written context pre-call.
 *
 * Cal.com link is Karime's real 20-min booking page. Single CTA at the
 * bottom. No fork.
 */

const CALCOM_BOOKING_URL = "https://cal.com/karimekuri/20min";

type ModalityKey =
  | "honest_conversation"
  | "quiet_listening"
  | "embodied_practice"
  | "meditation_guidance"
  | "ceremonial_container"
  | "open_to_what_serves";

const MODALITIES: { key: ModalityKey; label: string }[] = [
  { key: "honest_conversation", label: "Honest conversation about what is happening" },
  { key: "quiet_listening", label: "Quiet, attentive listening" },
  { key: "embodied_practice", label: "Embodied or somatic practice" },
  { key: "meditation_guidance", label: "Meditation guidance" },
  { key: "ceremonial_container", label: "A ceremonial container (for those it serves)" },
  { key: "open_to_what_serves", label: "Open to whatever serves" },
];

type ExperienceLevel =
  | "currently_active"
  | "within_year"
  | "over_year_ago"
  | "new_territory";

const EXPERIENCE_OPTIONS: { key: ExperienceLevel; label: string }[] = [
  { key: "currently_active", label: "Currently in active inner work" },
  { key: "within_year", label: "Within the last year" },
  { key: "over_year_ago", label: "More than a year ago" },
  { key: "new_territory", label: "This is new territory for me" },
];

const KarimeIntake = () => {
  const [bringing, setBringing] = useState("");
  const [selectedModalities, setSelectedModalities] = useState<Set<ModalityKey>>(
    new Set(),
  );
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [landingFeel, setLandingFeel] = useState("");

  const toggleModality = (key: ModalityKey) => {
    setSelectedModalities((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleBook = () => {
    window.open(CALCOM_BOOKING_URL, "_blank", "noopener,noreferrer");
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
    <GameShellV2 hideLogo>
      <SEO
        title="Preparing for your conversation with Karime"
        description="A few notes before we meet — Karime's work, how she approaches it, and a brief priming reflection to help you arrive ready."
        path="/build/karime/intake"
        ogTitle="Preparing for your conversation with Karime"
      />
      <div className="max-w-[720px] mx-auto px-5 py-8 sm:py-9 md:py-10">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <header className="text-center mb-8 sm:mb-10">
          <p className="mb-4 sm:mb-5" style={sectionHeadingStyle}>
            Preparing for your conversation with Karime
          </p>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.018em]"
            style={bodyTextStyle}
          >
            A few notes before we meet.
          </h1>
          <Ornament className="my-5 sm:my-6" />
          <p
            className="text-lg sm:text-xl md:text-[1.4rem] font-semibold leading-[1.45] tracking-[-0.005em] max-w-[600px] mx-auto"
            style={bodyTextStyle}
          >
            This page exists so the 20 minutes we spend together can land
            with as much depth as possible. Read it slowly. The reflection
            below is for you, not for us.
          </p>
        </header>

        {/* ── How Karime works ─────────────────────────────────── */}
        <section className="mb-10 sm:mb-12">
          <p className="text-center mb-4 sm:mb-5" style={sectionHeadingStyle}>
            How Karime works
          </p>
          <div className="space-y-4 sm:space-y-5" style={bodyTextStyle}>
            <p className="text-lg sm:text-xl leading-[1.5]">
              Karime meets each person where they are. The shape of the
              work is responsive, not formulaic. She draws on a range of
              practices and chooses what serves the moment.
            </p>
            <p className="text-lg sm:text-xl leading-[1.5]">
              The throughline across all of her work: honest presence,
              careful attention, and a quality of holding that allows you
              to feel what is real without needing to perform recovery.
            </p>
            <p className="text-lg sm:text-xl leading-[1.5]">
              Practices she may bring, depending on what fits:
            </p>
            <ul
              className="space-y-2 pl-6 text-lg sm:text-xl leading-[1.5] italic"
              style={{ ...bodyTextStyle, fontWeight: 600 }}
            >
              <li>Honest conversation about what is happening</li>
              <li>Quiet, attentive listening</li>
              <li>Embodied and somatic practice</li>
              <li>Meditation guidance, including recorded personalized meditations</li>
              <li>Ceremonial containers, where appropriate and consented</li>
            </ul>
            <p className="text-lg sm:text-xl leading-[1.5]">
              The specifics of what your work together would look like are
              shaped on the 20-minute call, once Karime has heard what you
              are bringing.
            </p>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────── */}
        <section className="mb-10 sm:mb-12">
          <p className="text-center mb-4 sm:mb-5" style={sectionHeadingStyle}>
            Pricing
          </p>
          <div className="space-y-3 sm:space-y-4" style={bodyTextStyle}>
            {/* TODO (Sasha + Karime, Day 81): replace with real numbers.
                Suggested shape: single session price · 3-session container
                price · 6-session container price · sliding-scale note if
                applicable. For now the page holds the slot with a soft
                holding statement so the visitor isn't surprised by the
                absence; the actual figures arrive on the call. */}
            <p className="text-lg sm:text-xl leading-[1.5] italic text-center">
              Specific pricing is shared on the 20-minute call, once
              Karime has heard the shape of what you are bringing and the
              container that would best serve it.
            </p>
            <p className="text-base sm:text-lg leading-[1.5] text-center opacity-80">
              Sessions are available individually or in dedicated
              multi-session containers. Online sessions are offered
              worldwide; in-person sessions by arrangement.
            </p>
          </div>
        </section>

        {/* ── Priming reflection (the quiz) ────────────────────── */}
        <section className="mb-10 sm:mb-12">
          <p className="text-center mb-4 sm:mb-5" style={sectionHeadingStyle}>
            A short reflection before we meet
          </p>
          <p
            className="text-center text-base sm:text-lg leading-[1.5] italic mb-6 sm:mb-8 max-w-[560px] mx-auto opacity-80"
            style={bodyTextStyle}
          >
            These notes are for you. Nothing here is sent or saved. The
            act of writing them out is the preparation; bring whatever
            stays alive in you to the call.
          </p>

          <div className="space-y-7 sm:space-y-8">
            {/* Q1 — what's bringing you */}
            <div>
              <label
                htmlFor="q-bringing"
                className="block mb-2 text-lg sm:text-xl leading-[1.4] font-semibold"
                style={bodyTextStyle}
              >
                1. What is bringing you here?
              </label>
              <textarea
                id="q-bringing"
                value={bringing}
                onChange={(e) => setBringing(e.target.value)}
                rows={4}
                placeholder="The thing that's actually heavy, in your own words…"
                className="w-full px-4 py-3 rounded-lg border border-[rgba(26,30,58,0.18)] bg-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[rgba(244,212,114,0.5)] focus:border-[rgba(244,212,114,0.6)] transition-all"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.05rem",
                  color: "var(--skin-text-primary, #0a1628)",
                }}
              />
            </div>

            {/* Q2 — what resonates */}
            <div>
              <p
                className="block mb-3 text-lg sm:text-xl leading-[1.4] font-semibold"
                style={bodyTextStyle}
              >
                2. What kind of support resonates with you right now?
              </p>
              <p
                className="text-sm sm:text-base mb-3 italic opacity-75"
                style={bodyTextStyle}
              >
                Pick any that feel true. There is no wrong answer.
              </p>
              <div className="space-y-2">
                {MODALITIES.map((m) => (
                  <label
                    key={m.key}
                    className="flex items-start gap-3 cursor-pointer py-1.5 px-2 -mx-2 rounded-md hover:bg-white/30 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedModalities.has(m.key)}
                      onChange={() => toggleModality(m.key)}
                      className="mt-1.5 w-4 h-4 rounded border-[rgba(26,30,58,0.3)] accent-[rgba(244,212,114,0.85)]"
                    />
                    <span
                      className="text-base sm:text-lg leading-[1.4]"
                      style={bodyTextStyle}
                    >
                      {m.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q3 — experience level */}
            <div>
              <p
                className="block mb-3 text-lg sm:text-xl leading-[1.4] font-semibold"
                style={bodyTextStyle}
              >
                3. How recently have you been in deep inner work?
              </p>
              <div className="space-y-2">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <label
                    key={opt.key}
                    className="flex items-center gap-3 cursor-pointer py-1.5 px-2 -mx-2 rounded-md hover:bg-white/30 transition-colors"
                  >
                    <input
                      type="radio"
                      name="experience"
                      checked={experience === opt.key}
                      onChange={() => setExperience(opt.key)}
                      className="w-4 h-4 border-[rgba(26,30,58,0.3)] accent-[rgba(244,212,114,0.85)]"
                    />
                    <span
                      className="text-base sm:text-lg leading-[1.4]"
                      style={bodyTextStyle}
                    >
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q4 — what would landing feel like */}
            <div>
              <label
                htmlFor="q-landing"
                className="block mb-2 text-lg sm:text-xl leading-[1.4] font-semibold"
                style={bodyTextStyle}
              >
                4. What would make this feel like it landed?
              </label>
              <textarea
                id="q-landing"
                value={landingFeel}
                onChange={(e) => setLandingFeel(e.target.value)}
                rows={4}
                placeholder="What would be different in you, in your week, in your body…"
                className="w-full px-4 py-3 rounded-lg border border-[rgba(26,30,58,0.18)] bg-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[rgba(244,212,114,0.5)] focus:border-[rgba(244,212,114,0.6)] transition-all"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.05rem",
                  color: "var(--skin-text-primary, #0a1628)",
                }}
              />
            </div>
          </div>
        </section>

        {/* ── CTA — Cal.com booking ────────────────────────────── */}
        <section className="mb-6">
          <Ornament className="my-6 sm:my-8" />
          <p
            className="text-center text-lg sm:text-xl leading-[1.4] mb-5 sm:mb-6 max-w-[520px] mx-auto"
            style={{ ...bodyTextStyle, fontWeight: 600 }}
          >
            When you are ready, book your 20 minutes with Karime.
          </p>
          <div className="flex flex-col items-center gap-4 px-4 text-center">
            <EditorialCta
              label="Book your 20-min call"
              onClick={handleBook}
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
              <span>Free · 20 minutes · Cal.com</span>
            </div>
          </div>
        </section>
      </div>
    </GameShellV2>
  );
};

export default KarimeIntake;

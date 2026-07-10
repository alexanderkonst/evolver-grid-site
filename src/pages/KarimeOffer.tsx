import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { EditorialCta } from "@/components/ui/editorial-cta";
import { Ornament } from "@/lib/landingDesign";
import SEO from "@/components/SEO";
import GameShellV2 from "@/components/game/GameShellV2";
import KarimeHlsBackground from "@/components/landing/KarimeHlsBackground";
import { useSkin } from "@/contexts/SkinContext";

/**
 * KarimeOffer — Karime Kuri's offering page, embedded in the BUILD space.
 *
 * Day 80 (Sasha 2026-05-23): first instance of an in-platform offering page
 * for a founder-collective member. Structurally a clone of MatchHero (same
 * pane-3 skeleton: eyebrow → italic question → h1 → ornament → sub copy →
 * CTA → footer microcopy → contact line) wrapped in `GameShellV2` so the
 * SpacesRail + SectionsPanel render identically to every other BUILD-space
 * route.
 *
 * Access:
 *   - Route /build/karime is public (no RequireAuth, no MeGate) so the
 *     direct URL is reachable cold for sharing.
 *   - Sidebar row "Karime's Unique Offer" in SectionsPanel renders only when
 *     `userEmail === karimekurit@gmail.com` OR `useDeepProfileActivated()`
 *     returns true (i.e., user has unlocked the BUILD space).
 *
 * Visual register: gold word-highlights from MatchHero are NOT carried over —
 * Karime's copy is heart-centered (grief / heartbreak / emotional exhaustion)
 * and inline gold emphasis spans would feel mismatched against the tone. The
 * ornament and CTA emblem still carry the brand-gold signature; prose stays
 * in primary ink.
 *
 * CTA: WhatsApp click-to-chat as the default booking surface (matches the
 * "free 20-minute fit session" footer microcopy — a chat-first intake is
 * the most direct path). Swap to Cal.com when Karime provides a link.
 */

// Day 81 (Sasha 2026-05-23): CTA goes to Sasha (gatekeeper flow) with a
// prefilled greeting; visitor taps CTA → WhatsApp opens with the message
// already typed → they tap send. Sasha replies manually with the prep-page
// link (/build/karime/intake). "Came through Karime's page" is the source
// signal so Sasha can tell funnel-sourced inbound from network referrals.
//
// Day 81 (Sasha 2026-05-23): confirmed — 14157073432 is Sasha's gateway.
// The contact line below uses the same number; the CTA above prefills a
// message so Sasha can distinguish funnel-sourced inbound from cold messages.
//
// Day 88 (Sasha 2026-06-06): CTA label unified to "Speak with Karime"
// (canonical per karimes_unique_business.md doc). Warmer + relational vs
// the prior "Book a 20-min conversation" which front-loaded the
// transactional verb. The microcopy below still names the actual
// mechanic ("Free 20-minute fit call") so the visitor knows what
// "speaking" actually means.
const WHATSAPP_BOOKING_URL =
  "https://wa.me/14157073432?text=Hi%20Sasha%2C%20I%20came%20through%20Karime%27s%20page%20and%20would%20like%20to%20connect.";

// Day 82 v5 (Sasha 2026-05-24): warm copper-rose gradient for emphasis
// words. Mirrors MatchHero's GOLD_TEXT_STYLE pattern but tuned to the
// karime warm palette so the highlight harmonizes with the brass altar
// tones in the video bg instead of clashing with cool antique gold.
// Day 83 v4 (Sasha 2026-05-25): emphasis simplified to solid dark
// espresso-bronze with text-shadow halo. The gradient + filter combo
// was muddying — the cream drop-shadow was washing the gradient into
// pale mid-tones. Solid #4a2806 (deep coffee-bronze) is unambiguously
// dark; the cream text-shadow lifts it off the bg without bleeding
// into the letterforms. Reads as real emphasis against both bright
// (curtain/sky) and dark (wood table) areas of the bg video.
const KARIME_EMPHASIS_STYLE = {
  color: "#4a2806",
  fontWeight: 800,
  textShadow:
    "0 0 2px rgba(255, 230, 200, 0.6), 0 1px 0 rgba(91, 42, 11, 0.35)",
};
// Direct contact line at bottom of page still points to Karime's WhatsApp
// + Telegram (without prefilled message — visitor writes their own).
const KARIME_WHATSAPP_URL = "https://wa.me/14157073432";
const TELEGRAM_HANDLE_URL = "https://t.me/integralevolution";

const KarimeOffer = () => {
  // Day 81 (Sasha 2026-05-23): route-scoped "karime" skin activation.
  // pushTemporarySkin swaps tokens on mount and restores the user's
  // persisted skin on unmount, so Karime's warm terracotta palette
  // applies only while we're on this page.
  const { pushTemporarySkin } = useSkin();
  const { t } = useTranslation();
  useEffect(() => {
    const cleanup = pushTemporarySkin("karime");
    return cleanup;
  }, [pushTemporarySkin]);

  const handleBook = () => {
    window.open(WHATSAPP_BOOKING_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <GameShellV2 hideLogo defaultRailMinimized>
      <SEO
        title="Karime Kuri · Grounded Emotional Support"
        description="Private emotional support for people moving through heartbreak, grief, burnout, relationship pain, family crisis, impossible decisions, and emotionally overwhelming seasons of life."
        path="/build/karime"
        ogTitle="You do not have to carry this alone"
      />
      {/* Day 81 (Sasha 2026-05-23): warm Moroccan-sunset HLS video bg
          (Mux) replaces the Aurora cool default for Karime's routes. */}
      <KarimeHlsBackground />
      <div className="relative z-10 max-w-[760px] mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        {/* Day 82 (Sasha 2026-05-24): glassmorphic content container —
            transparent warm-cream tint + medium backdrop blur so the
            text reads as floating on a soft "platform" against the
            video bg. Karime-only treatment; we may extend to other
            founder pages if it lands well. */}
        <div
          className="rounded-3xl backdrop-blur-[7px] px-5 py-8 sm:px-7 sm:py-10 md:px-9 md:py-12"
          style={{
            background: "rgba(245, 240, 235, 0.06)",
            border: "1px solid rgba(240, 230, 220, 0.20)",
            boxShadow:
              "0 12px 40px -8px rgba(30, 26, 22, 0.34), inset 0 1px 0 rgba(245, 240, 235, 0.14)",
          }}
        >
        <header className="text-center">
          {/* Eyebrow — same Cormorant small-caps + deep halo as MatchHero.
              Day 88 (Sasha 2026-06-06): font-size 11→13, letter-spacing
              0.28→0.22. Prior 11px:H1-48px ratio (~1:4.4) made the
              eyebrow read as legal-text attribution under the H1.
              Bumped one step so it earns its positioning-lead role
              without losing the small-caps editorial register. */}
          <p
            className="mb-4 sm:mb-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
            }}
          >
            {t("karimeOffer.eyebrow")}
          </p>

          {/* Italic question — leads the hero, h1 below answers it. */}
          <p
            className="text-lg sm:text-xl md:text-2xl leading-[1.32] italic mb-4 sm:mb-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              letterSpacing: "0.01em",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
            }}
          >
            {t("karimeOffer.question")}
          </p>

          {/* Main headline — no gold word-highlights for Karime's tone. */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.018em] mb-4 sm:mb-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
              fontVariantNumeric: "lining-nums",
              fontFeatureSettings: '"lnum" 1, "onum" 0',
            }}
          >
            {t("karimeOffer.headlineBefore")}{" "}
            <span
              className="bg-clip-text text-transparent"
              style={KARIME_EMPHASIS_STYLE}
            >
              {t("karimeOffer.headlineEmphasis")}
            </span>
            {t("karimeOffer.headlineAfter")}
          </h1>

          <Ornament className="my-5 sm:my-6" />

          {/* Supporting copy — Day 88 (Sasha 2026-06-06) tightening pass.
              Previously: 4 bold-prose blocks + italic three-liner, which
              gave 4 near-equal weight blocks competing after the H1, and
              the bridge's 7-item pain list ("heartbreak, grief, burnout,
              relationship pain, family crisis, impossible decisions, and
              emotionally overwhelming seasons of life") read as catalogue
              rather than mirror — duplicating the recognition the italic
              question already lands.

              New shape:
                - Bridge trimmed from 7 pains to 3, lighter (no emphasis
                  span); ICP-recognition stays but tighter
                - "A space to soften..." block CUT (the italic three-liner
                  below already names what the space feels like)
                - Italic three-liner KEPT (the punchiest copy on the page)
                - "Just honest, attentive care..." closing block CUT (it
                  duplicates the bridge and the three-liner)
                - Emphasis spans held to ONE per viewport (the H1's
                  "alone"). The prior "deeply grounded" / "soften" / "Held"
                  highlights read as Mad-Libs at 4 emphasis hits per scroll.

              Result: bridge → italic three-liner → CTA. Two beats of
              support copy crescendoing into action, instead of five
              competing blocks. */}
          <div
            className="space-y-4 sm:space-y-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
          >
            <p className="text-lg sm:text-xl md:text-[1.4rem] font-bold leading-[1.45] tracking-[-0.005em]">
              {t("karimeOffer.bridge")}
            </p>

            {/* Three short lines — positive declarations, italic for breath.
                Day 81: negatives flipped to positives so the page leads
                with what IS, not what isn't. Day 88: emphasis span on
                "Held" removed — the H1's "alone" is now the only
                emphasis on the page. */}
            <div
              className="space-y-1 sm:space-y-1.5 italic"
              style={{ fontWeight: 600 }}
            >
              <p className="text-base sm:text-lg md:text-xl leading-[1.4]">
                {t("karimeOffer.line1")}
              </p>
              <p className="text-base sm:text-lg md:text-xl leading-[1.4]">
                {t("karimeOffer.line2")}
              </p>
              <p className="text-base sm:text-lg md:text-xl leading-[1.4]">
                {t("karimeOffer.line3")}
              </p>
            </div>
          </div>
        </header>

        {/* CTA cluster — single primary CTA, footer microcopy, contact line. */}
        <div className="mt-7 sm:mt-8">
          <div className="flex flex-col items-center gap-4 px-4 text-center">
            <EditorialCta label={t("karimeOffer.ctaLabel")} onClick={handleBook} />

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
              {/* Day 88 (Sasha 2026-06-06): microcopy unified to match the
                  canvas doc. Three terms previously named the same call
                  three different ways ("20-min conversation" CTA, "20
                  minutes fit call" microcopy, "20-min fit call" doc).
                  Canonical now: "Free 20-minute fit call." In-person
                  phrasing matched to the doc's "by arrangement" so the
                  page does not overpromise in-person availability. */}
              <span>{t("karimeOffer.microcopy")}</span>
            </div>

            {/* Contact line — clickable Telegram + WhatsApp. Same small-caps
                tracked microcopy register as the footer line above; sits a
                hair below as a quieter second beat. */}
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
                {t("karimeOffer.telegramLabel")}
              </a>
              <span aria-hidden="true">·</span>
              <a
                href={KARIME_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                {t("karimeOffer.whatsappLabel")}
              </a>
            </div>
          </div>
        </div>
        </div>
      </div>
    </GameShellV2>
  );
};

export default KarimeOffer;

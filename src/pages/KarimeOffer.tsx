import { EditorialCta } from "@/components/ui/editorial-cta";
import { Ornament } from "@/lib/landingDesign";
import SEO from "@/components/SEO";
import GameShellV2 from "@/components/game/GameShellV2";

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

const WHATSAPP_BOOKING_URL = "https://wa.me/14157073432";
const TELEGRAM_HANDLE_URL = "https://t.me/integralevolution";

const KarimeOffer = () => {
  const handleBook = () => {
    window.open(WHATSAPP_BOOKING_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <GameShellV2>
      <SEO
        title="Karime Kuri · Grounded Emotional Support"
        description="Private emotional support for people moving through heartbreak, grief, burnout, relationship pain, family crisis, impossible decisions, and emotionally overwhelming seasons of life."
        path="/build/karime"
        ogTitle="You do not have to carry this alone"
      />
      <div className="max-w-[720px] mx-auto px-5 py-8 sm:py-9 md:py-10">
        <header className="text-center">
          {/* Eyebrow — same Cormorant small-caps + deep halo as MatchHero. */}
          <p
            className="mb-4 sm:mb-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
            }}
          >
            Private emotional support for delicate life moments
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
            Still holding everything together while quietly falling apart inside?
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
            You do not have to carry this alone.
          </h1>

          <Ornament className="my-5 sm:my-6" />

          {/* Supporting copy — paragraph + the three short lines (Not advice /
              Not pressure / Not spiritual performance) + closing line. */}
          <div
            className="space-y-4 sm:space-y-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
          >
            <p className="text-lg sm:text-xl md:text-[1.4rem] font-semibold leading-[1.45] tracking-[-0.005em]">
              Karime offers deeply grounded emotional support for people moving through heartbreak, grief, emotional exhaustion, relationship pain, family crisis, impossible decisions, and delicate life transitions.
            </p>

            <p className="text-lg sm:text-xl md:text-[1.4rem] font-semibold leading-[1.45] tracking-[-0.005em]">
              A space to soften, reconnect with yourself, and feel genuinely cared for while facing what is real.
            </p>

            {/* Three short lines — render as a tight stack, italic for breath. */}
            <div
              className="space-y-1 sm:space-y-1.5 italic"
              style={{ fontWeight: 600 }}
            >
              <p className="text-base sm:text-lg md:text-xl leading-[1.4]">
                Not advice.
              </p>
              <p className="text-base sm:text-lg md:text-xl leading-[1.4]">
                Not pressure.
              </p>
              <p className="text-base sm:text-lg md:text-xl leading-[1.4]">
                Not spiritual performance.
              </p>
            </div>

            <p className="text-lg sm:text-xl md:text-[1.4rem] font-semibold leading-[1.45] tracking-[-0.005em]">
              Just honest, attentive support during the moments of life that become too heavy to hold alone.
            </p>
          </div>
        </header>

        {/* CTA cluster — single primary CTA, footer microcopy, contact line. */}
        <div className="mt-7 sm:mt-8">
          <div className="flex flex-col items-center gap-4 px-4 text-center">
            <EditorialCta label="Book a conversation" onClick={handleBook} />

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
              <span>Free 20-minute fit session · Private online sessions worldwide & in person</span>
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
                Telegram @integralevolution
              </a>
              <span aria-hidden="true">·</span>
              <a
                href={WHATSAPP_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                WhatsApp +1 (415) 707-3432
              </a>
            </div>
          </div>
        </div>
      </div>
    </GameShellV2>
  );
};

export default KarimeOffer;

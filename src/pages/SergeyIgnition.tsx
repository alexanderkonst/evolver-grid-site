import { ArrowRight, Check, MessageCircle, ChevronDown, Star, Compass, Flame, Target, Zap, UserCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Hls from "hls.js";

/* ─── Sergey-specific links (placeholders until Sergey sets up) ─── */
const CALCOM_BOOKING_LINK = "#"; // Sergey's booking link TBD
const CALCOM_CLARITY_LINK = "#"; // Sergey's clarity call link TBD

const HLS_VIDEO_URL = "https://stream.mux.com/f7R901xPVirn4wi01FeaJ02XPvUJrylNdM3RGOiLs4RPBs.m3u8";

/* ─── HLS Background Video ────────────────────────────────── */
const HlsBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ autoStartLoad: true });
      hls.loadSource(HLS_VIDEO_URL);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = HLS_VIDEO_URL;
      video.addEventListener("loadedmetadata", () => { video.play().catch(() => {}); });
    }
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className="fixed inset-0 w-full h-full object-cover z-0"
      aria-hidden="true"
    />
  );
};

/* ─── Primary CTA Button (liquid glass) ──────────────────── */
const PrimaryCTA = ({ id, label }: { id: string; label?: string }) => {
  const { t } = useTranslation();
  return (
    <a
      href={CALCOM_BOOKING_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="liquid-glass-strong inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-medium text-white hover:scale-105 active:scale-95 transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
      style={{ fontFamily: "'Poppins', sans-serif" }}
      id={id}
    >
      {label ?? t("sergeyIgnition.primaryCtaLabel")}
      <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
        <ArrowRight className="w-4 h-4" />
      </span>
    </a>
  );
};

const SergeyIgnition = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const inShell = location.pathname.startsWith("/game/");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Pull + AI = Breakthrough — Sergey Jay Makarov";
    return () => { document.title = previousTitle; };
  }, []);

  const content = (
    <div className="relative min-h-screen bg-black text-white overflow-hidden" id="sergey-page" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ═══════════════════════════════════════════════
          VIDEO BACKGROUND
          ═══════════════════════════════════════════════ */}
      <HlsBackground />
      <div className="fixed inset-0 bg-black/55 z-[1]" aria-hidden="true" />

      {/* ═══════════════════════════════════════════════
          CONTENT LAYER
          ═══════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-16 space-y-12">

        {/* ═══════════════════════════════════════════════
            S1: HERO — Godfather Recognition Trigger
            ═══════════════════════════════════════════════ */}
        <header className="text-center space-y-6 pt-4" id="sergey-hero">
          <p className="text-xs text-white/50 uppercase tracking-[0.25em]">{t("sergeyIgnition.heroEyebrow")}</p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.05em] text-white leading-[1.1]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {t("sergeyIgnition.heroTitleLine1")}
            <br />
            <span className="text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.2)" }}>
              {t("sergeyIgnition.heroTitleLine2")}
            </span>
          </h1>

          <p className="text-base text-white/90 max-w-lg mx-auto leading-relaxed">
            {t("sergeyIgnition.heroLede")}
          </p>

          <p className="text-sm text-white/75 max-w-md mx-auto leading-relaxed">
            {t("sergeyIgnition.heroPara1")}
          </p>

          <p className="text-sm text-white/75 max-w-md mx-auto leading-relaxed">
            {t("sergeyIgnition.heroPara2")}
          </p>

          <div className="liquid-glass rounded-2xl p-5 max-w-md mx-auto text-left space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-widest text-center">{t("sergeyIgnition.inversionLabel")}</p>
            <p className="text-sm text-white/90 leading-relaxed">
              {t("sergeyIgnition.inversionBefore")} <strong>{t("sergeyIgnition.inversionStrong")}</strong>
              <br />{t("sergeyIgnition.inversionAfter")}
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              {t("sergeyIgnition.inversionDetail")}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <PrimaryCTA id="hero-cta-btn" />
            <span className="text-xs text-white/40">{t("sergeyIgnition.heroCtaNote")}</span>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            S2: QUALIFIER — Self-selection pills
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="qualifier" aria-label="Who this is for">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("sergeyIgnition.qualifierTitle")}</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "sergeyIgnition.qualifierPill1",
              "sergeyIgnition.qualifierPill2",
              "sergeyIgnition.qualifierPill3",
              "sergeyIgnition.qualifierPill4",
              "sergeyIgnition.qualifierPill5",
            ].map((key, i) => (
              <span
                key={i}
                className="liquid-glass rounded-full px-4 py-2 text-xs text-white/90"
              >
                {t(key)}
              </span>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S3: WHAT HAPPENS — Live diagnostic
            ═══════════════════════════════════════════════ */}
        <section className="space-y-4" id="what-happens" aria-label="What happens in the session">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-medium text-white/90 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("sergeyIgnition.whatHappensTitle")}</h2>
            <p className="text-xs text-white/50">{t("sergeyIgnition.whatHappensSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                emoji: "🎯",
                step: "1",
                titleKey: "sergeyIgnition.step1Title",
                descKey: "sergeyIgnition.step1Desc",
              },
              {
                emoji: "⚡",
                step: "2",
                titleKey: "sergeyIgnition.step2Title",
                descKey: "sergeyIgnition.step2Desc",
              },
              {
                emoji: "🔄",
                step: "3",
                titleKey: "sergeyIgnition.step3Title",
                descKey: "sergeyIgnition.step3Desc",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="liquid-glass rounded-3xl p-5 text-center space-y-3 hover:scale-105 transition-transform duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto text-xl">
                  <span aria-hidden="true">{item.emoji}</span>
                </div>
                <p className="text-xs text-white/60 font-medium uppercase tracking-widest">{t("sergeyIgnition.stepLabel", { step: item.step })}</p>
                <p className="text-sm text-white font-medium leading-snug">{t(item.titleKey)}</p>
                <p className="text-xs text-white/55 leading-relaxed">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S4: DELIVERABLES — What you walk out with
            ═══════════════════════════════════════════════ */}
        <section id="deliverables" aria-label="Session deliverables" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("sergeyIgnition.deliverablesTitle")}</h2>
          <div className="liquid-glass-strong rounded-3xl p-6 md:p-8">
            <p className="text-xs text-white/45 mb-4">{t("sergeyIgnition.deliverablesIntro")}</p>
            <div className="space-y-4">
              {[
                { titleKey: "sergeyIgnition.deliverable1", descKey: "" },
                { titleKey: "sergeyIgnition.deliverable2", descKey: "" },
                { titleKey: "sergeyIgnition.deliverable3", descKey: "" },
                { titleKey: "sergeyIgnition.deliverable4", descKey: "" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white/80" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-white/95 font-medium">{t(item.titleKey)}</p>
                    {item.descKey && <p className="text-xs text-white/55 leading-relaxed mt-0.5">{t(item.descKey)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S5: THE THREE SHIFTS — A → B
            ═══════════════════════════════════════════════ */}
        <section id="transformation" aria-label="The three shifts" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("sergeyIgnition.shiftsTitle")}</h2>
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-6">
            {[
              {
                fromKey: "sergeyIgnition.shift1From",
                toKey: "sergeyIgnition.shift1To",
                labelKey: "sergeyIgnition.shift1Label",
              },
              {
                fromKey: "sergeyIgnition.shift2From",
                toKey: "sergeyIgnition.shift2To",
                labelKey: "sergeyIgnition.shift2Label",
              },
              {
                fromKey: "sergeyIgnition.shift3From",
                toKey: "sergeyIgnition.shift3To",
                labelKey: "sergeyIgnition.shift3Label",
              },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <p className="text-xs text-white/40 uppercase tracking-widest">{t(item.labelKey)}</p>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
                  <p className="text-xs text-white/50 leading-relaxed italic">"{t(item.fromKey)}"</p>
                  <ArrowRight className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white/80 leading-relaxed">{t(item.toKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S6: REALITY CHECK
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-3" id="reality-check" aria-label="Reality check">
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-3">
            <p className="text-sm text-white/80 font-medium leading-relaxed">
              {t("sergeyIgnition.realityLine1")}<br />{t("sergeyIgnition.realityLine2")}
            </p>
            <p className="text-xs text-white/50 leading-relaxed">
              {t("sergeyIgnition.realitySub")}
            </p>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════
            S8: THE SPRINT — next step if it lands
            ═══════════════════════════════════════════════ */}
        <section id="the-path" aria-label="The path forward" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("sergeyIgnition.nextStepTitle")}</h2>
          <p className="text-xs text-white/50 text-center">{t("sergeyIgnition.nextStepSubtitle")}</p>
          <div className="space-y-3">
            {[
              {
                icon: <Compass className="w-4 h-4 text-white/70" />,
                stepKey: "sergeyIgnition.path1Step",
                titleKey: "sergeyIgnition.path1Title",
                descKey: "sergeyIgnition.path1Desc",
                tagKey: "sergeyIgnition.path1Tag",
              },
              {
                icon: <Flame className="w-4 h-4 text-white/70" />,
                stepKey: "sergeyIgnition.path2Step",
                titleKey: "sergeyIgnition.path2Title",
                descKey: "sergeyIgnition.path2Desc",
                tagKey: "sergeyIgnition.path2Tag",
              },
              {
                icon: <Star className="w-4 h-4 text-white/70" />,
                stepKey: "sergeyIgnition.path3Step",
                titleKey: "sergeyIgnition.path3Title",
                descKey: "sergeyIgnition.path3Desc",
                tagKey: "sergeyIgnition.path3Tag",
              },
            ].map((item, i) => (
              <div key={i} className="liquid-glass rounded-2xl p-5 flex items-start gap-4 hover:scale-[1.02] transition-transform duration-200">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-white/40 uppercase tracking-widest">{t(item.stepKey)}</p>
                    <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full">{t(item.tagKey)}</span>
                  </div>
                  <p className="text-sm text-white/95 font-medium mt-1">{t(item.titleKey)}</p>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">{t(item.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S9: ABOUT SERGEY — trust anchor
            ═══════════════════════════════════════════════ */}
        <section id="about-section" aria-label="About Sergey" className="relative pt-8">
          <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 mx-auto relative z-10 flex items-center justify-center text-2xl">
            🔥
          </div>
          <div className="liquid-glass rounded-3xl p-6 md:p-8 pt-14 -mt-10 text-center">
            <p className="text-sm text-white/70 leading-relaxed">
              &nbsp;
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              {t("sergeyIgnition.aboutPara1")}
            </p>
            <p className="text-sm text-white/80 leading-relaxed mt-3 font-medium">
              {t("sergeyIgnition.aboutButWrong")}
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              {t("sergeyIgnition.aboutPara2")}
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              {t("sergeyIgnition.aboutPara3")}
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              {t("sergeyIgnition.aboutPara4")}
            </p>
            <p className="text-xs text-white/55 mt-4">
              — <em style={{ fontFamily: "'Source Serif 4', serif" }}>Sergey Jay Makarov</em>
            </p>
            <p className="text-xs text-white/35 mt-1">
              {t("sergeyIgnition.aboutCredentials")}
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S10: FINAL CTA
            ═══════════════════════════════════════════════ */}
        <section className="liquid-glass-strong rounded-[2.5rem] p-8 md:p-10 text-center space-y-5" id="pricing-section" aria-label="Next step">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {t("sergeyIgnition.finalCtaTitle")}
            </h2>
            <p className="text-base text-white/70 font-medium">{t("sergeyIgnition.finalCtaBottleneck")}</p>
            <p className="text-xs text-white/45 mt-2">{t("sergeyIgnition.finalCtaFixThat")}</p>
          </div>

          <PrimaryCTA id="book-session-btn" />

          <div className="flex flex-col items-center gap-3 pt-1">
            <a
              href={CALCOM_CLARITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-glass inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm text-white/80 hover:text-white hover:scale-105 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              {t("sergeyIgnition.clarityCtaLabel")}
            </a>
          </div>

          <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed italic pt-2">
            {t("sergeyIgnition.finalCtaNote")}
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            S11: FAQ — glass accordions (tightened)
            ═══════════════════════════════════════════════ */}
        <section className="space-y-2" id="faq-section" aria-label="Frequently asked questions">
          <h2 className="text-lg font-medium text-white/90 text-center mb-4 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("sergeyIgnition.faqTitle")}</h2>
          {[
            { qKey: "sergeyIgnition.faq1Q", aKey: "sergeyIgnition.faq1A" },
            { qKey: "sergeyIgnition.faq2Q", aKey: "sergeyIgnition.faq2A" },
            { qKey: "sergeyIgnition.faq3Q", aKey: "sergeyIgnition.faq3A" },
            { qKey: "sergeyIgnition.faq4Q", aKey: "sergeyIgnition.faq4A" },
          ].map((faq, i) => (
            <div key={i} className="liquid-glass rounded-2xl">
              <button
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white/50 rounded-2xl"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                aria-controls={`faq-answer-${i}`}
              >
                <p className="text-sm text-white/75 font-medium">{t(faq.qKey)}</p>
                <ChevronDown className={`w-4 h-4 text-white/45 transition-transform duration-200 flex-shrink-0 ml-2 ${openFaq === i ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              <div
                id={`faq-answer-${i}`}
                role="region"
                className={`overflow-hidden transition-all duration-200 ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="px-4 pb-4">
                  <p className="text-xs text-white/50 leading-relaxed">{t(faq.aKey)}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ═══════════════════════════════════════════════
            S12: FOOTER BRIDGE
            ═══════════════════════════════════════════════ */}
        <div className="text-center space-y-3" id="bottom-cta">
          <div className="liquid-glass rounded-2xl p-5 max-w-md mx-auto">
            <p className="text-xs text-white/50 leading-relaxed">
              {t("sergeyIgnition.footerBridgeLine1")}<br />{t("sergeyIgnition.footerBridgeLine2")}
            </p>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  );

  if (inShell) return <GameShellV2>{content}</GameShellV2>;
  return content;
};

export default SergeyIgnition;

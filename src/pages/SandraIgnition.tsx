import { ArrowRight, Check, ShieldCheck, MessageCircle, ChevronDown, Star, Compass, Zap } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GameShellV2 from "@/components/game/GameShellV2";
import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";

/* ─── Sandra-specific links (placeholders until Sandra sets up) ─── */
const CALCOM_BOOKING_LINK = "#"; // Sandra's Cal.com link TBD
const CALCOM_CLARITY_LINK = "#"; // Sandra's clarity call link TBD

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
      {label ?? t("sandraIgnition.cta.bookDiscoveryCall")}
      <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
        <ArrowRight className="w-4 h-4" />
      </span>
    </a>
  );
};

const SandraIgnition = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const inShell = location.pathname.startsWith("/game/");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "The Future Is Already Speaking To You — Sandra Otto";
    return () => { document.title = previousTitle; };
  }, []);

  const content = (
    <div className="relative min-h-screen bg-black text-white overflow-hidden" id="sandra-page" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ═══════════════════════════════════════════════
          VIDEO BACKGROUND
          ═══════════════════════════════════════════════ */}
      <HlsBackground />
      <div className="fixed inset-0 bg-black/45 z-[1]" aria-hidden="true" />

      {/* ═══════════════════════════════════════════════
          CONTENT LAYER
          ═══════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-16 space-y-12">

        {/* ═══════════════════════════════════════════════
            S1: HERO — Recognition Trigger
            ═══════════════════════════════════════════════ */}
        <header className="text-center space-y-6 pt-4" id="sandra-hero">
          <p className="text-xs text-white/50 uppercase tracking-[0.25em]">{t("sandraIgnition.hero.eyebrow")}</p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.05em] text-white leading-[1.1]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {t("sandraIgnition.hero.titleBefore")}{" "}
            <span className="text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.2)" }}>
              {t("sandraIgnition.hero.titleEmphasis")}
            </span>
            <br />{t("sandraIgnition.hero.titleAfter")}
          </h1>

          <p className="text-base text-white/90 max-w-lg mx-auto leading-relaxed">
            {t("sandraIgnition.hero.lead")}
          </p>

          <p className="text-sm text-white/75 max-w-sm mx-auto leading-relaxed">
            {t("sandraIgnition.hero.subLead")}
          </p>

          <p className="text-xs text-white/55 max-w-sm mx-auto leading-relaxed italic">
            {t("sandraIgnition.hero.permissionLine1")}<br />{t("sandraIgnition.hero.permissionLine2")}
          </p>

          <div className="flex flex-col items-center gap-3 pt-2">
            <PrimaryCTA id="hero-cta-btn" />
            <span className="text-xs text-white/50">{t("sandraIgnition.hero.ctaNote")}</span>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            S2: QUALIFIER — Self-selection pills
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="qualifier" aria-label="Who this is for">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("sandraIgnition.qualifier.heading")}</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "sandraIgnition.qualifier.pill1",
              "sandraIgnition.qualifier.pill2",
              "sandraIgnition.qualifier.pill3",
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
            S3: MASTER RESULT — one sentence
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="master-result" aria-label="The master transformational result">
          <div className="liquid-glass-strong rounded-3xl p-6 md:p-8 space-y-4">
            <p className="text-xs text-white/40 uppercase tracking-widest">{t("sandraIgnition.masterResult.eyebrow")}</p>
            <p className="text-base md:text-lg text-white/95 leading-relaxed font-medium max-w-lg mx-auto">
              {t("sandraIgnition.masterResult.body")}
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S4: HOW IT WORKS — 3 glass step cards
            ═══════════════════════════════════════════════ */}
        <section className="space-y-5" id="how-it-works" aria-label="How it works">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("sandraIgnition.howItWorks.heading")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                emoji: "🔮",
                step: "1",
                titleKey: "sandraIgnition.howItWorks.step1.title",
                descKey: "sandraIgnition.howItWorks.step1.desc",
              },
              {
                emoji: "🌀",
                step: "2",
                titleKey: "sandraIgnition.howItWorks.step2.title",
                descKey: "sandraIgnition.howItWorks.step2.desc",
              },
              {
                emoji: "💎",
                step: "3",
                titleKey: "sandraIgnition.howItWorks.step3.title",
                descKey: "sandraIgnition.howItWorks.step3.desc",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="liquid-glass rounded-3xl p-5 text-center space-y-3 hover:scale-105 transition-transform duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto text-xl">
                  <span aria-hidden="true">{item.emoji}</span>
                </div>
                <p className="text-xs text-white/60 font-medium uppercase tracking-widest">{t("sandraIgnition.howItWorks.stepLabel", { step: item.step })}</p>
                <p className="text-sm text-white font-medium leading-snug">{t(item.titleKey)}</p>
                {item.descKey && <p className="text-xs text-white/55 leading-relaxed">{t(item.descKey)}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S5: DELIVERABLES — What you walk out with
            ═══════════════════════════════════════════════ */}
        <section id="deliverables" aria-label="Session deliverables" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("sandraIgnition.deliverables.heading")}</h2>
          <div className="liquid-glass-strong rounded-3xl p-6 md:p-8">
          <div className="space-y-4">
            {[
              {
                titleKey: "sandraIgnition.deliverables.item1.title",
                descKey: "sandraIgnition.deliverables.item1.desc"
              },
              {
                titleKey: "sandraIgnition.deliverables.item2.title",
                descKey: "sandraIgnition.deliverables.item2.desc"
              },
              {
                titleKey: "sandraIgnition.deliverables.item3.title",
                descKey: "sandraIgnition.deliverables.item3.desc"
              },
              {
                titleKey: "sandraIgnition.deliverables.item4.title",
                descKey: "sandraIgnition.deliverables.item4.desc"
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white/80" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-white/95 font-medium">{t(item.titleKey)}</p>
                  <p className="text-xs text-white/55 leading-relaxed mt-0.5">{t(item.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S6: THE TRANSFORMATION — A → B sub-results
            ═══════════════════════════════════════════════ */}
        <section id="transformation" aria-label="The transformation" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("sandraIgnition.transformation.heading")}</h2>
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-6">
            {[
              {
                fromKey: "sandraIgnition.transformation.shift1.from",
                toKey: "sandraIgnition.transformation.shift1.to",
                labelKey: "sandraIgnition.transformation.shift1.label"
              },
              {
                fromKey: "sandraIgnition.transformation.shift2.from",
                toKey: "sandraIgnition.transformation.shift2.to",
                labelKey: "sandraIgnition.transformation.shift2.label"
              },
              {
                fromKey: "sandraIgnition.transformation.shift3.from",
                toKey: "sandraIgnition.transformation.shift3.to",
                labelKey: "sandraIgnition.transformation.shift3.label"
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
            S7: THE PATH — Value Ladder silhouette
            ═══════════════════════════════════════════════ */}
        <section id="the-path" aria-label="The path forward" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("sandraIgnition.path.heading")}</h2>
          <div className="space-y-3">
            {[
              {
                icon: <Compass className="w-4 h-4 text-white/70" />,
                stepKey: "sandraIgnition.path.step1.step",
                titleKey: "sandraIgnition.path.step1.title",
                descKey: "sandraIgnition.path.step1.desc",
                tagKey: "sandraIgnition.path.step1.tag",
              },
              {
                icon: <Star className="w-4 h-4 text-white/70" />,
                stepKey: "sandraIgnition.path.step2.step",
                titleKey: "sandraIgnition.path.step2.title",
                descKey: "sandraIgnition.path.step2.desc",
                tagKey: "sandraIgnition.path.step2.tag",
              },
              {
                icon: <Zap className="w-4 h-4 text-white/70" />,
                stepKey: "sandraIgnition.path.step3.step",
                titleKey: "sandraIgnition.path.step3.title",
                descKey: "sandraIgnition.path.step3.desc",
                tagKey: "sandraIgnition.path.step3.tag",
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
            S8: ABOUT SANDRA — trust anchor
            ═══════════════════════════════════════════════ */}
        <section id="about-section" aria-label="About Sandra" className="relative pt-8">
          {/* Placeholder circle (Sandra can add her photo later) */}
          <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 mx-auto relative z-10 flex items-center justify-center text-2xl">
            ☀️
          </div>
          <div className="liquid-glass rounded-3xl p-6 md:p-8 pt-14 -mt-10 text-center">
            <p className="text-sm text-white/70 leading-relaxed">
              &nbsp;
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              {t("sandraIgnition.about.para1")}
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              {t("sandraIgnition.about.para2")}
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              {t("sandraIgnition.about.para3")}
            </p>
            <p className="text-xs text-white/55 mt-4">
              — <em style={{ fontFamily: "'Source Serif 4', serif" }}>Sandra Otto</em>
            </p>
            <p className="text-xs text-white/35 mt-1">
              {t("sandraIgnition.about.credentials")}
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S9: SOCIAL PROOF — myth line + resonance permission
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="social-proof" aria-label="The myth">
          <div className="liquid-glass rounded-3xl p-6 md:p-8">
            <p className="text-sm text-white/70 leading-relaxed italic max-w-md mx-auto">
              {t("sandraIgnition.socialProof.mythLine")}
            </p>
            <p className="text-xs text-white/40 mt-3">{t("sandraIgnition.socialProof.attribution")}</p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S10: PRICING — discovery call CTA + resonance permission
            ═══════════════════════════════════════════════ */}
        <section className="liquid-glass-strong rounded-[2.5rem] p-8 md:p-10 text-center space-y-5" id="pricing-section" aria-label="Next step">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {t("sandraIgnition.pricing.heading")}
            </h2>
            <p className="text-xs text-white/45">{t("sandraIgnition.pricing.subheading")}</p>
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
              {t("sandraIgnition.pricing.questionsLink")}
            </a>
          </div>

          {/* Resonance Permission Principle */}
          <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed italic pt-2">
            {t("sandraIgnition.pricing.resonancePermission")}
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            S11: FAQ — glass accordions
            ═══════════════════════════════════════════════ */}
        <section className="space-y-2" id="faq-section" aria-label="Frequently asked questions">
          <h2 className="text-lg font-medium text-white/90 text-center mb-4 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("sandraIgnition.faq.heading")}</h2>
          {[
            {
              qKey: "sandraIgnition.faq.q1.q",
              aKey: "sandraIgnition.faq.q1.a"
            },
            {
              qKey: "sandraIgnition.faq.q2.q",
              aKey: "sandraIgnition.faq.q2.a"
            },
            {
              qKey: "sandraIgnition.faq.q3.q",
              aKey: "sandraIgnition.faq.q3.a"
            },
            {
              qKey: "sandraIgnition.faq.q4.q",
              aKey: "sandraIgnition.faq.q4.a"
            },
            {
              qKey: "sandraIgnition.faq.q5.q",
              aKey: "sandraIgnition.faq.q5.a"
            },
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
            S12: BOTTOM CTA
            ═══════════════════════════════════════════════ */}
        <div className="text-center space-y-3" id="bottom-cta">
          <p className="text-sm text-white/65 max-w-sm mx-auto leading-relaxed">
            {t("sandraIgnition.bottomCta.line1")}<br />{t("sandraIgnition.bottomCta.line2")}
          </p>
          <PrimaryCTA id="bottom-cta-btn" />
        </div>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  );

  if (inShell) return <GameShellV2>{content}</GameShellV2>;
  return content;
};

export default SandraIgnition;

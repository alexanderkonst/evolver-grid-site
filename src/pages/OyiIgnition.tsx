import { ArrowRight, Check, MessageCircle, ChevronDown, Star, Compass, Flame, Eye, Heart, Shield } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GameShellV2 from "@/components/game/GameShellV2";
import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";

/* ─── Oyi-specific links (placeholders until Oyi sets up) ─── */
const CALCOM_BOOKING_LINK = "#"; // Oyi's booking link TBD
const CALCOM_CLARITY_LINK = "#"; // Oyi's clarity call link TBD

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
      {label ?? t("oyiIgnition.primaryCta.label")}
      <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
        <ArrowRight className="w-4 h-4" />
      </span>
    </a>
  );
};

const OyiIgnition = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const inShell = location.pathname.startsWith("/game/");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [expandedTestimonial, setExpandedTestimonial] = useState<number | null>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Sovereignty Restored — Oyi Sun";
    return () => { document.title = previousTitle; };
  }, []);

  const content = (
    <div className="relative min-h-screen bg-black text-white overflow-hidden" id="oyi-page" style={{ fontFamily: "'Poppins', sans-serif" }}>

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
            S1: HERO — Myth-level headline from artifacts at 9.9
            ═══════════════════════════════════════════════ */}
        <header className="text-center space-y-6 pt-4" id="oyi-hero">
          {/* Warm-arrival line — Generator distribution: they arrive from podcast / cipher / conversation */}
          <p className="text-xs text-white/40 italic">{t("oyiIgnition.hero.arrival")}</p>
          <p className="text-xs text-white/50 uppercase tracking-[0.25em]">{t("oyiIgnition.hero.eyebrow")}</p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.05em] text-white leading-[1.1]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {t("oyiIgnition.hero.headlineLine1")}
            <br />
            <span className="text-white/70 text-3xl md:text-4xl lg:text-5xl" style={{ textShadow: "0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1)" }}>
              {t("oyiIgnition.hero.headlineLine2")}
            </span>
          </h1>

          <p className="text-base text-white/90 max-w-lg mx-auto leading-relaxed">
            {t("oyiIgnition.hero.subhead")}
          </p>

          <div className="text-sm text-white/75 max-w-md mx-auto leading-relaxed space-y-3">
            <p>
              {t("oyiIgnition.hero.worlds1")}
            </p>
            <p>{t("oyiIgnition.hero.worlds2")}</p>
            <p>{t("oyiIgnition.hero.worlds3")}</p>
          </div>

          <div className="text-sm text-white/60 max-w-sm mx-auto leading-relaxed space-y-1">
            <p>{t("oyiIgnition.hero.alongTheWay")}</p>
            <p className="text-white/70">{t("oyiIgnition.hero.joyLeft")}</p>
            <p className="text-white/70">{t("oyiIgnition.hero.peaceLeft")}</p>
            <p className="text-white/70">{t("oyiIgnition.hero.lightFading")}</p>
          </div>

          <div className="liquid-glass rounded-2xl p-5 max-w-md mx-auto text-center space-y-3">
            <p className="text-sm text-white/90 leading-relaxed">
              {t("oyiIgnition.hero.promise")}
            </p>
            <p className="text-xs text-white/45 leading-relaxed">
              {t("oyiIgnition.hero.noFrameworks")}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <PrimaryCTA id="hero-cta-btn" />
            <span className="text-xs text-white/40">{t("oyiIgnition.hero.ctaNote")}</span>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            S2: QUALIFIER — Self-selection pills (upgraded with tribal differentiators)
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-4" id="qualifier" aria-label="Who this is for">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("oyiIgnition.qualifier.heading")}</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "oyiIgnition.qualifier.pill1",
              "oyiIgnition.qualifier.pill2",
              "oyiIgnition.qualifier.pill3",
              "oyiIgnition.qualifier.pill4",
              "oyiIgnition.qualifier.pill5",
              "oyiIgnition.qualifier.pill6",
              "oyiIgnition.qualifier.pill7",
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
            S3: ORIGIN HIT — compressed trust anchor (moved higher)
            The medicine IS the story. 3-sentence hit before mechanics.
            ═══════════════════════════════════════════════ */}
        <section className="text-center" id="origin-hit" aria-label="Who Oyi is">
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-3 max-w-lg mx-auto">
            <p className="text-sm text-white/85 leading-relaxed font-medium" style={{ fontFamily: "'Source Serif 4', serif" }}>
              {t("oyiIgnition.originHit.line1")}
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              {t("oyiIgnition.originHit.line2")}
            </p>
            <p className="text-xs text-white/40 mt-2">
              {t("oyiIgnition.originHit.attribution")}
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S4: WHAT HAPPENS — Read + Mirror + Reset
            ═══════════════════════════════════════════════ */}
        <section className="space-y-4" id="what-happens" aria-label="What happens in the session">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-medium text-white/90 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("oyiIgnition.whatHappens.heading")}</h2>
            <p className="text-xs text-white/50">{t("oyiIgnition.whatHappens.subhead")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                emoji: "👁",
                step: "1",
                titleKey: "oyiIgnition.whatHappens.step1.title",
                descKey: "oyiIgnition.whatHappens.step1.desc",
              },
              {
                emoji: "🪞",
                step: "2",
                titleKey: "oyiIgnition.whatHappens.step2.title",
                descKey: "oyiIgnition.whatHappens.step2.desc",
              },
              {
                emoji: "💊",
                step: "3",
                titleKey: "oyiIgnition.whatHappens.step3.title",
                descKey: "oyiIgnition.whatHappens.step3.desc",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="liquid-glass rounded-3xl p-5 text-center space-y-3 hover:scale-105 transition-transform duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto text-xl">
                  <span aria-hidden="true">{item.emoji}</span>
                </div>
                <p className="text-xs text-white/60 font-medium uppercase tracking-widest">{t("oyiIgnition.whatHappens.stepLabel", { step: item.step })}</p>
                <p className="text-sm text-white font-medium leading-snug">{t(item.titleKey)}</p>
                <p className="text-xs text-white/55 leading-relaxed">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S5: DELIVERABLES — Your Sovereignty Map
            ═══════════════════════════════════════════════ */}
        <section id="deliverables" aria-label="Session deliverables" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("oyiIgnition.deliverables.heading")}</h2>
          <div className="liquid-glass-strong rounded-3xl p-6 md:p-8">
            <p className="text-xs text-white/45 mb-4">{t("oyiIgnition.deliverables.label")}</p>
            <div className="space-y-4">
              {[
                "oyiIgnition.deliverables.item1",
                "oyiIgnition.deliverables.item2",
                "oyiIgnition.deliverables.item3",
                "oyiIgnition.deliverables.item4",
                "oyiIgnition.deliverables.item5",
              ].map((key, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white/80" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-white/95 font-medium">{t(key)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S6: THE THREE SHIFTS — A → B
            ═══════════════════════════════════════════════ */}
        <section id="transformation" aria-label="The three shifts" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("oyiIgnition.shifts.heading")}</h2>
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-6">
            {[
              {
                fromKey: "oyiIgnition.shifts.shift1.from",
                toKey: "oyiIgnition.shifts.shift1.to",
                labelKey: "oyiIgnition.shifts.shift1.label"
              },
              {
                fromKey: "oyiIgnition.shifts.shift2.from",
                toKey: "oyiIgnition.shifts.shift2.to",
                labelKey: "oyiIgnition.shifts.shift2.label"
              },
              {
                fromKey: "oyiIgnition.shifts.shift3.from",
                toKey: "oyiIgnition.shifts.shift3.to",
                labelKey: "oyiIgnition.shifts.shift3.label"
              },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <p className="text-xs text-white/40 uppercase tracking-widest">{t(item.labelKey)}</p>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
                  <p className="text-xs text-white/50 leading-relaxed italic">&ldquo;{t(item.fromKey)}&rdquo;</p>
                  <ArrowRight className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white/80 leading-relaxed">{t(item.toKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S7: REALITY CHECK
            ═══════════════════════════════════════════════ */}
        <section className="text-center space-y-3" id="reality-check" aria-label="Reality check">
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-3">
            <p className="text-sm text-white/80 font-medium leading-relaxed">
              {t("oyiIgnition.realityCheck.line1")}
            </p>
            <p className="text-xs text-white/50 leading-relaxed">
              {t("oyiIgnition.realityCheck.line2")}
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S8: PROOF — Real testimonials (replacing anonymous micro proof)
            ═══════════════════════════════════════════════ */}
        <section className="space-y-4" id="proof-section" aria-label="Testimonials">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("oyiIgnition.proof.heading")}</h2>
          <div className="space-y-3">
            {[
              {
                quoteKey: "oyiIgnition.proof.t1.quote",
                fullKey: "oyiIgnition.proof.t1.full",
                nameKey: "oyiIgnition.proof.t1.name",
                titleKey: "oyiIgnition.proof.t1.title",
              },
              {
                quoteKey: "oyiIgnition.proof.t2.quote",
                fullKey: "oyiIgnition.proof.t2.full",
                nameKey: "oyiIgnition.proof.t2.name",
                titleKey: "oyiIgnition.proof.t2.title",
              },
              {
                quoteKey: "oyiIgnition.proof.t3.quote",
                fullKey: "oyiIgnition.proof.t3.full",
                nameKey: "oyiIgnition.proof.t3.name",
                titleKey: "oyiIgnition.proof.t3.title",
              },
            ].map((item, i) => (
              <div key={i} className="liquid-glass rounded-2xl p-5 space-y-3">
                <p className="text-base text-white/90 leading-relaxed font-medium italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
                  &ldquo;{t(item.quoteKey)}&rdquo;
                </p>
                <button
                  onClick={() => setExpandedTestimonial(expandedTestimonial === i ? null : i)}
                  className="text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer underline underline-offset-2"
                >
                  {expandedTestimonial === i ? t("oyiIgnition.proof.less") : t("oyiIgnition.proof.fullStory")}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${expandedTestimonial === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="text-xs text-white/55 leading-relaxed italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
                    {t(item.fullKey)}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">🪷</div>
                  <div>
                    <p className="text-xs text-white/70 font-medium">{t(item.nameKey)}</p>
                    <p className="text-[10px] text-white/40">{t(item.titleKey)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S9: THE PATH — next step if it lands
            ═══════════════════════════════════════════════ */}
        <section id="the-path" aria-label="The path forward" className="space-y-4">
          <h2 className="text-lg font-medium text-white/90 text-center tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("oyiIgnition.path.heading")}</h2>
          <p className="text-xs text-white/50 text-center">{t("oyiIgnition.path.subhead")}</p>
          <div className="space-y-3">
            {[
              {
                icon: <Eye className="w-4 h-4 text-white/70" />,
                stepKey: "oyiIgnition.path.tier1.step",
                titleKey: "oyiIgnition.path.tier1.title",
                descKey: "oyiIgnition.path.tier1.desc",
                tag: "$555",
              },
              {
                icon: <Flame className="w-4 h-4 text-white/70" />,
                stepKey: "oyiIgnition.path.tier2.step",
                titleKey: "oyiIgnition.path.tier2.title",
                descKey: "oyiIgnition.path.tier2.desc",
                tag: "$5,000",
              },
              {
                icon: <Star className="w-4 h-4 text-white/70" />,
                stepKey: "oyiIgnition.path.tier3.step",
                titleKey: "oyiIgnition.path.tier3.title",
                descKey: "oyiIgnition.path.tier3.desc",
                tag: "$500/mo",
              },
            ].map((item, i) => (
              <div key={i} className="liquid-glass rounded-2xl p-5 flex items-start gap-4 hover:scale-[1.02] transition-transform duration-200">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-white/40 uppercase tracking-widest">{t(item.stepKey)}</p>
                    <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full">{item.tag}</span>
                  </div>
                  <p className="text-sm text-white/95 font-medium mt-1">{t(item.titleKey)}</p>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">{t(item.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S10: ABOUT OYI — full trust anchor (deep version)
            ═══════════════════════════════════════════════ */}
        <section id="about-section" aria-label="About Oyi" className="relative pt-8">
          <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 mx-auto relative z-10 flex items-center justify-center text-2xl">
            🪷
          </div>
          <div className="liquid-glass rounded-3xl p-6 md:p-8 pt-14 -mt-10 text-center space-y-3">
            <p className="text-sm text-white/80 leading-relaxed font-medium">
              {t("oyiIgnition.about.line1")}
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              {t("oyiIgnition.about.line2")}
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-2">
              {t("oyiIgnition.about.line3")}
            </p>
            <p className="text-xs text-white/55 leading-relaxed mt-2">
              {t("oyiIgnition.about.line4")}
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              {t("oyiIgnition.about.line5")}
            </p>
            <p className="text-xs text-white/55 mt-4">
              — <em style={{ fontFamily: "'Source Serif 4', serif" }}>Oyi Sun</em>
            </p>
            <p className="text-xs text-white/35 mt-1">
              {t("oyiIgnition.about.credentials")}
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            S11: FINAL CTA
            ═══════════════════════════════════════════════ */}
        <section className="liquid-glass-strong rounded-[2.5rem] p-8 md:p-10 text-center space-y-5" id="pricing-section" aria-label="Next step">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {t("oyiIgnition.finalCta.heading")}
            </h2>
            <p className="text-base text-white/70 font-medium">{t("oyiIgnition.finalCta.signal")}</p>
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
              {t("oyiIgnition.finalCta.questions")}
            </a>
          </div>

          <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed italic pt-2">
            {t("oyiIgnition.finalCta.disclaimer")}
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            S12: FAQ — glass accordions
            ═══════════════════════════════════════════════ */}
        <section className="space-y-2" id="faq-section" aria-label="Frequently asked questions">
          <h2 className="text-lg font-medium text-white/90 text-center mb-4 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("oyiIgnition.faq.heading")}</h2>
          {[
            {
              qKey: "oyiIgnition.faq.q1.q",
              aKey: "oyiIgnition.faq.q1.a"
            },
            {
              qKey: "oyiIgnition.faq.q2.q",
              aKey: "oyiIgnition.faq.q2.a"
            },
            {
              qKey: "oyiIgnition.faq.q3.q",
              aKey: "oyiIgnition.faq.q3.a"
            },
            {
              qKey: "oyiIgnition.faq.q4.q",
              aKey: "oyiIgnition.faq.q4.a"
            },
            {
              qKey: "oyiIgnition.faq.q5.q",
              aKey: "oyiIgnition.faq.q5.a"
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
                className={`overflow-hidden transition-all duration-200 ${openFaq === i ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="px-4 pb-4">
                  <p className="text-xs text-white/50 leading-relaxed">{t(faq.aKey)}</p>
                </div>
              </div>
            </div>
          ))}
        </section>



        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  );

  if (inShell) return <GameShellV2>{content}</GameShellV2>;
  return content;
};

export default OyiIgnition;

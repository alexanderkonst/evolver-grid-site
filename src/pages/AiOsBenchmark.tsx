import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, MessageCircle, Download } from "lucide-react";

/**
 * AiOsBenchmark — public benchmark page for AI OS v5.0.
 *
 * Single source of truth for the +42% claim. Pinned from the
 * /ai-os hero via the "See the +42% benchmark" ghost link, also
 * the destination Sasha will share when guerrilla-marketing the
 * proof (the side-by-side video + screenshot campaign).
 *
 * Mirrors docs/01-vision/ai_os_benchmark.md verbatim in content.
 * Web-native typography on the same dark-luminous canvas as /ai-os
 * so the transition feels native rather than marketing-y.
 */
const AiOsBenchmark = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const prevTitle = document.title;
        document.title = "AI OS — Same model, different conversation";
        // Belt + suspenders for the dark canvas: in-page fixed overlays
        // give the radial luminosity, body bg is the safety net for any
        // transient paint moments (page-enter fade, route transitions).
        const prevBg = document.body.style.background;
        const prevHtmlBg = document.documentElement.style.background;
        document.body.style.background = "hsl(228 35% 8%)";
        document.documentElement.style.background = "hsl(228 35% 8%)";
        return () => {
            document.title = prevTitle;
            document.body.style.background = prevBg;
            document.documentElement.style.background = prevHtmlBg;
        };
    }, []);

    return (
        <>
            {/* Day 52 (Sasha): dark luminous canvas pinned to viewport.
                GameShellV2 paints `bg-gradient-to-br from-white...` on its
                outer wrapper, which would bleach the page. These fixed
                divs sit inside the page's z-10 stacking context, above
                that wrapper but below the article content (which has its
                own positioning), so the dark canvas wins on every scroll
                position without competing with the type. */}
            <div
                aria-hidden="true"
                className="fixed inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 0%, hsl(252 40% 14%) 0%, hsl(228 35% 8%) 55%, hsl(228 40% 5%) 100%)",
                }}
            />
            <div
                aria-hidden="true"
                className="fixed inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at 30% 20%, hsla(252,70%,55%,0.18) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, hsla(40,70%,55%,0.10) 0%, transparent 60%)",
                }}
            />
            <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14" style={{ zIndex: 1 }}>
                {/* Back link */}
                <button
                    onClick={() => navigate("/ai-os")}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] mb-10 transition-colors duration-300"
                    style={{
                        color: "hsl(0 0% 100% / 0.55)",
                        textShadow: "0 0 12px rgba(0,0,0,0.85)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "hsl(0 0% 100% / 0.9)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "hsl(0 0% 100% / 0.55)";
                    }}
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {t("aiOsBenchmark.backToAiOs")}
                </button>

                {/* Headline */}
                <header className="mb-12">
                    <p
                        className="text-[11px] sm:text-xs uppercase tracking-[0.22em] font-medium mb-4"
                        style={{
                            color: "hsl(40 70% 80% / 0.85)",
                            textShadow: "0 0 14px rgba(244,212,114,0.35), 0 0 12px rgba(0,0,0,0.85)",
                        }}
                    >
                        AI OS · v5.0
                    </p>
                    <h1
                        className="font-display italic font-normal leading-[1.05] tracking-[-0.02em] mb-6"
                        style={{
                            fontSize: "clamp(2rem, 6vw, 3.6rem)",
                            color: "hsl(0 0% 100%)",
                            textShadow:
                                "0 0 50px rgba(132,96,234,0.45), 0 0 100px rgba(180,140,255,0.25), 0 2px 8px rgba(0,0,0,0.9)",
                        }}
                    >
                        {t("aiOsBenchmark.heroHeadline")}
                    </h1>
                    <p
                        className="text-base sm:text-lg leading-relaxed max-w-2xl"
                        style={{
                            color: "hsl(0 0% 100% / 0.82)",
                            textShadow: "0 0 14px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.7)",
                        }}
                    >
                        {t("aiOsBenchmark.heroIntro1")}
                    </p>
                    <p
                        className="text-base sm:text-lg leading-relaxed mt-3 max-w-2xl"
                        style={{
                            color: "hsl(0 0% 100% / 0.82)",
                            textShadow: "0 0 14px rgba(0,0,0,0.85)",
                        }}
                    >
                        {t("aiOsBenchmark.heroIntro2Before")}{" "}
                        <Highlight>{t("aiOsBenchmark.heroIntro2Highlight")}</Highlight>{" "}
                        {t("aiOsBenchmark.heroIntro2After")}
                    </p>
                    <p
                        className="text-base sm:text-lg leading-relaxed mt-3 max-w-2xl"
                        style={{
                            color: "hsl(0 0% 100% / 0.82)",
                            textShadow: "0 0 14px rgba(0,0,0,0.85)",
                        }}
                    >
                        {t("aiOsBenchmark.heroIntro3")}
                    </p>
                </header>

                {/* The felt difference */}
                <Section title={t("aiOsBenchmark.feltTitle")}>
                    <P>
                        {t("aiOsBenchmark.felt1Before")}{" "}
                        <em>{t("aiOsBenchmark.felt1Em")}</em>.
                    </P>
                    <P>
                        {t("aiOsBenchmark.felt2Before")} <em>{t("aiOsBenchmark.felt2Em")}</em>{" "}
                        {t("aiOsBenchmark.felt2After")}
                    </P>
                    <P>
                        {t("aiOsBenchmark.felt3")}
                    </P>
                    <P>
                        {t("aiOsBenchmark.felt4Before")}{" "}
                        <strong>{t("aiOsBenchmark.felt4Strong")}</strong>{" "}
                        {t("aiOsBenchmark.felt4After")}
                    </P>
                    <P>
                        {t("aiOsBenchmark.felt5")}
                    </P>
                </Section>

                {/* What this is */}
                <Section title={t("aiOsBenchmark.whatThisIsTitle")}>
                    <P>
                        {t("aiOsBenchmark.whatThisIs1Before")}{" "}
                        <em>{t("aiOsBenchmark.whatThisIs1Em")}</em>{" "}
                        {t("aiOsBenchmark.whatThisIs1After")}
                    </P>
                    <P>
                        {t("aiOsBenchmark.whatThisIs2")}
                    </P>
                </Section>

                {/* The setup */}
                <Section title={t("aiOsBenchmark.setupTitle")}>
                    <SetupTable />
                    <P>
                        {t("aiOsBenchmark.setup1Before")}{" "}
                        <strong>{t("aiOsBenchmark.setup1Strong")}</strong>{" "}
                        {t("aiOsBenchmark.setup1After")}
                    </P>
                    <P>
                        {t("aiOsBenchmark.setup2Before")}{" "}
                        <strong>{t("aiOsBenchmark.setup2Strong")}</strong>{" "}
                        {t("aiOsBenchmark.setup2After")}
                    </P>
                </Section>

                {/* Two test classes */}
                <Section title={t("aiOsBenchmark.twoTestsTitle")}>
                    <P>
                        {t("aiOsBenchmark.twoTestsIntro")}
                    </P>

                    <SubHeading>{t("aiOsBenchmark.miniHelmSubheading")}</SubHeading>
                    <P>
                        {t("aiOsBenchmark.miniHelmDesc")}
                    </P>
                    <Question>
                        {t("aiOsBenchmark.miniHelmQuestionBefore")}{" "}
                        <em>{t("aiOsBenchmark.miniHelmQuestionEm")}</em>{" "}
                        {t("aiOsBenchmark.miniHelmQuestionAfter")}
                    </Question>

                    <SubHeading>{t("aiOsBenchmark.sibSubheading")}</SubHeading>
                    <P>
                        {t("aiOsBenchmark.sibIntro")}
                    </P>
                    <Quote>
                        <strong>{t("aiOsBenchmark.sibQ1Label")}</strong>{" "}
                        {t("aiOsBenchmark.sibQ1Before")}{" "}
                        <em>{t("aiOsBenchmark.sibQ1Em")}</em>?
                        <br />
                        <strong>{t("aiOsBenchmark.sibQ2Label")}</strong>{" "}
                        {t("aiOsBenchmark.sibQ2Before")}{" "}
                        <em>{t("aiOsBenchmark.sibQ2Em")}</em>?
                        <br />
                        <strong>{t("aiOsBenchmark.sibQ3Label")}</strong>{" "}
                        {t("aiOsBenchmark.sibQ3Before")}{" "}
                        <em>{t("aiOsBenchmark.sibQ3Em")}</em>?
                        <br />
                        <strong>{t("aiOsBenchmark.sibQ4Label")}</strong>{" "}
                        {t("aiOsBenchmark.sibQ4Before")}{" "}
                        <em>{t("aiOsBenchmark.sibQ4Em")}</em>?
                    </Quote>
                    <P>
                        {t("aiOsBenchmark.sibScoring")}
                    </P>
                    <Question>
                        {t("aiOsBenchmark.sibQuestion")}
                    </Question>
                </Section>

                {/* Protocol */}
                <Section title={t("aiOsBenchmark.protocolTitle")}>
                    <ul
                        className="space-y-3 list-none pl-0"
                        style={{ color: "hsl(0 0% 100% / 0.82)" }}
                    >
                        <Bullet>
                            <strong>{t("aiOsBenchmark.protocol1Strong")}</strong>{" "}
                            {t("aiOsBenchmark.protocol1Text")}
                        </Bullet>
                        <Bullet>
                            <strong>{t("aiOsBenchmark.protocol2Strong")}</strong>{" "}
                            {t("aiOsBenchmark.protocol2Text")}
                        </Bullet>
                        <Bullet>
                            <strong>{t("aiOsBenchmark.protocol3Strong")}</strong>{" "}
                            {t("aiOsBenchmark.protocol3Text")}
                        </Bullet>
                        <Bullet>
                            <strong>{t("aiOsBenchmark.protocol4Strong")}</strong>{" "}
                            {t("aiOsBenchmark.protocol4Text")}
                        </Bullet>
                    </ul>
                </Section>

                {/* Results */}
                <Section title={t("aiOsBenchmark.resultsTitle")}>
                    <ResultsTable />
                    <P>{t("aiOsBenchmark.results1")}</P>
                    <P style={{ color: "hsl(40 70% 85% / 0.95)" }}>
                        <strong>{t("aiOsBenchmark.results2Strong")}</strong>
                    </P>
                    <P>
                        {t("aiOsBenchmark.results3Before")}{" "}
                        <strong>{t("aiOsBenchmark.results3Strong")}</strong>
                        {t("aiOsBenchmark.results3After")}
                    </P>
                    <P>
                        {t("aiOsBenchmark.results4Before")}{" "}
                        <strong>{t("aiOsBenchmark.results4Strong1")}</strong>{" "}
                        {t("aiOsBenchmark.results4Mid")}{" "}
                        <strong>{t("aiOsBenchmark.results4Strong2")}</strong>
                        {t("aiOsBenchmark.results4After")}
                    </P>
                </Section>

                {/* Compounding multiplier — Day 52 (Sasha 2026-04-26):
                    second within-family data point landed. Replicated the
                    SIB benchmark on Claude 4.6 and got +29%. Compared to
                    +42% on Opus 4.7, that's a 1.45× per-generation
                    multiplier on the scaffold's effect. This section makes
                    the cross-generation finding visible and projects the
                    next three Claude flagships under the assumption that
                    the multiplier holds. */}
                <Section title={t("aiOsBenchmark.multiplierTitle")}>
                    <P>
                        {t("aiOsBenchmark.multiplier1Before")}
                        <strong> {t("aiOsBenchmark.multiplier1Model")}</strong>{" "}
                        {t("aiOsBenchmark.multiplier1Mid")}{" "}
                        <Highlight>{t("aiOsBenchmark.multiplier1Highlight")}</Highlight>
                        {t("aiOsBenchmark.multiplier1After")}
                    </P>
                    <MultiplierTable />
                    <P>
                        {t("aiOsBenchmark.multiplier2Before")}{" "}
                        <Highlight>{t("aiOsBenchmark.multiplier2Highlight")}</Highlight>{" "}
                        {t("aiOsBenchmark.multiplier2Mid")}{" "}
                        <strong>{t("aiOsBenchmark.multiplier2Strong")}</strong>
                        {t("aiOsBenchmark.multiplier2After")}
                    </P>
                    <P>
                        {t("aiOsBenchmark.multiplier3")}
                    </P>
                    <ProjectionTable />
                    <P>
                        {t("aiOsBenchmark.multiplier4")}
                    </P>
                    <ul className="space-y-3 list-none pl-0" style={{ color: "hsl(0 0% 100% / 0.82)" }}>
                        <Bullet>
                            <strong>{t("aiOsBenchmark.multiplierBullet1Strong")}</strong>{" "}
                            {t("aiOsBenchmark.multiplierBullet1Before")}{" "}
                            <em>{t("aiOsBenchmark.multiplierBullet1Em")}</em>
                            {t("aiOsBenchmark.multiplierBullet1After")}
                        </Bullet>
                        <Bullet>
                            <strong>{t("aiOsBenchmark.multiplierBullet2Strong")}</strong>{" "}
                            {t("aiOsBenchmark.multiplierBullet2Before")}{" "}
                            <em>{t("aiOsBenchmark.multiplierBullet2Em")}</em>
                            {t("aiOsBenchmark.multiplierBullet2After")}
                        </Bullet>
                        <Bullet>
                            <strong>{t("aiOsBenchmark.multiplierBullet3Strong")}</strong>{" "}
                            {t("aiOsBenchmark.multiplierBullet3Text")}
                        </Bullet>
                    </ul>
                    <P>
                        {t("aiOsBenchmark.multiplier5Before")}{" "}
                        <strong>{t("aiOsBenchmark.multiplier5Strong")}</strong>
                        {t("aiOsBenchmark.multiplier5After")}
                    </P>
                </Section>

                {/* What this means */}
                <Section title={t("aiOsBenchmark.meansTitle")}>
                    <P>
                        {t("aiOsBenchmark.means1")}
                    </P>
                    <P>
                        {t("aiOsBenchmark.means2Before")}{" "}
                        <em>{t("aiOsBenchmark.means2Em1")}</em>{" "}
                        {t("aiOsBenchmark.means2Mid")}{" "}
                        <em>{t("aiOsBenchmark.means2Em2")}</em>{" "}
                        {t("aiOsBenchmark.means2After")}
                    </P>
                </Section>

                {/* Limits */}
                <Section title={t("aiOsBenchmark.limitsTitle")}>
                    <P>
                        {t("aiOsBenchmark.limitsIntro")}
                    </P>
                    <ul className="space-y-3 list-none pl-0" style={{ color: "hsl(0 0% 100% / 0.82)" }}>
                        <Bullet>
                            <strong>{t("aiOsBenchmark.limit1Strong")}</strong>{" "}
                            {t("aiOsBenchmark.limit1Before")}{" "}
                            <em>{t("aiOsBenchmark.limit1Em1")}</em>{" "}
                            {t("aiOsBenchmark.limit1Mid")}{" "}
                            <em>{t("aiOsBenchmark.limit1Em2")}</em>{" "}
                            {t("aiOsBenchmark.limit1After")}
                        </Bullet>
                        <Bullet>
                            <strong>{t("aiOsBenchmark.limit2Strong")}</strong>{" "}
                            {t("aiOsBenchmark.limit2Text")}
                        </Bullet>
                        <Bullet>
                            <strong>{t("aiOsBenchmark.limit3Strong")}</strong>{" "}
                            {t("aiOsBenchmark.limit3Text")}
                        </Bullet>
                        <Bullet>
                            <strong>{t("aiOsBenchmark.limit4Strong")}</strong>{" "}
                            {t("aiOsBenchmark.limit4Text")}
                        </Bullet>
                        <Bullet>
                            <strong>{t("aiOsBenchmark.limit5Strong")}</strong>{" "}
                            {t("aiOsBenchmark.limit5Text")}
                        </Bullet>
                    </ul>
                    <P>
                        {t("aiOsBenchmark.limitsOutro1Before")}{" "}
                        <em>{t("aiOsBenchmark.limitsOutro1Em")}</em>{" "}
                        {t("aiOsBenchmark.limitsOutro1After")}
                    </P>
                    <P>{t("aiOsBenchmark.limitsOutro2")}</P>
                </Section>

                {/* Why measurement isn't the whole story */}
                <Section title={t("aiOsBenchmark.whyTitle")}>
                    <P>
                        {t("aiOsBenchmark.why1Before")}
                        <strong>{t("aiOsBenchmark.why1Strong")}</strong>
                        {t("aiOsBenchmark.why1After")}
                    </P>
                    <P>
                        {t("aiOsBenchmark.why2")}
                    </P>
                    <P>
                        {t("aiOsBenchmark.why3Before")}{" "}
                        <strong>
                            {t("aiOsBenchmark.why3Strong")}
                        </strong>{" "}
                        {t("aiOsBenchmark.why3After")}
                    </P>
                    <P>
                        {t("aiOsBenchmark.why4Before")}{" "}
                        <em>{t("aiOsBenchmark.why4Em")}</em>{" "}
                        {t("aiOsBenchmark.why4After")}
                    </P>
                </Section>

                {/* When v6 ships */}
                <Section title={t("aiOsBenchmark.v6Title")}>
                    <Quote>
                        {t("aiOsBenchmark.v6Quote")}
                    </Quote>
                    <P>
                        {t("aiOsBenchmark.v6Body")}
                    </P>
                </Section>

                {/* Replicate / footer */}
                <Section title={t("aiOsBenchmark.replicateTitle")}>
                    <P>
                        {t("aiOsBenchmark.replicateBody")}
                    </P>
                    <p
                        className="text-sm sm:text-base mt-4"
                        style={{ color: "hsl(0 0% 100% / 0.82)" }}
                    >
                        <strong>{t("aiOsBenchmark.replicateLicensing")}</strong>
                    </p>
                </Section>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-12 pb-4">
                    <button
                        onClick={() => navigate("/ai-os")}
                        className="inline-flex items-center gap-2 text-sm font-medium tracking-wide px-6 py-3 rounded-full transition-all duration-300 hover:scale-[1.04] group"
                        style={{
                            background:
                                "linear-gradient(135deg, hsla(252, 70%, 70%, 0.32) 0%, hsla(242, 60%, 60%, 0.22) 100%)",
                            border: "1px solid hsla(252, 60%, 80%, 0.45)",
                            color: "hsl(0 0% 100%)",
                            textShadow: "0 0 14px rgba(132,96,234,0.6), 0 1px 4px rgba(0,0,0,0.5)",
                            boxShadow:
                                "0 0 0 1px hsla(252, 70%, 80%, 0.15), 0 8px 28px -10px rgba(132,96,234,0.55), 0 0 36px -10px rgba(180,140,255,0.4)",
                        }}
                    >
                        <Download className="w-4 h-4" />
                        {t("aiOsBenchmark.ctaInstall")}
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </button>
                    <a
                        href="https://t.me/integralevolution"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium tracking-wide px-6 py-3 rounded-full transition-all duration-300 hover:scale-[1.04]"
                        style={{
                            background:
                                "linear-gradient(135deg, hsla(40, 70%, 55%, 0.20) 0%, hsla(40, 60%, 45%, 0.10) 100%)",
                            border: "1px solid hsla(40, 70%, 65%, 0.40)",
                            color: "hsl(40 70% 92%)",
                            textShadow: "0 0 14px rgba(244,212,114,0.45), 0 1px 4px rgba(0,0,0,0.5)",
                            boxShadow: "0 0 0 1px hsla(40, 70%, 65%, 0.12), 0 8px 24px -12px rgba(244,212,114,0.4)",
                        }}
                    >
                        <MessageCircle className="w-4 h-4" />
                        {t("aiOsBenchmark.ctaReplicate")}
                    </a>
                </div>

                <p
                    className="text-center text-xs mt-6 italic"
                    style={{ color: "hsl(0 0% 100% / 0.55)" }}
                >
                    — Aleksandr Konstantinov
                </p>
            </div>
        </>
    );
};

// — Typography helpers ———————————————————————————————————

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-10 sm:mb-12">
        <h2
            className="font-display text-xl sm:text-2xl font-semibold mb-4 sm:mb-5 leading-tight"
            style={{
                color: "hsl(0 0% 100% / 0.96)",
                textShadow: "0 0 24px rgba(132,96,234,0.32), 0 0 12px rgba(0,0,0,0.85)",
            }}
        >
            {title}
        </h2>
        <div className="space-y-4">{children}</div>
    </section>
);

const SubHeading = ({ children }: { children: React.ReactNode }) => (
    <h3
        className="text-[11px] sm:text-xs uppercase tracking-[0.2em] font-medium mt-5 mb-2"
        style={{
            color: "hsl(40 70% 80% / 0.85)",
            textShadow: "0 0 12px rgba(0,0,0,0.85)",
        }}
    >
        {children}
    </h3>
);

const P = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <p
        className="text-base sm:text-[17px] leading-relaxed"
        style={{
            color: "hsl(0 0% 100% / 0.82)",
            textShadow: "0 0 12px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.7)",
            ...style,
        }}
    >
        {children}
    </p>
);

const Quote = ({ children }: { children: React.ReactNode }) => (
    <blockquote
        className="border-l-2 pl-5 py-2 my-3 text-base sm:text-[17px] leading-relaxed italic"
        style={{
            borderColor: "hsl(40 70% 65% / 0.45)",
            color: "hsl(0 0% 100% / 0.88)",
            textShadow: "0 0 12px rgba(0,0,0,0.6)",
        }}
    >
        {children}
    </blockquote>
);

const Question = ({ children }: { children: React.ReactNode }) => (
    <p
        className="text-sm sm:text-base leading-relaxed pl-4 my-2"
        style={{
            color: "hsl(252 35% 88% / 0.85)",
            textShadow: "0 0 10px rgba(0,0,0,0.7)",
            borderLeft: "2px solid hsl(252 50% 65% / 0.4)",
            paddingLeft: "1rem",
        }}
    >
        → <em>Question:</em> {children}
    </p>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
    <li
        className="text-base sm:text-[17px] leading-relaxed pl-5 relative"
        style={{
            textShadow: "0 0 12px rgba(0,0,0,0.6)",
        }}
    >
        <span
            aria-hidden="true"
            className="absolute left-0 top-[0.7em] w-2 h-px"
            style={{ background: "hsl(40 70% 75% / 0.6)" }}
        />
        {children}
    </li>
);

const Highlight = ({ children }: { children: React.ReactNode }) => (
    <span
        className="font-semibold"
        style={{
            color: "hsl(40 80% 80%)",
            textShadow: "0 0 14px rgba(244,212,114,0.5), 0 1px 4px rgba(0,0,0,0.6)",
        }}
    >
        {children}
    </span>
);

// — Setup table ————————————————————————————————————————

const SetupTable = () => {
    const { t } = useTranslation();
    return (
    <div
        className="rounded-xl overflow-hidden my-2"
        style={{
            background: "hsl(0 0% 100% / 0.04)",
            border: "1px solid hsl(0 0% 100% / 0.08)",
            backdropFilter: "blur(8px)",
        }}
    >
        <table className="w-full text-sm sm:text-base">
            <tbody>
                {[
                    ["setupRow1Label", "setupRow1Value"],
                    ["setupRow2Label", "setupRow2Value"],
                    ["setupRow3Label", "setupRow3Value"],
                    ["setupRow4Label", "setupRow4Value"],
                    ["setupRow5Label", "setupRow5Value"],
                ].map(([labelKey, valueKey], i, arr) => (
                    <tr
                        key={labelKey}
                        style={{
                            borderBottom:
                                i < arr.length - 1 ? "1px solid hsl(0 0% 100% / 0.06)" : "none",
                        }}
                    >
                        <td
                            className="px-4 py-3 align-top font-medium whitespace-nowrap"
                            style={{
                                color: "hsl(40 70% 80% / 0.85)",
                                width: "1%",
                                fontSize: "0.78rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            {t(`aiOsBenchmark.${labelKey}`)}
                        </td>
                        <td className="px-4 py-3 align-top" style={{ color: "hsl(0 0% 100% / 0.85)" }}>
                            {t(`aiOsBenchmark.${valueKey}`)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    );
};

// — Multiplier tables (Day 52) ————————————————————————————

const MultiplierTable = () => {
    const { t } = useTranslation();
    return (
    <div
        className="rounded-xl overflow-x-auto my-2"
        style={{
            background: "hsl(0 0% 100% / 0.04)",
            border: "1px solid hsl(0 0% 100% / 0.08)",
            backdropFilter: "blur(8px)",
        }}
    >
        <table className="w-full text-sm sm:text-base">
            <thead>
                <tr style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.12)" }}>
                    <th
                        className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        {t("aiOsBenchmark.multiplierTableHeadModel")}
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        {t("aiOsBenchmark.multiplierTableHeadLift")}
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        {t("aiOsBenchmark.multiplierTableHeadSource")}
                    </th>
                </tr>
            </thead>
            <tbody>
                {[
                    { model: "Claude 4.6", lift: "+29%", source: t("aiOsBenchmark.multiplierTableSourceMeasured") },
                    { model: "Claude Opus 4.7", lift: "+42%", source: t("aiOsBenchmark.multiplierTableSourceThisBenchmark") },
                ].map((row, i, arr) => (
                    <tr
                        key={row.model}
                        style={{
                            borderBottom:
                                i < arr.length - 1 ? "1px solid hsl(0 0% 100% / 0.06)" : "none",
                        }}
                    >
                        <td
                            className="px-4 py-3 font-medium"
                            style={{ color: "hsl(0 0% 100% / 0.92)" }}
                        >
                            {row.model}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums font-semibold"
                            style={{
                                color: "hsl(40 80% 80%)",
                                textShadow: "0 0 12px rgba(244,212,114,0.4)",
                            }}
                        >
                            {row.lift}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums"
                            style={{ color: "hsl(0 0% 100% / 0.6)" }}
                        >
                            {row.source}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    );
};

const ProjectionTable = () => {
    const { t } = useTranslation();
    return (
    <div
        className="rounded-xl overflow-x-auto my-2"
        style={{
            background: "hsl(0 0% 100% / 0.04)",
            border: "1px solid hsl(0 0% 100% / 0.08)",
            backdropFilter: "blur(8px)",
        }}
    >
        <table className="w-full text-sm sm:text-base">
            <thead>
                <tr style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.12)" }}>
                    <th
                        className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        {t("aiOsBenchmark.projectionTableHeadGeneration")}
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        {t("aiOsBenchmark.projectionTableHeadLift")}
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        {t("aiOsBenchmark.projectionTableHeadMath")}
                    </th>
                </tr>
            </thead>
            <tbody>
                {[
                    { gen: t("aiOsBenchmark.projectionRow1Gen"), lift: "+29%", math: "—", projected: false },
                    { gen: t("aiOsBenchmark.projectionRow2Gen"), lift: "+42%", math: "29 × 1.45", projected: false },
                    { gen: t("aiOsBenchmark.projectionRow3Gen"), lift: "+61%", math: "42 × 1.45 = 60.9", projected: true },
                    { gen: t("aiOsBenchmark.projectionRow4Gen"), lift: "+88%", math: "60.9 × 1.45 = 88.3", projected: true },
                    { gen: t("aiOsBenchmark.projectionRow5Gen"), lift: "+128%", math: "88.3 × 1.45 = 128.0 †", projected: true },
                ].map((row, i, arr) => (
                    <tr
                        key={row.gen}
                        style={{
                            borderBottom:
                                i < arr.length - 1 ? "1px solid hsl(0 0% 100% / 0.06)" : "none",
                            background: row.projected ? "hsla(252, 50%, 60%, 0.04)" : undefined,
                        }}
                    >
                        <td
                            className="px-4 py-3 font-medium"
                            style={{
                                color: row.projected ? "hsl(252 50% 88% / 0.92)" : "hsl(0 0% 100% / 0.92)",
                            }}
                        >
                            {row.gen}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums font-semibold"
                            style={{
                                color: row.projected ? "hsl(252 60% 82%)" : "hsl(40 80% 80%)",
                                textShadow: row.projected
                                    ? "0 0 12px rgba(132,96,234,0.4)"
                                    : "0 0 12px rgba(244,212,114,0.4)",
                            }}
                        >
                            {row.lift}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums text-xs"
                            style={{ color: "hsl(0 0% 100% / 0.55)" }}
                        >
                            {row.math}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <p
            className="px-4 py-3 text-xs italic"
            style={{
                color: "hsl(0 0% 100% / 0.55)",
                borderTop: "1px solid hsl(0 0% 100% / 0.06)",
            }}
        >
            {t("aiOsBenchmark.projectionFootnote")}
        </p>
    </div>
    );
};

// — Results table ——————————————————————————————————————

const ResultsTable = () => {
    const { t } = useTranslation();
    return (
    <div
        className="rounded-xl overflow-x-auto my-2"
        style={{
            background: "hsl(0 0% 100% / 0.04)",
            border: "1px solid hsl(0 0% 100% / 0.08)",
            backdropFilter: "blur(8px)",
        }}
    >
        <table className="w-full text-sm sm:text-base">
            <thead>
                <tr style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.12)" }}>
                    <th
                        className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        {t("aiOsBenchmark.resultsTableHeadMetric")}
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        {t("aiOsBenchmark.resultsTableHeadNoScaffold")}
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        {t("aiOsBenchmark.resultsTableHeadWithScaffold")}
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        {t("aiOsBenchmark.resultsTableHeadDelta")}
                    </th>
                </tr>
            </thead>
            <tbody>
                {[
                    {
                        id: "sib",
                        metric: t("aiOsBenchmark.resultsRowSibMetric"),
                        baseline: "67 / 100",
                        scaffold: "95 / 100",
                        delta: t("aiOsBenchmark.resultsRowSibDelta"),
                        highlight: true,
                    },
                    {
                        id: "stage",
                        metric: t("aiOsBenchmark.resultsRowStageMetric"),
                        baseline: "3.36",
                        scaffold: "4.50",
                        delta: t("aiOsBenchmark.resultsRowStageDelta"),
                        highlight: true,
                    },
                    {
                        id: "helmTime",
                        metric: t("aiOsBenchmark.resultsRowHelmTimeMetric"),
                        baseline: "248 s",
                        scaffold: "197 s",
                        delta: "−20.6%",
                        highlight: false,
                    },
                    {
                        id: "helmScore",
                        metric: t("aiOsBenchmark.resultsRowHelmScoreMetric"),
                        baseline: "96.0",
                        scaffold: "91.3",
                        delta: t("aiOsBenchmark.resultsRowHelmScoreDelta"),
                        highlight: false,
                    },
                ].map((row, i, arr) => (
                    <tr
                        key={row.id}
                        style={{
                            borderBottom:
                                i < arr.length - 1 ? "1px solid hsl(0 0% 100% / 0.06)" : "none",
                        }}
                    >
                        <td
                            className="px-4 py-3 font-medium"
                            style={{ color: "hsl(0 0% 100% / 0.92)" }}
                        >
                            {row.metric}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums"
                            style={{ color: "hsl(0 0% 100% / 0.7)" }}
                        >
                            {row.baseline}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums"
                            style={{ color: "hsl(0 0% 100% / 0.7)" }}
                        >
                            {row.scaffold}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums font-semibold"
                            style={{
                                color: row.highlight ? "hsl(40 80% 80%)" : "hsl(0 0% 100% / 0.7)",
                                textShadow: row.highlight
                                    ? "0 0 12px rgba(244,212,114,0.4)"
                                    : undefined,
                            }}
                        >
                            {row.delta}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    );
};

export default AiOsBenchmark;

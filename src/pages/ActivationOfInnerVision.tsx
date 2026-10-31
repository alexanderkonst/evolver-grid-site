/**
 * ActivationOfInnerVision — advanced micro-course in the GROW space.
 * Route: /grow/activation-of-inner-vision (public, no auth).
 * Content: src/data/courses/activationOfInnerVision.ts; player: CoursePage.
 * Until the first video is uploaded (all ids "TBD"), CoursePage has nothing
 * to play, so this page shows the course contents instead.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaitlistModal from "@/components/WaitlistModal";
import CoursePage from "@/pages/CoursePage";
import SEO from "@/components/SEO";
import { ACTIVATION_OF_INNER_VISION as COURSE, AIV_COURSE_PATH } from "@/data/courses/activationOfInnerVision";
import { getPublishedModules } from "@/lib/coursePlayer";
import { GOLD_TEXT_STYLE } from "@/lib/landingDesign";
import { BODY_STYLE, EYEBROW_STYLE, TITLE_STYLE } from "@/pages/Library";

const CARD_STYLE: React.CSSProperties = {
    boxShadow: "0 8px 24px -12px rgba(10, 22, 40, 0.18), 0 0 0 1px rgba(212, 175, 55, 0.22)",
};

const ActivationOfInnerVision = () => {
    const { t } = useTranslation();
    const [notifyOpen, setNotifyOpen] = useState(false);
    const seo = (
        <SEO
            title="Activation of Inner Vision | Advanced micro-course"
            description="An advanced micro-course on 27-perspective seeing, by Aleksandr Konstantinov. Unlocks after Integral Mystery School."
            path={AIV_COURSE_PATH}
        />
    );

    if (getPublishedModules(COURSE.modules).length > 0) {
        return (
            <>
                {seo}
                <CoursePage course={COURSE} />
            </>
        );
    }

    return (
        <>
            {seo}
            <div className="p-4 pb-24 sm:p-6 lg:p-10 lg:pb-12 max-w-3xl mx-auto">
                <header className="mb-8">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4" style={{ color: "rgba(160, 109, 8, 0.85)" }} />
                        <span className="text-[10.5px]" style={EYEBROW_STYLE}>
                            {t("courseAiv.eyebrow")}
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.08] mb-2" style={TITLE_STYLE}>
                        <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
                            {COURSE.title}
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg italic max-w-2xl" style={BODY_STYLE}>
                        {t("courseAiv.tagline")}
                    </p>
                    <p className="text-sm sm:text-base max-w-2xl mt-3" style={BODY_STYLE}>
                        {t("courseAiv.lead")}
                    </p>
                </header>

                <div className="rounded-2xl p-5 sm:p-6 liquid-glass-strong" style={CARD_STYLE}>
                    <div className="flex items-center justify-between mb-4 gap-3">
                        <span className="text-[10.5px]" style={EYEBROW_STYLE}>
                            {t("course.contents")}
                        </span>
                        <span className="text-xs" style={BODY_STYLE}>
                            {t("courseAiv.inProduction")}
                        </span>
                    </div>
                    <ol className="space-y-5">
                        {COURSE.modules.map((m, mi) => (
                            <li key={m.id}>
                                <div className="text-sm font-semibold mb-2" style={TITLE_STYLE}>
                                    {mi + 1}. {m.title}
                                </div>
                                <ul className="space-y-1.5">
                                    {m.episodes.map((e) => (
                                        <li key={e.code} className="flex gap-3 text-sm" style={BODY_STYLE}>
                                            <span className="tabular-nums opacity-60 shrink-0">{e.code}</span>
                                            <span>{e.title}</span>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Issue #270: the one primary action while the videos are in production. Reuses the
                    existing waitlist capture (send-waitlist-email); no payment. */}
                <div className="mt-6 flex flex-col items-start gap-2">
                    <Button type="button" size="lg" onClick={() => setNotifyOpen(true)}>
                        {t("courseAiv.notifyCta", { defaultValue: "Notify me when ready" })}
                    </Button>
                    <p className="text-xs" style={BODY_STYLE}>
                        {t("courseAiv.notifyHint", { defaultValue: "One email when the first video is live. No payment." })}
                    </p>
                </div>
                <WaitlistModal isOpen={notifyOpen} onClose={() => setNotifyOpen(false)} moduleName={COURSE.title} />

                <p className="text-sm mt-6" style={BODY_STYLE}>
                    {t("courseAiv.paperPrefix")}{" "}
                    <a href="/27" className="underline underline-offset-2">
                        27-Perspective Vision
                    </a>
                    .
                </p>
            </div>
        </>
    );
};

export default ActivationOfInnerVision;

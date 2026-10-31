/**
 * ActivationOfInnerVision — advanced micro-course in the GROW space.
 * Route: /grow/activation-of-inner-vision (public, no auth).
 * Content: src/data/courses/activationOfInnerVision.ts; player: CoursePage
 * (it shows the course eyebrow, which carries the display-only $27, and lists
 * the not-yet-uploaded episode as "Coming soon"). This wrapper adds the SEO
 * block and the quiet link to the /27 paper.
 */
import { useTranslation } from "react-i18next";
import CoursePage from "@/pages/CoursePage";
import SEO from "@/components/SEO";
import { ACTIVATION_OF_INNER_VISION as COURSE, AIV_COURSE_PATH } from "@/data/courses/activationOfInnerVision";
import { BODY_STYLE } from "@/pages/Library";

const ActivationOfInnerVision = () => {
    const { t } = useTranslation();

    return (
        <>
            <SEO
                title="Activation of Inner Vision | Advanced micro-course"
                description="An advanced micro-course on 27-perspective seeing, by Aleksandr Konstantinov. Unlocks after Integral Mystery School."
                path={AIV_COURSE_PATH}
            />
            <CoursePage course={COURSE} />
            <p className="px-4 pb-24 sm:px-6 lg:px-10 lg:pb-12 max-w-6xl mx-auto text-sm" style={BODY_STYLE}>
                {t("courseAiv.paperPrefix")}{" "}
                <a href="/27" className="underline underline-offset-2">
                    27-Perspective Vision
                </a>
                .
            </p>
        </>
    );
};

export default ActivationOfInnerVision;

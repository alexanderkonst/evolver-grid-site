import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import PromptButtonCard from "@/components/mini-training/PromptButtonCard";
import { fillAskPrompt, type CourseAskContext } from "@/lib/courseAskAi";

/**
 * The Ask AI card after an episode's video (docs/templates/course-from-source.md: video first, then
 * the button). It reuses the mini-training PromptButtonCard: the prompt is filled from the platform's
 * own knowledge of the person (src/lib/courseAskAi.ts), editable, and Copy takes it to any AI.
 *
 * Send is held back on purpose: this release makes no AI-gateway call (issue #551, not in scope),
 * so the card says so and offers Copy.
 */
const CourseAskAiCard = ({ code, prompt, context }: { code: string; prompt: string; context: CourseAskContext }) => {
    const { t } = useTranslation();
    // The prompt is read once per episode and per profile; it is not re-filled while the person types.
    const filled = useMemo(() => fillAskPrompt(prompt, context), [prompt, context]);

    return (
        <PromptButtonCard
            testId={`ask-ai-${code}`}
            title={t("course.askAi.title")}
            prompt={filled}
            copyText={(text) => text}
            onSend={() => undefined}
            sendDisabledReason={t("course.askAi.sendSoon")}
        />
    );
};

export default CourseAskAiCard;

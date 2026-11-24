/**
 * PromptReceives — «What your AI receives»: the parts of the prompt the player is about to hand over
 * (About me, My work, AI OS) with an approximate size, the note that a long paste may arrive as an
 * attachment, a first message to send after pasting, and an optional preview of the text itself.
 * It reads the same `state` the button copies from, so the list and the clipboard cannot disagree (AI-02).
 */
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { approxWords } from "./promptSize";
import type { FamiliarState } from "./types";

const PromptReceives = ({ state }: { state: FamiliarState }) => {
  const { t, i18n } = useTranslation();
  const previewId = useId();
  const [preview, setPreview] = useState(false);
  const number = (n: number) => n.toLocaleString(i18n.language);
  const hasAbout = state.parts.some((p) => p.key === "aboutMe");

  return (
    <section
      className="mt-6 w-full max-w-md text-left"
      aria-label={t("familiar.receives.title", { defaultValue: "What your AI receives" })}
      data-receives
    >
      <h2 className="mf__eyebrow m-0" style={{ textAlign: "left" }}>
        {t("familiar.receives.title", { defaultValue: "What your AI receives" })}
      </h2>
      <ul className="m-0 mt-2 flex list-none flex-col gap-1 p-0 text-sm" style={{ color: "var(--vl-ink)" }}>
        {state.parts.map((p) => (
          <li key={p.key} className="flex justify-between gap-4" data-part={p.key}>
            <span>
              {t(`familiar.receives.part.${p.key}`, {
                version: state.aiOsVersion,
                defaultValue: p.key === "aboutMe" ? "About me" : p.key === "myWork" ? "My work" : `AI OS v${state.aiOsVersion}`,
              })}
            </span>
            <span style={{ color: "var(--vl-ink-2)" }}>
              {t("familiar.receives.words", { n: number(approxWords(p.chars)), defaultValue: "about {{n}} words" })}
            </span>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-2 text-sm italic" style={{ color: "var(--vl-ink-2)" }}>
        {t("familiar.receives.attachment", {
          defaultValue: "A long paste may arrive in the chat as an attachment. That is fine: send it as it is.",
        })}
      </p>
      <p className="m-0 mt-3 text-sm" style={{ color: "var(--vl-ink-2)" }}>
        {t("familiar.receives.firstLabel", { defaultValue: "After you paste, send this first:" })}
      </p>
      <p
        className="m-0 mt-1 select-all rounded-sm border px-3 py-2 text-sm"
        style={{ borderColor: "var(--vl-hair)", color: "var(--vl-ink)" }}
        data-first-message
      >
        {hasAbout
          ? t("familiar.receives.first", {
              defaultValue: "Using what you know about me, tell me in two lines who I am and how you will help me.",
            })
          : t("familiar.receives.firstGuest", {
              defaultValue: "Confirm that everything loaded, then ask me one question to get to know me.",
            })}
      </p>
      <button
        type="button"
        className="mt-3 cursor-pointer border-0 bg-transparent p-0 text-sm underline underline-offset-4"
        style={{ color: "var(--vl-ink-2)" }}
        aria-expanded={preview}
        aria-controls={previewId}
        onClick={() => setPreview((v) => !v)}
      >
        {preview
          ? t("familiar.receives.hide", { defaultValue: "Hide the text" })
          : t("familiar.receives.show", { defaultValue: "Show the text" })}
      </button>
      <div id={previewId} hidden={!preview}>
        {preview && (
          <textarea
            readOnly
            value={state.prompt}
            rows={10}
            aria-label={t("familiar.receives.previewAria", { defaultValue: "The text your AI receives" })}
            className="mt-2 w-full resize-y rounded-sm border bg-transparent p-3 font-mono text-xs"
            style={{ borderColor: "var(--vl-hair)", color: "var(--vl-ink)" }}
          />
        )}
      </div>
    </section>
  );
};

export default PromptReceives;

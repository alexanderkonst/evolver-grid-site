/**
 * FamiliarPage — the Your AI place at /game/your-ai: Intro → Ask → Reveal → Outro.
 *
 * The step lives in the address (`?step=ask|reveal|outro`; none = Intro), so a deep link lands on
 * the right screen, the browser's Back walks the screens in reverse, and a refresh stays put.
 * The question is kept in sessionStorage across a refresh; a Reveal with no question falls back to
 * Ask. The place is open to everyone: a guest sees gift 2 lit and gifts 1 and 3 dim.
 */
import { useCallback, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import FamiliarAskScreen from "./screens/FamiliarAskScreen";
import FamiliarIntroScreen from "./screens/FamiliarIntroScreen";
import FamiliarOutroScreen from "./screens/FamiliarOutroScreen";
import FamiliarRevealScreen from "./screens/FamiliarRevealScreen";
import { getChatApp, getQuestion, setChatApp, setQuestion as storeQuestion } from "./storage";
import type { ChatApp } from "./types";
import { useFamiliar } from "./useFamiliar";

type Step = "intro" | "ask" | "reveal" | "outro";

const STEPS: readonly Step[] = ["intro", "ask", "reveal", "outro"];

const stepOf = (raw: string | null): Step | null => {
  if (raw === null) return "intro";
  return STEPS.includes(raw as Step) ? (raw as Step) : null;
};

const FamiliarPage = () => {
  const [params, setParams] = useSearchParams();
  const state = useFamiliar();
  const userId = useSessionUserId();
  const [app, setApp] = useState<ChatApp>(() => getChatApp());
  const [question, setQuestion] = useState<string>(() => getQuestion());

  const go = useCallback(
    (step: Step) => setParams(step === "intro" ? {} : { step }),
    [setParams],
  );

  const chooseApp = (next: ChatApp) => {
    setApp(next);
    setChatApp(next);
  };

  const requested = stepOf(params.get("step"));
  // An unknown ?step= is a bad link, not a screen: start at the Intro.
  if (requested === null) return <Navigate to="/game/your-ai" replace />;
  // The Reveal compares answers to a question; without one, ask first.
  const step: Step = requested === "reveal" && question.trim() === "" ? "ask" : requested;

  if (step === "ask") {
    return (
      <FamiliarAskScreen
        state={state}
        initialQuestion={question}
        onSubmit={(q) => {
          setQuestion(q);
          storeQuestion(q);
          go("reveal");
        }}
        onSkip={() => go("outro")}
      />
    );
  }
  if (step === "reveal") {
    return <FamiliarRevealScreen state={state} question={question} app={app} onApp={chooseApp} onNext={() => go("outro")} />;
  }
  if (step === "outro") {
    return <FamiliarOutroScreen state={state} app={app} onApp={chooseApp} signedIn={!!userId} />;
  }
  return <FamiliarIntroScreen onStart={() => go("ask")} />;
};

export default FamiliarPage;

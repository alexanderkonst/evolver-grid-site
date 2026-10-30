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
import FamiliarAskScreen from "./screens/FamiliarAskScreen";
import FamiliarIntroScreen from "./screens/FamiliarIntroScreen";
import FamiliarOutroScreen from "./screens/FamiliarOutroScreen";
import FamiliarRevealScreen from "./screens/FamiliarRevealScreen";
import { getQuestion, setQuestion as storeQuestion } from "./storage";
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
  const [question, setQuestion] = useState<string>(() => getQuestion());

  const go = useCallback(
    (step: Step) => setParams(step === "intro" ? {} : { step }),
    [setParams],
  );

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
    return <FamiliarRevealScreen state={state} question={question} onNext={() => go("outro")} />;
  }
  if (step === "outro") {
    return <FamiliarOutroScreen state={state} />;
  }
  return <FamiliarIntroScreen onStart={() => go("ask")} />;
};

export default FamiliarPage;

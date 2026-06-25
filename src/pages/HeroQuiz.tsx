import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Check, Moon, RefreshCcw, Sun } from "lucide-react";
import { useSkin } from "@/contexts/SkinContext";
import "./HeroQuiz.css";

type LineKey = "realness" | "articulation" | "wanted" | "fit";

type Option = {
  letter: string;
  score: number;
  stage: string;
  text: string;
  color: string;
};

type Question = {
  key: LineKey;
  title: string;
  prompt: string;
  options: Option[];
};

type Bottleneck = {
  title: string;
  happening: string[];
  falseFix: string;
  nextMove: string;
  oldPattern: string;
  newPattern: string;
  bestFit: string;
};

const stageColors = [
  "#d84d3f",
  "#e98736",
  "#dfb73d",
  "#4f9b68",
  "#347ab8",
  "#6957ba",
  "#9b58b6",
];

const makeOptions = (items: Array<[string, string]>): Option[] =>
  items.map(([stage, text], index) => ({
    letter: String.fromCharCode(65 + index),
    score: index + 1,
    stage,
    text,
    color: stageColors[index],
  }));

const questions: Question[] = [
  {
    key: "realness",
    title: "Self-Editing -> Realness",
    prompt: "When you are around other people, how much of the real you actually makes it into the room?",
    options: makeOptions([
      ["Freeze", "I pause before I act because some part of me is checking for danger."],
      ["Filter", "I say the version that will cause the least friction."],
      ["Perform", "I become fluent at being liked, useful, or impressive."],
      ["Split", "I notice the gap between what I said and what was actually true."],
      ["Ache", "I feel sadness or anger that people do not really meet the real me."],
      ["Refuse", "I stop paying for belonging with self-erasure."],
      ["Reveal", "I let the real me show up in nearly all circumstances."],
    ]),
  },
  {
    key: "articulation",
    title: "Vague Description -> Precise Articulation",
    prompt: "When you try to explain what makes you you, where are you?",
    options: makeOptions([
      ["Fog", "I know there is something distinct about me, but I cannot clearly say what it is."],
      ["Fragments", "I can list my skills, wounds, dreams, interests, and experiences, but they still feel scattered."],
      ["Thread", "One sentence is starting to connect many parts of my life."],
      ["Click", "My body recognizes the wording before my mind fully trusts it."],
      ["Mirror", "Other people can repeat it back to me, and it still feels true."],
      ["Signal", "The right people understand me faster and need less explanation."],
      ["Name", "The pattern has a clear name, and I can build from it."],
    ]),
  },
  {
    key: "wanted",
    title: "Pet Project -> Making Something People Want",
    prompt: "When it comes to the project, idea, gift, or body of work you care about, where is it right now?",
    options: makeOptions([
      ["Private", "It mostly lives in my head, notes, drafts, dreams, or private conversations."],
      ["Protected", "I only show it to safe people, and even then, I watch their reaction closely."],
      ["Spark", "Someone recognizes themselves in it or wants it almost immediately."],
      ["Friction", "Misunderstandings show me what needs to become clearer."],
      ["Exchange", "Someone gives time, trust, money, access, attention, or effort in response."],
      ["Pattern", "Repeated responses show me who this is really for and how it wants to be used."],
      ["Wanted", "The thing has survived contact with reality and is becoming something people clearly want."],
    ]),
  },
  {
    key: "fit",
    title: "Career Mismatch -> Right-Fit Work",
    prompt: "In terms of career fit, where are you?",
    options: makeOptions([
      ["Mismatch", "I show up as a small part of myself at work."],
      ["Discern", "I am starting to tell the difference between healthy challenge and work that shrinks me."],
      ["Boundary", "I am done over-adapting to work that cannot hold who I really am."],
      ["Search", "I am looking for people, roles, rooms, clients, or markets where my gifts can breathe."],
      ["Design", "I am shaping a role, offer, business, project, or practice around what is actually true about me."],
      ["Join", "I am finding the right collaborators, complements, or ecosystems, so the work becomes bigger than me alone."],
      ["Fit", "My work amplifies who I am, uses my gifts well, and creates value for others."],
    ]),
  },
];

const bottlenecks: Record<LineKey, Bottleneck> = {
  realness: {
    title: "Self-Editing -> Realness",
    happening: [
      "You are still negotiating belonging through self-editing.",
      "Some part of you learned to scan the room, reduce friction, become likable, stay useful, or perform the version of yourself that feels safest.",
      "That may have protected you before. But now it may be keeping people from meeting the real you.",
    ],
    falseFix: "Trying to become more visible, more impressive, more polished, or more useful.",
    nextMove: "Practice letting the real you enter the room before you over-edit it.",
    oldPattern: "Will this version of me be accepted?",
    newPattern: "Can I let the real me be present without disappearing?",
    bestFit: "A truth-reveal, self-expression, voice, visibility, or nervous-system-safe realness process.",
  },
  articulation: {
    title: "Vague Description -> Precise Articulation",
    happening: [
      "You are not empty, purposeless, or lacking substance.",
      "You likely have too many meaningful pieces without a clean center.",
      "You may know your skills, story, interests, wounds, values, and dreams, but not yet have the sentence, name, or framework that makes the pattern easy to recognize.",
    ],
    falseFix: "More journaling, more studying, more personality tests, more collecting fragments.",
    nextMove: "Distill the pattern into language that travels.",
    oldPattern: "There is something here, but I cannot explain it.",
    newPattern: "This is the thread that organizes the whole thing.",
    bestFit: "A naming, positioning, messaging, signature framework, or articulation process.",
  },
  wanted: {
    title: "Pet Project -> Making Something People Want",
    happening: [
      "You have something meaningful, but it may still be living too close to you.",
      "It may be private, protected, overworked, overexplained, or not yet shaped by real-world response.",
      "The danger is falling in love with the project in private before finding out how people actually experience it.",
    ],
    falseFix: "More polishing, more planning, more private preparation, more getting it ready.",
    nextMove: "Let a small, real version of the thing meet real people.",
    oldPattern: "Is this good enough to show?",
    newPattern: "What does reality show me when people encounter it?",
    bestFit: "A beta test, feedback sprint, tiny challenge, pilot, prototype, sales conversation, or demand-testing process.",
  },
  fit: {
    title: "Career Mismatch -> Right-Fit Work",
    happening: [
      "The problem may not be your clarity, talent, or discipline. The problem may be the container.",
      "You may be inside a job, business model, role, client base, team, relationship, offer, or environment that only has room for a small part of you.",
      "So you keep trying to perform better in a structure that was never built to hold the full truth of your gifts.",
    ],
    falseFix: "Pushing harder, being more grateful, tolerating more, shrinking more, or trying to make it work.",
    nextMove: "Find, choose, or build a better container.",
    oldPattern: "How do I succeed in a form that shrinks me?",
    newPattern: "What form would actually let my gifts function?",
    bestFit: "A career redesign, offer design, role architecture, business model, collaboration, or right-fit work process.",
  },
};

const HeroQuiz = () => {
  const { skin, setSkin } = useSkin();
  const [answers, setAnswers] = useState<Partial<Record<LineKey, Option>>>({});

  useEffect(() => {
    if (skin !== "lapis" && skin !== "aurum") setSkin("lapis");
  }, [skin, setSkin]);

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === questions.length;

  const primary = useMemo(() => {
    if (!isComplete) return null;
    return questions.reduce((lowest, question) => {
      const current = answers[question.key];
      const prior = answers[lowest.key];
      if (!current || !prior) return lowest;
      return current.score < prior.score ? question : lowest;
    }, questions[0]);
  }, [answers, isComplete]);

  const reset = () => setAnswers({});

  return (
    <main className="hero-quiz-page">
      <div className="hero-quiz-orbit" aria-hidden="true" />
      <header className="hero-quiz-theme">
        <button
          type="button"
          className={skin === "lapis" ? "is-active" : ""}
          onClick={() => setSkin("lapis")}
          aria-pressed={skin === "lapis"}
        >
          <Sun size={17} />
          Lapis
        </button>
        <button
          type="button"
          className={skin === "aurum" ? "is-active" : ""}
          onClick={() => setSkin("aurum")}
          aria-pressed={skin === "aurum"}
        >
          <Moon size={17} />
          Aurum
        </button>
      </header>

      <section className="hero-quiz-hero">
        <p className="hero-quiz-kicker">A four-line developmental map</p>
        <h1>Where Are You in the Hero&apos;s Journey of Your Real Life?</h1>
        <p className="hero-quiz-tagline">
          Discover your current chapter, your hidden bottleneck, and the next move that makes your real life catch up to your real self.
        </p>
      </section>

      <section className="hero-quiz-intro" aria-label="How this quiz works">
        <div>
          <h2>You may not be lost.</h2>
          <p>You may just be using the wrong medicine for the chapter you are actually in.</p>
        </div>
        <p>
          Each answer is sequential: A is closer to the beginning of that developmental line, G is more embodied and usable in real life.
          Choose what feels true right now, not what you wish were true.
        </p>
      </section>

      <section className="hero-quiz-progress" aria-label="Quiz progress">
        <span>{answeredCount} / {questions.length} answered</span>
        <div>
          {questions.map((question) => (
            <span
              key={question.key}
              className={answers[question.key] ? "is-filled" : ""}
            />
          ))}
        </div>
      </section>

      <div className="hero-quiz-questions">
        {questions.map((question, index) => (
          <section className="hero-quiz-question" key={question.key}>
            <div className="hero-quiz-question-head">
              <span>Question {index + 1}</span>
              <h2>{question.title}</h2>
              <p>{question.prompt}</p>
            </div>
            <div className="hero-quiz-options">
              {question.options.map((option) => {
                const selected = answers[question.key]?.letter === option.letter;
                return (
                  <button
                    type="button"
                    key={option.letter}
                    className={selected ? "is-selected" : ""}
                    onClick={() => setAnswers((current) => ({ ...current, [question.key]: option }))}
                    style={{ "--stage-color": option.color } as CSSProperties}
                  >
                    <span className="hero-quiz-letter">{option.letter}</span>
                    <span>
                      <strong>{option.stage}</strong>
                      {option.text}
                    </span>
                    {selected && <Check size={18} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {isComplete && primary && (
        <section className="hero-quiz-result" aria-live="polite">
          <div className="hero-quiz-result-head">
            <p>Your Current Chapter</p>
            <h2>
              You are in the {answers[primary.key]?.stage} chapter of {primary.title}.
            </h2>
          </div>

          <div className="hero-quiz-map">
            {questions.map((question) => (
              <div key={question.key}>
                <span>{question.title}</span>
                <strong>{answers[question.key]?.stage}</strong>
              </div>
            ))}
          </div>

          <div className="hero-quiz-meaning">
            <h3>What This Means</h3>
            <p>
              You are not broken. You are mid-initiation. Your map shows where your real self, your language, your work-in-progress,
              and your career are currently meeting, or missing, each other.
            </p>
          </div>

          <div className="hero-quiz-diagnosis">
            <h3>Your Primary Bottleneck: {bottlenecks[primary.key].title}</h3>
            {bottlenecks[primary.key].happening.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="hero-quiz-crossing">
            <div>
              <span>Your False Fix</span>
              <p>{bottlenecks[primary.key].falseFix}</p>
            </div>
            <div>
              <span>Your Actual Next Move</span>
              <p>{bottlenecks[primary.key].nextMove}</p>
            </div>
            <div>
              <span>Your Next Crossing</span>
              <p>From: &ldquo;{bottlenecks[primary.key].oldPattern}&rdquo;</p>
              <p>To: &ldquo;{bottlenecks[primary.key].newPattern}&rdquo;</p>
            </div>
            <div>
              <span>Best-Fit Solution</span>
              <p>{bottlenecks[primary.key].bestFit}</p>
            </div>
          </div>

          <footer className="hero-quiz-close">
            <p>
              Your result is not a label. It is a location. Once you know where you are, you can stop using the wrong medicine.
            </p>
            <button type="button" onClick={reset}>
              <RefreshCcw size={17} />
              Retake
            </button>
          </footer>
        </section>
      )}
    </main>
  );
};

export default HeroQuiz;

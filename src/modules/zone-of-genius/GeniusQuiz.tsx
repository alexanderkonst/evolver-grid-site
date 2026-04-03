import { useState, useCallback } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import GameShellV2 from "../../components/game/GameShellV2";

// ─── Types ──────────────────────────────────────────────────
type ArchetypeId = "invisible_genius" | "multi_talent_trap" | "misaligned_vector" | "underpriced_operator";

interface Question {
  id: string;
  label: string;
  question: string;
  options: { text: string; scores: Partial<Record<ArchetypeId, number>> }[];
}

interface ArchetypeResult {
  id: ArchetypeId;
  name: string;
  emoji: string;
  identity: string;
  mirror: string[];
  problem: string;
  symptoms: string[];
  reframe: string;
  blade: string;
  cta: string;
  ctaSub: string;
}

// ─── Questions ──────────────────────────────────────────────
const QUESTIONS: Question[] = [
  {
    id: "q1",
    label: "Identity friction",
    question: "When someone asks what you do, what happens?",
    options: [
      { text: "I explain it differently every time", scores: { invisible_genius: 2, multi_talent_trap: 1 } },
      { text: "I over-explain and lose them", scores: { invisible_genius: 2 } },
      { text: "I simplify too much and it feels wrong", scores: { misaligned_vector: 1, underpriced_operator: 1 } },
      { text: "I avoid the question entirely", scores: { invisible_genius: 1, misaligned_vector: 1 } },
    ],
  },
  {
    id: "q2",
    label: "External validation",
    question: "What do people consistently come to you for?",
    options: [
      { text: "Advice / clarity", scores: { underpriced_operator: 2 } },
      { text: "Strategy / direction", scores: { multi_talent_trap: 1, misaligned_vector: 1 } },
      { text: "Solving complex problems", scores: { underpriced_operator: 2, invisible_genius: 1 } },
      { text: "Something hard to describe", scores: { invisible_genius: 3 } },
    ],
  },
  {
    id: "q3",
    label: "Internal tension",
    question: "Which feels most true right now?",
    options: [
      { text: "\"I'm good at too many things to choose one\"", scores: { multi_talent_trap: 3 } },
      { text: "\"I know what I do, I just can't explain it\"", scores: { invisible_genius: 3 } },
      { text: "\"I'm working hard but the results don't match\"", scores: { misaligned_vector: 3 } },
      { text: "\"People get value from me but don't always pay for it\"", scores: { underpriced_operator: 3 } },
    ],
  },
  {
    id: "q4",
    label: "Past pattern",
    question: "Think about your best moments at work. What was happening?",
    options: [
      { text: "I was solving a puzzle no one else could see", scores: { invisible_genius: 2 } },
      { text: "I connected things that seemed unrelated", scores: { multi_talent_trap: 2 } },
      { text: "I made someone feel seen and understood", scores: { underpriced_operator: 1, invisible_genius: 1 } },
      { text: "I built something from scratch that worked", scores: { misaligned_vector: 2 } },
    ],
  },
  {
    id: "q5",
    label: "Pricing reality",
    question: "How do you currently price your work?",
    options: [
      { text: "I don't — I mostly give it away", scores: { underpriced_operator: 2 } },
      { text: "I charge but always feel it's too low", scores: { underpriced_operator: 2 } },
      { text: "My pricing keeps changing — I can't find the right number", scores: { misaligned_vector: 2 } },
      { text: "I charge well for some things, but my real value isn't captured", scores: { multi_talent_trap: 1, invisible_genius: 1 } },
    ],
  },
  {
    id: "q6",
    label: "What's missing",
    question: "What would change everything for you right now?",
    options: [
      { text: "Being able to explain what I do in one sentence", scores: { invisible_genius: 3 } },
      { text: "Knowing exactly who to sell to", scores: { multi_talent_trap: 2 } },
      { text: "Having a clear offer that feels right", scores: { misaligned_vector: 2, multi_talent_trap: 1 } },
      { text: "Charging what I'm worth without hesitation", scores: { underpriced_operator: 3 } },
    ],
  },
];

// ─── Results ────────────────────────────────────────────────
const ARCHETYPES: Record<ArchetypeId, ArchetypeResult> = {
  invisible_genius: {
    id: "invisible_genius",
    name: "The Invisible Genius",
    emoji: "🧩",
    identity: "You create real value.",
    mirror: [
      "People leave conversations with you clearer, more focused, or unstuck.",
    ],
    problem: "It's not structured in a way people can quickly understand.",
    symptoms: [
      "they don't always act",
      "you end up re-explaining it every time",
      "people get value — but don't always pay",
    ],
    reframe: "This isn't a skill problem. It's a business structure problem around what you already do.",
    blade: "You've understood this for a while. Understanding alone didn't change it.",
    cta: "See what's actually missing",
    ctaSub: "6 min — what needs to happen next",
  },
  multi_talent_trap: {
    id: "multi_talent_trap",
    name: "The Multi-Talent Trap",
    emoji: "🧩",
    identity: "You're good at many things — and none of them fully define you.",
    mirror: [
      "You can adapt, solve, build, and create across different domains.",
      "That's your strength.",
    ],
    problem: "Without a clear center, nothing sticks.",
    symptoms: [
      "you keep reshaping what you do",
      "your offer keeps changing",
      "people don't know how to place you",
    ],
    reframe: "You don't need to choose one skill. You need a structure that holds all of them.",
    blade: "You've tried picking one thing. It never held all of you. Understanding alone didn't change it.",
    cta: "See what's actually missing",
    ctaSub: "6 min — what needs to happen next",
  },
  misaligned_vector: {
    id: "misaligned_vector",
    name: "The Misaligned Vector",
    emoji: "🧩",
    identity: "You're putting in effort. A lot of it. But the results don't match.",
    mirror: [
      "You've built things. Tried things. Moved forward.",
      "And still… something feels off.",
    ],
    problem: "You're applying force in the wrong direction.",
    symptoms: [
      "you work harder, but don't gain traction",
      "things almost click — but don't hold",
      "progress feels inconsistent",
    ],
    reframe: "This isn't about effort. It's about alignment.",
    blade: "You already know effort isn't the issue. But you keep applying it anyway. Understanding alone didn't change it.",
    cta: "See what's actually missing",
    ctaSub: "6 min — what needs to happen next",
  },
  underpriced_operator: {
    id: "underpriced_operator",
    name: "The Underpriced Operator",
    emoji: "🧩",
    identity: "You deliver real value. People get results from working with you.",
    mirror: [
      "And still…",
      "You're not charging what that's worth.",
    ],
    problem: "People don't fully understand what you do — fast enough to pay.",
    symptoms: [
      "you undercharge",
      "you overdeliver",
      "you hesitate to raise prices",
    ],
    reframe: "This isn't about confidence. It's about clarity.",
    blade: "You've known you should charge more for years. Knowing didn't help. Understanding alone didn't change it.",
    cta: "See what's actually missing",
    ctaSub: "6 min — what needs to happen next",
  },
};

// ─── Scoring ────────────────────────────────────────────────
function calculateResult(answers: Record<string, number>): ArchetypeId {
  const scores: Record<ArchetypeId, number> = {
    invisible_genius: 0,
    multi_talent_trap: 0,
    misaligned_vector: 0,
    underpriced_operator: 0,
  };

  for (const [questionId, optionIdx] of Object.entries(answers)) {
    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) continue;
    const option = question.options[optionIdx];
    if (!option) continue;
    for (const [archetype, score] of Object.entries(option.scores)) {
      scores[archetype as ArchetypeId] += score;
    }
  }

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as ArchetypeId;
}

// ─── Components ─────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full max-w-xs mx-auto mb-6">
      <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
        <span>{current} of {total}</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-white/80 to-white/40 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function QuestionStep({
  question,
  onAnswer,
  selectedIdx,
}: {
  question: Question;
  onAnswer: (idx: number) => void;
  selectedIdx?: number;
}) {
  return (
    <div className="animate-in fade-in duration-300">
      <p className="text-xs text-[#8460ea] font-medium mb-2 uppercase tracking-wider">
        {question.label}
      </p>
      <h2 className="text-lg font-semibold text-white/90 font-display mb-6 leading-snug">
        {question.question}
      </h2>
      <div className="space-y-2.5">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onAnswer(idx)}
            className={`w-full p-4 rounded-xl ring-1 transition-all duration-200
                        text-left text-sm leading-relaxed
                        ${selectedIdx === idx
                ? "ring-[#8460ea] bg-[#8460ea]/15 text-white shadow-md shadow-[#8460ea]/10"
                : "ring-white/10 liquid-glass text-white/80 hover:ring-white/25 hover:text-white"
              }`}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultView({
  result,
  onRestart,
}: {
  result: ArchetypeResult;
  onRestart: () => void;
}) {
  return (
    <div className="animate-in fade-in duration-500 max-w-md mx-auto">
      {/* Archetype name */}
      <div className="text-center mb-8">
        <p className="text-sm text-[#8460ea] font-semibold uppercase tracking-[0.2em] mb-3">
          Your pattern
        </p>
        <h1
          className="text-3xl md:text-4xl font-display font-bold text-white leading-tight"
          style={{ textShadow: '0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(132,96,234,0.15)' }}
        >
          {result.name}
        </h1>
      </div>

      {/* Identity + Mirror */}
      <div className="space-y-4 mb-8">
        <p className="text-lg font-semibold text-white">
          {result.identity}
        </p>
        {result.mirror.map((line, i) => (
          <p key={i} className="text-base text-white/70 leading-relaxed">
            {line}
          </p>
        ))}
      </div>

      {/* Problem */}
      <div className="mb-6">
        <p className="text-base font-bold text-white">
          The problem is:
        </p>
        <p className="text-base text-white/75 mt-2 leading-relaxed italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
          {result.problem}
        </p>
      </div>

      {/* Symptoms */}
      <div className="mb-6">
        <p className="text-sm text-white/50 mb-2">So instead:</p>
        <ul className="space-y-1.5">
          {result.symptoms.map((s, i) => (
            <li key={i} className="text-base text-white/65 leading-relaxed">
              — {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Reframe */}
      <p className="text-base font-semibold text-white mb-2">
        {result.reframe}
      </p>
      <p className="text-sm text-white/55 leading-relaxed mb-4 italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
        And fixing it doesn't mean building something massive —<br/>
        it means making what's already there usable.
      </p>

      {/* Blade */}
      <p className="text-sm text-white/45 leading-relaxed mb-10 italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
        {result.blade}
      </p>

      {/* ═══ CTA: Watch the video ═══ */}
      <a
        href="/ignite#hero-video"
        className="w-full flex items-center justify-between p-5 rounded-2xl
                   liquid-glass-strong ring-1 ring-white/25
                   shadow-[0_0_40px_rgba(240,194,127,0.2),0_0_80px_rgba(132,96,234,0.15)]
                   hover:shadow-[0_0_60px_rgba(240,194,127,0.35),0_0_100px_rgba(132,96,234,0.25)]
                   hover:scale-[1.02] active:scale-95
                   transition-all duration-300"
      >
        <div>
          <p className="text-base font-bold text-white uppercase tracking-wider" style={{ textShadow: '0 0 20px rgba(240,194,127,0.3)' }}>
            {result.cta}
          </p>
          <p className="text-xs text-white/50 mt-1">{result.ctaSub}</p>
        </div>
        <span className="w-10 h-10 rounded-full bg-[#b8a4f8]/20 flex items-center justify-center flex-shrink-0 ml-4">
          <ArrowRight className="w-5 h-5 text-[#b8a4f8]" />
        </span>
      </a>

      {/* Restart */}
      <button
        onClick={onRestart}
        className="flex items-center gap-1.5 mx-auto mt-8 text-xs text-white/25
                   hover:text-white/45 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Retake
      </button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function GeniusQuiz() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [result, setResult] = useState<ArchetypeResult | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const handleAnswer = useCallback(
    (optionIdx: number) => {
      const q = QUESTIONS[currentQuestion];
      const newAnswers = { ...answers, [q.id]: optionIdx };
      setAnswers(newAnswers);

      // Brief pause for selection feedback
      setTransitioning(true);
      setTimeout(() => {
        if (currentQuestion < QUESTIONS.length - 1) {
          setCurrentQuestion((prev) => prev + 1);
        } else {
          // Calculate result
          const archetypeId = calculateResult(newAnswers);
          setResult(ARCHETYPES[archetypeId]);
        }
        setTransitioning(false);
      }, 400);
    },
    [currentQuestion, answers]
  );

  const handleRestart = useCallback(() => {
    setAnswers({});
    setCurrentQuestion(0);
    setResult(null);
  }, []);

  return (
    <GameShellV2 hideNavigation>
      {/* Gradient Background — dark overlay matching ZoG entry */}
      <div className="fixed inset-0 z-0 bg-[#0a0a1a]">
          <img 
              src="/gradient.jpg" 
              alt="" 
              className="w-full h-full object-cover" 
              aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[#0a0a1a]/65 backdrop-blur-[2px]" />
      </div>
      
      <div className="relative z-10 p-4 lg:p-8 max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full overflow-hidden mb-4 ring-1 ring-white/10 breathing-card">
            <img src="/dodecahedron.png" alt="" className="w-full h-full object-cover" aria-hidden="true" />
          </div>
          {!result ? (
            <>
              <h1
                className="text-xl font-semibold font-display text-white/90 leading-snug"
                style={{ textShadow: '0 0 30px rgba(255,255,255,0.15), 0 0 60px rgba(132,96,234,0.1)' }}
              >
                Why hasn't this turned into something real?
              </h1>
              <p className="text-xs text-white/40 mt-2 max-w-sm mx-auto">
                6 questions. No overthinking. See exactly where it breaks.
              </p>
            </>
          ) : (
            <p className="text-xs text-white/40 mt-1">
              Your result is ready.
            </p>
          )}
        </div>

        {/* Quiz or Result */}
        {!result ? (
          <div className={`transition-opacity duration-300 ${transitioning ? "opacity-30" : "opacity-100"}`}>
            <ProgressBar current={currentQuestion + 1} total={QUESTIONS.length} />
            <QuestionStep
              key={QUESTIONS[currentQuestion].id}
              question={QUESTIONS[currentQuestion]}
              onAnswer={handleAnswer}
              selectedIdx={answers[QUESTIONS[currentQuestion].id]}
            />
          </div>
        ) : (
          <ResultView result={result} onRestart={handleRestart} />
        )}
      </div>
    </GameShellV2>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Share2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPARK_QUESTIONS, SparkOption } from "./geniusSparkQuestions";
import { generateSparkArchetype } from "./generateSparkArchetype";

type SparkStep = 'intro' | 'questions' | 'reveal';

const GeniusSpark = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<SparkStep>('intro');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selections, setSelections] = useState<SparkOption[]>([]);
    const [isRevealing, setIsRevealing] = useState(false);

    const handleStart = () => {
        setStep('questions');
    };

    const handleOptionSelect = (option: SparkOption) => {
        const newSelections = [...selections, option];
        setSelections(newSelections);

        if (currentQuestion < SPARK_QUESTIONS.length - 1) {
            // Move to next question
            setTimeout(() => {
                setCurrentQuestion(prev => prev + 1);
            }, 200);
        } else {
            // All questions answered, reveal result
            setIsRevealing(true);
            setTimeout(() => {
                setIsRevealing(false);
                setStep('reveal');
            }, 1500);
        }
    };

    const handleShare = async () => {
        if (!selections.length) return;
        const archetype = generateSparkArchetype(selections);

        const shareText = `${archetype.emoji} My Genius Spark: ${archetype.name}\n\n"${archetype.headline}"\n\nDiscover yours in 60 seconds:`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Genius Spark',
                    text: shareText,
                    url: window.location.origin + '/spark'
                });
            } catch {
                // User cancelled or share failed
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(shareText + ' ' + window.location.origin + '/spark');
        }
    };

    const handleGoDeeper = () => {
        navigate('/zone-of-genius');
    };

    // Intro Step
    if (step === 'intro') {
        return (
            <div className="min-h-dvh bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    {/* Icon */}
                    <div className="relative w-20 h-20 mx-auto mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-xl opacity-40 animate-pulse" />
                        <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-slate-900 mb-3 font-[Fraunces] tracking-tight">
                        GENIUS SPARK
                    </h1>
                    <p className="text-slate-600 text-lg mb-8">
                        Discover your genius in 60 seconds
                    </p>

                    {/* CTA */}
                    <Button
                        onClick={handleStart}
                        size="lg"
                        className="w-full max-w-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-lg h-14 rounded-xl shadow-lg shadow-amber-500/25"
                    >
                        Start
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    <p className="text-sm text-slate-500 mt-6">
                        5 quick questions. No signup required.
                    </p>
                </div>
            </div>
        );
    }

    // Revealing animation
    if (isRevealing) {
        return (
            <div className="min-h-dvh bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex flex-col items-center justify-center p-6">
                <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 border-2 border-amber-300 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                        <div className="absolute inset-3 border-2 border-orange-300 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                        <div className="absolute inset-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-pulse flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-lg text-slate-600 animate-pulse">
                        Revealing your genius...
                    </p>
                </div>
            </div>
        );
    }

    // Reveal Step
    if (step === 'reveal') {
        const archetype = generateSparkArchetype(selections);

        return (
            <div className="min-h-dvh bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full">
                    {/* Result Card */}
                    <div className={`relative bg-gradient-to-br ${archetype.gradient} rounded-3xl p-8 text-white shadow-2xl overflow-hidden`}>
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10">
                            {/* Emoji */}
                            <div className="text-5xl mb-4">{archetype.emoji}</div>

                            {/* Archetype Name */}
                            <h1 className="text-2xl font-bold font-[Fraunces] tracking-tight mb-2">
                                {archetype.name}
                            </h1>

                            {/* Headline */}
                            <p className="text-xl text-white/90 mb-4">
                                {archetype.headline}
                            </p>

                            {/* Description */}
                            <p className="text-white/80 leading-relaxed">
                                {archetype.description}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 space-y-3">
                        <Button
                            onClick={handleGoDeeper}
                            size="lg"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-14 rounded-xl"
                        >
                            Go Deeper
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>

                        <Button
                            onClick={handleShare}
                            variant="outline"
                            size="lg"
                            className="w-full h-14 rounded-xl border-2"
                        >
                            <Share2 className="w-5 h-5 mr-2" />
                            Share My Spark
                        </Button>
                    </div>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Want the full picture? The deeper assessment takes 5 minutes.
                    </p>
                </div>
            </div>
        );
    }

    // Questions Step
    const question = SPARK_QUESTIONS[currentQuestion];
    const progress = ((currentQuestion) / SPARK_QUESTIONS.length) * 100;

    return (
        <div className="min-h-dvh bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex flex-col p-6">
            {/* Progress bar */}
            <div className="w-full max-w-md mx-auto mb-8">
                <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                    <span>{currentQuestion + 1} of {SPARK_QUESTIONS.length}</span>
                    <span>~{Math.ceil((SPARK_QUESTIONS.length - currentQuestion) * 12)} sec left</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {question.question}
                    </h2>
                    <p className="text-slate-500">
                        {question.subtext}
                    </p>
                </div>

                {/* Options */}
                <div className="w-full space-y-3">
                    {question.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option)}
                            className="w-full p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 transition-all text-left group"
                        >
                            <p className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                                {option.label}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {option.description}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-8">
                {SPARK_QUESTIONS.map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${i < currentQuestion
                                ? 'bg-amber-500'
                                : i === currentQuestion
                                    ? 'bg-amber-400 w-4'
                                    : 'bg-slate-300'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default GeniusSpark;

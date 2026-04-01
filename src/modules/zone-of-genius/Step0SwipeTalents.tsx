import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useZoneOfGenius } from './ZoneOfGeniusContext';
import { TALENTS } from './talents';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { getZogAssessmentBasePath, getZogStepPath } from './zogRoutes';

const Step0SwipeTalents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setYesTalentIds } = useZoneOfGenius();
  const basePath = getZogAssessmentBasePath(location.pathname);
  
  // Randomize talent order once on mount
  const shuffledTalents = useMemo(() => {
    const talents = [...TALENTS];
    for (let i = talents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [talents[i], talents[j]] = [talents[j], talents[i]];
    }
    return talents;
  }, []);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<('yes' | 'no' | null)[]>(new Array(shuffledTalents.length).fill(null));
  const [isComplete, setIsComplete] = useState(false);
  
  // Swipe detection
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const currentTalent = shuffledTalents[currentIndex];
  const progressPercent = ((currentIndex + 1) / shuffledTalents.length) * 100;
  const currentAnswer = answers[currentIndex];
  
  // Derive yesTalents from answers array using shuffled order
  const yesTalents: number[] = [];
  answers.forEach((answer, i) => {
    if (answer === 'yes') {
      yesTalents.push(shuffledTalents[i].id);
    }
  });
  const yesTalentCount = yesTalents.length;

  const handleYes = () => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = 'yes';
    setAnswers(newAnswers);
    moveToNext();
  };

  const handleNo = () => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = 'no';
    setAnswers(newAnswers);
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < shuffledTalents.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Swipe gesture detection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        handleNo();
      } else {
        handleYes();
      }
    }
  };

  useEffect(() => {
    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [currentIndex]);

  const handleContinue = () => {
    setYesTalentIds(yesTalents);
    navigate(getZogStepPath(basePath, 1));
  };

  const handleRescan = () => {
    setCurrentIndex(0);
    setAnswers(new Array(shuffledTalents.length).fill(null));
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="liquid-glass rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Quick Scan Complete
          </h2>
          <p className="text-base sm:text-lg text-white/80 mb-2">
            You said <span className="font-bold text-white">YES</span> to{' '}
            <span className="font-bold">{yesTalentCount}</span> talents.
          </p>
          <p className="text-sm sm:text-base text-white/50 mb-6">
            Next, you'll choose your Top 10 from these.
          </p>
          
          {yesTalentCount < 10 && (
            <div className="liquid-glass rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-white/60">
                You selected fewer than 10 talents. That's okay — you might have a very focused pattern.
                You can rescan, or continue with what you have.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={handleRescan}
              className="liquid-glass px-6 py-3 rounded-full text-sm font-medium text-white/70 hover:text-white hover:scale-[1.02] active:scale-95 transition-all"
            >
              Rescan Talents
            </button>
            <button
              onClick={handleContinue}
              className="liquid-glass-strong px-6 py-3 rounded-full text-sm font-medium text-white hover:scale-[1.02] active:scale-95 transition-all ring-1 ring-white/20"
            >
              Continue to Top 10 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      {currentIndex > 0 && (
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center mb-6 sm:mb-8">
        <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-4">
          You'll see each talent one by one.<br />
          <span className="sm:hidden">Swipe left for "Not really me", swipe right for "This feels like me".</span>
          <span className="hidden sm:inline">Tap <strong className="text-white/80">"This feels like me"</strong> if this is a natural part of you — something you're good at, 
          drawn to, or that people already recognize in you.<br />
          Use <strong className="text-white/80">"Not really me"</strong> otherwise.</span>
        </p>
        <p className="text-xs sm:text-sm text-white/40">
          <strong>Don't mark what you wish you were. Mark what you already are.</strong>
        </p>
        <p className="text-xs sm:text-sm text-white/30 mt-2">
          Go with your first instinct. This usually takes about 3–4 minutes.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm text-white/40">
            Talent {currentIndex + 1} of {shuffledTalents.length}
          </span>
          <span className="text-xs sm:text-sm text-white font-semibold">
            Yes selected: {yesTalentCount}
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))',
            }}
          />
        </div>
      </div>

      {/* Talent Card with Swipe Support */}
      <div 
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="liquid-glass-strong rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 touch-pan-y select-none ring-1 ring-white/15"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">
          {currentTalent.name}
        </h3>
        <p className="text-sm sm:text-base text-white/70 leading-relaxed text-center">
          {currentTalent.description}
        </p>
        
        {/* Visual feedback for previously answered talents */}
        {currentAnswer && (
          <div className="mt-4 text-center">
            <span className={`text-xs font-semibold ${currentAnswer === 'yes' ? 'text-white/80' : 'text-white/30'}`}>
              Previously selected: {currentAnswer === 'yes' ? 'This feels like me' : 'Not really me'}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={handleNo}
          className={`flex-1 h-14 sm:h-16 text-base sm:text-lg flex items-center justify-center gap-2 rounded-xl liquid-glass text-white/60 hover:text-white/80 hover:scale-[1.01] active:scale-[0.98] transition-all ${currentAnswer === 'no' ? 'ring-1 ring-white/30' : ''}`}
        >
          <ThumbsDown className="w-5 h-5" />
          Not really me
        </button>
        <button
          onClick={handleYes}
          className={`flex-1 h-14 sm:h-16 text-base sm:text-lg flex items-center justify-center gap-2 rounded-xl liquid-glass-strong text-white hover:scale-[1.01] active:scale-[0.98] transition-all ring-1 ring-white/20 ${currentAnswer === 'yes' ? 'ring-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : ''}`}
        >
          <ThumbsUp className="w-5 h-5" />
          This feels like me
        </button>
      </div>
      
      <p className="text-xs text-center text-white/20 mt-4 sm:hidden">
        💡 Swipe left or right to answer
      </p>
    </div>
  );
};

export default Step0SwipeTalents;

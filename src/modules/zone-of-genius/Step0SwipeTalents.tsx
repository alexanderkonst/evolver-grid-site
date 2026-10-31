import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useZoneOfGenius } from './ZoneOfGeniusContext';
import { useLocalizedTalents } from './talents';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { getZogAssessmentBasePath, getZogStepPath } from './zogRoutes';

const Step0SwipeTalents = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setYesTalentIds } = useZoneOfGenius();
  const basePath = getZogAssessmentBasePath(location.pathname);
  const localizedTalents = useLocalizedTalents();

  // Randomize talent order once on mount
  const shuffledTalents = useMemo(() => {
    const talents = [...localizedTalents];
    for (let i = talents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [talents[i], talents[j]] = [talents[j], talents[i]];
    }
    return talents;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {String(t('zogSteps.step0.scanComplete'))}
          </h2>
          <p className="text-base sm:text-lg text-white/80 mb-2">
            <Trans
              i18nKey="zogSteps.step0.saidYes"
              values={{ n: yesTalentCount }}
              components={{
                yes: <span className="font-bold text-white" />,
                n: <span className="font-bold" />,
              }}
            />
          </p>
          <p className="text-sm sm:text-base text-white/50 mb-6">
            {String(t('zogSteps.step0.nextTop10'))}
          </p>

          {yesTalentCount < 10 && (
            <div className="liquid-glass rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-white/60">
                {String(t('zogSteps.step0.fewerThan10'))}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={handleRescan}
              className="liquid-glass px-6 py-3 rounded-full text-sm font-medium text-white/70 hover:text-white hover:scale-[1.02] active:scale-95 transition-all"
            >
              {String(t('zogSteps.step0.rescan'))}
            </button>
            <button
              onClick={handleContinue}
              className="liquid-glass-strong px-6 py-3 rounded-full text-sm font-medium text-white hover:scale-[1.02] active:scale-95 transition-all ring-1 ring-white/20"
            >
              {String(t('zogSteps.step0.continueTop10'))}
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
            {String(t('zogSteps.back'))}
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center mb-6 sm:mb-8">
        <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-4">
          {String(t('zogSteps.step0.intro'))}<br />
          <span className="sm:hidden">{String(t('zogSteps.step0.swipeHint'))}</span>
          <span className="hidden sm:inline">
            <Trans
              i18nKey="zogSteps.step0.tapHint"
              components={{ b: <strong className="text-white/80" />, br: <br /> }}
            />
          </span>
        </p>
        <p className="text-xs sm:text-sm text-white/40">
          <strong>{String(t('zogSteps.step0.honest'))}</strong>
        </p>
        <p className="text-xs sm:text-sm text-white/30 mt-2">
          {String(t('zogSteps.step0.instinct'))}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm text-white/40">
            {String(t('zogSteps.step0.progress', { current: currentIndex + 1, total: shuffledTalents.length }))}
          </span>
          <span className="text-xs sm:text-sm text-white font-semibold">
            {String(t('zogSteps.step0.yesSelected', { n: yesTalentCount }))}
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
              {String(t('zogSteps.step0.previously', { answer: String(t(currentAnswer === 'yes' ? 'zogSteps.step0.isMe' : 'zogSteps.step0.notMe')) }))}
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
          {String(t('zogSteps.step0.notMe'))}
        </button>
        <button
          onClick={handleYes}
          className={`flex-1 h-14 sm:h-16 text-base sm:text-lg flex items-center justify-center gap-2 rounded-xl liquid-glass-strong text-white hover:scale-[1.01] active:scale-[0.98] transition-all ring-1 ring-white/20 ${currentAnswer === 'yes' ? 'ring-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : ''}`}
        >
          <ThumbsUp className="w-5 h-5" />
          {String(t('zogSteps.step0.isMe'))}
        </button>
      </div>
      
      <p className="text-xs text-center text-white/20 mt-4 sm:hidden">
        {String(t('zogSteps.step0.swipeFooter'))}
      </p>
    </div>
  );
};

export default Step0SwipeTalents;

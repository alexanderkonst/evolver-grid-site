import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useZoneOfGenius } from './ZoneOfGeniusContext';
import { TALENTS } from './talents';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react';
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
        // Swiped left = "Not really me"
        handleNo();
      } else {
        // Swiped right = "This feels like me"
        handleYes();
      }
    }
  };

  useEffect(() => {
    // Reset touch positions when index changes
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
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
            Quick Scan Complete
          </h2>
          <p className="text-base sm:text-lg text-foreground mb-2">
            You said <span className="font-bold text-primary">YES</span> to{' '}
            <span className="font-bold">{yesTalentCount}</span> talents.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Next, you'll choose your Top 10 from these.
          </p>
          
          {yesTalentCount < 10 && (
            <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-muted-foreground">
                You selected fewer than 10 talents. That's okay — you might have a very focused pattern.
                You can rescan, or continue with what you have.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleRescan}
              className="w-full sm:w-auto"
            >
              Rescan Talents
            </Button>
            <Button
              size="lg"
              onClick={handleContinue}
              className="w-full sm:w-auto"
            >
              Continue to Top 10
            </Button>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center mb-6 sm:mb-8">
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
          You'll see each talent one by one.<br />
          <span className="sm:hidden">Swipe left for "Not really me", swipe right for "This feels like me".</span>
          <span className="hidden sm:inline">Tap <strong>"This feels like me"</strong> if this is a natural part of you — something you're good at, 
          drawn to, or that people already recognize in you.<br />
          Use <strong>"Not really me"</strong> otherwise.</span>
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground">
          <strong>Don't mark what you wish you were. Mark what you already are.</strong>
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          Go with your first instinct. This usually takes about 3–4 minutes.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm text-muted-foreground">
            Talent {currentIndex + 1} of {shuffledTalents.length}
          </span>
          <span className="text-xs sm:text-sm text-primary font-semibold">
            Yes selected: {yesTalentCount}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Talent Card with Swipe Support */}
      <div 
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-card border-2 border-primary/20 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8 shadow-lg touch-pan-y select-none"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-primary mb-4 text-center">
          {currentTalent.name}
        </h3>
        <p className="text-sm sm:text-base text-foreground leading-relaxed text-center">
          {currentTalent.description}
        </p>
        
        {/* Visual feedback for previously answered talents */}
        {currentAnswer && (
          <div className="mt-4 text-center">
            <span className={`text-xs font-semibold ${currentAnswer === 'yes' ? 'text-primary' : 'text-muted-foreground'}`}>
              Previously selected: {currentAnswer === 'yes' ? 'This feels like me' : 'Not really me'}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleNo}
          className={`flex-1 h-14 sm:h-16 text-base sm:text-lg gap-2 ${currentAnswer === 'no' ? 'border-primary/50' : ''}`}
        >
          <ThumbsDown className="w-5 h-5" />
          Not really me
        </Button>
        <Button
          size="lg"
          onClick={handleYes}
          className={`flex-1 h-14 sm:h-16 text-base sm:text-lg gap-2 ${currentAnswer === 'yes' ? 'ring-2 ring-primary' : ''}`}
        >
          <ThumbsUp className="w-5 h-5" />
          This feels like me
        </Button>
      </div>
      
      <p className="text-xs text-center text-muted-foreground mt-4 sm:hidden">
        💡 Swipe left or right to answer
      </p>
    </div>
  );
};

export default Step0SwipeTalents;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useZoneOfGenius } from './ZoneOfGeniusContext';
import { TALENTS } from './talents';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

const Step0SwipeTalents = () => {
  const navigate = useNavigate();
  const { setYesTalentIds } = useZoneOfGenius();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [yesTalents, setYesTalents] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentTalent = TALENTS[currentIndex];
  const progressPercent = ((currentIndex + 1) / TALENTS.length) * 100;

  const handleYes = () => {
    setYesTalents(prev => [...prev, currentTalent.id]);
    moveToNext();
  };

  const handleNo = () => {
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < TALENTS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleContinue = () => {
    setYesTalentIds(yesTalents);
    navigate('/zone-of-genius/assessment/step-1');
  };

  const handleRescan = () => {
    setCurrentIndex(0);
    setYesTalents([]);
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
            <span className="font-bold">{yesTalents.length}</span> talents.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Next, you'll choose your Top 10 from these.
          </p>
          
          {yesTalents.length < 10 && (
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
      {/* Instructions */}
      <div className="text-center mb-6 sm:mb-8">
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
          You'll see each talent one by one.<br />
          Tap <strong>"This feels like me"</strong> if this is a natural part of you — something you're good at, 
          drawn to, or that people already recognize in you.<br />
          Use <strong>"Not really me"</strong> otherwise.
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
            Talent {currentIndex + 1} of {TALENTS.length}
          </span>
          <span className="text-xs sm:text-sm text-primary font-semibold">
            Yes selected: {yesTalents.length}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Talent Card */}
      <div className="bg-card border-2 border-primary/20 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8 shadow-lg">
        <h3 className="text-xl sm:text-2xl font-bold text-primary mb-4 text-center">
          {currentTalent.name}
        </h3>
        <p className="text-sm sm:text-base text-foreground leading-relaxed text-center">
          {currentTalent.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleNo}
          className="flex-1 h-14 sm:h-16 text-base sm:text-lg gap-2"
        >
          <ThumbsDown className="w-5 h-5" />
          Not really me
        </Button>
        <Button
          size="lg"
          onClick={handleYes}
          className="flex-1 h-14 sm:h-16 text-base sm:text-lg gap-2"
        >
          <ThumbsUp className="w-5 h-5" />
          This feels like me
        </Button>
      </div>
    </div>
  );
};

export default Step0SwipeTalents;

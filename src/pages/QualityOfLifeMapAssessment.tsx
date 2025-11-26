import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { useQolAssessment } from "@/modules/quality-of-life-map/QolAssessmentContext";

const QualityOfLifeMapAssessment = () => {
  const { answers, setAnswer } = useQolAssessment();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Back Button */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}>
        <div className="container mx-auto max-w-4xl">
          <Link to="/m/quality-of-life-map" className="inline-flex items-center text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <BoldText>BACK</BoldText>
          </Link>
        </div>
      </div>

      {/* Assessment Content */}
      <section 
        className="py-24 px-6"
        style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6 text-white">
            <BoldText>QUALITY OF LIFE MAP – ASSESSMENT WIZARD</BoldText>
          </h1>
          
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            This is where you'll answer a series of questions across all five life domains. 
            The wizard will guide you through each area to create your personalized quality of life snapshot.
          </p>
          
          <div className="mt-12 p-8 rounded-lg" style={{ backgroundColor: 'hsl(var(--destiny-light))' }}>
            <p className="text-lg text-foreground/70 mb-4">
              Assessment wizard coming soon...
            </p>
            
            {/* Temporary test button */}
            <Button 
              onClick={() => setAnswer("wealth", 3)}
              className="mb-6"
            >
              Test: Set Wealth to Stage 3
            </Button>
            
            {/* Debug state display */}
            <div className="text-left">
              <p className="text-sm font-semibold mb-2">Current Answers (Debug):</p>
              <pre className="text-xs bg-background/50 p-4 rounded overflow-auto">
                {JSON.stringify(answers, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QualityOfLifeMapAssessment;

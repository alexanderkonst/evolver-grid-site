import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { useQolAssessment } from "@/modules/quality-of-life-map/QolAssessmentContext";
import { DOMAINS } from "@/modules/quality-of-life-map/qolConfig";

const QualityOfLifeMapResults = () => {
  const navigate = useNavigate();
  const { answers, reset, isComplete } = useQolAssessment();

  // If assessment not complete, show prompt to complete it
  if (!isComplete) {
    return (
      <div className="min-h-screen">
        <Navigation />
        
        <div className="pt-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}>
          <div className="container mx-auto max-w-4xl">
            <Link to="/m/quality-of-life-map" className="inline-flex items-center text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <BoldText>BACK</BoldText>
            </Link>
          </div>
        </div>

        <section 
          className="py-24 px-6 min-h-screen flex items-center justify-center"
          style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}
        >
          <div className="container mx-auto max-w-2xl text-center">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-6 text-white">
              <BoldText>PLEASE COMPLETE THE ASSESSMENT FIRST</BoldText>
            </h1>
            
            <p className="text-lg text-white/70 mb-8">
              You need to complete all 8 domains in the Quality of Life Map assessment before viewing your results.
            </p>
            
            <Button
              onClick={() => navigate("/quality-of-life-map/assessment")}
              className="text-lg px-8"
              style={{
                backgroundColor: 'hsl(var(--destiny-gold))',
                color: 'hsl(var(--destiny-dark))',
              }}
            >
              Start Assessment
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // Build domain results
  const domainResults = DOMAINS.map(domain => {
    const stageValue = answers[domain.id] ?? 0;
    const stage = domain.stages.find(s => s.id === stageValue);
    return { domain, stageValue, stage };
  });

  // Compute overall average
  const overallAverage = domainResults.reduce((sum, r) => sum + r.stageValue, 0) / domainResults.length;
  const overallStageRounded = overallAverage.toFixed(1);

  // Sort for ranking
  const sorted = [...domainResults].sort((a, b) => a.stageValue - b.stageValue);
  const growthDomains = sorted.slice(0, 3);
  const strengthDomains = sorted.slice(-3).reverse();

  const handleRetake = () => {
    reset();
    navigate("/quality-of-life-map/assessment");
  };

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

      {/* Results Content */}
      <section 
        className="py-24 px-6"
        style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}
      >
        <div className="container mx-auto max-w-4xl">
          {/* Main Heading */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6 text-white">
              <BoldText>YOUR QUALITY OF LIFE MAP SNAPSHOT</BoldText>
            </h1>
            
            {/* Overall Level */}
            <div className="inline-block px-8 py-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--destiny-gold))/10', border: '2px solid hsl(var(--destiny-gold))' }}>
              <p className="text-2xl font-bold text-white">
                Overall Development Level: <span style={{ color: 'hsl(var(--destiny-gold))' }}>Stage {overallStageRounded}</span>
              </p>
            </div>
          </div>

          {/* Top Growth Opportunities */}
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold mb-6 text-white text-center">
              <BoldText>TOP GROWTH OPPORTUNITIES</BoldText>
            </h2>
            <div className="grid gap-4">
              {growthDomains.map(({ domain, stageValue, stage }) => (
                <div 
                  key={domain.id}
                  className="p-6 rounded-lg border-2"
                  style={{ 
                    backgroundColor: 'hsl(var(--destiny-light))',
                    borderColor: 'hsl(var(--destiny-gold))/30'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{ backgroundColor: 'hsl(var(--destiny-gold))/20', color: 'hsl(var(--destiny-gold))' }}
                    >
                      {stageValue}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ color: 'hsl(var(--marine-blue))' }}>
                        <BoldText>{domain.name.toUpperCase()}</BoldText>
                      </h3>
                      <p className="text-lg font-semibold mb-1" style={{ color: 'hsl(var(--marine-blue))/80' }}>
                        {stage?.title}
                      </p>
                      <p style={{ color: 'hsl(var(--marine-blue))/70' }}>
                        {stage?.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Strengths */}
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold mb-6 text-white text-center">
              <BoldText>YOUR STRENGTHS</BoldText>
            </h2>
            <div className="grid gap-4">
              {strengthDomains.map(({ domain, stageValue, stage }) => (
                <div 
                  key={domain.id}
                  className="p-6 rounded-lg border-2"
                  style={{ 
                    backgroundColor: 'hsl(var(--destiny-light))',
                    borderColor: 'hsl(var(--destiny-gold))/30'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{ backgroundColor: 'hsl(var(--destiny-gold))', color: 'hsl(var(--destiny-dark))' }}
                    >
                      {stageValue}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ color: 'hsl(var(--marine-blue))' }}>
                        <BoldText>{domain.name.toUpperCase()}</BoldText>
                      </h3>
                      <p className="text-lg font-semibold mb-1" style={{ color: 'hsl(var(--marine-blue))/80' }}>
                        {stage?.title}
                      </p>
                      <p style={{ color: 'hsl(var(--marine-blue))/70' }}>
                        {stage?.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Domains */}
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold mb-6 text-white text-center">
              <BoldText>ALL DOMAINS</BoldText>
            </h2>
            <div className="grid gap-4">
              {domainResults.map(({ domain, stageValue, stage }) => (
                <div 
                  key={domain.id}
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: 'white/5', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{ backgroundColor: 'white/10', color: 'white/80' }}
                    >
                      {stageValue}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        <BoldText>{domain.name.toUpperCase()}</BoldText>
                      </h3>
                      <p className="text-lg font-semibold text-white/80 mb-1">
                        {stage?.title}
                      </p>
                      <p className="text-white/70">
                        {stage?.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Retake Button */}
          <div className="text-center">
            <Button
              onClick={handleRetake}
              variant="outline"
              className="text-lg px-8"
              style={{
                borderColor: 'hsl(var(--destiny-gold))',
                color: 'hsl(var(--destiny-gold))',
              }}
            >
              Retake Assessment
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QualityOfLifeMapResults;

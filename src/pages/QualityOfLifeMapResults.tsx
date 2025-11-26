import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import type { FC } from "react";
import Navigation from "@/components/Navigation";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { useQolAssessment } from "@/modules/quality-of-life-map/QolAssessmentContext";
import { DOMAINS } from "@/modules/quality-of-life-map/qolConfig";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const QualityOfLifeMapResults: FC = () => {
  const navigate = useNavigate();
  const { answers, reset, isComplete } = useQolAssessment();
  const snapshotRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  
  const [guidanceLines, setGuidanceLines] = useState<string[] | null>(null);
  const [isGuidanceLoading, setIsGuidanceLoading] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  // Prepare data for radar chart with abbreviated labels
  const domainAbbreviations: Record<string, string> = {
    "Wealth": "Wealth",
    "Health": "Health",
    "Happiness": "Happiness",
    "Love & Relationships": "Love",
    "Impact": "Impact",
    "Growth": "Growth",
    "Social Ties": "Social",
    "Home": "Home",
  };
  
  const radarData = domainResults.map(({ domain, stageValue }) => ({
    domain: domainAbbreviations[domain.name] || domain.name,
    value: stageValue,
  }));

  const handleRetake = () => {
    reset();
    navigate("/quality-of-life-map/assessment");
  };

  const handleDownloadPdf = async () => {
    if (!snapshotRef.current) return;

    try {
      const element = snapshotRef.current;
      
      // Show PDF-only elements and hide display-only elements
      const pdfOnlyElements = element.querySelectorAll('.pdf-only');
      const pdfExcludeElements = element.querySelectorAll('.pdf-exclude');
      
      pdfOnlyElements.forEach((el: any) => el.style.display = 'block');
      pdfExcludeElements.forEach((el: any) => el.style.display = 'none');
      
      // Improved html2canvas configuration
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#1a2332',
        logging: false,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 0,
        removeContainer: true,
      });
      
      // Restore display
      pdfOnlyElements.forEach((el: any) => el.style.display = 'none');
      pdfExcludeElements.forEach((el: any) => el.style.display = '');
      
      const imgData = canvas.toDataURL("image/png", 1.0);

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit page width
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add pages with proper margins
      let yPosition = 0;
      let remainingHeight = imgHeight;
      let pageNumber = 0;
      
      while (remainingHeight > 0) {
        if (pageNumber > 0) {
          pdf.addPage();
        }
        
        const availableHeight = pdfHeight - 20; // 10mm margin top and bottom
        const sourceY = (pageNumber * availableHeight * canvas.width) / imgWidth;
        const sourceHeight = (availableHeight * canvas.width) / imgWidth;
        
        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(sourceHeight, canvas.height - sourceY);
        
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY, canvas.width, pageCanvas.height,
            0, 0, canvas.width, pageCanvas.height
          );
          
          const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
          const pageImgHeight = (pageCanvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(pageImgData, "PNG", 10, 10, imgWidth, pageImgHeight);
        }
        
        remainingHeight -= availableHeight;
        pageNumber++;
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      pdf.save(`quality-of-life-map-snapshot-${dateStr}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your snapshot has been saved successfully.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Download Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateGuidance = async () => {
    try {
      setIsGuidanceLoading(true);
      
      const domainData = domainResults.map(({ domain, stageValue, stage }) => {
        const nextStage = stageValue < 10 
          ? domain.stages.find(s => s.id === stageValue + 1) 
          : null;
        
        return {
          name: domain.name,
          stageValue,
          currentStageTitle: stage?.title || "",
          currentStageDescription: stage?.description || "",
          nextStageTitle: nextStage?.title || "",
          nextStageDescription: nextStage?.description || "",
        };
      });

      const { data, error } = await supabase.functions.invoke('generate-qol-guidance', {
        body: { domains: domainData }
      });

      if (error) throw error;
      
      if (data?.guidance && Array.isArray(data.guidance)) {
        setGuidanceLines(data.guidance);
        toast({
          title: "Guidance Generated",
          description: "Your personalized next-step guidance is ready.",
        });
      } else {
        throw new Error("Invalid response format");
      }
      
    } catch (error: any) {
      console.error("Guidance generation error:", error);
      const errorMessage = error.message || "Could not generate guidance. Please try again.";
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGuidanceLoading(false);
    }
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
          {/* Snapshot Content - wrapped for PDF export */}
          <div ref={snapshotRef} style={{ padding: '40px 20px', backgroundColor: '#1a2332' }}>
            {/* Main Heading */}
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6 text-white">
                <BoldText>YOUR QUALITY OF LIFE MAP SNAPSHOT</BoldText>
              </h1>
              
              {/* Overall Level */}
              <div className="inline-block px-8 py-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 213, 79, 0.1)', border: '2px solid #FFD54F' }}>
                <p className="text-2xl font-bold text-white">
                  Overall Development Level: <span style={{ color: '#FFD54F' }}>Stage {overallStageRounded}</span>
                </p>
              </div>
            </div>

            {/* Radar Chart - Visual Map (Display only, not in PDF) */}
            <div className="mb-16 p-8 rounded-lg pdf-exclude" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <h2 className="text-2xl font-serif font-bold mb-8 text-white text-center">
                <BoldText>VISUAL MAP</BoldText>
              </h2>
              <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                    <PolarAngleAxis 
                      dataKey="domain" 
                      tick={{ fill: '#ffffff', fontSize: 14 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 10]}
                      tick={{ fill: '#ffffff', fontSize: 12 }}
                    />
                    <Radar 
                      name="Development Level" 
                      dataKey="value" 
                      stroke="#FFD54F" 
                      fill="#FFD54F" 
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-6 text-sm text-white/60">
                Scale: 0-10 (10 = highest development)
              </div>
            </div>

            {/* Bar Chart - For PDF only (hidden from display) */}
            <div className="mb-16 p-8 rounded-lg pdf-only" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'none' }}>
              <h2 className="text-2xl font-serif font-bold mb-8 text-white text-center">
                <BoldText>VISUAL MAP</BoldText>
              </h2>
              <div className="space-y-4" style={{ maxWidth: '700px', margin: '0 auto' }}>
                {radarData.map((item) => (
                  <div key={item.domain} className="flex items-center gap-4">
                    <div 
                      className="text-sm font-semibold text-white text-right" 
                      style={{ width: '120px', flexShrink: 0 }}
                    >
                      {item.domain}
                    </div>
                    <div 
                      className="flex-1 h-8 rounded-full relative"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-3"
                        style={{
                          width: `${(item.value / 10) * 100}%`,
                          backgroundColor: '#FFD54F',
                          minWidth: item.value > 0 ? '40px' : '0',
                        }}
                      >
                        <span className="text-sm font-bold" style={{ color: '#1a2332' }}>
                          {item.value}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6 text-sm text-white/60">
                Scale: 0-10 (10 = highest development)
              </div>
            </div>

            {/* Action Buttons - Right after Visual Map */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 pdf-exclude">
              <Button
                onClick={handleDownloadPdf}
                className="text-lg px-8"
                style={{
                  backgroundColor: '#FFD54F',
                  color: '#1a2332',
                }}
              >
                Download Snapshot as PDF
              </Button>
              <Button
                onClick={handleGenerateGuidance}
                disabled={isGuidanceLoading}
                className="text-lg px-8"
                style={{
                  backgroundColor: '#FFD54F',
                  color: '#1a2332',
                  boxShadow: '0 0 20px rgba(255, 213, 79, 0.6), 0 0 40px rgba(255, 213, 79, 0.4)',
                }}
              >
                {isGuidanceLoading ? "Generating..." : "Generate Next-Step Guidance"}
              </Button>
              <Button
                onClick={handleRetake}
                variant="outline"
                className="text-lg px-8"
                style={{
                  borderColor: '#FFD54F',
                  color: '#FFD54F',
                }}
              >
                Retake Assessment
              </Button>
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
                    backgroundColor: '#f5ece1',
                    borderColor: 'rgba(255, 213, 79, 0.3)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{ backgroundColor: 'rgba(255, 213, 79, 0.2)', color: '#FFD54F' }}
                    >
                      {stageValue}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#0a3a52' }}>
                        <BoldText>{domain.name.toUpperCase()}</BoldText>
                      </h3>
                      <p className="text-lg font-semibold mb-1" style={{ color: 'rgba(10, 58, 82, 0.8)' }}>
                        {stage?.title}
                      </p>
                      <p style={{ color: 'rgba(10, 58, 82, 0.7)' }}>
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
                    backgroundColor: '#f5ece1',
                    borderColor: 'rgba(255, 213, 79, 0.3)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{ backgroundColor: '#FFD54F', color: '#1a2332' }}
                    >
                      {stageValue}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#0a3a52' }}>
                        <BoldText>{domain.name.toUpperCase()}</BoldText>
                      </h3>
                      <p className="text-lg font-semibold mb-1" style={{ color: 'rgba(10, 58, 82, 0.8)' }}>
                        {stage?.title}
                      </p>
                      <p style={{ color: 'rgba(10, 58, 82, 0.7)' }}>
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
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{ backgroundColor: 'rgba(255, 213, 79, 0.2)', color: '#FFD54F' }}
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
          </div>

          {/* Guidance Section */}
          {guidanceLines && (
            <div className="mb-12 p-8 rounded-lg" style={{ backgroundColor: 'white/5' }}>
              <h2 className="text-3xl font-serif font-bold mb-6 text-white text-center">
                <BoldText>NEXT-STEP GUIDANCE</BoldText>
              </h2>
              <div className="space-y-4">
                {guidanceLines.map((line, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: '#f5ece1' }}
                  >
                    <p style={{ color: '#0a3a52' }}>{line}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default QualityOfLifeMapResults;

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import BoldText from "@/components/BoldText";

const QualityOfLifeMapResults = () => {
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
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6 text-white">
            <BoldText>QUALITY OF LIFE MAP – RESULTS SNAPSHOT</BoldText>
          </h1>
          
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Your personalized quality of life results across all five domains will appear here. 
            This snapshot will show your current state and highlight areas for improvement.
          </p>
          
          <div className="mt-12 p-8 rounded-lg" style={{ backgroundColor: 'hsl(var(--destiny-light))' }}>
            <p className="text-lg text-foreground/70">
              Results visualization coming soon...
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QualityOfLifeMapResults;

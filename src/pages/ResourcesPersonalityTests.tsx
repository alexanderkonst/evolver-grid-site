import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BoldText from "@/components/BoldText";

const ResourcesPersonalityTests = () => {
  const tests = [
    {
      name: "MBTI (16 Personalities)",
      description: "Discover your personality type based on preferences in how you perceive the world and make decisions.",
      url: "https://www.16personalities.com/",
    },
    {
      name: "Enneagram",
      description: "Explore your core motivations, fears, and patterns through the nine personality types.",
      url: "https://www.eclecticenergies.com/enneagram/test",
    },
    {
      name: "Multiple Intelligences",
      description: "Identify your dominant intelligences across linguistic, logical, spatial, musical, bodily, interpersonal, intrapersonal, and naturalistic dimensions.",
      url: "https://www.literacynet.org/mi/assessment/findyourstrengths.html",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link to="/game" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <BoldText>BACK TO GAME</BoldText>
            </Link>
          </div>

          <Card className="p-8 mb-6">
            <h1 className="text-3xl font-bold mb-4">
              Explore Your Inner Landscape
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              Optionally take 2–3 personality and self-knowledge tests to enrich your understanding of how your Genius 
              expresses through your patterns, strengths, and preferences.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-8">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> These tests are entirely optional and are meant to complement your Zone of Genius 
                discovery, not replace it. Take what resonates and leave the rest.
              </p>
            </div>

            <div className="space-y-4">
              {tests.map((test) => (
                <Card key={test.name} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{test.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {test.description}
                      </p>
                    </div>
                    <a
                      href={test.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        Take Test
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResourcesPersonalityTests;
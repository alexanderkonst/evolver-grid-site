import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Upload, Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BoldText from "@/components/BoldText";
import PersonalityTestUploadModal from "@/components/PersonalityTestUploadModal";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";

type TestType = "enneagram" | "16personalities" | "human_design";

interface TestConfig {
  name: string;
  description: string;
  url: string;
  testType: TestType;
  uploaded?: boolean;
}

const ResourcesPersonalityTests = () => {
  const [uploadModal, setUploadModal] = useState<{
    open: boolean;
    testType: TestType;
    testName: string;
  } | null>(null);
  const [uploadedTests, setUploadedTests] = useState<Set<TestType>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load existing saved tests on mount
  useEffect(() => {
    loadExistingTests();
  }, []);

  const loadExistingTests = async () => {
    try {
      const profileId = await getOrCreateGameProfileId();
      const { data: profile } = await supabase
        .from('game_profiles')
        .select('personality_tests')
        .eq('id', profileId)
        .single();

      if (profile?.personality_tests) {
        const existingTests = profile.personality_tests as Record<string, any>;
        const savedTypes = new Set<TestType>();
        
        if (existingTests.enneagram) savedTypes.add('enneagram');
        if (existingTests['16personalities']) savedTypes.add('16personalities');
        if (existingTests.human_design) savedTypes.add('human_design');
        
        setUploadedTests(savedTypes);
      }
    } catch (error) {
      console.error('Error loading existing tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const tests: TestConfig[] = [
    {
      name: "MBTI (16 Personalities)",
      description: "Discover your personality type based on preferences in how you perceive the world and make decisions.",
      url: "https://www.16personalities.com/",
      testType: "16personalities",
    },
    {
      name: "Enneagram",
      description: "Explore your core motivations, fears, and patterns through the nine personality types.",
      url: "https://www.enneagraminstitute.com/",
      testType: "enneagram",
    },
    {
      name: "Human Design",
      description: "Discover your unique energetic blueprint combining astrology, I-Ching, Kabbalah and chakra system.",
      url: "https://www.mybodygraph.com/",
      testType: "human_design",
    },
  ];

  const handleUploadSuccess = (testType: TestType) => {
    setUploadedTests((prev) => new Set([...prev, testType]));
  };

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
              Take personality tests to enrich your understanding of how your Genius
              expresses through your patterns, strengths, and preferences. Upload your results to save them to your profile.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-8">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> After taking a test, screenshot your results and upload them.
                AI will analyze and save the data to your profile for personalization. +20 XP for completing this upgrade!
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {tests.map((test) => {
                  const isUploaded = uploadedTests.has(test.testType);

                  return (
                    <Card key={test.name} className="p-6">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{test.name}</h3>
                            {isUploaded && (
                              <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" />
                                Saved
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {test.description}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
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
                          <Button
                            variant={isUploaded ? "outline" : "default"}
                            size="sm"
                            onClick={() => setUploadModal({
                              open: true,
                              testType: test.testType,
                              testName: test.name,
                            })}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {isUploaded ? 'Update Results' : 'Upload Results'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />

      {/* Upload Modal */}
      {uploadModal && (
        <PersonalityTestUploadModal
          open={uploadModal.open}
          onClose={() => setUploadModal(null)}
          testType={uploadModal.testType}
          testName={uploadModal.testName}
          onSuccess={() => handleUploadSuccess(uploadModal.testType)}
        />
      )}
    </div>
  );
};

export default ResourcesPersonalityTests;
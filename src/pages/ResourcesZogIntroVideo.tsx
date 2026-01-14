import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BoldText from "@/components/BoldText";
import BackButton from "@/components/BackButton";

const ResourcesZogIntroVideo = () => {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <BackButton
              to="/game"
              label={<BoldText>BACK TO GAME</BoldText>}
              className="text-muted-foreground hover:text-foreground transition-colors font-semibold"
            />
          </div>

          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-4">
              Genius · Purpose · Mission Intro
            </h1>
            
            <div className="prose prose-slate max-w-none mb-6">
              <p className="text-lg text-muted-foreground">
                This video will clearly explain the difference between Zone of Genius, Purpose, and Mission,
                so you understand the deeper context of your path instead of treating this as just another test.
              </p>
            </div>

            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
              <p className="text-muted-foreground">
                Video will be embedded here
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6">
              <h2 className="font-semibold mb-2">What you'll learn:</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• The distinction between Genius (how you operate), Purpose (what you're here to do), and Mission (the specific form it takes)</li>
                <li>• Why understanding this framework matters for your journey</li>
                <li>• How these three layers work together to create meaningful work</li>
              </ul>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResourcesZogIntroVideo;

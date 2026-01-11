import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import GameShell from "@/components/game/GameShell";
import { Button } from "@/components/ui/button";
import AppleseedDisplay from "@/modules/zone-of-genius/AppleseedDisplay";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { loadSavedData } from "@/modules/zone-of-genius/saveToDatabase";

const AppleseedView = () => {
  const navigate = useNavigate();
  const [appleseed, setAppleseed] = useState<AppleseedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { appleseed: savedAppleseed } = await loadSavedData();
      setAppleseed(savedAppleseed);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <GameShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </GameShell>
    );
  }

  if (!appleseed) {
    return (
      <GameShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <Sparkles className="w-10 h-10 text-amber-400 mb-3" />
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">No genius profile yet</h1>
          <p className="text-slate-600 mb-6">
            Generate your Zone of Genius to view your profile here.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={() => navigate("/zone-of-genius/entry")}>
              Start Zone of Genius
            </Button>
            <Button variant="outline" onClick={() => navigate("/game/profile")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <div className="px-4 pt-6">
        <Button variant="ghost" onClick={() => navigate("/game/profile")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>
      </div>
      <AppleseedDisplay appleseed={appleseed} />
    </GameShell>
  );
};

export default AppleseedView;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import AppleseedDisplay from "@/modules/zone-of-genius/AppleseedDisplay";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";
import { loadSavedData } from "@/modules/zone-of-genius/saveToDatabase";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";

const AppleseedView = () => {
  const navigate = useNavigate();
  const [appleseed, setAppleseed] = useState<AppleseedData | null>(null);
  const [excalibur, setExcalibur] = useState<ExcaliburData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { appleseed: savedAppleseed, excalibur: savedExcalibur } = await loadSavedData();
      setAppleseed(savedAppleseed);
      setExcalibur(savedExcalibur);
      const profileId = await getOrCreateGameProfileId().catch(() => null);
      if (profileId) {
        setProfileUrl(`${window.location.origin}/profile/${profileId}`);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <GameShellV2>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </GameShellV2>
    );
  }

  if (!appleseed) {
    return (
      <GameShellV2>
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
      </GameShellV2>
    );
  }

  return (
    <GameShellV2>
      <div className="px-4 pt-6">
        <Button variant="ghost" onClick={() => navigate("/game/profile")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>
      </div>
      <AppleseedDisplay appleseed={appleseed} profileUrl={profileUrl ?? undefined} />
      {!excalibur && (
        <div className="px-4 pb-10">
          <div className="max-w-3xl mx-auto rounded-2xl border border-violet-200 bg-violet-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Your Unique Offer</h2>
            <p className="text-slate-600 mb-4">
              You know who you are. Now discover what you can offer.
            </p>
            <Button onClick={() => navigate("/zone-of-genius/entry")}>
              Create My Unique Offer →
            </Button>
          </div>
        </div>
      )}
    </GameShellV2>
  );
};

export default AppleseedView;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sword } from "lucide-react";
import GameShell from "@/components/game/GameShell";
import { Button } from "@/components/ui/button";
import ExcaliburDisplay from "@/modules/zone-of-genius/ExcaliburDisplay";
import { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";
import { loadSavedData } from "@/modules/zone-of-genius/saveToDatabase";

const ExcaliburView = () => {
  const navigate = useNavigate();
  const [excalibur, setExcalibur] = useState<ExcaliburData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { excalibur: savedExcalibur } = await loadSavedData();
      setExcalibur(savedExcalibur);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <GameShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      </GameShell>
    );
  }

  if (!excalibur) {
    return (
      <GameShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <Sword className="w-10 h-10 text-violet-400 mb-3" />
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">No Excalibur yet</h1>
          <p className="text-slate-600 mb-6">
            Craft your unique offering to view your Excalibur here.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={() => navigate("/zone-of-genius/entry")}>
              Create Excalibur
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
      <ExcaliburDisplay excalibur={excalibur} />
    </GameShell>
  );
};

export default ExcaliburView;

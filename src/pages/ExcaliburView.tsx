import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sword } from "lucide-react";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import ExcaliburDisplay from "@/modules/zone-of-genius/ExcaliburDisplay";
import { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";
import { loadSavedData } from "@/modules/zone-of-genius/saveToDatabase";
import BackButton from "@/components/BackButton";

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
      <GameShellV2>
        <div className="min-h-[60vh] flex items-center justify-center">
          <PremiumLoader size="lg" />
        </div>
      </GameShellV2>
    );
  }

  if (!excalibur) {
    return (
      <GameShellV2>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <Sword className="w-10 h-10 text-violet-400 mb-3" />
          <h1 className="text-2xl font-semibold text-[#2c3150] mb-2">No unique offer yet</h1>
          <p className="text-[rgba(44,49,80,0.7)] mb-6">
            Craft your unique offer to view it here.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={() => navigate("/zone-of-genius/entry")}>
              Create Offer
            </Button>
            <BackButton to="/game/me" />
          </div>
        </div>
      </GameShellV2>
    );
  }

  return (
    <GameShellV2>
      <div className="px-4 pt-6">
        <BackButton to="/game/me" />
      </div>
      <ExcaliburDisplay
        excalibur={excalibur}
        onLaunchProductBuilder={() => navigate("/product-builder")}
        showProductBuilderButton={true}
      />
    </GameShellV2>
  );
};

export default ExcaliburView;

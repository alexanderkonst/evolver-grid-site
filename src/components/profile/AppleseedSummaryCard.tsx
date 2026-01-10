import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";

interface AppleseedSummaryCardProps {
  appleseed: AppleseedData;
}

const AppleseedSummaryCard = ({ appleseed }: AppleseedSummaryCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-amber-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-600 font-medium mb-1">Your Zone of Genius</p>
            <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
              ✦ {appleseed.vibrationalKey.name} ✦
            </h3>
            <p className="text-sm text-slate-600 italic line-clamp-2">
              "{appleseed.vibrationalKey.tagline}"
            </p>
          </div>
        </div>

        {/* View Full Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/zone-of-genius/entry")}
          className="mt-4 w-full text-amber-700 hover:text-amber-800 hover:bg-amber-100"
        >
          View Full Appleseed
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AppleseedSummaryCard;

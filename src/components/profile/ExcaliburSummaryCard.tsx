import { Sword, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";

interface ExcaliburSummaryCardProps {
  excalibur: ExcaliburData;
}

const ExcaliburSummaryCard = ({ excalibur }: ExcaliburSummaryCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
            <Sword className="w-6 h-6 text-violet-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-violet-600 font-medium mb-1">Your Unique Offer</p>
            <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-2">
              {excalibur.sword.offer}
            </h3>
            <p className="text-sm text-slate-600">
              {excalibur.exchange.pricing}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/zone-of-genius/excalibur")}
            className="flex-1 text-violet-700 hover:text-violet-800 hover:bg-violet-100"
          >
            View Offer
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/zone-of-genius/entry")}
            className="flex-1 border-violet-200 text-violet-700 hover:bg-violet-100"
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExcaliburSummaryCard;
